---
title: Introduction
description: Open Components is the standard for perfect UI components, with a perfect user experience, developer experience and agentic experience.
navigation:
  icon: i-lucide-book-open
---

Open Components is the UXFront component standard: guidelines for building UI components with a perfect user experience, developer experience and agentic experience, whether humans or AI agents write them.

Learn the guidelines once, then hold every component to the same high standards, whether you or your agents write it.

## The three layers

The standard has three layers, one for each audience a component serves. A component meets the standard when it meets all three.

### User experience

Components behave the way people expect them to, with any input, on any device and for every ability.

- **Accessible**: keyboard, pointer, touch and screen readers, following [WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/).
- **Predictable**: the same interaction works the same way in every component.
- **Every state**: hover, focus, active, disabled, loading and error, all designed.
- **Adaptive**: respects motion, contrast, colour scheme and text size preferences.

### Developer experience

One clear API, learned once and used everywhere. Knowing one component means knowing them all.

- **Consistent**: sizes, colours, states and events share their names everywhere.
- **Type-safe**: every prop, event and slot is typed and documented.
- **Composable**: small parts build larger ones, with no hidden coupling.
- **Controllable**: controlled or uncontrolled, with every state within reach.

### Agentic experience

Components that AI agents can read, reason about and build with, so their output meets the same bar as yours.

- **Semantic**: roles, names and states agents can read straight from the markup.
- **Described**: anatomy, props and states, published as machine-readable specs.
- **Deterministic**: the same input always renders the same structure.
- **Verifiable**: rules agents can check their work against before shipping.

## Components

Each component page holds one component to the three layers, and also covers how it looks, which we call its UI. Every page follows the same structure, so you and your agents always know where to look:

- **At a glance**: a single table with its element, role, keyboard support and options.
- **UI**: its anatomy, variants, colours, sizes, states and tokens.
- **UX**, **DX** and **AX**: the three layers, one trait at a time.
- **Checklist**: every rule, with a stable ID like `button/keep-focus`, a level and a way to check it.
- **Reference implementation**: a component that meets every rule, along with its tests. The code is in Vue for now.

The [Button](/docs/components/button) is a great place to start.

## For agents

Every page of these docs is also published as markdown: prefix its path with `/raw` and add `.md`, as in [`/raw/docs.md`](/raw/docs.md){external=""}. [`/llms.txt`](/llms.txt){external=""} lists every page, and [`/llms-full.txt`](/llms-full.txt){external=""} holds them all in one file.
