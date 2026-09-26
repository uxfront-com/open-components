# Open Components

Static Nuxt site for https://opencomponents.dev, prerendered and deployed to Cloudflare Workers as static assets. It's part of the UXFront family, built on the same homepage kit as [uxfront.com](https://github.com/uxfront-com/uxfront/tree/main/apps/web).

## Commands

```bash
pnpm dev          # dev server on http://localhost:3000
pnpm build        # nuxt generate → dist
pnpm preview      # serve the generated site
pnpm check-types  # type-check the .ts and .vue sources
pnpm lighthouse   # Lighthouse CI against dist, fails below 100 in any category (add new routes to `url` in `lighthouserc.json`)
```

## Deploying to Cloudflare

Workers Builds deploys `dist` as a static-assets-only Worker, configured in `wrangler.jsonc`:

- Build command: `pnpm run build`
- Deploy command: `npx wrangler deploy`
- Non-production branch deploy command: `npx wrangler preview`

Keep `wrangler.jsonc`: without it, `wrangler deploy` auto-configures Nuxt for SSR and fails on the static build. Keep its `previews` block too, even though it's empty: `wrangler preview` refuses to run without it. Run `npx wrangler dev` after `pnpm build` to serve `dist` the way Cloudflare will.

The `cloudflare_pages_static` preset turns `routeRules` headers in `nuxt.config.ts` into a `_headers` file (immutable caching for `/_nuxt/**`, security headers for every route), which Workers static assets apply. The preset also writes a `/* /404.html 404` fallback to `_redirects`, which the Workers API rejects, so a `nitro:init` hook in `nuxt.config.ts` strips 404 rules; `not_found_handling` in `wrangler.jsonc` serves `404.html` with a 404 instead.

## The homepage

The page (`app/pages/index.vue`) holds the copy and the order of the formations. Everything else comes from the UXFront homepage kit:

- [`@uxfront/layer-ui`](https://github.com/uxfront-com/uxfront/tree/main/packages/layer-ui), extended in `nuxt.config.ts`: auto-imports the components, self-hosts the fonts, adds `useUxHead()` and keeps the critical path clean.
- [`@uxfront/ui`](https://github.com/uxfront-com/uxfront/tree/main/packages/ui): the Vue components (`UxSite`, `UxHero`, `UxChapter`, `UxFinale`, the HUD, the header, the pinned labels) and the design tokens.
- [`@uxfront/scene`](https://github.com/uxfront-com/uxfront/tree/main/packages/scene): the WebGL particle scene and its formations.

Every section but the finale shows the `plates` formation, Open Components' three glass plates drawn with the UX, DX and AX line art. The hero shows the stack drawn apart, with a callout per plate, and the UX, DX and AX chapters close in on one plate each, lighting it. The finale closes on the `corridor`. It's `app/components/OcFinale.vue`, `UxFinale`'s layout with the UXFront mark and a link to the documentation, since `UxFinale` has no slot for either. Likewise, `app/components/OcHeader.vue` is `UxHeader` with a "by UXFront" link beside the wordmark, since `UxHeader`'s brand is a single link.

`app/lib/formations.ts` adapts the catalog formation for that:

- `hold(formation, local)` freezes a formation's progress. The scene jumps a formation to its end state once the page scrolls past its section, which only a pinned section reaches smoothly. The hero isn't pinned, so it holds the stack drawn apart from the start.
- `spotlight(formation, plate)` lights one plate and dims the other two.
- `share(formation, source)` reads the artwork's uniforms from an earlier `plates` in the scene instead of declaring its own. WebGL2 only guarantees 256 vertex uniform vectors, and about four in ten Android devices stop there ([Web3D Survey](https://web3dsurvey.com/webgl2/parameters/MAX_VERTEX_UNIFORM_VECTORS)). One `plates` declares ~146, so without sharing, even two of them would send those devices to the static fallback.

Motion follows `prefers-reduced-motion` and the Motion toggle in the HUD. Below 1100px wide, or on screens squarer than 5:4, the formations move to the top and the copy scrolls over them (`STACKED_QUERY` in `@uxfront/scene`).

## Keeping 100s as the site grows

- The first paint depends on the prerendered HTML alone: the `@uxfront/ui` components inline every style they use, and `@uxfront/layer-ui` loads the web fonts, the entry stylesheet and the app bundle only after the browser reports the first contentful paint. Don't add render-blocking resources, and load heavy code with dynamic `import()` (the WebGL engine is only imported once the page is idle).
- Images: use `@nuxt/image` (explicit width/height, AVIF/WebP, lazy loading below the fold).
- Third-party scripts: avoid them, or load via `@nuxt/scripts` with `trigger: 'onNuxtReady'`.
- Every page needs a title, a meta description, a canonical link and a single `<h1>` (see `app/pages/index.vue`).
