// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { FRAMEWORKS } from "../../app/data/frameworks";
import { buildStandard } from "../../mcp/lib/standard";
import { brokenLinks, checklistPage, CHECKLISTS, citedCriteria, COMPONENTS, layerRows, picked, readChecklists } from "./checklists";
import { docsPath, rawPage, rawTitle } from "./raw";
import { WCAG } from "./wcag";

const DOCS = "content/docs";
const checklists = readChecklists(DOCS);
const frontmatter = (source: string) => parse(source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)?.[1] ?? "") ?? {};

// A layer page's source, with a rules table of the given rows, each
// [rule, level, requirement, basis].
const layer = (name: string, rows: Array<Array<string>>, ...before: Array<string>) =>
  [
    "---",
    "title: A layer",
    "description: A layer page.",
    "---",
    "",
    ...before,
    `## ${name} Checklist`,
    "",
    "| Rule | Level | Scope | Requirement | Basis | Check |",
    "| ---- | ----- | ----- | ----------- | ----- | ----- |",
    ...rows.map(([rule, level, requirement, basis]) => `| \`${rule}\` | ${level} | Component | ${requirement} | ${basis} | Review |`),
    "",
    "## FAQ",
    "",
    "| Not | A | Rule |",
    "",
  ].join("\n");

