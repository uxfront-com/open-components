// @vitest-environment node
import { describe, expect, it } from "vitest";
import { agentMarkdown } from "./agent-markdown";
import { SWITCHER, SWITCHER_END, slot } from "./frameworks";

const page = { site: "https://opencomponents.dev", path: "/docs/components/button", frameworks: ["react", "vue", "vanilla"] };
const agent = (...lines: string[]) => agentMarkdown(lines.join("\n"), page);

describe("agentMarkdown", () => {
  it("marks a framework switcher and its slots", () => {
    expect(agent("::framework-switcher", "#react", "```tsx", "<Button />", "```", "", "#vue", "```vue", "<Button />", "```", "::")).toBe(
      [SWITCHER, slot("react"), "```tsx", "<Button />", "```", "", slot("vue"), "```vue", "<Button />", "```", SWITCHER_END].join("\n"),
    );
  });

  // The Button's examples wrap a switcher in a component, and close both with
  // `::`: the first one closes the switcher, the innermost.
  it("closes a switcher nested in an example with the same colons", () => {
    expect(agent("::button-variants-example", "::framework-switcher", "#react", "```tsx", "<Button />", "```", "::", "::", "After")).toBe(
      [SWITCHER, slot("react"), "```tsx", "<Button />", "```", SWITCHER_END, "After"].join("\n"),
    );
  });

  it("keeps the content of other components, and drops their lines", () => {
    expect(agent("Before", "", "::button-anatomy", "1. The **container**", "::", "", "::button-playground", "::", "", "After")).toBe(
      "Before\n\n1. The **container**\n\nAfter",
    );
  });

  it.each([
    ["double", `:::accordion-item{label="Isn't the double dash a BEM modifier?"}`, "Isn't the double dash a BEM modifier?"],
    ["single", `:::accordion-item{label='Is it "safe"?'}`, 'Is it "safe"?'],
  ])("keeps an accordion item's %s-quoted label, in bold", (_, start, label) => {
    expect(agent("::accordion", `  ${start}`, "  Not here.", "  :::", "::")).toBe(`**${label}**\n\nNot here.`);
  });

  it("dedents an accordion item's body, code included", () => {
    expect(
      agent(
        "::accordion",
        `  :::accordion-item{label="Can I use Tailwind?"}`,
        "  Yes:",
        "",
        "  ```css",
        "  @theme inline {",
        "    --color-primary: var(--color--primary);",
        "  }",
        "  ```",
        "",
        "  - A list",
        "    - nested",
        "  :::",
        "::",
      ),
    ).toBe(
      [
        "**Can I use Tailwind?**",
        "",
        "Yes:",
        "",
        "```css",
        "@theme inline {",
        "  --color-primary: var(--color--primary);",
        "}",
        "```",
        "",
        "- A list",
        "  - nested",
      ].join("\n"),
    );
  });

  it("ticks the Roadmap's shipped components", () => {
    expect(agent("| :roadmap-check{shipped} [Button](/docs/components/button) | Acting |", "| :roadmap-check Field | Labelling |")).toBe(
      "| [x] [Button](https://opencomponents.dev/docs/components/button) | Acting |\n| [ ] Field | Labelling |",
    );
  });

  it.each([
    ["[the introduction](/docs/getting-started/introduction)", "[the introduction](https://opencomponents.dev/docs/getting-started/introduction)"],
    ["[`button.yaml`](/raw/docs/components/button.yaml){external=\"\"}", "[`button.yaml`](https://opencomponents.dev/raw/docs/components/button.yaml)"],
    ["[Loading](#loading)", "[Loading](https://opencomponents.dev/docs/components/button#loading)"],
    ["[Tabs](/docs/components/tabs){external}", "[Tabs](https://opencomponents.dev/docs/components/tabs)"],
    ["[Vitest](https://vitest.dev)", "[Vitest](https://vitest.dev)"],
    ["Two: [a](/a) and [b](#b).", "Two: [a](https://opencomponents.dev/a) and [b](https://opencomponents.dev/docs/components/button#b)."],
  ])("makes %s absolute", (link, expected) => {
    expect(agent(link)).toBe(expected);
  });

  // In code, these are examples: a `#react` line or a `::foo` line isn't a slot
  // or a component, and links stay as written.
  it("leaves code as it is", () => {
    const lines = ["```md", "::foo", "#react", "::", "[link](/docs){external=\"\"}", ":roadmap-check{shipped}", "```"];
    expect(agent("::framework-switcher", "#react", ...lines, "::")).toBe([SWITCHER, slot("react"), ...lines, SWITCHER_END].join("\n"));
  });

  it("collapses the blank lines dropped components leave", () => {
    expect(agent("Before", "", "::button-playground", "::", "", "", "After")).toBe("Before\n\nAfter");
  });

  it("fails on a slot that isn't a framework", () => {
    expect(() => agent("::framework-switcher", "#react", "Text", "#qwik", "Text", "::")).toThrow(
      "/docs/components/button: a framework switcher has a #qwik slot, which isn't one of react, vue, vanilla",
    );
  });

  // A section would end halfway through the switcher, leaving its markers behind.
  it.each([
    ["in a slot", ["::framework-switcher", "#react", "### Hooks", "::"]],
    ["in a component inside a slot", ["::framework-switcher", "#react", "::code-collapse", "## Hooks", "::", "::"]],
  ])("fails on a heading %s", (_, lines) => {
    expect(() => agent(...lines)).toThrow("a framework switcher has a heading in it");
  });

  it("fails on a component that's never closed", () => {
    expect(() => agent("::button-variants-example", "::framework-switcher", "#react", "Text", "::")).toThrow(
      "/docs/components/button: ::button-variants-example is never closed",
    );
  });
});
