/**
 * Builds a docs page's contract, which `/raw/<path>.yaml` serves: the YAML block
 * under the page's "Described" heading, with every rule from its checklist in
 * place of the `rules:` link. Agents can then read every requirement for a
 * component, or for the tokens, without the rest of the page. Returns undefined
 * for a page without a "Described" block.
 *
 * It doesn't use Nitro's auto-imports, since nuxt.config.ts also calls it, to list
 * the contracts to prerender.
 */
export function buildContract(markdown: string): string | undefined {
  const contract = section(markdown, "### Described")?.match(/^```yaml\n([\s\S]*?)^```$/m)?.[1];
  if (!contract) return;
  const rules = checklist(markdown);
  return rules.length ? contract.replace(/^rules: .*$/m, () => ["rules:", ...rules].join("\n")) : contract;
}

// The lines under a heading, up to the next heading of the same level or above,
// skipping code blocks, where a line can start with a # without being a heading.
function section(markdown: string, heading: string): string | undefined {
  const level = heading.indexOf(" ");
  const lines = markdown.split("\n");
  const start = lines.indexOf(heading);
  if (start === -1) return;

  let code = false;
  let end = start + 1;
  for (; end < lines.length; end++) {
    const line = lines[end] ?? "";
    if (line.startsWith("```")) code = !code;
    const hashes = line.match(/^(#+) /)?.[1]?.length;
    if (!code && hashes && hashes <= level) break;
  }
  return lines.slice(start + 1, end).join("\n");
}

// Every rule in the checklist's tables, as YAML list items. The tables are read by
// their header row, so a column like Scope or Basis only shows up on pages that have
// it, and a heading like "### UX rules" gives the rules below it their layer.
function checklist(markdown: string): string[] {
  const items: string[] = [];
  let layer: string | undefined;
  let columns: string[] | undefined;

  for (const line of section(markdown, "## Checklist")?.split("\n") ?? []) {
    layer = line.match(/^### (\w+) rules$/)?.[1] ?? layer;
    if (!line.startsWith("|")) {
      columns = undefined;
      continue;
    }
    const cells = line
      .slice(1, line.lastIndexOf("|"))
      .split(/(?<!\\)\|/)
      .map((cell) => cell.trim().replaceAll("\\|", "|"));
    if (!columns) {
      columns = cells.map((cell) => cell.toLowerCase());
      continue;
    }
    if (cells.every((cell) => /^:?-+:?$/.test(cell))) continue;

    const cell = (column: string) => cells[columns!.indexOf(column)];
    const scope = cell("scope");
    const basis = cell("basis");
    items.push(
      `  - id: ${cell("rule")?.replaceAll("`", "")}`,
      ...(layer ? [`    layer: ${layer.toLowerCase()}`] : []),
      `    level: ${cell("level")?.toLowerCase()}`,
      ...(scope ? [`    scope: ${scope.toLowerCase()}`] : []),
      // JSON strings are valid YAML, and these hold backticks, colons and quotes.
      `    requirement: ${JSON.stringify(cell("requirement"))}`,
      ...(basis ? [`    basis: ${JSON.stringify(basis)}`] : []),
      `    check: ${JSON.stringify(cell("check"))}`,
    );
  }
  return items;
}
