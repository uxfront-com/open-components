---
name: build-component
description: Builds a UI component that meets the Open Components standard, in the user's framework, from its contract, its reference implementation and its tests, or, for one the standard only plans, following the Button's structure. Use when building, porting or rewriting a UI component, like a button, input, spinner, dialog or tabs, for a design system or component library, or when the user asks for one that meets Open Components.
license: CC-BY-4.0
compatibility: Reads the standard from the open-components MCP server this plugin connects, or from opencomponents.dev, so it needs network access.
---

# Build a component

Open Components (https://opencomponents.dev) is a standard for UI components. It covers how each component looks, its UI, then holds it to three layers: UX (user experience), DX (developer experience) and AX (agentic experience). Every shipped component has a contract: its API, its DOM contract, its states, its tokens and every rule in its checklist. Each rule has a stable ID, like `button/keep-focus`, a level, `must` or `should`, and a scope: `component` (met by the component itself), `usage` (met by the code that uses it) or `both`.

## Read the standard a piece at a time

Use the tools of the `open-components` MCP server, which this plugin connects. Component pages are long, about 35,000 tokens for the Button's, so read the contract first, then only the sections you need, in the user's framework. Below, `<component>` is the name `list-components` gives a component, like `button`, and `<framework>` is one of react, vue, svelte, angular, solid, astro or vanilla.

If you don't have the tools, read the same standard from the site. Fetch the files as they are, rather than through a tool that summarises them, so every rule comes back word for word:

- https://opencomponents.dev/llms.txt lists every page and every contract, in place of `list-components`. The Roadmap, https://opencomponents.dev/raw/docs/getting-started/roadmap.md, lists the planned components.
- A contract, like https://opencomponents.dev/raw/docs/components/button.yaml, is what `get-contract` returns, with the rules `list-rules` filters under `rules`.
- A page, like https://opencomponents.dev/raw/docs/components/button.md, is what `get-page` reads, with the examples in every framework, and the reference implementation under "Reference implementation".

## Build a shipped component

1. `list-components {}` tells you whether the standard covers the component, shipped or planned, and the name the other tools take. For a planned one, follow "Build a planned component" below.
2. `get-contract {"component": "<component>"}` returns its API, its DOM contract, its tokens and every rule, with its scope.
3. `get-reference-implementation {"component": "<component>"}` returns a tested Vue 3 implementation, and the tests to port.
4. `get-page {"path": "<component>", "sections": ["Developer Experience (DX)"], "framework": "<framework>"}` shows how its API looks in the user's framework. Read other sections, like "Every state", when a rule needs its reasoning.
5. Build it in the user's framework, following their codebase's conventions. Follow its API, its DOM contract and its tokens, and name its CSS variables as token paths, like `--button--icon--size`. In vanilla, write out the markup from its DOM contract, with a script for the behaviour.
6. Port its tests to the user's test setup and make them pass.
7. Check your work against every rule with a `component` or `both` scope. `list-rules {"component": "<component>", "scope": ["component", "both"]}` returns just those, as records.

## Build a planned component

Planned components have no page or contract yet, so follow the Button page's structure:

1. `get-page {"path": "roadmap", "sections": ["<its group>"]}` says what the Roadmap plans the component for. `list-components` gives its group.
2. `get-page {"path": "introduction"}` covers the three layers every component is held to.
3. `get-contract {"component": "button"}` shows what a contract holds, and the rules a shipped component meets. `get-contract {"component": "design-tokens"}` covers naming its variables.
4. `get-reference-implementation {"component": "button"}` shows how a component and its tests meet those rules.
5. `get-page {"path": "button", "sections": ["Developer Experience (DX)"], "framework": "<framework>"}` shows how the Button's API looks in the user's framework, which every component's follows.

Then work through the component's UI, UX, DX and AX, following the WAI-ARIA pattern for it if there is one. Write a checklist with a stable ID for every rule, like `tabs/<rule>`, and a test for each one.

## Report back

A component meets the standard when it meets every must rule, and each should rule is expected unless there's a good reason not to follow it. Say that it meets them, and cite the ID of any rule it can't meet, with the reason. Cite rule IDs exactly as the standard writes them, and never make one up.
