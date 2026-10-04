// @vitest-environment node
import { describe, expect, it } from "vitest";
import { FRAMEWORKS } from "../../app/data/frameworks";
import { SWITCHER, SWITCHER_END } from "./frameworks";
import { tokens } from "./markdown";
import { count, findPage, findSections, outline, PAGE_LIMIT, pageText, sectionText } from "./pages";
import { buildStandard } from "./standard";
import type { Heading, Page } from "./types";

// The real standard, as the MCP server bundles it.
const { standard } = buildStandard({ root: process.cwd(), site: "https://opencomponents.dev", frameworks: FRAMEWORKS });
const page = (key: string) => standard.pages.find((candidate) => candidate.key === key)!;
const button = page("button");

describe("findPage", () => {
  it.each([
    ["button", "button"],
    ["  Button ", "button"],
    ["/docs/components/button", "button"],
    ["/docs/components/button/", "button"],
    ["components/button", "button"],
    ["/raw/docs/components/button.md", "button"],
    ["/raw/docs/foundations/design-tokens.yaml", "design-tokens"],
    ["https://opencomponents.dev/docs/components/button#loading", "button"],
    ["https://opencomponents.dev/raw/docs/components/button.yaml", "button"],
    ["https://opencomponents.dev/docs/getting-started/roadmap?ref=mcp", "roadmap"],
    ["Introduction", "introduction"],
    // The contracts' names, and the prefix of the Design Tokens' rule IDs.
    ["token-paths", "design-tokens"],
    ["tokens", "design-tokens"],
  ])("finds %j", (name, key) => {
    expect(findPage(standard, name)?.key).toBe(key);
  });

  it.each(["dialog", "/docs/components/dialog", "butt", "button/keep-focus", ""])("doesn't find %j", (name) => {
    expect(findPage(standard, name)).toBeUndefined();
  });
});

describe("findSections", () => {
  const find = (...names: string[]) => {
    const { found, missing } = findSections(button, names);
    return { found: found.map((heading) => heading.text), missing };
  };

  it.each([
    ["Loading", "Loading"],
    ["loading", "Loading"],
    ["LOADING", "Loading"],
    ["#loading", "Loading"],
    ["ux-rules", "UX rules"],
    ["#ux-rules", "UX rules"],
    ["User Experience (UX)", "User Experience (UX)"],
    ["Don't nest interactive elements", "Don't nest interactive elements"],
    ["Every state > Loading", "Loading"],
    ["User Experience (UX) › Every state › Loading", "Loading"],
    // Any of its parents will do.
    ["User Experience (UX) > Loading", "Loading"],
    ["Checklist > #ux-rules", "UX rules"],
    // Without its punctuation, or the abbreviation in its parentheses.
    ["Type safe", "Type-safe"],
    ["Button or link", "Button or link?"],
    ["Developer Experience", "Developer Experience (DX)"],
    ["User Experience > Every state > Loading", "Loading"],
    // As search-docs writes a trail, starting with the page's title.
    ["Button › User Experience (UX) › Every state › Loading", "Loading"],
    // By its abbreviation, in US spelling, singular, or as get-page's outline lists it.
    ["DX", "Developer Experience (DX)"],
    ["UX > Every state > Loading", "Loading"],
    ["Colors", "Colours"],
    ["Forced colors", "Forced colours"],
    ["Toggle button", "Toggle buttons"],
    ["Loading (#loading)", "Loading"],
    ["Every state (#every-state) > Loading (#loading)", "Loading"],
    // The page's title is its introduction, before its first heading.
    ["Button", "Button"],
  ])("finds %j", (name, text) => {
    expect(find(name)).toEqual({ found: [text], missing: [] });
  });

  it("reports the names it can't find", () => {
    expect(find("Loading", "Spinners", "Adaptive > Loading")).toEqual({ found: ["Loading"], missing: ["Spinners", "Adaptive > Loading"] });
  });

  it("returns the sections in page order, once each", () => {
    expect(find("Checklist", "Anatomy", "#anatomy", "anatomy").found).toEqual(["Anatomy", "Checklist"]);
  });

  // A section comes with its sub-sections, so they'd be there twice.
  it("drops the sections inside another one asked for", () => {
    expect(find("Loading", "User Experience (UX)", "Every state").found).toEqual(["User Experience (UX)"]);
  });

  // Agents read the anchors and the trails from the outline, so each must lead
  // back to its own heading.
  it.each(standard.pages.map((page) => [page.key, page]))("finds every heading of %s by its anchor, and by its trail", (_, page) => {
    for (const heading of page.headings) {
      expect(findSections(page, [`#${heading.anchor}`]).found).toEqual([heading]);
      expect(findSections(page, [[...heading.trail, heading.text].join(" > ")]).found).toEqual([heading]);
    }
  });
});

