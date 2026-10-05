import { renderFrameworks } from "./frameworks";
import { anchors } from "./markdown";
import type { Heading, Page, Standard } from "./types";

/**
 * How long a page can be, in tokens, before get-page returns its outline
 * instead: about a third of what Claude Code shows of a tool's result by
 * default, so a page leaves room for the rest of the conversation. The Button's
 * page is about 35,000 tokens, or 23,000 with one framework's examples.
 */
export const PAGE_LIMIT = 8000;

/**
 * How long any reply can be, in characters, before get-page returns an outline
 * instead: under what MCP clients pass on whole by default, like Gemini CLI's
 * 40,000 characters and Codex's 48,000 bytes. Longer replies get cut short.
 */
export const REPLY_LIMIT = 36000;

/**
 * Finds a page from what an agent might call it: its path (`/docs/components/button`),
 * its URL or `/raw` file, its name (`button`), its title (`Design Tokens`), or its
 * contract's name (`Button`, `token-paths`) or rule prefix (`tokens`).
 */
export function findPage(standard: Standard, name: string): Page | undefined {
  const path = name
    .trim()
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/raw(?=\/)/, "")
    .replace(/[#?].*$/, "")
    .replace(/\.(md|yaml)$/, "")
    .replace(/\/$/, "")
    .toLowerCase();
  return standard.pages.find(
    (page) =>
      page.path === path ||
      page.path === `/docs/${path}` ||
      page.key === path ||
      page.title.toLowerCase() === path ||
      page.contract?.name.toLowerCase() === path ||
      standard.rules.some((rule) => rule.component === page.key && rule.id.startsWith(`${path}/`)),
  );
}

/**
 * The headings a list of section names point at, and the names it can't find. A
 * name can be a heading's text or its anchor, in any case and with or without
 * its punctuation, like "Button or link" or "#button-or-link", and it can name
 * the headings above it, as in "Every state > Loading", or as search-docs writes
 * a trail, "Button › User Experience (UX) › Every state". Failing that, it can be
 * looser: a heading without its abbreviation, like "Developer Experience", or by
 * it, like "DX", in US spelling, like "Colors", or singular, like "Toggle button".
 * The page's own title names its introduction, before its first heading.
 */
export function findSections(page: Page, names: string[]): { found: Heading[]; missing: string[] } {
  const found: Heading[] = [];
  const missing: string[] = [];
  const slug = (text: string) => anchors()(text);
  // Every way a heading can be named loosely: its text without "(DX)", and "DX".
  const loose = (text: string) => {
    const short = text.replace(/\s*\(([^)]*)\)$/, "");
    const abbreviation = text.match(/\(([^)]*)\)$/)?.[1];
    return [short, ...(abbreviation ? [abbreviation] : [])].map(plain);
  };
  const plain = (text: string) =>
    slug(text.toLowerCase().replaceAll("colour", "color"))
      .split("-")
      .map((word) => (word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word))
      .join("-");
  const strict = (heading: { text: string; anchor?: string }, name: string) =>
    heading.anchor === name || heading.text.toLowerCase() === name || slug(heading.text) === slug(name);
  const sloppy = (heading: { text: string; anchor?: string }, name: string) =>
    strict(heading, name) || loose(heading.text).includes(plain(name));

  for (const name of names) {
    const parts = name
      .split(/\s*[>›]\s*/)
      // Names copied from get-page's outline, like "Loading (#loading)", too.
      .map((part) => part.trim().replace(/\s*\(#[^)]*\)$/, "").replace(/^#/, "").replaceAll("`", "").toLowerCase())
      .filter(Boolean);
    // A trail from search-docs starts with the page's title, which isn't a heading.
    if (parts.length > 1 && parts[0] === page.title.toLowerCase()) parts.shift();
    const last = parts.pop() ?? "";
    const within = (candidate: Heading, matches: typeof strict) =>
      matches(candidate, last) && parts.every((part) => candidate.trail.some((parent) => matches({ text: parent }, part)));
    const heading =
      page.headings.find((candidate) => within(candidate, strict)) ??
      page.headings.find((candidate) => within(candidate, sloppy)) ??
      (!parts.length && last === page.title.toLowerCase() ? introduction(page) : undefined);
    if (heading) found.push(heading);
    else missing.push(name);
  }
  // In page order, without the ones inside another section asked for.
  const sections = [...new Set(found)].sort((a, b) => a.start - b.start);
  return {
    found: sections.filter((heading) => !sections.some((other) => other !== heading && other.start <= heading.start && heading.end <= other.end)),
    missing,
  };
}

/** A page's introduction, before its first heading, as if it were a section under the page's title. */
function introduction(page: Page): Heading {
  const end = page.headings[0]?.start ?? page.markdown.split("\n").length;
  return { level: 1, text: page.title, anchor: "", trail: [], start: 0, end, tokens: 0, tokensOneFramework: 0 };
}

/** The lines of a page's markdown under a heading, sub-sections included, with its frameworks rendered. */
export function sectionText(standard: Standard, page: Page, heading: Heading, framework?: string): string {
  const lines = page.markdown.split("\n").slice(heading.start, heading.end);
  return renderFrameworks(lines.join("\n"), standard.frameworks, framework);
}

/** The whole page, with its frameworks rendered. */
export function pageText(standard: Standard, page: Page, framework?: string): string {
  return renderFrameworks(page.markdown, standard.frameworks, framework);
}

/** A page's headings as a nested list, each with its anchor and rough length. */
export function outline(page: Page, headings = page.headings): string {
  const top = Math.min(...headings.map((heading) => heading.level));
  return headings
    .map((heading) => {
      const both = heading.tokens === heading.tokensOneFramework;
      const size = both ? `~${count(heading.tokens)}` : `~${count(heading.tokens)}, ~${count(heading.tokensOneFramework)} with one framework`;
      return `${"  ".repeat(heading.level - top)}- ${heading.text} (#${heading.anchor}) ${size}`;
    })
    .join("\n");
}

/** A token count, rounded, as in 350 or 8.7k. */
export function count(value: number): string {
  return value < 1000 ? `${Math.round(value / 10) * 10}` : `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

