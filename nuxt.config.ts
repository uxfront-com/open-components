import { existsSync } from "node:fs";
import { appendFile, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Features } from "lightningcss";
import { SITE_DESCRIPTION } from "./app/data/site";
import { MCP_DEV_PORT } from "./mcp/port.mjs";
import { buildContract } from "./server/lib/contract";
import { SECURITY_HEADERS } from "./server/lib/headers";
import { docsPath, readPages, readSplitAnchors } from "./server/lib/raw";

const SITE_URL = "https://opencomponents.dev";

// The MCP server (mcp/), which runs as a Worker of its own (mcp/wrangler.jsonc).
const MCP_URL = "https://mcp.opencomponents.dev/mcp";

// Docus reads the site URL from the environment: for canonical URLs, robots.txt
// and llms.txt at build time, and for the sitemap when it's prerendered.
process.env.NUXT_SITE_URL ||= SITE_URL;

// The crawlers robots.txt names, each allowed everywhere, since the guidelines
// are open (CC BY 4.0) and gain from being found and quoted: answer engines,
// which fetch pages to cite in an answer, then the crawlers that train models.
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

const NOINDEX = { "X-Robots-Tag": "noindex" };

// Rules dist/_headers gets after the ones routeRules writes, for what routeRules
// can't match: other hosts, and files by their extension. Cloudflare applies
// every rule that matches a request, and joins an X-Robots-Tag set twice.
const CRAWL_HEADERS: [string, Record<string, string>][] = [
  // Only opencomponents.dev is indexed. The Worker answers on other hosts too:
  // www, until its redirect in Cloudflare answers first, each branch's preview
  // on a custom domain, like <branch>.opencomponents.dev, and workers.dev, both
  // its own hosts, like <worker>.<account>.workers.dev, and its previews. A
  // placeholder stops at a dot, so :preview matches one label in front of the
  // apex, never opencomponents.dev itself. Cloudflare ignores the scheme, so
  // http:// matches as well.
  ["https://:preview.opencomponents.dev/*", NOINDEX],
  ["https://:worker.:account.workers.dev/*", NOINDEX],
  // The markdown copy of a docs page (server/middleware/raw-markdown.ts) points
  // search engines at the page itself.
  ["/raw/docs/*.md", { Link: `<${SITE_URL}/docs/:splat>; rel="canonical"` }],
  // Files for agents, which aren't pages. noindex keeps them out of search
  // results, while agents still read them. The schemas get it from routeRules:
  // Cloudflare keeps only the last of two rules with the same pattern.
  ["/llms.txt", NOINDEX],
  ["/llms-full.txt", NOINDEX],
  ["/raw/*.yaml", NOINDEX],
];

