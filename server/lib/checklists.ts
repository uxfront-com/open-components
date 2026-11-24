/**
 * The accessibility checklists, content/docs/4.accessibility/<component>-checklist.md,
 * one per component, served at /docs/accessibility/<component>-checklist. Each is
 * built from its component's Checklist tables, the `## UI Checklist` to
 * `## AX Checklist` on its layer pages, so it can't say anything they don't.
 * checklists.test.ts fails when a page in content/docs/4.accessibility/ isn't what
 * this builds, and `pnpm test -u server/lib/checklists.test.ts` writes them again.
 *
 * A checklist holds every rule whose Basis names WCAG, WAI-ARIA or the APG, on all
 * four layers, and names each WCAG 2.2 criterion the Basis cites, from wcag.ts. The
 * rules that rest only on HTML, or are Open Components' own, stay on the component's
 * pages: the Basis can't tell the accessibility ones among them from the rest.
 *
 * Like raw.ts, it doesn't use Nitro's auto-imports.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { anchors, cells, heading, scan } from "../../mcp/lib/markdown";
import { docsPath } from "./raw";
import { type Criterion, understandingUrl, WCAG, type WcagLevel } from "./wcag";

/** Where the checklists live in content/docs/, and where the components do. */
export const CHECKLISTS = "4.accessibility";
export const COMPONENTS = "3.components";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
// A layer page's rules table is under a heading like `## UX Checklist`.
const RULES = /^(\w+) Checklist$/;
// The rules a checklist holds: their Basis names one of these.
const PICKED = /\b(WCAG|WAI-ARIA|APG)\b/;
const COLUMNS = ["Rule", "Level", "Requirement", "Basis"] as const;

export interface ChecklistRow {
  /** The rule's ID, like `button/contrast`. */
  rule: string;
  level: string;
  requirement: string;
  basis: string;
  /** The WCAG 2.2 criteria its Basis cites, in the order it cites them. */
  criteria: (Criterion & { number: string })[];
  /** Its rules table on its layer page, like /docs/components/button/ui#ui-checklist. */
  link: string;
}

export interface ChecklistLayer {
  /** The layer's short name, like UI. */
  name: string;
  rows: ChecklistRow[];
}

/** Whether a rule with this Basis goes on the accessibility checklist. */
export function picked(basis: string): boolean {
  return PICKED.test(basis);
}

/**
 * The WCAG 2.2 criteria a Basis cites, with the level each is at. A Basis names
 * its criteria after `WCAG`, and gives their level after the last of each run, so
 * `WCAG 1.3.1, 3.3.2, 4.1.2 (A), 2.4.6 (AA)` is three criteria at A and one at AA.
 * It throws on a criterion that isn't in WCAG 2.2, a level that isn't the
 * criterion's, or a run with no level, so a slip in a new rule fails `pnpm test`
 * rather than reaching the page.
 */
export function citedCriteria(basis: string): (Criterion & { number: string })[] {
  const found: (Criterion & { number: string })[] = [];
  for (const match of basis.matchAll(/\bWCAG\s+/g)) {
    let rest = basis.slice(match.index + match[0].length);
    let pending: string[] = [];
    for (;;) {
      const next = rest.match(/^(\d+\.\d+\.\d+)(?:\s+\((A{1,3})\))?(?:,\s*|\s*$)/);
      if (!next) break;
      pending.push(next[1]!);
      rest = rest.slice(next[0].length);
      const level = next[2] as WcagLevel | undefined;
      if (!level) continue;
      for (const number of pending) {
        const criterion = WCAG[number];
        if (!criterion) throw new Error(`The Basis "${basis}" cites WCAG ${number}, which isn't a WCAG 2.2 success criterion`);
        if (criterion.level !== level) {
          throw new Error(`The Basis "${basis}" gives WCAG ${number} level ${level}, but it's at level ${criterion.level} in WCAG 2.2`);
        }
        if (!found.some((other) => other.number === number)) found.push({ number, ...criterion });
      }
      pending = [];
    }
    if (pending.length) throw new Error(`The Basis "${basis}" cites WCAG ${pending.join(", ")} without a level, like (A)`);
  }
  return found;
}

/**
 * The rules a layer page's table holds that go on the checklist, in the table's
 * order, with the link to the table. `file` is the page's file in content/docs/,
 * like 3.components/button/1.ui.md, and `source` its text. A page with no table,
 * or none of whose rules go on the checklist, gives none.
 */
export function layerRows(file: string, source: string): ChecklistLayer | undefined {
  const lines = scan(source.replace(FRONTMATTER, ""));
  const slug = anchors();
  let layer: { name: string; anchor: string; columns?: Record<(typeof COLUMNS)[number], number> } | undefined;
  const rows: ChecklistRow[] = [];
  for (const { text, code } of lines) {
    if (code) continue;
    const match = heading(text);
    if (match) {
      // Every heading gets its anchor, in order, as the site gives them.
      const anchor = slug(match.text);
      if (match.level !== 2) continue;
      if (layer) break;
      const rules = match.text.match(RULES);
      if (rules) layer = { name: rules[1]!, anchor };
      continue;
    }
    if (!layer || !text.startsWith("|")) continue;
    const row = cells(text);
    if (!layer.columns) {
      const columns = Object.fromEntries(COLUMNS.map((name) => [name, row.indexOf(name)]));
      const missing = COLUMNS.filter((name) => columns[name] === -1);
      if (missing.length) throw new Error(`${file}: the ${layer.name} Checklist table has no ${missing.join(", ")} column`);
      layer.columns = columns as Record<(typeof COLUMNS)[number], number>;
      continue;
    }
    // The line under the header row.
    if (row.every((cell) => /^:?-+:?$/.test(cell))) continue;
    const basis = row[layer.columns.Basis]!;
    if (!picked(basis)) continue;
    let criteria: ChecklistRow["criteria"];
    try {
      criteria = citedCriteria(basis);
    } catch (error) {
      throw new Error(`${file}: ${(error as Error).message}`);
    }
    rows.push({
      rule: row[layer.columns.Rule]!.replaceAll("`", ""),
      level: row[layer.columns.Level]!,
      requirement: row[layer.columns.Requirement]!,
      basis,
      criteria,
      link: `${docsPath(file)}#${layer.anchor}`,
    });
  }
  return layer && rows.length ? { name: layer.name, rows } : undefined;
}

