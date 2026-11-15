// Checks what search engines and AI crawlers get from the built site, after
// `pnpm build`, by reading dist/ the way Cloudflare serves it:
//
// - every page in the sitemap, and only those, with the head tags every page
//   needs, unique titles and descriptions, and share images at 1200 × 630;
// - robots.txt, which names the sitemap and every AI crawler;
// - llms.txt, which links every docs page, each by a title of its own;
// - the markdown copies of the docs pages, each headed by its own title;
// - dist/_headers, which keeps other hosts and generated files out of search
//   results, and never the site's own pages.
//
// Prints every rule with its failures, and exits 1 if any failed.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://opencomponents.dev";
const DIST = "dist";
// Named in robots.txt, each allowed everywhere (AI_CRAWLERS in nuxt.config.ts).
const AI_CRAWLERS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Claude-SearchBot",
  "Claude-User",
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "CCBot",
];
// The longest title and the range of descriptions search results show in full.
const MAX_TITLE = 60;
const DESCRIPTION = [70, 160];
// Pages in dist/ that aren't in the sitemap on purpose: the 404 page and the SPA
// fallback. Redirect pages, like /docs, are left out by their meta refresh.
const NOT_PAGES = new Set(["404.html", "200.html"]);

if (!existsSync(join(DIST, "sitemap.xml"))) throw new Error("dist is missing: run `pnpm build` first.");

const RULES = {
  status: "every sitemap URL is a page in dist/, and not the 404 page",
  noindex: "no sitemap URL is noindex",
  lastmod: "every sitemap URL has a <lastmod>, no later than now",
  coverage: "every page in dist/ that isn't noindex or a redirect is in the sitemap",
  title: `one <title> per page, ${MAX_TITLE} characters or fewer, unique across the sitemap`,
  description: `one meta description per page, ${DESCRIPTION[0]}–${DESCRIPTION[1]} characters, unique across the sitemap`,
  h1: "one <h1> per page",
  canonical: "one canonical URL per page, its own URL on opencomponents.dev",
  lang: '<html lang="en">',
  og: "og:title, og:description, og:type, og:image, and og:url as the page's URL",
  ogimage: "every og:image is a 1200 × 630 PNG in dist/",
  twitter: "twitter:card summary_large_image, with a twitter:image",
  jsonld: "JSON-LD that parses, on schema.org",
  robots: "robots.txt names the sitemap and allows every AI crawler by name",
  llms: "llms.txt has a summary and links every docs page, each by a title of its own",
  raw: "every docs page has a markdown copy, each headed by its own title",
  headers: "_headers keeps other hosts and generated files out of search results, and never a page",
};
const failures = Object.fromEntries(Object.keys(RULES).map((rule) => [rule, []]));
const fail = (rule, message) => failures[rule].push(message);

const decode = (text) =>
  text
    ?.replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const read = (file) => readFileSync(join(DIST, file), "utf8");
const isNoindex = (html) =>
  [...html.matchAll(/<meta\s[^>]*>/g)].some(([tag]) => attr(tag, "name") === "robots" && /noindex/i.test(attr(tag, "content") ?? ""));

// The file Cloudflare serves for a path: /docs/x is docs/x.html, or docs/x/index.html.
const fileOf = (path) => [path === "/" ? "index.html" : `${path.slice(1)}.html`, `${path.slice(1)}/index.html`].find((file) => existsSync(join(DIST, file)));

const sitemap = read("sitemap.xml");
const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, url]) => ({
  loc: decode(url.match(/<loc>([^<]*)<\/loc>/)?.[1]),
  lastmod: url.match(/<lastmod>([^<]*)<\/lastmod>/)?.[1],
}));
const notFound = read("404.html");
// The dates a sitemap takes (sitemaps.org): a day, or a time with its zone.
const W3C_DATETIME = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?$/;

