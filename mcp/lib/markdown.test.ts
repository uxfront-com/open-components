// @vitest-environment node
import { describe, expect, it } from "vitest";
import { anchors, cells, collapse, heading, scan, tokens } from "./markdown";

// The lines scan() marks as code, by their text.
const code = (markdown: string) =>
  scan(markdown)
    .filter((line) => line.code)
    .map((line) => line.text);

describe("scan", () => {
  it("marks a fenced block, fences included, and nothing around it", () => {
    expect(scan("Text\n```ts [Button.vue]\n# not a heading\n```\nMore")).toEqual([
      { text: "Text", code: false },
      { text: "```ts [Button.vue]", code: true },
      { text: "# not a heading", code: true },
      { text: "```", code: true },
      { text: "More", code: false },
    ]);
  });

  it.each([
    // Inside an :::accordion-item, the whole block is indented.
    ["an indented fence", "  ```css\n  @theme inline {\n  ```\n:::", ["  ```css", "  @theme inline {", "  ```"]],
    // A ``` line doesn't close a ~~~ block.
    ["a ~~~ fence", "~~~md\n```\n::foo\n~~~\n::", ["~~~md", "```", "::foo", "~~~"]],
    // A longer fence holds a markdown example with its own fences.
    ["a 4-backtick fence", "````md\n```js\n#react\n```\n````\n#react", ["````md", "```js", "#react", "```", "````"]],
    // An info string makes it an opening fence, so the block goes on.
    ["a closing fence with something after it", "```\n``` js\n#react\n```\n#react", ["```", "``` js", "#react", "```"]],
    ["a closing fence with trailing spaces", "```\n#react\n```   \n#react", ["```", "#react", "```   "]],
    // CommonMark keeps an unclosed block open to the end of the document.
    ["an unclosed fence", "Text\n```\n#react", ["```", "#react"]],
  ])("handles %s", (_, markdown, expected) => {
    expect(code(markdown)).toEqual(expected);
  });

  it("leaves two backticks to inline code", () => {
    expect(code("``inline``\n#react")).toEqual([]);
  });
});

describe("heading", () => {
  it.each([
    ["# Title", { level: 1, text: "Title" }],
    ["###### Six", { level: 6, text: "Six" }],
    ["#### Don't nest interactive elements", { level: 4, text: "Don't nest interactive elements" }],
    // MDC slugs a heading's text, without the code's backticks.
    ["### `aria-pressed` and `aria-expanded`", { level: 3, text: "aria-pressed and aria-expanded" }],
    // A closing sequence isn't part of the text, but a # in a word is.
    ["## Closing ##", { level: 2, text: "Closing" }],
    ["## C#", { level: 2, text: "C#" }],
    ["## Trailing spaces   ", { level: 2, text: "Trailing spaces" }],
  ])("reads %j", (line, expected) => {
    expect(heading(line)).toEqual(expected);
  });

  it.each([
    // A framework switcher's slot.
    "#react",
    "####### Seven",
    "Text # with a hash",
    "#",
    "## ",
  ])("doesn't take %j for a heading", (line) => {
    expect(heading(line)).toBeUndefined();
  });
});

describe("anchors", () => {
  // The ids the site gives these headings, which MDC builds with github-slugger,
  // so links to #<anchor> from the MCP server land where they should.
  it.each([
    ["User Interface (UI)", "user-interface-ui"],
    ["Don't nest interactive elements", "dont-nest-interactive-elements"],
    ["Pointer, touch and pen", "pointer-touch-and-pen"],
    ["Button or link?", "button-or-link"],
    ["Type-safe", "type-safe"],
    ["aria-pressed and aria-expanded", "aria-pressed-and-aria-expanded"],
    ["UX rules", "ux-rules"],
    // MDC collapses dashes and trims them from the ends.
    ["Before -- after", "before-after"],
    ["- Dashed -", "dashed"],
    // An id can't start with a digit.
    ["200% zoom", "_200-zoom"],
  ])("gives %j the id %j", (text, anchor) => {
    expect(anchors()(text)).toBe(anchor);
  });

  it("numbers the headings a page repeats", () => {
    const slug = anchors();
    expect(["Prompts", "Described", "Prompts", "Prompts"].map(slug)).toEqual(["prompts", "described", "prompts-1", "prompts-2"]);
  });

  it("starts over for each page", () => {
    anchors()("Prompts");
    expect(anchors()("Prompts")).toBe("prompts");
  });
});

describe("cells", () => {
  it.each([
    ["| `button/name` | Must | Has a name |", ["`button/name`", "Must", "Has a name"]],
    // Escaped pipes, as in a TypeScript union, stay in their cell.
    ["| `size` | `\"sm\" \\| \"md\"` | Review |", ["`size`", '`"sm" | "md"`', "Review"]],
    ["  | padded |   cells |  ", ["padded", "cells"]],
    ["| empty |  | cell |", ["empty", "", "cell"]],
  ])("splits %j", (row, expected) => {
    expect(cells(row)).toEqual(expected);
  });
});

describe("collapse", () => {
  it("keeps one blank line where there are several, and trims the ends", () => {
    expect(collapse("\n\nOne\n\n\n\nTwo\n\n")).toBe("One\n\nTwo");
  });

  it("keeps the blank lines in code as they are", () => {
    const markdown = "Text\n\n```ts\nconst a = 1;\n\n\nconst b = 2;\n```\n\n\nMore";
    expect(collapse(markdown)).toBe("Text\n\n```ts\nconst a = 1;\n\n\nconst b = 2;\n```\n\nMore");
  });
});

describe("tokens", () => {
  it("counts about 3.6 characters a token, rounded up", () => {
    expect([tokens(""), tokens("a"), tokens("x".repeat(36)), tokens("x".repeat(37))]).toEqual([0, 1, 10, 11]);
  });
});
