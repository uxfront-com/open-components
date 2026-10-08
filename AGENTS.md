# AGENTS.md

Open Components is a standard for UI components, with guidelines for their user experience (UX), developer experience (DX) and agentic experience (AX). This repository holds the standard, as markdown in `content/docs/`, and the static Nuxt site that publishes it at https://opencomponents.dev, along with the MCP server at https://mcp.opencomponents.dev/mcp (`mcp/`) and the agent plugin (`plugins/open-components/`).

Most changes here are to the guidelines themselves, so how they read matters as much as what they say. [Writing the docs](#writing-the-docs) covers the voice, style and format. [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md) explains how every part of the site works, so read the section on the part you're changing.

## Commands

```bash
pnpm dev              # the site, on http://localhost:3000
pnpm dev:mcp          # the MCP server (mcp/port.mjs picks its port)
pnpm check-types      # vue-tsc on the site, the MCP server and the plugin
pnpm check-reference  # the component pages show app/reference/ as it is
pnpm test             # Vitest: reference tests, contracts, MCP server, agent plugin
pnpm build            # nuxt generate → dist
pnpm build:mcp        # nuxt build mcp → mcp/.output
pnpm check-mcp        # after both builds: every tool, resource and prompt against dist
pnpm lighthouse       # after pnpm build: fails below 100 in any category
```

Building needs Node 22.13 or later. Which checks to run depends on what you changed:

| You changed                                      | Run                                                        |
| ------------------------------------------------ | ---------------------------------------------------------- |
| Anything                                         | `pnpm check-types` and `pnpm test`                         |
| A docs page or `app/reference/`                  | `pnpm check-reference` too                                 |
| `mcp/`, or the headings and contracts it reads   | `pnpm build`, `pnpm build:mcp`, then `pnpm check-mcp`      |
| The homepage                                     | `pnpm build`, then `pnpm lighthouse`                       |

## Where things live

| Path                                         | What it holds                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| `content/docs/`                              | The standard. Numbered files and folders set the sidebar order                   |
| `content/changelog/`                         | One entry per release of something readers will notice                           |
| `app/reference/<component>/`                 | The tested Vue 3 reference implementations, which every page shows as code       |
| `app/components/content/<component>/`        | The live examples, anatomy and playground, which render the reference            |
| `app/data/frameworks.ts`                     | The frameworks, their order and their `::framework-switcher` slot names          |
| `server/lib/contract.ts`, `public/schemas/contract.json` | How a page's contract is built, and the JSON Schema it follows       |
| `mcp/`                                       | The MCP server, a Nuxt app and Cloudflare Worker of its own                      |
| `plugins/open-components/`                   | The agent plugin: its manifest, `mcp.json` and one skill per MCP prompt          |
| `app/pages/index.vue`                        | The homepage, built on the `@uxfront/*` kit                                      |

## Things that change together

Most of the site is generated from the docs, so a change in one place often needs a change in another. Where a check catches the drift, it's named here.

- **Reference implementations and their pages.** Every file in `app/reference/<component>/` is shown in a code block titled with its name, like ```` ```vue [Button.vue] ````, under the page's `## Reference implementation`. Change both, and `pnpm check-reference` confirms they match.
- **Checklists.** Rules are rows of the tables under `### UI rules`, `### UX rules`, `### DX rules` and `### AX rules`, with the columns Rule, Level, Scope, Requirement, Basis and Check, named exactly that. Every rule ID is unique, every rule has a Basis and every Check is one `mcp/lib/rules.ts` knows, or `pnpm test` fails.
- **Contracts.** A contract is the YAML block under a page's `### Described`. When it gains a field, add it to `public/schemas/contract.json` in the same change, since `pnpm test` validates every contract against it.
- **Prompts.** The prompts on the pages (the Button's `#### Prompts`, the Design Tokens' `### Prompts`), the MCP prompts in `mcp/lib/prompts.ts` and the plugin's skills ask for the same things. `prompts.test.ts` checks the first two, so change all three together.
- **Skills.** The plugin's skills name tools, pages, section headings, frameworks and rule IDs, and `pnpm test` checks that they all exist. Renaming a heading a skill reads, like "Developer Experience (DX)", fails it.
- **The plugin's version.** Clients cache the plugin by its `version`, so bump it in `plugins/open-components/plugin.json` and in `.claude-plugin/marketplace.json` whenever the plugin changes.
- **MCP tools and prompts.** A new tool is named in the instructions in `mcp/nuxt.config.ts`, in `TOOLS` in `scripts/check-mcp.mjs` and on the MCP Server page. A new prompt goes in `PROMPTS` and `filled` there, and gets a skill in the plugin.
- **A component that ships.** Its Roadmap row becomes `:roadmap-check{shipped}`, and it gets a changelog entry.
- **Replaced theme components.** `app/components/app/AppHeaderBody.vue` and `app/components/docs/DocsPageHeaderLinks.vue` replace the layer's and Docus's own, so keep them in step with the originals.

## Markdown conventions

The MCP server reads the same markdown as the site, and knows less MDC syntax than Docus does. Content it can't read doesn't fail the build, but `pnpm test` fails on most of it, so keep to these:

- Every page has a `title` and a `description`, and a file name that's unique across `content/docs/` once its number is dropped.
- Headings are plain text and inline code, with no links, emphasis, HTML, components or `{#id}`.
- Use block components, `:roadmap-check` and `{external=""}` on links, and nothing else inline, like `:badge[New]`.
- Link to generated files, like `/raw/…` and `/llms.txt`, with `{external=""}`, or the router shows the 404 page.
- Link within the docs by absolute path, even on the same page, as in `/docs/components/button#checklist`.
- Put headings above a `::framework-switcher`, never inside it. Inside a live example, nest the switcher with the same number of colons as the example (`::`), or its slots go to the example.
- Avoid Nuxt UI callouts like `::tip` and `::note`, whose text fails contrast in light mode.

## Code conventions

- Name CSS variables as token paths, with a double dash between groups and single dashes inside a name: `--color--primary-contrast`, `--button--icon--size`. A part or a state always gets its own group, while CSS property names stay whole, as in `--button--font-size`. The [Design Tokens](./content/docs/2.foundations/1.design-tokens.md) page is the source of truth.
- Reference components put their styles in `@layer components`, after `@layer theme, base, components, utilities;`, so a plain class can override their variables. Examples never use inline styles: they set variables from a class.
- Reference implementations explain the why in their comments, like the props' doc comments in `Button.vue`. Tests use Testing Library, find elements by role and name, and are named as sentences, like `"is a button, named by its label, that never submits by accident"`.
- The MCP server's logic lives in `mcp/lib/` as pure functions, so Vitest can test it. Tools are read-only and report bad input with `createError()`, and the server stays stateless.
- The homepage scores 100 in every Lighthouse category. Don't add render-blocking resources, and load heavy code with dynamic `import()`.

## Writing the docs

The [Button](./content/docs/3.components/1.button.md) page is the model for every page, so read the sections you're about to mirror before you write. It's long, about 35,000 tokens, so read it a section at a time.

### Voice

Write the way a senior colleague would walk you through it: warm, plain and sure of the facts, never a spec or a sales pitch.

- Talk to the reader as "you", and about the project as "we" and "our".
- Explain why, every time. A recommendation comes with its reason, joined by "so", "since", "because" or "which":

  > Hover styles only apply to pointers that can actually hover (`@media (hover: hover)`), otherwise a tap would leave the button looking hovered.

- Ground it in what people experience. Screen readers announce, voice control users say "click Save", and keyboard users lose their place. Open a page with what the component does for people, then "Think of…" and three concrete ways it goes wrong.
- Outside the checklist, recommend rather than command: "We recommend…", "Try to keep…", "It's best to…", "Keep in mind that…", "You'll want to…".
- Keep the standard apart from our implementation. Rules live in the checklist, and the values we chose, like a 2px focus offset, are "what we recommend". The reference implementation "does its part of every rule", but never "meets every rule", since it can't meet usage rules on its own.
- Keep the prose framework-agnostic. No `defineProps`, `v-if` or `$el`, and events "fire" rather than "emit". Only mention Vue where the reference implementation's code is shown.
- Say things plainly. Sentences that sound wise but say little read as machine-written, so cut them:

  | Instead of                                                     | Write                                                                    |
  | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
  | In a way, semantics are the agent's API.                       | A real button has a role, a name and states, so an agent can find it.    |
  | `Input.test.ts` holds its tests.                               | The tests are in `Input.test.ts`.                                        |
  | …along with a contract they can hold the code to.              | …and on a contract they can check the code against.                      |
  | Every state is designed.                                       | Each state has a look of its own.                                        |

- Only make claims that are true, and give the number and its source: "at least 24 × 24px ([WCAG 2.5.8](…))", not "large enough".

### Style

- Use British spelling in prose, like colour, behaviour, recognise and summarise. Code keeps its own: `color`, `forced-colors`.
- Leave out the Oxford comma: "React, Vue, Svelte, Angular, Solid, Astro and Vanilla".
- Use contractions, like it's, don't, you'll and we'd.
- Don't use em dashes, semicolons or exclamation marks in prose. A comma, a colon or a new sentence does the job. The one exception is the `**Part** — description` items in an Anatomy list.
- Write "like", "such as" or "for example" rather than "e.g.", "i.e." or "etc.", and leave out filler like "simply", "easily", "seamless", "robust", "leverage" and "ensure".
- Write "the Button" for our component and its page, and "a button" for buttons in general.
- Use code formatting for props and values (`variant="link"`), elements (`<button>`), attributes, keys (`Enter`, `Space`), CSS, tokens, rule IDs (`button/keep-focus`) and file names. Put interface text in quotes: "Save changes".
- Write "…" as one character, sizes as "24 × 24px", ratios as "4.5:1" and percentages as "8%".
- Cite WCAG right after the claim, linking its Understanding page: `([WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html))`, or `([WCAG 1.3.2](…), [2.4.3](…))` for more than one. Name the APG, the HTML Standard and other design systems in the text, and list everything you drew on under `## Sources`, with what you took from it.
- Write headings in sentence case, apart from the layers' names, like "User Experience (UX)". Guidance headings are imperatives, like "Name every button" or "Don't submit forms by accident".

### Format

- Keep paragraphs to two to four sentences.
- Give every list an intro sentence ending in a colon. List items are full sentences with full stops, while table cells are fragments without them.
- Put long code in a code block rather than inline, like commands, config and anything that would wrap. Each command gets a block of its own.
- Show an example as a live example wrapping a `::framework-switcher`, with a slot per framework in the order of `app/data/frameworks.ts`: react, vue, svelte, angular, solid, astro and vanilla. Follow it with a table, if the options need one, then a paragraph on what to watch out for.
- Write the same API in every framework, in each one's idiom: React and Solid take `leading` as a prop, Vue uses `<template #leading>`, Svelte a snippet, Astro a named slot, and Angular puts the component on the native element (`<button appButton>`). Vanilla writes out the markup from the DOM contract.

### Component pages

Every component page follows the Button's outline, with the same headings, so readers, agents and the plugin's skills find the same thing in the same place:

```md
---
title: Button
description: How to build a button that looks right, works for everyone, feels familiar to every developer and can be checked by your agents.
navigation:
  icon: i-lucide-mouse-pointer-click
---

What it lets people do. Why it's often wrong. Think of <three concrete failures>.
This page walks you through building one the right way. We'll look at: <UI, UX, DX and AX, one line each>
<The reference implementation, the checklist and the Framework select>

::button-playground
::

## At a glance                  (an Aspect table: element, role, name, keyboard, states, …)
## User Interface (UI)          "Let's start with how a button looks…"
### Anatomy, <its options, like Variants or Sizes>, States, Tokens
## User Experience (UX)         "Now let's look at how a button behaves…"
### Accessible, Predictable, Every state, Adaptive
## Developer Experience (DX)    "Next, let's look at how developers use the Button…"
### Consistent, Type-safe, Composable, Controllable
## Agentic Experience (AX)      "Finally, let's look at how agents read, build and check a button…"
### Semantic, Described, Deterministic, Verifiable
## Checklist
### UI rules, UX rules, DX rules, AX rules
## Reference implementation
## FAQ                          (an ::accordion of :::accordion-item{label="…?"})
## Sources
```

Write checklist rows like this:

- The Rule is `<component>/<kebab-case>`, like `button/keep-focus`. Rule IDs are cited in reviews, commits, skills and agents' reports, so never rename one that has shipped.
- The Level is Must or Should, and the Scope is Component, Usage or Both.
- The Requirement says what's true once the rule is met, in the present tense, without "must" and without a full stop: "No state changes the button's size or position".
- The Basis is where the rule comes from, like `WCAG 1.4.3, 1.4.11 (AA)`, `HTML`, `WAI-ARIA`, `APG` or `Open Components`, with `beyond` for a rule that asks for more than its criterion, as in `Open Components, beyond WCAG 1.4.1 (A)`.
- The Check is one or more of `Unit test`, ``axe `button-name` ``, `Type check`, `Stylelint`, `Visual regression test`, `Keyboard`, `ARIA snapshot`, `Screen reader`, `Emulation`, `200% zoom`, `Contrast checker` and `Review`. Every rule with a `Unit test` check has a test in the reference implementation.

### Changelog entries

Write them like the docs, with a couple of sentences on what's new and why it matters, then a few short points under `## New`, `## Improved` or `## Fixed`. Leave the details to the page the entry links to. [`content/changelog/input.md`](./content/changelog/input.md) is a good model, and [The changelog](./.github/CONTRIBUTING.md#the-changelog) has the frontmatter.

## Commits and pull requests

- Titles follow Conventional Commits, usually scoped to `docs`, and read as a sentence: `feat(docs): add the Input, with a tested reference implementation` or `fix(docs): keep the guidelines' text framework-agnostic`.
- The PR body follows [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md). Under "What changed", say in prose what changed and why, in the same voice as the docs. Tick what you ran, and say why next to anything you didn't, like "(No homepage changes.)".
