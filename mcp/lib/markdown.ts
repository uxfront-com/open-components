import GithubSlugger from "github-slugger";

/**
 * Splits markdown into lines, marking the ones in fenced code blocks, where a line
 * can start with a `#` or a `::` without being a heading or a component. A fence
 * can be indented, as it is inside an `:::accordion-item`, and it closes on a line
 * of the same character, at least as long, with nothing else on it.
 */
export function scan(markdown: string): { text: string; code: boolean }[] {
  let fence: { char: string; length: number } | undefined;
  return markdown.split("\n").map((text) => {
    const marker = text.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (!fence) {
      if (marker) fence = { char: marker[1]![0]!, length: marker[1]!.length };
      return { text, code: !!marker };
    }
    if (marker && marker[1]![0] === fence.char && marker[1]!.length >= fence.length && !marker[2]!.trim()) {
      fence = undefined;
    }
    return { text, code: true };
  });
}

/** A heading's level and text, for a line outside code that is one. */
export function heading(line: string): { level: number; text: string } | undefined {
  const match = line.match(/^(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/);
  return match ? { level: match[1]!.length, text: match[2]!.replaceAll("`", "") } : undefined;
}

/**
 * Gives each heading the id the site gives it, which MDC builds with
 * github-slugger: duplicates on a page get `-1`, `-2` and so on, and ids can't
 * start or end with a dash, or start with a digit.
 */
export function anchors(): (text: string) => string {
  const slugger = new GithubSlugger();
  return (text) =>
    slugger
      .slug(text)
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .replace(/^(\d)/, "_$1");
}

/** The cells of a markdown table row, with escaped pipes (`\|`) unescaped. */
export function cells(row: string): string[] {
  return row
    .trim()
    .replace(/^\||\|$/g, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll("\\|", "|"));
}

/**
 * Keeps one blank line where there are several, like the ones a dropped MDC
 * component leaves behind, except in code.
 */
export function collapse(markdown: string): string {
  const lines = scan(markdown);
  return lines
    .filter(({ text, code }, i) => code || text.trim() || (i > 0 && lines[i - 1]!.text.trim()))
    .map(({ text }) => text)
    .join("\n")
    .trim();
}

/** Rough token count for a text: about 3.6 characters per token, for prose and code alike. */
export function tokens(text: string): number {
  return Math.ceil(text.length / 3.6);
}
