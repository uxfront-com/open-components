# Contributing to Open Components

This repository holds the Open Components standard and the static Nuxt site that publishes it at https://opencomponents.dev: the homepage and the documentation at `/docs`, prerendered and deployed to Cloudflare Workers as static assets, along with the MCP server at `/mcp`. It's part of the UXFront family, built on the same homepage kit as [uxfront.com](https://github.com/uxfront-com/uxfront/tree/main/apps/web), with the docs on [Docus](https://docus.dev).

Found a bug, or a gap in the guidelines? Search the [existing issues](https://github.com/uxfront-com/open-components/issues?q=is%3Aissue) first, then [open a new one](https://github.com/uxfront-com/open-components/issues/new/choose): a guideline proposal, or a site bug. To change the guidelines themselves, edit the markdown in `content/docs/` (see [The docs](#the-docs)) and open a pull request. Everyone taking part agrees to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

The site code is released under the [MIT License](../LICENSE), and the guidelines in `content/` under [CC BY 4.0](../content/LICENSE). By contributing, you agree to release your changes under the same licenses.

## Commands

```bash
pnpm dev              # dev server on http://localhost:3000, which proxies /mcp and /mcp/* to `pnpm dev:mcp`
pnpm dev:mcp          # the MCP server, on http://localhost:3100/mcp outside Conductor (see "The MCP server")
pnpm build            # nuxt generate → dist, then nuxt build mcp → mcp/.output
pnpm preview          # serve the generated site
pnpm check-types      # type-check the .ts and .vue sources, the MCP server's included (see "The docs" for what it skips)
pnpm check-reference  # check the component pages show app/reference/ as it is
pnpm check-mcp        # after `pnpm build`: serve dist and the MCP server with wrangler dev, and check every tool, resource and prompt against the built site
pnpm test             # run the reference implementations' tests (app/reference/<component>/*.test.ts), validate the contracts and test the MCP server
pnpm lighthouse       # Lighthouse CI against dist, fails below 100 in any category (add new routes to `url` in `lighthouserc.json`)
```

Building needs Node 22.13 or later: Nuxt Content reads the docs with the built-in `node:sqlite`. `better-sqlite3`, its fallback, is installed but never built (`allowBuilds` in `pnpm-workspace.yaml`).

## Deploying to Cloudflare

Workers Builds deploys one Worker, configured in `wrangler.jsonc`, with `dist` as its static assets and the MCP server (`mcp/.output/server/index.mjs`, see [The MCP server](#the-mcp-server)) as its script, `main`:

- Build command: `pnpm run build`
- Deploy command: `npx wrangler deploy`
- Non-production branch deploy command: `npx wrangler preview`
- Build variable: `NUXT_PUBLIC_AMPLITUDE_API_KEY`, the Amplitude project's API key (see [Analytics](#analytics))

Keep `wrangler.jsonc`: without it, `wrangler deploy` auto-configures Nuxt for SSR and fails on the static build. Keep its `previews` block too, even though it's empty: `wrangler preview` refuses to run without it. Run `npx wrangler dev` after `pnpm build` to serve `dist` and the MCP server the way Cloudflare will. `pnpm check-mcp` does the same, then checks the server.

`assets.run_worker_first` sends `/mcp`, `/mcp/` and `/mcp/deeplink` to the script, and nothing else: every other request is a static asset or the 404 page, and never runs the Worker. Without the list, requests that aren't navigations, like an agent's `fetch`, would reach the script whenever no asset matches, rather than the 404 page. It lists the routes the site uses rather than `/mcp/*`, so the toolkit's others stay off it: its `/mcp/badge.svg` writes its query into the SVG unescaped, so a crafted link would run script on the site (`mcp/server/middleware/badge.ts` turns it away in the Worker too). Requests for static assets are free and unlimited, so only these requests count as Worker requests: on the Workers Free plan, 100,000 a day for the whole account (past that, they fail while the site stays up), with 10 ms of CPU time each.

`compatibility_flags` turns on `nodejs_compat`, for the server's `AsyncLocalStorage` and `Buffer` (`cloudflare.nodeCompat` in `mcp/nuxt.config.ts`). `dist/_headers` only applies to static assets, so the server sets the same security headers on its own responses: both `nuxt.config.ts` files read them from `server/lib/headers.ts`. `cloudflare.deployConfig: false` there stops Nitro from writing a wrangler config of its own, pointing at the server's empty `mcp/.output/public`, which it would otherwise do on Workers Builds, since that sets `WORKERS_CI`.

The `cloudflare_pages_static` preset turns `routeRules` headers in `nuxt.config.ts` into a `_headers` file (immutable caching for `/_nuxt/**`, security headers for every route), which Workers static assets apply. The preset also writes a `/* /404.html 404` fallback to `_redirects`, which the Workers API rejects, so a `nitro:init` hook in `nuxt.config.ts` strips 404 rules; `not_found_handling` in `wrangler.jsonc` serves `404.html` with a 404 instead.

## The homepage

The page (`app/pages/index.vue`) holds the copy and the order of the formations. Everything else comes from the UXFront homepage kit:

- [`@uxfront/layer-ui`](https://github.com/uxfront-com/uxfront/tree/main/packages/layer-ui), extended in `nuxt.config.ts`: auto-imports the components, self-hosts the fonts, adds `useUxHead()` and keeps the critical path clean.
- [`@uxfront/ui`](https://github.com/uxfront-com/uxfront/tree/main/packages/ui): the Vue components (`UxSite`, `UxHero`, `UxChapter`, `UxFinale`, the HUD, the header, the pinned labels) and the design tokens.
- [`@uxfront/scene`](https://github.com/uxfront-com/uxfront/tree/main/packages/scene): the WebGL particle scene and its formations.

Every section but the finale shows the `plates` formation, Open Components' three glass plates drawn with the UX, DX and AX line art. The hero shows the stack drawn apart, with a callout per plate, and the UX, DX and AX chapters close in on one plate each, lighting it. The finale closes on the `corridor`. It shows the UXFront mark and a link to the documentation (`UxFinale`'s `mark` and `actions` slots), and the header signs the wordmark "by UXFront" (`UxHeader`'s `byline` slot).

`app/lib/formations.ts` adapts the catalog formation for that:

- `hold(formation, local)` freezes a formation's progress. The scene jumps a formation to its end state once the page scrolls past its section, which only a pinned section reaches smoothly. The hero isn't pinned, so it holds the stack drawn apart from the start.
- `spotlight(formation, plate)` lights one plate and dims the other two.
- `share(formation, source)` reads the artwork's uniforms from an earlier `plates` in the scene instead of declaring its own. WebGL2 only guarantees 256 vertex uniform vectors, and about four in ten Android devices stop there ([Web3D Survey](https://web3dsurvey.com/webgl2/parameters/MAX_VERTEX_UNIFORM_VECTORS)). One `plates` declares ~146, so without sharing, even two of them would send those devices to the static fallback.

Motion follows `prefers-reduced-motion` and the Motion toggle in the HUD. Below 1100px wide, or on screens squarer than 5:4, the formations move to the top and the copy scrolls over them (`STACKED_QUERY` in `@uxfront/scene`).

## The docs

The documentation is built with [Docus](https://docus.dev), through [`@uxfront/layer-docs`](https://github.com/uxfront-com/uxfront/tree/main/packages/layer-docs), the second layer in `nuxt.config.ts`. Pages are markdown files in `content/docs/`, served under `/docs`. Number files and folders to order them in the sidebar, as in `1.getting-started/1.introduction.md`, which is served at `/docs/getting-started/introduction`. `/docs` itself redirects to the introduction (`routeRules` in `nuxt.config.ts`). From those files, Docus builds the sidebar, search, table of contents, a markdown copy of each page at `/raw/<path>.md`, `llms.txt`, `llms-full.txt`, `sitemap.xml` and each page's Open Graph image.

How it shares the app with the homepage:

- `app/app.vue` replaces Docus's own, so it renders the Docus shell (header, sidebar, search), loaded lazily from `docus/app/app.vue`, on `/docs`, `/changelog` and below, and the bare page everywhere else. `app/error.vue` still renders `UxErrorPage`, docs included.
- The docs header links to the docs and the changelog (`useHeaderLinks()`): beside its buttons from 768px up (`app/components/app/AppHeaderCTA.vue`), and at the top of its menu on smaller screens (`app/components/app/AppHeaderBody.vue`, which replaces the one from `@uxfront/layer-docs`, so keep it in step with the layer's).
- Docus adds Tailwind CSS and Nuxt UI to the entry stylesheet. On the homepage, `@uxfront/layer-ui` loads that stylesheet after first paint, and the `.ux-site` styles take precedence over it. Keep `app/app.css`, which Docus imports into the same stylesheet, off `.ux-site` too.
- `nuxt.config.ts` turns off Nuxt's prefetch hints. Otherwise every page, the homepage included, would prefetch the docs' lazy chunks, which delays the homepage's fonts and stylesheet, and with them its LCP.
- `app/app.config.ts` sets the theme colors and the GitHub, "Edit this page" and "Report an issue" links. `app/app.css` darkens Nuxt UI's light-mode primary to pass WCAG AA contrast. Nuxt UI's callouts (`::tip`, `::note`, …) still draw their text in fixed shades that fail it in light mode, so avoid them until they're themed.
- Docus reads the site URL from `NUXT_SITE_URL`, which `nuxt.config.ts` defaults to the production origin, and generates `robots.txt` (with `@nuxtjs/robots`). Don't add a `public/robots.txt`: the module renames it to `_robots.txt` and merges it in.
- The site is static, so Docus's MCP server is off (`mcp.enabled` in `nuxt.config.ts`), and so is its AI assistant, which only starts with an `AI_GATEWAY_API_KEY`. Our MCP server is a Nuxt app of its own, in `mcp/` (see [The MCP server](#the-mcp-server)), and the page menu's "Copy MCP Server URL" and "Add MCP Server" point at it.
- In content, link to the generated files (`/llms.txt`, `/raw/…`) with `{external}`, as the introduction does. Otherwise the router handles the click and shows the 404 page.
- `server/middleware/raw-markdown.ts` serves `/raw/<path>.md` from the page's source file. Nuxt Content's own route rebuilds it from the parsed page and writes tables as unescaped HTML, which agents, and Docus's "Copy page", then read.
- `server/middleware/raw-contract.ts` serves `/raw/<path>.yaml`, the page's contract: the YAML block under its `### Described` heading, with every row of its `## Checklist` tables in place of the `rules:` link (`server/lib/contract.ts`). The tables are read by their header row, so keep the column names (Rule, Level, Scope, Requirement and Check), and name a table's heading after its layer, as in `### UX rules`. `nuxt.config.ts` lists the contracts to prerender, and in `llms.txt`.
- `public/schemas/contract.json` is the JSON Schema every contract follows, published at `/schemas/contract.json` and named on each contract's first line for editors that use the YAML language server. `pnpm test` validates every contract against it (`server/lib/contract.test.ts`, also in CI), so when a Described block gains a field, or a checklist a new level or column, add it to the schema in the same change.
- Live examples are Vue components in `app/components/content/<component>/` (like `button/examples/ButtonVariantsExample.vue`), which `app/app.css` adds to Tailwind's sources. They render the reference implementations in `app/reference/`, which the component pages also show as code: when you change one, update the other, and `pnpm check-reference` (run in CI) confirms they match. That includes each component's tests, like `app/reference/button/Button.test.ts`, which `pnpm test` runs on [Vitest](https://vitest.dev) (also in CI).
- Name the CSS variables in the reference implementations as token paths, with a double dash between groups and single dashes inside a name, like `--color--primary-contrast` or `--button--icon--size`. The [Design Tokens](../content/docs/2.foundations/1.design-tokens.md) page describes the convention, and has a Stylelint rule that checks it.

Docus ships its sources uncompiled, and they don't type-check against this app's dependencies. `pnpm check-types` runs `vue-tsc` and fails on any error outside them.

### Examples per framework

Write an example once per framework in a `::framework-switcher`, one slot per framework:

````md
::framework-switcher
#react
```tsx [Button.tsx]
…
```

#vue
```vue [Button.vue]
…
```
::
````

It shows the code for the framework picked in the Framework select above the sidebar, which is kept across visits. The frameworks, their order and their slot names (the `value`s) are in `app/data/frameworks.ts`, which `docsTheme.frameworks` in `app/app.config.ts` reads, as in [styleframe's docs](https://www.styleframe.dev/docs/theme/components/button). The MCP server reads them too, and `pnpm test` fails on a slot that isn't one of them. A page doesn't have to cover them all: a missing framework shows the first one the page has, with a note saying so.

The switcher and the select come from `@uxfront/layer-docs`, which also bundles the framework icons named in `app/data/frameworks.ts`, and on phones puts the select in the header's menu. Docus only highlights a few languages, and the layer adds the ones the examples need (`tsx`, `svelte`, `angular-html`, `angular-ts` and `astro`). Add any other to `content.build.markdown.highlight.langs` in `nuxt.config.ts`.

A live example takes the switcher as its code. Nest the switcher with as many colons as the example: remark-mdc only gives `#react` and the other slots to a nested component written that way, and with `:::framework-switcher` they'd go to the example instead.

````md
::button-variants-example
::framework-switcher
#react
```tsx
<Button color="primary">Solid</Button>
```

#vue
```vue
<Button color="primary">Solid</Button>
```
::
::
````

The code is written for a component with the same API in every framework, in each one's idiom. React and Solid take `leading` and `trailing` as props, Svelte as snippets and Astro as named slots. Angular puts the component on the native element (`<button appButton>`), so it can stay the root, and projects icons by attribute (`<lucide-icon leading … />`). Vanilla writes out the markup from the component's DOM contract, with a script for the behaviour.

## The changelog

`/changelog` lists what's new in the standard, newest first, with each entry in full, and every entry also has a page of its own at `/changelog/<file name>`. Entries are markdown files in `content/changelog/`, in the `changelog` collection (`content.config.ts`):

```md
---
title: The Button
description: Our first component page, on building a button that looks right, …
date: 2026-10-01
category: Components
link:
  label: Read the Button page
  to: /docs/components/button
---

Buttons are the most common interactive component in any interface, and also the one we most often get wrong. …

## New

- It covers how a button looks, how it behaves for every person and every input, …
```

- Keep it high level: a couple of sentences on what's new and why it matters, then a few short points, leaving the details to the page it links to. Write it the way the docs pages are written, talking to the reader in full sentences rather than lists of features.
- `date` is the day it was published, and orders the entries. When two entries share a day, give the later one a time too, in UTC, as in `2026-10-04T12:00:00Z`, so it comes first. The page still shows the day. `category` is the badge beside it, usually the docs section, and `link` the page to read more on.
- Group the notes under `## New`, `## Improved` and `## Fixed`, leaving out any you don't need. On `/changelog`, where each entry's title is an `<h2>`, they move down a level, and only get anchor links on the entry's own page, since every entry has a New section.
- Name the file after what it adds, as in `design-tokens.md`, since it's the entry's URL. The crawler finds the entries' pages from `/changelog`, and `sitemap.xml` lists them all.
- `app/pages/changelog/` holds the two pages, and `app/components/changelog/ChangelogEntry.vue` the entry they both show. Their Tailwind classes are listed in `app/app.css`'s sources, along with the header's.

## The MCP server

`mcp/` is the [MCP server](../content/docs/1.getting-started/3.mcp-server.md) at https://opencomponents.dev/mcp, built on the [Nuxt MCP Toolkit](https://mcp-toolkit.nuxt.dev). It's a Nuxt app of its own, which `nuxt build mcp` builds for Cloudflare Workers (the `cloudflare_module` preset) into `mcp/.output`, rather than part of the site: the toolkit does nothing under `nuxt generate`, and a Worker has no file system or Nuxt Content database to read the docs from. So keep `mcp.enabled` false in the root `nuxt.config.ts`. `mcp/nuxt.config.ts` holds the server's name (`open-components`, which clients install it under), its description and the instructions clients add to the agent's system prompt. It also leaves out Vue (`builder` and `experimental.noVueServer`), so the Worker only holds Nitro, the toolkit, the MCP SDK and the standard. A browser that opens `/mcp` is redirected to the MCP Server page (`browserRedirect`), and the toolkit also serves `/mcp/deeplink` (Cursor's install link, or VS Code's with `?ide=vscode`). Any origin can call the server (`security.allowedOrigins`), and `mcp/server/mcp/index.ts` adds the CORS headers browsers need: it's public and read-only and takes no credentials, so the toolkit's check, which stops websites calling a server on your own machine, would only turn away web-based clients. `llms.txt` points agents at the server too (`llms.sections` in `nuxt.config.ts`).

- **The data.** `buildStandard()` in `mcp/lib/standard.ts` reads the standard from the repository when the server is built: every page in `content/docs/` with its contract and checklist, the Roadmap, the reference implementations in `app/reference/` and `public/schemas/contract.json`. `mcp/modules/standard.ts` writes it to `mcp/.nuxt/standard/standard.json`, which Nitro bundles as a server asset, and `useStandard()` (`mcp/server/utils/standard.ts`) reads it once per Worker. It's a server asset rather than a virtual module because Nitro rewrites the code it inlines, so a page's `import.meta.env.DEV` or `typeof window` would change, or break the build, while server assets are bundled as they are. Only the names the tools' input schemas list, like the components', are in a virtual module, `#standard/names`. `pnpm dev:mcp` restarts when `content/docs/`, `app/reference/` or `public/schemas/` change. It runs on the port in `mcp/port.mjs`, which `pnpm dev` proxies `/mcp` to: `MCP_DEV_PORT`, or the one after Conductor's port for the workspace, so workspaces side by side don't share one, or 3100. Conductor's run scripts start it as `mcp`.
- **What it returns.** `get-contract` and the resources return the same bytes as `/raw/<path>.yaml` and `/raw/<path>.md`, built by `server/lib/raw.ts`, which the `/raw` middlewares use too. `get-page` reads the agent markdown that `mcp/lib/agent-markdown.ts` makes of a page instead: MDC components keep their content, links become absolute, and framework switchers are marked so `get-page` can keep one framework's examples. The rest of the logic is in `mcp/lib/` too, as pure functions without Nitro's auto-imports, so Vitest can test it.
- **The content it relies on.** On top of the conventions in [The docs](#the-docs):
  - Every page's frontmatter has a `title` and a `description`, and its file name, without its number, is unique across `content/docs/`, since the tools name pages by it.
  - A contract is the YAML block under a page's `### Described` heading, and its rules are the rows of the `## Checklist` tables: each table under a `### <Layer> rules` heading, as in `### UX rules`, or a single table right under `## Checklist`, as on Design Tokens. Every rule ID is unique, and every Check is one that `mcp/lib/rules.ts` knows, like `Unit test`, ``axe `button-name` `` or `Review`.
  - Headings are text and inline code, with no links, HTML, emphasis, components or `{#id}`, since MDC builds a heading's anchor from its text without them.
  - Examples per framework are in `::framework-switcher` slots named after `app/data/frameworks.ts`, with no headings inside a switcher: put them above it.
  - Besides block components, `:roadmap-check` and `{external}` on links, the MCP server doesn't know MDC syntax, so pages use no other inline components, like `:badge[New]`, or link attributes.
  - The Roadmap's `## Components` tables have a `:roadmap-check` row for every component, which becomes `:roadmap-check{shipped}` once its page, with a contract, has shipped.
  - A reference implementation is in `app/reference/<component>/`, named after its page, which has a `## Reference implementation` section.
  - The prompts in `mcp/lib/prompts.ts` say what the pages' Prompts sections say (the Button's `#### Prompts` and the Design Tokens' `### Prompts`), and `prompts.test.ts` checks that they do, so change them together.

  Content that breaks them doesn't fail the build, which would hold back the site too: `nuxt build mcp` warns about it, and `pnpm test` fails on it (`standard.test.ts`, also in CI).
- **Adding a tool.** Add a file to `mcp/server/mcp/tools/`: the toolkit names the tool after the file, in kebab-case, as in `get-contract.ts`. Mark it read-only (`annotations: READ_ONLY`), describe when to use it and when not to, give it `inputExamples`, and read the standard with `useStandard()`. Then name it in the instructions in `mcp/nuxt.config.ts`, in `TOOLS` in `scripts/check-mcp.mjs` and on the MCP Server page: `pnpm check-mcp` calls it with each of its `inputExamples`. Prompts and resources work the same way, in `mcp/server/mcp/prompts/` and `mcp/server/mcp/resources/`. Name a new prompt in `PROMPTS` in `scripts/check-mcp.mjs` too, and give it arguments in `filled` there. A resource's URI is the URL of a file the site publishes, which `pnpm check-mcp` compares it with, in `dist/`. Tools report bad input with `createError()`, which the toolkit turns into an error result the agent can read, while prompts and resources throw the SDK's `McpError` with `ErrorCode.InvalidParams`, which clients read as bad input rather than a server error.
- **The transport.** Under a Cloudflare preset, the toolkit hands MCP requests to the `agents` package, which pins its own copy of the MCP SDK, answers in server-sent events and more than doubles the Worker's size. `mcp/modules/web-transport.ts` swaps in the toolkit's other transport, the SDK's `WebStandardStreamableHTTPServerTransport`: stateless, with JSON responses, and built on fetch's `Request` and `Response`, which Workers have. It replaces a module inside the toolkit, so if an upgrade moves it, the build fails ("Cannot resolve agents/mcp") rather than the Worker. Keep the server stateless too: a Worker's isolates share no memory, so a session could end up on one that doesn't know it.
- **Checking it.** `pnpm check-mcp` (`scripts/check-mcp.mjs`, run in CI's build job) serves `dist` and the Worker with `wrangler dev` after `pnpm build`, and calls every tool, resource and prompt with the MCP SDK's client. It checks that contracts and pages come back as the same bytes as `/raw/<path>.yaml` and `/raw/<path>.md`, that every anchor the server points agents at is on its page, that only the MCP routes reach the Worker, with the site's security headers, that other origins can call it, and that no tool's result is longer than the 40,000 characters some clients pass on whole, like Gemini CLI (get-page returns an outline instead, `REPLY_LIMIT` in `mcp/lib/pages.ts`). `--url` checks a server that's already running, like a preview's, against your local `pnpm build`, so build the same commit first.

## Analytics

Amplitude Analytics and Session Replay come from `modules/amplitude.ts`, a local Nuxt module, and are built in when `NUXT_PUBLIC_AMPLITUDE_API_KEY` is set (`.env.example` lists it for local builds; use a separate project's key there). Without it, as in CI, none of it is built in, Partytown included.

- The Browser SDK runs in a web worker with [Partytown](https://partytown.qwik.dev), loaded from Amplitude's CDN at a pinned version (`SDK_URL`). It tracks sessions, marketing attribution and page views, client-side navigations included and the homepage's chapter links (hash changes) not.
- The SDK's two scripts are rendered on the server only. Partytown retypes the scripts it has run, so the client's head would no longer find them, add them again, and Partytown would run the SDK twice.
- Element interactions (autocaptured clicks) stay off: from the worker, the SDK can't read the clicked element. Web vitals and network tracking would watch the worker instead of the page, so leave them off in the project's remote autocapture settings too.
- The rest of the site tracks events with `window.amplitude?.track()`, which Partytown forwards to the worker. `app/plugins/framework-selected.client.ts` tracks "Framework Selected" when a reader picks a framework in the Framework select. Only track what keeps the reader on the page: an event tracked as it unloads, like a click on a link to another page, doesn't reach the worker in time.
- Session Replay records the DOM, which a worker can't, so it runs on the main thread with the standalone SDK, once the page is idle (`modules/amplitude/runtime/session-replay.ts`). The worker hands it the device and session IDs the Browser SDK tracks under, and the new ones when a session ends, and Amplitude links each replay to its session's events by them. `amplitude.sessionReplaySampleRate` in `nuxt.config.ts` sets the share of sessions it records until the project's Session Replay settings set one.
- `pnpm-workspace.yaml` overrides the Partytown version `@nuxtjs/partytown` asks for: 0.11 reads the deprecated `attributionSrc` of every element, and the deprecation it logs costs the homepage its Best Practices 100.

With Amplitude built in, the homepage keeps its Lighthouse scores in Performance (no added Total Blocking Time), Accessibility and SEO, and in Best Practices as long as the key is valid: Amplitude's errors for a wrong key fail it.

## Keeping 100s as the site grows

- The first paint depends on the prerendered HTML alone: the `@uxfront/ui` components inline every style they use, and `@uxfront/layer-ui` loads the web fonts, the entry stylesheet and the app bundle only after the browser reports the first contentful paint. Don't add render-blocking resources, and load heavy code with dynamic `import()` (the WebGL engine is only imported once the page is idle).
- Images: use `@nuxt/image` (explicit width/height, AVIF/WebP, lazy loading below the fold).
- Third-party scripts: avoid them, run them in Partytown's worker like Amplitude (see [Analytics](#analytics)), or load via `@nuxt/scripts` with `trigger: 'onNuxtReady'`.
- Every page needs a title, a meta description, a canonical link and a single `<h1>` (see `app/pages/index.vue`).
- `lighthouserc.json` covers the homepage. The docs pages are Docus's theme as it ships, which scores below 100 in performance and accessibility, so they're not in it yet. The Lighthouse CI server also doesn't resolve `/docs` to `docs.html` the way Cloudflare does: measure them on `npx wrangler dev` instead.
