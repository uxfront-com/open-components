---
title: How to name design tokens
description: "How to name design tokens so people, tools and agents read them the same way: token paths, step by step, with worked examples."
date: 2026-11-18
author:
  name: Alex Grozav
counterExamples:
  - --color--primary--contrast
---

Name a design token by its path: the groups it belongs to, then its own name, with `--` between groups and `-` between the words inside one, as in `--color--primary-contrast`. The [Design Tokens](/docs/foundations/design-tokens) page defines the pattern, and this post walks through it.

## Start with the group

The first group says what a token belongs to, like `color` or `button`, and the last part says what it is. A theme colour's label is `--color--{color}-contrast`, and a component's part is `--{component}--{part}--{name}`, so the button sizes its icon with `--button--icon--size`.

| Token                       | Path                        |
| --------------------------- | --------------------------- |
| `--color--primary`          | color › primary             |
| `--color--primary-contrast` | color › primary-contrast    |
| `--button--icon--size`      | button › icon › size        |

A variation stays in its name, so `--color--primary--contrast` is wrong: it reads as a group called `primary`. The separator between groups is always `--`, never a single `-`.

```css
.button {
  --button--icon--size: 1rem;
  color: var(--color--primary-contrast);
  background: var(--color--primary);
}
```
