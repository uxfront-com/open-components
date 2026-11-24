// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FRAMEWORKS } from "../../app/data/frameworks";
import { agentMarkdown } from "../../mcp/lib/agent-markdown";
import { brokenLinks, COMPONENTS } from "./checklists";
import { docsPath, readPages } from "./raw";

// The components hub, content/docs/3.components/index.md, served at /docs/components,
// is written by hand, so its list is in the markdown that agents read through
// /raw/docs/components.md, llms-full.txt and the MCP server. Its cards keep every
// link in their content, since agents only get a component's content, not its
// props. These tests fail when a component ships without its card on the hub, when
// a card's links don't reach agents, or when the hub links to a page that isn't there.
const DOCS = "content/docs";
const HUB = join(COMPONENTS, "index.md");
const hub = readFileSync(join(DOCS, HUB), "utf8");
const SITE = "https://opencomponents.dev";

// The hub as the MCP server gives it to agents, with the site's links made absolute.
const markdown = agentMarkdown(hub.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ""), {
  site: SITE,
  path: docsPath(HUB),
  frameworks: FRAMEWORKS.map((framework) => framework.value),
});

// Every docs page the hub links to, as agents get it, by its path on the site,
// without its anchor.
const linked = new Set(
  [...markdown.matchAll(/\]\(https:\/\/opencomponents\.dev(\/docs\/[^)#\s]*)/g)].map((match) => match[1]!),
);

// Each component's folder, with the pages the hub links to: its Overview, then
// every page beside it, like its four layers.
const components = readdirSync(join(DOCS, COMPONENTS), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map(({ name }) => {
    const files = readdirSync(join(DOCS, COMPONENTS, name)).filter((file) => file.endsWith(".md"));
    const pages = ["index.md", ...files.filter((file) => file !== "index.md")].map((file) =>
      docsPath(join(COMPONENTS, name, file)),
    );
    return [name, pages] as const;
  });

// Every docs page's source by its path on the site, with a split page's parts
// under their own paths, as brokenLinks() reads them. It's read inside the tests,
// so a page that can't be read fails them rather than the whole file.
const docsPages = () =>
  new Map(
    readPages(DOCS).flatMap(({ file, source, parts }) => [
      [docsPath(file), source] as const,
      ...parts.map((part) => [docsPath(part), readFileSync(join(DOCS, part), "utf8")] as const),
    ]),
  );

describe("the components hub", () => {
  it("is the Components section's own page, at /docs/components", () => {
    expect(docsPath(HUB)).toBe("/docs/components");
    expect(components.length).toBeGreaterThan(0);
  });

  it("has no page beside it, which would become one of its parts", () => {
    const beside = readdirSync(join(DOCS, COMPONENTS)).filter((file) => file.endsWith(".md") && file !== "index.md");
    expect(beside).toEqual([]);
  });

  it.each(components)("links the %s's Overview and each of its pages", (name, paths) => {
    expect(paths.filter((path) => !linked.has(path)).map((path) => `${name}: ${path}`)).toEqual([]);
  });

  // A card's name, its sentence and its layers reach agents in that order, as one
  // entry, whatever the site does with them.
  it.each(components)("gives agents the %s's card as its name, its sentence and its layers", (name) => {
    const url = `${SITE}/docs/components/${name}`;
    const layers = ["UI", "UX", "DX", "AX"].map((layer) => `- [${layer}](${url}/${layer.toLowerCase()})`).join("\n");
    const card = new RegExp(`^\\[([^\\]]+)\\]\\(${escape(url)}\\)\\n\\nThe \\1 [^\\n]+\\.\\n\\n${escape(layers)}$`, "m");
    expect(markdown).toMatch(card);
  });

  it("links only to docs pages, and sections, that exist", () => {
    expect(brokenLinks(hub, docsPages())).toEqual([]);
  });
});

// A string as it reads, inside a regular expression.
function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\/]/g, String.raw`\$&`);
}
