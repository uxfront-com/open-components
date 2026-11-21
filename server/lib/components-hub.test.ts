// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { brokenLinks, COMPONENTS } from "./checklists";
import { docsPath, readPages } from "./raw";

// The components hub, content/docs/3.components/index.md, served at /docs/components,
// is written by hand, so its list is in the markdown that agents read through
// /raw/docs/components.md, llms-full.txt and the MCP server. These tests fail when
// a component ships without its line on the hub, or when the hub links to a page
// that isn't there.
const DOCS = "content/docs";
const HUB = join(COMPONENTS, "index.md");
const hub = readFileSync(join(DOCS, HUB), "utf8");

// Every docs page the hub links to, by its path on the site, without its anchor.
const linked = new Set([...hub.matchAll(/\]\((\/docs\/[^)#\s]*)/g)].map((match) => match[1]!));

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

  it("links only to docs pages, and sections, that exist", () => {
    expect(brokenLinks(hub, docsPages())).toEqual([]);
  });
});
