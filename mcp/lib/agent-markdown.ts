import { SWITCHER, SWITCHER_END, slot } from "./frameworks";
import { collapse, heading, scan } from "./markdown";

/**
 * Turns a docs page's markdown (without its frontmatter) into the page agents
 * read: its MDC components only mean something to the site, so it keeps what's
 * in them and drops the rest.
 *
 * - `::framework-switcher` blocks are marked, slot by slot, for renderFrameworks()
 *   (frameworks.ts) to keep every framework's examples or one's.
 * - An `:::accordion-item` keeps its label, in bold, as the question it answers,
 *   and a `:::tabs-item` as what its tab is for, like the client it sets up.
 * - Any other component, like `::button-variants-example`, `::code-collapse` or
 *   `::button-anatomy`, keeps its content: examples, code and lists.
 * - `:roadmap-check` becomes `[x]` once a component has shipped, `[ ]` before.
 * - Links to the site, like `/docs/…`, `/raw/…` or `#loading`, become absolute,
 *   and lose the site's `{external}`.
 *
 * It throws on what it can't read: a slot that isn't one of `frameworks`, a
 * heading inside a framework switcher (its section would end halfway through
 * the switcher, and only one framework's readers would see it), or a component
 * that's never closed. buildStandard() reports it as a problem, which
 * `nuxt build mcp` warns about and `pnpm test` fails on, and the page goes
 * without agent markdown.
 */
export function agentMarkdown(body: string, page: { site: string; path: string; frameworks: string[] }): string {
  const lines: string[] = [];
  // The components the line is in: a component's content is indented as far as
  // its opening line, like an `:::accordion-item` inside an `::accordion`.
  const open: { name: string; indent: number }[] = [];

  for (const { text, code } of scan(body)) {
    const indent = open.at(-1)?.indent ?? 0;
    const line = text.slice(Math.min(indent, text.length - text.trimStart().length));
    if (code) {
      lines.push(line);
      continue;
    }

    const start = text.match(/^(\s*):{2,}([a-z][\w-]*)\s*(\{.*\})?\s*$/);
    if (start) {
      const [, space, name, props] = start;
      open.push({ name: name!, indent: space!.length });
      if (name === "framework-switcher") lines.push(SWITCHER);
      const label = props?.match(/label=(?:"([^"]*)"|'([^']*)')/);
      if ((name === "accordion-item" || name === "tabs-item") && label) lines.push(`**${label[1] ?? label[2]}**`, "");
      continue;
    }
    if (/^\s*:{2,}\s*$/.test(text)) {
      if (open.pop()?.name === "framework-switcher") lines.push(SWITCHER_END);
      continue;
    }
    if (open.some((component) => component.name === "framework-switcher") && heading(line)) {
      throw new Error(`${page.path}: a framework switcher has a heading in it, "${line.trim()}". Put it above the switcher.`);
    }
    const framework = open.at(-1)?.name === "framework-switcher" && line.match(/^#([a-z][\w-]*)\s*$/)?.[1];
    if (framework) {
      if (!page.frameworks.includes(framework)) {
        throw new Error(`${page.path}: a framework switcher has a #${framework} slot, which isn't one of ${page.frameworks.join(", ")}`);
      }
      lines.push(slot(framework));
      continue;
    }

    lines.push(
      line
        .replace(/:roadmap-check\{shipped\}/g, "[x]")
        .replace(/:roadmap-check\b/g, "[ ]")
        .replace(/(\]\([^)\s]*\))\{external(?:=""|='')?\}/g, "$1")
        .replace(/\]\(#/g, `](${page.site}${page.path}#`)
        .replace(/\]\(\//g, `](${page.site}/`),
    );
  }
  if (open.length) throw new Error(`${page.path}: ::${open.at(-1)!.name} is never closed`);
  return collapse(lines.join("\n"));
}
