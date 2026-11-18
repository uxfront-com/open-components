---
title: How to name design tokens
description: "How to name design tokens so people, tools and agents read them the same way: token paths, step by step, with worked examples."
date: 2026-11-18
author:
  name: Alex Grozav
counterExamples:
  - --blue-2
  - --color-primary-text
  - --color--indigo-600
  - --font-size-sm
  - --color--primary--contrast
  - --button--font--size
  - --button-icon-size
  - --tooltip-background
  - --tooltip-color
  - --tooltip-border-radius
  - --tooltip-font-size
  - --tooltip-arrow-size
---

You name a design token by its path: the groups it belongs to, then its own name, with a double dash between the groups and a single dash between the words inside each one, as in `--button--icon--size`. A token's name is all that people, tools and agents have to go on, so a name that can only be read one way is a name they'll all read the same way.

Think of a `--blue-2` that doesn't say what it's for, a `--color-primary-text` that could be the `primary-text` colour or the `text` of `color-primary`, or a rebrand that means editing every component, because each one reads `--color--indigo-600` straight from the palette. Open Components calls its convention token paths, and the [Design Tokens](/docs/foundations/design-tokens) page defines it. This post walks you through it in six steps, each with the reason behind it, then renames a few names you may recognise and names one component from start to finish.

## Start with the scope

Let's start with the first group, which says what a token belongs to. It's either a category, like `color`, `spacing`, `font-size` or `border-radius`, or a component, like `button`. The last part is the token's own name, like `primary`, `sm` or `height`, and most tokens only need those two levels:

```css
:root {
  --color--primary: …;  /* color › primary */
  --font-size--sm: …;   /* font-size › sm */
}

.button {
  --button--height: 2.25rem; /* button › height */
}
```

Since the scope comes first, every token of the button starts with the same prefix, which is what lets you find them all at once, as you'll see in a moment. The page covers this under [Groups](/docs/foundations/design-tokens#groups).

## Name it after what it's for

Next, name a token after what it's for, rather than what it looks like. `--color--primary` still makes sense after a rebrand and in dark mode, while `--color--indigo-600` stops making sense the day your primary colour isn't indigo any more (`tokens/semantic-names`).

Tokens come in up to three tiers, and each tier reads from the one before it:

| Tier      | What it holds                 | For example                           | Read by        |
| --------- | ----------------------------- | ------------------------------------- | -------------- |
| Palette   | Every value you have          | `--color--indigo-600`, `--spacing--4` | The theme      |
| Theme     | What each value is for        | `--color--primary`, `--color--focus`  | Components     |
| Component | One component's own decisions | `--button--height`, `--button--fill`  | That component |

So `--color--indigo-600` is a fine name for a palette token. It's wrong as the name of what a colour is for, and wrong wherever a component reads it, since components read theme tokens and never palette tokens or raw colours (`tokens/theme-only`). That way a new brand or a dark mode is a new set of theme values, and no component has to change.

The palette is optional, and our reference tokens skip it. There's more under [Semantic names](/docs/foundations/design-tokens#semantic-names).

## Join groups with a double dash

Now let's look at the separators. Groups are joined by a double dash, and the words inside a group or a name by a single dash, all in lowercase letters and digits (`tokens/token-paths`):

```css
:root {
  --color--primary-contrast: …; /* color › primary-contrast */
  --font-size--sm: …;           /* font-size › sm */
}
```

The double dash is what makes a name read one way only. With single dashes, `--font-size-sm` could be `font.size-sm`, `font-size.sm` or `font.size.sm`, and a tool has no way to tell which. `--font-size--sm` can only be `font-size.sm`, so tools and agents can turn any name back into its path.

It also makes a component's tokens easy to find. A search for the button's prefix finds every one of its variables and nothing else, since a button group's variables start with `button-group` instead:

```sh
git grep -e '--button--'
```

And since Tailwind CSS names its theme variables with single dashes, a token path can never have the same name as one of them, so your tokens and Tailwind's can share a page. The page explains all three reasons under [Why a double dash](/docs/foundations/design-tokens#why-a-double-dash).

## Give a part or a state its own group

When a token belongs to a part or a state of a component, rather than to the component as a whole, give that part or state a group of its own, even for a single token. The button sizes its icons with `--button--icon--size`, and a link's hover state would have `--link--hover--color`. Since the group is there from the first token, adding a second one later, like `--button--icon--color`, never means renaming the first.

Two things stay in one piece, though (`tokens/groups`):

- **A variation stays in its name.** The label on the primary fill is `--color--primary-contrast`, rather than `--color--primary--contrast`, which would read as a `contrast` token in a group called `primary`.
- **A CSS property stays whole.** `font-size` is a single name, so the button's text is sized with `--button--font-size`, rather than `--button--font--size`, and the same goes for `border-radius` and `line-height`.