const pages = [];
for (const { loc, lastmod } of entries) {
  const { origin, pathname } = new URL(loc);
  if (origin !== SITE) fail("canonical", `${loc}: the sitemap lists another host`);

  if (lastmod === undefined) fail("lastmod", `${loc}: no <lastmod>`);
  else if (!W3C_DATETIME.test(lastmod) || !(Date.parse(lastmod) <= Date.now())) fail("lastmod", `${loc}: <lastmod> ${lastmod}`);

  const file = fileOf(pathname);
  const html = file && read(file);
  if (!html || html === notFound) {
    fail("status", `${loc}: no page in dist/`);
    continue;
  }
  if (isNoindex(html)) fail("noindex", `${loc}: noindex`);

  const metas = [...html.matchAll(/<meta\s[^>]*>/g)].map(([tag]) => tag);
  const meta = (key) => metas.filter((tag) => attr(tag, "name") === key || attr(tag, "property") === key).map((tag) => decode(attr(tag, "content")));
  const one = (key) => meta(key)[0];

  const titles = [...html.matchAll(/<title>([^<]*)<\/title>/g)].map(([, title]) => decode(title));
  if (titles.length !== 1) fail("title", `${loc}: ${titles.length} <title>s`);
  else if (titles[0].length > MAX_TITLE) fail("title", `${loc}: ${titles[0].length} characters, "${titles[0]}"`);

  const descriptions = meta("description");
  if (descriptions.length !== 1) fail("description", `${loc}: ${descriptions.length} meta descriptions`);
  else if (descriptions[0].length < DESCRIPTION[0] || descriptions[0].length > DESCRIPTION[1]) {
    fail("description", `${loc}: ${descriptions[0].length} characters`);
  }

  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) fail("h1", `${loc}: ${h1s} <h1>s`);

  const canonicals = [...html.matchAll(/<link\s[^>]*rel="canonical"[^>]*>/g)].map(([tag]) => decode(attr(tag, "href")));
  if (canonicals.length !== 1 || canonicals[0] !== loc) fail("canonical", `${loc}: canonical ${canonicals.join(", ") || "missing"}`);

  if (!/<html[^>]*\slang="en"/.test(html)) fail("lang", `${loc}: no <html lang="en">`);

  for (const key of ["og:title", "og:description", "og:type", "og:image"]) if (!one(key)) fail("og", `${loc}: no ${key}`);
  if (one("og:url") !== loc) fail("og", `${loc}: og:url ${one("og:url") ?? "missing"}`);
  if (one("og:image") && !one("og:image").startsWith(`${SITE}/`)) fail("og", `${loc}: og:image ${one("og:image")} isn't on ${SITE}`);

  if (one("twitter:card") !== "summary_large_image") fail("twitter", `${loc}: twitter:card ${one("twitter:card") ?? "missing"}`);
  if (!one("twitter:image")) fail("twitter", `${loc}: no twitter:image`);

  const jsonld = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(([, json]) => json);
  if (!jsonld.length) fail("jsonld", `${loc}: no JSON-LD`);
  for (const json of jsonld) {
    try {
      if (JSON.parse(json)["@context"] !== "https://schema.org") fail("jsonld", `${loc}: JSON-LD without @context https://schema.org`);
    } catch {
      fail("jsonld", `${loc}: JSON-LD that doesn't parse`);
    }
  }

  pages.push({ loc, pathname, title: titles[0], description: descriptions[0], image: one("og:image") });
}

for (const key of ["title", "description"]) {
  const seen = Map.groupBy(
    pages.filter((page) => page[key]),
    (page) => page[key],
  );
  for (const [value, same] of seen) {
    if (same.length > 1) fail(key, `${same.map((page) => page.loc).join(", ")} share "${value}"`);
  }
}

for (const image of new Set(pages.map((page) => page.image).filter(Boolean))) {
  const file = join(DIST, decodeURIComponent(new URL(image).pathname));
  if (!existsSync(file)) {
    fail("ogimage", `${image}: not in dist/`);
    continue;
  }
  const png = readFileSync(file);
  const size = png.subarray(1, 4).toString() === "PNG" ? `${png.readUInt32BE(16)} × ${png.readUInt32BE(20)}` : "not a PNG";
  if (size !== "1200 × 630") fail("ogimage", `${image}: ${size}`);
}

