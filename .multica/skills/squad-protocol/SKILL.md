---
name: squad-protocol
description: How a three-agent Multica squad (Planner, Engineer, QA) collaborates on one repository. The issue model with stages and the owner's approval gate, status semantics, mention and reply rules, the comment contracts (PLAN, DELIVERY, VERDICT, FIX, BLOCKED, AUDIT REPORT, STAGE REVIEW, SYNTHESIS), bounded CLI reads and stdin writes, wakeups, the two-round cap, decomposition and collision rules, the definition of done, and a project section with the current project's conventions. Read at the start of every run.
---

# Squad protocol

Three agents share one repository and one human owner. This protocol keeps parallel work from colliding, keeps every run short, and keeps the output safe for the owner's name. It applies to every run. The generic rules come first. The **Project** section at the end holds what changes from project to project; read it too.

## The squad

| Agent | Seat | Fence | Issues |
|---|---|---|---|
| Planner | Architecture, planning, triage, direction. Squad leader | No product code | Creates only the list the owner approved |
| Engineer | Implementation | Inside the sub-issue scope | Requests only |
| QA | Review, manual testing, proof. Owns audit sub-issues | No product code. Never commits or pushes | Requests only |

## The owner's boundary

- **Every PR is born a draft and stays a draft.** The owner marks ready-for-review, requests human reviewers, and merges.
- **The owner's external trackers and public channels are read-only for agents.** Draft the text; the owner posts it.
- **Every artifact that leaves the workspace is public-safe**: branch names, commit messages, PR titles and bodies, test names, fixtures. The project section says what that means for this project.

## Working directory facts

- A run starts in its working directory, `workdir/`. The checkout lives in `workdir/<repo>`. Your instructions are in `workdir/CLAUDE.md` and your skills in `workdir/.claude/skills/`. The repository's own agent configuration does not load; read its contributor guide explicitly.
- Run repository commands from inside the checkout (`cd <repo>` or `git -C <repo>`).
- Transient files (comment bodies, wakeup instructions, PR bodies, screenshots) live in `workdir/`, never inside the checkout. `--content-file`, `--instruction-file`, and `--attachment` accept only paths inside the current directory.
- The same agent on the same issue reuses the working directory and the session. The daemon removes installed dependencies and build caches about 12 hours after a run.
- A background process that outlives the run fails the run. Harnesses must start and stop their own servers.

## Issue model

- The **parent issue** is assigned to the squad. It holds the ask, the PLAN, STAGE REVIEWs, and the SYNTHESIS. Only the Planner and the owner post on it.
- **Sub-issues** are assigned to Engineer (or to QA for audits) and carry a `--stage`. Each holds one slice: criteria, DELIVERY, VERDICT threads, FIX replies. Traffic on a sub-issue never wakes the Planner, because the sub-issue is assigned to an agent, not to the squad.
- **Stages** are barriers. Multica wakes the parent's assignee when every sub-issue in the earliest unfinished stage is `done` or `cancelled`. `in_review` does not close a stage. Stage 1 starts in `todo`. Later stages wait in `backlog`; the Planner moves them to `todo` at the stage review.

| Status | Meaning in the squad | Who sets it |
|---|---|---|
| `backlog` | Parked. No run starts | Planner |
| `todo` | Starts the assignee's run | Planner |
| `in_progress` | Being worked. The parent sits here from the PLAN to the SYNTHESIS | Engineer on start; Planner for the parent |
| `in_review` | Sub-issue: DELIVERY posted, awaiting QA. Parent: SYNTHESIS posted, awaiting the owner | Engineer; Planner for the parent |
| `blocked` | Needs an answer. The BLOCKED comment names who from | Engineer |
| `done` | Sub-issue: verified by QA, draft PR ready, not merged. Audit: report posted. Parent: the owner's call, or the merged PRs | QA; the owner |
| `cancelled` | Dropped by the Planner or the owner, with a reason | Planner |

Record a status for work that is already under way with `--no-start`. Omit `--no-start` only when the change should start a run.

## The approval gate

