import { collapse } from "./markdown";
import type { Framework } from "./types";

// How agent-markdown.ts marks a `::framework-switcher` and its slots, each on a
// line of its own, so a reader can keep every framework's examples or one's.
export const SWITCHER = "<!-- framework-switcher -->";
export const SWITCHER_END = "<!-- /framework-switcher -->";
export const slot = (framework: string) => `<!-- framework: ${framework} -->`;
const SLOT = /^<!-- framework: (\S+) -->$/;

/**
 * Renders the framework switchers in agent markdown: each framework's examples
 * under its name, or only `framework`'s. Where an example doesn't come in it,
 * that example shows the first framework it has, with a note, as the site does.
 */
export function renderFrameworks(markdown: string, frameworks: Framework[], framework?: string): string {
  const label = (value: string) => frameworks.find((f) => f.value === value)?.label ?? value;
  const lines: string[] = [];
  let slots: Map<string, string[]> | undefined;
  let current: string[] | undefined;

  for (const line of markdown.split("\n")) {
    if (line === SWITCHER) {
      slots = new Map();
      current = undefined;
    } else if (slots && line === SWITCHER_END) {
      if (framework) {
        const shown = slots.has(framework) ? framework : [...slots.keys()][0];
        if (shown && shown !== framework) {
          lines.push(`_This example doesn't come in ${label(framework)}, so here it is in ${label(shown)}._`, "");
        }
        lines.push(...trim(slots.get(shown!) ?? []));
      } else {
        for (const [value, code] of slots) lines.push(`**${label(value)}**`, "", ...trim(code), "");
      }
      slots = undefined;
    } else if (slots) {
      const match = line.match(SLOT);
      if (match) slots.set(match[1]!, (current = []));
      else current?.push(line);
    } else {
      lines.push(line);
    }
  }
  return collapse(lines.join("\n"));
}

// Drops the blank lines around a slot's code.
function trim(lines: string[]): string[] {
  let start = 0;
  let end = lines.length;
  while (start < end && !lines[start]!.trim()) start++;
  while (end > start && !lines[end - 1]!.trim()) end--;
  return lines.slice(start, end);
}
