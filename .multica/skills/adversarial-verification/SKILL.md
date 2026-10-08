---
name: adversarial-verification
description: QA's verification manual for a Multica squad. The adversarial protocol (assume broken, prove it), the finder and refuter subagents that stand in for Ultracode's vote-based verification, the CONFIRMED versus PLAUSIBLE standard, manual testing on an isolated instance, CI wakeups and their fallback, audit sub-issues, the mutation-testing tiebreak, what never to block on, and a project section with the current project's review-rule groups, anti-pattern checklist, and test harness. Consult at the start of every verification run.
---

# Adversarial verification

A builder agent grades its own work generously. This seat compensates. Operating assumption: **the delivery is broken; prove it.** When you fail, pass it, and list what you did not try. One complete pass per round. A slow or dripping review stalls the stage.

Ultracode verifies a finding by asking several independent agents to refute it and drops it when they succeed. The squad gets the same effect inside one run: finder subagents find, a refuter subagent per finding attacks, you judge, and only what survives blocks. The **Project** section at the end holds the project's rule groups, checklist, and harness.

## Protocol

1. **Open the sub-issue first.** Its acceptance criteria are the test plan. Work beyond the sub-issue scope is a finding, even when the extra work is good.
2. **Check out the delivered branch fresh** and confirm `HEAD` is the PR's head commit (commands in `local-verification`). A leftover file from an earlier QA run would otherwise sit under the review.
3. **Re-run, never re-read.** Pasted output is a claim. Re-run every command in the DELIVERY from the package directory. A command that does not reproduce is a finding on its own.
4. **Tests before code.** For every new or changed test ask: can this test fail? Revert the fix locally and watch it fail when that costs little. New behaviour without a test blocks. Assertion-thin suites get the mutation tiebreak.
5. **Finders.** Spawn read-only subagents in parallel, one per lens, on your own model. Give each the diff, the criteria, and its checklist. Ask for findings with `file:line`, a failure scenario, and a confidence. Lenses: correctness, scope and diff hygiene, security, test quality, and one per project review-rule group whose paths match the diff.
6. **Refuters.** For each finding, spawn a subagent whose only job is to disprove it: run the scenario, read the surrounding code, check the written convention. Default to "refuted" when uncertain. Then read its answer and decide. CONFIRMED means the failure reproduced or the exact line violates a written rule. Everything else is PLAUSIBLE and does not block.
7. **Manual test** for UI and runtime behaviour. Recipe below.
8. **Automated reviewer.** Read any automated review comments on the PR before a PASS; treat each as a finding to confirm or refute.
9. **CI**, then the VERDICT in the shape from `squad-protocol`, as a reply under the comment that woke you. Set `qa_round` in the sub-issue metadata first.

## The CONFIRMED standard

A CONFIRMED finding carries:

- the exact `file:line`;
- the failure: a command and its output, or the written rule and the line that breaks it;
- the smallest change that would clear it.

Rank CONFIRMED findings by impact. PLAUSIBLE findings and nits go in their own list and never block.

## Manual test

Run it for every change a user can see or trigger.

1. Capture the run's working directory before you enter the checkout (`WORKDIR=$(pwd)`). Screenshots go there; nothing goes into the checkout.
2. Start an isolated instance through the project's browser test harness. The harness must start and stop the server itself; a server you start in the background fails the run.
3. Drive the flow with a focused existing spec, or a short throwaway spec that uses the harness's page objects. Save screenshots of the before and after states to `$WORKDIR`.
4. Attach the screenshots to the VERDICT with `--attachment`.
5. Delete the throwaway spec. It is never committed.

## CI

1. Register the wakeup on the PR checks first. Then read the checks. The condition ignores checks that finished before registration, so if they already finished, delete the wakeup and continue.
2. Pending: post `VERDICT: PENDING CI` under the trigger with everything else already filled in, and stop. The wakeup run reads the checks and posts the final VERDICT under the same trigger.
3. A red check caused by the change is a CONFIRMED finding. A red check caused by the default branch is a note for the Planner, not a block.

Without a PR integration in the workspace (no PR card, no `pull-requests` data), read the checks with the Git host's CLI and register a one-shot timer instead:

```bash
multica issue wakeup create <sub> --kind at --after 30m --parent <trigger-comment-id> --instruction-file ./ci.md
```

## Audit sub-issues

When a sub-issue assigned to you asks for findings instead of a verdict:

1. Round one: finders with distinct lenses over the named area. Refute every finding.
2. Next round: fresh lenses (by failure mode, by boundary, by history, by test gap). Stop when a round confirms nothing, or when the sub-issue's budget is spent.
3. Post the AUDIT REPORT with CONFIRMED findings, each with a reproduction, and an issue request per fix. Mark the sub-issue `done`.

## The mutation-testing tiebreak

When tests pass but assert little, run mutation testing on the changed files. Surviving mutants in changed code are findings: name the mutant, the line, and the missing assertion. It is expensive; use it as a tiebreak, not by default. The project section names the command.

## Do not block on

Taste no convention backs, hypothetical future requirements, formatting the tooling accepts, or pre-existing debt the diff sits near. Note each once as a nit. Reviews that relitigate settled conventions teach builders to ignore reviews.

## Systemic findings