- The Planner proposes the work list in the PLAN, with a full specification per sub-issue. The owner approves by replying on the parent. The Planner then creates exactly that list.
- Any later addition (a follow-up, a fix sub-issue after an audit, a split) is proposed in a STAGE REVIEW or in a reply, with the owner mentioned, and created only after approval.
- Engineer and QA never create issues. They put requests under **Issue requests** in their reports: title, reason, scope. The Planner carries them to the owner.
- A reply from the owner counts as approval only when it says so. Anything else is a change request.

## Modes and decomposition

| Mode | When | Shape |
|---|---|---|
| Single | One package, at most one agent-day, no independent slices | One stage, one sub-issue. Default |
| Fan-out | Two or more slices on disjoint paths, or a contract-first dependency | Independent slices share a stage. Contracts land one stage before their consumers |
| Audit | "Find the bugs in X", "review this area" | Stage 1: one QA-owned sub-issue with a finding budget. Stage 2: Engineer fix sub-issues for CONFIRMED findings, proposed in the stage review |

Decomposition rules:

1. A slice is at most one agent-day and ships as its own draft PR.
2. Acceptance criteria are commands or observables, never adjectives.
3. State the non-goals.
4. Two sub-issues that touch the same file never share a stage. The project section lists known collision surfaces.
5. Default budget: at most three concurrent sub-issues, at most three stages, two FAIL rounds. More needs the owner's explicit yes in the approval.

## Mentions and replies

Mentions are actions. Use the exact markdown from `multica agent list --output json`, `multica squad list --output json`, and `multica workspace member list --output json`:

```text
[@QA](mention://agent/<uuid>)          # starts a QA run
[@Engineer](mention://agent/<uuid>)    # starts an Engineer run
[@Ultracode](mention://squad/<uuid>)   # starts a Planner run as squad leader
[@Owner](mention://member/<uuid>)      # notifies the owner
[MUL-12](mention://issue/<uuid>)       # link only, wakes nobody
```

- To reach the Planner, mention the **squad**, never the Planner agent. An agent mention of the leader starts a run without the squad roster, and `squad activity` fails there.
- Mention an agent only at the moment it should start: delivery ready, findings ready, escalation. Use plain names (QA, Planner) everywhere else. Never mention to thank, acknowledge, or sign off.
- The Planner never mentions Engineer or QA on the parent. Delegation is a sub-issue assignment.
- An agent comment without a mention wakes no agent. A member's top-level comment on the parent wakes the Planner.
- **Reply under the trigger.** A run that a comment started must reply under that exact comment (`--parent <id>`); the server rejects anything else. A run that an assignment, a barrier, or a wakeup started may post a root comment.
- **One comment per run.** Post once, with everything in it. To change an earlier comment, edit it: `multica issue comment update <comment-id> --expected-revision <n> --content-stdin`.

## Comment contracts

Every comment uses one of these shapes. Headings are fixed so the next reader can scan them with `--summary`. Keep bodies short. Paste commands and their output in fenced blocks.

**PLAN** (Planner, root comment on the parent; a proposal until approved)

```markdown
## PLAN — proposal
**Mode:** Single | Fan-out | Audit
**Assumptions:** …
**Acceptance criteria:**
- [ ] `<command>` → expected outcome
- [ ] observable
**Stages:**
| Stage | Sub-issue | Owner | Paths | Depends on |
**Sub-issue specifications:** (one block each; this text becomes the sub-issue description)
### <title>
Stage n · Engineer | QA
Goal: …
Criteria: …
Non-goals: …
**Collisions and ordering:** …
**Options considered:** (only when a design panel ran)
**Budget:** n concurrent · n stages · 2 rounds
Approve this list to start, or reply with changes.
[@Owner](mention://member/<uuid>)
```

**DELIVERY** (Engineer, root comment on the sub-issue)

