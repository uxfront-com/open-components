---
title: How to name design tokens
description: "How to name design tokens so people, tools and agents read them the same way: token paths, step by step, with worked examples."
date: 2026-11-18
author:
  name: Alex Grozav
counterExamples:
  - --blue-2
  - --color-primary-text
  - --font-size-sm
  - --tooltip-background
  - --tooltip-color
  - --tooltip-border-radius
  - --tooltip-font-size
  - --tooltip-arrow-size
  - --color--blue-2
  - --color--primary--contrast
  - --tooltip--arrow-size
  - --tooltip--font--size
---

I've spent a lot of the past few years thinking about how to name design tokens, and I've tried many different approaches. The one I've settled on is to treat a design token as a path to a design property, like a button's text colour or your brand colour. A path says what the token sets and what it belongs to, so you can tell both from the name alone.

In code, you'd usually write a path with dots, and `button.text.color` reads clearly in any programming language. CSS doesn't allow a dot in a variable name unless you escape it, so I use a double dash instead, which brings the same level of clarity: `--button--text--color`. We call this convention token paths, and our [Design Tokens](/docs/foundations/design-tokens) page defines it.

## Token paths

You name a design token by its path: first the groups it belongs to, then its own name, with a double dash between the groups and a single dash between the words inside each one, as in `--button--icon--size`. The double dash marks where one group ends and the next begins, so that name can only be read as `button › icon › size`

A token's name is all that people, tools and agents have to go on when they read your styles, and it's easy to pick one that doesn't tell them enough. Think of a `--blue-2` that doesn't say what it's for, a `--color-primary-text` that could be the `primary-text` colour or the `text` of `color-primary`, or a dark mode that means editing every component, because each one has its colours written into it.

Let's take a small stylesheet with all three problems, a theme and a tooltip, and rename it a step at a time:

```css
:root {
  --blue-2: #4f46e5;
  --color-primary-text: #4338ca;
  --font-size-sm: 0.875rem;
}

.tooltip {
  --tooltip-background: #18181b;
  --tooltip-color: #fff;
  --tooltip-border-radius: 6px;
  --tooltip-font-size: var(--font-size-sm);
  --tooltip-arrow-size: 8px;
}
```

It works, but you have to guess what most of these names mean. Each step below fixes one thing, and every value stays as it is.

## Give every name a path

Let's start with the groups. Every name begins with its scope, which is either a category, like `color` or `font-size`, or a component, like `tooltip`. Then comes the token's own name, with a double dash between the two and single dashes between the words inside each:

```css
:root {
  --color--blue-2: #4f46e5;
  --color--primary-text: #4338ca;
  --font-size--sm: 0.875rem;
}

.tooltip {
  --tooltip--background: #18181b;
  --tooltip--color: #fff;
  --tooltip--border-radius: 6px;
  --tooltip--font-size: var(--font-size--sm);
  --tooltip--arrow-size: 8px;
}
```

The double dash is what makes a name read one way only. With single dashes, `--font-size-sm` could be `font.size-sm`, `font-size.sm` or `font.size.sm`, and a tool has no way to tell which. `--font-size--sm` can only be `font-size.sm`, so tools and agents can turn any name back into its path. Note that the tooltip's `var()` changes along with the name it reads.

It also makes a component's variables easy to find. With single dashes, a search for a button's variables would find a button group's too, since `button-group` starts with the same letters. With the double dash, a search for the tooltip's prefix finds every one of its variables and nothing else:

```sh
git grep -e '--tooltip--'
```