// The docs pages with a contract, which server/middleware/raw-contract.ts serves at
// /raw/<path>.yaml: every component page, split into a folder like
// 3.components/button/, has one, like /raw/docs/components/button.yaml.
const contracts = readPages("content/docs").flatMap(({ file, source }) => {
  if (!buildContract(source)) return [];
  return {
    title: source.match(/^title: (.+)$/m)?.[1] ?? file,
    path: `/raw${docsPath(file)}.yaml`,
  };
});

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: true,

  extends: [
    // The homepage kit: components, fonts, head helpers and critical-path loading.
    "@uxfront/layer-ui",
    // The docs theme: Docus, which renders content/docs/ at /docs (see app/app.vue),
    // plus the framework switcher (`docsTheme.frameworks` in app/app.config.ts).
    "@uxfront/layer-docs",
  ],

  appConfig: {
    // Where links to a split page's sections go, like /docs/components/button#loading
    // to /docs/components/button/ux#loading (app/middleware/split-pages.global.ts).
    splitAnchors: readSplitAnchors("content/docs"),
  },

  runtimeConfig: {
    public: {
      siteUrl: SITE_URL,
      // Where the page menu's "Copy MCP Server URL" and "Add MCP Server" point
      // (app/components/docs/DocsPageHeaderLinks.vue).
      mcpUrl: MCP_URL,
    },
  },

  // The docs header and title template (Docus falls back to the package name).
  site: {
    name: "Open Components",
  },

  // The Open Graph images Docus's docs pages and the changelog generate, at the
  // 1200 × 630 (1.91:1) social networks crop to, rather than nuxt-og-image's
  // 1200 × 600.
  ogImage: {
    defaults: { width: 1200, height: 630 },
  },

  content: {
    build: {
      markdown: {
        highlight: {
          // GitHub's high-contrast themes, since every token colour in them
          // reaches 4.5:1 on the code blocks' background, in light and dark mode
          // (WCAG 1.4.3). Docus's Material themes go as low as 2.19:1 in light mode.
          theme: {
            default: "github-light-high-contrast",
            light: "github-light-high-contrast",
            dark: "github-dark-high-contrast",
          },
        },
      },
    },
  },

  // llms.txt points agents at the MCP server (mcp/) and the agent plugin
  // (plugins/open-components/), then lists the contracts and their schema
  // (public/schemas/contract.json), ahead of the pages Nuxt Content adds.
  llms: {
    // The summary llmstxt.org puts under the title.
    description: SITE_DESCRIPTION,
    sections: [
      {
        // The title newer versions of the MCP toolkit give the section they add to
        // llms.txt, on sites where it's on.
        title: "MCP Server",
        description:
          "The Open Components MCP server, over streamable HTTP: the contracts, every rule and the docs, a section at a time, for agents to build and review components with.",
        links: [
          {
            title: "Open Components MCP server",
            description: "Connect an MCP client to this URL, with no authentication",
            href: MCP_URL,
          },
          {
            title: "MCP Server",
            description: "How to connect it to Claude Code, Cursor, VS Code and other clients, and what it offers",
            href: `${SITE_URL}/raw${docsPath("1.getting-started/3.mcp-server.md")}.md`,
          },
        ],
      },
      {
        title: "Agent Plugin",
        description:
          "The Open Components agent plugin, for clients that support Agent Plugins: skills that build and review components rule by rule, and the MCP server they read the standard from.",
        links: [
          {
            title: "Agent Plugin",
            description: "How to install it in VS Code, GitHub Copilot, Cursor, Codex, Claude Code and other clients, and what it offers",
            href: `${SITE_URL}/raw${docsPath("1.getting-started/4.agent-plugin.md")}.md`,
          },
          {
            title: "Open Components agent plugin",
            description: "The plugin itself: its manifest, its MCP configuration and its skills",
            href: "https://github.com/uxfront-com/open-components/tree/main/plugins/open-components",
          },
        ],
      },
      {
        title: "Contracts",
        description: "Every requirement for a component or convention, rules included, in one YAML file.",
        links: [
          ...contracts.map(({ title, path }) => ({
            title,
            description: `The ${title} contract, with every rule from its checklist`,
            href: `${SITE_URL}${path}`,
          })),
          {
            title: "Contract schema",
            description: "The JSON Schema every contract follows, for validating them, and contracts of your own",
            href: `${SITE_URL}/schemas/contract.json`,
          },
        ],
      },
    ],
  },

  // Docus publishes the agent plugin's skills (plugins/open-components/skills/) at
  // /.well-known/skills/, for agents that discover skills on a site, like
  // `npx skills add https://opencomponents.dev`.
  docus: {
    skills: { dir: "plugins/open-components/skills" },
  },

  // robots.txt: everyone may crawl everything, and each AI crawler is named, so
  // the policy is stated rather than implied. Docus adds the `User-agent: *`
  // group and the sitemap. No Content-Signal line (contentsignals.org): Lighthouse
  // reads it as an unknown directive, which fails its robots.txt audit and costs
  // every page its SEO 100.
  robots: {
    groups: AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
  },

  // The site is static, so Docus's MCP server is off: our own, in mcp/, runs at
  // mcp.opencomponents.dev, which the page menu links to (`mcpUrl` above).
  mcp: {
    enabled: false,
  },

  // Amplitude Analytics and Session Replay (modules/amplitude.ts), built in when
  // NUXT_PUBLIC_AMPLITUDE_API_KEY is set.
  amplitude: {
    // Records every session until the project's Session Replay settings set a rate.
    sessionReplaySampleRate: 1,
  },

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
    },
  },

  vite: {
    css: {
      lightningcss: {
        // Lightning CSS minifies the build, and for older browsers it rewrites
        // light-dark() into variables that only a color-scheme on the same element
        // sets. The Button's tokens are on :root, but the examples set color-scheme
        // on their frame, so every token came out invalid and the buttons lost
        // their colours. light-dark() has been Baseline since May 2024, so keep it.
        exclude: Features.LightDark,
      },
    },
  },

  experimental: {
    // Inline the payload on first load (the homepage makes no extra request),
    // and extract it for client-side navigation between docs pages.
    payloadExtraction: "client",
  },

  routeRules: {
    // The docs open on the introduction. The raw copy of the page that used to
    // live at /docs keeps working too, since agents may have it bookmarked. Both
    // are permanent, so search engines pass what they know on to the target.
    "/docs": { redirect: { to: "/docs/getting-started/introduction", statusCode: 301 } },
    "/raw/docs.md": { redirect: { to: "/raw/docs/getting-started/introduction.md", statusCode: 301 } },
    // Editors that run in the browser, like vscode.dev, fetch the contract schema
    // from their own origin. It's a file for editors, not a page, so it's kept out
    // of search results.
    "/schemas/**": {
      headers: { "Access-Control-Allow-Origin": "*", ...NOINDEX },
    },
    // Hashed build assets never change, so cache them forever.
    "/_nuxt/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
    "/**": {
      headers: SECURITY_HEADERS,
    },
  },

  nitro: {
    // Cloudflare compresses at the edge.
    compressPublicAssets: false,
    prerender: {
      crawlLinks: true,
      // /docs only redirects, so crawling the docs starts from the introduction, and
      // the changelog's entries are crawled from /changelog. The crawler only follows
      // links without an extension or to .json, so the contracts are listed too.
      routes: [
        "/",
        "/docs",
        "/docs/getting-started/introduction",
        "/changelog",
        ...contracts.map(({ path }) => path),
      ],
      failOnError: true,
    },
  },

  $development: {
    runtimeConfig: {
      public: {
        // The MCP server `pnpm dev:mcp` serves (mcp/port.mjs).
        mcpUrl: `http://localhost:${MCP_DEV_PORT}/mcp`,
      },
    },
  },

  $production: {
    nitro: {
      // Emits _headers/_redirects for Cloudflare Pages from routeRules. Build-only:
      // under a Cloudflare preset, `nuxt dev` serves Nuxt Content's browser database
      // from a dump frozen at startup, so after a reload the docs show stale content.
      preset: "cloudflare_pages_static",
    },
  },

  hooks: {
    // Workers rejects the `/* /404.html 404` fallback the preset writes to _redirects
    // (404 isn't a valid redirect status), failing the deploy. not_found_handling in
    // wrangler.jsonc serves 404.html instead. Registered here, not in nitro.hooks,
    // so it runs after the preset's compiled hook instead of replacing it.
    "nitro:init"(nitro) {
      nitro.hooks.hook("compiled", async () => {
        const file = join(nitro.options.output.dir, "_redirects");
        if (!existsSync(file)) return;
        const rules = (await readFile(file, "utf8"))
          .split("\n")
          .filter((line) => line && !/\s404$/.test(line));
        await (rules.length ? writeFile(file, rules.join("\n")) : rm(file));
      });
      // routeRules can't match a host or a file extension, so CRAWL_HEADERS go
      // after the preset's rules (it writes _headers in its own compiled hook).
      nitro.hooks.hook("compiled", async () => {
        const blocks = CRAWL_HEADERS.map(([path, headers]) =>
          [path, ...Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`)].join("\n"),
        );
        await appendFile(join(nitro.options.output.dir, "_headers"), `\n${blocks.join("\n")}\n`);
      });
    },
  },
});
