// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { FRAMEWORKS } from "../../app/data/frameworks";
import { createSearch, terms } from "./search";
import { buildStandard } from "./standard";

describe("terms", () => {
  it.each([
    ["How do I disable the button?", ["disable", "button"]],
    // A plural's `s` goes, so "icons" finds "icon", but not a double `s`, or a short word's.
    ["Icons in a class has axes", ["icon", "class", "has", "axe"]],
    ["Focus is lost", ["focu", "lost"]],
    ["Use `aria-pressed` on toggles", ["aria", "pressed", "toggle"]],
    // A possessive is the word it's on, with either apostrophe.
    ["The button's label and the Button’s icon", ["button", "label", "button", "icon"]],
    // A contraction is one word, rather than a stray `t` that every contraction would match.
    ["Don't nest, and doesn’t submit", ["dont", "nest", "doesnt", "submit"]],
    ["200% zoom, 24 × 24px", ["200", "zoom", "24", "24px"]],
    ["the and of to", []],
  ])("reads %j", (text, expected) => {
    expect(terms(text)).toEqual(expected);
  });
});

describe("createSearch", () => {
  const { standard } = buildStandard({ root: process.cwd(), site: "https://opencomponents.dev", frameworks: FRAMEWORKS });
  const search = createSearch(standard);

  it("finds the Button's toggle buttons for aria-pressed", () => {
    const top = search("aria-pressed", { limit: 3 }).results.map(({ type, title }) => `${type} ${title}`);
    expect(top.slice(0, 2)).toContain("rule button/toggle-pressed");
    expect(top).toContain("section Toggle buttons");
  });

  it("finds the section on focus after a delete", () => {
    expect(search("focus after delete", { limit: 1 }).results[0]).toMatchObject({
      type: "section",
      title: "Move focus where people expect it",
      trail: "Button › User Experience (UX) › Predictable",
      path: "/docs/components/button",
      anchor: "move-focus-where-people-expect-it",
      url: "https://opencomponents.dev/docs/components/button#move-focus-where-people-expect-it",
    });
  });

  it("finds a rule by its requirement, with its ID, level and scope", () => {
    const { level, scope, requirement } = standard.rules.find((rule) => rule.id === "button/toggle-pressed")!;
    expect(search("aria-pressed keeps its label", { type: "rule", limit: 1 }).results[0]).toEqual({
      type: "rule",
      title: "button/toggle-pressed",
      trail: "Button › Checklist › UX rules",
      path: "/docs/components/button",
      anchor: "ux-rules",
      url: "https://opencomponents.dev/docs/components/button#ux-rules",
      excerpt: requirement,
      rule: { id: "button/toggle-pressed", level, scope },
    });
  });

  it.each(standard.rules.map((rule) => [rule.id, rule]))("finds %s first for its requirement", (_, rule) => {
    expect(search(rule.requirement, { component: rule.component, limit: 1 }).results[0]?.title).toBe(rule.id);
  });

  it("only searches a page and its rules, or one type, when asked", () => {
    const tokens = search("contrast", { component: "design-tokens", limit: 50 }).results;
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.every((result) => result.path === "/docs/foundations/design-tokens")).toBe(true);
    for (const type of ["section", "rule"] as const) {
      const results = search("contrast", { type, limit: 50 }).results;
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((result) => result.type === type)).toBe(true);
    }
  });

  it("returns up to `limit` results, and how many match", () => {
    const { total, results } = search("button", { limit: 3 });
    expect(results).toHaveLength(3);
    expect(total).toBeGreaterThan(3);
    expect(search("button", { limit: 100 }).results.slice(0, 3)).toEqual(results);
  });

  it("finds nothing for stopwords, or words the standard doesn't use", () => {
    expect(search("how do I", { limit: 5 })).toEqual({ total: 0, results: [] });
    expect(search("xylophone", { limit: 5 })).toEqual({ total: 0, results: [] });
  });

  // Every heading and every rule's requirement, as a query, for the checks below.
  const everything = [
    ...standard.pages.flatMap((page) => page.headings.map((heading) => heading.text)),
    ...standard.rules.map((rule) => rule.requirement),
  ].flatMap((query) => search(query, { limit: 20 }).results);

  it("points sections at headings that exist", () => {
    for (const result of everything.filter((result) => result.type === "section")) {
      const page = standard.pages.find((candidate) => candidate.path === result.path)!;
      if (result.anchor) expect(page.headings.map((heading) => heading.anchor)).toContain(result.anchor);
      expect(result.url).toBe(`https://opencomponents.dev${result.path}${result.anchor ? `#${result.anchor}` : ""}`);
    }
  });

  // The standard is mostly about markup, so excerpts quote it as it's written.
  it("keeps inline code in excerpts", () => {
    const quoted = (query: string) => search(query, { type: "section", limit: 20 }).results.map((result) => result.excerpt).join("\n");
    expect(quoted("native button element")).toContain("`<button>`");
    expect(quoted("solid outline subtle ghost")).toContain('`"solid" | "outline"');
  });

  // A page's Sources only list the titles of what it draws on.
  it("ranks a page's prose above its sources", () => {
    const [first] = search("naming css variables", { limit: 5 }).results;
    expect(first?.title).not.toBe("Sources");
  });

  // About 200 characters, cut between words, with an ellipsis at a cut.
  it("quotes short excerpts, as prose", () => {
    for (const { excerpt } of everything) {
      expect(excerpt.length).toBeGreaterThan(0);
      expect(excerpt.length).toBeLessThanOrEqual(240);
      expect(excerpt).not.toContain("\\|");
      expect(excerpt).not.toContain("<!--");
      expect(excerpt).not.toContain("```");
      expect(excerpt).not.toMatch(/\s{2}|\| ?-{3}/);
    }
  });
});

