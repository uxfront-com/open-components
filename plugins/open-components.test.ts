// @vitest-environment node
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { FRAMEWORKS } from "../app/data/frameworks";
import { buildStandard } from "../mcp/lib/standard";

// The Agent Plugin in plugins/open-components/, which clients install from this
// repository: the skills, and the MCP server they read the standard from. These
// check it against the Agent Plugins and Agent Skills specifications, and that the
// skills only send agents to tools, rules, sections and URLs that exist.
const ROOT = "plugins/open-components";
const SITE = "https://opencomponents.dev";
const { standard } = buildStandard({ root: process.cwd(), site: SITE, frameworks: FRAMEWORKS });

const json = (file: string) => JSON.parse(readFileSync(join(ROOT, file), "utf8"));
const manifest = json("plugin.json");
const mcp = json("mcp.json");

// The canonical schemas, in plugins/schemas/ under the path of their URL. Clients
// never fetch them while loading a plugin, so neither do we.
const ajv = new Ajv2020({ allErrors: true });
const SCHEMAS = "https://agent-plugins.org/schemas/";
function errors(document: { $schema: string }) {
  if (!document.$schema?.startsWith(SCHEMAS)) return [`${document.$schema} isn't an Agent Plugins schema`];
  const validate = ajv.getSchema(document.$schema) ?? ajv.compile(JSON.parse(readFileSync(join("plugins/schemas", document.$schema.slice(SCHEMAS.length)), "utf8")));
  validate(document);
  return validate.errors ?? [];
}

// The MCP server this repository deploys: its name in mcp/nuxt.config.ts, which
// clients install it under, and its URL in nuxt.config.ts.
const SERVER_NAME = readFileSync("mcp/nuxt.config.ts", "utf8").match(/^\s+name: "(.+)",$/m)?.[1];
const SERVER_URL = readFileSync("nuxt.config.ts", "utf8").match(/^const MCP_URL = "(.+)";$/m)?.[1];
const TOOLS = readdirSync("mcp/server/mcp/tools").map((file) => file.replace(/\.ts$/, ""));
const PROMPTS = readdirSync("mcp/server/mcp/prompts").map((file) => file.replace(/\.ts$/, ""));

// Every skill, as a client discovers them: each child of skills/ with a SKILL.md.
const skills = readdirSync(join(ROOT, "skills"))
  .filter((name) => existsSync(join(ROOT, "skills", name, "SKILL.md")))
  .map((directory) => {
    const source = readFileSync(join(ROOT, "skills", directory, "SKILL.md"), "utf8");
    const [, frontmatter = "", body = ""] = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];
    return { directory, frontmatter: parse(frontmatter) ?? {}, body };
  });
const each = skills.map((skill) => [skill.directory, skill] as const);

