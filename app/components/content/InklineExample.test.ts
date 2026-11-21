import { render, screen } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h, nextTick, reactive, ref } from "vue";
import { INKLINE_PREVIEW_ORIGIN } from "~/lib/inkline-embed";
import InklineExample from "./InklineExample.vue";

// Nuxt auto-imports these. The reader picked Vue, in light mode.
const colorMode = reactive({ value: "light" });
beforeEach(() => {
  colorMode.value = "light";
  vi.stubGlobal("useFramework", () => ({ current: ref({ value: "vue", label: "Vue" }) }));
  vi.stubGlobal("useColorMode", () => colorMode);
});
afterEach(() => vi.unstubAllGlobals());

// The page's markdown inside the example, as remark-mdc passes it: the nested
// `::framework-switcher` is the default slot.
const code = () => h("pre", { "data-testid": "code" }, "<Button>Solid</Button>");

describe("InklineExample", () => {
  it("shows the example in a lazy frame named for what it shows and the framework it shows it in", async () => {
    render(InklineExample, { props: { example: "button/ButtonVariants", title: "Button variants" } });

    const frame = await screen.findByTitle("Button variants, in Vue");
    expect(frame).toHaveAttribute("loading", "lazy");
    const src = new URL(frame.getAttribute("src")!);
    expect(src.searchParams.get("target")).toBe("vue");
    expect(src.searchParams.get("theme")).toBe("light");
  });

  it("shows the page's code under the frame", async () => {
    render(InklineExample, {
      props: { example: "button/ButtonVariants", title: "Button variants" },
      slots: { default: code },
    });

    const frame = await screen.findByTitle("Button variants, in Vue");
    const shown = screen.getByTestId("code");
    expect(frame.compareDocumentPosition(shown) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("sends the mode to a frame that became ready after the mode changed", async () => {
    render(InklineExample, { props: { example: "button/ButtonVariants", title: "Button variants" } });
    const frame = (await screen.findByTitle("Button variants, in Vue")) as HTMLIFrameElement;
    const post = vi.spyOn(frame.contentWindow!, "postMessage").mockImplementation(() => {});

    colorMode.value = "dark";
    await nextTick();
    expect(post).not.toHaveBeenCalled();

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: INKLINE_PREVIEW_ORIGIN,
        source: frame.contentWindow,
        data: { type: "unframework:embed", kind: "resize", height: 240 },
      }),
    );
    await nextTick();
    expect(post).toHaveBeenCalledWith({ type: "unframework:embed", kind: "theme", theme: "dark" }, INKLINE_PREVIEW_ORIGIN);
  });
});