describe("sectionText and pageText", () => {
  const loading = findSections(button, ["Loading"]).found[0]!;

  it("returns a section with its sub-sections, up to the next one", () => {
    const text = sectionText(standard, button, findSections(button, ["Every state"]).found[0]!);
    expect(text.startsWith("### Every state\n")).toBe(true);
    expect(text).toContain("\n#### Loading\n");
    expect(text).toContain("\n#### Menu buttons\n");
    expect(text).not.toContain("\n### Adaptive");
  });

  it("keeps one framework's examples", () => {
    const text = sectionText(standard, button, loading, "react");
    expect(text.startsWith("#### Loading\n")).toBe(true);
    expect(text).toContain("```tsx");
    expect(text).not.toContain("```vue");
    expect(text).not.toContain("**React**");
  });

  it("keeps every framework's examples, under their names", () => {
    const text = sectionText(standard, button, loading);
    for (const { label } of FRAMEWORKS) expect(text).toContain(`\n**${label}**\n`);
  });

  it.each(standard.pages.map((page) => [page.key, page]))("renders %s's switchers", (_, page) => {
    for (const framework of [undefined, "react", "vanilla"]) {
      const text = pageText(standard, page, framework);
      expect(text).not.toContain(SWITCHER);
      expect(text).not.toContain(SWITCHER_END);
      expect(text).not.toContain("<!-- framework:");
    }
  });

  // Which is why get-page returns its outline.
  it("finds the Button's page too long to return whole", () => {
    expect(tokens(pageText(standard, button, "react"))).toBeGreaterThan(PAGE_LIMIT);
  });
});

describe("outline", () => {
  const heading = (level: number, text: string, size: number, one = size): Heading => ({
    level,
    text,
    anchor: text.toLowerCase().replaceAll(" ", "-"),
    trail: [],
    start: 0,
    end: 0,
    tokens: size,
    tokensOneFramework: one,
  });
  const headings = [
    heading(2, "At a glance", 360),
    heading(2, "Token paths", 910),
    heading(3, "Groups", 364),
    heading(2, "Component variables", 970, 580),
    heading(4, "Deep", 8_700),
  ];

  it("lists the headings, indented from the top level, with their length", () => {
    expect(outline({ headings } as Page)).toBe(
      [
        "- At a glance (#at-a-glance) ~360",
        "- Token paths (#token-paths) ~910",
        "  - Groups (#groups) ~360",
        "- Component variables (#component-variables) ~970, ~580 with one framework",
        "    - Deep (#deep) ~8.7k",
      ].join("\n"),
    );
  });

  it("indents from the top level of the headings it's given", () => {
    expect(outline({ headings } as Page, headings.slice(2, 3))).toBe("- Groups (#groups) ~360");
  });

  it("lists a real page's every heading", () => {
    const lines = outline(button).split("\n");
    expect(lines).toHaveLength(button.headings.length);
    lines.forEach((line, i) => {
      const { level, text, anchor } = button.headings[i]!;
      expect(line).toMatch(new RegExp(`^${"  ".repeat(level - 2)}- .+ \\(#${anchor}\\) ~[\\d.]+k?(, ~[\\d.]+k? with one framework)?$`));
      expect(line).toContain(`- ${text} (`);
    });
  });
});

describe("count", () => {
  it.each([
    [0, "0"],
    [4, "0"],
    [5, "10"],
    [349, "350"],
    [994, "990"],
    [1000, "1k"],
    [1049, "1k"],
    [8_700, "8.7k"],
    [20_000, "20k"],
    [35_213, "35.2k"],
  ])("rounds %d to %s", (value, expected) => {
    expect(count(value)).toBe(expected);
  });
});
