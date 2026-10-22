---
title: Spinner
description: How to build a spinner that shows something is busy, without getting in the way of screen readers, reduced motion or the layout around it.
navigation:
  title: Overview
---

Spinners tell people that something is busy, whether that's saving a form, loading search results or checking for updates, when there's no telling how long it'll take. They're one of the simplest components in any interface, and still easy to get wrong. Think of a spinner that screen readers read out as "image", one that keeps turning for people who asked for less motion, or one that pushes the page down as it appears.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/spinner/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a spinner looks, from its parts, size and colour to how it moves and the one variable you can set.
:::

:::card{to="/docs/components/spinner/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a spinner behaves for every person and setting, so it's accessible, predictable, clear in every state and adaptive.
:::

:::card{to="/docs/components/spinner/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Spinner, with no props, events or slots, and one implementation that every component shares.
:::

:::card{to="/docs/components/spinner/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, build and check a spinner, from the text around it to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/spinner#reference-implementation), which does its part of every rule in the [checklist](/docs/components/spinner#checklist), and is the same one the [Button](/docs/components/button/ux#loading) shows while it's loading. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Spinner with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/spinner/ax#deterministic).

| Aspect   | Spinner                                                                                       |
| -------- | --------------------------------------------------------------------------------------------- |
| Element  | `<svg>`                                                                                       |
| Role     | None, since it's hidden from assistive technologies with `aria-hidden`                        |
| Name     | None. Whatever shows it says what's loading, like the Button with its `loadingLabel`          |
| Keyboard | None, since it can't be focused                                                               |
| States   | None of its own. It turns while it's in the page, and pulses when someone prefers reduced motion |
| Size     | `1em`, the size of the text around it, unless `--spinner--size` sets another                  |
| Colour   | `currentColor`, the colour of the text around it                                              |
| Used by  | [Button](/docs/components/button/ux#loading)                                                     |
| WCAG 2.2 | 1.1.1, 1.4.4, 1.4.11, 2.2.2, 2.3.3 and 4.1.3                                                  |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A spinner meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Spinner itself, so they're the ones to check when you build or review one. **Usage** rules are met by the screens and components that show it, like saying what's loading, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like contrast: the Spinner takes the colour of the text around it, as long as that text passes.

The basis says where a rule comes from. A few rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them. The rest are **Open Components** rules, which are our own, like showing one spinner per wait. Where a rule goes further than WCAG asks at level AA, its basis says so: the reduced-motion rule comes from level **AAA**, and a rule that asks for more than its criterion says **beyond**, like announcing how a wait went, which WCAG only asks for when there's a message to announce.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/spinner/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/spinner/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/spinner/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/spinner/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, powers every example on it and is what the [Button](/docs/components/button#reference-implementation) shows while it's loading. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves: hidden from assistive technologies, drawn in `currentColor`, `1em` by default and pulsing with reduced motion.

The tests are in `Spinner.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [Spinner.vue]
<template>
  <svg class="spinner" viewBox="0 0 16 16" aria-hidden="true">
    <!-- Visual only: whatever shows the spinner tells screen readers what's loading. -->
    <circle data-slot="track" cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="2" opacity="0.25" />
    <path
      data-slot="indicator"
      d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The spinner's styles go in `components`,
   so a class of yours that sets its size wins without any specificity tricks. */
@layer theme, base, components, utilities;

@layer components {
  .spinner {
    /* The size of the text around it, like an icon. Components that place it set their own. */
    --spinner--size: 1em;

    /* Inline, like a letter, even under resets that make every svg a block, like Tailwind's Preflight. */
    display: inline-block;
    flex-shrink: 0;
    width: var(--spinner--size);
    height: var(--spinner--size);
    /* Centred on the text around it, when it sits in a line of text. */
    vertical-align: -0.125em;
    animation: spinner-turn 0.8s linear infinite;
  }
  @keyframes spinner-turn {
    to {
      rotate: 1turn;
    }
  }
  @keyframes spinner-pulse {
    50% {
      opacity: 0.4;
    }
  }

  /* With reduced motion, the spinner pulses instead of turning. */
  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: spinner-pulse 1.6s ease-in-out infinite;
    }
  }
}
</style>
```
```ts [Spinner.test.ts]
import { render } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import Spinner from "./Spinner.vue";

describe("Spinner", () => {
  it("is hidden from assistive technologies, with no role or name of its own", () => {
    const { container } = render(Spinner);

    const spinner = container.querySelector("svg");
    expect(spinner).toHaveAttribute("aria-hidden", "true");
    expect(spinner).not.toHaveAttribute("role");
    expect(spinner?.querySelector("title")).toBeNull();
  });

  it("renders the svg itself, so classes and attributes land on it", () => {
    const { container } = render(Spinner, { attrs: { class: "large", "data-slot": "spinner" } });

    const spinner = container.firstElementChild;
    expect(spinner?.tagName).toBe("svg");
    expect(spinner).toHaveClass("spinner", "large");
    expect(spinner).toHaveAttribute("data-slot", "spinner");
  });

  it("renders the same markup every time, with its parts in a fixed order", () => {
    const first = render(Spinner).container.innerHTML;
    const { container } = render(Spinner);

    expect(container.innerHTML).toBe(first);
    const parts = [...container.querySelector("svg")!.children].map((part) => part.getAttribute("data-slot"));
    expect(parts).toEqual(["track", "indicator"]);
  });
});
```
:::
::

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 2.2.2: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), for loading animations
- [Understanding SC 2.3.3: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- [Understanding SC 4.1.3: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WAI-ARIA 1.2: progressbar](https://www.w3.org/TR/wai-aria-1.2/#progressbar) and [aria-busy](https://www.w3.org/TR/wai-aria-1.2/#aria-busy)
- [CSS Color Adjustment: forced colors mode](https://www.w3.org/TR/css-color-adjust-1/)
- [Nielsen Norman Group: Progress Indicators Make a Slow System Less Insufferable](https://www.nngroup.com/articles/progress-indicators/)
- [Primer: Spinner](https://primer.style/product/components/spinner/), for leaving the announcement to visible text and the delay before it appears
- [Primer: Loading](https://primer.style/product/ui-patterns/loading/), for spinners, skeletons and `aria-busy`
