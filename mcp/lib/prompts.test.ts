// @vitest-environment node
import { describe, expect, it } from "vitest";
import { FRAMEWORKS } from "../../app/data/frameworks";
import { SWITCHER_END } from "./frameworks";
import { scan } from "./markdown";
import { adoptTokenPathsText, buildText, call, codeToReview, findComponent, frameworkValue, plural, reviewText, reviewUsageText } from "./prompts";
import { buildStandard } from "./standard";
import type { Heading, Page } from "./types";

const { standard } = buildStandard({ root: process.cwd(), site: "https://opencomponents.dev", frameworks: FRAMEWORKS });
const component = (key: string) => standard.components.find((candidate) => candidate.key === key)!;

// The pages wrap their prompts at about 90 characters, and the server doesn't.
const normalise = (text: string) => text.replace(/\s+/g, " ").trim();

// The code blocks in a section, each with the framework slot it's in, if any.
function blocks(page: Page, heading: Heading): { framework?: string; text: string }[] {
  const found: { framework?: string; text: string }[] = [];
  let framework: string | undefined;
  let block: string[] | undefined;
  // The blank line at the end closes a block that ends the section.
  for (const { text, code } of scan([...page.markdown.split("\n").slice(heading.start, heading.end), ""].join("\n"))) {
    if (code) {
      if (block) block.push(text);
      else block = [];
      continue;
    }
    if (block) {
      // Without its closing fence.
      found.push({ ...(framework && { framework }), text: normalise(block.slice(0, -1).join("\n")) });
      block = undefined;
    }
    framework = text.match(/^<!-- framework: (\S+) -->$/)?.[1] ?? (text === SWITCHER_END ? undefined : framework);
  }
  return found;
}

// The pages' "Prompts" sections that quote prompts, like the Button's
// "#### Prompts" and the Design Tokens' "### Prompts". The server's prompts ask
// for exactly what these do, so a change to one has to go in the other too.
const sections = standard.pages.flatMap((page) =>
  page.headings
    .filter((heading) => heading.text === "Prompts")
    .map((heading) => ({ page, blocks: blocks(page, heading) }))
    .filter(({ blocks }) => blocks.length),
);

describe("The prompts", () => {
  // A page with prompts of another kind needs a prompt of its own, and a check here.
  it("are on the pages they're checked against", () => {
    const keys = sections.map(({ page }) => page.key);
    expect(keys).toEqual(expect.arrayContaining(["design-tokens", "button"]));
    for (const { page } of sections) expect(page.key === "design-tokens" || page.contract?.kind === "component", page.path).toBe(true);
  });

  describe.each(sections.filter(({ page }) => page.contract?.kind === "component").map(({ page, blocks }) => [page.key, blocks] as const))(
    "on the %s page",
    (key, found) => {
      const builds = found.filter((block) => block.framework);
      const [review, usage, ...rest] = found.filter((block) => !block.framework);

      it("build the component in each framework the page has one for", () => {
        expect(builds.length).toBeGreaterThan(0);
        for (const { framework, text } of builds) expect(normalise(buildText(standard, component(key), framework))).toBe(text);
      });

      it("review the component", () => {
        expect(normalise(reviewText(standard, component(key)))).toBe(review?.text);
      });

      // The screen is the prompt's argument, which the page fills in.
      it("review how a screen uses it", () => {
        const screen = usage?.text.match(/^Review how (.+?) uses its /)?.[1];
        expect(screen).toBeDefined();
        expect(normalise(reviewUsageText(standard, component(key), screen!))).toBe(usage?.text);
        expect(rest).toEqual([]);
      });
    },
  );

  it("ask what the Button's page asks, in every framework", () => {
    const button = component("button");
    expect(sections.find(({ page }) => page.key === "button")?.blocks).toEqual([
      ...FRAMEWORKS.map(({ value }) => ({ framework: value, text: normalise(buildText(standard, button, value)) })),
      { text: normalise(reviewText(standard, button)) },
      { text: normalise(reviewUsageText(standard, button, "our checkout page")) },
    ]);
  });

  it("ask what the Design Tokens' page asks", () => {
    expect(sections.find(({ page }) => page.key === "design-tokens")?.blocks).toEqual([
      { text: normalise(adoptTokenPathsText(standard)) },
      { text: normalise(reviewText(standard, component("design-tokens"))) },
    ]);
  });
});