The page covers parts, states, variations and CSS properties under [Groups](/docs/foundations/design-tokens#groups).

## Name the theme's colours the same way

Every component reads its colours from the same theme tokens, so a single theme styles them all (`tokens/shared-theme`). There are three tokens per colour, plus one focus colour:

| Token                       | What it's for                                         |
| --------------------------- | ----------------------------------------------------- |
| `--color--{color}`          | The colour itself, for fills and tints                |
| `--color--{color}-contrast` | Text and icons on top of the fill                     |
| `--color--{color}-text`     | Text and icons in that colour, straight on the page   |
| `--color--focus`            | The focus ring, which is the same for every component |

`{color}` is one of `primary`, `secondary`, `neutral`, `success`, `info`, `warning` and `error`, the same colours as the Button's `color` prop. So a primary button reads `--color--primary`, `--color--primary-contrast` and `--color--primary-text`. Each pairing has to stay readable in light and dark mode, and [Theme tokens](/docs/foundations/design-tokens#theme-tokens) gives the contrast each one needs (`tokens/contrast`).

## Name a component's variables after it

Finally, a component names its own variables after itself, as `--{component}--{name}`, or `--{component}--{part}--{name}` for one of its parts, and sets them on its root (`tokens/component-scope`):

```css
.button {
  --button--height: 2.25rem;
  --button--icon--size: 1rem;
  --button--fill: var(--color--neutral);
}
.button[data-color="primary"] {
  --button--fill: var(--color--primary);
}
```

Starting with the component's name makes it clear who owns them, so `--button--fill` can never be mistaken for a theme token. Setting them on the root, rather than on `:root`, keeps them with the component: each size or colour changes them with a single selector, and nothing leaks into the rest of the page. To tune a component, set its variables from a class of yours, as [Component variables](/docs/foundations/design-tokens#component-variables) shows.

## Worked examples

Let's put the six steps to work, starting with single names and ending with a whole component.

### Names to rename

Here are some names you might find in a stylesheet today, each with the rule it breaks and the name it should have:

- **`--blue-2`** has no group, and says what it looks like rather than what it's for (`tokens/token-paths`, `tokens/semantic-names`). Name it after what it's used for, so if it's your brand colour, it's `--color--primary`, with the path `color › primary`.
- **`--color-primary-text`** can be read two ways, since it only has single dashes (`tokens/token-paths`). As the primary colour's text, it's `--color--primary-text`, with the path `color › primary-text`.
- **`--button-icon-size`** has no groups either (`tokens/token-paths`). The icon is a part of the button, so it's `--button--icon--size`, with the path `button › icon › size`.
- **`--color--primary--contrast`** gives a variation a group of its own, so it reads as a `contrast` token in a group called `primary` (`tokens/groups`). It's `--color--primary-contrast`, with the path `color › primary-contrast`.
- **`--button--font--size`** splits a CSS property in two (`tokens/groups`). It's `--button--font-size`, with the path `button › font-size`.

Keep in mind that the last two are token paths as far as the syntax goes, so a linter passes them. Only a review catches them, which is why `tokens/groups` has Review as its check.

### One component, end to end

Say you have a tooltip with these variables:

```css
.tooltip {
  --tooltip-background: #18181b;
  --tooltip-color: #fff;
  --tooltip-border-radius: 6px;
  --tooltip-font-size: 14px;
  --tooltip-arrow-size: 8px;
}
```

None of them has a path, since they only use single dashes (`tokens/token-paths`). The scope is the component, so every name starts with `tooltip` and a double dash. `background`, `color`, `border-radius` and `font-size` are CSS properties, so each stays whole, while the arrow is a part, so it gets a group of its own. The colours come from the theme rather than raw values (`tokens/theme-only`), and everything else keeps its value:

```css
.tooltip {
  --tooltip--background: var(--color--neutral);
  --tooltip--color: var(--color--neutral-contrast);
  --tooltip--border-radius: 6px;
  --tooltip--font-size: 14px;
  --tooltip--arrow--size: 8px;
}
```

Now the tooltip follows every theme on its own, and a search for its prefix finds all five of its variables.

### The same path everywhere

A token's path stays the same wherever your tokens live, so moving between your design files, your token files and your CSS only means swapping the separator. Here's the tooltip's arrow in each:

| Where                | How it's written         |
| -------------------- | ------------------------ |
| CSS                  | `--tooltip--arrow--size` |
| Design tokens (DTCG) | `{tooltip.arrow.size}`   |
| Figma variables      | `tooltip/arrow/size`     |
| Styleframe           | `tooltip.arrow.size`     |

## Check your names

Once your tokens are renamed, you can keep them that way. Stylelint's `custom-property-pattern` rule, with the pattern from the page's [Lint](/docs/foundations/design-tokens#lint) section, flags every custom property that isn't a token path, in declarations and `var()` references alike. It flags other libraries' variables too, like Tailwind's, so it's best to run it on your theme and your components' styles.

The rest, like whether a name says what it's for, takes a review, and the page's [Prompts](/docs/foundations/design-tokens#prompts) hand that review to your agent. Point it at the page's Markdown copy, [`/raw/docs/foundations/design-tokens.md`](/raw/docs/foundations/design-tokens.md){external=""}, and it reports pass or fail for each rule in the checklist, with the rule ID and the evidence from your code. The other prompt renames your variables to token paths, along with every `var()` that reads them.

Every rule in this post comes from the [Design Tokens](/docs/foundations/design-tokens) page, which has the whole checklist, the contract agents read and answers to questions like how to move from single-dash names. It's the page to keep open while you rename.

## Sources

- [Design Tokens](/docs/foundations/design-tokens), the Open Components page every rule and reason here comes from
- [Design Tokens Format Module](https://www.designtokens.org/tr/2025.10/format/), for the DTCG way of writing a path
- [Stylelint: custom-property-pattern](https://stylelint.io/user-guide/rules/custom-property-pattern/), for the lint rule
- [Tailwind CSS: Theme variables](https://tailwindcss.com/docs/theme), for its single-dash names