And since Tailwind CSS names its theme variables with single dashes, none of your names can clash with one of its own. The Design Tokens page goes into all three reasons under [Why a double dash](/docs/foundations/design-tokens#why-a-double-dash).

## Say what each colour is for

Now that `--blue-2` has a path, it's easier to see what's still wrong with it. `--color--blue-2` says what the colour looks like, when what you need to know is what it's for. Say it's your brand colour, the one your main actions use: then it's `--color--primary`.

That name still makes sense after a rebrand and in dark mode, while `--color--blue-2` stops making sense the day your brand isn't blue. Feel free to keep a palette of names like `--color--blue-2` behind your theme, as long as only the theme reads them. [Semantic names](/docs/foundations/design-tokens#semantic-names) explains how the palette, the theme and a component's own tokens each read from the one before.

## Take the tooltip's colours from the theme

Next, let's look at the tooltip's colours. It writes them as raw values, `#18181b` and `#fff`, so a dark mode or a new brand means finding and editing them here, and in every other component that does the same. A component reads its colours from the theme instead, never from raw values or a palette, so a single theme styles them all.

The theme gives each colour three tokens. `--color--{color}` is the fill, and `--color--{color}-contrast` is for text and icons on top of it. `--color--{color}-text` is for text in that colour, straight on the page.

That's because one colour can't always be readable on both sides: a bright yellow `warning` fill needs dark text on top of it, while warning text on a white page needs a much darker shade than the fill. So the theme gets a `neutral` colour for the tooltip, and the primary colour gets the contrast it was missing:

```css
:root {
  --color--primary: #4f46e5;
  --color--primary-contrast: #fff;
  --color--primary-text: #4338ca;
  --color--neutral: #18181b;
  --color--neutral-contrast: #fff;
  --color--neutral-text: #3f3f46;
  --font-size--sm: 0.875rem;
}

.tooltip {
  --tooltip--background: var(--color--neutral);
  --tooltip--color: var(--color--neutral-contrast);
  /* … */
}
```

Keep in mind that `-contrast` is a variation of the colour, so it stays in the colour's name. `--color--primary--contrast` would read as a `contrast` token in a group called `primary`. Each `-contrast` needs a contrast of 4.5:1 against its colour, and each `-text` 4.5:1 against the page, in light and dark mode alike ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)). To keep this example short, it only has light values, which pass, and [Theme tokens](/docs/foundations/design-tokens#theme-tokens) shows how a single token holds both modes with `light-dark()`.

## Give the arrow a group of its own

Finally, let's look at the arrow. It's a part of the tooltip, rather than the tooltip as a whole, so it gets a group of its own: `--tooltip--arrow-size` becomes `--tooltip--arrow--size`. We give a part or a state its own group even when it has a single token, since the group is then there from the start, and adding `--tooltip--arrow--color` later never means renaming the first one.

A CSS property stays in one piece, though. `font-size` is a single name, so the tooltip's text is sized with `--tooltip--font-size`, rather than `--tooltip--font--size`, and the same goes for `border-radius`.

The tooltip already did one thing right: it sets its variables on its own root, `.tooltip`, rather than on `:root`. That keeps them with the component, so each size or colour can change them with a single selector, and nothing leaks into the rest of the page. And since every name starts with `tooltip`, `--tooltip--background` can never be mistaken for a theme token. [Component variables](/docs/foundations/design-tokens#component-variables) has more on how a component names its own.

## The stylesheet, renamed

Here's the whole stylesheet after the four steps, with every value as it was:

```css
:root {
  --color--primary: #4f46e5;
  --color--primary-contrast: #fff;
  --color--primary-text: #4338ca;
  --color--neutral: #18181b;
  --color--neutral-contrast: #fff;
  --color--neutral-text: #3f3f46;
  --font-size--sm: 0.875rem;
}

.tooltip {
  --tooltip--background: var(--color--neutral);
  --tooltip--color: var(--color--neutral-contrast);
  --tooltip--border-radius: 6px;
  --tooltip--font-size: var(--font-size--sm);
  --tooltip--arrow--size: 8px;
}
```

Every name now has one reading, says what it's for and belongs to the theme or the tooltip. A new brand or a dark mode is a new set of theme values, and the tooltip doesn't have to change.

Since a name is a path, it stays the same wherever your tokens live, and moving between your design files, your token files and your CSS only means swapping the separator. Here's the tooltip's arrow in each:

| Where                | How it's written         |
| -------------------- | ------------------------ |
| CSS                  | `--tooltip--arrow--size` |
| Design tokens (DTCG) | `{tooltip.arrow.size}`   |
| Figma variables      | `tooltip/arrow/size`     |
| Styleframe           | `tooltip.arrow.size`     |

## Keep your names that way

A linter can catch most of this for you. Stylelint's `custom-property-pattern` rule, with the pattern from the [Lint](/docs/foundations/design-tokens#lint) section, flags every custom property that isn't a token path, in declarations and `var()` references alike. It would have flagged every name in the first stylesheet. It flags other libraries' variables too, like Tailwind's, so it's best to run it on your theme and your components' styles.

What a linter can't tell is whether a name says what it's for, or whether a group is in the right place. `--color--blue-2`, `--tooltip--arrow-size` and `--tooltip--font--size` are all token paths as far as the pattern goes, so it passes them. For those, the page's [Prompts](/docs/foundations/design-tokens#prompts) hand the review to your agent, which checks your styles against each rule in the page's checklist and reports what it finds, with the evidence from your code.

The Design Tokens page is where every rule here comes from, with the contract agents read and answers to questions like how to move from single-dash names. Its Markdown copy, [`/raw/docs/foundations/design-tokens.md`](/raw/docs/foundations/design-tokens.md){external=""}, is the one to point your agent at.

## Sources

- [Design Tokens](/docs/foundations/design-tokens), the Open Components page every rule and reason here comes from
- [Design Tokens Format Module](https://www.designtokens.org/tr/2025.10/format/), for the DTCG way of writing a path
- [Stylelint: custom-property-pattern](https://stylelint.io/user-guide/rules/custom-property-pattern/), for the lint rule
- [Tailwind CSS: Theme variables](https://tailwindcss.com/docs/theme), for its single-dash names
- [Understanding WCAG 2.2: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), for the 4.5:1 contrast