// What a skill names in code spans: tool calls, like `get-contract {"component": "button"}`,
// tools on their own, and rule IDs, like `button/keep-focus`.
const spans = (body: string) => [...body.matchAll(/`([^`\n]+)`/g)].map((match) => match[1]!);
const calls = (body: string) =>
  spans(body).flatMap((span) => {
    const call = span.match(/^([a-z]+(?:-[a-z]+)+) (\{.*\})$/);
    return call ? [{ tool: call[1]!, args: JSON.parse(call[2]!) as Record<string, unknown> }] : [];
  });
const placeholder = (value: unknown) => typeof value === "string" && /^<.+>$/.test(value);

describe("The agent plugin", () => {
  it("has a manifest that follows the Agent Plugins schema", () => {
    expect(errors(manifest)).toEqual([]);
  });

  it("has an MCP configuration that follows the schema, for the same Agent Plugins version", () => {
    expect(errors(mcp)).toEqual([]);
    expect(mcp.$schema.slice(SCHEMAS.length).split("/")[0]).toBe(manifest.$schema.slice(SCHEMAS.length).split("/")[0]);
  });

  // The schemas take any string, while the specification also asks for an HTTPS
  // URL without credentials in it, and headers without secrets.
  it("connects the MCP server we deploy, under the name it's installed under everywhere else", () => {
    expect(SERVER_NAME).toBe("open-components");
    expect(mcp.mcpServers).toEqual({ [SERVER_NAME!]: { type: "streamable-http", url: SERVER_URL } });
  });

  it("is named after its directory", () => {
    expect(manifest.name).toBe(ROOT.split("/").at(-1));
  });

  // Clients reject a path that resolves outside the plugin, like a symlink to content/LICENSE.
  it("has no symlinks", () => {
    const files = readdirSync(ROOT, { recursive: true, encoding: "utf8" });
    expect(files.filter((file) => lstatSync(join(ROOT, file)).isSymbolicLink())).toEqual([]);
  });

  // Clients copy the plugin's folder alone, so it carries a copy of the guidelines'
  // license, under a header of its own, which has to stay the one its manifest names.
  it("carries the license its manifest names, as the guidelines do", () => {
    const text = (file: string) => readFileSync(file, "utf8").split("\nAttribution 4.0 International\n")[1];
    expect(manifest.license).toBe("CC-BY-4.0");
    expect(text("content/LICENSE")).toEqual(expect.any(String));
    expect(text(join(ROOT, "LICENSE"))).toBe(text("content/LICENSE"));
  });

  // Claude Code, Codex, GitHub Copilot, VS Code, OpenClaw and the Cursor CLI find
  // the plugin from .claude-plugin/marketplace.json at the root of the repository.
  // Claude Code reads its manifest from the entry, and its MCP servers only from
  // the file the entry names, so it mirrors plugin.json. Clients cache a plugin by
  // its version, so the two have to agree for an update to reach anyone.
  it("is listed in the repository's marketplace, as its manifest says", () => {
    const marketplace = JSON.parse(readFileSync(".claude-plugin/marketplace.json", "utf8"));
    expect(marketplace.name).toBe(manifest.name);
    expect(marketplace.plugins).toEqual([
      {
        name: manifest.name,
        source: `./${ROOT}`,
        description: manifest.description,
        version: manifest.version,
        mcpServers: "./mcp.json",
      },
    ]);
  });

  // The Cursor CLI and OpenClaw read a client's own manifest before plugin.json, and
  // OpenClaw then ignores mcp.json, as Claude Code does the marketplace's mcpServers.
  it("has no manifest of a client's own, which some clients would read instead", () => {
    const own = [".claude-plugin", ".codex-plugin", ".cursor-plugin", ".github", ".plugin", "plugin.yaml", ".mcp.json"];
    expect(own.filter((path) => existsSync(join(ROOT, path)))).toEqual([]);
  });

  // The prompts are what users start themselves, and the skills what agents pick
  // up on their own, so each prompt has a skill that asks for the same.
  it("has a skill for every prompt the MCP server offers", () => {
    expect(skills.map((skill) => skill.directory).sort()).toEqual([...PROMPTS].sort());
  });
});

// https://agentskills.io/specification
describe("The skills", () => {
  it.each(each)("%s is named after its directory, as Agent Skills names go", (directory, { frontmatter }) => {
    expect(frontmatter.name).toBe(directory);
    expect(frontmatter.name).toMatch(/^(?!.*--)[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/);
  });

  it.each(each)("%s has only the fields Agent Skills defines, within their limits", (_, { frontmatter }) => {
    expect(Object.keys(frontmatter).filter((key) => !["name", "description", "license", "compatibility", "metadata", "allowed-tools"].includes(key))).toEqual([]);
    expect(frontmatter.description).toEqual(expect.any(String));
    expect(frontmatter.description.length).toBeGreaterThan(0);
    expect(frontmatter.description.length).toBeLessThanOrEqual(1024);
    expect((frontmatter.compatibility ?? "x").length).toBeLessThanOrEqual(500);
  });

  it.each(each)("%s has the plugin's license", (_, { frontmatter }) => {
    expect(frontmatter.license).toBe(manifest.license);
  });

  // Agents load the whole body once they pick a skill: the specification
  // recommends under 500 lines and 5,000 tokens, at about 4 characters a token.
  it.each(each)("%s is short enough to load whole", (_, { body }) => {
    expect(body.split("\n").length).toBeLessThan(500);
    expect(body.length / 4).toBeLessThan(5000);
  });

  it.each(each)("%s only calls the MCP server's tools", (_, { body }) => {
    const named = spans(body).flatMap((span) => span.match(/^((?:get|list|search)-[a-z-]+)(?: \{.*\})?$/)?.[1] ?? []);
    expect(named.length).toBeGreaterThan(0);
    expect(named.filter((tool) => !TOOLS.includes(tool))).toEqual([]);
  });

  // A call with a placeholder, like `<component>`, is checked on every shipped component's page.
  it.each(each)("%s only names pages, components, sections and frameworks that exist", (_, { body }) => {
    const shipped = standard.components.filter((component) => component.kind === "component" && component.status === "shipped");
    const missing = calls(body).flatMap(({ tool, args }) => {
      const name = (args.component ?? args.path) as string | undefined;
      const pages = placeholder(name) ? shipped.map((component) => component.key) : name ? [name] : [];
      return pages.flatMap((key) => {
        const page = standard.pages.find((candidate) => candidate.key === key);
        if (!page) return [`${tool}: no page ${key}`];
        if (args.component && !placeholder(args.component) && !standard.components.some((component) => component.key === key)) return [`${tool}: no component ${key}`];
        const sections = ((args.sections ?? []) as string[]).filter((section) => !placeholder(section));
        return sections
          .filter((section) => !page.headings.some((heading) => heading.text === section))
          .map((section) => `${tool}: no section "${section}" on ${key}`);
      });
    });
    const frameworks = calls(body).flatMap(({ args }) => (args.framework && !placeholder(args.framework) ? [args.framework] : []));
    expect(missing).toEqual([]);
    expect(frameworks.filter((framework) => !FRAMEWORKS.some((candidate) => candidate.value === framework))).toEqual([]);
  });

  it("list every framework the docs come in, where they list them", () => {
    const listed = skills.flatMap(({ body }) => body.match(/is one of ([a-z, ]+) or ([a-z]+)\./)?.slice(1) ?? []);
    expect(listed.length).toBeGreaterThan(0);
    expect(listed.join(", ").split(", ")).toEqual(FRAMEWORKS.map((framework) => framework.value));
  });

  it.each(each)("%s only cites rules that exist", (_, { body }) => {
    const ids = spans(body).filter((span) => /^[a-z0-9-]+\/[a-z0-9-]+$/.test(span));
    expect(ids.filter((id) => !standard.rules.some((rule) => rule.id === id))).toEqual([]);
  });

  it.each(each)("%s only links to files the site publishes", (_, { body }) => {
    const published = new Set([
      `${SITE}/llms.txt`,
      `${SITE}/llms-full.txt`,
      ...standard.pages.flatMap((page) => [`${SITE}/raw${page.path}.md`, ...(page.contract ? [page.contract.url] : [])]),
    ]);
    const links = [...body.matchAll(/https:\/\/opencomponents\.dev\/[^\s)`,]*[^\s)`,.]/g)].map((match) => match[0]);
    expect(links.filter((link) => !published.has(link))).toEqual([]);
  });

  it.each(each)("%s only points to other skills in this plugin", (_, { body }) => {
    const named = [...body.matchAll(/the ([a-z-]+) skill/g)].map((match) => match[1]!);
    expect(named.filter((name) => !skills.some((skill) => skill.directory === name))).toEqual([]);
  });
});
