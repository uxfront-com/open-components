---
title: Popover
description: How to build a popover that shows more next to what opened it, leaves the rest of the page working, opens and closes the way people expect and can be checked by your agents.
navigation:
  icon: i-lucide-message-square-more
---

Popovers show more next to the button that opened them, like a set of filters, a short form or a hint with a link, while the rest of the page keeps working. They sit between a tooltip, which only hints, and a dialog, which takes over the page, so they inherit the hard parts of both: focus, `Escape` and the top layer. Think of a popover that keyboard users can open but never reach, one whose `Escape` closes the dialog behind it as well, or one that opens off the edge of a phone's screen.

This page walks you through building one the right way. We'll look at:
- **User Interface** (UI) - how a popover looks and where it opens
- **User Experience** (UX) - how it behaves for every person and every input
- **Developer Experience** (DX) - how developers work with it
- **Agentic Experience** (AX) - how agents can read and verify it

Every example on this page runs on our [reference implementation](/docs/components/popover#reference-implementation), which does its part of every rule in the [checklist](/docs/components/popover#checklist), so feel free to open them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Popover with the same API in each, apart from two names in Angular, which [Type-safe](/docs/components/popover#type-safe) explains. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/popover#deterministic).

The Popover is the non-modal sibling of the [Dialog](/docs/components/dialog) and the interactive sibling of the [Tooltip](/docs/components/tooltip). It keeps the rules they settled for focus, `Escape` and the top layer, and the Dropdown Menu and the Combobox on our [Roadmap](/docs/getting-started/roadmap) will build on the ones it settles for placement and closing.

::popover-playground
::

## At a glance

| Aspect    | Popover                                                                                               |
| --------- | ----------------------------------------------------------------------------------------------------- |
| Element   | A `<div popover="auto">`, rendered right after its trigger, and in the top layer while it's open      |
| Role      | `dialog`, without `aria-modal`, since the page around it keeps working                                |
| Name      | Its title, linked with `aria-labelledby`                                                              |
| Trigger   | A Button with `popovertarget` and `aria-haspopup="dialog"`, which the Popover gives `aria-expanded`     |
| Keyboard  | `Enter` or `Space` on the trigger opens it, focus moves in, and `Escape` closes it and gives focus back |
| Pointer   | A press on the trigger opens and closes it, and a press outside it closes it                          |
| States    | Open and closed, as `data-state`                                                                      |
| Placement | `top`, `bottom`, `start` or `end` of its trigger, flipping to the other side when there's no room     |
| Pattern   | The [`dialog` role](https://www.w3.org/TR/wai-aria-1.2/#dialog) in WAI-ARIA, and the APG's [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) for its trigger |
| WCAG 2.2  | 1.3.1, 1.3.2, 1.4.3, 1.4.10, 2.1.1, 2.1.2, 2.4.3, 2.4.11 and 4.1.2, among others                     |

## User Interface (UI)

Let's start with how a popover looks: its parts, where it opens, what goes in it, its states and the variables you can set.

### Anatomy

::popover-anatomy
1. **Trigger** — The Button that opens it, with `popovertarget`. It's yours, and it keeps its own label.
2. **Panel** — The popover itself, a `<div>` in the top layer while it's open, which holds every other part.
3. **Title** — A few words on what it holds, like "Filters". It names the popover.
4. **Close button** — A Button, named "Close", for people who can't press `Escape`, like on a phone.
5. **Body** — Optional. The content, like a few options, a short form or a hint, which scrolls when it doesn't fit.
6. **Offset** — The gap between the trigger and the panel.
7. **Arrow** — Off by default. A small point on the edge that faces the trigger, hidden from assistive technologies.
::

Every popover has a panel, a title and a close button, and it always renders right after its trigger. That's what puts its content next in the reading order, so `Tab` and screen readers reach it straight after the button that opened it ([WCAG 1.3.2](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html), [2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)). You can see the order of its parts in the [DOM contract](/docs/components/popover#deterministic).

### Placement

The `placement` prop says which side of its trigger the popover opens on, and `bottom` is the default. `start` and `end` follow the reading direction, so `start` is on the left in English and on the right in Arabic. When there isn't room on that side, like for a button at the bottom of the window, the popover flips to the other side.

A `start` or `end` popover with room on neither side, like on a phone, opens below its trigger, or above it. When there's still no room, like on a short screen or at 400% zoom, it shrinks to fit on a side with about half the screen or more, and its body scrolls. So in browsers with CSS anchor positioning, it always stays inside the viewport and never covers its trigger. Older ones, Chrome and Edge before 129, Firefox before 147 and Safari before 26, keep it inside the viewport too, but a tall popover can cover its trigger there.

::popover-placement-example
::framework-switcher
#react
```tsx
<Button popoverTarget="placement-top" aria-haspopup="dialog" variant="outline">Top</Button>
<Popover id="placement-top" title="Top" placement="top">
  <p>It opens above the button.</p>
</Popover>
{/* …bottom, start and end */}
```

#vue
```vue
<Button popovertarget="placement-top" aria-haspopup="dialog" variant="outline">Top</Button>
<Popover id="placement-top" title="Top" placement="top">
  <p>It opens above the button.</p>
</Popover>
<!-- …bottom, start and end -->
```

#svelte
```svelte
<Button popovertarget="placement-top" aria-haspopup="dialog" variant="outline">Top</Button>
<Popover id="placement-top" title="Top" placement="top">
  <p>It opens above the button.</p>
</Popover>
<!-- …bottom, start and end -->
```

#angular
```angular-html
<button appButton popovertarget="placement-top" aria-haspopup="dialog" variant="outline">Top</button>
<div appPopover id="placement-top" popoverTitle="Top" placement="top">
  <p>It opens above the button.</p>
</div>
<!-- …bottom, start and end -->
```

#solid
```tsx
<Button popovertarget="placement-top" aria-haspopup="dialog" variant="outline">Top</Button>
<Popover id="placement-top" title="Top" placement="top">
  <p>It opens above the button.</p>
</Popover>
{/* …bottom, start and end */}
```

#astro
```astro
<Button popovertarget="placement-top" aria-haspopup="dialog" variant="outline">Top</Button>
<Popover id="placement-top" title="Top" placement="top">
  <p>It opens above the button.</p>
</Popover>
<!-- …bottom, start and end -->
```

#vanilla
```html
<button class="button" type="button" popovertarget="placement-top" aria-haspopup="dialog" data-variant="outline" data-color="neutral" data-size="md">
  <span data-slot="label">Top</span>
</button>
<div class="popover" id="placement-top" role="dialog" aria-labelledby="placement-top-title" popover="auto" data-state="closed" data-placement="top">
  …
</div>
<!-- …bottom, start and end, with data-placement="bottom", "start" and "end". -->
```
::
::

We recommend `bottom` for most popovers, which is where [Radix](https://www.radix-ui.com/primitives/docs/components/popover) and [Base UI](https://base-ui.com/react/components/popover) open theirs by default too. A popover is something people asked for and are about to use, so it opens where their eyes and their hand go next, below the button, the way a select's list does. That's why it differs from the Tooltip's `top`, which keeps a hint clear of what's below its trigger. Side placements suit triggers stacked on top of each other, like the buttons of a vertical toolbar.

The popover opens in the [top layer](https://developer.mozilla.org/en-US/docs/Glossary/Top_layer), with `popover="auto"`, above every other element on the page, an open Dialog included. That way, no `overflow: hidden` or `z-index` around its trigger can clip or cover it, and it can stay right after its trigger in the page, rather than moving to the end of the `<body>`.

CSS anchor positioning then places it beside its trigger (`position-area`) and flips it when there's no room (`position-try-fallbacks`), the same way as the Tooltip. Its last fallbacks, `@position-try` rules, send a `start` or `end` popover below or above its trigger, and cap its height at the room on the side it opens on, as long as that's about half the screen. Browsers that don't have anchor positioning yet get the same side from a few lines of script, which you'll find in `place()` in the [reference implementation](/docs/components/popover#reference-implementation), without the cap on its height.

The arrow is off by default, which differs from the Tooltip too. A popover is bigger than the button that opened it and opens right against it, so it's already clear which button it belongs to. Turn it on with `arrow` where it isn't, like for a toggletip in a line of text, and set its size with `--popover--arrow--size`. It points at the trigger's centre, and moves to the other edge when the popover flips.

### Title and content

A popover's content goes in two places: a title at the top, beside the close button, and the body below them. Here's the Filters button from the Button page's [Composable](/docs/components/button#composable) section, with its popover:

::popover-filters-example
::framework-switcher
#react
```tsx
<Button popoverTarget="filters" aria-haspopup="dialog" variant="outline">Filters</Button>
<Popover id="filters" title="Filters">
  <Checkbox defaultChecked>Open issues only</Checkbox>
  <Checkbox>Assigned to me</Checkbox>
  <Checkbox>Has a pull request</Checkbox>
</Popover>
```

#vue
```vue
<Button popovertarget="filters" aria-haspopup="dialog" variant="outline">Filters</Button>
<Popover id="filters" title="Filters">
  <Checkbox checked>Open issues only</Checkbox>
  <Checkbox>Assigned to me</Checkbox>
  <Checkbox>Has a pull request</Checkbox>
</Popover>
```

#svelte
```svelte
<Button popovertarget="filters" aria-haspopup="dialog" variant="outline">Filters</Button>
<Popover id="filters" title="Filters">
  <Checkbox checked>Open issues only</Checkbox>
  <Checkbox>Assigned to me</Checkbox>
  <Checkbox>Has a pull request</Checkbox>
</Popover>
```

#angular
```angular-html
<button appButton popovertarget="filters" aria-haspopup="dialog" variant="outline">Filters</button>
<div appPopover id="filters" popoverTitle="Filters">
  <label appCheckbox><input type="checkbox" checked />Open issues only</label>
  <label appCheckbox><input type="checkbox" />Assigned to me</label>
  <label appCheckbox><input type="checkbox" />Has a pull request</label>
</div>
```

#solid
```tsx
<Button popovertarget="filters" aria-haspopup="dialog" variant="outline">Filters</Button>
<Popover id="filters" title="Filters">
  <Checkbox checked>Open issues only</Checkbox>
  <Checkbox>Assigned to me</Checkbox>
  <Checkbox>Has a pull request</Checkbox>
</Popover>
```

#astro
```astro
<Button popovertarget="filters" aria-haspopup="dialog" variant="outline">Filters</Button>
<Popover id="filters" title="Filters">
  <Checkbox checked>Open issues only</Checkbox>
  <Checkbox>Assigned to me</Checkbox>
  <Checkbox>Has a pull request</Checkbox>
</Popover>
```

#vanilla
```html
<button class="button" type="button" popovertarget="filters" aria-haspopup="dialog" data-variant="outline" data-color="neutral" data-size="md">
  <span data-slot="label">Filters</span>
</button>
<div class="popover" id="filters" role="dialog" aria-labelledby="filters-title" popover="auto" data-state="closed" data-placement="bottom">
  <div data-slot="header">
    <p id="filters-title" data-slot="title">Filters</p>
    <button class="button" type="button" data-variant="ghost" data-color="neutral" data-size="sm" data-icon-only data-slot="close">
      <span data-slot="leading" aria-hidden="true"><svg class="lucide-x">…</svg></span>
      <span data-slot="label">Close</span>
    </button>
  </div>
  <div data-slot="body">
    <label class="checkbox" data-size="md">
      <input data-slot="box" type="checkbox" checked />
      <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
      <span data-slot="label">Open issues only</span>
    </label>
    <!-- Assigned to me and Has a pull request follow the same way. -->
  </div>
</div>
```
::
::

- The title says what the popover holds, in a word or two, like "Filters" or "Share link". It's also the popover's name, so it's what screen readers announce as focus moves in, and what voice control users and agents find it by. It often repeats the trigger's label, and that's fine, since it tells people they've arrived where they meant to go.
- The body is for a few controls or a few sentences, like the options above, a short form or a hint with a link. A popover sits on top of the page without blocking it, so anything that needs people's full attention, or more than a screenful, belongs in a [Dialog](/docs/components/dialog) or on a page of its own.
- The close button is an icon-only, `ghost` Button named "Close", which `closeLabel` translates. `Escape` and a press outside close a popover too, but not every device has a key to press, and a screen reader on a phone can't press outside the popover without leaving it first.

### Toggletips

A toggletip is a small button, often an "i" icon, that shows a hint when it's pressed, which makes it a Popover rather than a Tooltip. Unlike a tooltip, it works on touch screens, and it can hold a link, like the one below. It's also where the arrow earns its place, since the button it points at is small and sits in a line of text:

::popover-toggletip-example
::framework-switcher
#react
```tsx
<span>Billing cycle</span>
<Button popoverTarget="billing-cycle" aria-haspopup="dialog" label="About billing cycles" variant="ghost" size="sm" iconOnly leading={<InfoIcon />} />
<Popover id="billing-cycle" title="Billing cycles" arrow>
  <p>You're billed on the day you signed up, every month. <a href="/billing">How billing works</a></p>
</Popover>
```

#vue
```vue
<span>Billing cycle</span>
<Button popovertarget="billing-cycle" aria-haspopup="dialog" label="About billing cycles" variant="ghost" size="sm" icon-only>
  <template #leading><InfoIcon /></template>
</Button>
<Popover id="billing-cycle" title="Billing cycles" arrow>
  <p>You're billed on the day you signed up, every month. <a href="/billing">How billing works</a></p>
</Popover>
```

#svelte
```svelte
<span>Billing cycle</span>
<Button popovertarget="billing-cycle" aria-haspopup="dialog" label="About billing cycles" variant="ghost" size="sm" iconOnly>
  {#snippet leading()}<InfoIcon />{/snippet}
</Button>
<Popover id="billing-cycle" title="Billing cycles" arrow>
  <p>You're billed on the day you signed up, every month. <a href="/billing">How billing works</a></p>
</Popover>
```

#angular
```angular-html
<span>Billing cycle</span>
<button appButton popovertarget="billing-cycle" aria-haspopup="dialog" label="About billing cycles" variant="ghost" size="sm" iconOnly>
  <lucide-icon leading [img]="InfoIcon" />
</button>
<div appPopover id="billing-cycle" popoverTitle="Billing cycles" arrow>
  <p>You're billed on the day you signed up, every month. <a href="/billing">How billing works</a></p>
</div>
```

#solid
```tsx
<span>Billing cycle</span>
<Button popovertarget="billing-cycle" aria-haspopup="dialog" label="About billing cycles" variant="ghost" size="sm" iconOnly leading={<InfoIcon />} />
<Popover id="billing-cycle" title="Billing cycles" arrow>
  <p>You're billed on the day you signed up, every month. <a href="/billing">How billing works</a></p>
</Popover>
```

#astro
```astro
<span>Billing cycle</span>
<Button popovertarget="billing-cycle" aria-haspopup="dialog" label="About billing cycles" variant="ghost" size="sm" iconOnly>
  <InfoIcon slot="leading" />
</Button>
<Popover id="billing-cycle" title="Billing cycles" arrow>
  <p>You're billed on the day you signed up, every month. <a href="/billing">How billing works</a></p>
</Popover>
```

#vanilla
```html
<span>Billing cycle</span>
<button class="button" type="button" popovertarget="billing-cycle" aria-haspopup="dialog" data-variant="ghost" data-color="neutral" data-size="sm" data-icon-only>
  <span data-slot="leading" aria-hidden="true"><svg class="lucide-info">…</svg></span>
  <span data-slot="label">About billing cycles</span>
</button>
<div class="popover" id="billing-cycle" role="dialog" aria-labelledby="billing-cycle-title" popover="auto" data-state="closed" data-placement="bottom">
  …
  <div data-slot="body">
    <p>You're billed on the day you signed up, every month. <a href="/billing">How billing works</a></p>
  </div>
  <span data-slot="arrow" aria-hidden="true"></span>
</div>
```
::
::

Name the button by what it explains, like "About billing cycles", rather than "Info" or "More", since a page with three of them would otherwise have three buttons that sound the same. Some toggletips announce their text through a live region and keep focus on the button, like [Inclusive Components](https://inclusive-components.design/tooltips-toggletips/) describes. Ours moves focus in, like every Popover, which is what lets it hold a link people can reach.

### States

A popover is either closed or open, and it shows which with `data-state`, so your styles and tests can read it in every browser:

| State   | Selector                                  | Recommended look                                                                      |
| ------- | ----------------------------------------- | ------------------------------------------------------------------------------------- |
| Closed  | `[data-state="closed"]`                   | Hidden, by the browser's own styles, but still in the page                            |
| Open    | `[data-state="open"]`, and `:popover-open` | Beside its trigger, in the top layer                                                  |
| Opening | `@starting-style`                         | A fade and a grow from 96% over 150ms, only when people haven't asked for less motion |

`:popover-open` matches the moment it opens, while `data-state` follows a moment later, once the browser has fired its `toggle` event, so animate on `:popover-open`. Hover, focus and disabled belong to the controls inside a popover and to its trigger, like the Button's focus ring, which show them the same way they do everywhere else. You'll find how each state behaves under [Every state](/docs/components/popover#every-state).

### Tokens

The panel looks like a smaller Dialog, with the same border, background and type. Only its padding, its corners and its shadow differ: there's no backdrop behind a popover to set it apart from the page, so a soft shadow does. Its background is `Canvas`, the background browsers give a document, which follows `color-scheme`, so it covers what's behind it in your light and dark themes alike.

Its text reads one [theme token](/docs/foundations/design-tokens#theme-tokens), `--color--neutral-text`, like the Dialog's. The Buttons and Checkboxes inside read their own tokens, so copy [`tokens.css`](/docs/components/button#reference-implementation) from the Button into your theme. With our reference tokens, the title and the content come to 14.9:1 on white, the same as in the Dialog. If you change the tokens or the background, make sure to check the same pair.

If you need to tune a popover, you can set its [own variables](/docs/foundations/design-tokens#component-variables) from a class:

| Variable                  | Default                                              | What it sets                                                      |
| ------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| `--popover--max-width`    | `20rem`                                              | How wide it gets, at most, and never wider than the screen less 32px |
| `--popover--padding`      | `1rem`                                               | The space inside the panel                                        |
| `--popover--gap`          | `0.75rem`                                            | The space between the header and the body                         |
| `--popover--radius`       | `0.5rem`                                             | The corners                                                       |
| `--popover--border-color` | `color-mix(in srgb, currentColor 20%, transparent)`  | The panel's border                                                |
| `--popover--background`   | `Canvas`                                             | The panel's background                                            |
| `--popover--box-shadow`   | `0 0.25rem 1rem color-mix(in srgb, #000 15%, transparent)` | The shadow that lifts it off the page                       |
| `--popover--offset`       | `0.5rem`                                             | The gap between the trigger and the popover                       |
| `--popover--arrow--size`  | `0.75rem`                                            | The arrow's width and height, before it's turned, when it has one |

The Popover's styles sit in the `components` cascade layer, so your class wins without any specificity tricks. Classes you pass to the Popover land on the popover itself:

::framework-switcher
#react
```tsx [ShareLink.tsx]
import styles from "./ShareLink.module.css";

export function ShareLink() {
  return (
    <Popover id="share-link" title="Share link" className={styles.wide}>
      …
    </Popover>
  );
}
```
```css [ShareLink.module.css]
.wide {
  --popover--max-width: 28rem;
}
```

#vue
```vue
<template>
  <Popover id="share-link" title="Share link" class="wide">
    …
  </Popover>
</template>

<style scoped>
.wide {
  --popover--max-width: 28rem;
}
</style>
```

#svelte
```svelte
<Popover id="share-link" title="Share link" class="wide">
  …
</Popover>

<style>
  /* The class lands on the Popover's own element, which this component's scoped styles don't reach. */
  :global(.wide) {
    --popover--max-width: 28rem;
  }
</style>
```

#angular
```angular-ts
@Component({
  selector: "app-share-link",
  imports: [Popover],
  template: `
    <div appPopover id="share-link" popoverTitle="Share link" class="wide">
      …
    </div>
  `,
  styles: `
    .wide {
      --popover--max-width: 28rem;
    }
  `,
})
export class ShareLink {}
```

#solid
```tsx [ShareLink.tsx]
import styles from "./ShareLink.module.css";

export function ShareLink() {
  return (
    <Popover id="share-link" title="Share link" class={styles.wide}>
      …
    </Popover>
  );
}
```
```css [ShareLink.module.css]
.wide {
  --popover--max-width: 28rem;
}
```

#astro
```astro
<Popover id="share-link" title="Share link" class="wide">
  …
</Popover>

<style>
  .wide {
    --popover--max-width: 28rem;
  }
</style>
```

#vanilla
```html
<div class="popover wide" id="share-link" role="dialog" aria-labelledby="share-link-title" popover="auto" data-state="closed" data-placement="bottom">
  …
</div>

<style>
  .wide {
    --popover--max-width: 28rem;
  }
</style>
```
::

## User Experience (UX)

Now let's look at how a popover behaves for every person, input and setting. A good popover is [accessible](/docs/components/popover#accessible), [predictable](/docs/components/popover#predictable), designed in [every state](/docs/components/popover#every-state) and [adaptive](/docs/components/popover#adaptive).

### Accessible

#### Use the popover attribute

The `popover` attribute gives you most of what a popover needs, in every browser since 2024 (Chrome and Edge 114, Firefox 125 and Safari 17). With `popover="auto"`, the browser:

- Puts it in the top layer while it's open, above everything else, without a `z-index`.
- Opens and closes it from any button that points at it with `popovertarget`, before any script has loaded, and marks that button as expanded or collapsed for screen readers ([HTML-AAM](https://www.w3.org/TR/html-aam-1.0/)).
- Closes it on `Escape`, wherever focus is, and on a press outside it, which is called light dismiss, and gives focus back when it closes from the inside ([HTML Standard](https://html.spec.whatwg.org/multipage/popover.html)).
- Keeps one open at a time, so opening a popover closes any other, unless it opened from inside that one.

A scripted popover, a `<div>` your code shows, positions and moves to the end of the `<body>`, has none of these until you rebuild each one. Moving it away from its trigger also breaks the reading order, so screen reader users have to go looking for what just opened. `popover="manual"` is in between: it's in the top layer, but the browser never closes it, which is why the Tooltip uses it, since it opens and closes on hover and focus, under its own rules.

::framework-switcher
#react
```tsx
{/* Do: the top layer, light dismiss, Escape and a trigger that works before your script */}
<button type="button" popoverTarget="filters" aria-haspopup="dialog">Filters</button>
<div id="filters" popover="auto" role="dialog" aria-labelledby="filters-title">…</div>

{/* Don't: there's no top layer, light dismiss or Escape until you rebuild them */}
<button type="button" onClick={() => setOpen(!open)}>Filters</button>
{open && createPortal(<div className="popover" style={position}>…</div>, document.body)}
```

#vue
```vue
<!-- Do: the top layer, light dismiss, Escape and a trigger that works before your script -->
<button type="button" popovertarget="filters" aria-haspopup="dialog">Filters</button>
<div id="filters" popover="auto" role="dialog" aria-labelledby="filters-title">…</div>

<!-- Don't: there's no top layer, light dismiss or Escape until you rebuild them -->
<button type="button" @click="open = !open">Filters</button>
<Teleport to="body"><div v-if="open" class="popover" :style="position">…</div></Teleport>
```

#svelte
```svelte
<!-- Do: the top layer, light dismiss, Escape and a trigger that works before your script -->
<button type="button" popovertarget="filters" aria-haspopup="dialog">Filters</button>
<div id="filters" popover="auto" role="dialog" aria-labelledby="filters-title">…</div>

<!-- Don't: there's no top layer, light dismiss or Escape until you rebuild them -->
<button type="button" onclick={() => (open = !open)}>Filters</button>
{#if open}<div class="popover" use:portal style={position}>…</div>{/if}
```

#angular
```angular-html
<!-- Do: the top layer, light dismiss, Escape and a trigger that works before your script -->
<button type="button" popovertarget="filters" aria-haspopup="dialog">Filters</button>
<div id="filters" popover="auto" role="dialog" aria-labelledby="filters-title">…</div>

<!-- Don't: there's no top layer, light dismiss or Escape until you rebuild them -->
<button type="button" (click)="open.set(!open())">Filters</button>
@if (open()) {<div class="popover" [style]="position()">…</div>}
```

#solid
```tsx
{/* Do: the top layer, light dismiss, Escape and a trigger that works before your script */}
<button type="button" popovertarget="filters" aria-haspopup="dialog">Filters</button>
<div id="filters" popover="auto" role="dialog" aria-labelledby="filters-title">…</div>

{/* Don't: there's no top layer, light dismiss or Escape until you rebuild them */}
<button type="button" onClick={() => setOpen(!open())}>Filters</button>
<Show when={open()}><Portal><div class="popover" style={position()}>…</div></Portal></Show>
```

#astro
```astro
<!-- Do: the top layer, light dismiss, Escape and a trigger that works before your script -->
<button type="button" popovertarget="filters" aria-haspopup="dialog">Filters</button>
<div id="filters" popover="auto" role="dialog" aria-labelledby="filters-title">…</div>

<!-- Don't: there's no top layer, light dismiss or Escape until you rebuild them -->
<button type="button" id="filters-button">Filters</button>
<div class="popover" id="filters" hidden>…</div>
```

#vanilla
```html
<!-- Do: the top layer, light dismiss, Escape and a trigger that works before your script -->
<button type="button" popovertarget="filters" aria-haspopup="dialog">Filters</button>
<div id="filters" popover="auto" role="dialog" aria-labelledby="filters-title">…</div>

<!-- Don't: there's no top layer, light dismiss or Escape until you rebuild them -->
<button type="button" id="filters-button">Filters</button>
<div class="popover" id="filters" hidden>…</div>
```
::

A `<dialog>` can take the `popover` attribute too, but then it has two ways of being open, its `open` attribute and `:popover-open`, which don't follow each other, so we use a `<div>` with `role="dialog"`. Opening a `<dialog>` with `show()` instead leaves it out of the top layer, and nothing closes it on a press outside.

#### Name it, and say what it is

A popover has no role of its own, and the browser exposes one without a role as a `group` ([HTML-AAM](https://www.w3.org/TR/html-aam-1.0/)), which screen readers don't announce as something that just opened. So the Popover sets `role="dialog"`, which is what WAI-ARIA calls a window on top of the page that people interact with, and leaves out `aria-modal`, since the page around it still works ([WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/#dialog)). It's named by its title, which it links with `aria-labelledby`, so give every popover a title that says what it holds ([WCAG 2.4.6](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html), [4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)).

Its trigger says what it opens, and whether it's open, as the Button's [`button/popup-expanded`](/docs/components/button#ux-rules) rule asks. `popovertarget` gives it an expanded state, but only in the accessibility tree, and no popup type ([HTML-AAM](https://www.w3.org/TR/html-aam-1.0/)). So add `aria-haspopup="dialog"` to the trigger, and the Popover keeps `aria-expanded` on it in step with whether it's open, which is also what the Button's [Expanded](/docs/components/button#states) state and agents read.

Here's what each screen reader said on a button with `aria-haspopup="dialog"`, adapted from [Manuel Matuzović's tests](https://matuzo.at/blog/2023/aria-haspopup) of a Settings button:

| Screen reader               | The trigger                                 |
| --------------------------- | ------------------------------------------- |
| NVDA, in Chrome and Firefox | "Settings, button, opens dialog"            |
| JAWS                        | "Settings, button has pop-up dialogue"      |
| VoiceOver on macOS          | "Settings, dialogue pop-up, button"         |
| VoiceOver on iOS            | "Settings, pop-up button, dialogue pop-up"  |
| TalkBack                    | "Settings, dialogue pop-up button"          |
| Narrator, in Edge           | "Settings, button, has pop-up"              |

He also found that VoiceOver in Safari doesn't announce `aria-expanded` on a button with `aria-haspopup`. When the popover opens, focus moves into a dialog named by its title, which Chrome's accessibility tree shows as `dialog "Filters"`.

Don't use `role="menu"` for a popover. A menu holds only menu items, which people move between with the arrow keys, and screen readers switch into a mode for it, so a form or a link inside one stops working the way people expect. That's the Dropdown Menu's job.

#### Move focus in, and back out

When a popover opens, focus moves inside it, so keyboard and screen reader users start right where they asked to go ([WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)). The browser only moves it to a control marked with `autofocus`, so the Popover adds the Dialog's order. It moves focus to:

1. The control you mark with `data-autofocus`, or with `autofocus`.
2. Or else, the first control in its body, like the first checkbox of a set of filters.
3. Or else, its close button, for a popover that holds only text.

When it closes with `Escape`, its close button or anything else that happens while focus is inside it, focus goes back to its trigger, so people carry on where they left off. The browser does most of this itself, but it gives focus back to whatever had it before the popover opened, and Safari doesn't focus a button when you click it, so the Popover hands it to the trigger. A press outside is different: focus stays where people pressed, since that's where they've moved on to ([HTML Standard](https://html.spec.whatwg.org/multipage/popover.html)).

Focus isn't trapped inside, since the page around a popover still works ([WCAG 2.1.2](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)). `Tab` from its last control moves on to what comes after its trigger, and the popover stays open, as it does in every browser. It may then cover the control that has focus, which WCAG allows as long as people can put it away without moving focus, and `Escape` does that from anywhere on the page ([WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)).

#### Contrast and size

- The title and the content need a contrast of at least 4.5:1 against the panel ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
- The panel's border doesn't need 3:1, since the panel isn't a control, and its title, its shadow and its place beside the trigger already set it apart.
- The close button is a `sm` Button, 32 × 32px, above the 24 × 24px minimum ([WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).

### Predictable

#### Open it on purpose

A popover opens from a press on its trigger, and never on hover or on focus alone. Opening on hover would cover the page as the pointer crosses it, and opening on focus would move focus into the popover as people tab past its trigger, pulling them away from where they were going. A hint that should show on hover and focus is a [Tooltip](/docs/components/tooltip), and a press that opens one is what makes the Popover work on touch screens.

#### Keyboard

| Key                | Popover                                                                              |
| ------------------ | ------------------------------------------------------------------------------------ |
| `Enter`, `Space`   | On its trigger, open it, or close it when it's open                                  |
| `Tab`, `Shift+Tab` | Move between its controls, then on to what comes after its trigger, leaving it open  |
| `Escape`           | Closes it, wherever focus is, and gives focus back to its trigger when it was inside |

#### Close it every way people expect

Every way a popover closes fires `close`, with a reason that says which:

| Reason         | When                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| `escape`       | People press `Escape`, in the popover, on its trigger or anywhere else on the page          |
| `outside`      | People press outside the popover and its trigger, which is light dismiss                    |
| `close-button` | People press the close button                                                               |
| `trigger`      | People press its trigger again                                                              |
| `closed`       | Anything else, like another popover opening, or a close request like the back gesture on Android |

Unlike the Dialog, which asks before it closes, the Popover closes itself, and `close` says what already happened. With `popover="auto"`, the browser closes it on a press outside and on `Escape` before any script hears about it, so there's nothing left to ask. That suits a popover, which holds nothing people would lose by closing it, like a set of filters that apply as they change. A form whose answers people could lose belongs in a Dialog, which can ask them first.

A press only closes it when it starts and ends outside, so people can select text in the popover and let go outside it ([HTML Standard](https://html.spec.whatwg.org/multipage/popover.html)). A press on its trigger counts as the trigger's, so it closes the popover, rather than closing it and opening it again.

#### Close only the layer on top

`Escape` closes the layer on top, and goes no further. A Popover in a Dialog closes on its own, and the Dialog stays open, with focus in the popover or on its trigger, and a Tooltip in a Popover closes before the Popover does. Try it here: open the Dialog, then Permissions, then focus Guests, and press `Escape` three times.

::popover-dialog-example
::framework-switcher
#react
```tsx
<Dialog id="share-project" title="Share project" open={open} onClose={() => setOpen(false)} actions={<Button onClick={() => setOpen(false)}>Done</Button>}>
  <p>Anyone with the link can view it.</p>
  <Button popoverTarget="share-permissions" aria-haspopup="dialog" variant="outline">Permissions</Button>
  <Popover id="share-permissions" title="Who can edit">
    <Checkbox defaultChecked>Owners</Checkbox>
    <Checkbox>Members</Checkbox>
    <Tooltip label="Guests can only comment">
      {(trigger) => <Checkbox {...trigger}>Guests</Checkbox>}
    </Tooltip>
  </Popover>
</Dialog>
```

#vue
```vue
<Dialog id="share-project" title="Share project" :open="open" @close="open = false">
  <p>Anyone with the link can view it.</p>
  <Button popovertarget="share-permissions" aria-haspopup="dialog" variant="outline">Permissions</Button>
  <Popover id="share-permissions" title="Who can edit">
    <Checkbox checked>Owners</Checkbox>
    <Checkbox>Members</Checkbox>
    <Tooltip label="Guests can only comment" v-slot="{ trigger }">
      <Checkbox v-bind="trigger">Guests</Checkbox>
    </Tooltip>
  </Popover>
  <template #actions>
    <Button @click="open = false">Done</Button>
  </template>
</Dialog>
```

#svelte
```svelte
<Dialog id="share-project" title="Share project" {open} onclose={() => (open = false)}>
  <p>Anyone with the link can view it.</p>
  <Button popovertarget="share-permissions" aria-haspopup="dialog" variant="outline">Permissions</Button>
  <Popover id="share-permissions" title="Who can edit">
    <Checkbox checked>Owners</Checkbox>
    <Checkbox>Members</Checkbox>
    <Tooltip label="Guests can only comment">
      {#snippet children(trigger)}<Checkbox {...trigger}>Guests</Checkbox>{/snippet}
    </Tooltip>
  </Popover>
  {#snippet actions()}
    <Button onclick={() => (open = false)}>Done</Button>
  {/snippet}
</Dialog>
```

#angular
```angular-html
<dialog appDialog id="share-project" dialogTitle="Share project" [open]="open()" (closeRequest)="open.set(false)">
  <p>Anyone with the link can view it.</p>
  <button appButton popovertarget="share-permissions" aria-haspopup="dialog" variant="outline">Permissions</button>
  <div appPopover id="share-permissions" popoverTitle="Who can edit">
    <label appCheckbox><input type="checkbox" checked />Owners</label>
    <label appCheckbox><input type="checkbox" />Members</label>
    <label appCheckbox><input type="checkbox" appTooltip="Guests can only comment" />Guests</label>
  </div>
  <div actions>
    <button appButton (click)="open.set(false)">Done</button>
  </div>
</dialog>
```

#solid
```tsx
<Dialog id="share-project" title="Share project" open={open()} onClose={() => setOpen(false)} actions={<Button onClick={() => setOpen(false)}>Done</Button>}>
  <p>Anyone with the link can view it.</p>
  <Button popovertarget="share-permissions" aria-haspopup="dialog" variant="outline">Permissions</Button>
  <Popover id="share-permissions" title="Who can edit">
    <Checkbox checked>Owners</Checkbox>
    <Checkbox>Members</Checkbox>
    <Tooltip label="Guests can only comment">
      {(trigger) => <Checkbox {...trigger}>Guests</Checkbox>}
    </Tooltip>
  </Popover>
</Dialog>
```

#astro
```astro
<Dialog id="share-project" title="Share project">
  <p>Anyone with the link can view it.</p>
  <Button popovertarget="share-permissions" aria-haspopup="dialog" variant="outline">Permissions</Button>
  <Popover id="share-permissions" title="Who can edit">
    <Checkbox checked>Owners</Checkbox>
    <Checkbox>Members</Checkbox>
    <Tooltip label="Guests can only comment">
      <Checkbox>Guests</Checkbox>
    </Tooltip>
  </Popover>
  <form method="dialog" slot="actions">
    <Button type="submit" value="done">Done</Button>
  </form>
</Dialog>
```

#vanilla
```html
<dialog class="dialog" id="share-project" aria-labelledby="share-project-title" data-size="md">
  …
  <div data-slot="body">
    <p>Anyone with the link can view it.</p>
    <button class="button" type="button" popovertarget="share-permissions" aria-haspopup="dialog" data-variant="outline" data-color="neutral" data-size="md">
      <span data-slot="label">Permissions</span>
    </button>
    <!-- Inside the dialog, right after its trigger, so the dialog doesn't make it inert. -->
    <div class="popover" id="share-permissions" role="dialog" aria-labelledby="share-permissions-title" popover="auto" data-state="closed" data-placement="bottom">
      …
    </div>
  </div>
  …
</dialog>
```
::
::

Each layer takes `Escape` before the one below it, and stops it there:

- The Tooltip listens on the `document`, in the capture phase, which comes before anything else, and stops the key once it has closed.
- The Popover listens on itself and on its trigger, rather than on the `document`, so a Tooltip inside it goes first. In a Dialog, it also listens on the Dialog's parts, which hear a key after the control that has focus and before the Dialog does, and on the Dialog itself while no control has focus, like after a click on text in the popover. It leaves alone a key that something has already cancelled, like a control that closes on `Escape` itself, and one meant for a popover open inside it. Any other `Escape` it cancels and stops, which also keeps the browser from closing anything else, since a cancelled `Escape` is no longer a close request ([HTML Standard](https://html.spec.whatwg.org/multipage/interaction.html#close-requests-and-close-watchers)).
- The Dialog listens on itself, and skips a key that's already been cancelled, which is how its own [`Escape`](/docs/components/dialog#keyboard) rule leaves room for the controls inside it.

Render a popover in a Dialog inside it, right after its trigger. An open Dialog makes everything outside it inert, and a popover rendered elsewhere, like at the end of the `<body>`, would open in the top layer but be inert, with nothing in it people could focus or press. When the Dialog closes from the keyboard, like with `Enter` on its Done button, the popover closes with it, and `close` fires with `closed`. A press on Done with a pointer is a press outside the popover, so it closes first, with `outside`.

### Every state

#### Closed

A closed popover is hidden, so it isn't in the accessibility tree, and screen readers, agents and `Tab` can't find anything in it. It stays in the page while it's closed, so the Checkboxes inside keep what people picked, and so does a form, if they close it and open it again.

#### Open

An open popover sits beside its trigger, in the top layer, and follows it when the page scrolls. The page around it still works, so people can scroll, select text and use other controls. Pressing one of them closes the popover, since it's outside it, which is usually what people meant.

Keep to one popover at a time. Opening a popover closes any other one that's open, so two never cover the page at once. A popover opened from a control inside another one keeps the first one open, since it belongs to it, but more than two deep gets hard to follow.

### Adaptive

#### Pointer, touch and pen

A tap opens a popover the same way a click does, and a tap outside it closes it. That's why the Popover, rather than the Tooltip, is the one to use for a hint people need on a touch screen.

#### Small screens

On a narrow screen, the popover is never wider than the screen, less 16px on each side, so on a phone 320px wide it's at most 288px, and still next to its trigger, below or above it when there's no room at its side, in browsers with CSS anchor positioning ([WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)). It's never taller than the screen less 32px either, nor than the room on the side it opens on, and when its content is taller than that, the body scrolls while the title stays in view. On phones, the on-screen keyboard covers the bottom of the screen too, so check that a focused input in a popover stays in view above it, or place that popover at the `top`.

It doesn't turn into a bottom sheet on small screens. A sheet across the bottom of the screen moves the content away from what opened it, and usually covers the page with a backdrop, which makes it a Dialog in all but name. If your content needs that much room on a phone, use a Dialog.

#### Motion

The popover fades in and grows from 96% as it opens, over 150ms. It only does when people haven't asked for less motion (`prefers-reduced-motion: no-preference`), and opens straight away otherwise ([WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)). It closes straight away either way, since people have already moved on.

#### More contrast

When someone asks for more contrast (`prefers-contrast: more`), as with Increase contrast on macOS and iOS, the panel's border is drawn in the text colour at full strength, rather than at 20%.

#### Forced colours

Windows contrast themes replace every colour with the user's own, and drop shadows. The panel's background and text become the theme's own, and its border is drawn in the theme's text colour, which is what sets it apart from the page once the shadow is gone. The arrow has the same border on its outer edges, so it stays visible too.

#### Colour scheme

The panel's background is `Canvas`, and its text reads tokens that use `light-dark()`, and both follow `color-scheme`, so the Popover adapts to your light and dark themes on its own, as long as they set it.

#### Text size and spacing

Sizes are in `rem`, so the panel grows with its text, at 200% text size ([WCAG 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)) and with wider line, letter and word spacing ([WCAG 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)). A long title wraps rather than getting cut off, and the body scrolls when there's no more room.

#### Languages and direction

`start` and `end` follow the reading direction, so a popover at the `end` of a button opens on its right in English and on its left in Arabic, without any change to your code. The Popover uses logical properties too, so the close button moves to the left in right-to-left languages. Translate its label with `closeLabel`, like `closeLabel="إغلاق"` in Arabic, since screen readers read it and voice control users say it.

## Developer Experience (DX)

Next, let's look at how developers use the Popover. You point a Button at it with `popovertarget`, which opens it with no state of yours at all, and bind `open` only when your code needs to open or close it too.

::framework-switcher
#react
```tsx
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Popover } from "@/components/Popover";

export function IssueFilters() {
  return (
    <>
      <Button popoverTarget="filters" aria-haspopup="dialog" variant="outline">Filters</Button>
      <Popover id="filters" title="Filters">
        <Checkbox name="open" defaultChecked>Open issues only</Checkbox>
        <Checkbox name="mine">Assigned to me</Checkbox>
      </Popover>
    </>
  );
}
```

#vue
```vue
<script setup lang="ts">
import Button from "@/components/Button.vue";
import Checkbox from "@/components/Checkbox.vue";
import Popover from "@/components/Popover.vue";
</script>

<template>
  <Button popovertarget="filters" aria-haspopup="dialog" variant="outline">Filters</Button>
  <Popover id="filters" title="Filters">
    <Checkbox name="open" checked>Open issues only</Checkbox>
    <Checkbox name="mine">Assigned to me</Checkbox>
  </Popover>
</template>
```

#svelte
```svelte
<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Checkbox from "$lib/components/Checkbox.svelte";
  import Popover from "$lib/components/Popover.svelte";
</script>

<Button popovertarget="filters" aria-haspopup="dialog" variant="outline">Filters</Button>
<Popover id="filters" title="Filters">
  <Checkbox name="open" checked>Open issues only</Checkbox>
  <Checkbox name="mine">Assigned to me</Checkbox>
</Popover>
```

#angular
```angular-ts
import { Component } from "@angular/core";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Popover } from "./popover";

@Component({
  selector: "app-issue-filters",
  imports: [Button, Checkbox, Popover],
  template: `
    <button appButton popovertarget="filters" aria-haspopup="dialog" variant="outline">Filters</button>
    <div appPopover id="filters" popoverTitle="Filters">
      <label appCheckbox><input type="checkbox" name="open" checked />Open issues only</label>
      <label appCheckbox><input type="checkbox" name="mine" />Assigned to me</label>
    </div>
  `,
})
export class IssueFilters {}
```

#solid
```tsx
import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { Popover } from "~/components/Popover";

export function IssueFilters() {
  return (
    <>
      <Button popovertarget="filters" aria-haspopup="dialog" variant="outline">Filters</Button>
      <Popover id="filters" title="Filters">
        <Checkbox name="open" checked>Open issues only</Checkbox>
        <Checkbox name="mine">Assigned to me</Checkbox>
      </Popover>
    </>
  );
}
```

#astro
```astro
---
import Button from "../components/Button.astro";
import Checkbox from "../components/Checkbox.astro";
import Popover from "../components/Popover.astro";
---

<!-- popovertarget opens it before any script loads, and the Popover's script adds the rest. -->
<Button popovertarget="filters" aria-haspopup="dialog" variant="outline">Filters</Button>
<Popover id="filters" title="Filters">
  <Checkbox name="open" checked>Open issues only</Checkbox>
  <Checkbox name="mine">Assigned to me</Checkbox>
</Popover>
```

#vanilla
```html [IssueFilters.html]
<link rel="stylesheet" href="/styles/button.css" />
<link rel="stylesheet" href="/styles/checkbox.css" />
<link rel="stylesheet" href="/styles/popover.css" />

<button class="button" type="button" popovertarget="filters" aria-haspopup="dialog" data-variant="outline" data-color="neutral" data-size="md">
  <span data-slot="label">Filters</span>
</button>
<div class="popover" id="filters" role="dialog" aria-labelledby="filters-title" popover="auto" data-state="closed" data-placement="bottom">
  <div data-slot="header">
    <p id="filters-title" data-slot="title">Filters</p>
    <button class="button" type="button" data-variant="ghost" data-color="neutral" data-size="sm" data-icon-only data-slot="close">
      <span data-slot="leading" aria-hidden="true"><svg class="lucide-x">…</svg></span>
      <span data-slot="label">Close</span>
    </button>
  </div>
  <div data-slot="body">
    <label class="checkbox" data-size="md">
      <input data-slot="box" type="checkbox" name="open" checked />
      <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
      <span data-slot="label">Open issues only</span>
    </label>
    <label class="checkbox" data-size="md">
      <input data-slot="box" type="checkbox" name="mine" />
      <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
      <span data-slot="label">Assigned to me</span>
    </label>
  </div>
</div>

<script type="module" src="/scripts/popover.js"></script>
```
```js [popover.js]
// Adds what the browser leaves out to every .popover, the way the reference implementation
// does: the trigger's aria-expanded, anchoring it to the trigger that opened it, moving
// focus in, giving it back, the close button, an Escape that stops at the popover and the
// arrow. popovertarget opens and closes it without this. Browsers without CSS anchor
// positioning need place() from the reference implementation too.
const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
let count = 0;

for (const popover of document.querySelectorAll(".popover")) {
  const triggers = document.querySelectorAll(`[popovertarget="${popover.id}"]`);
  for (const trigger of triggers) trigger.setAttribute("aria-expanded", "false");
  // Generated, since an id can hold characters a CSS name can't, like "1:2".
  const anchorName = `--popover-${++count}`;
  popover.style.setProperty("position-anchor", anchorName);
  const arrow = popover.querySelector('[data-slot="arrow"]');
  // In a dialog, which takes Escape before the browser can close the popover. Its parts
  // hear a key after the control that has focus, and before the dialog does.
  const host = popover.parentElement?.closest("dialog");
  const hostParts = [...(host?.children ?? [])];
  let trigger;
  let showing = false;
  let returnFocus = false;
  let frame;

  // Escape closes the popover and goes no further, so a dialog around it stays open. With a
  // popover open inside this one, Escape is that one's.
  function onKeydown(event) {
    if (event.key !== "Escape" || event.defaultPrevented || !showing) return;
    if (popover.querySelector("[popover]:popover-open")) return;
    event.preventDefault();
    event.stopPropagation();
    popover.hidePopover();
  }
  // Elsewhere in the dialog, before the dialog's own handler.
  function onHostKeydown(event) {
    if (!popover.contains(event.target) && !trigger?.contains(event.target)) onKeydown(event);
  }
  // A dialog that closes takes the popover with it.
  host?.addEventListener("close", () => showing && popover.hidePopover());
  for (const part of hostParts) part.addEventListener("keydown", onHostKeydown);
  // With focus on the dialog itself, like after a click on text in the popover, no part
  // hears the key, so the dialog does, but only then.
  host?.addEventListener("keydown", (event) => event.target === host && onKeydown(event), true);

  // The arrow sits on the side that faces the trigger, across from its centre, or as close
  // as the rounded corners allow.
  function aim() {
    const a = trigger.getBoundingClientRect();
    const p = popover.getBoundingClientRect();
    const x = p.left + p.width / 2;
    const y = p.top + p.height / 2;
    const side = y < a.top ? "top" : y > a.bottom ? "bottom" : x < a.left ? "left" : "right";
    popover.dataset.side = side;
    const across = side === "top" || side === "bottom";
    const box = getComputedStyle(popover);
    const length = parseFloat(across ? box.width : box.height);
    const centre = across ? a.left + a.width / 2 - (x - length / 2) : a.top + a.height / 2 - (y - length / 2);
    const clear = parseFloat(box.borderTopLeftRadius) + parseFloat(getComputedStyle(arrow).width) / Math.SQRT2;
    const offset = clear * 2 < length ? Math.max(clear, Math.min(centre, length - clear)) : length / 2;
    arrow.style.left = across ? `${offset - popover.clientLeft}px` : "";
    arrow.style.top = across ? "" : `${offset - popover.clientTop}px`;
  }
  // On every frame while it's open, since the browser moves it after a scroll or a flip.
  function follow() {
    if (!showing) return;
    aim();
    frame = requestAnimationFrame(follow);
  }

  popover.addEventListener("beforetoggle", (event) => {
    showing = event.newState === "open";
    if (showing) {
      // Opened again from another trigger before the last close's toggle: reset the last one.
      trigger?.setAttribute("aria-expanded", "false");
      trigger?.removeEventListener("keydown", onKeydown);
      trigger?.style.removeProperty("anchor-name");
      trigger = event.source ?? triggers[0];
      trigger?.style.setProperty("anchor-name", anchorName);
    } else {
      returnFocus = popover.contains(document.activeElement);
    }
  });

  popover.addEventListener("toggle", (event) => {
    const open = event.newState === "open";
    popover.dataset.state = event.newState;
    trigger?.setAttribute("aria-expanded", String(open));
    trigger?.[open ? "addEventListener" : "removeEventListener"]("keydown", onKeydown);
    if (open) {
      const first =
        popover.querySelector("[data-autofocus], [autofocus]") ??
        popover.querySelector('[data-slot="body"]')?.querySelector(FOCUSABLE) ??
        popover.querySelector('[data-slot="close"]');
      if (!popover.contains(document.activeElement)) first?.focus();
      if (arrow && trigger) follow();
    } else {
      cancelAnimationFrame(frame);
      trigger?.style.removeProperty("anchor-name");
      // Back to the trigger, unless focus has moved on, like after a press outside.
      const active = document.activeElement;
      if (returnFocus && (!active || active === document.body || popover.contains(active))) trigger?.focus();
    }
  });

  popover.addEventListener("keydown", onKeydown);
  popover.querySelector('[data-slot="close"]')?.addEventListener("click", () => popover.hidePopover());
}
```
::

There's no state to keep, since the browser keeps it. Vanilla and Astro work the same way as the rest, and a page whose script hasn't loaded yet still opens and closes the popover, with `Escape` and light dismiss, and the browser gives its trigger an expanded state in the accessibility tree.

### Consistent

Once you've learned the [Dialog](/docs/components/dialog#consistent) and the [Tooltip](/docs/components/tooltip#consistent), you already know most of the Popover. These names mean the same thing everywhere in Open Components:

| Name         | Kind  | What it means                                                                |
| ------------ | ----- | ---------------------------------------------------------------------------- |
| `open`       | Prop  | Whether it's showing, for anything that opens on top of the page             |
| `title`      | Prop  | The text that names it, as on the Dialog                                     |
| `placement`  | Prop  | The side of the trigger it opens on: `top`, `bottom`, `start` or `end`, as on the Tooltip |
| `arrow`      | Prop  | Draws an arrow that points at the trigger, as on the Tooltip                 |
| `closeLabel` | Prop  | The close button's label, for other languages, as on the Dialog              |
| `close`      | Event | It closed, and why                                                           |

We recommend `placement="bottom"` and no arrow as the defaults, which differ from the Tooltip's, as [Placement](/docs/components/popover#placement) explains. The Popover also leaves a few things out, on purpose:

- There's no `trigger` slot. The button that opens a popover is a Button of yours, which points at it with `popovertarget`, so it works before any script loads, and keeps its own label and its own place on the page.
- There's no `modal` prop. A popover that blocks the page is a [Dialog](/docs/components/dialog).
- There's no `variant`, `color` or `size`. A popover has no intent of its own, its content says what it's about, and `--popover--max-width` sets how wide it gets.
- There's no prop to turn off light dismiss or `Escape`. Both are the browser's, and both are how people expect a popover to close. Something that should stay open until people answer it is a Dialog.

### Type-safe

Props, events and slots are typed, so your editor can autocomplete them and your type checker (`tsc`, `vue-tsc`, `svelte-check`, `ngc` or `astro check`) catches mistakes like `placement="left"`, which isn't one of the Popover's placements, or a popover without a title.

| Prop         | Type                                    | Default    | Description                                                         |
| ------------ | --------------------------------------- | ---------- | ------------------------------------------------------------------- |
| `open`       | `boolean`                               | `false`    | Whether it's open. It follows every open and close, so bind it both ways |
| `id`         | `string`                                |            | Required. Its trigger's `popovertarget` points to it, and its title's ID starts with it |
| `title`      | `string`                                |            | Required. The text that names the popover                           |
| `placement`  | `"top" \| "bottom" \| "start" \| "end"` | `"bottom"` | The side of the trigger it opens on, before it flips                |
| `arrow`      | `boolean`                               | `false`    | Draws an arrow that points at the trigger                           |
| `closeLabel` | `string`                                | `"Close"`  | The close button's label, for other languages                       |

| Event    | Payload                                                          | Description                                                       |
| -------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| `close`  | `"escape" \| "outside" \| "close-button" \| "trigger" \| "closed"` | Fires once it has closed, with why, unless your code closed it with `open` |
| `toggle` | `ToggleEvent`                                                    | The browser's own, with `newState`, for every open and close      |

Angular is the one framework where two of these names change, since its Popover sits on the element itself, as the Dialog does. A `title` attribute stays on the element even when an input reads it, which would show the title as a tooltip over the whole panel, so the title is `popoverTitle`. The event is `closeRequest`, the same as the Dialog's, so the two read alike.

| Slot      | Description                                                                 |
| --------- | --------------------------------------------------------------------------- |
| `default` | The content, like a few options, a short form or a hint with a link, which scrolls when it doesn't fit |

We also export `PopoverProps` and `PopoverCloseReason`, which come in handy for wrappers:

::framework-switcher
#react
```tsx
import { Popover, type PopoverProps } from "@/components/Popover";

export function FilterPopover(props: PopoverProps) {
  return <Popover placement="bottom" {...props} />;
}
```

#vue
```vue
<script setup lang="ts">
import Popover, { type PopoverProps } from "@/components/Popover.vue";

const props = defineProps<PopoverProps>();
const open = defineModel<boolean>("open");
</script>

<template>
  <Popover v-bind="props" v-model:open="open"><slot /></Popover>
</template>
```

#svelte
```svelte
<script lang="ts">
  import Popover, { type PopoverProps } from "$lib/components/Popover.svelte";

  let { children, ...props }: PopoverProps = $props();
</script>

<Popover {...props}>{@render children?.()}</Popover>
```

#angular
```ts
import type { PopoverProps } from "./popover";

const filters: PopoverProps = { id: "filters", popoverTitle: "Filters", placement: "bottom" };
```

#solid
```tsx
import { Popover, type PopoverProps } from "~/components/Popover";

export function FilterPopover(props: PopoverProps) {
  return <Popover placement="bottom" {...props} />;
}
```

#astro
```astro
---
import Popover, { type Props as PopoverProps } from "./Popover.astro";

type Props = PopoverProps;
---

<Popover placement="bottom" {...Astro.props}><slot /></Popover>
```

#vanilla
```html
<!-- No types in plain JavaScript: data-placement takes the same values as placement, and the arrow is the <span data-slot="arrow" aria-hidden="true"> at the end, which you leave out to turn it off. -->
<div class="popover" id="filters" role="dialog" aria-labelledby="filters-title" popover="auto" data-state="closed" data-placement="bottom">
  …<span data-slot="arrow" aria-hidden="true"></span>
</div>
```
::

### Composable

The Popover renders the popover element as its root, so everything you pass lands on it, including classes, styles, data attributes and event listeners, the browser's `toggle` among them. Its title gets its ID from the popover's own `id`, as in `filters-title`, so you can point at it from elsewhere, like a test.

#### Finding its trigger

The Popover needs its trigger, to place itself beside it and to give it focus back. When it opens, it takes the button the browser says opened it, `ToggleEvent.source`, which every browser has had since 2026, or else the first button that points at it with `popovertarget`. That's why every trigger points at its popover, even one your code opens, rather than relying on where it sits in the page. Only the trigger that opened it carries the anchor's name, and only while it's open, so a popover with two triggers, like a toolbar's and a menu's, opens beside the one people pressed.

#### With other components

- A [Button](/docs/components/button) opens the popover, with `popovertarget` and `aria-haspopup="dialog"`, and the Popover keeps its `aria-expanded` in step, and gives it focus back when it closes. The close button is a Button too.
- [Checkboxes](/docs/components/checkbox), [Inputs](/docs/components/input) and links in the body work as they do anywhere else, and the first of them gets focus when it opens.
- A [Tooltip](/docs/components/tooltip) inside a popover opens on top of it, and closes on `Escape` before it does.
- A [Dialog](/docs/components/dialog) around a popover stays open when `Escape` closes the popover, as long as the popover is rendered inside it.
- The Dropdown Menu and the Combobox on our [Roadmap](/docs/getting-started/roadmap) will open the same way: in the top layer, beside their trigger with the same `placement` names and flipping, closing on `Escape` and on a press outside, and giving focus back to their trigger. What's inside them is their own, like a menu's arrow keys or a combobox's list, which keeps focus in its input.

### Controllable

The Popover doesn't keep any state you can't reach. Whether it's open is yours to bind, or to leave to its trigger and the browser, and everything else is a prop or an attribute you control:

| State         | How you control it                                                                       |
| ------------- | ---------------------------------------------------------------------------------------- |
| Open          | Its trigger, or `open`, which follows every open and close, so bind it both ways         |
| Closing       | `close`, with why, once it has closed                                                    |
| Initial focus | `data-autofocus` on the control to start on                                              |
| Focus after   | Back to the trigger on its own, or anywhere you move it once it's closed                 |
| Placement     | `placement`, before it flips, and `arrow`                                                |
| Look          | Its variables, from a class                                                              |

Bind `open` when your code needs to close it, like once a short form inside it is sent. Its trigger still opens it, and `open` follows, so there's only ever one answer to whether it's open:

::popover-form-example
::framework-switcher
#react
```tsx
const [open, setOpen] = useState(false);

<Button popoverTarget="new-label" aria-haspopup="dialog" variant="outline">New label</Button>
<Popover id="new-label" title="New label" open={open} onToggle={(event) => setOpen(event.newState === "open")}>
  <form onSubmit={(event) => { event.preventDefault(); createLabel(); setOpen(false); }}>
    <label htmlFor="label-name">Name</label>
    <Input id="label-name" />
    <Button type="submit" color="primary">Create label</Button>
  </form>
</Popover>
```

#vue
```vue
<script setup lang="ts">
const open = ref(false);

function create() {
  createLabel();
  open.value = false;
}
</script>

<template>
  <Button popovertarget="new-label" aria-haspopup="dialog" variant="outline">New label</Button>
  <Popover id="new-label" v-model:open="open" title="New label">
    <form @submit.prevent="create">
      <label for="label-name">Name</label>
      <Input id="label-name" />
      <Button type="submit" color="primary">Create label</Button>
    </form>
  </Popover>
</template>
```

#svelte
```svelte
<script lang="ts">
  let open = $state(false);
</script>

<Button popovertarget="new-label" aria-haspopup="dialog" variant="outline">New label</Button>
<Popover id="new-label" title="New label" bind:open>
  <form onsubmit={(event) => { event.preventDefault(); createLabel(); open = false; }}>
    <label for="label-name">Name</label>
    <Input id="label-name" />
    <Button type="submit" color="primary">Create label</Button>
  </form>
</Popover>
```

#angular
```angular-html
<button appButton popovertarget="new-label" aria-haspopup="dialog" variant="outline">New label</button>
<div appPopover id="new-label" popoverTitle="New label" [(open)]="open">
  <form (submit)="$event.preventDefault(); createLabel(); open.set(false)">
    <label for="label-name">Name</label>
    <div appInput><input id="label-name" /></div>
    <button appButton type="submit" color="primary">Create label</button>
  </form>
</div>
```

#solid
```tsx
const [open, setOpen] = createSignal(false);

<Button popovertarget="new-label" aria-haspopup="dialog" variant="outline">New label</Button>
<Popover id="new-label" title="New label" open={open()} onToggle={(event) => setOpen(event.newState === "open")}>
  <form onSubmit={(event) => { event.preventDefault(); createLabel(); setOpen(false); }}>
    <label for="label-name">Name</label>
    <Input id="label-name" />
    <Button type="submit" color="primary">Create label</Button>
  </form>
</Popover>
```

#astro
```astro
<Button popovertarget="new-label" aria-haspopup="dialog" variant="outline">New label</Button>
<Popover id="new-label" title="New label">
  <form id="new-label-form">
    <label for="label-name">Name</label>
    <Input id="label-name" />
    <Button type="submit" color="primary">Create label</Button>
  </form>
</Popover>

<script>
  document.getElementById("new-label-form")!.addEventListener("submit", (event) => {
    event.preventDefault();
    createLabel();
    document.getElementById("new-label")!.hidePopover();
  });
</script>
```

#vanilla
```html
<!-- The button and the popover, as above, with <form id="new-label-form"> in its body. -->
<script type="module">
  document.getElementById("new-label-form").addEventListener("submit", (event) => {
    event.preventDefault();
    createLabel();
    document.getElementById("new-label").hidePopover();
  });
</script>
```
::
::

React and Solid follow the browser's `toggle` event, whose `newState` is `open` or `closed`, the same way they follow a Checkbox's `change`. Vue, Svelte and Angular bind `open` both ways. Your code and its trigger can both open and close it, and whichever acts last wins, since neither is ever turned down. Setting `open` fires no `close`, since your code already knows why.

## Agentic Experience (AX)

Finally, let's look at how agents read, open and check a popover. They rely on the same accessibility tree as assistive technologies, and on a contract they can check the code against.

### Semantic

Agents that drive a browser, through Playwright or a browser MCP server, read the page through its accessibility tree, which is made of roles, names and states. This is how Playwright sees the Filters popover once it's open, leaving out the checkboxes' text:

```yaml
- button "Filters" [expanded]
- dialog "Filters":
  - paragraph: Filters
  - button "Close"
  - checkbox "Open issues only" [checked]
  - checkbox "Assigned to me"
  - checkbox "Has a pull request"
```

Playwright works roles and states out for itself, from attributes, so it reads the trigger's `aria-expanded`, which the Popover sets, but not its `aria-haspopup`. The browser's own tree, which screen readers read and Chrome DevTools shows under Accessibility, has both. While it's closed, the trigger reads as collapsed, and the popover isn't in the tree at all. With a role and a name on both, an agent can open the popover and act inside it:

```ts
await page.getByRole("button", { name: "Filters" }).click();
const filters = page.getByRole("dialog", { name: "Filters" });
await filters.getByRole("checkbox", { name: "Assigned to me" }).check();
await page.keyboard.press("Escape");
```

### Described

Here's the whole contract in one block, for agents to read before they build or review a popover:

```yaml
component: Popover
summary: Shows more next to the button that opened it, like filters or a short form, without blocking the rest of the page. Its title names it, and a Button with popovertarget opens it.
standard: https://opencomponents.dev/docs/components/popover
element: div # popover="auto", right after its trigger, and in the top layer while it's open
role: dialog # without aria-modal, since the page around it keeps working
props:
  open: { type: boolean, default: false } # it follows every open and close, so bind it both ways
  id: { type: string } # required. Its trigger's popovertarget points to it, and its title's ID starts with it
  title: { type: string } # required
  placement: { type: [top, bottom, start, end], default: bottom }
  arrow: { type: boolean, default: false }
  closeLabel: { type: string, default: Close }
slots:
  default: The content, like a few options, a short form or a hint with a link, which scrolls when it doesn't fit.
events:
  close: "escape, outside, close-button, trigger or closed. Fires once it has closed, unless open closed it."
  toggle: "The browser's own ToggleEvent, with newState open or closed, for every open and close."
states:
  open: "[data-state=open], and :popover-open"
  closed: "[data-state=closed], hidden by the browser's own styles"
keyboard:
  Enter: On its trigger, opens it, or closes it when it's open. Focus moves to data-autofocus, or else the first control in its body, then its close button. The trigger's aria-expanded follows.
  Space: On its trigger, the same as Enter.
  Tab: Moves between its controls, then on to what comes after its trigger, leaving it open.
  Escape: Closes it, wherever focus is, and stops there, giving focus back to its trigger when it was inside. A popover open inside it, or a control that handles Escape itself, goes first.
parts: [header, title, close, body, arrow] # data-slot, in this order. The arrow is only there with arrow
tokens:
  theme: ["--color--neutral-text"]
  variables: [--popover--max-width, --popover--padding, --popover--gap, --popover--radius, --popover--border-color, --popover--background, --popover--box-shadow, --popover--offset, --popover--arrow--size]
  layer: components # in Tailwind's order: theme, base, components, utilities
rules: https://opencomponents.dev/docs/components/popover#checklist
```

It's also published on its own at [`/raw/docs/components/popover.yaml`](/raw/docs/components/popover.yaml){external=""}, with every rule from the checklist in place of the `rules` link. It's a fraction of this page's length, so it's the one to give agents that only need the rules, and not the reasoning behind them.

Every rule has a stable ID, like `popover/contain-escape`, so you and your agents can cite it in reviews and commits.

### Deterministic

The same props always render the same markup, leaving out anything your framework adds for itself, like comments or scoping attributes. For example, here's a popover with a short hint:

```html
<Popover id="filters" title="Filters">
  <p>Pick what to show.</p>
</Popover>
```

And here's what it renders, before it opens:

```html
<div class="popover" id="filters" role="dialog" aria-labelledby="filters-title" popover="auto" data-state="closed" data-placement="bottom">
  <div data-slot="header">
    <p id="filters-title" data-slot="title">Filters</p>
    <button class="button" type="button" data-variant="ghost" data-color="neutral" data-size="sm" data-icon-only data-slot="close">
      <span data-slot="leading" aria-hidden="true"><svg>…</svg></span>
      <span data-slot="label">Close</span>
    </button>
  </div>
  <div data-slot="body">
    <p>Pick what to show.</p>
  </div>
</div>
```

- `data-state` and `data-placement` are always there. With `arrow`, the popover ends with a `<span data-slot="arrow" aria-hidden="true">`, and once it's open, `data-side` says which side of the trigger it's on, so the arrow can point back. It's a physical side, `top`, `bottom`, `left` or `right`, so `start` comes out as `left` or `right` by direction.
- Parts are marked with `data-slot` and always come in the same order: `header`, holding `title` and `close`, then `body` and `arrow`. Only the body and the arrow can be left out.
- The title's ID is the popover's own, with `-title` on the end. There's nothing random in the server's markup, so it's the same on the server, on the client and in every snapshot.
- Once it mounts, every trigger that points at it gets `aria-expanded="false"`, and the one that opens it `"true"` while it's open. The popover gets `position-anchor` in its `style`, and the trigger that opens it gets the matching `anchor-name` until it closes. The name comes from your framework's ID helper, since an `id` can hold characters a CSS name can't, like `1:2`. In browsers without CSS anchor positioning, an open popover also gets `top` and `left`, from the script that places it.
- Opening and closing change attributes, never elements. The popover stays in the page while it's closed, so a form inside it keeps what people typed.

### Verifiable

Every rule in the checklist can be checked, and about half of them automatically.

#### Unit tests

Every rule that the checklist checks with a unit test has one in `Popover.test.ts`, which you'll find under [Reference implementation](/docs/components/popover#reference-implementation). We run them on every change to this page, so the code you see always passes them.

They run in jsdom, which has no Popover API, so the tests stand in for it: showing and hiding with `beforetoggle` and `toggle`, a `popovertarget` button opening its popover, and the closes the browser makes itself, for `Escape` and for a press outside. The `Escape` tests mount a real Dialog and a real Tooltip. A stand-in can't put the popover in the top layer or place it, so the checklist checks those in the browser instead.

#### In the browser

Placement, flipping, the top layer and light dismiss only exist in a real browser, so check them there. You can use the keyboard and the pointer the way people would, and run [axe](https://github.com/dequelabs/axe-core) over the open popover:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the Filters popover takes focus, closes on Escape and gives focus back", async ({ page }) => {
  await page.goto("/issues");

  const trigger = page.getByRole("button", { name: "Filters" });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const filters = page.getByRole("dialog", { name: "Filters" });
  await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  await expect(filters.getByRole("checkbox", { name: "Open issues only" })).toBeFocused();

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(filters).toBeHidden();
  await expect(trigger).toBeFocused();

  // A press outside closes it too, and leaves focus where it landed.
  await trigger.click();
  await page.mouse.click(5, 5);
  await expect(filters).toBeHidden();
});
```

Some things still need a human, so try your popovers near every edge of the window and on a phone, check that they flip and stay inside the screen, and use them with a screen reader, which should read the title as focus moves in. Try them at 200% zoom and with forced colours, more contrast and reduced motion turned on too. You can emulate the last three in Chrome DevTools, under Rendering.

#### During development

Our reference implementation also warns you in the console as soon as a popover renders without a title, which leaves it without a name.

#### Prompts

You can point your agent straight at this page. To build a popover, you could use:

::framework-switcher
#react
```
Build a Popover component for our React design system that meets the Open Components
Popover standard: https://opencomponents.dev/raw/docs/components/popover.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#vue
```
Build a Popover component for our Vue 3 design system that meets the Open Components
Popover standard: https://opencomponents.dev/raw/docs/components/popover.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#svelte
```
Build a Popover component for our Svelte 5 design system that meets the Open Components
Popover standard: https://opencomponents.dev/raw/docs/components/popover.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#angular
```
Build a Popover component for our Angular design system that meets the Open Components
Popover standard: https://opencomponents.dev/raw/docs/components/popover.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#solid
```
Build a Popover component for our Solid design system that meets the Open Components
Popover standard: https://opencomponents.dev/raw/docs/components/popover.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#astro
```
Build a Popover component for our Astro design system that meets the Open Components
Popover standard: https://opencomponents.dev/raw/docs/components/popover.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#vanilla
```
Build a Popover for our design system in plain HTML, CSS and JavaScript that meets the Open
Components Popover standard: https://opencomponents.dev/raw/docs/components/popover.md

Follow its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```
::

To review one, the contract is enough:

```
Review our Popover against the Open Components Popover contract:
https://opencomponents.dev/raw/docs/components/popover.yaml

For each rule with a component or both scope, report pass or fail with the rule ID
and the evidence from our code. Then fix the failures.
```

And to review how a screen uses its popovers:

```
Review how our issues page uses its popovers against the Open Components Popover
contract: https://opencomponents.dev/raw/docs/components/popover.yaml

For each rule with a usage or both scope, report pass or fail with the rule ID and
the evidence from our code. Then fix the failures.
```

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A popover meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Popover itself, so they're the ones to check when you build or review one. **Usage** rules are met by the screens that use it, like pointing its trigger at it with `popovertarget`, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like focus going back to the trigger: the Popover gives it back, as long as the trigger points at it.

The basis says where a rule comes from. Many of the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and several come from **HTML** and **WAI-ARIA**. The rest are **Open Components** rules, which are our own, like closing only the layer on top. Where a rule goes further than WCAG asks at level AA, its basis says so: one comes from level **AAA**, reduced motion, and a rule that asks for more than its criterion says **beyond**, like using the `popover` attribute, where WCAG would let you rebuild one by hand.

### UI rules

| Rule                         | Level  | Scope     | Requirement | Basis | Check |
| ---------------------------- | ------ | --------- | ----------- | ----- | ----- |
| `popover/contrast`           | Must   | Component | The title and the content have a contrast of 4.5:1 against the panel | WCAG 1.4.3 (AA) | axe `color-contrast`, contrast checker |
| `popover/edge`               | Should | Component | A border and a shadow set the panel apart from the page behind it | Open Components | Review |
| `popover/top-layer`          | Must   | Component | It opens in the top layer, so no `overflow` or `z-index` around its trigger clips or covers it, above an open Dialog too | HTML | Visual regression test |
| `popover/flips`              | Must   | Component | It opens beside its trigger, on the side `placement` names, flips to the other side when there's no room and stays inside the viewport, never covering its trigger where the browser has CSS anchor positioning | Open Components | Visual regression test |
| `popover/fallback-position`  | Should | Component | Browsers without CSS anchor positioning get the same side from a script and stay inside the viewport, although a tall popover can cover its trigger there | Open Components | Unit test, visual regression test |
| `popover/points-at-trigger`  | Must   | Component | An arrow, when there is one, sits on the edge facing the trigger and points at its centre, after a flip too | Open Components | Unit test, visual regression test |
| `popover/fits-screen`        | Must   | Component | It's never wider or taller than the screen less 16px on each side, down to 320px wide, and its body scrolls when its content doesn't fit | WCAG 1.4.10 (AA) | Emulation |
| `popover/resizable`          | Must   | Component | It's sized in `rem`, so it grows with its text, and its title wraps rather than getting cut off | Open Components, beyond WCAG 1.4.4, 1.4.12 (AA) | 200% zoom |
| `popover/reduced-motion`     | Should | Component | It only animates as it opens when `prefers-reduced-motion` is `no-preference` | WCAG 2.3.3 (AAA) | Emulation |
| `popover/forced-colors`      | Must   | Component | The panel's border stays visible in forced colours mode, which drops its shadow | Open Components | Emulation |
| `popover/more-contrast`      | Should | Component | The panel's border is drawn at full strength when `prefers-contrast: more` is set | Open Components | Emulation |
| `popover/follows-direction`  | Should | Component | `start` and `end` follow the reading direction, and its close button mirrors in right-to-left languages | Open Components | Unit test, review |

### UX rules

| Rule                        | Level  | Scope     | Requirement | Basis | Check |
| --------------------------- | ------ | --------- | ----------- | ----- | ----- |
| `popover/native-popover`    | Must   | Component | It's an element with `popover="auto"`, which a `popovertarget` button opens before any script loads, and never a scripted overlay | Open Components, beyond WCAG 2.1.1 (A) | Unit test |
| `popover/non-modal`         | Must   | Component | The page around it keeps working: nothing is inert, nothing is `aria-modal`, and `Tab` can leave it | WAI-ARIA, WCAG 2.1.2 (A) | Unit test, keyboard |
| `popover/named`             | Must   | Component | It's `role="dialog"`, named by its title with `aria-labelledby` | WCAG 4.1.2 (A) | Unit test |
| `popover/visible-title`     | Must   | Usage     | Every popover has a title that says what it holds, like "Filters" | WCAG 1.3.1 (A), 2.4.6 (AA) | Review |
| `popover/trigger`           | Must   | Usage     | Its trigger is a button that points at it with `popovertarget`, and sets `aria-haspopup="dialog"` | WCAG 4.1.2 (A), HTML | ARIA snapshot |
| `popover/trigger-expanded`  | Must   | Component | It keeps `aria-expanded` on its trigger in step with whether it's open, `true` only on the trigger that opened it | WCAG 4.1.2 (A) | Unit test, ARIA snapshot |
| `popover/after-trigger`     | Should | Usage     | It's rendered right after its trigger, so `Tab` and screen readers reach it next | WCAG 1.3.2, 2.4.3 (A) | Keyboard |
| `popover/opens-on-press`    | Must   | Usage     | It opens from a press on its trigger, or from your code, and never on hover or focus alone | Open Components | Review |
| `popover/initial-focus`     | Must   | Both      | Opening it moves focus inside, to the control marked with `data-autofocus`, or else the first in its body, then its close button | WCAG 2.4.3 (A) | Unit test |
| `popover/return-focus`      | Must   | Both      | Closing it while focus is inside moves focus back to its trigger, and a press outside leaves focus where people pressed | WCAG 2.4.3 (A), HTML | Unit test, keyboard |
| `popover/escape`            | Must   | Component | `Escape` closes it, with focus in it, on its trigger or anywhere else on the page | HTML, WCAG 2.4.11 (AA) | Unit test |
| `popover/contain-escape`    | Must   | Component | An `Escape` that closes it stops there, so a Dialog around it stays open, while one a Tooltip inside it took closes only the Tooltip | Open Components | Unit test |
| `popover/light-dismiss`     | Must   | Component | A press that starts and ends outside it and its trigger closes it, and one inside it doesn't | HTML | Unit test |
| `popover/close-button`      | Must   | Component | It has a visible close button, a Button named "Close" | Open Components | Unit test |
| `popover/one-at-a-time`     | Should | Component | Opening a popover closes any other one, unless it opened from inside that one | HTML | Keyboard |
| `popover/inside-dialog`     | Must   | Usage     | A popover in a Dialog is rendered inside it, so the Dialog doesn't make it inert | HTML | Keyboard |
| `popover/right-component`   | Should | Usage     | It holds a few controls or a short hint, while a hint on hover is a Tooltip and anything that needs an answer is a Dialog | Open Components | Review |

### DX rules

| Rule                        | Level  | Scope     | Requirement | Basis | Check |
| --------------------------- | ------ | --------- | ----------- | ----- | ----- |
| `popover/shared-vocabulary` | Must   | Component | It uses the shared names: `open`, `title` (`popoverTitle` in Angular), `placement`, `arrow`, `closeLabel` and `close` (`closeRequest` in Angular) | Open Components | Review |
| `popover/typed`             | Must   | Component | Props, events and slots are typed, with unions rather than `string`, and `id` and `title` are required | Open Components | Type check |
| `popover/controllable`      | Must   | Component | `open` opens and closes it, and follows every other open and close, each of which fires `close` with why | Open Components | Unit test |
| `popover/root-attributes`   | Must   | Component | Attributes, classes and listeners land on the popover element | Open Components | Unit test |

### AX rules

| Rule                         | Level  | Scope     | Requirement | Basis | Check |
| ---------------------------- | ------ | --------- | ----------- | ----- | ----- |
| `popover/role-and-name`      | Must   | Component | It can be found by its role and title alone, with `getByRole("dialog", { name })` | WCAG 4.1.2 (A) | Unit test, ARIA snapshot |
| `popover/hidden-when-closed` | Must   | Component | A closed popover isn't in the accessibility tree, so neither agents nor screen readers find it | HTML | Unit test |
| `popover/deterministic-dom`  | Must   | Component | The same props render the same markup, with its title's ID made from its own, and opening it changes attributes, never elements | Open Components | Unit test |
| `popover/data-attributes`    | Should | Component | Its state and placement are mirrored as `data-state` and `data-placement`, and parts are marked with `data-slot` | Open Components | Unit test |
| `popover/dev-warnings`       | Should | Component | It warns during development when it has no title | Open Components | Unit test |

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves: opening from its trigger, moving focus in and back out, and closing only the layer on top. It uses the Button for its close button, so copy the [Button](/docs/components/button#reference-implementation) and its `tokens.css` into your theme too.

The tests are in `Popover.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`. jsdom doesn't have the Popover API yet, so the tests stand in for it, at the top of the file. They also mount the Dialog and the Tooltip, for the `Escape` tests.

::code-collapse
:::code-group
```vue [Popover.vue]
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch } from "vue";
import Button from "../button/Button.vue";

/**
 * Why the popover closed: people pressed `Escape`, pressed or clicked outside it, pressed
 * its close button or its trigger again, or `closed` for anything else, like another
 * popover opening. It has already closed by the time `close` fires.
 */
export type PopoverCloseReason = "escape" | "outside" | "close-button" | "trigger" | "closed";

export interface PopoverProps {
  /** The popover's ID, which its trigger's `popovertarget` points to, and its title's starts with. */
  id: string;
  /** The text that names the popover, like "Filters", which screen readers read as focus moves in. */
  title: string;
  /** The side of the trigger it opens on. It flips to the other side when there's no room. */
  placement?: "top" | "bottom" | "start" | "end";
  /** Draws an arrow that points at the trigger, on whichever side it opens. */
  arrow?: boolean;
  /** The close button's label, which screen readers read and voice control users say. */
  closeLabel?: string;
}

const {
  id,
  title,
  placement = "bottom",
  arrow = false,
  closeLabel = "Close",
} = defineProps<PopoverProps>();

const emit = defineEmits<{
  /** It closed, and why, whether people closed it or the browser did. Never when you closed it with `open`. */
  close: [reason: PopoverCloseReason];
}>();

/**
 * Whether it's open, which `v-model:open` binds. Without it, the popover keeps its own, which
 * its trigger changes. It follows every open and close, its trigger's and the browser's too.
 */
const open = defineModel<boolean>("open", { default: false });

defineSlots<{
  /** The content, like a short form, a few options or a hint with a link. */
  default?: () => unknown;
}>();

const popover = useTemplateRef<HTMLElement>("popover");
const arrowPart = useTemplateRef<HTMLElement>("arrow-part");
const state = ref<"open" | "closed">("closed");
// The side it opened on, after any flip, which the arrow points from. Only aim() sets it,
// so a popover without an arrow never has one.
const side = ref<"top" | "bottom" | "left" | "right">();
// The anchor's name is set once it mounts, from a generated ID, since an id you pass can
// hold characters a CSS name can't, like "1:2", and the browser would drop the anchor.
const uid = useId();
const anchorName = ref<string>();
onMounted(() => (anchorName.value = `--popover-${uid}`));

// The button that opened it, which it's placed against and gives focus back to, and
// whatever had focus when it opened, for a popover your code opened without one.
let trigger: HTMLElement | null = null;
let opener: HTMLElement | null = null;
let frame: number | undefined;
// Whether it's showing, from `beforetoggle`, which the browser fires as it shows or hides
// it, while `toggle` comes a task later. So your code opening it right after closing it
// isn't mistaken for a popover that's still open.
let showing = false;
// The parts of a Dialog around it, which it listens on while it's open.
let hostParts: Element[] = [];

// Why it's closing. The popover closes itself on its close button and on Escape, and
// `null` means your code closed it, which fires no `close`. Every other close is the
// browser's, after a press outside it, Escape elsewhere on the page, its trigger or
// another popover, so the listeners below note what people just did, until the next task.
let closing: PopoverCloseReason | null | undefined;
let pending: PopoverCloseReason | undefined;
let reason: PopoverCloseReason | null = null;
let clearing: ReturnType<typeof setTimeout> | undefined;
let pressedOutside = false;
let returnFocus = false;

function note(next: PopoverCloseReason) {
  pending = next;
  clearTimeout(clearing);
  clearing = setTimeout(() => (pending = undefined));
}

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

// The Dialog's order: the control people marked with `data-autofocus`, or else the first
// one in the body, and only then the close button. Browsers already focus an `autofocus`
// control in a popover as it opens, so it counts as well.
function initialFocus(el: HTMLElement) {
  return (
    el.querySelector<HTMLElement>("[data-autofocus], [autofocus]") ??
    el.querySelector('[data-slot="body"]')?.querySelector<HTMLElement>(FOCUSABLE) ??
    el.querySelector<HTMLElement>('[data-slot="close"]')
  );
}

// The buttons that point at it with `popovertarget`.
const triggers = () => document.querySelectorAll<HTMLElement>(`[popovertarget="${id.replace(/["\\]/g, "\\$&")}"]`);

// The trigger is the button the browser says opened it, where it says so, or else the
// first one that points at it. TypeScript doesn't know `source` yet.
function findTrigger(event: Event) {
  const { source } = event as ToggleEvent & { source?: Element | null };
  return source instanceof HTMLElement ? source : (triggers()[0] ?? null);
}

// The browser gives a `popovertarget` button its expanded state, but only in the
// accessibility tree, so the Popover writes it out as `aria-expanded` too, which the
// Button's Expanded style and agents read.
function expand(el: HTMLElement | null, value: boolean) {
  el?.setAttribute("aria-expanded", String(value));
}

// Only the trigger that opened it carries the anchor's name, since with two buttons named
// the same, the browser would place it beside the last one on the page.
function unanchor() {
  trigger?.style.removeProperty("anchor-name");
}

function onBeforetoggle(event: Event) {
  const el = popover.value!;
  if ((event as ToggleEvent).newState === "open") {
    showing = true;
    // Opening it again from another trigger before the browser said it closed leaves the
    // last trigger as it would be once closed.
    listen(false);
    expand(trigger, false);
    unanchor();
    trigger = findTrigger(event);
    opener = document.activeElement as HTMLElement | null;
    if (trigger && anchorName.value) trigger.style.setProperty("anchor-name", anchorName.value);
    return;
  }
  showing = false;
  // Focus goes back to the trigger only when it was inside, like when people pressed
  // Escape or the close button. After a press outside, it stays where people pressed.
  returnFocus = el.contains(document.activeElement);
  reason = closing !== undefined ? closing : (pending ?? "closed");
  closing = undefined;
}

function onToggle(event: Event) {
  const el = popover.value!;
  if ((event as ToggleEvent).newState === "open") {
    state.value = "open";
    open.value = true;
    expand(trigger, true);
    listen(true);
    // Focus moves in, so keyboard and screen reader users start in the popover, unless
    // the browser already focused an `autofocus` control in it.
    if (!el.contains(document.activeElement)) initialFocus(el)?.focus();
    nextTick(update);
    if (arrow) nextTick(follow);
    return;
  }
  state.value = "closed";
  open.value = false;
  expand(trigger, false);
  unanchor();
  listen(false);
  // The browser gives focus back to whatever had it before the popover opened, which in
  // Safari, where a click doesn't focus a button, isn't the trigger. So the trigger gets it,
  // unless focus has already moved somewhere else, like into another popover.
  const active = document.activeElement;
  if (returnFocus && (!active || active === document.body || el.contains(active))) (trigger ?? opener)?.focus();
  returnFocus = false;
  if (reason) emit("close", reason);
}

// Escape closes the popover and goes no further, so a dialog around it stays open, whether
// focus is in the popover or on its trigger. It's handled on the popover itself, rather than
// the document, so a tooltip inside it, which stops Escape on the document, and a control
// that cancels it, close first and alone. Cancelling it also keeps the browser from closing
// anything else on it. With a popover open inside this one, Escape is that one's.
function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || event.defaultPrevented || !showing) return;
  if (popover.value?.querySelector('[popover]:popover-open, .popover[data-state="open"]')) return;
  event.preventDefault();
  event.stopPropagation();
  dismiss("escape");
}

// Elsewhere on the page, the browser closes it on Escape. Inside a Dialog, though, the
// Dialog takes Escape first and cancels it, which would close the Dialog around a popover
// that's still open. So in a Dialog, it listens on the Dialog's parts too, which hear an
// Escape after the control that has focus and before the Dialog does.
function onHostKeydown(event: KeyboardEvent) {
  const target = event.target as Node;
  if (popover.value?.contains(target) || trigger?.contains(target)) return;
  onKeydown(event);
}

// With focus on the Dialog itself, like after a click on text in the popover, which can't
// take focus, none of its parts hears the key. So the Dialog does too, in the capture
// phase, but only then: with no control focused, it takes the key from nobody.
function onDialogKeydown(event: KeyboardEvent) {
  if (event.target === event.currentTarget) onKeydown(event);
}

// A Dialog that closes, like from its Done button, takes the popover with it.
function onHostClose() {
  if (showing) dismiss("closed");
}

function dismiss(why: PopoverCloseReason | null) {
  closing = why;
  popover.value?.hidePopover?.();
}

// What people do while it's open, which tells the closes the browser makes apart.
function onPointerdown(event: PointerEvent) {
  const target = event.target as Node;
  pressedOutside = !popover.value?.contains(target) && !trigger?.contains(target);
}
function onPointerup(event: PointerEvent) {
  const target = event.target as Node;
  if (pressedOutside && !popover.value?.contains(target) && !trigger?.contains(target)) note("outside");
  pressedOutside = false;
}
function onPageKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && !event.defaultPrevented) note("escape");
}
function onTriggerClick() {
  note("trigger");
}

function listen(on: boolean) {
  const method = on ? "addEventListener" : "removeEventListener";
  document[method]("pointerdown", onPointerdown as EventListener, true);
  document[method]("pointerup", onPointerup as EventListener, true);
  // On the window, after everything else, so it only hears an Escape nothing else took.
  window[method]("keydown", onPageKeydown as EventListener);
  trigger?.[method]("keydown", onKeydown as EventListener);
  trigger?.[method]("click", onTriggerClick);
  const host = popover.value?.parentElement?.closest("dialog");
  if (on) hostParts = [...(host?.children ?? [])];
  for (const part of hostParts) part[method]("keydown", onHostKeydown as EventListener);
  host?.[method]("keydown", onDialogKeydown as EventListener, true);
  host?.[method]("close", onHostClose);
  if (!on) hostParts = [];
  if (!anchored()) {
    window[method]("scroll", update, { capture: true, passive: true } as AddEventListenerOptions);
    window[method]("resize", update);
  }
  if (!on && frame !== undefined) {
    cancelAnimationFrame(frame);
    frame = undefined;
  }
}

// Your code opening and closing it. Once it's open or closed, the model says so too, which
// changes nothing here.
watch(
  open,
  (value) => {
    const el = popover.value;
    if (!el?.showPopover) return;
    if (value && !showing) el.showPopover();
    else if (!value && showing) dismiss(null);
  },
  { flush: "post" },
);

// CSS anchor positioning places it, where the browser has it. Elsewhere, place() does.
// It checks position-area rather than anchor-name, which Chrome had four versions earlier.
const anchored = () => globalThis.CSS?.supports?.("position-area: top") ?? false;

function update() {
  if (!anchored()) place();
  if (arrow) aim();
}

// The arrow follows it on every frame while it's open, since the browser moves an anchored
// popover after a scroll handler runs, and a flip can move it with no scroll at all.
function follow() {
  if (state.value !== "open") return;
  aim();
  frame = requestAnimationFrame(follow);
}

// Without anchor positioning: the chosen side of the trigger, or the other side when it
// doesn't fit, centred on the trigger and kept inside the viewport.
function place() {
  const el = popover.value;
  if (!el || !trigger) return;
  // Its margin is the gap, which `left` and `top` place it outside of.
  const gap = parseFloat(getComputedStyle(el).marginTop) || 0;
  const a = trigger.getBoundingClientRect();
  // Its exact size, without the scale it grows in from, which getBoundingClientRect() would include.
  const width = parseFloat(getComputedStyle(el).width);
  const height = parseFloat(getComputedStyle(el).height);
  const { clientWidth, clientHeight } = document.documentElement;
  const rtl = getComputedStyle(trigger).direction === "rtl";
  const sides = { top: "top", bottom: "bottom", start: rtl ? "right" : "left", end: rtl ? "left" : "right" } as const;
  const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
  const fits = {
    top: a.top - gap - height >= 0,
    bottom: a.bottom + gap + height <= clientHeight,
    left: a.left - gap - width >= 0,
    right: a.right + gap + width <= clientWidth,
  };
  let at: keyof typeof opposite = sides[placement];
  if (!fits[at] && fits[opposite[at]]) at = opposite[at];
  // Beside a trigger with room on neither side, like on a phone, it goes below it or above it,
  // rather than over it.
  else if (!fits[at] && (at === "left" || at === "right")) at = fits.bottom || !fits.top ? "bottom" : "top";
  const across = at === "top" || at === "bottom";
  const x = across ? a.left + (a.width - width) / 2 : at === "left" ? a.left - gap - width : a.right + gap;
  const y = across ? (at === "top" ? a.top - gap - height : a.bottom + gap) : a.top + (a.height - height) / 2;
  el.style.left = `${Math.max(0, Math.min(x, clientWidth - width)) - gap}px`;
  el.style.top = `${Math.max(0, Math.min(y, clientHeight - height)) - gap}px`;
}

// With an arrow: the side it opened on, from where its centre is, which its scale doesn't move,
// and the arrow across from the trigger's centre, or as close as the rounded corners allow.
function aim() {
  const el = popover.value;
  const part = arrowPart.value;
  if (!el || !part || !trigger) return;
  const a = trigger.getBoundingClientRect();
  const p = el.getBoundingClientRect();
  const x = p.left + p.width / 2;
  const y = p.top + p.height / 2;
  side.value = y < a.top ? "top" : y > a.bottom ? "bottom" : x < a.left ? "left" : "right";
  const across = side.value === "top" || side.value === "bottom";
  const box = getComputedStyle(el);
  const length = parseFloat(across ? box.width : box.height);
  const centre = across ? a.left + a.width / 2 - (x - length / 2) : a.top + a.height / 2 - (y - length / 2);
  const clear = parseFloat(box.borderTopLeftRadius) + parseFloat(getComputedStyle(part).width) / Math.SQRT2;
  const offset = clear * 2 < length ? Math.max(clear, Math.min(centre, length - clear)) : length / 2;
  part.style.left = across ? `${offset - el.clientLeft}px` : "";
  part.style.top = across ? "" : `${offset - el.clientTop}px`;
}

onMounted(() => {
  for (const el of triggers()) expand(el, false);
  if (open.value) popover.value?.showPopover?.();

  if (import.meta.env.DEV && !title.trim()) {
    console.warn("[Popover] has no title: give it one, since it's what names the popover.", popover.value);
  }
});

onBeforeUnmount(() => {
  if (showing) dismiss(null);
  listen(false);
  expand(trigger, false);
  unanchor();
  clearTimeout(clearing);
});
</script>

<template>
  <!-- popover="auto" puts it in the top layer and lets the browser close it on Escape and on a
       press outside, and its trigger opens it with popovertarget, before any script loads. -->
  <div
    :id="id"
    ref="popover"
    class="popover"
    role="dialog"
    :aria-labelledby="`${id}-title`"
    popover="auto"
    :data-state="state"
    :data-placement="placement"
    :data-side="side"
    :style="anchorName && { 'position-anchor': anchorName }"
    @beforetoggle="onBeforetoggle"
    @toggle="onToggle"
    @keydown="onKeydown"
  >
    <div data-slot="header">
      <!-- Not a heading, since the popover sits among the page's own content, where an <h2>
           would break the page's outline. It names the popover all the same. -->
      <p :id="`${id}-title`" data-slot="title">{{ title }}</p>
      <Button
        data-slot="close"
        :label="closeLabel"
        variant="ghost"
        size="sm"
        icon-only
        @click="dismiss('close-button')"
      >
        <template #leading>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </template>
      </Button>
    </div>
    <div v-if="$slots.default" data-slot="body">
      <slot />
    </div>
    <span v-if="arrow" ref="arrow-part" data-slot="arrow" aria-hidden="true" />
  </div>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The popover's styles go in `components`,
   so a class of yours that sets its variables wins without any specificity tricks. */
@layer theme, base, components, utilities;

/* The panel looks like the Dialog's, a little smaller, with a shadow, since there's no
   backdrop to set it apart from the page. */
@layer components {
  .popover {
    --popover--max-width: 20rem;
    --popover--padding: 1rem;
    --popover--gap: 0.75rem;
    --popover--radius: 0.5rem;
    /* Decoration, like the Dialog's: its title says what it is, so it doesn't need 3:1. */
    --popover--border-color: color-mix(in srgb, currentColor 20%, transparent);
    /* The page's own background, which follows `color-scheme`, so it covers what's behind it. */
    --popover--background: Canvas;
    --popover--box-shadow: 0 0.25rem 1rem color-mix(in srgb, #000 15%, transparent);
    /* The gap between the trigger and the popover. */
    --popover--offset: 0.5rem;
    /* The arrow's width and height, before it's turned, when it has one. */
    --popover--arrow--size: 0.75rem;

    /* Beside the trigger, centred on it, and on the other side when there's no room. When
       neither side has room, it shrinks on one with about half the screen or more, and its
       body scrolls. */
    position: fixed;
    position-area: bottom;
    position-try-fallbacks: flip-block, flip-inline, --popover-fit, flip-block --popover-fit;
    inset: auto;
    margin: var(--popover--offset);
    box-sizing: border-box;
    flex-direction: column;
    gap: var(--popover--gap);
    /* Never wider or taller than the screen, less 16px on each side, so it fits at 320px wide. */
    width: max-content;
    max-width: min(var(--popover--max-width), 100vw - 2rem);
    max-height: calc(100dvh - 2rem);
    padding: var(--popover--padding);
    border: 1px solid var(--popover--border-color);
    border-radius: var(--popover--radius);
    /* The arrow sits half outside it, and the body scrolls instead. */
    overflow: visible;
    background-color: var(--popover--background);
    box-shadow: var(--popover--box-shadow);
    color: var(--color--neutral-text);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
    overflow-wrap: break-word;
  }
  .popover:popover-open {
    display: flex;
  }
  .popover[data-placement="top"] {
    position-area: top;
  }
  /* In the popover's own direction, which is its trigger's, rather than the page's. */
  .popover[data-placement="start"] {
    position-area: self-inline-start;
  }
  .popover[data-placement="end"] {
    position-area: self-inline-end;
  }
  /* Beside a trigger with room on neither side, like on a phone, it goes below it or above it,
     rather than over it. */
  .popover:is([data-placement="start"], [data-placement="end"]) {
    position-try-fallbacks: flip-inline, bottom, top, --popover-fit-below, --popover-fit-above;
  }

  /* Parts. The title stays in view, and the body scrolls under it. */
  .popover > [data-slot="header"] {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 1rem;
  }
  .popover [data-slot="title"] {
    margin: 0;
    font-weight: 600;
    line-height: 1.375;
  }
  .popover [data-slot="close"] {
    /* Centred on the title's first line, and lined up with the edge of the content. */
    margin-block: calc((1.2rem - 2rem) / 2);
    margin-inline-end: -0.5rem;
  }
  .popover > [data-slot="body"] {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    /* Room for the focus rings of the controls at its edges, which it would clip. */
    margin: -0.25rem;
    padding: 0.25rem;
  }

  /* The arrow: a square turned 45deg, half of it past the edge that faces the trigger, in the
     popover's background and border, so forced colors mode draws its edge too. The edges inside
     the popover have no border, and it waits for the side it opened on. */
  .popover > [data-slot="arrow"] {
    position: absolute;
    box-sizing: border-box;
    width: var(--popover--arrow--size);
    height: var(--popover--arrow--size);
    border: inherit;
    background: inherit;
    translate: -50% -50%;
    rotate: 45deg;
  }
  .popover:not([data-side]) > [data-slot="arrow"] {
    display: none;
  }
  .popover[data-side="top"] > [data-slot="arrow"] {
    top: 100%;
    border-top-width: 0;
    border-left-width: 0;
  }
  .popover[data-side="bottom"] > [data-slot="arrow"] {
    top: 0;
    border-right-width: 0;
    border-bottom-width: 0;
  }
  .popover[data-side="left"] > [data-slot="arrow"] {
    left: 100%;
    border-bottom-width: 0;
    border-left-width: 0;
  }
  .popover[data-side="right"] > [data-slot="arrow"] {
    left: 0;
    border-top-width: 0;
    border-right-width: 0;
  }

  /* It fades and grows in, unless people have asked for less motion. */
  @media (prefers-reduced-motion: no-preference) {
    .popover:popover-open {
      transition:
        opacity 150ms ease-out,
        scale 150ms ease-out;
    }
    @starting-style {
      .popover:popover-open {
        opacity: 0;
        scale: 0.96;
      }
    }
  }

  /* With more contrast, the border is drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .popover {
      --popover--border-color: currentColor;
    }
  }

  /* Forced colors mode drops the shadow, so the border, in the system's text colour, marks its edge. */
  @media (forced-colors: active) {
    .popover {
      border-color: CanvasText;
    }
  }
}
/* Its last resorts, as tall as the side it opens on allows, less the gap on each side. The
   minimum turns down a side with less than about half the screen, so it shrinks on the
   bigger side. It only comes to this when it fits neither side, so it's taller than that
   anyway. The `below` and `above` ones are for `start` and `end`. */
@position-try --popover-fit {
  max-height: calc(100% - 2 * var(--popover--offset));
  min-height: calc(50dvh - 3rem);
}
@position-try --popover-fit-below {
  position-area: bottom;
  max-height: calc(100% - 2 * var(--popover--offset));
  min-height: calc(50dvh - 3rem);
}
@position-try --popover-fit-above {
  position-area: top;
  max-height: calc(100% - 2 * var(--popover--offset));
  min-height: calc(50dvh - 3rem);
}
</style>
```

```ts [Popover.test.ts]
import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type VNodeChild } from "vue";
import Dialog from "../dialog/Dialog.vue";
import Tooltip from "../tooltip/Tooltip.vue";
import Popover, { type PopoverProps } from "./Popover.vue";

// jsdom has no Popover API, so these stand in for the parts the Popover relies on: showing
// and hiding with `beforetoggle` and `toggle`, giving focus back to whatever had it before,
// a `popovertarget` button toggling its popover, and the closes the browser makes itself,
// after the event that caused them, for an Escape nobody cancelled and for a press that
// starts and ends outside. They can't put it in the top layer or place it, which the
// checklist checks in a browser instead.
const shown = new Set<HTMLElement>();
const previous = new Map<HTMLElement, Element | null>();
// Chrome fires `toggle` a task after it shows or hides a popover, and folds two in a row
// into one. Most tests fire it at once, which is easier to follow.
let deferToggle = false;
const pendingToggle = new Map<HTMLElement, { oldState: string; timer: ReturnType<typeof setTimeout> }>();

function toggle(el: HTMLElement, newState: "open" | "closed", source: Element | null = null, { focusPrevious = true } = {}) {
  const oldState = newState === "open" ? "closed" : "open";
  el.dispatchEvent(Object.assign(new Event("beforetoggle"), { newState, oldState, source }));
  if (newState === "open") {
    shown.add(el);
    previous.set(el, document.activeElement);
  } else {
    shown.delete(el);
    // Hiding it gives focus back to whatever had it before it opened, when focus is inside,
    // except after a press outside. That's the <body> when nothing had it, like in Safari,
    // where a click doesn't focus the button.
    const before = previous.get(el);
    if (focusPrevious && el.contains(document.activeElement)) {
      if (before instanceof HTMLElement && before !== document.body) before.focus();
      else (document.activeElement as HTMLElement).blur();
    }
  }
  // jsdom hides every popover, as browsers hide a closed one, but can't match :popover-open,
  // which shows an open one, so this stands in for it.
  el.style.display = newState === "open" ? "flex" : "";
  const fire = (old: string) => el.dispatchEvent(Object.assign(new Event("toggle"), { newState, oldState: old, source }));
  if (!deferToggle) return fire(oldState);
  const pending = pendingToggle.get(el);
  clearTimeout(pending?.timer);
  const old = pending?.oldState ?? oldState;
  pendingToggle.set(el, {
    oldState: old,
    timer: setTimeout(() => {
      pendingToggle.delete(el);
      fire(old);
    }),
  });
}

beforeAll(() => {
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    if (!shown.has(this)) toggle(this, "open");
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    if (shown.has(this)) toggle(this, "closed");
  };
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };

  document.addEventListener("click", (event) => {
    const invoker = (event.target as Element).closest<HTMLElement>("[popovertarget]");
    const target = invoker && document.getElementById(invoker.getAttribute("popovertarget")!);
    if (!target) return;
    queueMicrotask(() => (shown.has(target) ? toggle(target, "closed", invoker) : toggle(target, "open", invoker)));
  });
  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    queueMicrotask(() => [...shown].at(-1)?.hidePopover());
  });
  let down: EventTarget | null = null;
  document.addEventListener("pointerdown", (event) => (down = event.target), true);
  document.addEventListener("pointerup", (event) => {
    const outside = (target: EventTarget | null) =>
      [...shown].filter((el) => !el.contains(target as Node) && !(target as Element).closest(`[popovertarget="${el.id}"]`));
    const pressed = outside(down);
    queueMicrotask(() =>
      outside(event.target)
        .filter((el) => pressed.includes(el))
        .forEach((el) => toggle(el, "closed", null, { focusPrevious: false })),
    );
  });
});

afterEach(() => {
  shown.clear();
  deferToggle = false;
});

const field = (id: string, text: string) => [h("label", { for: id }, text), h("input", { id })];
const button = (text: string, attrs = {}) => h("button", { type: "button", ...attrs }, text);

// A page with a Filters button that opens the popover with popovertarget, and a link
// after them, the way you'd use it.
function page(props: Partial<PopoverProps> & Record<string, unknown> = {}, content: () => VNodeChild = () => field("open-only", "Open issues only")) {
  const onClose = vi.fn();
  const result = render({
    render: () => [
      button("Filters", { popovertarget: "filters", "aria-haspopup": "dialog" }),
      h(Popover, { id: "filters", title: "Filters", onClose, ...props }, { default: content }),
      h("a", { href: "#issues" }, "Issues"),
    ],
  });
  return { ...result, onClose };
}

const popover = () => document.querySelector<HTMLElement>(".popover")!;

async function openFrom(user: ReturnType<typeof userEvent.setup>, name = "Filters") {
  await user.click(screen.getByRole("button", { name }));
}

describe("Popover", () => {
  it("is a dialog with popover auto, named by its title, which a popovertarget button opens", async () => {
    const user = userEvent.setup();
    page();
    expect(popover()).toHaveAttribute("popover", "auto");
    expect(popover()).toHaveAttribute("data-state", "closed");

    await openFrom(user);
    const dialog = screen.getByRole("dialog", { name: "Filters" });
    expect(dialog).toBe(popover());
    expect(dialog).toHaveAttribute("data-state", "open");
    expect(dialog).toHaveAttribute("aria-labelledby", "filters-title");
    expect(screen.getByText("Filters", { selector: "p" })).toHaveAttribute("id", "filters-title");
  });

  it("isn't found while it's closed", () => {
    page();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("isn't modal, so nothing around it changes while it's open", async () => {
    const user = userEvent.setup();
    page();

    await openFrom(user);
    expect(popover()).not.toHaveAttribute("aria-modal");
    expect(screen.getByRole("link", { name: "Issues" }).closest("[inert]")).toBeNull();
  });

  it("closes when its trigger is pressed again, with the reason trigger", async () => {
    const user = userEvent.setup();
    const { onClose } = page();

    await openFrom(user);
    await openFrom(user);
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["trigger"]]);
  });

  it("moves focus to the control marked with data-autofocus, or else the first in its body", async () => {
    const user = userEvent.setup();
    const { unmount } = page({}, () => [...field("open-only", "Open issues only"), ...field("mine", "Mine only")]);
    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Open issues only" })).toHaveFocus();
    unmount();

    page({}, () => [...field("open-only", "Open issues only"), h("label", { for: "mine" }, "Mine only"), h("input", { id: "mine", "data-autofocus": "" })]);
    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Mine only" })).toHaveFocus();
  });

  it("counts a control marked with autofocus too, and starts on its close button with nothing to focus in its body", async () => {
    const user = userEvent.setup();
    const { unmount } = page({}, () => [...field("open-only", "Open issues only"), h("label", { for: "mine" }, "Mine only"), h("input", { id: "mine", autofocus: true })]);
    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Mine only" })).toHaveFocus();
    unmount();

    page({ id: "billing", title: "About billing" }, () => h("p", "You're billed on the first of each month."));
    render(() => button("About billing", { popovertarget: "billing" }));
    await openFrom(user, "About billing");
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("gives focus back to its trigger when it closes with Escape or its close button", async () => {
    const user = userEvent.setup();
    const { onClose } = page();
    const trigger = screen.getByRole("button", { name: "Filters" });

    await openFrom(user);
    // Safari doesn't focus a button on a click, so the trigger can't count on having focus.
    trigger.blur();
    screen.getByRole("textbox").focus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();

    await openFrom(user);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(trigger).toHaveFocus();
    expect(onClose.mock.calls).toEqual([["escape"], ["close-button"]]);
  });

  it("gives focus back to its trigger even when the trigger never had it, as after a click in Safari", async () => {
    page();
    const trigger = screen.getByRole("button", { name: "Filters" });

    // A click that doesn't focus the button, so the browser has nothing to give focus back to.
    trigger.click();
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-state", "open"));
    expect(screen.getByRole("textbox")).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("leaves focus off its trigger after a press outside on something that can't take focus", async () => {
    const user = userEvent.setup();
    const { onClose } = page({}, () => field("open-only", "Open issues only"));
    render(() => h("p", "Showing 12 issues"));

    await openFrom(user);
    expect(screen.getByRole("textbox")).toHaveFocus();
    await user.click(screen.getByText("Showing 12 issues"));
    expect(onClose.mock.calls).toEqual([["outside"]]);
    expect(screen.getByRole("button", { name: "Filters" })).not.toHaveFocus();
  });

  it("closes on a press outside, with the reason outside, and leaves focus where people pressed", async () => {
    const user = userEvent.setup();
    const { onClose } = page();

    await openFrom(user);
    await user.click(screen.getByRole("link", { name: "Issues" }));
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["outside"]]);
    expect(screen.getByRole("link", { name: "Issues" })).toHaveFocus();
  });

  it("stays open on a press inside it", async () => {
    const user = userEvent.setup();
    const { onClose } = page();

    await openFrom(user);
    await user.click(screen.getByRole("textbox"));
    expect(popover()).toHaveAttribute("data-state", "open");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes with Escape on its trigger too, and stops the key there", async () => {
    const user = userEvent.setup();
    const { onClose } = page();
    const trigger = screen.getByRole("button", { name: "Filters" });
    await openFrom(user);

    trigger.focus();
    const keydown = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    trigger.dispatchEvent(keydown);
    await nextTick();
    expect(keydown.defaultPrevented).toBe(true);
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
    expect(trigger).toHaveFocus();
  });

  it("says it closed with Escape when the browser closes it for an Escape elsewhere on the page", async () => {
    const user = userEvent.setup();
    const { onClose } = page();
    await openFrom(user);

    screen.getByRole("link", { name: "Issues" }).focus();
    await user.keyboard("{Escape}");
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
    // Focus wasn't in it, so it stays where it was.
    expect(screen.getByRole("link", { name: "Issues" })).toHaveFocus();
  });

  it("says closed for a close it can't tell apart, like another popover opening", async () => {
    const user = userEvent.setup();
    const { onClose } = page();
    await openFrom(user);

    popover().hidePopover();
    expect(onClose.mock.calls).toEqual([["closed"]]);
  });

  it("closes only a Tooltip open inside it on the first Escape, and itself on the second", async () => {
    const user = userEvent.setup();
    const { onClose } = page({}, () =>
      h(Tooltip, { label: "Hides closed issues" }, { default: ({ trigger }: { trigger: Record<string, unknown> }) => h("button", trigger, "Open only") }),
    );
    await openFrom(user);
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(screen.getByRole("button", { name: "Open only" })).toHaveFocus();
    expect(tooltip).toHaveAttribute("data-state", "open");

    await user.keyboard("{Escape}");
    expect(tooltip).toHaveAttribute("data-state", "closed");
    expect(popover()).toHaveAttribute("data-state", "open");
    expect(onClose).not.toHaveBeenCalled();

    await user.keyboard("{Escape}");
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
  });

  // A Dialog with a Filters button inside it, which opens the popover, as on a settings form.
  function inDialog({ doneKeydown }: { doneKeydown?: (event: KeyboardEvent) => void } = {}) {
    const onDialogClose = vi.fn();
    const onClose = vi.fn();
    const dialogOpen = ref(true);
    render({
      render: () =>
        h(Dialog, { id: "settings", title: "Settings", open: dialogOpen.value, onClose: onDialogClose }, () => [
          button("Filters", { popovertarget: "filters", "aria-haspopup": "dialog" }),
          h(Popover, { id: "filters", title: "Filters", onClose }, () => field("open-only", "Open issues only")),
          button("Done", { onKeydown: doneKeydown, onClick: () => (dialogOpen.value = false) }),
        ]),
    });
    return { onDialogClose, onClose, dialogOpen };
  }

  it("closes alone on Escape inside a Dialog, which fires no close, with focus in it", async () => {
    const user = userEvent.setup();
    const { onDialogClose, onClose } = inDialog();
    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Open issues only" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
    expect(onDialogClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Settings" })).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Filters" })).toHaveFocus();

    // With the popover closed, Escape is the Dialog's again.
    await user.keyboard("{Escape}");
    expect(onDialogClose).toHaveBeenCalledWith("escape", "");
  });

  it("closes alone on Escape inside a Dialog with focus on its trigger, too", async () => {
    const user = userEvent.setup();
    const { onDialogClose, onClose } = inDialog();
    await openFrom(user);

    screen.getByRole("button", { name: "Filters" }).focus();
    await user.keyboard("{Escape}");
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
    expect(onDialogClose).not.toHaveBeenCalled();
  });

  it("closes alone on Escape inside a Dialog with focus on another control in the Dialog", async () => {
    const user = userEvent.setup();
    const { onDialogClose, onClose } = inDialog();
    await openFrom(user);

    // Tab moves on out of it, and leaves it open.
    screen.getByRole("button", { name: "Done" }).focus();
    await user.keyboard("{Escape}");
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
    expect(onDialogClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Done" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(onDialogClose).toHaveBeenCalledWith("escape", "");
  });

  it("closes when a Dialog around it closes, like from its Done button", async () => {
    const user = userEvent.setup();
    const { onClose } = inDialog();
    await openFrom(user);

    screen.getByRole("button", { name: "Done" }).focus();
    await user.keyboard("{Enter}");
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-state", "closed"));
    expect(shown.has(popover())).toBe(false);
    expect(onClose.mock.calls).toEqual([["closed"]]);
    expect(screen.getByRole("button", { name: "Filters", hidden: true })).toHaveAttribute("aria-expanded", "false");
  });

  it("closes alone on Escape inside a Dialog with focus on the Dialog itself, like after a click on its text", async () => {
    const user = userEvent.setup();
    const { onDialogClose, onClose } = inDialog();
    await openFrom(user);

    // A click on text that can't take focus leaves it on the <dialog>.
    const dialog = screen.getByRole("dialog", { name: "Settings" });
    dialog.tabIndex = -1;
    dialog.focus();
    await user.keyboard("{Escape}");
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
    expect(onDialogClose).not.toHaveBeenCalled();

    await user.keyboard("{Escape}");
    expect(onDialogClose).toHaveBeenCalledWith("escape", "");
  });

  it("leaves Escape to a control in the Dialog that handles it first", async () => {
    const user = userEvent.setup();
    const doneKeydown = vi.fn((event: KeyboardEvent) => event.key === "Escape" && event.preventDefault());
    const { onDialogClose, onClose } = inDialog({ doneKeydown });
    await openFrom(user);

    screen.getByRole("button", { name: "Done" }).focus();
    await user.keyboard("{Escape}");
    expect(doneKeydown).toHaveBeenCalled();
    expect(popover()).toHaveAttribute("data-state", "open");
    expect(onClose).not.toHaveBeenCalled();
    expect(onDialogClose).not.toHaveBeenCalled();
  });

  // A popover with a Filters button and its own popover inside it, in a Dialog or not.
  function nested({ dialog = false } = {}) {
    const content = () => [
      button("Share", { popovertarget: "share" }),
      h(Popover, { id: "share", title: "Share" }, () => [
        button("Filters", { popovertarget: "filters" }),
        h(Popover, { id: "filters", title: "Filters" }, () => field("open-only", "Open issues only")),
      ]),
      button("Done"),
    ];
    render(dialog ? { render: () => h(Dialog, { id: "settings", title: "Settings", open: true }, content) } : { render: content });
    const state = (id: string) => document.getElementById(id)!.getAttribute("data-state");
    return { state };
  }

  it("closes only the inner of two nested popovers on Escape, with focus in the outer", async () => {
    const user = userEvent.setup();
    const { state } = nested();
    await openFrom(user, "Share");
    await openFrom(user, "Filters");
    expect([state("share"), state("filters")]).toEqual(["open", "open"]);

    screen.getByRole("button", { name: "Filters" }).focus();
    within(document.getElementById("share")!).getAllByRole("button", { name: "Close" })[0]!.focus();
    await user.keyboard("{Escape}");
    expect([state("share"), state("filters")]).toEqual(["open", "closed"]);
    await user.keyboard("{Escape}");
    expect([state("share"), state("filters")]).toEqual(["closed", "closed"]);
  });

  it("closes only the inner of two nested popovers on Escape in a Dialog, with focus elsewhere in it", async () => {
    const user = userEvent.setup();
    const { state } = nested({ dialog: true });
    await openFrom(user, "Share");
    await openFrom(user, "Filters");

    screen.getByRole("button", { name: "Done" }).focus();
    await user.keyboard("{Escape}");
    expect([state("share"), state("filters")]).toEqual(["open", "closed"]);
    await user.keyboard("{Escape}");
    expect([state("share"), state("filters")]).toEqual(["closed", "closed"]);
  });

  // Two buttons that open the same popover, like a toolbar's and a menu's.
  function twoTriggers() {
    render({
      render: () => [
        button("Filters", { popovertarget: "filters", "aria-haspopup": "dialog" }),
        button("More filters", { popovertarget: "filters", "aria-haspopup": "dialog" }),
        h(Popover, { id: "filters", title: "Filters" }, () => field("open-only", "Open issues only")),
      ],
    });
    return [screen.getByRole("button", { name: "Filters" }), screen.getByRole("button", { name: "More filters" })] as const;
  }

  it("marks the trigger that opened it as expanded, and every trigger as collapsed while it's closed", async () => {
    const user = userEvent.setup();
    const [first, second] = twoTriggers();
    await nextTick();
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "false");

    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{Escape}");
    expect(second).toHaveAttribute("aria-expanded", "false");
  });

  it("anchors to the trigger that opened it, and only that one", async () => {
    const user = userEvent.setup();
    const [first, second] = twoTriggers();

    await user.click(first);
    const anchor = first.style.getPropertyValue("anchor-name");
    expect(anchor).toMatch(/^--popover-/);
    await user.keyboard("{Escape}");
    expect(first.style.getPropertyValue("anchor-name")).toBe("");

    await user.click(second);
    expect(second.style.getPropertyValue("anchor-name")).toBe(anchor);
    expect(first.style.getPropertyValue("anchor-name")).toBe("");
  });

  it("collapses the last trigger when another one opens it again before the browser says it closed", async () => {
    const user = userEvent.setup();
    const [first, second] = twoTriggers();
    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "true");

    deferToggle = true;
    popover().hidePopover();
    first.click();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");
    expect(second.style.getPropertyValue("anchor-name")).toBe("");

    // The last trigger no longer listens: its Escape is left to the browser, which closes the
    // popover as it would from anywhere else on the page.
    const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    second.dispatchEvent(escape);
    expect(escape.defaultPrevented).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "false");
  });

  it("collapses its trigger when it unmounts while it's open", async () => {
    const user = userEvent.setup();
    const shownPopover = ref(true);
    render({
      render: () => [
        button("Filters", { popovertarget: "filters" }),
        shownPopover.value ? h(Popover, { id: "filters", title: "Filters" }, () => field("open-only", "Open issues only")) : null,
      ],
    });
    await openFrom(user);
    const el = popover();
    expect(screen.getByRole("button", { name: "Filters" })).toHaveAttribute("aria-expanded", "true");

    shownPopover.value = false;
    await nextTick();
    expect(shown.has(el)).toBe(false);
    expect(screen.getByRole("button", { name: "Filters" })).toHaveAttribute("aria-expanded", "false");
  });

  it("opens again when your code closes it and opens it again before the browser says it closed", async () => {
    deferToggle = true;
    const open = ref(false);
    render({
      render: () => [
        button("Filters", { popovertarget: "filters" }),
        h(Popover, { id: "filters", title: "Filters", open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () =>
          field("open-only", "Open issues only"),
        ),
      ],
    });

    open.value = true;
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-state", "open"));
    // Closed, then opened again, before the `toggle` for the close arrives.
    open.value = false;
    await nextTick();
    open.value = true;
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(shown.has(popover())).toBe(true);
    expect(popover()).toHaveAttribute("data-state", "open");
    expect(open.value).toBe(true);
  });

  it("closes when your code opens it and closes it again before the browser says it opened", async () => {
    deferToggle = true;
    const open = ref(false);
    render({
      render: () => [
        button("Filters", { popovertarget: "filters" }),
        h(Popover, { id: "filters", title: "Filters", open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () =>
          field("open-only", "Open issues only"),
        ),
      ],
    });

    open.value = true;
    await nextTick();
    open.value = false;
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(shown.has(popover())).toBe(false);
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(open.value).toBe(false);
  });

  it("opens and closes with v-model:open, without firing close, and keeps it in step with its trigger and the browser", async () => {
    const user = userEvent.setup();
    const open = ref(false);
    const onClose = vi.fn();
    render({
      render: () => [
        button("Filters", { popovertarget: "filters" }),
        h(Popover, { id: "filters", title: "Filters", open: open.value, "onUpdate:open": (value: boolean) => (open.value = value), onClose }, () =>
          field("open-only", "Open issues only"),
        ),
        h("a", { href: "#issues" }, "Issues"),
      ],
    });

    open.value = true;
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-state", "open"));
    expect(screen.getByRole("textbox")).toHaveFocus();
    open.value = false;
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-state", "closed"));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Filters" })).toHaveFocus();

    // Its trigger opens it, and a press outside closes it, and `open` follows both.
    await openFrom(user);
    expect(open.value).toBe(true);
    await user.click(screen.getByRole("link", { name: "Issues" }));
    expect(open.value).toBe(false);
    expect(onClose.mock.calls).toEqual([["outside"]]);
  });

  it("opens on mount when open is true", async () => {
    render(Popover, { props: { id: "filters", title: "Filters", open: true } });
    await nextTick();
    expect(popover()).toHaveAttribute("data-state", "open");
  });

  it("names its close button Close, or its closeLabel", async () => {
    const user = userEvent.setup();
    const { onClose } = page({ closeLabel: "Fermer" });
    await openFrom(user);

    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalledWith("close-button");
  });

  it("puts attributes, classes and listeners on the popover", async () => {
    const user = userEvent.setup();
    const onKeyup = vi.fn();
    page({ class: "wide", "data-testid": "filters", onKeyup });

    await openFrom(user);
    await user.keyboard("a");
    expect(popover()).toHaveClass("popover", "wide");
    expect(popover()).toHaveAttribute("data-testid", "filters");
    expect(onKeyup).toHaveBeenCalled();
  });

  it("mirrors its placement and state as data attributes, and marks its parts", () => {
    const { container } = render(Popover, {
      props: { id: "filters", title: "Filters", placement: "end" },
      slots: { default: () => "Content" },
    });

    const el = container.querySelector(".popover")!;
    expect(el).toHaveAttribute("data-placement", "end");
    expect(el).toHaveAttribute("data-state", "closed");
    expect(el).not.toHaveAttribute("data-side");
    const fallback = render(Popover, { props: { id: "hint", title: "Hint" } });
    expect(fallback.container.querySelector(".popover")).toHaveAttribute("data-placement", "bottom");
    // The close button is a Button, with parts of its own.
    const parts = [...el.querySelectorAll("[data-slot]")]
      .filter((part) => !part.parentElement?.closest('[data-slot="close"]'))
      .map((part) => part.getAttribute("data-slot"));
    expect(parts).toEqual(["header", "title", "close", "body"]);
  });

  it("renders the same markup every time, with IDs from its own, and keeps its elements as it opens", async () => {
    const options = { props: { id: "filters", title: "Filters" }, slots: { default: () => "Content" } };
    const first = render(Popover, options).container.innerHTML;
    const { container, rerender } = render(Popover, options);
    // The anchor's name is generated once it mounts, so it's left out of the comparison.
    const strip = (html: string) => html.replace(/ style="[^"]*"/g, "");
    expect(strip(container.innerHTML)).toBe(strip(first));
    expect(first).not.toMatch(/id="(?!filters)/);

    const el = container.querySelector<HTMLElement>(".popover")!;
    const title = el.querySelector('[data-slot="title"]');
    await rerender({ open: true });
    await nextTick();
    expect(el).toHaveAttribute("data-state", "open");
    expect(container.querySelector(".popover")).toBe(el);
    expect(el.querySelector('[data-slot="title"]')).toBe(title);
  });

  it("draws an arrow when asked, hidden from assistive technologies, and sets data-side once it opens", async () => {
    const user = userEvent.setup();
    page({ arrow: true });
    const arrow = popover().querySelector('[data-slot="arrow"]');
    expect(arrow).toHaveAttribute("aria-hidden", "true");
    expect(arrow).toBeEmptyDOMElement();
    // jsdom has no layout, so the boxes are given: the popover below its trigger.
    screen.getByRole("button", { name: "Filters" }).getBoundingClientRect = () => new DOMRect(0, 100, 100, 30);
    popover().getBoundingClientRect = () => new DOMRect(0, 140, 200, 120);

    // Its size, corners and arrow, which jsdom computes from these.
    popover().style.width = "200px";
    popover().style.height = "120px";
    popover().style.borderTopLeftRadius = "8px";
    (arrow as HTMLElement).style.width = "12px";

    await openFrom(user);
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-side", "bottom"));
    // Across from the trigger's centre, 50px in from the popover's left edge.
    expect((arrow as HTMLElement).style.left).toBe("50px");

    // Flipped above a trigger near the left edge, as close to its centre as the corner allows:
    // the radius and half the arrow's diagonal, 8 + 12 / √2.
    screen.getByRole("button", { name: "Filters" }).getBoundingClientRect = () => new DOMRect(0, 300, 10, 30);
    popover().getBoundingClientRect = () => new DOMRect(0, 170, 200, 120);
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-side", "top"));
    expect(parseFloat((arrow as HTMLElement).style.left)).toBeCloseTo(8 + 12 / Math.SQRT2);
  });

  it("anchors to its trigger, and places start on the right in right-to-left text without anchor positioning", async () => {
    const user = userEvent.setup();
    // Like a browser without CSS anchor positioning, where the script places it.
    const supports = vi.spyOn(CSS, "supports").mockReturnValue(false);
    page({ placement: "start" });
    const trigger = screen.getByRole("button", { name: "Filters" });
    // A 200 × 100 popover, beside a trigger in the middle of a 1000 × 800 viewport.
    trigger.getBoundingClientRect = () => new DOMRect(400, 300, 100, 30);
    trigger.style.direction = "rtl";
    popover().style.width = "200px";
    popover().style.height = "100px";
    Object.defineProperties(document.documentElement, { clientWidth: { value: 1000, configurable: true }, clientHeight: { value: 800, configurable: true } });

    await openFrom(user);
    await nextTick();
    const anchor = trigger.style.getPropertyValue("anchor-name");
    expect(anchor).toMatch(/^--popover-/);
    expect(popover().style.getPropertyValue("position-anchor")).toBe(anchor);
    // Its start is the trigger's right in right-to-left text: past its right edge, at 500.
    expect(parseFloat(popover().style.left)).toBe(500);
    Reflect.deleteProperty(document.documentElement, "clientWidth");
    Reflect.deleteProperty(document.documentElement, "clientHeight");
    supports.mockRestore();
  });

  it("places end on the left in right-to-left text, and flips bottom above a trigger near the bottom, without anchor positioning", async () => {
    const user = userEvent.setup();
    const supports = vi.spyOn(CSS, "supports").mockReturnValue(false);
    Object.defineProperties(document.documentElement, { clientWidth: { value: 1000, configurable: true }, clientHeight: { value: 800, configurable: true } });
    const { unmount } = page({ placement: "end" });
    const trigger = () => screen.getByRole("button", { name: "Filters" });
    const size = () => {
      popover().style.width = "200px";
      popover().style.height = "100px";
    };
    trigger().getBoundingClientRect = () => new DOMRect(400, 300, 100, 30);
    trigger().style.direction = "rtl";
    size();

    await openFrom(user);
    await nextTick();
    // Its end is the trigger's left: 200px wide, before its left edge at 400.
    expect(parseFloat(popover().style.left)).toBe(200);
    unmount();

    page();
    // 30px from the bottom of an 800px viewport, so 100px doesn't fit below.
    trigger().getBoundingClientRect = () => new DOMRect(400, 740, 100, 30);
    size();
    await openFrom(user);
    await nextTick();
    expect(parseFloat(popover().style.top)).toBe(640);
    Reflect.deleteProperty(document.documentElement, "clientWidth");
    Reflect.deleteProperty(document.documentElement, "clientHeight");
    supports.mockRestore();
  });

  it("opens below a start or end trigger with room on neither side, without anchor positioning", async () => {
    const user = userEvent.setup();
    const supports = vi.spyOn(CSS, "supports").mockReturnValue(false);
    // A phone 390px wide, with the trigger in the middle, and a 300px wide popover.
    Object.defineProperties(document.documentElement, { clientWidth: { value: 390, configurable: true }, clientHeight: { value: 844, configurable: true } });
    page({ placement: "start" });
    screen.getByRole("button", { name: "Filters" }).getBoundingClientRect = () => new DOMRect(160, 300, 70, 36);
    popover().style.width = "300px";
    popover().style.height = "100px";

    await openFrom(user);
    await nextTick();
    expect(parseFloat(popover().style.top)).toBe(336);
    Reflect.deleteProperty(document.documentElement, "clientWidth");
    Reflect.deleteProperty(document.documentElement, "clientHeight");
    supports.mockRestore();
  });

  it("warns in development when it has no title", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Popover, { props: { id: "untitled", title: "" } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no title"), expect.anything());

    warn.mockClear();
    render(Popover, { props: { id: "filters", title: "Filters" } });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
```
:::
::

## FAQ

#### Popover or something else?

A popover is one of a few things that open on top of the page, and each one suits a different job:

| When you need to…                                                    | Use                                     |
| -------------------------------------------------------------------- | --------------------------------------- |
| Name an icon-only button, or add a hint, on hover and focus          | Tooltip                                 |
| Show a few options, a short form or a hint with a link, next to its button | Popover                           |
| Show a hint people need on a touch screen too                        | Popover, as a toggletip                 |
| Offer a few actions behind one button                                | Dropdown Menu                           |
| Suggest values as people type                                        | Combobox                                |
| Ask a question people answer before they go on                       | Dialog                                  |

The Dropdown Menu and the Combobox are on our [Roadmap](/docs/getting-started/roadmap). They'll open, flip and close the way the Popover does, with what's inside them their own.

::accordion
:::accordion-item{label="Why does the Popover close itself, when the Dialog asks first?"}
Because the browser closes it first. With `popover="auto"`, a press outside and `Escape` close it before any script hears about them, which is what makes light dismiss work before your JavaScript loads. So `close` says what already happened, with why, and `open` follows on its own. Keep what people could lose out of a popover, or put it in a Dialog, which can ask them first.
:::

:::accordion-item{label="Can a popover open another popover?"}
Yes. A popover opened from a button inside another one keeps the first one open, since the browser knows it belongs to it, and `Escape` closes the inner one first. Opening any other popover closes both. More than two deep gets hard to follow, so try to keep to that.
:::

:::accordion-item{label="Does the Popover work before JavaScript loads?"}
Mostly. A button with `popovertarget` opens and closes it, and the browser closes it on `Escape` and on a press outside, all in plain HTML, and the browser gives the button an expanded state in the accessibility tree ([HTML-AAM](https://www.w3.org/TR/html-aam-1.0/)). What waits for the script is the trigger's `aria-expanded`, and so its Expanded look, moving focus in, unless a control in it has `autofocus`, the close button, placing it without CSS anchor positioning and `Escape` stopping at a popover inside a Dialog.
:::

:::accordion-item{label="Why isn't the title a heading?"}
A popover sits among the page's own content, right after its trigger, so an `<h2>` in it would land in the middle of the page's outline wherever you use it, at a level that's often wrong. Its title names it all the same, and that name is what screen readers announce as focus moves in. If your popover holds sections of its own, give them headings at the level that fits where it is.
:::

:::accordion-item{label="Why not aria-controls on the trigger?"}
`popovertarget` already links the trigger to its popover, and gives it its expanded state. Browsers also expose it as a details relation when the popover isn't right after its trigger ([HTML-AAM](https://www.w3.org/TR/html-aam-1.0/)). `aria-controls` adds little on top, since most screen readers don't announce it, but it does no harm if your design system sets it on every popup.
:::

:::accordion-item{label="Which browsers support the popover attribute and anchor positioning?"}
The Popover API is in Chrome and Edge 114, Firefox 125 and Safari 17. CSS anchor positioning, with `position-area` and `position-try-fallbacks`, is in Chrome and Edge 129, Firefox 147 and Safari 26, according to MDN's browser compatibility data, and the reference implementation places the popover with a script where it isn't. `ToggleEvent.source`, which says which button opened it, has been in every browser since 2026, and the Popover looks for its trigger with `popovertarget` where it isn't.
:::
::

## Sources

- [HTML Standard: the popover attribute](https://html.spec.whatwg.org/multipage/popover.html), for `popover="auto"`, `popovertarget`, light dismiss, the focusing steps and giving focus back
- [HTML Standard: close requests](https://html.spec.whatwg.org/multipage/interaction.html#close-requests-and-close-watchers), for a cancelled `Escape` that closes nothing
- [HTML Accessibility API Mappings](https://www.w3.org/TR/html-aam-1.0/), for the expanded state `popovertarget` gives a button, the details relation and the `group` role of a popover without one
- [WAI-ARIA 1.2: dialog](https://www.w3.org/TR/wai-aria-1.2/#dialog) and [aria-haspopup](https://www.w3.org/TR/wai-aria-1.2/#aria-haspopup), for a non-modal dialog and its trigger
- [WAI-ARIA Authoring Practices: Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), for a button that shows and hides content with `aria-expanded`
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 2.4.3: Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), for moving focus in and back out
- [Understanding SC 2.4.11: Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), for content people opened, which they can put away with `Escape`
- [Understanding SC 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), for fitting a 320px screen
- [CSS Anchor Positioning](https://www.w3.org/TR/css-anchor-position-1/), for `anchor-name`, `position-area` and `position-try-fallbacks`
- MDN's browser compatibility data for the [`popover` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover) (Chrome and Edge 114, Firefox 125, Safari 17), [`position-area`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-area) (Chrome and Edge 129, Firefox 147, Safari 26) and [`ToggleEvent.source`](https://developer.mozilla.org/en-US/docs/Web/API/ToggleEvent/source) (Baseline 2026)
- [Manuel Matuzović: aria-haspopup and screen readers](https://matuzo.at/blog/2023/aria-haspopup), for what each screen reader says on a trigger with `aria-haspopup="dialog"`
- [Inclusive Components: Tooltips & Toggletips](https://inclusive-components.design/tooltips-toggletips/), for toggletips
- [Radix Primitives: Popover](https://www.radix-ui.com/primitives/docs/components/popover) and [Base UI: Popover](https://base-ui.com/react/components/popover), for opening below the trigger by default, and the reasons a popover closes
