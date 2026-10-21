// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { anchors as anchorsOf, heading, scan } from "../../mcp/lib/markdown";
import { docsPath, isPart, joinPage, readPage, readPages, readSplitAnchors, splitAnchors } from "./raw";

const DOCS = "content/docs";
const BUTTON = "3.components/button";

// A part's source, with the frontmatter joinPage reads.
const part = (title: string, before: string, ...lines: string[]) =>
  ["---", `title: ${title}`, "description: A part.", `before: ${before}`, "---", "", ...lines, ""].join("\n");
// The headings of a page outside its code, as `## Text`.
const outline = (markdown: string) =>
  scan(markdown).flatMap(({ text, code }) => {
    const match = !code && heading(text);
    return match ? [`${"#".repeat(match.level)} ${match.text}`] : [];
  });

describe("docsPath", () => {
  it.each([
    ["1.getting-started/2.roadmap.md", "/docs/getting-started/roadmap"],
    ["3.components/card.md", "/docs/components/card"],
    ["3.components/button/index.md", "/docs/components/button"],
    ["3.components/button/2.ux.md", "/docs/components/button/ux"],
  ])("serves %s at %s", (file, path) => {
    expect(docsPath(file)).toBe(path);
  });
});

describe("joinPage", () => {
  const index = [
    "---", "title: Widget", "---", "", "Intro.", "",
    "## At a glance", "", "Table.", "",
    "## Checklist", "", "How to read the rules.", "",
    "## Reference implementation", "", "The code.", "",
    "## Sources", "", "Links.", "",
  ].join("\n");

  it("puts each part back before the section it names, in file order, with its headings a level lower", () => {
    const joined = joinPage(index, [
      part("User Interface (UI)", "Checklist", "How it looks.", "", "## Anatomy", "", "### Label", "", "Text."),
      part("User Experience (UX)", "Checklist", "How it behaves.", "", "## Loading"),
    ]);
    expect(joined).toBe(
      [
        "---", "title: Widget", "---", "", "Intro.", "",
        "## At a glance", "", "Table.", "",
        "## User Interface (UI)", "", "How it looks.", "", "### Anatomy", "", "#### Label", "", "Text.", "",
        "## User Experience (UX)", "", "How it behaves.", "", "### Loading", "",
        "## Checklist", "", "How to read the rules.", "",
        "## Reference implementation", "", "The code.", "",
        "## Sources", "", "Links.", "",
      ].join("\n"),
    );
  });

  it("gathers each part's rules under the Checklist, and its questions into one FAQ before the Sources", () => {
    const joined = joinPage(index, [
      part("User Interface (UI)", "Checklist", "How it looks.", "", "## UI rules", "", "| ui/one |", "", "## FAQ", "", "::accordion", "UI question.", "::"),
      part("User Experience (UX)", "Checklist", "How it behaves.", "", "## UX rules", "", "| ux/one |", "", "## FAQ", "", "### Button or link?", "", "Links go places."),
      part("Agentic Experience (AX)", "Checklist", "How agents read it.", "", "## AX rules", "", "| ax/one |"),
    ]);
    expect(joined).toBe(
      [
        "---", "title: Widget", "---", "", "Intro.", "",
        "## At a glance", "", "Table.", "",
        "## User Interface (UI)", "", "How it looks.", "",
        "## User Experience (UX)", "", "How it behaves.", "",
        "## Agentic Experience (AX)", "", "How agents read it.", "",
        "## Checklist", "", "How to read the rules.", "",
        "### UI rules", "", "| ui/one |", "",
        "### UX rules", "", "| ux/one |", "",
        "### AX rules", "", "| ax/one |", "",
        "## Reference implementation", "", "The code.", "",
        "## FAQ", "", "::accordion", "UI question.", "::", "",
        "#### Button or link?", "", "Links go places.", "",
        "## Sources", "", "Links.", "",
      ].join("\n"),
    );
  });

  it("leaves lines in code, and framework slots, as they are", () => {
    const joined = joinPage(index, [
      part("Agentic Experience (AX)", "Checklist", "::framework-switcher", "#react", "```md", "## Not a heading", "```", "~~~", "# Nor this", "~~~", "::"),
    ]);
    const lines = joined.split("\n");
    const start = lines.indexOf("## Agentic Experience (AX)");
    expect(lines.slice(start, start + 12)).toEqual([
      "## Agentic Experience (AX)",
      "",
      "::framework-switcher",
      "#react",
      "```md",
      "## Not a heading",
      "```",
      "~~~",
      "# Nor this",
      "~~~",
      "::",
      "",
    ]);
    expect(outline(joined)).toEqual(["## At a glance", "## Agentic Experience (AX)", "## Checklist", "## Reference implementation", "## Sources"]);
  });

  it("fails on a part without a title or a section to go before", () => {
    expect(() => joinPage(index, ["---\ntitle: Lost\n---\n\nText.\n"])).toThrow("needs a title and the section it goes before");
    expect(() => joinPage(index, [part("Lost", "Glossary", "Text.")])).toThrow("no section named Glossary");
    const bare = index.replace("## Sources", "## Links");
    expect(() => joinPage(bare, [part("Lost", "Checklist", "Text.", "", "## FAQ", "", "Answers.")])).toThrow("no section named Sources");
  });
});