```markdown
## DELIVERY
**Change:** two or three sentences. Deviations from the PLAN, if any.
**Branch / PR:** `<branch>` · <draft PR url>
**Verified:**
- `<command>` → output summary
**Not verified / skipped:** …
**Risks and notes:** … (unrelated dead code noticed, follow-ups)
**Issue requests:** title — reason — scope, or "none"
**Skill amendments:** skill — proposed text, or "none"
[@QA](mention://agent/<uuid>)
```

**VERDICT** (QA, reply under the DELIVERY or FIX that woke it)

```markdown
## VERDICT: PASS | FAIL | ESCALATE | PENDING CI — round n
**Re-run:**
- `<command>` → result
**CONFIRMED (blocking):**
1. `file:line` — what fails, how to reproduce
**PLAUSIBLE / nits (non-blocking):** …
**Manual test:** what was exercised; screenshots attached
**CI:** green | pending (wakeup registered) | red: <check>
**Not verified:** …
**Systemic:** finding classes seen before, or "none"
**Issue requests:** …, or "none"
**Skill amendments:** …, or "none"
[@Engineer](mention://agent/<uuid>)    ← only on FAIL
[@Ultracode](mention://squad/<uuid>)   ← only on ESCALATE
```

**FIX** (Engineer, reply under the VERDICT)

```markdown
## FIX — round n
1. finding → what changed (`file:line`), or why it is not a defect
**Re-run:** …
**Issue requests:** …, or "none"
[@QA](mention://agent/<uuid>)
```

**BLOCKED** (Engineer, on the sub-issue)

```markdown
## BLOCKED
**Tried:** …
**Need:** …
**From:** Planner | the owner
[@Ultracode](mention://squad/<uuid>)
```

**AUDIT REPORT** (QA, root comment on an audit sub-issue)

```markdown
## AUDIT REPORT
**Rounds:** n · **Lenses:** …
**CONFIRMED:** numbered, each with `file:line` and a reproduction
**PLAUSIBLE:** …
**Not covered:** …
**Issue requests:** one per CONFIRMED finding, or grouped by fix
**Skill amendments:** …, or "none"
```

**STAGE REVIEW** (Planner, root comment on the parent)

```markdown
## STAGE REVIEW — stage n
| Sub-issue | Outcome | Evidence |
**Criteria status:** …
**Decisions:** re-scope, cancellations, with reasons
**Next:** stage n+1 started | finished
**Proposed sub-issues (need approval):** full specifications, or "none"
**Skill amendments collected:** …, or "none"
[@Owner](mention://member/<uuid>)      ← only when something needs approval
```

**SYNTHESIS** (Planner, root comment on the parent; the parent moves to `in_review`)

```markdown
## SYNTHESIS
**Shipped:** PRs in merge order, each with its sub-issue and evidence link
**Open questions for the owner:** …
**Skipped or not verified:** …
**Proposed issues:** …, or "none"
**Skill amendments to apply:** skill — text, or "none"
**Usage:** totals from `multica issue usage`
[@Owner](mention://member/<uuid>)
```

## CLI recipes

Reads are the expensive part. Keep them bounded.

```bash
# Orient
multica issue get <id> --output json
multica issue children <parent> --output json
multica issue metadata list <id> --output json
multica issue pull-requests <id> --output json

# Scan threads, then open one
multica issue comment list <id> --roots-only --summary --compact --output json
multica issue comment list <id> --thread <comment-id> --tail 10 --compact --output json
# The PLAN is the root comment on the parent whose preview starts with "## PLAN"
```

Write comment bodies from stdin with a quoted heredoc. Nothing is written into the checkout.

```bash
multica issue comment add <id> --parent <comment-id> --content-stdin <<'MD'
## VERDICT: PASS — round 1
…
MD
multica issue comment add <id> --content-stdin --attachment ./shot.png <<'MD'
…
MD
multica issue status <id> in_review --no-start
multica issue metadata set <id> --key branch --value <branch>
multica issue metadata set <id> --key pr_url --value <url>
multica issue metadata set <id> --key qa_round --value 1 --type number
```

Sub-issues with stages (Planner, after approval). Prefer `--assignee-id`; `--assignee` fuzzy-matches across members, agents, and squads.

