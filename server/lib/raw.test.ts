// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { heading, scan } from "../../mcp/lib/markdown";
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
  const index = ["---", "title: Widget", "---", "", "Intro.", "", "## At a glance", "", "Table.", "", "## Checklist", "", "Rules.", "", "## FAQ", "", "Answers.", ""].join("\n");

  it("puts each part back before the section it names, in file order, with its headings a level lower", () => {
    const joined = joinPage(index, [
      part("User Interface (UI)", "Checklist", "How it looks.", "", "## Anatomy", "", "### Label", "", "Text."),
      part("User Experience (UX)", "Checklist", "How it behaves.", "", "## Loading"),
      part("Reference implementation", "FAQ", "The code."),
    ]);
    expect(joined).toBe(
      [
        "---", "title: Widget", "---", "", "Intro.", "",
        "## At a glance", "", "Table.", "",
        "## User Interface (UI)", "", "How it looks.", "", "### Anatomy", "", "#### Label", "", "Text.", "",
        "## User Experience (UX)", "", "How it behaves.", "", "### Loading", "",
        "## Checklist", "", "Rules.", "",
        "## Reference implementation", "", "The code.", "",
        "## FAQ", "", "Answers.", "",
      ].join("\n"),
    );
  });

  it("leaves lines in code, and framework slots, as they are", () => {
    const joined = joinPage(index, [
      part("Agentic Experience (AX)", "Checklist", "::framework-switcher", "#react", "```md", "## Not a heading", "```", "~~~", "# Nor this", "~~~", "::"),
    ]);
    expect(joined).toContain(["#react", "```md", "## Not a heading", "```", "~~~", "# Nor this", "~~~"].join("\n"));
    expect(outline(joined)).toEqual(["## At a glance", "## Agentic Experience (AX)", "## Checklist", "## FAQ"]);
  });

  it("fails on a part without a title or a section to go before", () => {
    expect(() => joinPage(index, ["---\ntitle: Lost\n---\n\nText.\n"])).toThrow("needs a title and the section it goes before");
    expect(() => joinPage(index, [part("Lost", "Sources", "Text.")])).toThrow("no section named Sources");
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
        { path: "/docs/components/widget/code", source: part("Reference implementation", "FAQ", "The code.") },
      ]),
    ).toEqual({
      "user-experience-ux": "/docs/components/widget/ux",
      "every-state": "/docs/components/widget/ux#every-state",
      loading: "/docs/components/widget/ux#loading",
      "reference-implementation": "/docs/components/widget/code",
    });
  });

  const anchors = readSplitAnchors(DOCS)["/docs/components/button"]!;

  it.each([
    ["loading", "/docs/components/button/ux#loading"],
    ["variants", "/docs/components/button/ui#variants"],
    ["deterministic", "/docs/components/button/ax#deterministic"],
    ["links-and-routers", "/docs/components/button/dx#links-and-routers"],
    ["user-interface-ui", "/docs/components/button/ui"],
    ["reference-implementation", "/docs/components/button/code"],
  ])("sends the Button's #%s to %s", (anchor, target) => {
    expect(anchors[anchor]).toBe(target);
  });

  it("covers every section of the Button's parts, and none of its Overview's", () => {
    const parts = readdirSync(join(DOCS, BUTTON)).filter((file) => file.endsWith(".md") && file !== "index.md");
    // Every heading of every part, plus the part's own section.
    const total = parts.reduce((sum, file) => sum + outline(readFileSync(join(DOCS, BUTTON, file), "utf8")).length + 1, 0);
    expect(Object.keys(anchors)).toHaveLength(total);
    for (const [anchor, target] of Object.entries(anchors)) {
      const [path, hash] = target.split("#");
      expect(parts.map((file) => docsPath(`${BUTTON}/${file}`))).toContain(path);
      if (hash) expect(hash).toBe(anchor);
    }
    for (const anchor of ["at-a-glance", "checklist", "ui-rules", "ux-rules", "dx-rules", "ax-rules", "faq", "button-or-link", "sources"]) {
      expect(anchors).not.toHaveProperty(anchor);
    }
  });
});
