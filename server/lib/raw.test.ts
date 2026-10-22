// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { anchors as anchorsOf, heading, scan } from "../../mcp/lib/markdown";
import { docsPath, isPart, joinPage, readPage, readPages, readSplitAnchors, splitAnchors } from "./raw";

const DOCS = "content/docs";
const COMPONENTS = "3.components";
// Every component page split into parts, like the Button's: a folder with an index.md.
const SPLIT = readdirSync(join(DOCS, COMPONENTS), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(DOCS, COMPONENTS, entry.name, "index.md")))
  .map((entry) => entry.name);

// A part's source, with the frontmatter joinPage reads.
const part = (title: string, before: string, ...lines: string[]) =>
  ["---", `title: ${title}`, "description: A part.", `before: ${before}`, "---", "", ...lines, ""].join("\n");
// The headings of a page outside its code, as `## Text`.
const outline = (markdown: string) =>
  scan(markdown).flatMap(({ text, code }) => {
    const match = !code && heading(text);
    return match ? [`${"#".repeat(match.level)} ${match.text}`] : [];
  });
const frontmatter = (source: string) => parse(source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)?.[1] ?? "") ?? {};
// A section of a page, outside its code, from its `## ` heading up to the next.
const section = (markdown: string, title: string) => {
  const lines = scan(markdown);
  const start = lines.findIndex(({ text, code }) => !code && text === `## ${title}`);
  const end = lines.findIndex(({ text, code }, i) => i > start && !code && heading(text)?.level === 2);
  return lines.slice(start, end === -1 ? undefined : end).map(({ text }) => text).join("\n");
};

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

  it("gathers each part's rules under the Checklist, named as on every component page, and its questions into one FAQ before the Sources", () => {
    const joined = joinPage(index, [
      part("User Interface (UI)", "Checklist", "How it looks.", "", "## UI Checklist", "", "| ui/one |", "", "## FAQ", "", "::accordion", "UI question.", "::"),
      part("User Experience (UX)", "Checklist", "How it behaves.", "", "## UX Checklist", "", "| ux/one |", "", "## FAQ", "", "### Button or link?", "", "Links go places."),
      part("Agentic Experience (AX)", "Checklist", "How agents read it.", "", "## AX Checklist", "", "| ax/one |"),
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
    const unruled = index.replace("## Checklist", "## Rules");
    expect(() => joinPage(unruled, [part("Lost", "Reference implementation", "Text.", "", "## UI Checklist", "", "| r |")])).toThrow("no section named Checklist");
    const bare = index.replace("## Sources", "## Links");
    expect(() => joinPage(bare, [part("Lost", "Checklist", "Text.", "", "## FAQ", "", "Answers.")])).toThrow("no section named Sources");
  });
});

