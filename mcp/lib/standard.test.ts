// @vitest-environment node
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { parse } from "yaml";
import { FRAMEWORKS } from "../../app/data/frameworks";
import { buildContract } from "../../server/lib/contract";
import { docsPath, rawContract, rawPage } from "../../server/lib/raw";
import { SWITCHER, SWITCHER_END } from "./frameworks";
import { heading, scan } from "./markdown";
import { buildStandard } from "./standard";

const SITE = "https://opencomponents.dev";
const { standard, problems } = buildStandard({ root: process.cwd(), site: SITE, frameworks: FRAMEWORKS });

// Every docs page's source, by its path on the site.
const sources = new Map(
  readdirSync("content/docs", { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".md"))
    .map((file) => [docsPath(file), readFileSync(join("content/docs", file), "utf8")]),
);
const frontmatter = (source: string) => parse(source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)?.[1] ?? "") ?? {};
const pages = standard.pages.map((page) => [page.path, page] as const);

// The content gate. The MCP server is built from content/docs/ and app/reference/,
// and relies on their conventions: known checks, levels and scopes in every
// checklist, a Roadmap that ticks exactly the components that have shipped,
// framework switchers with known slots, and so on. Content that breaks one
// doesn't fail the build, which would hold back the site too: it's a problem the
// build logs (see buildStandard). This is what makes `pnpm test`, and CI, fail on it.
describe("The standard", () => {
  it("builds without problems", () => {
    expect(problems).toEqual([]);
  });

  it("has every docs page, each under a name of its own", () => {
    expect(standard.pages.map((page) => page.path).sort()).toEqual([...sources.keys()].sort());
    const keys = standard.pages.map((page) => page.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  // Nuxt Content would otherwise make them up from the page, and the server
  // from its path, so /raw and the server would disagree.
  it.each(pages)("%s sets its title and description", (path) => {
    const { title, description } = frontmatter(sources.get(path)!);
    expect(title).toEqual(expect.any(String));
    expect(description).toEqual(expect.any(String));
  });

  // Agents read the same page and contract whichever way they reach them.
  it.each(pages)("%s is the page /raw serves", (path, page) => {
    const source = sources.get(path)!;
    const { title, description } = frontmatter(source);
    expect(page.raw).toBe(rawPage({ title, description }, source));
  });

  it.each(pages.filter(([, page]) => page.contract))("%s's contract is the one /raw serves", (path, page) => {
    const { title } = frontmatter(sources.get(path)!);
    expect(page.contract!.yaml).toBe(rawContract({ title, path }, buildContract(sources.get(path)!)!, SITE));
    expect(page.contract!.url).toBe(`${SITE}/raw${path}.yaml`);
  });

  // What agent-markdown.ts doesn't turn into markdown would reach agents as it is.
  const LEFTOVERS = [
    // A block component, like ::button-anatomy, or its end, or a slot, like #react.
    /^\s*:{2,}|^#[a-z][\w-]*\s*$/,
    /:roadmap-check/,
    // An inline component, like :badge[New] or :icon{name="…"}.
    /(^|[\s(]):[a-z][\w-]*[{[]/,
    // A link's attributes, like {external=""}.
    /\{external|\]\([^)]*\)\{/,
    // A link to the site that isn't absolute.
    /\]\((\/|#)/,
  ];
  it.each(pages)("%s has no MDC syntax left outside code, and absolute links", (_, page) => {
    // Inline code is an example, as it is in a code block.
    const prose = scan(page.markdown)
      .filter((line) => !line.code)
      .map((line) => line.text.replace(/`[^`]*`/g, "``"));
    expect(prose.filter((line) => LEFTOVERS.some((pattern) => pattern.test(line)))).toEqual([]);
  });

  // Each switcher is closed before the next opens, with its slots inside it.
  it.each(pages)("%s's framework switchers are marked in pairs", (_, page) => {
    let open = false;
    for (const { text, code } of scan(page.markdown)) {
      if (code) continue;
      if (text.startsWith("<!-- framework: ")) expect(open).toBe(true);
      if (text === SWITCHER || text === SWITCHER_END) {
        expect(open).toBe(text === SWITCHER_END);
        open = !open;
      }
    }
    expect(open).toBe(false);
  });

  it.each(pages)("%s's headings cover their sections", (_, page) => {
    const lines = page.markdown.split("\n");
    for (const current of page.headings) {
      expect(heading(lines[current.start]!)).toEqual({ level: current.level, text: current.text });
      expect(current.start).toBeLessThan(current.end);
      expect(current.end).toBeLessThanOrEqual(lines.length);
      // Two sections are apart, or one holds the other, and its parents hold it.
      for (const other of page.headings) {
        const apart = other.end <= current.start || current.end <= other.start;
        const inside = other.start <= current.start && current.end <= other.end;
        const around = current.start <= other.start && other.end <= current.end;
        expect(apart || inside || around).toBe(true);
      }
      const parents = page.headings.filter((other) => other.level < current.level && other.start < current.start && current.end <= other.end);
      expect(parents.map((parent) => parent.text)).toEqual(current.trail);
    }
  });

  it("gives every rule its own ID", () => {
    const ids = standard.rules.map((rule) => rule.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  // A rule's URL is the table it's in, which list-rules and search-docs link to.
  it.each(standard.rules.map((rule) => [rule.id, rule] as const))("links %s to its table", (_, rule) => {
    const page = standard.pages.find((candidate) => candidate.key === rule.component)!;
    const [url, anchor] = rule.url.split("#");
    expect(url).toBe(`${SITE}${page.path}`);
    expect(page.headings.map((candidate) => candidate.anchor)).toContain(anchor);
  });

  it("has a contract for every component the Roadmap ticks, and only for those", () => {
    const roadmap = sources.get("/docs/getting-started/roadmap")!;
    const ticked = [...roadmap.matchAll(/^\| :roadmap-check\{shipped\} (?:\[([^\]]+)\]\([^)]*\)|([^|]+?))\s*\|/gm)].map(([, linked, plain]) =>
      (linked ?? plain)!.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    );
    const shipped = standard.pages.filter((page) => page.path.startsWith("/docs/components/") && page.contract).map((page) => page.key);
    expect(ticked.sort()).toEqual(shipped.sort());
    expect(
      standard.components
        .filter((component) => component.kind === "component" && component.status === "shipped")
        .map((component) => component.key)
        .sort(),
    ).toEqual(shipped.sort());
  });

  it("lists every component on the Roadmap, in its group", () => {
    const roadmap = sources.get("/docs/getting-started/roadmap")!;
    const rows = roadmap.match(/^\| :roadmap-check/gm) ?? [];
    const listed = standard.components.filter((component) => component.kind === "component");
    expect(listed).toHaveLength(rows.length);
    for (const component of listed) expect(component.group).toEqual(expect.any(String));
  });

  it.each(readdirSync("app/reference"))("serves app/reference/%s as it is, in the order its page shows it", (component) => {
    const reference = standard.references.find((candidate) => candidate.component === component)!;
    const dir = join("app/reference", component);
    expect(reference.files.map((file) => file.name).sort()).toEqual(readdirSync(dir).sort());
    for (const file of reference.files) expect(file.content).toBe(readFileSync(join(dir, file.name), "utf8"));

    const source = sources.get(standard.pages.find((page) => page.key === component)!.path)!;
    const start = source.indexOf("\n## Reference implementation\n");
    const end = source.indexOf("\n## ", start + 1);
    const section = source.slice(start, end === -1 ? undefined : end);
    const shown = [...section.matchAll(/^\s*```\w+ \[(.+?)\]$/gm)].map(([, name]) => name);
    expect(reference.files.map((file) => file.name)).toEqual(shown);
  });
});

// A repository of its own, which follows the conventions, for a change at a time
// that breaks one: the build reports it as a problem, rather than failing.
describe("buildStandard's problems", () => {
  const roots: string[] = [];
  afterAll(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })));

  const RULE = "| `widget/name` | Must | Component | It has a name | Review |";
  const component = (name: string, options: { rows?: string[]; table?: string; contract?: string; reference?: boolean } = {}) => {
    const { rows = [RULE], table = "### UI rules", contract = `component: ${name}`, reference = true } = options;
    return [
      "---",
      `title: ${name}`,
      `description: Does things.`,
      "---",
      "",
      `${name}s do things.`,
      "",
      "## Agentic Experience (AX)",
      "",
      "### Described",
      "",
      "```yaml",
      contract,
      "summary: Does things.",
      `rules: https://example.com/docs/components/${name.toLowerCase()}#checklist`,
      "```",
      "",
      ...(rows.length
        ? ["## Checklist", "", table, "", "| Rule | Level | Scope | Requirement | Check |", "| --- | --- | --- | --- | --- |", ...rows, ""]
        : []),
      ...(reference ? ["## Reference implementation", "", "It's in Vue.", "", `\`\`\`vue [${name}.vue]`, "<template />", "```"] : []),
    ].join("\n");
  };
  const roadmap = (...rows: string[]) =>
    [
      "---",
      "title: Roadmap",
      "description: What's next.",
      "---",
      "",
      "## Components",
      "",
      "### Actions",
      "",
      "| Component | What it's for |",
      "| --- | --- |",
      ...rows,
    ].join("\n");
  const WIDGET = "| :roadmap-check{shipped} [Widget](/docs/components/widget) | Doing things |";
  const GIZMO = "| :roadmap-check Gizmo | Doing more |";
  const guide = (...lines: string[]) => ["---", "title: Guide", "description: How to.", "---", "", ...lines].join("\n");

  const build = (changes: Record<string, string | undefined> = {}) => {
    const root = mkdtempSync(join(tmpdir(), "open-components-standard-"));
    roots.push(root);
    const files: Record<string, string | undefined> = {
      "public/schemas/contract.json": "{}",
      "content/docs/1.getting-started/.navigation.yml": "title: Getting Started\n",
      "content/docs/1.getting-started/1.roadmap.md": roadmap(WIDGET, GIZMO),
      "content/docs/2.components/1.widget.md": component("Widget"),
      "app/reference/widget/Widget.vue": "<template />\n",
      ...changes,
    };
    for (const [file, content] of Object.entries(files)) {
      if (content === undefined) continue;
      mkdirSync(dirname(join(root, file)), { recursive: true });
      writeFileSync(join(root, file), content);
    }
    return buildStandard({ root, site: "https://example.com", frameworks: FRAMEWORKS });
  };

  it("has none for a repository that follows the conventions", () => {
    const { standard, problems } = build();
    expect(problems).toEqual([]);
    expect(standard.pages.map(({ key, title }) => [key, title])).toEqual([
      ["roadmap", "Roadmap"],
      ["widget", "Widget"],
    ]);
    expect(standard.components.map(({ key, status, group }) => [key, status, group])).toEqual([
      ["widget", "shipped", "Actions"],
      ["gizmo", "planned", "Actions"],
    ]);
    expect(standard.rules).toEqual([
      {
        id: "widget/name",
        component: "widget",
        layer: "ui",
        level: "must",
        scope: "component",
        requirement: "It has a name",
        check: "Review",
        checks: ["review"],
        axe: [],
        automated: false,
        url: "https://example.com/docs/components/widget#ui-rules",
      },
    ]);
    expect(standard.references).toEqual([
      {
        component: "widget",
        framework: "vue",
        notes: "It's in Vue.",
        files: [{ name: "Widget.vue", lang: "vue", content: "<template />\n" }],
        url: "https://example.com/docs/components/widget#reference-implementation",
      },
    ]);
  });

  it.each<[string, Record<string, string | undefined>, (string | RegExp)[]]>([
    [
      "an unknown check",
      { "content/docs/2.components/1.widget.md": component("Widget", { rows: [RULE.replace("Review", "Vibes")] }) },
      [`widget/name: "Vibes" isn't a check the MCP server knows (see mcp/lib/rules.ts)`],
    ],
    [
      "a level other than must or should",
      { "content/docs/2.components/1.widget.md": component("Widget", { rows: [RULE.replace("Must", "May")] }) },
      ["widget/name: its level, may, isn't one of must, should"],
    ],
    [
      "an unknown scope",
      { "content/docs/2.components/1.widget.md": component("Widget", { rows: [RULE.replace("Component", "Everyone")] }) },
      ["widget/name: its scope, everyone, isn't one of component, usage, both"],
    ],
    [
      "an unknown layer",
      { "content/docs/2.components/1.widget.md": component("Widget", { table: "### QX rules" }) },
      ["widget/name: its layer, qx, isn't one of ui, ux, dx, ax"],
    ],
    [
      "two rules with one ID",
      { "content/docs/2.components/1.widget.md": component("Widget", { rows: [RULE, RULE.replace("Must", "Should")] }) },
      ["widget/name is the ID of more than one rule"],
    ],
    [
      "a contract without a checklist",
      { "content/docs/2.components/1.widget.md": component("Widget", { rows: [] }) },
      [`/docs/components/widget: the contract has no rules. Is the "rules:" line missing from its Described block?`],
    ],
    [
      // So the widget hasn't shipped either.
      "a contract that isn't YAML",
      { "content/docs/2.components/1.widget.md": component("Widget", { contract: "component: [Widget" }) },
      [/^\/docs\/components\/widget: its contract isn't valid YAML\. /, "The Roadmap ticks Widget as shipped, but there's no widget page with a contract"],
    ],
    [
      "a Roadmap tick without a page",
      { "content/docs/1.getting-started/1.roadmap.md": roadmap(WIDGET, "| :roadmap-check{shipped} Dialog | Asking |") },
      ["The Roadmap ticks Dialog as shipped, but there's no dialog page with a contract"],
    ],
    [
      "a shipped page the Roadmap doesn't tick",
      { "content/docs/1.getting-started/1.roadmap.md": roadmap(WIDGET.replace("{shipped}", ""), GIZMO) },
      ["The Roadmap doesn't tick Widget, but its page has shipped"],
    ],
    [
      "a shipped page that isn't on the Roadmap",
      { "content/docs/2.components/2.gadget.md": component("Gadget", { rows: [RULE.replace("widget/", "gadget/")], reference: false }) },
      ["Gadget has shipped, but it isn't on the Roadmap"],
    ],
    [
      "a reference implementation without a page",
      { "app/reference/dialog/Dialog.vue": "<template />\n" },
      [`app/reference/dialog: no docs page named dialog with a "Reference implementation" section`],
    ],
    [
      "a reference implementation its page doesn't show",
      { "content/docs/2.components/1.widget.md": component("Widget", { reference: false }) },
      [`app/reference/widget: no docs page named widget with a "Reference implementation" section`],
    ],
    [
      "a framework switcher with an unknown slot",
      { "content/docs/1.getting-started/2.guide.md": guide("::framework-switcher", "#react", "React", "#qwik", "Qwik", "::") },
      ["/docs/getting-started/guide: a framework switcher has a #qwik slot, which isn't one of react, vue, svelte, angular, solid, astro, vanilla"],
    ],
    [
      "a component that's never closed",
      { "content/docs/1.getting-started/2.guide.md": guide("::callout", "Text") },
      ["/docs/getting-started/guide: ::callout is never closed"],
    ],
    [
      "a heading inside a framework switcher",
      { "content/docs/1.getting-started/2.guide.md": guide("::framework-switcher", "#react", "### Hooks", "::") },
      [`/docs/getting-started/guide: a framework switcher has a heading in it, "### Hooks". Put it above the switcher.`],
    ],
    [
      // Its anchor wouldn't be MDC's, which slugs the heading's text without them.
      "headings with markup",
      {
        "content/docs/1.getting-started/2.guide.md": guide(
          "## Read the [pattern](/x)",
          "## Use _native_ elements",
          "## Press <kbd>Tab</kbd>",
          "## Loading :badge[New]",
        ),
      },
      ["Read the [pattern](https://example.com/x)", "Use _native_ elements", "Press <kbd>Tab</kbd>", "Loading :badge[New]"].map(
        (text) =>
          `/docs/getting-started/guide: the heading "${text}" has a link, HTML, emphasis or a component in it, so its anchor wouldn't match the site's. Keep headings to text and inline code.`,
      ),
    ],
    [
      // Which MDC slugs as these do.
      "nothing for headings with inline code, bold or underscores in words",
      {
        "content/docs/1.getting-started/2.guide.md": guide(
          "## The `<button>` element",
          "## Open it with `_blank`",
          "## Use `&nbsp;` here",
          "## The **bold** heading",
          "## snake_case names",
          "## Escaped \\_under\\_",
        ),
      },
      [],
    ],
  ])("reports %s", (_, changes, expected) => {
    const { problems } = build(changes);
    expect(problems).toEqual(expected.map((problem) => (typeof problem === "string" ? problem : expect.stringMatching(problem))));
  });
});
