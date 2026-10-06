---
name: adopt-token-paths
description: Renames a codebase's CSS variables to Open Components token paths, like --color--primary or --button--icon--size, keeping their values, then adds the Stylelint rule that keeps them that way. Use when asked to rename, organise or standardise CSS custom properties or design tokens, to set up a naming convention for them, or to adopt token paths.
license: CC-BY-4.0
compatibility: Reads the standard from the open-components MCP server this plugin connects, or from opencomponents.dev, so it needs network access.
---

# Adopt token paths

Open Components (https://opencomponents.dev) is a standard for UI components. Its Design Tokens foundation names every CSS variable as a token path: the groups it belongs to, then its own name, with a double dash between groups and single dashes inside a group or a name.

```css
:root {
  --color--primary: …;          /* color › primary */
  --color--primary-contrast: …; /* color › primary-contrast */
}

.button {
  --button--icon--size: 1rem;   /* button › icon › size */
}
```

## Read the convention

Use the tools of the `open-components` MCP server, which this plugin connects:

- `get-contract {"component": "design-tokens"}` returns the convention and its rules, each with a stable ID, like `tokens/token-paths`.
- `get-page {"path": "design-tokens", "sections": ["Token paths"]}` explains how to group a token, with examples.
- `get-page {"path": "design-tokens", "sections": ["Lint"]}` returns the Stylelint rule.

If you don't have the tools, read the same from the site, fetching the files as they are rather than through a tool that summarises them: https://opencomponents.dev/raw/docs/foundations/design-tokens.yaml is the contract, and https://opencomponents.dev/raw/docs/foundations/design-tokens.md the page.

## Rename them

1. Find every CSS variable the codebase declares, in its theme, its components' styles, and anywhere else they're set, like inline styles or scripts.
2. List the token groups first, like `color`, `spacing`, `font-size` and one for each component, and show the user how each variable maps to its new name before renaming anything.
3. Rename every variable along with every `var()` that reads it, keeping the values as they are. Leave other libraries' variables, like Tailwind's, under their own names.
4. Add the Stylelint rule from the page, then fix anything it reports in the codebase's own variables.
5. Check that nothing still reads an old name, and that the styles render as they did.

Cite the convention's rule IDs exactly as the standard writes them, and never make one up.