// Every component page split like the Button's, each checked on its own, so a
// component's split is in the gate as soon as its folder is.
describe.each(SPLIT)("The %s page, split into parts,", (name) => {
  const folder = `${COMPONENTS}/${name}`;
  const parts = readdirSync(join(DOCS, folder)).filter((file) => file.endsWith(".md") && file !== "index.md");
  const index = readFileSync(join(DOCS, folder, "index.md"), "utf8");
  const read = (file: string) => readFileSync(join(DOCS, folder, file), "utf8");

  it("is one page, with its parts joined back in", () => {
    expect(readPages(DOCS).filter(({ file }) => file.startsWith(`${folder}/`))).toEqual([
      { file: `${folder}/index.md`, source: readPage(DOCS, `${folder}/index.md`), parts: parts.map((file) => `${folder}/${file}`) },
    ]);
    expect(parts.every((file) => isPart(DOCS, `${folder}/${file}`))).toBe(true);
    expect(isPart(DOCS, `${folder}/index.md`)).toBe(false);
    expect(isPart(DOCS, "3.components/card.md")).toBe(false);
  });

  it("has the outline every component page has, in its order", () => {
    const sections = outline(readPage(DOCS, `${folder}/index.md`)).filter((line) => line.startsWith("## "));
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

  it("has a page per layer, each ending with its rules, then its questions if it has any", () => {
    expect(parts).toEqual(["1.ui.md", "2.ux.md", "3.dx.md", "4.ax.md"]);
    for (const [file, layer] of [["1.ui.md", "UI"], ["2.ux.md", "UX"], ["3.dx.md", "DX"], ["4.ax.md", "AX"]] as const) {
      const sections = outline(read(file)).filter((line) => line.startsWith("## "));
      const end = sections.at(-1) === "## FAQ" ? [`## ${layer} Checklist`, "## FAQ"] : [`## ${layer} Checklist`];
      expect(sections.slice(-end.length), file).toEqual(end);
      expect(sections.filter((line) => line.endsWith(" Checklist") || line === "## FAQ"), file).toEqual(end);
    }
  });

  it("reads each part as itself", () => {
    for (const file of parts) expect(readPage(DOCS, `${folder}/${file}`)).toBe(read(file));
  });

  it("names its folder in the sidebar, with an icon", () => {
    const { title, icon } = parse(readFileSync(join(DOCS, folder, ".navigation.yml"), "utf8")) ?? {};
    expect(title).toEqual(expect.any(String));
    expect(icon).toMatch(/^i-/);
  });

  it("has an Overview with no questions of its own, a card for each part and a link to each part's rules", () => {
    expect(frontmatter(index).navigation?.title).toBe("Overview");
    expect(outline(index)).not.toContain("## FAQ");
    const group = index.match(/^::card-group\n([\s\S]*?)^::$/m)?.[1];
    const cards = [...(group ?? "").matchAll(/^:::card\{([^}]*)\}\n([\s\S]*?)\n:::$/gm)].map(([, attributes, text]) => ({
      ...Object.fromEntries([...attributes!.matchAll(/(\w+)="([^"]*)"/g)].map(([, key, value]) => [key, value])),
      text,
    }));
    const checklist = section(index, "Checklist");
    expect(cards).toEqual(
      parts.map((file) => {
        const { title, description } = frontmatter(read(file));
        return expect.objectContaining({ to: docsPath(`${folder}/${file}`), title, text: description });
      }),
    );
    for (const file of parts) {
      const { title } = frontmatter(read(file));
      const rules = outline(read(file)).find((line) => / Checklist$/.test(line))!.replace(/^## /, "");
      expect(checklist).toContain(`- [${title} Checklist](${docsPath(`${folder}/${file}`)}#${anchorsOf()(rules)})`);
    }
  });

  it("sends every section of its parts on to them, and none of its Overview's", () => {
    const anchors = readSplitAnchors(DOCS)[docsPath(`${folder}/index.md`)]!;
    // Every heading of every part, plus the part's own section, once each.
    const ids = new Set(
      parts.flatMap((file) => {
        const slug = anchorsOf();
        return [file, ...outline(read(file)).map((line) => slug(line.replace(/^#+ /, "")))];
      }),
    );
    // And each rules table's anchor on the whole page, like `ui-rules`.
    expect(Object.keys(anchors)).toHaveLength(ids.size + parts.length);
    for (const [anchor, target] of Object.entries(anchors)) {
      const [path, hash] = target.split("#");
      expect(parts.map((file) => docsPath(`${folder}/${file}`))).toContain(path);
      if (hash) expect(hash).toBe(anchor.replace(/-rules$/, "-checklist"));
    }
    const slug = anchorsOf();
    for (const line of outline(index).filter((line) => line.startsWith("## "))) {
      expect(anchors).not.toHaveProperty(slug(line.replace(/^## /, "")));
    }
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
    ["ui-rules", "/docs/components/button/ui#ui-checklist"],
    ["ui-checklist", "/docs/components/button/ui#ui-checklist"],
    ["ux-rules", "/docs/components/button/ux#ux-checklist"],
    ["faq", "/docs/components/button/ux#faq"],
    ["button-or-link", "/docs/components/button/ux#button-or-link"],
  ])("sends the Button's #%s to %s", (anchor, target) => {
    expect(anchors[anchor]).toBe(target);
  });
});
