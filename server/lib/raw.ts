/**
 * What `/raw/<path>.md` and `/raw/<path>.yaml` serve for a docs page, from its
 * source file. The middlewares in server/middleware/ serve them on the site, and
 * the MCP server (mcp/) returns the same text, so agents read the same page
 * whichever way they reach it.
 *
 * Like contract.ts, it doesn't use Nitro's auto-imports: nuxt.config.ts and the
 * MCP server's build import it too.
 */

/**
 * The path a docs page is served at, from its file in content/docs/, without the
 * numbers that order the sidebar: 3.components/1.button.md is served at
 * /docs/components/button.
 */
export function docsPath(file: string): string {
  return `/docs/${file.replace(/\.md$/, "").replace(/(^|\/)\d+\./g, "$1")}`;
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