describe("The Button's page", () => {
  const parts = readdirSync(join(DOCS, BUTTON)).filter((file) => file.endsWith(".md") && file !== "index.md");

  it("is one page, with its parts joined back in", () => {
    expect(readPages(DOCS).filter(({ file }) => file.startsWith(BUTTON))).toEqual([
      { file: `${BUTTON}/index.md`, source: readPage(DOCS, `${BUTTON}/index.md`), parts: parts.map((file) => `${BUTTON}/${file}`) },
    ]);
    expect(parts.every((file) => isPart(DOCS, `${BUTTON}/${file}`))).toBe(true);
    expect(isPart(DOCS, `${BUTTON}/index.md`)).toBe(false);
    expect(isPart(DOCS, "3.components/card.md")).toBe(false);
  });

  it("has the outline every component page has, in its order", () => {
    const sections = outline(readPage(DOCS, `${BUTTON}/index.md`)).filter((line) => line.startsWith("## "));
    expect(sections).toEqual([
      "## At a glance",
      "## User Interface (UI)",
      "## User Experience (UX)",
      "## Developer Experience (DX)",
      "## Agentic Experience (AX)",
      "## Checklist",
      "## Reference implementation",
      "## FAQ",
      "## Sources",
    ]);
  });

  it("reads each part as itself", () => {
    const ux = readFileSync(join(DOCS, BUTTON, "2.ux.md"), "utf8");
    expect(readPage(DOCS, `${BUTTON}/2.ux.md`)).toBe(ux);
    expect(outline(ux)).toContain("## Every state");
    expect(outline(ux)).toContain("### Loading");
  });
});

// Links from before the split, like /docs/components/button#loading, go on to the
// part with the section (app/middleware/split-pages.global.ts).
describe("splitAnchors", () => {
  it("sends each heading's anchor to its part, and the part's own section to the part's page", () => {
    expect(
      splitAnchors([
        { path: "/docs/components/widget/ux", source: part("User Experience (UX)", "Checklist", "Text.", "", "## Every state", "", "### Loading", "", "```md", "## Not a heading", "```") },
      ]),
    ).toEqual({
      "user-experience-ux": "/docs/components/widget/ux",
      "every-state": "/docs/components/widget/ux#every-state",
      loading: "/docs/components/widget/ux#loading",
    });
  });

  // Each part's anchors are its own, as on its page, so a heading on several parts,
  // like the FAQ, has the same anchor on each.
  it("sends a heading on several parts to the one with the longest section under it", () => {
    const anchors = splitAnchors([
      { path: "/docs/components/widget/ui", source: part("User Interface (UI)", "Checklist", "Text.", "", "## FAQ", "", "One.") },
      { path: "/docs/components/widget/ux", source: part("User Experience (UX)", "Checklist", "Text.", "", "## FAQ", "", "One.", "", "Two.", "", "Three.") },
      { path: "/docs/components/widget/dx", source: part("Developer Experience (DX)", "Checklist", "Text.", "", "## FAQ", "", "One.", "", "Two.") },
    ]);
    expect(anchors.faq).toBe("/docs/components/widget/ux#faq");
  });

  const anchors = readSplitAnchors(DOCS)["/docs/components/button"]!;

  it.each([
    ["loading", "/docs/components/button/ux#loading"],
    ["variants", "/docs/components/button/ui#variants"],
    ["deterministic", "/docs/components/button/ax#deterministic"],
    ["links-and-routers", "/docs/components/button/dx#links-and-routers"],
    ["user-interface-ui", "/docs/components/button/ui"],
    ["ui-rules", "/docs/components/button/ui#ui-rules"],
    ["ux-rules", "/docs/components/button/ux#ux-rules"],
    ["faq", "/docs/components/button/ux#faq"],
    ["button-or-link", "/docs/components/button/ux#button-or-link"],
  ])("sends the Button's #%s to %s", (anchor, target) => {
    expect(anchors[anchor]).toBe(target);
  });

  it("covers every section of the Button's parts, and none of its Overview's", () => {
    const parts = readdirSync(join(DOCS, BUTTON)).filter((file) => file.endsWith(".md") && file !== "index.md");
    // Every heading of every part, plus the part's own section, once each.
    const ids = new Set(
      parts.flatMap((file) => {
        const slug = anchorsOf();
        return [file, ...outline(readFileSync(join(DOCS, BUTTON, file), "utf8")).map((line) => slug(line.replace(/^#+ /, "")))];
      }),
    );
    expect(Object.keys(anchors)).toHaveLength(ids.size);
    for (const [anchor, target] of Object.entries(anchors)) {
      const [path, hash] = target.split("#");
      expect(parts.map((file) => docsPath(`${BUTTON}/${file}`))).toContain(path);
      if (hash) expect(hash).toBe(anchor);
    }
    for (const anchor of ["at-a-glance", "checklist", "reference-implementation", "sources"]) {
      expect(anchors).not.toHaveProperty(anchor);
    }
  });
});
