/**
 * What `/raw/<path>.md` and `/raw/<path>.yaml` serve for a docs page, from its
 * source file. The middlewares in server/middleware/ serve them on the site, and
 * the MCP server (mcp/) returns the same text, so agents read the same page
 * whichever way they reach it.
 *
 * Like contract.ts, it doesn't use Nitro's auto-imports: nuxt.config.ts and the
 * MCP server's build import it too.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { parseDocument } from "yaml";
import { anchors, heading, scan } from "../../mcp/lib/markdown";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

/**
 * The path a docs page is served at, from its file in content/docs/, without the
 * numbers that order the sidebar: 1.getting-started/2.roadmap.md is served at
 * /docs/getting-started/roadmap.
 */
export function docsPath(file: string): string {
  return `/docs/${file
    .replace(/\.md$/, "")
    .replace(/(^|\/)\d+\./g, "$1")
    .replace(/\/index$/, "")}`;
}

/** `/raw/<path>.md`: the title and description, then the page without its frontmatter. */
export function rawPage(page: { title: string; description: string }, source: string): string {
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
  return `# ${page.title}\n\n> ${page.description}\n\n${body}\n`;
}

/**
 * `/raw/<path>.yaml`: the page's contract (see buildContract in contract.ts),
 * under a first line naming the schema it follows, public/schemas/contract.json,
 * which editors that use the YAML language server check it against.
 */
export function rawContract(page: { title: string; path: string }, contract: string, siteUrl: string): string {
  return [
    `# yaml-language-server: $schema=${siteUrl}/schemas/contract.json`,
    `# The ${page.title} contract, with every rule from its checklist.`,
    `# The page explains why each one exists: ${siteUrl}/raw${page.path}.md`,
    "",
    contract,
  ].join("\n");
}

/**
 * A page split into parts, like the Button's, is a folder: its index.md is the
 * Overview, and every other page in it is a part, with a page of its own on the
 * site (content/docs/3.components/button/2.ux.md is /docs/components/button/ux).
 * Agents still read it as one page: joinPage() puts the parts back where they came
 * from, for /raw, the contract and the MCP server.
 *
 * Each part's title is the heading it had on the whole page, and `before` in its
 * frontmatter names the Overview's section it goes before, like `Checklist`. Its
 * headings sit one level higher than they did, since its title is the part's page
 * heading, so joining moves them down again. Parts with the same `before` go in
 * file order.
 */
export function joinPage(index: string, parts: string[]): string {
  const blocks = new Map<string, string[]>();
  for (const source of parts) {
    const { title, before, body } = readPart(source);
    const lowered = scan(body)
      .map(({ text, code }) => (!code && heading(text) ? `#${text}` : text))
      .join("\n");
    blocks.set(before, [...(blocks.get(before) ?? []), `## ${title}\n\n${lowered}\n\n`]);
  }

  const joined = scan(index).map(({ text, code }) => {
    const match = !code && heading(text);
    const before = match && match.level === 2 && blocks.get(match.text);
    if (!before) return text;
    blocks.delete(match.text);
    return `${before.join("")}${text}`;
  });
  if (blocks.size) throw new Error(`A split page has no section named ${[...blocks.keys()].join(", ")} for its parts to go before`);
  return joined.join("\n");
}

/**
 * Where each section of a split page went, by its anchor on the whole page: `loading`
 * to `/docs/components/button/ux#loading`, and a part's own section, like
 * `user-experience-ux`, to the top of the part's page. Links to the whole page, like
 * /docs/components/button#loading, still land on the Overview, so
 * app/middleware/split-pages.global.ts sends them on from this map.
 */
export function splitAnchors(parts: { path: string; source: string }[]): Record<string, string> {
  return Object.fromEntries(
    parts.flatMap(({ path, source }) => {
      const { title, body } = readPart(source);
      const slug = anchors();
      const headings = scan(body).flatMap(({ text, code }) => {
        const match = !code && heading(text);
        return match ? [slug(match.text)] : [];
      });
      return [[anchors()(title), path], ...headings.map((anchor) => [anchor, `${path}#${anchor}`])];
    }),
  );
}

// A part's title, the section it goes before and its body, from its source.
function readPart(source: string): { title: string; before: string; body: string } {
  // Read the way Nuxt Content reads it, which builds past a YAML slip.
  const { title, before } = (parseDocument(source.match(FRONTMATTER)?.[1] ?? "").toJSON() ?? {}) as { title?: unknown; before?: unknown };
  if (typeof title !== "string" || typeof before !== "string") {
    throw new Error(`A part of a split page needs a title and the section it goes before: ${source.slice(0, 200)}`);
  }
  return { title, before, body: source.replace(FRONTMATTER, "").trim() };
}

/**
 * A docs page's source, from its file in `dir` (content/docs): a split page's
 * index.md comes joined with its parts (see joinPage).
 */
export function readPage(dir: string, file: string): string {
  const source = readFileSync(join(dir, file), "utf8");
  const parts = partsOf(dir, file);
  return parts.length ? joinPage(source, parts.map((part) => readFileSync(join(dir, part), "utf8"))) : source;
}

/**
 * Every docs page in `dir` (content/docs), by its file, in the order the sidebar
 * lists them. The parts of a split page aren't pages of their own here: their
 * index.md stands for the whole page, and lists their files in `parts`.
 */
export function readPages(dir: string): { file: string; source: string; parts: string[] }[] {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".md") && !isPart(dir, file))
    .sort(byNumber)
    .map((file) => ({ file, source: readPage(dir, file), parts: partsOf(dir, file) }));
}

/**
 * Where the sections of every split page in `dir` (content/docs) went, by the
 * page's path (see splitAnchors): `/docs/components/button` → `loading` →
 * `/docs/components/button/ux#loading`.
 */
export function readSplitAnchors(dir: string): Record<string, Record<string, string>> {
  return Object.fromEntries(
    readPages(dir)
      .filter(({ parts }) => parts.length)
      .map(({ file, parts }) => [
        docsPath(file),
        splitAnchors(parts.map((part) => ({ path: docsPath(part), source: readFileSync(join(dir, part), "utf8") }))),
      ]),
  );
}

/** Whether a file in `dir` is a part of a split page, next to its index.md. */
export function isPart(dir: string, file: string): boolean {
  return basename(file) !== "index.md" && existsSync(join(dir, dirname(file), "index.md"));
}

// The files of an index.md's parts, in file order, or none for any other page.
function partsOf(dir: string, file: string): string[] {
  if (basename(file) !== "index.md") return [];
  const folder = dirname(file);
  return readdirSync(join(dir, folder))
    .filter((name) => name.endsWith(".md") && name !== "index.md")
    .sort(byNumber)
    .map((name) => join(folder, name));
}

// File names in the order the sidebar lists them: 2.ux.md before 10.faq.md.
function byNumber(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true });
}
