// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  INKLINE_PREVIEW_ORIGIN,
  embedTheme,
  inklineEmbedUrl,
  inklineExampleId,
  inklineTarget,
  readResizeMessage,
  themeMessage,
  themeOnReady,
} from "./inkline-embed";

describe("inklineExampleId", () => {
  it("finds an example in its component's examples folder", () => {
    expect(inklineExampleId("button/ButtonVariants")).toBe("src/components/button/examples/ButtonVariants");
  });

  it("refuses an example without its component, or with more than one folder", () => {
    expect(() => inklineExampleId("ButtonVariants")).toThrow(/<component>\/<Name>/);
    expect(() => inklineExampleId("button/examples/ButtonVariants")).toThrow(/<component>\/<Name>/);
  });
});

describe("inklineTarget", () => {
  it("shows the reader's framework when Inkline renders in it", () => {
    for (const framework of ["react", "vue", "svelte", "angular", "solid", "astro"]) {
      expect(inklineTarget(framework)).toBe(framework);
    }
  });

  it("falls back to React for Vanilla, an unknown framework or none", () => {
    expect(inklineTarget("vanilla")).toBe("react");
    expect(inklineTarget("qwik")).toBe("react");
    expect(inklineTarget(undefined)).toBe("react");
  });

  it("shows an example with controls in React rather than Astro, which can't re-render", () => {
    expect(inklineTarget("astro", { controls: true })).toBe("react");
    expect(inklineTarget("vue", { controls: true })).toBe("vue");
  });
});

describe("embedTheme", () => {
  it("keeps dark and turns anything else into light", () => {
    expect(embedTheme("dark")).toBe("dark");
    expect(embedTheme("light")).toBe("light");
    expect(embedTheme("sepia")).toBe("light");
    expect(embedTheme(undefined)).toBe("light");
  });
});

describe("inklineEmbedUrl", () => {
  it("asks for the example in one target, in one mode, with its height", () => {
    const url = new URL(inklineEmbedUrl({ example: "button/ButtonVariants", target: "vue", theme: "dark" }));
    expect(url.origin).toBe(INKLINE_PREVIEW_ORIGIN);
    expect(url.pathname).toBe("/embed.html");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      example: "src/components/button/examples/ButtonVariants",
      target: "vue",
      theme: "dark",
      resize: "true",
    });
  });

  it("adds the controls only when asked", () => {
    const url = new URL(
      inklineEmbedUrl({ example: "button/ButtonPlayground", target: "react", theme: "light", controls: true }),
    );
    expect(url.searchParams.get("controls")).toBe("true");
    expect(url.searchParams.get("theme")).toBe("light");
    expect(url.searchParams.get("resize")).toBe("true");
  });
});

describe("themeMessage", () => {
  it("is the message that changes the embed's mode, with exactly the keys it accepts", () => {
    expect(themeMessage("dark")).toEqual({ type: "unframework:embed", kind: "theme", theme: "dark" });
  });
});

describe("readResizeMessage", () => {
  const frame = { name: "this embed's window" };
  const resize = (height: unknown) => ({ type: "unframework:embed", kind: "resize", height });
  const event = (overrides: Partial<{ origin: string; source: unknown; data: unknown }> = {}) => ({
    origin: INKLINE_PREVIEW_ORIGIN,
    source: frame,
    data: resize(240),
    ...overrides,
  });

  it("reads the height the embed reports", () => {
    expect(readResizeMessage(event(), frame)).toBe(240);
  });

  it("ignores a message from another origin", () => {
    expect(readResizeMessage(event({ origin: "https://example.com" }), frame)).toBeUndefined();
  });

  it("ignores a message from another window, like a second embed on the page", () => {
    expect(readResizeMessage(event({ source: { name: "another embed" } }), frame)).toBeUndefined();
    expect(readResizeMessage(event({ source: null }), null)).toBeUndefined();
  });

  it("ignores a height that isn't a finite positive number", () => {
    for (const height of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, "240", undefined]) {
      expect(readResizeMessage(event({ data: resize(height) }), frame)).toBeUndefined();
    }
  });

  it("ignores any other message", () => {
    expect(readResizeMessage(event({ data: { type: "unframework:embed", kind: "theme", theme: "dark" } }), frame)).toBeUndefined();
    expect(readResizeMessage(event({ data: { type: "other", kind: "resize", height: 240 } }), frame)).toBeUndefined();
    expect(readResizeMessage(event({ data: "resize" }), frame)).toBeUndefined();
    expect(readResizeMessage(event({ data: null }), frame)).toBeUndefined();
  });
});

describe("themeOnReady", () => {
  it("sends the current mode to an embed that loaded after the mode changed", () => {
    expect(themeOnReady("light", "dark")).toBe("dark");
    expect(themeOnReady("dark", "light")).toBe("light");
  });

  it("sends nothing to an embed whose URL already has the current mode", () => {
    expect(themeOnReady("light", "light")).toBeUndefined();
    expect(themeOnReady("dark", "dark")).toBeUndefined();
  });
});