The same finding class on two different issues is systemic. Say so under **Systemic** in the VERDICT. The Planner turns it into a skill amendment or a lint-rule proposal. The checklist below should shrink over time, not grow.

---

## Project: Open Components

Replace this section when the squad moves to another project.

**Review-rule groups.** The repository has no rule files; `.github/CONTRIBUTING.md` and the Design Tokens page are the rules. Run one finder per group whose paths match the diff, with the named sections as its checklist, plus correctness, scope, security, and test quality.

| Group | Paths | Checklist |
|---|---|---|
| guidelines | `content/docs/**` | CONTRIBUTING "The docs", "Examples per framework", and "The content it relies on"; the component page structure of the Button and Input pages |
| reference | `app/reference/**`, `app/components/content/**` | The Design Tokens page; the component's own Checklist; `pnpm check-reference` |
| mcp | `mcp/**`, `server/**`, `scripts/check-mcp.mjs` | CONTRIBUTING "The MCP server" |
| plugin | `plugins/**`, `.claude-plugin/**` | CONTRIBUTING "The agent plugin" |
| site | `app/pages/**`, `app/app.vue`, `nuxt.config.ts`, `modules/**`, `wrangler.jsonc`, `lighthouserc.json` | CONTRIBUTING "Deploying to Cloudflare", "The homepage", "Analytics", "Keeping 100s" |
| changelog | `content/changelog/**` | CONTRIBUTING "The changelog" |

**Automated reviewer.** None is configured. If a bot or a person has commented, read it with `gh pr view <url> --comments` before a PASS.

**Anti-pattern checklist** (block once confirmed):

1. A CSS variable that is not a token path (`--button-height` instead of `--button--height`; `--button--icon-size` instead of `--button--icon--size`).
2. An inline `style` in an example or a docs code block; reference styles outside `@layer components`.
3. A hardcoded colour or size in a reference implementation where a token exists.
4. A reference implementation and its page that differ (`pnpm check-reference` fails), or a behaviour change without a test in `app/reference/<component>/*.test.ts`.
5. A Checklist row without a Basis, with an unknown Check, or with a duplicate rule ID; renamed table columns; a contract field not in `public/schemas/contract.json`.
6. A heading with a link, HTML, emphasis, a component, or `{#id}`; a heading inside a `::framework-switcher`; a switcher slot not in `app/data/frameworks.ts`; an inline component other than `:roadmap-check`.
7. Guideline text that assumes one framework; an example that is missing from a framework the page already covers, without a reason.
8. Nuxt UI callouts (`::tip`, `::note`, …); a link to `/llms.txt` or `/raw/…` without `{external}`.
9. An MCP tool that is not `READ_ONLY`, has no `inputExamples`, or is missing from the instructions in `mcp/nuxt.config.ts`, `TOOLS` in `scripts/check-mcp.mjs`, or the MCP Server page; state kept between requests; a prompt changed without its page's Prompts section, or added without a plugin skill.
10. A plugin change without a version bump in both `plugin.json` and `.claude-plugin/marketplace.json`; a symlink or a client-specific manifest in the plugin.
11. On the homepage: a render-blocking resource, a heavy static import, a third-party script outside Partytown, a page without a title, a meta description, a canonical link, or one `<h1>`; a new route missing from `lighthouserc.json`.
12. A shipped component without its `:roadmap-check{shipped}` on the Roadmap, its `## Reference implementation` section, or a changelog entry.
13. PR hygiene: a title that is not Conventional Commits, template sections left empty, guideline changes without the layer named.
14. Public-repo leakage: a secret (the Amplitude key), a private name, or a long passage copied from another standard. Block and flag it under **Systemic** for the Planner.

**Per-area checks.**

- **Component pages:** every rule in the Checklist has prose above it that says why; the Described contract matches the reference implementation's props, events and slots; examples render in the live preview; the page reads well on `pnpm dev`.
- **Reference implementations:** native elements first; every state the page lists (disabled, read-only, invalid, loading) is reachable and tested with Testing Library by role and name; forced colours, reduced motion and right-to-left still hold.
- **MCP server:** `pnpm check-mcp` passes after both builds of the same commit; no tool result over 40,000 characters; bad input returns `createError()` in tools and `McpError` with `InvalidParams` in prompts and resources.
- **Homepage:** `pnpm build`, then `pnpm lighthouse`, still scores 100 in every category.
- **Bug fixes:** the failing test fails for the stated reason before the fix (run it on the parent commit); the test name is neutral.

**Manual test harness.** No end-to-end suite exists. Use the browser recipe in `local-verification`: `pnpm build`, `wrangler dev` owned by the same shell command through a `trap`, and `pnpm dlx playwright@1 screenshot` into `$WORKDIR`. For interaction (keyboard, focus, states), write a throwaway Playwright script in `$WORKDIR`, never in the checkout, and run it inside the same command so the server stops with it.

**CI and PR data.** With the GitHub App installed, `multica issue pull-requests <sub>` mirrors the checks and `--until-pr checks` fires. Without it, read `pr_url` from the sub-issue metadata and use `gh pr checks <url>` with the timer fallback above. The checks are Type-check, Test, Build, and Lighthouse.

**Mutation tiebreak.** No mutation tool is installed. Do it by hand: change the line a test should guard in `app/reference/<component>/` or `mcp/lib/`, run `pnpm test <file>`, and revert. A test that still passes is the finding.
