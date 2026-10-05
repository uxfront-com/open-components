import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { parse, parseDocument } from "yaml";
import { buildContract } from "../../server/lib/contract";
import { docsPath, rawContract, rawPage } from "../../server/lib/raw";
import { agentMarkdown } from "./agent-markdown";
import { renderFrameworks } from "./frameworks";
import { anchors, cells, heading, scan, tokens } from "./markdown";
import { AUTOMATED_CHECKS, LAYERS, LEVELS, parseChecks, SCOPES } from "./rules";
import type { Component, Framework, Heading, Page, Reference, Rule, Standard } from "./types";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

/**
 * Reads the standard from the repository at `root`, when the MCP server is
 * built: the docs pages in content/docs/, their contracts and checklists, the
 * Roadmap's components, the reference implementations in app/reference/ and the
 * contract schema in public/schemas/.
 *
 * Content that doesn't follow the conventions the server relies on, like a
 * checklist with an unknown check, ends up in `problems` rather than failing the
 * build, which would hold back the site too. `pnpm test` fails on any of them
 * (standard.test.ts).
 */
export function buildStandard(options: { root: string; site: string; frameworks: Framework[] }): {
  standard: Standard;
  problems: string[];
} {
  const { root, site, frameworks } = options;
  const problems: string[] = [];
  const docs = join(root, "content/docs");

  const files = readdirSync(docs, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

  const sources = new Map<string, string>();
  const contracts = new Map<string, { rules?: unknown }>();
  const pages = files.map((file): Page => {
    const source = readFileSync(join(docs, file), "utf8");
    const path = docsPath(file);
    // Read the way Nuxt Content reads it, which builds past a YAML slip.
    const frontmatter = parseDocument(source.match(FRONTMATTER)?.[1] ?? "");
    for (const error of frontmatter.errors) problems.push(`${path}: its frontmatter isn't valid YAML. ${error.message}`);
    const front = (frontmatter.toJSON() ?? {}) as { title?: unknown; description?: unknown };
    const title = typeof front.title === "string" ? front.title : path.split("/").pop()!;
    const description = typeof front.description === "string" ? front.description : "";
    if (title !== front.title || description !== front.description) {
      problems.push(`${path}: its frontmatter needs a title and a description, which /raw/${path.slice(1)}.md starts with`);
    }
    sources.set(path, source);

    let markdown = "";
    try {
      markdown = agentMarkdown(source.replace(FRONTMATTER, ""), {
        site,
        path,
        frameworks: frameworks.map((framework) => framework.value),
      });
    } catch (error) {
      problems.push((error as Error).message);
    }

    const page: Page = {
      key: path.split("/").pop()!,
      path,
      title,
      description,
      raw: rawPage({ title, description }, source),
      markdown,
      headings: headings(markdown, frameworks),
      frameworks: frameworks
        .map((framework) => framework.value)
        .filter((value) => markdown.includes(`<!-- framework: ${value} -->`)),
    };
    // MDC gives a heading its id from its text without markup, while ours keeps it,
    // so headings stay plain text. Inline code is fine: both read it as written.
    const lines = markdown.split("\n");
    for (const { text, start } of page.headings) {
      const plain = lines[start]!.replace(/^#+\s+/, "").replace(/(`+)[\s\S]*?\1/g, "");
      if (/\[[^\]]*\]\(|<\/?[a-z]|&[a-z0-9#]+;|(^|[^\w\\])_{1,2}[^\s_]|\{#|(^|\s):[a-z][\w-]*[[{]/i.test(plain)) {
        problems.push(
          `${path}: the heading "${text}" has a link, HTML, emphasis or a component in it, so its anchor wouldn't match the site's. Keep headings to text and inline code.`,
        );
      }
    }

    const contract = buildContract(source);
    let data: { component?: string; convention?: string; summary?: string; rules?: unknown } | undefined;
    try {
      data = contract ? (parse(contract) ?? {}) : undefined;
    } catch (error) {
      problems.push(`${path}: its contract isn't valid YAML. ${(error as Error).message}`);
    }
    if (contract && data) {
      contracts.set(path, data);
      page.contract = {
        kind: data.component ? "component" : "convention",
        name: data.component ?? data.convention ?? title,
        yaml: rawContract({ title, path }, contract, site),
        url: `${site}/raw${path}.yaml`,
        summary: data.summary,
      };
    }
    return page;
  });

  const rules = pages.flatMap((page) => {
    const contract = contracts.get(page.path);
    if (!contract) return [];
    if (!Array.isArray(contract.rules)) {
      problems.push(`${page.path}: the contract has no rules. Is the "rules:" line missing from its Described block?`);
      return [];
    }
    return contract.rules.map((rule) => toRule(rule, page, site, problems));
  });

  const references = readReferences(root, pages, site, problems);
  const standard: Standard = {
    site,
    frameworks: frameworks.map(({ value, label }) => ({ value, label })),
    pages,
    components: components(pages, rules, references, sources, site, problems),
    rules,
    references,
    schema: readFileSync(join(root, "public/schemas/contract.json"), "utf8"),
  };

  const ids = new Set<string>();
  for (const rule of rules) {
    if (ids.has(rule.id)) problems.push(`${rule.id} is the ID of more than one rule`);
    ids.add(rule.id);
  }
  return { standard, problems };
}

// Every heading of a page, with the lines it covers, sub-sections included.
function headings(markdown: string, frameworks: Framework[]): Heading[] {
  const lines = scan(markdown);
  const slug = anchors();
  const found = lines.flatMap(({ text, code }, start) => {
    const match = !code && heading(text);
    return match ? [{ ...match, anchor: slug(match.text), start }] : [];
  });

  const trail: { level: number; text: string }[] = [];
  return found.map((current, i) => {
    while (trail.length && trail.at(-1)!.level >= current.level) trail.pop();
    const next = found.slice(i + 1).find((other) => other.level <= current.level);
    const end = next?.start ?? lines.length;
    const text = lines
      .slice(current.start, end)
      .map((line) => line.text)
      .join("\n");
    const result: Heading = {
      ...current,
      trail: trail.map((parent) => parent.text),
      end,
      tokens: tokens(renderFrameworks(text, frameworks)),
      tokensOneFramework: tokens(renderFrameworks(text, frameworks, frameworks[0]?.value)),
    };
    trail.push(current);
    return result;
  });
}

// Whether a checklist's value is one of the values a rule's field can take.
const oneOf = <T extends string>(values: readonly T[], value?: string): value is T => values.includes(value as T);

function toRule(data: Record<string, string>, page: Page, site: string, problems: string[]): Rule {
  const { id = "", layer, level, scope, requirement = "", check = "" } = data;
  if (!oneOf(LEVELS, level)) problems.push(`${id}: its level, ${level}, isn't one of ${LEVELS.join(", ")}`);
  if (scope && !oneOf(SCOPES, scope)) problems.push(`${id}: its scope, ${scope}, isn't one of ${SCOPES.join(", ")}`);
  if (layer && !oneOf(LAYERS, layer)) problems.push(`${id}: its layer, ${layer}, isn't one of ${LAYERS.join(", ")}`);

  const { checks, axe, unknown } = parseChecks(check);
  for (const value of unknown) problems.push(`${id}: "${value}" isn't a check the MCP server knows (see mcp/lib/rules.ts)`);

  // The table it's in, like "### UX rules", or the checklist when it has one table.
  const table =
    page.headings.find((heading) => layer && heading.text.toLowerCase() === `${layer} rules`) ??
    page.headings.find((heading) => heading.text === "Checklist");
  return {
    id,
    component: page.key,
    ...(layer && { layer: layer as Rule["layer"] }),
    level: level as Rule["level"],
    ...(scope && { scope: scope as Rule["scope"] }),
    requirement,
    check,
    checks,
    axe,
    // Only when a tool checks every part of it: a person checks the rest.
    automated: checks.length > 0 && checks.every((kind) => AUTOMATED_CHECKS.includes(kind)),
    url: `${site}${page.path}${table ? `#${table.anchor}` : ""}`,
  };
}

const LANGUAGES: Record<string, string> = { ".vue": "vue", ".ts": "ts", ".tsx": "tsx", ".js": "js", ".css": "css" };

// The reference implementations in app/reference/<component>/, each in the order
// its page shows the files, with what the page says about them.
function readReferences(root: string, pages: Page[], site: string, problems: string[]): Reference[] {
  const dir = join(root, "app/reference");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((component): Reference[] => {
    if (component.startsWith(".")) return [];
    const page = pages.find((candidate) => candidate.key === component);
    const section = page?.headings.find((heading) => heading.text === "Reference implementation");
    if (!page || !section) {
      problems.push(`app/reference/${component}: no docs page named ${component} with a "Reference implementation" section`);
      return [];
    }
    const lines = page.markdown.split("\n").slice(section.start + 1, section.end);
    const shown = lines.flatMap((line) => line.match(/^```\w+ \[(.+?)\]$/)?.[1] ?? []);
    const order = (name: string) => (shown.includes(name) ? shown.indexOf(name) : shown.length);
    const files = readdirSync(join(dir, component))
      // Not the files a system leaves behind, like .DS_Store.
      .filter((name) => !name.startsWith("."))
      .sort((a, b) => order(a) - order(b) || a.localeCompare(b))
      .map((name) => ({
        name,
        lang: LANGUAGES[extname(name)] ?? extname(name).slice(1),
        content: readFileSync(join(dir, component, name), "utf8"),
      }));
    const code = lines.findIndex((line) => line.startsWith("```"));
    return [
      {
        component,
        // The reference implementations are in Vue for now (see the Introduction).
        framework: files.some((file) => file.name.endsWith(".vue")) ? "vue" : "vanilla",
        notes: lines
          .slice(0, code === -1 ? undefined : code)
          .join("\n")
          .trim(),
        files,
        url: `${site}${page.path}#${section.anchor}`,
      },
    ];
  });
}

// What the standard covers: every page with a contract, a component or a
// foundation, and every component on the Roadmap, shipped or planned.
function components(
  pages: Page[],
  rules: Rule[],
  references: Reference[],
  sources: Map<string, string>,
  site: string,
  problems: string[],
): Component[] {
  const shipped = pages.flatMap((page): Component[] => {
    if (!page.contract) return [];
    const own = rules.filter((rule) => rule.component === page.key);
    const reference = references.find((candidate) => candidate.component === page.key);
    return [
      {
        key: page.key,
        title: page.title,
        kind: page.path.startsWith("/docs/components/") ? "component" : "foundation",
        status: "shipped",
        summary: page.contract.summary ?? page.description,
        url: `${site}${page.path}`,
        contractUrl: page.contract.url,
        rules: {
          total: own.length,
          must: own.filter((rule) => rule.level === "must").length,
          should: own.filter((rule) => rule.level === "should").length,
        },
        ...(reference && { reference: reference.files.map((file) => file.name) }),
      },
    ];
  });

  const roadmap = pages.find((page) => page.key === "roadmap");
  const planned: Component[] = [];
  if (!roadmap) return shipped;

  // The Roadmap's "## Components" section: a table per group, under a "### <group>"
  // heading, with a row per component, as in
  // | :roadmap-check{shipped} [Button](/docs/components/button) | What it's for |
  let group: string | undefined;
  let within = false;
  for (const { text, code } of scan(sources.get(roadmap.path)!.replace(FRONTMATTER, ""))) {
    const match = !code && heading(text);
    if (match && match.level <= 2) within = match.text === "Components";
    if (!within || code) continue;
    if (match) group = match.text;
    const row = text.startsWith("|") && cells(text);
    const item = row && row[0]!.match(/^:roadmap-check(\{shipped\})?\s+(?:\[([^\]]+)\]\(([^)]+)\)|(.+))$/);
    if (!row || !item) continue;

    const [, isShipped, linked, , plain] = item;
    const title = (linked ?? plain)!.trim();
    const key = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const component = shipped.find((candidate) => candidate.key === key);
    if (isShipped && !component) problems.push(`The Roadmap ticks ${title} as shipped, but there's no ${key} page with a contract`);
    if (!isShipped && component) problems.push(`The Roadmap doesn't tick ${title}, but its page has shipped`);
    if (component) component.group = group;
    else planned.push({ key, title, kind: "component", status: "planned", group, summary: row[1] ?? "" });
  }
  for (const component of shipped) {
    if (component.kind === "component" && !component.group) {
      problems.push(`${component.title} has shipped, but it isn't on the Roadmap`);
    }
  }
  return [...shipped, ...planned];
}
