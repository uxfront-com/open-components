// Checks the MCP server the way Cloudflare will serve it, after `pnpm build` and
// `pnpm build:mcp`: serves the Worker (mcp/.output) with `wrangler dev`, then calls
// every tool, resource and prompt with an MCP client and checks them against the
// built site, in dist/. Contracts and pages must come back as the same bytes as /raw/<path>.yaml
// and /raw/<path>.md, and every anchor the server points agents at must exist on
// its page. Pass --url to check a server that's already running, like a preview's,
// against your local builds of the same commit.
import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { parse } from "yaml";

const SITE = "https://opencomponents.dev";
const TOOLS = ["get-contract", "get-page", "get-reference-implementation", "list-components", "list-rules", "search-docs"];
const PROMPTS = ["adopt-token-paths", "build-component", "review-component", "review-usage"];
// What some MCP clients pass on of a tool's result before cutting it short, like
// Gemini CLI's 40,000 characters (Codex's is 48,000 bytes, and Claude Code's
// 25,000 tokens).
const MAX_RESULT = 40000;

const problems = [];
const check = (ok, problem) => ok || problems.push(problem);

const url = process.argv.includes("--url") ? process.argv[process.argv.indexOf("--url") + 1] : undefined;
if (!existsSync("dist/raw/docs")) throw new Error("dist is missing: run `pnpm build` first.");
// The site's security headers, which dist/_headers gives every static file.
const HEADERS = Object.fromEntries(
  (readFileSync("dist/_headers", "utf8").split(/^(?=\S)/m).find((block) => block.startsWith("/*\n")) ?? "")
    .split("\n")
    .flatMap((line) => {
      const header = line.match(/^\s+([^:]+):\s*(.+)$/);
      return header ? [[header[1].toLowerCase(), header[2]]] : [];
    }),
);
const wrangler = url ? undefined : await serve();
const base = url ?? wrangler.url;

try {
  await checkRoutes();
  await checkServer();
} finally {
  wrangler?.process.kill();
}

if (problems.length) {
  console.error(problems.map((problem) => `✗ ${problem}`).join("\n"));
  process.exit(1);
}
console.log(`✓ The MCP server at ${base}/mcp serves the standard as the site publishes it.`);