```bash
multica issue create --title "…" --parent <parent> --stage 1 --assignee-id <engineer-uuid> --status todo --description-file ./s1.md
multica issue create --title "…" --parent <parent> --stage 2 --assignee-id <engineer-uuid> --status backlog --description-file ./s2.md
multica issue status <sub> todo                    # starts the next stage at the stage review
multica squad activity <parent> action --reason "…" # leader runs only; outcomes: action | no_action | failed
```

Wakeups. The run ends; Multica wakes the agent when the condition holds. Instruction files live in `workdir/`.

```bash
# QA: register first, then read the checks; delete the rule if they already finished
multica issue wakeup create <sub> --until-pr checks --expires-in 2h --on-timeout wake --parent <trigger-comment-id> --instruction-file ./ci.md
multica issue pull-requests <sub> --output json
multica issue wakeup delete <sub> <wakeup-id>

# Planner: one stall timer per parent; move it, never add another; delete it at SYNTHESIS
multica issue wakeup create <parent> --kind at --after 24h --instruction-file ./sweep.md
multica issue wakeup list <parent>
multica issue wakeup update <parent> <wakeup-id> --kind at --after 24h --instruction-file ./sweep.md
multica issue wakeup delete <parent> <wakeup-id>
```

Usage, for the SYNTHESIS: `multica issue usage <id> --output json`.

## The round cap

- QA posts at most two FAIL verdicts per sub-issue. The third becomes ESCALATE with the squad mentioned.
- The Planner resolves an ESCALATE in one run: accept or reject, replying under the ESCALATE comment. No third opinion, no new sub-issue.
- Engineer and QA never ping-pong on taste. A nit is noted once.

## Definition of done (sub-issue)

1. Every acceptance criterion met, with commands and outcomes in the DELIVERY.
2. Tests exist for new behaviour. QA re-ran them from the package directory.
3. The package's typecheck and lint pass in every touched package.
4. The project's conventions hold (project section).
5. Draft PR: title rules, template, ticket references, public-safe. CI green or listed as pending.
6. QA posted PASS. Nothing changed outside the sub-issue scope.

## The compounding rule

Agents cannot edit skills: the checkout has none, and Multica serves imported copies. A lesson that cost more than fifteen minutes goes under **Skill amendments** in your DELIVERY, VERDICT, or AUDIT REPORT, as the exact text to add and the skill it belongs to. The Planner collects amendments in the SYNTHESIS. The owner applies them and re-imports the skill. Lessons any contributor to the project needs go to the project's own agent guides through a normal draft PR, proposed the same way.

---

## Project: Open Components

Replace this section when the squad moves to another project.

**Repository.** `git@github.com:uxfront-com/open-components.git`, default branch `main`, checkout directory `open-components`. A public repository: the Open Components standard (guidelines for UI components across UX, DX and AX) and the static Nuxt 4 site that publishes it at https://opencomponents.dev, with the docs on Docus. One package, not a monorepo. `mcp/` is a second Nuxt app, the MCP server at https://mcp.opencomponents.dev/mcp, and `plugins/open-components/` is the agent plugin. The owner is Alex; look up the owner's member mention with `multica workspace member list --output json`.

**Workspace prefix.** The project tracks work in GitHub issues, which do not read keys from branch names, so any prefix works. Keep `MUL`.

**Contributor guides.** `.github/CONTRIBUTING.md` is the guide; read the sections for the paths you touch (The docs, The changelog, The MCP server, The agent plugin, Analytics, Keeping 100s). There is no `AGENTS.md`. The Design Tokens page (`content/docs/2.foundations/1.design-tokens.md`) is the styling standard. The rules that bite most often:

