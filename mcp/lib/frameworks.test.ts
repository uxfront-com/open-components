// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderFrameworks, SWITCHER, SWITCHER_END, slot } from "./frameworks";

const FRAMEWORKS = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "vanilla", label: "Vanilla" },
];

// A switcher as agent-markdown.ts marks it, with the blank lines around its slots.
const switcher = (slots: Record<string, string>) => [
  SWITCHER,
  ...Object.entries(slots).flatMap(([framework, code]) => [slot(framework), "", "```", code, "```", ""]),
  SWITCHER_END,
];
const markdown = (...lines: (string | string[])[]) => lines.flat().join("\n");

describe("renderFrameworks", () => {
  const page = markdown("## Sizes", "", "Pick a size:", "", switcher({ react: "<Button size='sm' />", vue: '<Button size="sm" />' }), "", "After");

  it("shows every framework's example under its name, in bold", () => {
    expect(renderFrameworks(page, FRAMEWORKS)).toBe(
      markdown(
        "## Sizes",
        "",
        "Pick a size:",
        "",
        ["**React**", "", "```", "<Button size='sm' />", "```", ""],
        ["**Vue**", "", "```", '<Button size="sm" />', "```", ""],
        "After",
      ),
    );
  });

  it("shows only one framework's", () => {
    expect(renderFrameworks(page, FRAMEWORKS, "vue")).toBe(markdown("## Sizes", "", "Pick a size:", "", "```", '<Button size="sm" />', "```", "", "After"));
  });

  // As the site does when the switcher's framework isn't in an example.
  it("falls back to the example's first framework, with a note", () => {
    expect(renderFrameworks(page, FRAMEWORKS, "vanilla")).toBe(
      markdown(
        "## Sizes",
        "",
        "Pick a size:",
        "",
        "_This example doesn't come in Vanilla, so here it is in React._",
        "",
        "```",
        "<Button size='sm' />",
        "```",
        "",
        "After",
      ),
    );
  });

  it("names a framework it doesn't know by its value", () => {
    expect(renderFrameworks(markdown(switcher({ qwik: "<Button />" })), FRAMEWORKS)).toBe("**qwik**\n\n```\n<Button />\n```");
  });

  it("renders every switcher on the page on its own", () => {
    const two = markdown(switcher({ react: "A" }), "Between", switcher({ vue: "B" }));
    expect(renderFrameworks(two, FRAMEWORKS, "vue")).toBe(
      markdown("_This example doesn't come in Vue, so here it is in React._", "", "```", "A", "```", "Between", "```", "B", "```"),
    );
  });

  it("leaves markdown without switchers as it is, but for blank lines", () => {
    const text = markdown("# Title", "", "", "Text with <!-- a comment -->", "", "```", "", "", "```");
    expect(renderFrameworks(text, FRAMEWORKS)).toBe(markdown("# Title", "", "Text with <!-- a comment -->", "", "```", "", "", "```"));
    expect(renderFrameworks(text, FRAMEWORKS, "react")).toBe(renderFrameworks(text, FRAMEWORKS));
  });
});
