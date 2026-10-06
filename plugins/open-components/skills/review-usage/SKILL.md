---
name: review-usage
description: Reviews how a screen, page or feature uses a UI component, like a button, against the rules of its Open Components contract that the code using it meets, like keeping one primary button per view, reporting every rule as pass or fail with its ID and the evidence, then fixing the failures. Use when asked to review a screen, form, dialog or flow, or how an app uses its buttons, inputs or other components, against Open Components.
license: CC-BY-4.0
compatibility: Reads the standard from the open-components MCP server this plugin connects, or from opencomponents.dev, so it needs network access.
---

# Review how a screen uses a component

Open Components (https://opencomponents.dev) is a standard for UI components. Every shipped component has a contract with every rule in its checklist. Each rule has a stable ID, like `button/one-primary`, a level, `must` or `should`, and a scope: `component` (met by the component itself), `usage` (met by the code that uses it) or `both`.

This skill reviews the code that uses a component, against the rules with a `usage` or `both` scope, like labelling buttons with a verb or using a link to navigate. To review the component itself, use the review-component skill.

## Read the standard a piece at a time

Use the tools of the `open-components` MCP server, which this plugin connects. Below, `<component>` is the name `list-components` gives a component, like `button`.

If you don't have the tools, read the same standard from the site. Fetch the files as they are, rather than through a tool that summarises them, so every rule comes back word for word:

- https://opencomponents.dev/llms.txt lists every contract, in place of `list-components`.
- A contract, like https://opencomponents.dev/raw/docs/components/button.yaml, has the rules `list-rules` filters under `rules`, each with its `scope`.
- A page, like https://opencomponents.dev/raw/docs/components/button.md, is what `get-page` reads, and explains every rule.

## Review it

1. Find the components the screen uses. `list-components {}` tells you which of them have a contract, and the names the other tools take.
2. For each one, `list-rules {"component": "<component>", "scope": ["usage", "both"]}` returns the rules to report on, as records. A component without any has nothing to review here.
3. Read the screen's code, and what it renders: the order of its controls, their labels, what happens when they're used, and where focus goes next.
4. For a rule you're unsure of, `search-docs {"query": "<its requirement>", "component": "<component>", "type": "section"}` finds the section that explains it, which `get-page` reads.
5. Report every rule as pass or fail, with its ID and the evidence from the code, like a file and line. Then fix the failures.

## Report back

Report every rule, not only the failures, so the user can see what you checked. A table works well:

| Rule                 | Level  | Result | Evidence                                                     |
| -------------------- | ------ | ------ | ------------------------------------------------------------ |
| `button/one-primary` | should | Fail   | `Checkout.tsx:88` shows Pay and Save for later, both primary |

A screen meets the standard when it meets every must rule, and each should rule is expected unless there's a good reason not to follow it. Cite rule IDs exactly as the standard writes them, and never make one up.
