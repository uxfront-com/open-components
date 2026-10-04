# Contributing to Open Components

This repository holds the Open Components standard and the static Nuxt site that publishes it at https://opencomponents.dev: the homepage and the documentation at `/docs`, prerendered and deployed to Cloudflare Workers as static assets. It's part of the UXFront family, built on the same homepage kit as [uxfront.com](https://github.com/uxfront-com/uxfront/tree/main/apps/web), with the docs on [Docus](https://docus.dev).

Found a bug, or a gap in the guidelines? Search the [existing issues](https://github.com/uxfront-com/open-components/issues?q=is%3Aissue) first, then [open a new one](https://github.com/uxfront-com/open-components/issues/new/choose): a guideline proposal, or a site bug. To change the guidelines themselves, edit the markdown in `content/docs/` (see [The docs](#the-docs)) and open a pull request. Everyone taking part agrees to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

The site code is released under the [MIT License](../LICENSE), and the guidelines in `content/` under [CC BY 4.0](../content/LICENSE). By contributing, you agree to release your changes under the same licenses.

## Commands

```bash
pnpm dev              # dev server on http://localhost:3000
pnpm build            # nuxt generate → dist
pnpm preview          # serve the generated site
pnpm check-types      # type-check the .ts and .vue sources (see "The docs" for what it skips)
pnpm check-reference  # check the component pages show app/reference/ as it is
pnpm test             # run the reference implementations' tests (app/reference/<component>/*.test.ts) and validate the contracts
pnpm lighthouse       # Lighthouse CI against dist, fails below 100 in any category (add new routes to `url` in `lighthouserc.json`)
```

Building needs Node 22.13 or later: Nuxt Content reads the docs with the built-in `node:sqlite`. `better-sqlite3`, its fallback, is installed but never built (`allowBuilds` in `pnpm-workspace.yaml`).

## Deploying to Cloudflare

Workers Builds deploys `dist` as a static-assets-only Worker, configured in `wrangler.jsonc`:

- Build command: `pnpm run build`
- Deploy command: `npx wrangler deploy`
- Non-production branch deploy command: `npx wrangler preview`
- Build variable: `NUXT_PUBLIC_AMPLITUDE_API_KEY`, the Amplitude project's API key (see [Analytics](#analytics))

Keep `wrangler.jsonc`: without it, `wrangler deploy` auto-configures Nuxt for SSR and fails on the static build. Keep its `previews` block too, even though it's empty: `wrangler preview` refuses to run without it. Run `npx wrangler dev` after `pnpm build` to serve `dist` the way Cloudflare will.

The `cloudflare_pages_static` preset turns `routeRules` headers in `nuxt.config.ts` into a `_headers` file (immutable caching for `/_nuxt/**`, security headers for every route), which Workers static assets apply. The preset also writes a `/* /404.html 404` fallback to `_redirects`, which the Workers API rejects, so a `nitro:init` hook in `nuxt.config.ts` strips 404 rules; `not_found_handling` in `wrangler.jsonc` serves `404.html` with a 404 instead.

## The homepage

The page (`app/pages/index.vue`) holds the copy and the order of the formations. Everything else comes from the UXFront homepage kit:

- [`@uxfront/layer-ui`](https://github.com/uxfront-com/uxfront/tree/main/packages/layer-ui), extended in `nuxt.config.ts`: auto-imports the components, self-hosts the fonts, adds `useUxHead()` and keeps the critical path clean.
- [`@uxfront/ui`](https://github.com/uxfront-com/uxfront/tree/main/packages/ui): the Vue components (`UxSite`, `UxHero`, `UxChapter`, `UxFinale`, the HUD, the header, the pinned labels) and the design tokens.
- [`@uxfront/scene`](https://github.com/uxfront-com/uxfront/tree/main/packages/scene): the WebGL particle scene and its formations.

Every section but the finale shows the `plates` formation, Open Components' three glass plates drawn with the UX, DX and AX line art. The hero shows the stack drawn apart, with a callout per plate, and the UX, DX and AX chapters close in on one plate each, lighting it. The finale closes on the `corridor`. It shows the UXFront mark and a link to the documentation (`UxFinale`'s `mark` and `actions` slots), and the header signs the wordmark "by UXFront" (`UxHeader`'s `byline` slot).

`app/lib/formations.ts` adapts the catalog formation for that:

- `hold(formation, local)` freezes a formation's progress. A section plays its formation through while it fills the screen, give or take a quarter screen. The hero starts at the top of the page, so it only gets the first quarter screen of scroll and the stack would rush apart the moment the page scrolls. It holds the stack drawn apart from the start instead.
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
- The site is static, so Docus's MCP server is off (`mcp.enabled` in `nuxt.config.ts`), and so is its AI assistant, which only starts with an `AI_GATEWAY_API_KEY`.
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

It shows the code for the framework picked in the Framework select above the sidebar, which is kept across visits. The frameworks, their order and their slot names (the `value`s) are `docsTheme.frameworks` in `app/app.config.ts`, as in [styleframe's docs](https://www.styleframe.dev/docs/theme/components/button). A page doesn't have to cover them all: a missing framework shows the first one the page has, with a note saying so.

The switcher and the select come from `@uxfront/layer-docs`, which also bundles the framework icons named in `app/app.config.ts`, and on phones puts the select in the header's menu. Docus only highlights a few languages, and the layer adds the ones the examples need (`tsx`, `svelte`, `angular-html`, `angular-ts` and `astro`). Add any other to `content.build.markdown.highlight.langs` in `nuxt.config.ts`.

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
- `date` is the day it was published, and orders the entries. `category` is the badge beside it, usually the docs section, and `link` the page to read more on.
- Group the notes under `## New`, `## Improved` and `## Fixed`, leaving out any you don't need. On `/changelog`, where each entry's title is an `<h2>`, they move down a level, and only get anchor links on the entry's own page, since every entry has a New section.
- Name the file after what it adds, as in `design-tokens.md`, since it's the entry's URL. The crawler finds the entries' pages from `/changelog`, and `sitemap.xml` lists them all.
- `app/pages/changelog/` holds the two pages, and `app/components/changelog/ChangelogEntry.vue` the entry they both show. Their Tailwind classes are listed in `app/app.css`'s sources, along with the header's.

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
