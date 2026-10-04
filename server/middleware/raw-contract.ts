import { buildContract } from "../lib/contract";
import { readDocsPage } from "../lib/docs";

/**
 * Serves `/raw/<path>.yaml`, the contract of a docs page that has one: its
 * "Described" block, with every rule from its checklist (see buildContract in
 * server/lib/contract.ts). It's read from the page's source file, like
 * `/raw/<path>.md`, and prerendered from the list in nuxt.config.ts, since
 * crawling doesn't reach it.
 *
 * Its first line names the schema it follows, public/schemas/contract.json, which
 * editors that use the YAML language server check it against.
 */
export default defineEventHandler(async (event) => {
  const match = event.path.match(/^\/raw(\/.+?)\.yaml$/);
  if (!match?.[1]) return;

  const docs = await readDocsPage(event, match[1]);
  const contract = docs && buildContract(docs.source);
  if (!docs || !contract) return;

  const { siteUrl } = useRuntimeConfig(event).public;
  setHeader(event, "Content-Type", "application/yaml; charset=utf-8");
  return [
    `# yaml-language-server: $schema=${siteUrl}/schemas/contract.json`,
    `# The ${docs.page.title} contract, with every rule from its checklist.`,
    `# The page explains why each one exists: ${siteUrl}/raw${match[1]}.md`,
    "",
    contract,
  ].join("\n");
});