- Always pnpm, with Node 22.13 or later.
- CSS variables are token paths: a double dash between groups, single dashes inside a name (`--color--primary-contrast`, `--button--icon--size`). A part or a state always gets its own group.
- No inline styles in examples or docs. Override a component's variables with a class. Reference components put their scoped styles in `@layer components`, after `@layer theme, base, components, utilities;`.
- A reference implementation in `app/reference/<component>/` and the code blocks on its page change together; `pnpm check-reference` fails when they drift.
- Every Checklist row has a Basis (`WCAG 1.4.3 (AA)`, `HTML`, `APG`, `Open Components`, with `beyond` when it asks for more) and a Check that `mcp/lib/rules.ts` knows. Keep the column names. A new contract field or checklist column goes into `public/schemas/contract.json` in the same change.
- Guideline text stays framework-agnostic. Code per framework goes in a `::framework-switcher` with slots from `app/data/frameworks.ts`.
- The MCP server reads the pages, so content follows the rules under "The content it relies on" in the guide: plain headings, no inline components besides `:roadmap-check`, unique page file names.
- Docs prose talks to the reader in full sentences. No Nuxt UI callouts (`::tip`, `::note`): they fail contrast in light mode.
- The homepage scores 100 in every Lighthouse category. No render-blocking resources; heavy code through `import()`.

**The owner's boundary, here.** GitHub issues and PRs are read-only for agents: no comments, no labels, no reviews. Draft the text; the owner posts it. **Public-safe:** no secrets (the Amplitude key stays out of every file and log), no private names, no copied text from other standards beyond a short quote; cite sources under the page's `## Sources`. The guidelines in `content/` and the plugin are CC BY 4.0, the site code MIT.

**Git and PR conventions.**

- Branch from fresh `main`: `<short-slug>-<mul-key>` in lower case. The Multica key in the branch links the PR to the sub-issue.
- Conventional Commits. The PR title becomes the squash commit: `type(scope): subject`, lower case, read as a sentence, as in `feat(docs): add the Input, with a tested reference implementation`. Scopes in use: `docs`, `changelog`, `home`, `deps`; omit the scope for changes across the site, the MCP server and the plugin.
- PR: draft, `.github/PULL_REQUEST_TEMPLATE.md` filled in. For guideline changes, "What changed" names the layer (UX, DX or AX) and why the standard should say this. `Closes #<n>` only for a GitHub issue the owner named. No Multica key in the title or body.
- A change readers should know about (a new page, a new component, a changed rule) carries an entry in `content/changelog/`, written the way the guide's "The changelog" section says.
- Never commit `dist/`, `.output/`, `.nuxt/`, `.data/`, `.wrangler/`, `.lighthouseci/`, `build.log`, or anything from `workdir/`.

**Collision map.** Two sub-issues that touch one of these never share a stage:

| Surface | Rule |
|---|---|
| One component: `content/docs/3.components/<n>.<component>.md`, `app/reference/<component>/`, `app/components/content/<component>/` | One sub-issue per component. The page and its reference implementation never split across sub-issues |
| `content/docs/1.getting-started/2.roadmap.md` | Every shipped component ticks it: order them |
| `public/schemas/contract.json`, `server/lib/contract.ts`, `mcp/lib/rules.ts` | Contract and rule-shape changes go first |
| `mcp/nuxt.config.ts` instructions, `scripts/check-mcp.mjs` (`TOOLS`, `PROMPTS`), the MCP Server page | One new tool or prompt per stage |
| `mcp/lib/prompts.ts` and the pages' Prompts sections | Change together, in one sub-issue |
| `plugins/open-components/plugin.json` and `.claude-plugin/marketplace.json` (the version) | One plugin change per stage |
| `nuxt.config.ts` (prerendered contracts, `routeRules`, `llms`, highlight languages), `app/app.css` sources, `app/data/frameworks.ts` | Two sub-issues that add entries: order them |
| `.github/CONTRIBUTING.md` | Two sub-issues that change conventions: order them |

**Project skills to attach.** The agent plugin's skills, imported by URL from `https://github.com/uxfront-com/open-components/tree/main/plugins/open-components/skills/<name>` so `multica skill refresh` tracks `main`. They call the MCP server's tools when the run connects it, and read the same from `https://opencomponents.dev/raw/` when it does not.

| Agent | Skills |
|---|---|
| Planner | none |
| Engineer | `build-component`, `adopt-token-paths` |
| QA | `review-component`, `review-usage` |