// The content gate for the checklists: each page in content/docs/4.accessibility/
// is what the generator builds from its component's tables, so the two can't
// drift. After a rule changes, `pnpm test -u server/lib/checklists.test.ts`
// writes the pages again. CI never writes them, so it fails on any difference.
describe("The accessibility checklists", () => {
  it.each([...checklists])("%s is built from its component's Checklist tables", async (file, page) => {
    await expect(page).toMatchFileSnapshot(join("../..", DOCS, file));
  });

  it("has a page for every component, and nothing else", () => {
    const components = readdirSync(join(DOCS, COMPONENTS), { withFileTypes: true }).filter((entry) => entry.isDirectory());
    const files = readdirSync(join(DOCS, CHECKLISTS)).filter((file) => file.endsWith(".md"));
    expect(checklists.size).toBe(components.length);
    expect(files.map((file) => join(CHECKLISTS, file)).sort()).toEqual([...checklists.keys()].sort());
  });

  // Every docs page's own source, by its path, the parts of a split page each
  // under their own, as the site serves them.
  const site = new Map(
    readdirSync(DOCS, { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(".md"))
      .map((file) => [docsPath(file), readFileSync(join(DOCS, file), "utf8")]),
  );
  it.each([...checklists])("%s links to sections that exist", (_, page) => {
    expect(brokenLinks(page, site)).toEqual([]);
  });

  it.each([...checklists])("%s has a title that fits in search results, and a description that does too", (_, page) => {
    const { title, description, seo } = frontmatter(page);
    // The site adds " - Open Components", and check-seo allows 60 characters.
    expect(title.length).toBeLessThanOrEqual(42);
    expect(description.length).toBeGreaterThanOrEqual(70);
    expect(description.length).toBeLessThanOrEqual(160);
    // A seo.title would head the /raw copy but not the MCP server's, which
    // check-mcp requires to be the same bytes.
    expect(seo).toBeUndefined();
  });

  it("gives every page a title and a description of its own", () => {
    const pages = [...checklists.values()].map(frontmatter);
    expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
    expect(new Set(pages.map((page) => page.description)).size).toBe(pages.length);
  });

  const { standard } = buildStandard({ root: process.cwd(), site: "https://opencomponents.dev", frameworks: FRAMEWORKS });
  const served = standard.pages.filter((page) => page.path.startsWith(docsPath(`${CHECKLISTS}/`)));

  it("serves every page on the MCP server as the same bytes as its /raw copy, and adds no rules", () => {
    expect(served.map((page) => page.path).sort()).toEqual([...checklists.keys()].map(docsPath).sort());
    for (const page of served) {
      const file = [...checklists.keys()].find((key) => docsPath(key) === page.path)!;
      const source = readFileSync(join(DOCS, file), "utf8");
      const { title, description, seo } = frontmatter(source);
      expect(page.raw).toBe(rawPage({ title: rawTitle({ stem: `docs/${file.replace(/\.md$/, "")}`, title, seo }), description }, source));
      expect(page.contract).toBeUndefined();
    }
    expect(standard.rules.filter((rule) => rule.url.includes(docsPath(`${CHECKLISTS}/`)))).toEqual([]);
  });

  it("holds every rule whose Basis names WCAG, WAI-ARIA or the APG, and no other", () => {
    const pages = [...checklists.values()].join("\n");
    const listed = [...pages.matchAll(/^\| \[`([a-z-]+\/[a-z0-9-]+)`\]/gm)].map((match) => match[1]);
    // The contracts read the same tables on their own, Basis included.
    const expected = standard.pages
      .filter((page) => page.contract?.kind === "component")
      .flatMap((page) => (parse(page.contract!.yaml).rules as Array<{ id: string; basis: string }>).filter((rule) => picked(rule.basis)))
      .map((rule) => rule.id);
    expect(expected.length).toBeGreaterThan(0);
    expect([...listed].sort()).toEqual([...expected].sort());
  });
});

describe("picked", () => {
  it.each([
    ["WCAG 1.4.3, 1.4.11 (AA)", true],
    ["Open Components, beyond WCAG 2.5.8 (AA)", true],
    ["APG", true],
    ["WAI-ARIA, Open Components", true],
    ["HTML, WCAG 3.3.2 (A)", true],
    ["HTML", false],
    ["Open Components", false],
    ["HTML, Open Components", false],
    ["Open Components, beyond HTML", false],
    ["ARIA in HTML", false],
  ])("decides %s is %s", (basis, expected) => {
    expect(picked(basis)).toBe(expected);
  });
});

describe("citedCriteria", () => {
  const cited = (basis: string) => citedCriteria(basis).map(({ number, level }) => `${number} ${level}`);

  it("gives each criterion the level after the last of its run", () => {
    expect(cited("WCAG 1.3.1, 3.3.2, 4.1.2 (A), 2.4.6 (AA)")).toEqual(["1.3.1 A", "3.3.2 A", "4.1.2 A", "2.4.6 AA"]);
    expect(cited("WCAG 2.4.7 (AA), 2.4.13 (AAA)")).toEqual(["2.4.7 AA", "2.4.13 AAA"]);
  });

  it("reads WCAG wherever it is in the Basis, and stops at what isn't a criterion", () => {
    expect(cited("Open Components, beyond WCAG 1.4.4, 1.4.12 (AA)")).toEqual(["1.4.4 AA", "1.4.12 AA"]);
    expect(cited("HTML, WCAG 3.3.2 (A)")).toEqual(["3.3.2 A"]);
    expect(cited("WCAG 4.1.2 (A), Open Components")).toEqual(["4.1.2 A"]);
    expect(cited("APG, Open Components, beyond WCAG 2.1.1, 4.1.2 (A)")).toEqual(["2.1.1 A", "4.1.2 A"]);
  });

  it("names each criterion once", () => {
    expect(cited("WCAG 4.1.2 (A), WCAG 4.1.2 (A)")).toEqual(["4.1.2 A"]);
  });

  it("finds none in a Basis without WCAG", () => {
    expect(cited("WAI-ARIA, APG")).toEqual([]);
  });

  it("names a criterion by its WCAG 2.2 name", () => {
    expect(citedCriteria("WCAG 1.4.3 (AA)")[0]).toEqual({ number: "1.4.3", ...WCAG.get("1.4.3") });
  });

  it.each([
    ["WCAG 4.1.1 (A)", /4\.1\.1, which isn't a WCAG 2.2 success criterion/],
    ["WCAG 9.9.9 (AA)", /9\.9\.9, which isn't/],
    ["WCAG 1.4.3 (A)", /gives WCAG 1\.4\.3 level A, but it's at level AA/],
    ["WCAG 1.4.3, 1.4.11", /cites WCAG 1\.4\.3, 1\.4\.11 without a level/],
    ["WCAG 1.4.3 (AA), 1.4.11, Open Components", /cites WCAG 1\.4\.11 without a level/],
  ])("throws on %s", (basis, message) => {
    expect(() => citedCriteria(basis)).toThrow(message);
  });
});

describe("layerRows", () => {
  const FILE = "3.components/widget/2.ux.md";

  it("picks the rows by their Basis, in the table's order, with a link to the table", () => {
    const { name, rows } = layerRows(
      FILE,
      layer("UX", [
        ["widget/one", "Must", "It has a name", "WCAG 4.1.2 (A)"],
        ["widget/two", "Should", "It uses arrow keys", "APG"],
        ["widget/three", "Must", "It's a native element", "HTML"],
        ["widget/four", "Should", "It stays put", "Open Components"],
        ["widget/five", "Must", "It's bigger", "Open Components, beyond WCAG 2.5.8 (AA)"],
      ]),
    )!;
    expect(name).toBe("UX");
    expect(rows.map((row) => [row.rule, row.level, row.basis, row.criteria.map((criterion) => criterion.number)])).toEqual([
      ["widget/one", "Must", "WCAG 4.1.2 (A)", ["4.1.2"]],
      ["widget/two", "Should", "APG", []],
      ["widget/five", "Must", "Open Components, beyond WCAG 2.5.8 (AA)", ["2.5.8"]],
    ]);
    expect(new Set(rows.map((row) => row.link))).toEqual(new Set(["/docs/components/widget/ux#ux-checklist"]));
  });

  it("links to the anchor the site gives the table's heading", () => {
    // A heading with the same text earlier on the page takes the plain anchor.
    const source = layer("UX", [["widget/one", "Must", "It has a name", "WCAG 4.1.2 (A)"]], "### UX Checklist", "");
    expect(layerRows(FILE, source)!.rows[0]!.link).toBe("/docs/components/widget/ux#ux-checklist-1");
  });

  it("keeps a pipe in a Requirement, and escapes it again on the page", () => {
    const { rows } = layerRows(FILE, layer("UX", [["widget/one", "Must", "It reads `a \\| b`", "WCAG 4.1.2 (A)"]]))!;
    expect(rows[0]!.requirement).toBe("It reads `a | b`");
    expect(checklistPage({ title: "Widget", path: "/docs/components/widget" }, [{ name: "UX", rows }])).toContain(
      "| It reads `a \\| b` |",
    );
  });

  it("gives none for a layer with no rows to pick, or no table", () => {
    expect(layerRows(FILE, layer("DX", [["widget/one", "Must", "It types", "Open Components"]]))).toBeUndefined();
    expect(layerRows(FILE, "---\ntitle: A\n---\n\n## Something\n\nText.\n")).toBeUndefined();
  });

  it("ignores a table heading inside code", () => {
    const source = layer("UX", [["widget/one", "Must", "It has a name", "WCAG 4.1.2 (A)"]], "```md", "## UI Checklist", "```", "");
    expect(layerRows(FILE, source)!.name).toBe("UX");
  });

  it("names the file of a Basis it can't read", () => {
    expect(() => layerRows(FILE, layer("UX", [["widget/one", "Must", "It has a name", "WCAG 4.1.2 (AA)"]]))).toThrow(
      /^3\.components\/widget\/2\.ux\.md: The Basis "WCAG 4\.1\.2 \(AA\)"/,
    );
  });

  it("names a column the table is missing", () => {
    const source = "## UX Checklist\n\n| Rule | Level | Requirement |\n| - | - | - |\n| `widget/one` | Must | It has a name |\n";
    expect(() => layerRows(FILE, source)).toThrow(/has no Basis column/);
  });

  it("names the file of a row with fewer cells than the header", () => {
    const source = "## UX Checklist\n\n| Rule | Level | Requirement | Basis |\n| - | - | - | - |\n| `widget/one` | Must |\n";
    expect(() => layerRows(FILE, source)).toThrow(
      "3.components/widget/2.ux.md: a row of the UX Checklist table has no Basis cell",
    );
  });
});

describe("checklistPage", () => {
  const COMPONENT = { title: "Widget", path: "/docs/components/widget" };
  const rows = (basis: string) => layerRows("3.components/widget/1.ui.md", layer("UI", [["widget/one", "Must", "It has contrast", basis]]))!;

  it("heads each layer with rows, and leaves out the rest", () => {
    const page = checklistPage(COMPONENT, [rows("WCAG 1.4.3 (AA)")]);
    expect(page.match(/^## .+$/gm)).toEqual(["## UI rules", "## Sources"]);
  });

  it("names, levels and links each criterion, and says None when there's none", () => {
    expect(checklistPage(COMPONENT, [rows("WCAG 1.4.3, 1.4.11 (AA)")])).toContain(
      "| [`widget/one`](/docs/components/widget/ui#ui-checklist) | Must | It has contrast | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.3, 1.4.11 (AA) |",
    );
    expect(checklistPage(COMPONENT, [rows("WAI-ARIA, APG")])).toContain("| It has contrast | None | WAI-ARIA, APG |");
  });

  it("lists WAI-ARIA and the APG under Sources only when a rule names them", () => {
    const sources = (basis: string) => checklistPage(COMPONENT, [rows(basis)]).split("## Sources")[1]!;
    expect(sources("WCAG 1.4.3 (AA)")).not.toMatch(/WAI-ARIA|APG/);
    expect(sources("WAI-ARIA, APG")).toMatch(/\(WAI-ARIA\) 1\.2[\s\S]*Authoring Practices Guide \(APG\)/);
  });
});

describe("brokenLinks", () => {
  const pages = new Map([
    ["/docs/components/widget", "---\ntitle: Widget\n---\n\n## Checklist\n"],
    // The table's heading isn't `## UX Checklist`, so a link to #ux-checklist lands nowhere.
    ["/docs/components/widget/ux", "---\ntitle: UX\n---\n\n## UX rules\n"],
  ]);

  it("finds a link to a section the page doesn't have, or a page that doesn't exist", () => {
    const page = [
      "[Widget](/docs/components/widget#checklist)",
      "[one](/docs/components/widget/ux#ux-checklist)",
      "[two](/docs/components/gadget#checklist)",
      "[out](https://www.w3.org/TR/WCAG22/)",
    ].join("\n");
    expect(brokenLinks(page, pages)).toEqual(["/docs/components/widget/ux#ux-checklist", "/docs/components/gadget#checklist"]);
  });
});