describe("buildText", () => {
  it("names the framework's version where the examples are written for one", () => {
    expect(buildText(standard, component("button"), "vue")).toContain("our Vue 3 design system");
    expect(buildText(standard, component("button"), "svelte")).toContain("our Svelte 5 design system");
    expect(buildText(standard, component("button"), "react")).toContain("our React design system");
    expect(buildText(standard, component("button"))).toContain("Build a Button component for our design system");
  });

  // A planned component has no page to point at yet, so the prompt points at
  // the whole standard, and at the Button's page for its structure.
  it("follows the Button's structure for a planned component", () => {
    const text = buildText(standard, component("radio-group"));
    expect(text).toContain("Build a Radio Group component for our design system that meets the Open Components standard: https://opencomponents.dev/llms-full.txt");
    expect(text).toContain("Work through the UI, UX, DX and AX of radio groups, following the WAI-ARIA pattern for radio groups if there is one");
    expect(text).toContain("like radio-group/<rule>");
  });

  // As it does for a shipped one, so the agent knows what it's building in.
  it("writes an before a vowel", () => {
    expect(buildText(standard, component("avatar"), "react")).toContain("Build an Avatar component for our React design system");
    expect(buildText(standard, component("alert"), "vanilla")).toContain("Build an Alert for our design system in plain HTML");
  });

  it("names the framework for a planned component", () => {
    expect(buildText(standard, component("tabs"), "svelte")).toContain("Build a Tabs component for our Svelte 5 design system that meets");
    expect(buildText(standard, component("tabs"), "vanilla")).toContain("Build a Tabs for our design system in plain HTML, CSS and JavaScript that meets");
  });
});

describe("findComponent", () => {
  it.each([
    ["radio-group", "radio-group"],
    ["Radio Group", "radio-group"],
    ["radio group", "radio-group"],
    ["Design Tokens", "design-tokens"],
    [" BUTTON ", "button"],
    ["nope", undefined],
  ])("finds %j as %j", (name, key) => {
    expect(findComponent(standard, name)?.key).toBe(key);
  });
});

describe("frameworkValue", () => {
  it.each([
    ["vue", "vue"],
    ["Vue", "vue"],
    // As the prompts name them.
    ["Vue 3", "vue"],
    ["Svelte 5", "svelte"],
    [" React ", "react"],
    ["cobol", undefined],
  ])("reads %j as %j", (input, expected) => {
    expect(frameworkValue(standard, input)).toBe(expected);
  });
});

describe("codeToReview", () => {
  it("keeps a path in the sentence", () => {
    expect(codeToReview("src/components/Button.tsx")).toBe("The code to review: src/components/Button.tsx");
  });

  // Clients like VS Code pass a whole file, or the selection, as an argument.
  it("puts code in a block, fenced longer than any it holds", () => {
    expect(codeToReview("<button>\n  Save\n</button>")).toBe("The code to review:\n\n```\n<button>\n  Save\n</button>\n```");
    expect(codeToReview("Some docs:\n```ts\nx\n```")).toBe("The code to review:\n\n````\nSome docs:\n```ts\nx\n```\n````");
  });
});

describe("plural", () => {
  it.each([
    ["Button", "buttons"],
    ["Tabs", "tabs"],
    ["Radio Group", "radio groups"],
    ["Progress", "progress"],
    ["Design Tokens", "design tokens"],
    ["Box", "boxes"],
    ["Checkbox", "checkboxes"],
    ["Switch", "switches"],
    ["Category", "categories"],
    ["Day", "days"],
  ])("%s → %s", (title, expected) => {
    expect(plural(title)).toBe(expected);
  });
});

describe("call", () => {
  it("writes a tool call as the prompts suggest one", () => {
    expect(call("get-page", { path: "button", sections: ["Loading"] })).toBe('get-page {"path":"button","sections":["Loading"]}');
  });
});
