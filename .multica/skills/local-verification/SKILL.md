---
name: local-verification
description: The environment book for Multica runs. Checkout and branch handling for Engineer and QA (the daemon's agent branch, pushing, draft PRs, fresh re-checkout), fresh-checkout setup order, build and check discipline, the no-background-process rule, what counts as verification, and a project section with the current project's install, build, test, and browser-harness commands and traps. Consult before running anything for the first time in a run and before diagnosing a "broken environment".
---

# Local verification

Every Multica run starts in a fresh or reused checkout under `workdir/<repo>`. Most "broken environment" reports are one of the traps in the **Project** section. Check there before debugging infrastructure someone already debugged.

## Checkout and branches

`multica repo checkout <url>` creates the checkout from the daemon's bare-clone cache on a branch named `agent/<agent>/<task>` that tracks `origin/<default-branch>`. That branch belongs to the daemon: a plain `git push` from it fails, and its name links to no issue. Always work on your own branch.

**Engineer, first run on a sub-issue:**

```bash
multica repo checkout <url>
cd <repo>
git switch -c <branch>                       # naming rule in squad-protocol
# … work, commit …
git push -u origin HEAD
gh pr create --draft --head <branch> --base <default-branch> --title "<title>" --body-file "$WORKDIR/pr-body.md"
```

Runs cannot answer prompts: pass every value as a flag.

**Engineer, fix round:** `multica repo checkout <url>` keeps uncommitted work and fetches. Then:

```bash
cd <repo> && git switch <branch> && git pull --ff-only
```

**QA, every verification:**

```bash
multica repo checkout <url> --ref <branch> --fresh
cd <repo>
test "$(git rev-parse HEAD)" = "$(gh pr view <pr-url> --json headRefOid -q .headRefOid)" || echo "HEAD is not the PR head"
```

`--fresh` discards leftovers from an earlier QA run. QA never commits or pushes.

## Fresh checkout setup

A fresh checkout has no installed dependencies and no build outputs. A build cache can report success without producing them. The order is always: install, then build the packages the change depends on, then check. Build only what you need; a full build is the most expensive step in a run. Log builds to a file and read the tail.

When the project has a shared build cache, every agent points it at one absolute path, so checkouts share build artifacts. Do not override it. The project section says whether there is one.

The same agent on the same issue reuses the checkout. The daemon removes installed dependencies and build caches about 12 hours after the last run, so a resumed run may need to install again.

## Build and check discipline

- Run tests, typecheck, and lint **from the package directory**, targeted to touched files. Project-wide checks are for final PR preparation only.
- Build before typecheck when types crossed packages: consumers typecheck against built outputs.
- Never stream a full build or a full test run into your context. Redirect to a file, read the tail, grep for failures.
- Never start a background process that outlives the run. A harness must own its server's lifecycle.

## Verification is behaviour, not green checks

A change is verified when the affected flow was exercised and observed: a unit test for state logic, a component test for rendering, an end-to-end spec for a user journey, a live instance for anything visual. Paste the commands and their output in the DELIVERY. "Tests pass" without the paste is a claim, and QA re-runs claims.

## Amend this file

Every environment trap that costs more than fifteen minutes becomes a **Skill amendment** line in your report, with the exact text for this file. The owner applies it and re-imports the skill.

---

## Project: Open Components

Replace this section when the squad moves to another project.

**Repository.** `git@github.com:uxfront-com/open-components.git`, default branch `main`, checkout directory `open-components`. One pnpm package, so "the package directory" is the checkout root. There is no shared build cache. Node 22.13 or later (Nuxt Content reads the docs with the built-in `node:sqlite`); CI uses Node 22.

**Install and build.**

```bash
pnpm install --frozen-lockfile --prefer-offline   # postinstall runs `nuxt prepare` for the site and for mcp/
pnpm build > build.log 2>&1                       # nuxt generate → dist/; fails on any page that does not prerender
tail -n 20 build.log
pnpm build:mcp > build-mcp.log 2>&1               # nuxt build mcp → mcp/.output, the MCP server's Worker
tail -n 20 build-mcp.log
```

Build only when the check needs it: unit tests, `check-types`, and `check-reference` need no build. Logs go to `$WORKDIR`, or delete them before you commit.

**Checks.** From the checkout root:

```bash
pnpm test <file>          # Vitest: app/reference/**, server/**, mcp/**, plugins/*.test.ts
pnpm check-types          # vue-tsc over the site, mcp/ and plugins/; ignores errors inside Docus's sources
pnpm check-reference      # the component pages show app/reference/ as it is
pnpm test                 # everything, including standard.test.ts (content rules) and contract.test.ts (schema)
pnpm check-mcp            # after both builds of the same commit: serves the Worker with wrangler dev and calls every tool, resource and prompt
pnpm lighthouse           # after `pnpm build`: the homepage, fails below 100 in any category; needs Chrome
```

There is no linter. CI runs `check-types` and `check-reference`, `test`, then `build`, `build:mcp`, `check-mcp`, and `lighthouse`.

**Traps.**

- `node:sqlite` errors in the build mean Node is older than 22.13. `better-sqlite3` is installed but never built (`allowBuilds` in `pnpm-workspace.yaml`); do not build it.
- Type errors about missing `#imports` or `.nuxt/tsconfig.json` mean `nuxt prepare` did not run. Run `pnpm install` again, or `pnpm postinstall`.
- A content change can pass `pnpm build` and still break the MCP server: `nuxt build mcp` only warns. `pnpm test` (`mcp/lib/standard.test.ts`) is what fails on it.
- `pnpm check-mcp` compares against `dist/`. A stale `dist/` from another commit gives false failures; rebuild both first.
- A link to a generated file (`/llms.txt`, `/raw/…`) without `{external}` builds fine and shows the 404 page on click.
- Do not set `NUXT_PUBLIC_AMPLITUDE_API_KEY` in a run. Without it, Analytics and Partytown are not built in, as in CI.
- Do not delete `wrangler.jsonc` or its empty `previews` block, and do not add `public/robots.txt`.
- `pnpm dev:mcp` picks its port from `mcp/port.mjs` (`MCP_DEV_PORT`, else `CONDUCTOR_PORT + 1`, else 3100). Set `MCP_DEV_PORT` to avoid collisions.

**Browser.** The repository has no end-to-end suite. To see a page the way Cloudflare serves it, build, then let one shell command own the server:

```bash
pnpm build > "$WORKDIR/build.log" 2>&1
PORT=8790
pnpm exec wrangler dev --port "$PORT" > "$WORKDIR/wrangler.log" 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null; pkill -f "wrangler dev --port $PORT"' EXIT
until curl -sf "http://localhost:$PORT/" > /dev/null; do sleep 1; done
pnpm dlx playwright@1 screenshot --full-page "http://localhost:$PORT/docs/components/<component>" "$WORKDIR/<component>.png"
```

Run it as one command so the trap stops the server when it ends. `wrangler dev` resolves `/docs/...` to the prerendered HTML the way Cloudflare does; `pnpm dev` does not run the static build. The first `playwright` run needs `pnpm dlx playwright@1 install chromium`.

**Services.** None. The site is static, and the MCP server reads the standard bundled at build time.