// A repository with two checklists: one table right under "## Checklist", like
// the Design Tokens', and one under "### UI rules", like the Button's.
describe("createSearch on checklists", () => {
  const root = mkdtempSync(join(tmpdir(), "open-components-search-"));
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  const write = (file: string, content: string) => {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), content);
  };
  const page = (title: string, contract: string, checklist: string) =>
    [
      "---",
      `title: ${title}`,
      `description: The ${title.toLowerCase()} page.`,
      "---",
      "",
      "## Agentic Experience (AX)",
      "",
      "### Described",
      "",
      "```yaml",
      contract,
      "rules: https://example.com/#checklist",
      "```",
      "",
      "## Checklist",
      "",
      "Here's every rule in one place.",
      "",
      checklist,
    ].join("\n");
  write("public/schemas/contract.json", "{}");
  write(
    "content/docs/1.foundations/1.spacing.md",
    page("Spacing", "convention: spacing", "| Rule | Level | Requirement | Check |\n| --- | --- | --- | --- |\n| `spacing/scale` | Must | Gaps come from the zebra scale | Review |"),
  );
  write(
    "content/docs/2.components/1.widget.md",
    page(
      "Widget",
      "component: Widget",
      "### UI rules\n\n| Rule | Level | Scope | Requirement | Check |\n| --- | --- | --- | --- | --- |\n| `widget/okapi` | Must | Component | It's as shy as an okapi | Review |",
    ),
  );
  const { standard, problems } = buildStandard({ root, site: "https://example.com", frameworks: FRAMEWORKS });
  const search = createSearch(standard);

  it("builds", () => {
    expect(problems).toEqual([]);
    expect(standard.rules.map((rule) => rule.id)).toEqual(["spacing/scale", "widget/okapi"]);
  });

  // Their rules are results of their own, so the tables would only repeat them.
  it.each([
    ["zebra", "spacing/scale"],
    ["okapi", "widget/okapi"],
  ])("finds %j in the rule, not in the table", (query, id) => {
    expect(search(query, { limit: 10 }).results.map(({ type, title }) => [type, title])).toEqual([["rule", id]]);
  });

  it("still finds the checklist's own text", () => {
    expect(search("every rule in one place", { type: "section", limit: 10 }).results.map(({ title, trail }) => `${trail} › ${title}`)).toEqual([
      "Spacing › Checklist",
      "Widget › Checklist",
    ]);
  });
});