// Serves the Worker on a free port, the way `npx wrangler dev -c mcp/wrangler.jsonc` does.
async function serve() {
  if (!existsSync("mcp/.output/server/index.mjs")) throw new Error("mcp/.output is missing: run `pnpm build:mcp` first.");
  const port = await new Promise((resolve) => {
    const server = createServer().listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
  const child = spawn("node_modules/.bin/wrangler", ["dev", "-c", "mcp/wrangler.jsonc", "--ip", "127.0.0.1", "--port", String(port)], {
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (data) => (log += data));
  child.stderr.on("data", (data) => (log += data));
  const url = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (child.exitCode !== null) break;
    // Any response will do: `/` redirects to the site.
    if (await fetch(url, { redirect: "manual" }).then(() => true, () => false)) return { url, process: child };
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  child.kill();
  throw new Error(`wrangler dev didn't start:\n${log}`);
}

// What browsers and other routes get from the Worker.
async function checkRoutes() {
  // People who open the server, or its subdomain, land on the page about connecting to it.
  for (const path of ["/", "/mcp"]) {
    const browser = await fetch(`${base}${path}`, { headers: { accept: "text/html" }, redirect: "manual" });
    const location = new URL(browser.headers.get("location") ?? "", base);
    check(browser.status === 302, `GET ${path} from a browser returned ${browser.status}, not a redirect`);
    check(
      location.origin === SITE && existsSync(join("dist", `${location.pathname}.html`)),
      `GET ${path} from a browser redirects to ${location}, which isn't a page on ${SITE}`,
    );
  }

  // The toolkit's install badge, which writes its query into the SVG unescaped,
  // is turned away, along with anything else the server doesn't have.
  for (const path of ["/mcp/badge.svg?color=%22%3E%3Cscript%3E", "/mcp/nope", "/nope"]) {
    const response = await fetch(`${base}${path}`);
    const body = await response.text();
    check(response.status === 404 && !body.includes("<script"), `GET ${path} returned ${response.status}, not a 404`);
  }

  const deeplink = await fetch(`${base}/mcp/deeplink`);
  const install = await deeplink.text();
  check(
    deeplink.status === 200 && install.includes("cursor://anysphere.cursor-deeplink/mcp/install?name=open-components"),
    `GET /mcp/deeplink, Docus's "Add MCP Server" link, returned ${deeplink.status} without Cursor's install link`,
  );
  // Web-based clients on other origins can call it.
  const preflight = await fetch(`${base}/mcp`, {
    method: "OPTIONS",
    headers: { origin: "https://example.com", "access-control-request-method": "POST" },
  });
  check(
    preflight.status === 204 && preflight.headers.get("access-control-allow-origin") === "*",
    `A CORS preflight for /mcp returned ${preflight.status} without Access-Control-Allow-Origin`,
  );
  const crossOrigin = await fetch(`${base}/mcp`, {
    method: "POST",
    headers: { origin: "https://example.com", "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }),
  });
  check(crossOrigin.status === 200, `A request to /mcp from another origin returned ${crossOrigin.status}`);

  // The Worker's responses carry the site's security headers.
  check(Object.keys(HEADERS).length > 0, "dist/_headers has no headers for every path");
  for (const [name, value] of Object.entries(HEADERS)) {
    check(crossOrigin.headers.get(name) === value, `/mcp responses don't have the site's ${name} header`);
  }
}

async function checkServer() {
  const client = new Client({ name: "check-mcp", version: "1.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`)));

  const call = async (name, args) => {
    const result = await client.callTool({ name, arguments: args });
    const text = result.content?.map((part) => part.text ?? "").join("\n") ?? "";
    check(text.length < MAX_RESULT, `${name} ${JSON.stringify(args)} returned ${text.length} characters, too long for an agent's context`);
    return { ...result, text };
  };

  check(client.getServerVersion()?.name === "open-components", `The server is named ${client.getServerVersion()?.name}`);
  const instructions = client.getInstructions() ?? "";

  // Every tool and prompt is there, read-only, and only names the tools there are.
  const { tools } = await client.listTools();
  const { prompts } = await client.listPrompts();
  for (const [kind, served, expected] of [
    ["tool", tools, TOOLS],
    ["prompt", prompts, PROMPTS],
  ]) {
    const names = served.map(({ name }) => name);
    for (const name of names) check(expected.includes(name), `The server has a ${kind}, ${name}, that check-mcp doesn't list`);
    for (const name of expected) check(names.includes(name), `The server has no ${kind} named ${name}`);
  }
  // Every tool works with each of the examples it gives agents.
  for (const tool of tools) {
    check(tool.annotations?.readOnlyHint === true, `${tool.name} isn't marked read-only`);
    for (const example of tool._meta?.inputExamples ?? [{}]) {
      const { isError, text } = await call(tool.name, example);
      check(!isError, `${tool.name} ${JSON.stringify(example)}, one of its examples, failed: ${text.slice(0, 200)}`);
    }
  }
  const named = (text) => text.match(/\b(?:get|list|search)-[a-z-]+[a-z]\b/g) ?? [];
  for (const [where, text] of [["The instructions", instructions], ...tools.map((tool) => [tool.name, tool.description ?? ""])]) {
    for (const name of named(text)) check(TOOLS.includes(name), `${where} name a tool that doesn't exist: ${name}`);
  }

  // What the standard covers. Arguments are optional when every one of them is.
  const bare = await client.callTool({ name: "list-components" });
  check(!bare.isError, "list-components without arguments failed");
  const { structuredContent: catalog } = await call("list-components", {});
  const shipped = catalog.components.filter((component) => component.status === "shipped");
  check(shipped.some((component) => component.key === "button"), "list-components doesn't list the Button");
  check(catalog.components.some((component) => component.status === "planned"), "list-components lists no planned components");

  // Contracts: the same bytes as the site's, with every rule.
  let rules = 0;
  for (const component of shipped) {
    const path = new URL(component.contractUrl).pathname;
    const file = readFileSync(join("dist", path), "utf8");
    const { text } = await call("get-contract", { component: component.key });
    check(text === file, `get-contract {component: ${component.key}} isn't the same as ${path}`);
    rules += parse(file).rules?.length ?? 0;
  }
  const { structuredContent: all } = await call("list-rules", {});
  check(all.total === rules, `list-rules lists ${all.total} rules, while the contracts have ${rules}`);
  // An empty list filters nothing, since some clients send every optional field.
  const { structuredContent: empty } = await call("list-rules", { ids: [], scope: [], layer: [], level: [], check: [] });
  check(empty.total === rules, `list-rules with empty lists lists ${empty.total} rules, not ${rules}`);

  // Every anchor the server links agents to is on its page.
  const html = (pathname) => readFileSync(join("dist", `${pathname}.html`), "utf8");
  for (const rule of all.rules) {
    const { pathname, hash } = new URL(rule.url);
    check(html(pathname).includes(`id="${hash.slice(1)}"`), `${rule.id} links to ${rule.url}, which isn't on the page`);
  }
  const pages = readdirSync("dist/raw/docs", { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".md"))
    .map((file) => `/docs/${file.replace(/\.md$/, "")}`);
  for (const pathname of pages) {
    // An unknown section lists the page's sections, with their anchors.
    const { text, isError } = await call("get-page", { path: pathname, sections: ["?"] });
    check(isError, `get-page {path: ${pathname}, sections: ["?"]} didn't fail`);
    for (const [, anchor] of text.matchAll(/\(#([^)]+)\)/g)) {
      check(html(pathname).includes(`id="${anchor}"`), `get-page lists #${anchor} on ${pathname}, which isn't on the page`);
    }
    const page = await call("get-page", { path: pathname });
    check(!page.isError && page.text.startsWith("# "), `get-page {path: ${pathname}} failed: ${page.text.slice(0, 200)}`);
    check(!/^\s*:{2,}|:roadmap-check|\{external/m.test(page.text), `get-page {path: ${pathname}} has MDC syntax left in it`);
  }

  // A long page comes as its outline, and a section in one framework.
  const outline = await call("get-page", { path: "button" });
  check(outline.text.includes("(#loading)") && !outline.text.includes("```"), "get-page {path: button} isn't the page's outline");
  const loading = await call("get-page", { path: "button", sections: ["Loading"], framework: "react" });
  check(loading.text.includes("```tsx") && !loading.text.includes("```vue"), "get-page's Loading section in React has other frameworks' code");
  const linked = await call("get-page", { path: `${SITE}/docs/components/button#loading` });
  check(linked.text.includes("#### Loading") && !linked.text.includes("(#loading)"), "get-page with a link to #loading doesn't read that section");
  const together = await call("get-page", { path: "button", sections: ["User Interface (UI)", "User Experience (UX)", "Reference implementation"] });
  check(together.text.includes("too long to return together"), "get-page returns sections that are too long together instead of their outline");
  const every = await call("get-page", { path: "button", sections: ["Variants"] });
  check(every.text.includes("**React**") && every.text.includes("**Vanilla**"), "get-page's Variants section doesn't label each framework");

  // Search and the reference implementation.
  const { structuredContent: search } = await call("search-docs", { query: "aria-pressed" });
  check(search.results.slice(0, 3).some((result) => result.rule?.id === "button/toggle-pressed"), 'search-docs {query: "aria-pressed"} misses button/toggle-pressed');
  const reference = await call("get-reference-implementation", { component: "button" });
  for (const file of readdirSync("app/reference/button")) {
    const content = readFileSync(join("app/reference/button", file), "utf8").trim();
    check(reference.text.includes(content), `get-reference-implementation {component: button} doesn't have ${file} as it is`);
  }

  // Wrong input gets an error that helps the agent fix it.
  const typo = await call("list-rules", { ids: ["button/keep-focused"] });
  check(typo.isError && typo.text.includes("button/keep-focus"), "list-rules with a mistyped ID doesn't suggest the right one");
  const unknown = await call("get-page", { path: "nope" });
  check(unknown.isError && unknown.text.includes("/docs/components/button"), "get-page with an unknown path doesn't list the pages");

  // Bad input to a resource or a prompt is a bad argument (-32602), not a server error.
  for (const [what, request] of [
    ["A missing page resource", () => client.readResource({ uri: `${SITE}/raw/docs/components/nope.md` })],
    ["build-component for a component that doesn't exist", () => client.getPrompt({ name: "build-component", arguments: { component: "nope" } })],
  ]) {
    const error = await request().then(() => undefined, (error) => error);
    check(error?.code === -32602, `${what} returned ${error ? `error ${error.code}` : "no error"}, not -32602`);
  }

  // Resources: the same bytes as the files the site publishes at their URIs.
  const { resources } = await client.listResources();
  check(resources.length > pages.length, `There are only ${resources.length} resources`);
  for (const resource of resources) {
    const { contents } = await client.readResource({ uri: resource.uri });
    const path = resource.uri.slice(SITE.length);
    check(contents[0]?.text === readFileSync(join("dist", path), "utf8"), `The resource ${resource.uri} isn't the same as ${path}`);
  }

  // Prompts only name tools that exist.
  const filled = {
    "build-component": { component: "button", framework: "react" },
    "review-component": { component: "button" },
    "review-usage": { component: "button" },
    "adopt-token-paths": {},
  };
  for (const prompt of prompts) {
    if (!(prompt.name in filled)) {
      check(false, `check-mcp has no arguments for the ${prompt.name} prompt: add them to \`filled\``);
      continue;
    }
    const { messages } = await client.getPrompt({ name: prompt.name, arguments: filled[prompt.name] });
    const text = messages.map((message) => message.content.text).join("\n");
    check(text.includes(SITE), `The ${prompt.name} prompt doesn't link to the standard`);
    for (const name of named(text)) check(TOOLS.includes(name), `The ${prompt.name} prompt names a tool that doesn't exist: ${name}`);
  }

  await client.close();
}
