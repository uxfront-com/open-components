import { existsSync, readdirSync, readFileSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Features } from "lightningcss";
import { MCP_DEV_PORT } from "./mcp/port.mjs";
import { buildContract } from "./server/lib/contract";
import { SECURITY_HEADERS } from "./server/lib/headers";
import { docsPath } from "./server/lib/raw";

const SITE_URL = "https://opencomponents.dev";

// Docus reads the site URL from the environment: for canonical URLs, robots.txt
// and llms.txt at build time, and for the sitemap when it's prerendered.
process.env.NUXT_SITE_URL ||= SITE_URL;

// The docs pages with a contract, which server/middleware/raw-contract.ts serves at
// /raw/<path>.yaml: 3.components/1.button.md has /raw/docs/components/button.yaml.
const contracts = readdirSync("content/docs", { recursive: true, encoding: "utf8" }).flatMap((file) => {
  const source = file.endsWith(".md") ? readFileSync(join("content/docs", file), "utf8") : "";
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

  runtimeConfig: {
    public: {
      siteUrl: SITE_URL,
    },
  },

  // The docs header and title template (Docus falls back to the package name).
  site: {
    name: "Open Components",
  },

  // llms.txt points agents at the MCP server (mcp/), then lists the contracts and
  // their schema (public/schemas/contract.json), ahead of the pages Nuxt Content adds.
  llms: {
    sections: [
      {
        // The title newer versions of the MCP toolkit give the section they add to
        // llms.txt, on sites where it's on.
        title: "MCP Server",
        description:
          "This site's MCP server, over streamable HTTP: the contracts, every rule and the docs, a section at a time, for agents to build and review components with.",
        links: [
          {
            title: "Open Components MCP server",
            description: "Connect an MCP client to this URL, with no authentication",
            href: `${SITE_URL}/mcp`,
          },
          {
            title: "MCP Server",
            description: "How to connect it to Claude Code, Cursor, VS Code and other clients, and what it offers",
            href: `${SITE_URL}/raw${docsPath("1.getting-started/3.mcp-server.md")}.md`,
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

  // The site is static, so Docus's MCP server is off: our own, in mcp/, serves /mcp
  // as a Worker (see wrangler.jsonc). Docus's page menu still links to /mcp.
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
    // live at /docs keeps working too, since agents may have it bookmarked.
    "/docs": { redirect: "/docs/getting-started/introduction" },
    "/raw/docs.md": { redirect: "/raw/docs/getting-started/introduction.md" },
    // Editors that run in the browser, like vscode.dev, fetch the contract schema
    // from their own origin.
    "/schemas/**": {
      headers: { "Access-Control-Allow-Origin": "*" },
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
      // The MCP server (mcp/) answers /mcp and the install links under it, which
      // the MCP Server page links to, so the crawler leaves /mcp and below alone.
      ignore: [/^\/mcp(\/|\?|$)/],
      failOnError: true,
    },
  },

  $development: {
    nitro: {
      // `pnpm dev:mcp` serves the MCP server (mcp/port.mjs), and this sends /mcp and
      // /mcp/* to it, so the page menu's MCP links work in development too. Not
      // routeRules' `proxy`, which drops the Accept header MCP requests need.
      devProxy: {
        "/mcp": { target: `http://localhost:${MCP_DEV_PORT}/mcp`, changeOrigin: true },
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
    // Every page would otherwise prefetch the docs' lazy chunks (~75 of them),
    // which delays the homepage's fonts and stylesheet, and with them its LCP.
    "build:manifest"(manifest) {
      for (const chunk of Object.values(manifest)) chunk.prefetch = false;
    },
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
    },
  },
});
