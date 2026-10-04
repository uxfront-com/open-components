import { SECURITY_HEADERS } from "../server/lib/headers";
import { MCP_DEV_PORT } from "./port.mjs";

// The MCP server at https://opencomponents.dev/mcp, built on the Nuxt MCP Toolkit
// (https://mcp-toolkit.nuxt.dev). It's a Nuxt app of its own: the site is static
// (`nuxt generate`), and the toolkit needs a server. `nuxt build mcp` builds it for
// Cloudflare Workers into mcp/.output, and wrangler.jsonc runs it for /mcp, /mcp/
// and /mcp/deeplink (assets.run_worker_first), while dist/ serves everything else,
// the 404 page included.
//
// It serves the standard as it is in content/docs/ and app/reference/ when it's
// built (modules/standard.ts): a Worker has no file system or Nuxt Content database.
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  // `pnpm dev:mcp`, which `pnpm dev` proxies /mcp to.
  devServer: { port: MCP_DEV_PORT },

  // Local modules in mcp/modules/ register themselves: standard.ts bundles the
  // standard, and web-transport.ts serves MCP requests on Workers.
  modules: ["@nuxtjs/mcp-toolkit"],

  mcp: {
    // Also the name MCP clients install it under, from /mcp/deeplink.
    name: "open-components",
    version: "1.0.0",
    description:
      "The Open Components standard for UI components: contracts, checklist rules, docs and reference implementations, for building and reviewing components that meet it.",
    // Clients add these to the agent's system prompt.
    instructions: [
      "Open Components (https://opencomponents.dev) is a standard for UI components. Each component's page covers its UI (how it looks), then holds it to three layers: UX (user experience), DX (developer experience) and AX (agentic experience). Every shipped component, and every foundation like Design Tokens, has a contract: its API, its DOM contract, its states, its tokens and every rule in its checklist. Each rule has a stable ID, like button/keep-focus, a level (must or should) and, for components, a scope: component (met by the component itself), usage (met by the code that uses it) or both.",
      "How to use this server:",
      "1. list-components shows what the standard covers, shipped or planned, and the names the other tools take. search-docs finds where a topic is covered.",
      "2. Read the contract first, with get-contract: it holds every requirement in a fraction of the page's length. Read the page with get-page only for the reasoning or the examples behind a rule, a few sections at a time and in your framework, since component pages are too long to read whole.",
      "3. To build a component, read its contract, then get-reference-implementation for a tested Vue 3 implementation and the tests to port. Check your work against the rules with a component or both scope.",
      '4. To review code, use list-rules with the component and a scope: ["component", "both"] for the component itself, ["usage", "both"] for a screen that uses it. Report every rule as pass or fail, with its ID and the evidence from the code.',
      "5. A component meets the standard when it meets every must rule. Each should rule is expected unless there's a good reason not to follow it.",
      "6. Cite rule IDs exactly as this server writes them, and never make one up.",
      "7. Planned components have no page or contract yet. Hold them to the three layers and Design Tokens, following the Button's structure, as the build-component prompt does.",
      "The guidelines are licensed under CC BY 4.0, so credit Open Components when you reuse them.",
    ].join("\n"),
    // Browsers that open /mcp land on the page about connecting to it.
    browserRedirect: "/docs/getting-started/mcp-server",
    // Any origin can call it: the toolkit's check stops sites calling a server on
    // your own machine, while this one is public, read-only and takes no
    // credentials. Web-based clients may send their own origin (server/mcp/index.ts
    // adds the CORS headers browsers need).
    security: { allowedOrigins: "*" },
  },

  // Nothing renders pages: no Vue client or server bundle, and no Vue renderer in
  // the Worker, which only serves the toolkit's routes.
  builder: { bundle: async () => {} },
  experimental: { noVueServer: true },

  // dist/_headers only applies to static assets, so the Worker sets the site's
  // security headers on its own responses.
  routeRules: {
    "/**": { headers: SECURITY_HEADERS },
  },

  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      // wrangler.jsonc at the repository's root deploys it, along with dist/, so
      // Nitro doesn't write a config of its own. Workers Builds sets WORKERS_CI,
      // which would otherwise have it write one pointing at mcp/.output/public.
      deployConfig: false,
      // wrangler.jsonc turns on nodejs_compat, for AsyncLocalStorage and Buffer.
      nodeCompat: true,
    },
  },
});