/**
 * A component's accessibility checklist page, from its title, like "Checkbox Group",
 * the path of its Overview, like /docs/components/checkbox-group, and its layers'
 * rows, in layer order.
 */
export function checklistPage(component: { title: string; path: string }, layers: ChecklistLayer[]): string {
  const { title, path } = component;
  const rows = layers.flatMap((layer) => layer.rows);
  const cites = (pattern: RegExp) => rows.some((row) => pattern.test(row.basis));
  const sources = [
    `- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level`,
    `- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to`,
    ...(cites(/\bWAI-ARIA\b/) ? [`- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)`] : []),
    ...(cites(/\bAPG\b/) ? [`- [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)`] : []),
    ...(cites(/\bARIA in HTML\b/) ? [`- [ARIA in HTML](https://www.w3.org/TR/html-aria/)`] : []),
    `- [${title}](${path}), where each rule is explained, with the sources it draws on`,
  ];
  return [
    "---",
    `title: Accessible ${title} Checklist (WCAG)`,
    `description: Every ${title} rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.`,
    "navigation:",
    `  title: ${title}`,
    "---",
    "",
    `Here's every rule for the [${title}](${path}) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".`,
    "",
    `We build this list from the ${title}'s checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [${title}'s checklist](${path}#checklist).`,
    "",
    ...layers.flatMap((layer) => [
      `## ${layer.name} rules`,
      "",
      "| Rule | Level | Requirement | WCAG 2.2 | Basis |",
      "| ---- | ----- | ----------- | -------- | ----- |",
      ...layer.rows.map((row) =>
        [
          `[\`${row.rule}\`](${row.link})`,
          row.level,
          row.requirement,
          row.criteria.length
            ? row.criteria.map((criterion) => `[${criterion.number} ${criterion.name}](${understandingUrl(criterion)}) (${criterion.level})`).join(", ")
            : "None",
          row.basis,
        ]
          .map((cell) => cell.replaceAll("|", String.raw`\|`))
          .join(" | "),
      ).map((row) => `| ${row} |`),
      "",
    ]),
    "## Sources",
    "",
    ...sources,
    "",
  ].join("\n");
}

/**
 * Every component's checklist, by its file in content/docs/ (`docs`), like
 * 4.accessibility/button-checklist.md, built from the component's folder in
 * 3.components/: its Overview's title and its layer pages, 1.ui.md to 4.ax.md.
 */
export function readChecklists(docs: string): Map<string, string> {
  const pages = new Map<string, string>();
  const folders = readdirSync(join(docs, COMPONENTS), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const folder of folders) {
    const dir = join(COMPONENTS, folder);
    const index = readFileSync(join(docs, dir, "index.md"), "utf8");
    const { title } = (parse(index.match(FRONTMATTER)?.[1] ?? "") ?? {}) as { title?: unknown };
    if (typeof title !== "string") throw new Error(`${dir}/index.md has no title`);
    const layers = readdirSync(join(docs, dir))
      .filter((name) => /^\d+\..+\.md$/.test(name))
      .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
      .flatMap((name) => layerRows(join(dir, name), readFileSync(join(docs, dir, name), "utf8")) ?? []);
    pages.set(join(CHECKLISTS, `${folder}-checklist.md`), checklistPage({ title, path: docsPath(join(dir, "index.md")) }, layers));
  }
  return pages;
}

/**
 * The links in a page's markdown to a docs page that doesn't exist, or to a
 * section it doesn't have. `pages` holds every docs page's source by its path on
 * the site, a split page's parts each under their own, as the site serves them.
 */
export function brokenLinks(markdown: string, pages: Map<string, string>): string[] {
  const broken: string[] = [];
  for (const { text, code } of scan(markdown.replace(FRONTMATTER, ""))) {
    if (code) continue;
    for (const [, path, anchor] of text.matchAll(/\]\((\/docs\/[^)#\s]*)(?:#([^)\s]+))?\)/g)) {
      const source = pages.get(path!);
      if (source === undefined) {
        broken.push(`${path}${anchor ? `#${anchor}` : ""}`);
        continue;
      }
      if (anchor && !headingAnchors(source).includes(anchor)) broken.push(`${path}#${anchor}`);
    }
  }
  return broken;
}

// Every heading's anchor on a page, as the site gives them.
function headingAnchors(source: string): string[] {
  const slug = anchors();
  return scan(source.replace(FRONTMATTER, "")).flatMap(({ text, code }) => {
    const match = !code && heading(text);
    return match ? [slug(match.text)] : [];
  });
}
