---
name: review-component
description: Reviews a UI component against its Open Components contract, or a codebase's theme and component styles against a foundation like Design Tokens, reporting every rule as pass or fail with its ID and the evidence, then fixing the failures. Use when asked to review, audit or check a component, its accessibility, its API or its tokens, or a theme's CSS variables, against Open Components or a component standard.
license: CC-BY-4.0
compatibility: Reads the standard from the open-components MCP server this plugin connects, or from opencomponents.dev, so it needs network access.
---

# Review a component

Open Components (https://opencomponents.dev) is a standard for UI components. Every shipped component, and every foundation like Design Tokens, has a contract: what it covers, like a component's API, DOM contract, states and tokens, and every rule in its checklist. Each rule has a stable ID, like `button/keep-focus`, a level, `must` or `should`, and, for components, a scope: `component` (met by the component itself), `usage` (met by the code that uses it) or `both`.

This skill reviews the component itself, against the rules with a `component` or `both` scope. To review how a screen uses a component, use the review-usage skill.

## Read the standard a piece at a time

Use the tools of the `open-components` MCP server, which this plugin connects. Below, `<component>` is the name `list-components` gives a component or foundation, like `button` or `design-tokens`.

If you don't have the tools, read the same standard from the site. Fetch the files as they are, rather than through a tool that summarises them, so every rule comes back word for word:

- https://opencomponents.dev/llms.txt lists every contract, in place of `list-components`.
- A contract, like https://opencomponents.dev/raw/docs/components/button.yaml, is what `get-contract` returns, with the rules `list-rules` filters under `rules`.
- A page, like https://opencomponents.dev/raw/docs/components/button.md, is what `get-page` reads, and explains every rule.

## Review it

1. `list-components {}` tells you whether the component or foundation has a contract, and the name the other tools take. A component on the Roadmap has none yet, so there are no rules to review it against: tell the user rather than reviewing it against rules you'd have to make up.
2. `get-contract {"component": "<component>"}` returns the contract, with what its rules refer to: a component's API, states, parts and tokens, or a foundation's convention.
3. `list-rules {"component": "<component>", "scope": ["component", "both"]}` returns just the rules to report on, as records. For a foundation like Design Tokens, leave out `scope`: its rules have none.
4. Read the code: the component, its styles and tokens, its tests and its stories, or for Design Tokens, the theme and every component's styles.
5. For a rule you're unsure of, `search-docs {"query": "<its requirement>", "component": "<component>", "type": "section"}` finds the section that explains it, which `get-page` reads.
6. Report every rule as pass or fail, with its ID and the evidence from the code, like a file and line. Then fix the failures, and run the tests again.

## Report back

Report every rule, not only the failures, so the user can see what you checked. A table works well:

| Rule                | Level | Result | Evidence                                                      |
| ------------------- | ----- | ------ | ------------------------------------------------------------- |
| `button/keep-focus` | must  | Fail   | `Button.tsx:42` sets `disabled` while loading, so focus is lost |

A component meets the standard when it meets every must rule, and each should rule is expected unless there's a good reason not to follow it. Cite rule IDs exactly as the standard writes them, and never make one up.