// Every page a crawler could find in dist/ is in the sitemap, so none is left
// out by mistake.
const listed = new Set(pages.map((page) => page.pathname));
for (const file of readdirSync(DIST, { recursive: true, encoding: "utf8" })) {
  if (!file.endsWith(".html") || NOT_PAGES.has(file)) continue;
  const html = read(file);
  if (isNoindex(html) || /<meta\s[^>]*http-equiv="refresh"/i.test(html)) continue;
  const path = `/${file.replace(/(^|\/)index\.html$/, "").replace(/\.html$/, "")}`.replace(/(.)\/$/, "$1");
  if (!listed.has(path)) fail("coverage", `${SITE}${path} (dist/${file}) isn't in the sitemap`);
}

// robots.txt: its groups, each a run of User-agent lines and then its rules.
const robots = read("robots.txt");
if (!robots.split("\n").includes(`Sitemap: ${SITE}/sitemap.xml`)) fail("robots", `no "Sitemap: ${SITE}/sitemap.xml" line`);
const groups = [];
for (const line of robots.split("\n").map((text) => text.replace(/#.*/, "").trim())) {
  const [, field, value] = line.match(/^([\w-]+):\s*(.*)$/) ?? [];
  if (!field) continue;
  if (/^user-agent$/i.test(field)) {
    if (!groups.at(-1) || groups.at(-1).rules.length) groups.push({ agents: [], rules: [] });
    groups.at(-1).agents.push(value);
  } else if (groups.length && !/^sitemap$/i.test(field)) {
    groups.at(-1).rules.push(`${field.toLowerCase()}: ${value}`);
  }
}
for (const agent of ["*", ...AI_CRAWLERS]) {
  const own = groups.filter((group) => group.agents.includes(agent));
  if (!own.length) fail("robots", `no group for User-agent: ${agent}`);
  else if (!own.some((group) => group.rules.includes("allow: /")) || own.some((group) => group.rules.includes("disallow: /"))) {
    fail("robots", `User-agent: ${agent} isn't allowed everywhere`);
  }
}

// llms.txt (llmstxt.org): a title, a summary, then sections of links.
const docs = pages.filter((page) => page.pathname.startsWith("/docs/"));
const llms = read("llms.txt");
const [heading, summary] = llms.split("\n").filter(Boolean);
if (!heading?.startsWith("# ")) fail("llms", "it doesn't start with a # heading");
if (!summary?.startsWith("> ")) fail("llms", "no > summary under its heading");
for (const { pathname } of docs) {
  if (!llms.includes(`](${SITE}/raw${pathname}.md)`)) fail("llms", `no link to ${SITE}/raw${pathname}.md`);
}
const links = [...(llms.split(/^## Docs$/m)[1]?.split(/^## /m)[0] ?? "").matchAll(/^- \[([^\]]+)\]\(([^)]+)\)/gm)];
if (!links.length) fail("llms", "no ## Docs section with links");
for (const [title, same] of Map.groupBy(links, ([, title]) => title)) {
  if (same.length > 1) fail("llms", `${same.length} links in ## Docs share the title "${title}"`);
}

// The markdown copies: one per docs page, each headed by a title of its own.
const firstLines = new Map();
for (const { pathname } of docs) {
  const file = join(DIST, `raw${pathname}.md`);
  if (!existsSync(file)) {
    fail("raw", `no ${SITE}/raw${pathname}.md`);
    continue;
  }
  const first = readFileSync(file, "utf8").split("\n")[0];
  if (!first.startsWith("# ")) fail("raw", `${SITE}/raw${pathname}.md doesn't start with a # heading`);
  firstLines.set(first, [...(firstLines.get(first) ?? []), pathname]);
}
for (const [first, paths] of firstLines) {
  if (paths.length > 1) fail("raw", `${paths.map((path) => `${SITE}/raw${path}.md`).join(", ")} all start with "${first}"`);
}

// _headers, as Cloudflare matches it: a rule's URL is a path, or a URL with a
// host, where `*` matches anything and a `:placeholder` anything but the
// delimiter (`.` in a host, `/` in a path). A request gets the headers of every
// rule it matches.
const rules = read("_headers")
  .split(/\n(?=\S)/)
  .map((block) => {
    const [pattern, ...lines] = block.trim().split("\n");
    const headers = lines.flatMap((line) => {
      const [, name, value] = line.match(/^\s+([^:]+):\s*(.*)$/) ?? [];
      return name ? [[name.toLowerCase(), value]] : [];
    });
    return { pattern, headers };
  });
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const segment = (text, delimiters) =>
  text
    .split(/(\*|:[A-Za-z]\w*)/)
    .map((part, index) => (part === "*" ? "(?<splat>.*)" : index % 2 ? `(?<${part.slice(1)}>[^${delimiters}]+)` : escape(part)))
    .join("");
const toRegExp = (pattern) => {
  const [, host, path] = pattern.match(/^https:\/\/([^/]+)(\/.*)$/) ?? [];
  return host
    ? { absolute: true, regexp: new RegExp(`^${segment(host, "./")}${segment(path, "/")}$`) }
    : { absolute: false, regexp: new RegExp(`^${segment(pattern, "/")}$`) };
};
// Cloudflare keeps only the last of two rules for the same URL, so one would
// drop the other's headers.
for (const [pattern, same] of Map.groupBy(rules, (rule) => rule.pattern)) {
  if (same.length > 1) fail("headers", `${same.length} rules for ${pattern}, of which Cloudflare applies only the last`);
}
const matchers = rules.map((rule) => ({ ...rule, ...toRegExp(rule.pattern) }));
const headersFor = (url) => {
  const { host, pathname } = new URL(url);
  return matchers.flatMap(({ absolute, regexp, headers }) => {
    const match = regexp.exec(absolute ? `${host}${pathname}` : pathname);
    if (!match) return [];
    const fill = (value) => value.replace(/:([A-Za-z]\w*)/g, (placeholder, name) => match.groups?.[name] ?? placeholder);
    return headers.map(([name, value]) => [name, fill(value)]);
  });
};
const robotsTag = (url) =>
  headersFor(url)
    .filter(([name]) => name === "x-robots-tag")
    .map(([, value]) => value)
    .join(", ");
for (const { loc } of pages) {
  if (/noindex/i.test(robotsTag(loc))) fail("headers", `${loc}: X-Robots-Tag ${robotsTag(loc)}`);
}
for (const url of [
  "https://www.opencomponents.dev/",
  "https://www.opencomponents.dev/docs/components/button",
  "https://open-components.account.workers.dev/",
  "https://abc123-open-components.account.workers.dev/docs/getting-started/introduction",
  `${SITE}/llms.txt`,
  `${SITE}/llms-full.txt`,
  `${SITE}/raw/docs/components/button.yaml`,
  `${SITE}/schemas/contract.json`,
]) {
  if (!/noindex/i.test(robotsTag(url))) fail("headers", `${url}: no X-Robots-Tag: noindex`);
}
for (const { pathname } of docs) {
  const url = `${SITE}/raw${pathname}.md`;
  const link = headersFor(url).find(([name]) => name === "link")?.[1];
  if (link !== `<${SITE}${pathname}>; rel="canonical"`) fail("headers", `${url}: Link ${link ?? "missing"}, not its page as canonical`);
  if (/noindex/i.test(robotsTag(url))) fail("headers", `${url}: X-Robots-Tag ${robotsTag(url)}`);
}
if (headersFor(`${SITE}/schemas/contract.json`).find(([name]) => name === "access-control-allow-origin")?.[1] !== "*") {
  fail("headers", `${SITE}/schemas/contract.json: no Access-Control-Allow-Origin: *`);
}

let failed = 0;
for (const [rule, about] of Object.entries(RULES)) {
  const list = failures[rule];
  failed += list.length;
  console.log(`${list.length ? "✗" : "✓"} ${rule}: ${about}${list.length ? ` (${list.length} failed)` : ""}`);
  for (const message of list.slice(0, 20)) console.log(`    ${message}`);
  if (list.length > 20) console.log(`    … and ${list.length - 20} more`);
}
console.log(`${entries.length} pages in the sitemap, ${docs.length} of them docs pages, ${failed} failures`);
process.exit(failed ? 1 : 0);
