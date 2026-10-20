---
title: Tooltip
description: How to build a tooltip that shows a short hint on hover and keyboard focus, that people can reach, read and dismiss, and that agents can check.
navigation:
  icon: i-lucide-message-square-text
---

Tooltips show a short hint next to the element it's about, like the name of an icon-only button or what an action will do, when people hover or focus it. They're small, and they're everywhere, which is why they so often get in the way. Think of a tooltip that only opens for a mouse, so keyboard users never see it, one that vanishes as you move the pointer towards it to read it, or one with a link inside that nobody can ever click.

This page walks you through building one the right way. We'll look at:
- **User Interface** (UI) - how a tooltip looks and where it opens
- **User Experience** (UX) - how it behaves for every person and every input
- **Developer Experience** (DX) - how developers work with it
- **Agentic Experience** (AX) - how agents can read and verify it

Every example on this page runs on our [reference implementation](/docs/components/tooltip#reference-implementation), which does its part of every rule in the [checklist](/docs/components/tooltip#checklist), so hover or tab to the examples as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Tooltip with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/tooltip#deterministic).

The Tooltip is one of the overlays on our [Roadmap](/docs/getting-started/roadmap), the components that sit on top of the page. The rules it settles for opening in the top layer and closing with `Escape` are the ones the [Popover](/docs/components/popover) and the [Dialog](/docs/components/dialog) follow too, and the Dropdown Menu will.

::tooltip-playground
::

## At a glance

| Aspect   | Tooltip                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------- |
| Element  | A `<span popover="manual">`, rendered right after its trigger                                   |
| Role     | `tooltip` with `type="description"`. With `type="label"`, none, since it's hidden with `aria-hidden` |
| Name     | None of its own. Its text describes the trigger, or shows the name the trigger already has      |
| Keyboard | Opens when its trigger gets focus, and `Escape` closes it, with focus staying where it was      |
| Pointer  | Opens after the pointer rests on its trigger for 500ms, and stays open while the pointer is on it |
| Touch    | Never opens, so what it says is always somewhere else too                                       |
| States   | Closed and open, as `data-state`                                                                |
| Pattern  | [Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) in the APG                         |
| WCAG 2.2 | 1.4.3, 1.4.4, 1.4.10, 1.4.13, 2.1.1, 2.3.3 and 4.1.2                                            |

## User Interface (UI)

Let's start with how a tooltip looks: its parts, the two jobs it can do, where it opens, its states and the variables you can set.

### Anatomy

::tooltip-anatomy
1. **Trigger** — The element the tooltip is about, like a Button. It's yours, it takes focus and it keeps its own name.
2. **Tooltip** — A `<span>` that holds the text, on a filled box with rounded corners, in the top layer while it's open.
3. **Offset** — The gap between the trigger and the tooltip, which the pointer can cross without closing it.
4. **Arrow** — On by default. A small point on the edge that faces the trigger, in the tooltip's fill, hidden from assistive technologies.
::

Every tooltip has all four parts, unless you turn the arrow off. The tooltip holds plain text only, so there's never anything in it to focus or click (see [Keep it short and plain](/docs/components/tooltip#keep-it-short-and-plain)). We recommend a small, filled box in the neutral colour, which stands apart from the page in light and dark themes alike. The tooltip always renders right after its trigger, which you can see in the [DOM contract](/docs/components/tooltip#deterministic).

### Label and description

A tooltip can do one of two jobs, and the `type` prop says which, so screen readers hear the right thing:

- `type="label"` shows the name the trigger already has. It's for icon-only buttons, whose visually hidden label names them. Screen readers already read that name, so the tooltip is hidden from them, and they don't hear it twice.
- `type="description"`, the default, adds a hint to a trigger that has a name of its own. The trigger points to the tooltip with `aria-describedby`, so screen readers read the hint after the name, as in "Archive, button, Archived projects stay in search".

Here's a row of formatting buttons, each one icon-only, with a tooltip that shows its label. Hover over one, then move along the row, and the next tooltip opens without the wait:

::tooltip-label-example
::framework-switcher
#react
```tsx
const actions = [
  { label: "Bold", icon: <BoldIcon /> },
  { label: "Italic", icon: <ItalicIcon /> },
  { label: "Underline", icon: <UnderlineIcon /> },
  { label: "Strikethrough", icon: <StrikethroughIcon /> },
];

export function Formatting() {
  return actions.map(({ label, icon }) => (
    <Tooltip key={label} label={label} type="label">
      {(trigger) => <Button {...trigger} label={label} variant="ghost" iconOnly leading={icon} />}
    </Tooltip>
  ));
}
```

#vue
```vue
<script setup lang="ts">
const actions = [
  { label: "Bold", icon: BoldIcon },
  { label: "Italic", icon: ItalicIcon },
  { label: "Underline", icon: UnderlineIcon },
  { label: "Strikethrough", icon: StrikethroughIcon },
];
</script>

<template>
  <Tooltip v-for="action in actions" :key="action.label" :label="action.label" type="label" v-slot="{ trigger }">
    <Button v-bind="trigger" :label="action.label" variant="ghost" icon-only>
      <template #leading><component :is="action.icon" /></template>
    </Button>
  </Tooltip>
</template>
```

#svelte
```svelte
<script lang="ts">
  const actions = [
    { label: "Bold", icon: BoldIcon },
    { label: "Italic", icon: ItalicIcon },
    { label: "Underline", icon: UnderlineIcon },
    { label: "Strikethrough", icon: StrikethroughIcon },
  ];
</script>

{#each actions as action (action.label)}
  <Tooltip label={action.label} type="label">
    {#snippet children(trigger)}
      <Button {...trigger} label={action.label} variant="ghost" iconOnly>
        {#snippet leading()}<action.icon />{/snippet}
      </Button>
    {/snippet}
  </Tooltip>
{/each}
```

#angular
```angular-ts
@Component({
  selector: "app-formatting",
  imports: [Button, Tooltip, LucideAngularModule],
  template: `
    @for (action of actions; track action.label) {
      <button appButton [label]="action.label" variant="ghost" iconOnly [appTooltip]="action.label" tooltipType="label">
        <lucide-icon leading [img]="action.icon" />
      </button>
    }
  `,
})
export class Formatting {
  actions = [
    { label: "Bold", icon: BoldIcon },
    { label: "Italic", icon: ItalicIcon },
    { label: "Underline", icon: UnderlineIcon },
    { label: "Strikethrough", icon: StrikethroughIcon },
  ];
}
```

#solid
```tsx
import { For } from "solid-js";

const actions = [
  { label: "Bold", icon: () => <BoldIcon /> },
  { label: "Italic", icon: () => <ItalicIcon /> },
  { label: "Underline", icon: () => <UnderlineIcon /> },
  { label: "Strikethrough", icon: () => <StrikethroughIcon /> },
];

export function Formatting() {
  return (
    <For each={actions}>
      {({ label, icon }) => (
        <Tooltip label={label} type="label">
          {(trigger) => <Button {...trigger} label={label} variant="ghost" iconOnly leading={icon()} />}
        </Tooltip>
      )}
    </For>
  );
}
```

#astro
```astro
---
const actions = [
  { label: "Bold", icon: BoldIcon },
  { label: "Italic", icon: ItalicIcon },
  { label: "Underline", icon: UnderlineIcon },
  { label: "Strikethrough", icon: StrikethroughIcon },
];
---

{actions.map(({ label, icon: Icon }) => (
  <Tooltip label={label} type="label">
    <Button label={label} variant="ghost" iconOnly>
      <Icon slot="leading" />
    </Button>
  </Tooltip>
))}
```

#vanilla
```html [Formatting.html]
<link rel="stylesheet" href="/styles/tooltip.css" />

<button class="button" type="button" data-variant="ghost" data-color="neutral" data-size="md" data-icon-only>
  <span data-slot="leading" aria-hidden="true"><svg class="lucide-bold">…</svg></span>
  <span data-slot="label">Bold</span>
</button>
<span class="tooltip" aria-hidden="true" popover="manual" data-state="closed" data-placement="top">Bold<span data-slot="arrow" aria-hidden="true"></span></span>
<!-- Italic, Underline and Strikethrough follow the same way. -->

<script type="module" src="/scripts/tooltip.js"></script>
```
```js [tooltip.js]
// Wires every .tooltip to the element right before it, its trigger, the way the
// reference implementation does. The markup already links a description with
// aria-describedby, so this only adds the behaviour.
const SKIP_DELAY = 300; // after one closes, the next skips the delay this long
const GRACE = 150; // after the pointer leaves, so it can move onto the tooltip
let closeOpen; // only one is open at a time
let warm = false;
let cooling;
let count = 0;

// CSS anchor positioning places it, where the browser has it. Elsewhere, place() does.
const anchored = CSS.supports("position-area: top");

for (const tooltip of document.querySelectorAll(".tooltip")) {
  const trigger = tooltip.previousElementSibling;
  if (!trigger) continue;
  const arrow = tooltip.querySelector('[data-slot="arrow"]');
  const delay = Number(tooltip.dataset.delay ?? 500);
  // Generated, since an id can hold characters a CSS name can't, like "1:2".
  const anchorName = `--tooltip-${++count}`;
  trigger.style.setProperty("anchor-name", anchorName);
  tooltip.style.setProperty("position-anchor", anchorName);

  let hovered = false;
  let focused = false;
  let touched = false;
  let opening;
  let closing;
  let frame;

  function show() {
    clearTimeout(opening);
    clearTimeout(closing);
    if (tooltip.dataset.state === "open") return;
    closeOpen?.();
    closeOpen = hide;
    tooltip.dataset.state = "open";
    // The top layer, so no overflow or z-index around the trigger can clip or cover it.
    tooltip.showPopover?.();
    // In the capture phase, so it runs before a dialog's own Escape handler.
    document.addEventListener("keydown", onKeydown, true);
    update();
    if (!anchored) {
      addEventListener("scroll", update, { capture: true, passive: true });
      addEventListener("resize", update);
    }
    // The arrow follows it on every frame while it's open: the browser moves an anchored
    // tooltip after a scroll handler runs, and a flip can move it with no scroll at all.
    if (arrow) follow();
  }

  function follow() {
    aim();
    frame = requestAnimationFrame(follow);
  }

  function hide() {
    clearTimeout(opening);
    clearTimeout(closing);
    if (tooltip.dataset.state === "closed") return;
    tooltip.dataset.state = "closed";
    tooltip.hidePopover?.();
    document.removeEventListener("keydown", onKeydown, true);
    removeEventListener("scroll", update, { capture: true });
    removeEventListener("resize", update);
    cancelAnimationFrame(frame);
    if (closeOpen === hide) {
      closeOpen = undefined;
      warm = true;
      clearTimeout(cooling);
      cooling = setTimeout(() => (warm = false), SKIP_DELAY);
    }
  }

  function closeSoon() {
    clearTimeout(closing);
    closing = setTimeout(() => {
      if (!hovered && !focused) hide();
    }, GRACE);
  }

  // Escape closes the tooltip and goes no further, so a dialog around it stays open.
  function onKeydown(event) {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    event.preventDefault();
    hide();
  }

  // A tap doesn't always focus the trigger, so the next key press forgets it.
  const untouch = () => (touched = false);

  trigger.addEventListener("pointerenter", (event) => {
    // A tap never opens it: touch screens have no hover, and nothing would close it.
    if (event.pointerType === "touch") return;
    hovered = true;
    clearTimeout(closing);
    if (tooltip.dataset.state === "open") return;
    if (closeOpen || warm) return show();
    clearTimeout(opening);
    opening = setTimeout(show, delay);
  });
  trigger.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") return;
    hovered = false;
    clearTimeout(opening);
    closeSoon();
  });
  trigger.addEventListener("pointerdown", (event) => {
    touched = event.pointerType === "touch";
    if (touched) document.addEventListener("keydown", untouch, { capture: true, once: true });
  });
  trigger.addEventListener("focus", () => {
    focused = true;
    // A tap focuses the trigger too, which shouldn't open it any more than the tap does.
    if (!touched) show();
  });
  trigger.addEventListener("blur", () => {
    focused = false;
    touched = false;
    if (!hovered) hide();
  });
  tooltip.addEventListener("pointerenter", () => {
    hovered = true;
    clearTimeout(closing);
  });
  tooltip.addEventListener("pointerleave", () => {
    hovered = false;
    closeSoon();
  });

  function update() {
    if (!anchored) place();
    if (arrow) aim();
  }

  // Without anchor positioning: the chosen side, or the other one when it doesn't fit,
  // centred on the trigger and kept inside the viewport.
  function place() {
    const gap = parseFloat(getComputedStyle(tooltip).marginTop) || 0;
    const a = trigger.getBoundingClientRect();
    // Its exact size, without the scale it grows in from, which getBoundingClientRect() would include.
    const width = parseFloat(getComputedStyle(tooltip).width);
    const height = parseFloat(getComputedStyle(tooltip).height);
    const { clientWidth, clientHeight } = document.documentElement;
    const rtl = getComputedStyle(trigger).direction === "rtl";
    const sides = { top: "top", bottom: "bottom", start: rtl ? "right" : "left", end: rtl ? "left" : "right" };
    const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" };
    const fits = {
      top: a.top - gap - height >= 0,
      bottom: a.bottom + gap + height <= clientHeight,
      left: a.left - gap - width >= 0,
      right: a.right + gap + width <= clientWidth,
    };
    let side = sides[tooltip.dataset.placement ?? "top"];
    if (!fits[side] && fits[opposite[side]]) side = opposite[side];
    const across = side === "top" || side === "bottom";
    const x = across ? a.left + (a.width - width) / 2 : side === "left" ? a.left - gap - width : a.right + gap;
    const y = across ? (side === "top" ? a.top - gap - height : a.bottom + gap) : a.top + (a.height - height) / 2;
    tooltip.style.left = `${Math.max(0, Math.min(x, clientWidth - width)) - gap}px`;
    tooltip.style.top = `${Math.max(0, Math.min(y, clientHeight - height)) - gap}px`;
  }

  // With an arrow: the side it opened on, from where its centre is, and the arrow across from
  // the trigger's centre, or as close as the rounded corners allow.
  function aim() {
    const a = trigger.getBoundingClientRect();
    const t = tooltip.getBoundingClientRect();
    const x = t.left + t.width / 2;
    const y = t.top + t.height / 2;
    const side = y < a.top ? "top" : y > a.bottom ? "bottom" : x < a.left ? "left" : "right";
    tooltip.dataset.side = side;
    const across = side === "top" || side === "bottom";
    const box = getComputedStyle(tooltip);
    const length = parseFloat(across ? box.width : box.height);
    const centre = across ? a.left + a.width / 2 - (x - length / 2) : a.top + a.height / 2 - (y - length / 2);
    // A corner's radius and half the arrow's diagonal from each end, so none of it overlaps the curve.
    const clear = parseFloat(box.borderTopLeftRadius) + parseFloat(getComputedStyle(arrow).width) / Math.SQRT2;
    const at = clear * 2 < length ? Math.max(clear, Math.min(centre, length - clear)) : length / 2;
    // Its left and top start inside the border.
    arrow.style.left = across ? `${at - tooltip.clientLeft}px` : "";
    arrow.style.top = across ? "" : `${at - tooltip.clientTop}px`;
  }
}
```
::
::

The Button's own [label](/docs/components/button#icons) is what names each button, and the tooltip only shows it, so screen readers, voice control and agents all find "Bold" whether the tooltip is open or not. That's also why `label` is the right type here: with `description`, screen readers would read "Bold, button, Bold".

A description adds something the name doesn't say, like what an action does to your data:

::tooltip-description-example
::framework-switcher
#react
```tsx
<Tooltip label="Archived projects stay in search">
  {(trigger) => (
    <Button {...trigger} variant="outline" leading={<ArchiveIcon />}>
      Archive
    </Button>
  )}
</Tooltip>
```

#vue
```vue
<Tooltip label="Archived projects stay in search" v-slot="{ trigger }">
  <Button v-bind="trigger" variant="outline">
    <template #leading><ArchiveIcon /></template>
    Archive
  </Button>
</Tooltip>
```

#svelte
```svelte
<Tooltip label="Archived projects stay in search">
  {#snippet children(trigger)}
    <Button {...trigger} variant="outline">
      {#snippet leading()}<ArchiveIcon />{/snippet}
      Archive
    </Button>
  {/snippet}
</Tooltip>
```

#angular
```angular-html
<button appButton variant="outline" appTooltip="Archived projects stay in search">
  <lucide-icon leading [img]="ArchiveIcon" />
  Archive
</button>
```

#solid
```tsx
<Tooltip label="Archived projects stay in search">
  {(trigger) => (
    <Button {...trigger} variant="outline" leading={<ArchiveIcon />}>
      Archive
    </Button>
  )}
</Tooltip>
```

#astro
```astro
<Tooltip label="Archived projects stay in search">
  <Button variant="outline">
    <ArchiveIcon slot="leading" />
    Archive
  </Button>
</Tooltip>
```

#vanilla
```html
<button class="button" type="button" aria-describedby="archive-tooltip" data-variant="outline" data-color="neutral" data-size="md">
  <span data-slot="leading" aria-hidden="true"><svg class="lucide-archive">…</svg></span>
  <span data-slot="label">Archive</span>
</button>
<span class="tooltip" id="archive-tooltip" role="tooltip" popover="manual" data-state="closed" data-placement="top">
  Archived projects stay in search<span data-slot="arrow" aria-hidden="true"></span>
</span>

<!-- tooltip.js, written out under Label and description. -->
<script type="module" src="/scripts/tooltip.js"></script>
```
::
::

We made `description` the default because it's the one that fails safe. If a trigger has no name of its own, a description still gets read, while a label would leave the trigger silent. Keep in mind that a description is extra: the button has to make sense without it, since touch screen users never see it (see [Touch screens](/docs/components/tooltip#touch-screens)).

### Placement

The `placement` prop says which side of its trigger the tooltip opens on, and `top` is the default. `start` and `end` follow the reading direction, so `start` is on the left in English and on the right in Arabic. When there isn't room on that side, like for a button at the top of the window, the tooltip flips to the other side, and it always stays inside the viewport.

Every tooltip has an arrow by default. It sits on the edge that faces the trigger and points at the trigger's centre, or as close as the rounded corners allow, and it moves to the other edge when the tooltip flips, since an arrow on the far edge would point away from what the tooltip is about. We draw it by default because it shows at a glance which trigger a tooltip belongs to, which is what people get wrong when several triggers sit close together, like the icons of a toolbar ([Nielsen Norman Group](https://www.nngroup.com/articles/tooltip-guidelines/)). Where only one trigger could be meant, you can turn it off by setting `arrow` to `false`.

::tooltip-placement-example
::framework-switcher
#react
```tsx
<Tooltip label="Opens above the button">
  {(trigger) => <Button {...trigger} variant="outline">Top</Button>}
</Tooltip>
<Tooltip label="Opens below the button" placement="bottom">
  {(trigger) => <Button {...trigger} variant="outline">Bottom</Button>}
</Tooltip>
<Tooltip label="Opens before the button" placement="start">
  {(trigger) => <Button {...trigger} variant="outline">Start</Button>}
</Tooltip>
<Tooltip label="Opens after the button" placement="end">
  {(trigger) => <Button {...trigger} variant="outline">End</Button>}
</Tooltip>
```

#vue
```vue
<Tooltip label="Opens above the button" v-slot="{ trigger }">
  <Button v-bind="trigger" variant="outline">Top</Button>
</Tooltip>
<Tooltip label="Opens below the button" placement="bottom" v-slot="{ trigger }">
  <Button v-bind="trigger" variant="outline">Bottom</Button>
</Tooltip>
<Tooltip label="Opens before the button" placement="start" v-slot="{ trigger }">
  <Button v-bind="trigger" variant="outline">Start</Button>
</Tooltip>
<Tooltip label="Opens after the button" placement="end" v-slot="{ trigger }">
  <Button v-bind="trigger" variant="outline">End</Button>
</Tooltip>
```

#svelte
```svelte
<Tooltip label="Opens above the button">
  {#snippet children(trigger)}<Button {...trigger} variant="outline">Top</Button>{/snippet}
</Tooltip>
<Tooltip label="Opens below the button" placement="bottom">
  {#snippet children(trigger)}<Button {...trigger} variant="outline">Bottom</Button>{/snippet}
</Tooltip>
<Tooltip label="Opens before the button" placement="start">
  {#snippet children(trigger)}<Button {...trigger} variant="outline">Start</Button>{/snippet}
</Tooltip>
<Tooltip label="Opens after the button" placement="end">
  {#snippet children(trigger)}<Button {...trigger} variant="outline">End</Button>{/snippet}
</Tooltip>
```

#angular
```angular-html
<button appButton variant="outline" appTooltip="Opens above the button">Top</button>
<button appButton variant="outline" appTooltip="Opens below the button" tooltipPlacement="bottom">Bottom</button>
<button appButton variant="outline" appTooltip="Opens before the button" tooltipPlacement="start">Start</button>
<button appButton variant="outline" appTooltip="Opens after the button" tooltipPlacement="end">End</button>
```

#solid
```tsx
<Tooltip label="Opens above the button">
  {(trigger) => <Button {...trigger} variant="outline">Top</Button>}
</Tooltip>
<Tooltip label="Opens below the button" placement="bottom">
  {(trigger) => <Button {...trigger} variant="outline">Bottom</Button>}
</Tooltip>
<Tooltip label="Opens before the button" placement="start">
  {(trigger) => <Button {...trigger} variant="outline">Start</Button>}
</Tooltip>
<Tooltip label="Opens after the button" placement="end">
  {(trigger) => <Button {...trigger} variant="outline">End</Button>}
</Tooltip>
```

#astro
```astro
<Tooltip label="Opens above the button">
  <Button variant="outline">Top</Button>
</Tooltip>
<Tooltip label="Opens below the button" placement="bottom">
  <Button variant="outline">Bottom</Button>
</Tooltip>
<Tooltip label="Opens before the button" placement="start">
  <Button variant="outline">Start</Button>
</Tooltip>
<Tooltip label="Opens after the button" placement="end">
  <Button variant="outline">End</Button>
</Tooltip>
```

#vanilla
```html
<button class="button" type="button" aria-describedby="top-tooltip" data-variant="outline" data-color="neutral" data-size="md">
  <span data-slot="label">Top</span>
</button>
<span class="tooltip" id="top-tooltip" role="tooltip" popover="manual" data-state="closed" data-placement="top">
  Opens above the button<span data-slot="arrow" aria-hidden="true"></span>
</span>
<!-- Bottom, Start and End follow the same way, with data-placement="bottom", "start" and "end". -->

<!-- tooltip.js, written out under Label and description. -->
<script type="module" src="/scripts/tooltip.js"></script>
```
::
::

We recommend `top` for most tooltips, since it's where people look for them and it keeps the hint clear of whatever's below, like the next row of a table. Side placements suit triggers stacked on top of each other, like the icons of a collapsed sidebar, where a tooltip above would cover the one before.

The tooltip opens in the [top layer](https://developer.mozilla.org/en-US/docs/Glossary/Top_layer), with `popover="manual"` and `showPopover()`, above every other element on the page. That way, no `overflow: hidden` or `z-index` around its trigger can clip or cover it, without moving it to the end of the `<body>`.

CSS anchor positioning then places it beside its trigger (`position-area`), and flips it when there's no room (`position-try-fallbacks`). Both work without a library. Browsers that don't have anchor positioning yet get the same placement from a few lines of script, which you'll find in `place()` in the [reference implementation](/docs/components/tooltip#reference-implementation).

### States

A tooltip is either closed or open, and it shows which with `data-state`, so your styles and tests can read it in every browser:

| State   | Selector                | Recommended look                                                              |
| ------- | ----------------------- | ----------------------------------------------------------------------------- |
| Closed  | `[data-state="closed"]` | Hidden, but still in the page, so its trigger's description is always there   |
| Open    | `[data-state="open"]`   | Shown beside its trigger, fading and growing in from 96% over 0.15 seconds    |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` | Fading in over the same 0.15 seconds, without growing |

The tooltip has no hover or focus styles of its own, since it can't be focused, and the pointer resting on it only keeps it open. Its trigger shows its own states, like the Button's focus ring. You'll find when it opens and closes under [Predictable](/docs/components/tooltip#predictable).

### Tokens

The tooltip reads two [theme tokens](/docs/foundations/design-tokens#theme-tokens), which every component shares:

| Token                       | Used for                    |
| --------------------------- | --------------------------- |
| `--color--neutral`          | The fill                    |
| `--color--neutral-contrast` | The text on it              |

It's the same pair as a solid neutral Button, so the two always look like they belong together. With our reference tokens, from the Tailwind CSS palette, the text comes to 17.7:1 on the light theme's fill and 18.1:1 on the dark theme's. If you change the tokens, make sure to check the same pair. You'll find the tokens themselves in the Button's [`tokens.css`](/docs/components/button#reference-implementation), which you can copy into your theme.

If you need to tune a tooltip, you can set its [own variables](/docs/foundations/design-tokens#component-variables) from a class:

| Variable                 | Default                          | What it sets                                                      |
| ------------------------ | -------------------------------- | ----------------------------------------------------------------- |
| `--tooltip--background`  | `var(--color--neutral)`          | The fill                                                          |
| `--tooltip--color`       | `var(--color--neutral-contrast)` | The text                                                          |
| `--tooltip--font-size`   | `0.875rem`                       | The text size, the same as a medium Button's                      |
| `--tooltip--padding`     | `0.375rem 0.625rem`              | The space around the text                                         |
| `--tooltip--radius`      | `0.375rem`                       | The corners                                                       |
| `--tooltip--max-width`   | `32ch`                           | Where long text wraps                                             |
| `--tooltip--offset`      | `0.5rem`                         | The gap between the trigger and the tooltip                       |
| `--tooltip--arrow--size` | `0.5rem`                         | The arrow's width and height, before it's turned, when it has one |

The Tooltip's styles sit in the `components` cascade layer, so your class wins without any specificity tricks. Classes you pass to the Tooltip land on the tooltip itself:

::framework-switcher
#react
```tsx [Shortcut.tsx]
import styles from "./Shortcut.module.css";

export function Shortcut() {
  return (
    <Tooltip label="Opens the command menu, from anywhere in the app" className={styles.wide}>
      {(trigger) => <Button {...trigger} variant="ghost">Commands</Button>}
    </Tooltip>
  );
}
```
```css [Shortcut.module.css]
.wide {
  --tooltip--max-width: 40ch;
}
```

#vue
```vue
<template>
  <Tooltip label="Opens the command menu, from anywhere in the app" class="wide" v-slot="{ trigger }">
    <Button v-bind="trigger" variant="ghost">Commands</Button>
  </Tooltip>
</template>

<style scoped>
/* The class lands on the Tooltip's own element, which this component's scoped styles don't reach. */
:global(.wide) {
  --tooltip--max-width: 40ch;
}
</style>
```

#svelte
```svelte
<Tooltip label="Opens the command menu, from anywhere in the app" class="wide">
  {#snippet children(trigger)}<Button {...trigger} variant="ghost">Commands</Button>{/snippet}
</Tooltip>

<style>
  /* The class lands on the Tooltip's own element, which this component's scoped styles don't reach. */
  :global(.wide) {
    --tooltip--max-width: 40ch;
  }
</style>
```

#angular
```angular-ts
@Component({
  selector: "app-shortcut",
  imports: [Button, Tooltip],
  template: `
    <button appButton variant="ghost" appTooltip="Opens the command menu, from anywhere in the app" tooltipClass="wide">
      Commands
    </button>
  `,
  styles: `
    /* The tooltip renders outside this component's view, so the class needs ::ng-deep to reach it. */
    ::ng-deep .wide {
      --tooltip--max-width: 40ch;
    }
  `,
})
export class Shortcut {}
```

#solid
```tsx [Shortcut.tsx]
import styles from "./Shortcut.module.css";

export function Shortcut() {
  return (
    <Tooltip label="Opens the command menu, from anywhere in the app" class={styles.wide}>
      {(trigger) => <Button {...trigger} variant="ghost">Commands</Button>}
    </Tooltip>
  );
}
```
```css [Shortcut.module.css]
.wide {
  --tooltip--max-width: 40ch;
}
```

#astro
```astro
<Tooltip label="Opens the command menu, from anywhere in the app" class="wide">
  <Button variant="ghost">Commands</Button>
</Tooltip>

<style is:global>
  .wide {
    --tooltip--max-width: 40ch;
  }
</style>
```

#vanilla
```html
<span class="tooltip wide" id="commands-tooltip" role="tooltip" popover="manual" data-state="closed" data-placement="top">
  Opens the command menu, from anywhere in the app<span data-slot="arrow" aria-hidden="true"></span>
</span>

<style>
  .wide {
    --tooltip--max-width: 40ch;
  }
</style>
```
::

## User Experience (UX)

Now let's look at how a tooltip behaves for every person, input and setting. A good tooltip is [accessible](/docs/components/tooltip#accessible), [predictable](/docs/components/tooltip#predictable), designed in [every state](/docs/components/tooltip#every-state) and [adaptive](/docs/components/tooltip#adaptive).

### Accessible

#### Pick the right type

Screen readers never see a tooltip open. They read the trigger, so what matters is how the tooltip's text reaches it:

| Type          | The tooltip                             | The trigger                                      | Screen readers hear              |
| ------------- | --------------------------------------- | ------------------------------------------------ | -------------------------------- |
| `label`       | `aria-hidden="true"`, with no role      | Keeps its own name, like a visually hidden label | "Bold, button"                   |
| `description` | `role="tooltip"`, with an `id`          | Points to it with `aria-describedby`             | "Archive, button, Archived projects stay in search" |

Never point to a tooltip with `aria-labelledby`. It would replace the trigger's own name with the tooltip's text, and an icon-only Button's name comes from its hidden label, as the Button's [`button/accessible-name`](/docs/components/button#ux-rules) rule asks. Hidden text gets translated along with the page, and stays the name when the tooltip's text changes, like a shortcut added to it. With `type="label"`, the Tooltip links nothing at all, and the name stays where it was.

#### Open it on focus

Keyboard users can't hover, so the tooltip opens the moment its trigger gets focus, without the delay a pointer gets ([WCAG 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)). It closes again when focus moves on. That's why the trigger has to be focusable, like a Button or a link. A tooltip on a `<span>` or an icon on its own never opens for the keyboard, and screen readers have no element to read its description with.

#### Let people dismiss it

A tooltip covers part of the page, so people need a way to put it away without moving ([WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)). `Escape` closes it, wherever focus is, and focus stays on the trigger, so keyboard users don't lose their place. A screen magnifier user who's zoomed in can close a tooltip that hides what they were reading, without moving the pointer away from the trigger and losing their spot.

#### Let the pointer reach it

People need to be able to move the pointer onto a tooltip, whether to read it at a larger zoom or because their hand isn't steady ([WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)). When the pointer leaves the trigger, the tooltip waits 150ms before it closes, which is long enough to cross the offset. Once the pointer is on the tooltip, it stays open until the pointer leaves both.

#### Contrast

The text needs a contrast of 4.5:1 against the tooltip's fill ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)). It's small text, so there's no room to go lower, and with our reference tokens it comes to about 18:1. The fill doesn't need a contrast of its own against the page, since the text is what people read, but a fill that stands out, like ours, shows where the hint starts and ends.

### Predictable

#### Wait before opening on hover

A tooltip that opens the moment the pointer touches its trigger flashes up every time someone crosses the page. On hover, ours waits for the pointer to rest on the trigger for 500ms, which is what we recommend, and opens only if it's still there. Focus doesn't wait, since moving focus is always on purpose.

Once one tooltip has opened, people are usually scanning, like along a toolbar. So moving the pointer straight on to the next trigger opens its tooltip at once, and so does any trigger within 300ms of a tooltip closing. [Radix](https://www.radix-ui.com/primitives/docs/components/tooltip), for example, waits 700ms by default, and skips the delay for 300ms.

#### Keep it open while it's needed

The tooltip stays open for as long as its trigger has hover or focus, and never closes on a timer ([WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)). Some people read slowly, and some need to zoom in first. It closes when both the pointer and focus have left, or with `Escape`.

#### One at a time

Opening a tooltip closes any other one that's open. Two tooltips at once would cover twice as much of the page, and it'd be unclear which one goes with what. That includes a tooltip opened by focus and another by the pointer: the newest one wins.

#### Keep Escape for the top layer

When a tooltip is open inside something else that closes with `Escape`, like a Dialog, `Escape` closes the tooltip and goes no further. Otherwise one key press would close both, and people would lose the dialog along with their work in it.

Our Tooltip listens for `Escape` only while it's open, in the capture phase on the `document`, so it comes before a dialog's own handler, and stops it there. It cancels its default action too, so a native `<dialog>` doesn't close either. With no tooltip open, `Escape` reaches the dialog as usual. The [Popover](/docs/components/popover) and the [Dialog](/docs/components/dialog) follow the same rule, and so will the Dropdown Menu on our [Roadmap](/docs/getting-started/roadmap), so `Escape` always closes the layer on top first.

#### Keep it short and plain

A tooltip holds a few words of plain text, like a name or a short hint. It's never the place for instructions, an error message or anything people need to act on.

Nothing in it can be focused or clicked. A link or a button inside a tooltip can't be reached, since focus would have to leave the trigger, which closes the tooltip. If you need either, use a [Popover](/docs/components/popover).

Don't add a `title` attribute to the trigger as well. Browsers draw a tooltip of their own for it, which can't be styled, doesn't open for the keyboard and would show up next to yours.

### Every state

#### Closed

The tooltip is in the page, hidden, from the moment it mounts. A description is read with its trigger whether the tooltip is open or not, so screen reader users hear it as soon as they reach the trigger, without anything having to open.

#### Open

The tooltip is beside its trigger, in the top layer. It stays there while the pointer is on the trigger or on the tooltip, or while the trigger has focus, and it doesn't move once it's open, so people can read it. If the page scrolls, it follows its trigger.

#### Disabled triggers

A native `disabled` button leaves the tab order, so keyboard users can never open its tooltip. When a tooltip says why a button is disabled, give the Button `focusableWhenDisabled`, which sets `aria-disabled` instead, as the Button's [Disabled](/docs/components/button#disabled) state recommends. The button stays in the tab order, its tooltip opens on focus and hover, and the Button still blocks the click.

::tooltip-disabled-example
::framework-switcher
#react
```tsx
<Tooltip label="Add a title to publish">
  {(trigger) => (
    <Button {...trigger} color="primary" disabled focusableWhenDisabled>
      Publish
    </Button>
  )}
</Tooltip>
<p>A title is required</p>
```

#vue
```vue
<Tooltip label="Add a title to publish" v-slot="{ trigger }">
  <Button v-bind="trigger" color="primary" disabled focusable-when-disabled>Publish</Button>
</Tooltip>
<p>A title is required</p>
```

#svelte
```svelte
<Tooltip label="Add a title to publish">
  {#snippet children(trigger)}
    <Button {...trigger} color="primary" disabled focusableWhenDisabled>Publish</Button>
  {/snippet}
</Tooltip>
<p>A title is required</p>
```

#angular
```angular-html
<button appButton color="primary" disabled focusableWhenDisabled appTooltip="Add a title to publish">Publish</button>
<p>A title is required</p>
```

#solid
```tsx
<Tooltip label="Add a title to publish">
  {(trigger) => (
    <Button {...trigger} color="primary" disabled focusableWhenDisabled>
      Publish
    </Button>
  )}
</Tooltip>
<p>A title is required</p>
```

#astro
```astro
<Tooltip label="Add a title to publish">
  <Button color="primary" disabled focusableWhenDisabled>Publish</Button>
</Tooltip>
<p>A title is required</p>
```

#vanilla
```html
<button class="button" type="button" aria-disabled="true" aria-describedby="publish-tooltip" data-variant="solid" data-color="primary" data-size="md">
  <span data-slot="label">Publish</span>
</button>
<span class="tooltip" id="publish-tooltip" role="tooltip" popover="manual" data-state="closed" data-placement="top">
  Add a title to publish<span data-slot="arrow" aria-hidden="true"></span>
</span>
<p>A title is required</p>

<!-- tooltip.js, written out under Label and description. -->
<script type="module" src="/scripts/tooltip.js"></script>
```
::
::

The reason is on the page too, since a tap never opens a tooltip. A disabled button that only explains itself in a tooltip leaves touch screen users guessing.

### Adaptive

#### Touch screens

Touch screens have no hover, and a tap on a button is meant to press it, so a tap never opens a tooltip. That includes the focus a tap moves to the trigger, which would otherwise open a tooltip that nothing closes until the next tap somewhere else. The reference implementation tells a tap apart by its pointer type, `touch`, rather than by the screen's size, so a laptop with a touch screen still shows tooltips to its mouse.

That's why a tooltip is never the only place something lives. A `label` repeats the trigger's own name, and a `description` adds a hint people can do without, or one that's on the page too, like the reason in the example under [Disabled triggers](/docs/components/tooltip#disabled-triggers). For a hint people need on every device, use visible text, or a [toggletip](/docs/components/popover#toggletips), a button that shows the hint when it's pressed, which is a Popover.

#### More contrast

When someone asks for more contrast (`prefers-contrast: more`), nothing needs to change. The text already has well over 7:1 against the fill with our reference tokens.

#### Forced colours

Windows contrast themes replace every colour with the user's own, which drops the tooltip's fill. Ours has a transparent border, which forced colours mode draws in the system's text colour, so its edge stays visible, and it switches to `Canvas` and `CanvasText`, the page's own colours, so it reads like the rest of the page. The arrow has the same border on its outer edges, so it stays visible too.

#### Colour scheme

The fill and its text come from `--color--neutral` and `--color--neutral-contrast`, which our reference tokens set with `light-dark()`. So the tooltip is dark on a light page and light on a dark one, and stands out on both.

#### Text size and zoom

Sizes are in `rem`, so the tooltip grows at 200% text size along with everything else ([WCAG 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)). Its maximum width is in `ch`, about 32 characters, so long text wraps onto more lines as it grows rather than running off the screen ([WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)).

#### Motion

The tooltip fades in and grows from 96% over 0.15 seconds. When someone prefers reduced motion (`prefers-reduced-motion: reduce`), it only fades ([WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)). It still eases in rather than popping up, since a fade changes nothing's position or size.

#### Languages and direction

The tooltip's text is yours, so remember to translate it along with the rest of the page. With `type="label"`, translating the trigger's label is enough, since the tooltip shows the same text. `start` and `end` follow the reading direction, so a tooltip at the `end` of a button opens on its right in English and on its left in Arabic, without any change to your code.

## Developer Experience (DX)

Next, let's look at how developers use the Tooltip. You give it its text and wrap it around the trigger, which takes a few props from it, and it handles when to open, where and for whom.

::framework-switcher
#react
```tsx
import { Button } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";

export function SettingsButton() {
  return (
    <Tooltip label="Settings" type="label">
      {(trigger) => <Button {...trigger} label="Settings" variant="ghost" iconOnly leading={<SettingsIcon />} />}
    </Tooltip>
  );
}
```

#vue
```vue
<script setup lang="ts">
import Button from "@/components/Button.vue";
import Tooltip from "@/components/Tooltip.vue";
</script>

<template>
  <Tooltip label="Settings" type="label" v-slot="{ trigger }">
    <Button v-bind="trigger" label="Settings" variant="ghost" icon-only>
      <template #leading><SettingsIcon /></template>
    </Button>
  </Tooltip>
</template>
```

#svelte
```svelte
<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";
</script>

<Tooltip label="Settings" type="label">
  {#snippet children(trigger)}
    <Button {...trigger} label="Settings" variant="ghost" iconOnly>
      {#snippet leading()}<SettingsIcon />{/snippet}
    </Button>
  {/snippet}
</Tooltip>
```

#angular
```angular-ts
import { Component } from "@angular/core";
import { Button } from "./button";
import { Tooltip } from "./tooltip";

@Component({
  selector: "app-settings-button",
  imports: [Button, Tooltip, LucideAngularModule],
  template: `
    <button appButton label="Settings" variant="ghost" iconOnly appTooltip="Settings" tooltipType="label">
      <lucide-icon leading [img]="SettingsIcon" />
    </button>
  `,
})
export class SettingsButton {
  SettingsIcon = SettingsIcon;
}
```

#solid
```tsx
import { Button } from "~/components/Button";
import { Tooltip } from "~/components/Tooltip";

export function SettingsButton() {
  return (
    <Tooltip label="Settings" type="label">
      {(trigger) => <Button {...trigger} label="Settings" variant="ghost" iconOnly leading={<SettingsIcon />} />}
    </Tooltip>
  );
}
```

#astro
```astro
---
import Button from "../components/Button.astro";
import Tooltip from "../components/Tooltip.astro";
---

<!-- Tooltip.astro renders its trigger and the tooltip, and a <script> wires them up in the browser. -->
<Tooltip label="Settings" type="label">
  <Button label="Settings" variant="ghost" iconOnly>
    <SettingsIcon slot="leading" />
  </Button>
</Tooltip>
```

#vanilla
```html
<link rel="stylesheet" href="/styles/tooltip.css" />

<button class="button" type="button" data-variant="ghost" data-color="neutral" data-size="md" data-icon-only>
  <span data-slot="leading" aria-hidden="true"><svg class="lucide-settings">…</svg></span>
  <span data-slot="label">Settings</span>
</button>
<span class="tooltip" aria-hidden="true" popover="manual" data-state="closed" data-placement="top">Settings<span data-slot="arrow" aria-hidden="true"></span></span>

<!-- tooltip.js, written out under Label and description, wires each .tooltip to the element right before it. -->
<script type="module" src="/scripts/tooltip.js"></script>
```
::

### Consistent

The Tooltip uses the same names as every other component in Open Components, so there's little new to learn:

| Name        | Kind | What it means                                                     |
| ----------- | ---- | ----------------------------------------------------------------- |
| `label`     | Prop | The text content, when it's plain text, as on the Button          |
| `type`      | Prop | Whether its text is the trigger's `label` or a `description`      |
| `delay`     | Prop | How long the pointer rests on the trigger before it opens, in ms  |
| `placement` | Prop | The side of the trigger it opens on: `top`, `bottom`, `start` or `end` |
| `arrow`     | Prop | Draws an arrow that points at the trigger                          |

We recommend `type="description"`, `delay={500}`, `placement="top"` and an arrow as the defaults. The Tooltip also leaves a few things out, on purpose:

- There's no slot for its content, only `label`. A slot would invite links, buttons and icons, which nobody could reach (see [Keep it short and plain](/docs/components/tooltip#keep-it-short-and-plain)).
- There's no `open` prop. When a tooltip opens is what makes it accessible, so the Tooltip keeps it to itself, and something you'd want to show on your own terms is a [Popover](/docs/components/popover).
- There's no `color` or `size`. A tooltip has no intent of its own, and its text is always small and short.
- There's no `disabled` either. To have no tooltip, render the trigger without one.

### Type-safe

Props and the trigger's bindings are typed, so your editor can autocomplete them and your type checker (`tsc`, `vue-tsc`, `svelte-check`, `ngc` or `astro check`) catches mistakes like `placement="left"`, which isn't one of the Tooltip's placements, or a tooltip without a `label`.

| Prop        | Type                                        | Default         | Description                                                    |
| ----------- | ------------------------------------------- | --------------- | -------------------------------------------------------------- |
| `label`     | `string`                                    |                 | The text it shows. Required, and plain text only              |
| `type`      | `"label" \| "description"`                  | `"description"` | Whether it shows the trigger's own name, or describes it       |
| `delay`     | `number`                                    | `500`           | How long the pointer rests on the trigger before it opens, in milliseconds |
| `placement` | `"top" \| "bottom" \| "start" \| "end"`     | `"top"`         | The side of the trigger it opens on, before it flips           |
| `arrow`     | `boolean`                                   | `true`          | Draws an arrow that points at the trigger, on whichever side it opens |

| Slot      | Description                                                                      |
| --------- | -------------------------------------------------------------------------------- |
| `default` | The trigger, which binds `trigger` on its focusable element                      |

The trigger's bindings are typed as `TooltipTrigger`: `aria-describedby` for a description, the anchor's name in `style`, and the pointer and focus listeners. Bind them all, on the element that takes focus. The Tooltip fires no events of its own. We also export `TooltipProps`, which comes in handy for wrappers:

::framework-switcher
#react
```tsx
import { Tooltip, type TooltipProps } from "@/components/Tooltip";

export function Hint(props: TooltipProps) {
  return <Tooltip delay={300} {...props} />;
}
```

#vue
```vue
<script setup lang="ts">
import Tooltip, { type TooltipProps } from "@/components/Tooltip.vue";

const props = defineProps<TooltipProps>();
</script>

<template>
  <!-- After the props, since an unset delay is still in them, as undefined. -->
  <Tooltip v-bind="props" :delay="props.delay ?? 300" v-slot="{ trigger }">
    <slot :trigger="trigger" />
  </Tooltip>
</template>
```

#svelte
```svelte
<script lang="ts">
  import Tooltip, { type TooltipProps } from "$lib/components/Tooltip.svelte";

  let props: TooltipProps = $props();
</script>

<Tooltip delay={300} {...props} />
```

#angular
```angular-ts
import { Component } from "@angular/core";
import { Button } from "./button";
import { TOOLTIP_OPTIONS, Tooltip, type TooltipProps } from "./tooltip";

// A directive takes its defaults from a provider, so every tooltip in this toolbar waits 300ms.
@Component({
  selector: "app-editor-toolbar",
  imports: [Button, Tooltip],
  providers: [{ provide: TOOLTIP_OPTIONS, useValue: { delay: 300 } satisfies Partial<TooltipProps> }],
  template: `
    <button appButton variant="outline" appTooltip="Archived projects stay in search">Archive</button>
  `,
})
export class EditorToolbar {}
```

#solid
```tsx
import { Tooltip, type TooltipProps } from "~/components/Tooltip";

export function Hint(props: TooltipProps) {
  return <Tooltip delay={300} {...props} />;
}
```

#astro
```astro
---
import Tooltip, { type Props as TooltipProps } from "./Tooltip.astro";

type Props = TooltipProps;
---

<Tooltip delay={300} {...Astro.props}><slot /></Tooltip>
```

#vanilla
```html
<!-- No types in plain JavaScript: data-placement and data-delay take the same values as placement and delay, and the arrow is the <span data-slot="arrow" aria-hidden="true"> after the text, which you leave out to turn it off. -->
<span class="tooltip" id="hint" role="tooltip" popover="manual" data-state="closed" data-placement="top" data-delay="300">
  …<span data-slot="arrow" aria-hidden="true"></span>
</span>
```
::

### Composable

The Tooltip adds no wrapper around its trigger. It renders the trigger you give it, then the tooltip right after it, so your layout, your flex gaps and your trigger's own attributes stay as they are. How the trigger takes its props is the one thing that differs from framework to framework:

| Framework | The trigger                                                                                   |
| --------- | --------------------------------------------------------------------------------------------- |
| React     | A function child, which gets `trigger` to spread on the element                                |
| Vue       | The default slot, with `trigger` to bind with `v-bind`                                         |
| Svelte    | A `children` snippet, which gets `trigger` to spread                                           |
| Angular   | The element the `appTooltip` directive is on, which adds the tooltip after it, with `tooltipType`, `tooltipDelay`, `tooltipPlacement`, `tooltipArrow` and `tooltipClass` as its other inputs |
| Solid     | A function child, like React's                                                                 |
| Astro     | The default slot, which a `<script>` wires up in the browser, as the Button's Astro examples do |
| Vanilla   | The element right before the tooltip, which a script wires up                                  |

Bind the props on the element that takes focus, which is usually the trigger's root. Components like the Button pass them straight through, attributes and listeners alike, so binding them on the Button is enough. If your trigger's root isn't the focusable element, like a card with a button inside it, bind them on the button instead.

#### With other components

- An icon-only [Button](/docs/components/button#icons) keeps its visually hidden label, and its tooltip shows that same label, with `type="label"`.
- A Button with `focusableWhenDisabled` stays focusable while it's disabled, so its tooltip can still say why (see [Disabled triggers](/docs/components/tooltip#disabled-triggers)).
- An [Input](/docs/components/input) is described by its hint, which stays on the page rather than in a tooltip, since people need it while they type.
- A Dialog or Popover around a Tooltip keeps its own `Escape` handling. The Tooltip only takes `Escape` while it's open, and stops it there.
- A toggletip, which shows a hint when a button is pressed, and anything with links or buttons inside, is a [Popover](/docs/components/popover).

### Controllable

The Tooltip keeps its open state to itself, since when it opens is what makes it work for every input. Everything else is within reach:

| What      | How you control it                                                   |
| --------- | -------------------------------------------------------------------- |
| Text      | `label`                                                              |
| Type      | `type`                                                               |
| Delay     | `delay`, for the pointer. Focus always opens it at once              |
| Placement | `placement`, before it flips                                         |
| Arrow     | `arrow`, on by default, and its size with `--tooltip--arrow--size`   |
| Shown     | Render the Tooltip around the trigger, or render the trigger alone   |
| Look      | Its variables, from a class                                          |
| Open      | Read `data-state`, which is `open` or `closed`                       |

## Agentic Experience (AX)

Finally, let's look at how agents read, build and check a tooltip. They rely on the same accessibility tree as assistive technologies, and on a contract they can check the code against.

### Semantic

Agents that drive a browser, through Playwright or a browser MCP server, read the page through its accessibility tree, which is made of roles, names and descriptions. A tooltip doesn't have to be open for them to read it. This is how they see the formatting buttons and the Archive button on this page:

```yaml
- button "Bold"
- button "Italic"
- button "Underline"
- button "Strikethrough"
- button "Archive"
```

With `type="label"`, the tooltip isn't in the tree at all, and the button's own label names it. With `type="description"`, the tooltip's text is the button's accessible description, so an agent can find the button by its name and check its hint without hovering anything:

```ts
await expect(page.getByRole("button", { name: "Archive" })).toHaveAccessibleDescription("Archived projects stay in search");
```

### Described

Here's the whole contract in one block, for agents to read before they build or review a tooltip:

```yaml
component: Tooltip
summary: Shows a short text hint next to its trigger, on hover and on keyboard focus. Text only, and never the only place its text is.
standard: https://opencomponents.dev/docs/components/tooltip
element: span # popover="manual", right after its trigger, and in the top layer while it's open
role: tooltip # with type="description". With type="label", it's aria-hidden, with no role
props:
  label: { type: string } # required, and plain text only
  type: { type: [label, description], default: description }
  delay: { type: number, default: 500 } # in milliseconds, for the pointer only
  placement: { type: [top, bottom, start, end], default: top }
  arrow: { type: boolean, default: true }
slots:
  default: The trigger, which binds the props it's given, like aria-describedby and the listeners, on its focusable element.
states:
  closed: "[data-state=closed]"
  open: "[data-state=open]"
keyboard:
  Tab: Focus on the trigger opens it at once, and focus leaving closes it.
  Escape: Closes it while it's open, keeping focus on the trigger, and stops there.
parts: [arrow] # data-slot, after the text, unless arrow is false
tokens:
  theme: ["--color--neutral", "--color--neutral-contrast"]
  variables: [--tooltip--background, --tooltip--color, --tooltip--font-size, --tooltip--padding, --tooltip--radius, --tooltip--max-width, --tooltip--offset, --tooltip--arrow--size]
  layer: components # in Tailwind's order: theme, base, components, utilities
rules: https://opencomponents.dev/docs/components/tooltip#checklist
```

It's also published on its own at [`/raw/docs/components/tooltip.yaml`](/raw/docs/components/tooltip.yaml){external=""}, with every rule from the checklist in place of the `rules` link. It's a fraction of this page's length, so it's the one to give agents that only need the rules, and not the reasoning behind them.

Every rule has a stable ID, like `tooltip/contain-escape`, so you and your agents can cite it in reviews and commits.

### Deterministic

The same props always render the same markup, leaving out anything your framework adds for itself, like comments or scoping attributes. For example, here's what the Archive button under [Label and description](/docs/components/tooltip#label-and-description) renders once it's in the browser, before it's opened, without its icon:

```html
<button
  class="button"
  type="button"
  data-variant="outline"
  data-color="neutral"
  data-size="md"
  aria-describedby="v-0"
  style="anchor-name: --tooltip-v-0"
>
  <span data-slot="label">Archive</span>
</button>
<span
  id="v-0"
  class="tooltip"
  role="tooltip"
  popover="manual"
  data-state="closed"
  data-placement="top"
  style="position-anchor: --tooltip-v-0"
>Archived projects stay in search<span data-slot="arrow" aria-hidden="true"></span></span>
```

- The tooltip always comes right after its trigger, and is always in the page, open or not. Opening it changes `data-state`, and never adds or removes an element.
- `data-state` and `data-placement` are always there, while `data-delay` only appears when the delay isn't 500ms, the default. It's what the Vanilla `tooltip.js` reads. Unless `arrow` is `false`, the tooltip holds a `<span data-slot="arrow" aria-hidden="true">` after its text, and once it's open, `data-side` says which side of the trigger it's on, so the arrow can point back. It's a physical side, `top`, `bottom`, `left` or `right`, so `start` comes out as `left` or `right` by direction, and it stays set after the tooltip closes. With `type="label"`, `role` gives way to `aria-hidden="true"`, and the trigger has no `aria-describedby`.
- The `id` is the one you pass, or one from your framework's ID helper. The anchor's name always comes from the generated one, since an `id` can hold characters a CSS name can't, like `1:2`, so every tooltip on the page anchors to its own trigger. Both are set once the Tooltip mounts, and the server renders the trigger and the tooltip without them. Generated IDs can differ between the server and the client, like in content that renders asynchronously, and frameworks don't always fix a mismatched attribute when the page hydrates, which would leave the trigger pointing at an `id` that's gone.
- In browsers without CSS anchor positioning, an open tooltip also gets `top` and `left`, from the script that places it.

### Verifiable

Every rule in the checklist can be checked, and about two thirds of them automatically.

#### Unit tests

Every rule that the checklist checks with a unit test has one in `Tooltip.test.ts`, which you'll find under [Reference implementation](/docs/components/tooltip#reference-implementation). We run them on every change to this page, so the code you see always passes them. They use fake timers for the delays, and read the open state from `data-state`, since jsdom doesn't have the Popover API.

#### In the browser

Placement, flipping and the top layer only exist in a real browser, so check them there. You can hover and focus the trigger the way people would, emulate touch and run [axe](https://github.com/dequelabs/axe-core) over the lot:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the Archive button's tooltip opens for the keyboard and the pointer, and Escape closes it", async ({ page }) => {
  await page.goto("/projects");
  const archive = page.getByRole("button", { name: "Archive" });
  const tooltip = page.getByRole("tooltip", { name: "Archived projects stay in search" });

  await expect(archive).toHaveAccessibleDescription("Archived projects stay in search");

  await archive.focus();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await expect(archive).toBeFocused();

  await archive.hover();
  await expect(tooltip).toBeVisible();
  await tooltip.hover();
  await expect(tooltip).toBeVisible();

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations).toEqual([]);
});
```

Some things still need a human. Look at tooltips at the edges of the window, at 200% zoom and with forced colours turned on, which you can emulate in Chrome DevTools under Rendering, and check that they flip, wrap and keep their edge. Then try the page with a screen reader, and check that labels aren't read twice and descriptions are read with their triggers.

#### Prompts

You can point your agent straight at this page. To build a tooltip, you could use:

::framework-switcher
#react
```
Build a Tooltip component for our React design system that meets the Open Components
Tooltip standard: https://opencomponents.dev/raw/docs/components/tooltip.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#vue
```
Build a Tooltip component for our Vue 3 design system that meets the Open Components
Tooltip standard: https://opencomponents.dev/raw/docs/components/tooltip.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#svelte
```
Build a Tooltip component for our Svelte 5 design system that meets the Open Components
Tooltip standard: https://opencomponents.dev/raw/docs/components/tooltip.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#angular
```
Build a Tooltip component for our Angular design system that meets the Open Components
Tooltip standard: https://opencomponents.dev/raw/docs/components/tooltip.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#solid
```
Build a Tooltip component for our Solid design system that meets the Open Components
Tooltip standard: https://opencomponents.dev/raw/docs/components/tooltip.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#astro
```
Build a Tooltip component for our Astro design system that meets the Open Components
Tooltip standard: https://opencomponents.dev/raw/docs/components/tooltip.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#vanilla
```
Build a Tooltip for our design system in plain HTML, CSS and JavaScript that meets the Open
Components Tooltip standard: https://opencomponents.dev/raw/docs/components/tooltip.md

Follow its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```
::

To review one, the contract is enough:

```
Review our Tooltip against the Open Components Tooltip contract:
https://opencomponents.dev/raw/docs/components/tooltip.yaml

For each rule with a component or both scope, report pass or fail with the rule ID
and the evidence from our code. Then fix the failures.
```

And to review how a screen uses its tooltips:

```
Review how our editor toolbar uses its tooltips against the Open Components
Tooltip contract: https://opencomponents.dev/raw/docs/components/tooltip.yaml

For each rule with a usage or both scope, report pass or fail with the rule ID and
the evidence from our code. Then fix the failures.
```

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A tooltip meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Tooltip itself, so they're the ones to check when you build or review one. **Usage** rules are met by the screens that use it, like never hiding something people need in a tooltip, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like contrast: the Tooltip uses the theme's neutral pair, as long as your theme's pair passes.

The basis says where a rule comes from. A third of the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, most often [1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html), and a few come from **HTML** or **WAI-ARIA**. The rest are **Open Components** rules, which are our own, like opening one tooltip at a time. Where a rule goes further than WCAG asks at level AA, its basis says so: the reduced-motion rule comes from level **AAA**, and a rule that asks for more than its criterion says **beyond**, like keeping a disabled trigger focusable.

### UI rules

| Rule                         | Level  | Scope     | Requirement | Basis | Check |
| ---------------------------- | ------ | --------- | ----------- | ----- | ----- |
| `tooltip/text-only`          | Must   | Component | It holds plain text, with no links, buttons or anything else to focus or click | Open Components | Type check |
| `tooltip/contrast`           | Must   | Both      | Its text has a contrast of 4.5:1 against its fill | WCAG 1.4.3 (AA) | Contrast checker |
| `tooltip/wraps`              | Should | Component | Long text wraps at a maximum width set in `ch`, and is never cut off or scrolled | WCAG 1.4.4, 1.4.10 (AA) | 200% zoom |
| `tooltip/top-layer`          | Must   | Component | It opens in the top layer, so no `overflow` or `z-index` around its trigger clips or covers it | HTML | Visual regression test |
| `tooltip/flips`              | Must   | Component | It opens beside its trigger, flips to the opposite side when there's no room and stays inside the viewport | Open Components | Visual regression test |
| `tooltip/points-at-trigger`  | Must   | Component | An arrow, when there is one, sits on the edge facing the trigger and points at its centre, or as close as the rounded corners allow, after a flip too | Open Components | Visual regression test |
| `tooltip/fallback-position`  | Should | Component | Browsers without CSS anchor positioning get the same placement from a script | Open Components | Visual regression test |
| `tooltip/reduced-motion`     | Must   | Component | With `prefers-reduced-motion: reduce`, it fades in without growing or moving | WCAG 2.3.3 (AAA), Open Components | Emulation |
| `tooltip/forced-colors`      | Must   | Component | In forced colours mode, a border in the system's text colour marks its edge | Open Components | Emulation |

### UX rules

| Rule                          | Level  | Scope     | Requirement | Basis | Check |
| ----------------------------- | ------ | --------- | ----------- | ----- | ----- |
| `tooltip/focus-opens`         | Must   | Component | Keyboard focus on its trigger opens it at once | WCAG 2.1.1 (A) | Unit test, keyboard |
| `tooltip/hover-delay`         | Should | Component | The pointer rests on its trigger for a delay, about 500ms, before it opens | Open Components | Unit test |
| `tooltip/skip-delay`          | Should | Component | Moving the pointer straight on to the next trigger opens that tooltip without waiting | Open Components | Unit test |
| `tooltip/hoverable`           | Must   | Component | The pointer can cross from the trigger onto the tooltip, within a short grace period, without closing it | WCAG 1.4.13 (AA) | Unit test |
| `tooltip/persistent`          | Must   | Component | It stays open while its trigger has hover or focus, and never hides on a timer | WCAG 1.4.13 (AA) | Unit test |
| `tooltip/dismiss-with-escape` | Must   | Component | `Escape` dismisses it without moving focus or the pointer | WCAG 1.4.13 (AA) | Unit test, keyboard |
| `tooltip/contain-escape`      | Must   | Component | A key press that closes it stops there, so a dialog or popover around it stays open, while one with no tooltip open reaches them as usual | Open Components | Unit test |
| `tooltip/one-at-a-time`       | Must   | Component | Opening a tooltip closes any other one that's open | Open Components | Unit test |
| `tooltip/no-touch`            | Must   | Component | A tap never opens it, even when the tap moves focus to its trigger | Open Components | Unit test |
| `tooltip/not-the-only-place`  | Must   | Usage     | Nothing people need is only in a tooltip, since touch screen users can't open one | Open Components | Review |
| `tooltip/focusable-trigger`   | Must   | Usage     | Its trigger is focusable, and a disabled one uses `aria-disabled` rather than `disabled` | Open Components, beyond WCAG 2.1.1 (A) | Keyboard |
| `tooltip/short`               | Should | Usage     | Its text is a few words long, a hint rather than instructions | Open Components | Review |
| `tooltip/no-title`            | Should | Usage     | Its trigger has no `title` attribute, which would show a second, browser-drawn tooltip | Open Components | Review |

### DX rules

| Rule                            | Level  | Scope     | Requirement | Basis | Check |
| ------------------------------- | ------ | --------- | ----------- | ----- | ----- |
| `tooltip/trigger-props`         | Must   | Component | The trigger is the element you render, which binds the props the Tooltip hands it, with no wrapper element | Open Components | Unit test |
| `tooltip/label-prop`            | Should | Component | Its text comes from `label`, the name every component uses for plain text | Open Components | Type check |
| `tooltip/attributes-on-tooltip` | Should | Component | Classes and attributes you pass land on the tooltip, so a class can set its variables | Open Components | Unit test |

### AX rules

| Rule                       | Level  | Scope     | Requirement | Basis | Check |
| -------------------------- | ------ | --------- | ----------- | ----- | ----- |
| `tooltip/describes`        | Must   | Component | With `type="description"`, it's `role="tooltip"`, and its trigger points to its `id` with `aria-describedby` | WAI-ARIA | Unit test, screen reader |
| `tooltip/shows-label`      | Must   | Component | With `type="label"`, it's `aria-hidden`, nothing points to it, and the trigger keeps its own name | WCAG 4.1.2 (A), Open Components | Unit test |
| `tooltip/never-labelledby` | Must   | Both      | No trigger is named by its tooltip through `aria-labelledby` | Open Components | Unit test, review |
| `tooltip/named-trigger`    | Must   | Usage     | Its trigger has an accessible name of its own, like an icon-only Button's hidden label | WCAG 4.1.2 (A) | ARIA snapshot |
| `tooltip/in-the-dom`       | Must   | Component | It stays in the DOM while it's closed, so its trigger's description is always there | WAI-ARIA | Unit test |
| `tooltip/data-state`       | Should | Component | Its open state shows as `data-state`, `open` or `closed`, so tests and agents can read it | Open Components | Unit test |

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves: opening on focus at once and on hover after a delay, staying open while the pointer is on it, closing with `Escape` without letting it go further, and never opening on a tap.

It's one component, with no dependencies. The tests are in `Tooltip.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [Tooltip.vue]
<script lang="ts">
// Shared by every tooltip on the page, so only one is open at a time, and once one
// has opened, the next opens at once, as the pointer moves along a toolbar.
let closeOpen: (() => void) | undefined;
let warm = false;
let cooling: ReturnType<typeof setTimeout> | undefined;

/** How long the next tooltip skips the delay for, after one closes. */
const SKIP_DELAY = 300;
/** How long a tooltip waits after the pointer leaves, so the pointer can move onto it. */
const GRACE = 150;
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useId, useTemplateRef } from "vue";

export interface TooltipProps {
  /** The text it shows. Plain text only, so there's never anything in it to focus or click. */
  label: string;
  /**
   * "description" adds the text to the trigger's description. "label" shows the name the
   * trigger already has, like an icon-only button's hidden label, and stays hidden from
   * screen readers, so they don't read it twice.
   */
  type?: "label" | "description";
  /** How long the pointer rests on the trigger before it opens, in milliseconds. Focus opens it at once. */
  delay?: number;
  /** The side of the trigger it opens on. It flips to the other side when there's no room. */
  placement?: "top" | "bottom" | "start" | "end";
  /**
   * Draws an arrow that points at the trigger, on whichever side it opens, so it's clear which
   * trigger it belongs to when several sit close together. Turn it off with `false`.
   */
  arrow?: boolean;
}

/** What the trigger binds on its focusable element. */
export interface TooltipTrigger {
  "aria-describedby"?: string;
  style: { "anchor-name"?: string };
  onPointerenter: (event: PointerEvent) => void;
  onPointerleave: (event: PointerEvent) => void;
  onPointerdown: (event: PointerEvent) => void;
  onFocus: (event: FocusEvent) => void;
  onBlur: () => void;
}

// The root is a fragment, the trigger and then the tooltip, so attributes go on the
// tooltip, where a class can set its variables.
defineOptions({ inheritAttrs: false });

const { label, type = "description", delay = 500, placement = "top", arrow = true } = defineProps<TooltipProps>();

defineSlots<{
  /** The trigger, which binds `trigger` on its focusable element. */
  default: (props: { trigger: TooltipTrigger }) => unknown;
}>();

// The ID, and the anchor's name, are set once it mounts. The ID is the one you pass, or a
// generated one. Generated IDs can differ between the server and the client, like in content
// that renders asynchronously, and hydration doesn't fix the trigger's attributes, which
// would then point at nothing.
const attrs = useAttrs();
const uid = useId();
const id = ref<string>();
// The anchor's name always comes from the generated ID, since an id you pass can hold
// characters a CSS name can't, like "1:2", and the browser would drop the anchor.
const anchorName = computed(() => id.value && `--tooltip-${uid}`);
onMounted(() => (id.value = (attrs.id as string | undefined) ?? uid));
const state = ref<"open" | "closed">("closed");
// The side it opened on, after any flip, which the arrow points from. Only aim() sets it,
// so a tooltip without an arrow never has one.
const side = ref<"top" | "bottom" | "left" | "right">();
const tooltip = useTemplateRef<HTMLElement>("tooltip");
const arrowPart = useTemplateRef<HTMLElement>("arrow-part");

let anchor: HTMLElement | undefined;
let hovered = false;
let focused = false;
let touched = false;
// A tap doesn't always focus the trigger, like in Safari on iOS, or when it turns into a
// scroll, so the next key press, like the Tab that moves focus, forgets it.
const untouch = () => (touched = false);
let opening: ReturnType<typeof setTimeout> | undefined;
let closing: ReturnType<typeof setTimeout> | undefined;
let frame: number | undefined;

// CSS anchor positioning places it, where the browser has it. Elsewhere, place() does.
// It checks position-area rather than anchor-name, which Chrome had four versions earlier.
const anchored = () => globalThis.CSS?.supports?.("position-area: top") ?? false;

function show() {
  clearTimeout(opening);
  clearTimeout(closing);
  if (state.value === "open") return;
  closeOpen?.();
  closeOpen = hide;
  state.value = "open";
  // The top layer, above everything else, so no overflow or z-index around the trigger can
  // clip or cover it. Browsers without the Popover API show it where it is.
  tooltip.value?.showPopover?.();
  // In the capture phase, so it runs before a dialog's own Escape handler.
  document.addEventListener("keydown", onKeydown, true);
  // Once it's shown, so it has a size to measure.
  nextTick(update);
  if (!anchored()) {
    addEventListener("scroll", update, { capture: true, passive: true });
    addEventListener("resize", update);
  }
  // The arrow follows it on every frame while it's open: the browser moves an anchored tooltip
  // after a scroll handler runs, and a flip or a layout shift can move it with no scroll at all.
  if (arrow) nextTick(follow);
}

// It stops once the tooltip has closed, since show() queues it for the next tick, and a tooltip
// that opens and closes in the same task, like with focus() and then blur(), is closed by then.
function follow() {
  if (state.value !== "open") return;
  aim();
  frame = requestAnimationFrame(follow);
}

function hide() {
  clearTimeout(opening);
  clearTimeout(closing);
  if (state.value === "closed") return;
  state.value = "closed";
  tooltip.value?.hidePopover?.();
  document.removeEventListener("keydown", onKeydown, true);
  removeEventListener("scroll", update, { capture: true });
  removeEventListener("resize", update);
  if (frame !== undefined) cancelAnimationFrame(frame);
  frame = undefined;
  if (closeOpen === hide) {
    closeOpen = undefined;
    warm = true;
    clearTimeout(cooling);
    cooling = setTimeout(() => (warm = false), SKIP_DELAY);
  }
}

function closeSoon() {
  clearTimeout(closing);
  closing = setTimeout(() => {
    if (!hovered && !focused) hide();
  }, GRACE);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  // Escape closes the tooltip and goes no further, so a dialog or popover around it stays
  // open. It's only listened for while a tooltip is open, so otherwise it's theirs.
  event.stopPropagation();
  event.preventDefault();
  hide();
}

const trigger = computed<TooltipTrigger>(() => ({
  // A label is the trigger's own name, which it keeps, so nothing points to the tooltip.
  // Never aria-labelledby, which would replace that name.
  "aria-describedby": type === "description" ? id.value : undefined,
  style: anchorName.value ? { "anchor-name": anchorName.value } : {},
  onPointerenter(event) {
    // A tap never opens it: touch screens have no hover, and nothing would close it.
    if (event.pointerType === "touch") return;
    anchor = event.currentTarget as HTMLElement;
    hovered = true;
    clearTimeout(closing);
    if (state.value === "open") return;
    if (closeOpen || warm) return show();
    clearTimeout(opening);
    opening = setTimeout(show, delay);
  },
  onPointerleave(event) {
    if (event.pointerType === "touch") return;
    hovered = false;
    clearTimeout(opening);
    closeSoon();
  },
  onPointerdown(event) {
    touched = event.pointerType === "touch";
    if (touched) document.addEventListener("keydown", untouch, { capture: true, once: true });
  },
  onFocus(event) {
    focused = true;
    anchor = event.currentTarget as HTMLElement;
    // A tap focuses the trigger too, which shouldn't open it any more than the tap does.
    if (!touched) show();
  },
  onBlur() {
    focused = false;
    touched = false;
    if (!hovered) hide();
  },
}));

function update() {
  if (!anchored()) place();
  if (arrow) aim();
}

// Without anchor positioning: the chosen side of the trigger, or the other side when it
// doesn't fit, centred on the trigger and kept inside the viewport.
function place() {
  const el = tooltip.value;
  if (!el || !anchor) return;
  // Its margin is the gap, which `left` and `top` place it outside of.
  const gap = parseFloat(getComputedStyle(el).marginTop) || 0;
  const a = anchor.getBoundingClientRect();
  // Its exact size, without the scale it grows in from, which getBoundingClientRect() would include.
  const width = parseFloat(getComputedStyle(el).width);
  const height = parseFloat(getComputedStyle(el).height);
  const { clientWidth, clientHeight } = document.documentElement;
  const rtl = getComputedStyle(anchor).direction === "rtl";
  const sides = { top: "top", bottom: "bottom", start: rtl ? "right" : "left", end: rtl ? "left" : "right" } as const;
  const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
  const fits = {
    top: a.top - gap - height >= 0,
    bottom: a.bottom + gap + height <= clientHeight,
    left: a.left - gap - width >= 0,
    right: a.right + gap + width <= clientWidth,
  };
  let side: keyof typeof opposite = sides[placement];
  if (!fits[side] && fits[opposite[side]]) side = opposite[side];
  const across = side === "top" || side === "bottom";
  const x = across ? a.left + (a.width - width) / 2 : side === "left" ? a.left - gap - width : a.right + gap;
  const y = across ? (side === "top" ? a.top - gap - height : a.bottom + gap) : a.top + (a.height - height) / 2;
  el.style.left = `${Math.max(0, Math.min(x, clientWidth - width)) - gap}px`;
  el.style.top = `${Math.max(0, Math.min(y, clientHeight - height)) - gap}px`;
}

// With an arrow: the side it opened on, from where its centre is, which its scale doesn't move,
// and the arrow across from the trigger's centre, or as close as the rounded corners allow.
function aim() {
  const el = tooltip.value;
  const part = arrowPart.value;
  if (!el || !part || !anchor) return;
  const a = anchor.getBoundingClientRect();
  const t = el.getBoundingClientRect();
  const x = t.left + t.width / 2;
  const y = t.top + t.height / 2;
  side.value = y < a.top ? "top" : y > a.bottom ? "bottom" : x < a.left ? "left" : "right";
  const across = side.value === "top" || side.value === "bottom";
  const box = getComputedStyle(el);
  const length = parseFloat(across ? box.width : box.height);
  const centre = across ? a.left + a.width / 2 - (x - length / 2) : a.top + a.height / 2 - (y - length / 2);
  // Its centre stays a corner's radius and half its own diagonal from each end, so none of it
  // overlaps the curve, measured, like the centre, from the outside of the border.
  const clear = parseFloat(box.borderTopLeftRadius) + parseFloat(getComputedStyle(part).width) / Math.SQRT2;
  const at = clear * 2 < length ? Math.max(clear, Math.min(centre, length - clear)) : length / 2;
  // Its left and top start inside the border.
  part.style.left = across ? `${at - el.clientLeft}px` : "";
  part.style.top = across ? "" : `${at - el.clientTop}px`;
}

// The pointer can move from the trigger onto the tooltip, and the tooltip stays open.
function onTooltipEnter() {
  hovered = true;
  clearTimeout(closing);
}
function onTooltipLeave() {
  hovered = false;
  closeSoon();
}

onBeforeUnmount(() => {
  hide();
  document.removeEventListener("keydown", untouch, { capture: true });
});
</script>

<template>
  <slot :trigger="trigger" />
  <!-- A span, so it's valid wherever its trigger is, even in a line of text. It stays in the
       page while it's closed, so the trigger's description is there before it opens. -->
  <span
    ref="tooltip"
    v-bind="$attrs"
    :id="id"
    class="tooltip"
    :role="type === 'description' ? 'tooltip' : undefined"
    :aria-hidden="type === 'label' ? 'true' : undefined"
    popover="manual"
    :data-state="state"
    :data-placement="placement"
    :data-delay="delay === 500 ? undefined : delay"
    :data-side="side"
    :style="anchorName && { 'position-anchor': anchorName }"
    @pointerenter="onTooltipEnter"
    @pointerleave="onTooltipLeave"
  >{{ label }}<span v-if="arrow" ref="arrow-part" data-slot="arrow" aria-hidden="true" /></span>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The tooltip's styles go in `components`,
   so a class of yours that sets its variables wins without any specificity tricks. */
@layer theme, base, components, utilities;

@layer components {
  .tooltip {
    /* The neutral fill and the text on it, which have 4.5:1 or more in both colour schemes. */
    --tooltip--background: var(--color--neutral);
    --tooltip--color: var(--color--neutral-contrast);
    /* The Button's text size, so the hint doesn't read smaller than the control it explains. */
    --tooltip--font-size: 0.875rem;
    --tooltip--padding: 0.375rem 0.625rem;
    --tooltip--radius: 0.375rem;
    /* In ch, so long text wraps at about 32 characters, however big the text gets. */
    --tooltip--max-width: 32ch;
    /* The gap between the trigger and the tooltip. */
    --tooltip--offset: 0.5rem;
    /* The arrow's width and height, before it's turned, when it has one. */
    --tooltip--arrow--size: 0.5rem;

    /* Beside the trigger, centred on it, and on the other side when there's no room. */
    position: fixed;
    position-area: top;
    position-try-fallbacks: flip-block, flip-inline;
    inset: auto;
    margin: var(--tooltip--offset);
    box-sizing: border-box;
    width: max-content;
    max-inline-size: var(--tooltip--max-width);
    padding: var(--tooltip--padding);
    /* Transparent, so it only shows in forced colors mode, which keeps borders. */
    border: 1px solid transparent;
    border-radius: var(--tooltip--radius);
    overflow: visible;
    background-color: var(--tooltip--background);
    color: var(--tooltip--color);
    font-family: inherit;
    font-size: var(--tooltip--font-size);
    font-weight: 500;
    line-height: 1.4;
    overflow-wrap: break-word;
    transition:
      opacity 0.15s ease-out,
      scale 0.15s ease-out;
  }
  .tooltip[data-placement="bottom"] {
    position-area: bottom;
  }
  /* In the tooltip's own direction, which is its trigger's, rather than the page's. */
  .tooltip[data-placement="start"] {
    position-area: self-inline-start;
  }
  .tooltip[data-placement="end"] {
    position-area: self-inline-end;
  }

  /* The arrow: a square turned 45deg, half of it past the edge that faces the trigger, in the
     tooltip's fill and border, so forced colors mode draws its edge too. The edges inside the
     tooltip have no border, and it waits for the side it opened on. */
  .tooltip > [data-slot="arrow"] {
    position: absolute;
    box-sizing: border-box;
    width: var(--tooltip--arrow--size);
    height: var(--tooltip--arrow--size);
    border: inherit;
    background: inherit;
    translate: -50% -50%;
    rotate: 45deg;
  }
  .tooltip:not([data-side]) > [data-slot="arrow"] {
    display: none;
  }
  .tooltip[data-side="top"] > [data-slot="arrow"] {
    top: 100%;
    border-top-width: 0;
    border-left-width: 0;
  }
  .tooltip[data-side="bottom"] > [data-slot="arrow"] {
    top: 0;
    border-right-width: 0;
    border-bottom-width: 0;
  }
  .tooltip[data-side="left"] > [data-slot="arrow"] {
    left: 100%;
    border-bottom-width: 0;
    border-left-width: 0;
  }
  .tooltip[data-side="right"] > [data-slot="arrow"] {
    left: 0;
    border-top-width: 0;
    border-right-width: 0;
  }

  /* Hidden while it's closed, in browsers without the Popover API too. */
  .tooltip:not([data-state="open"]) {
    display: none;
  }
  /* It fades and grows in as it opens. */
  @starting-style {
    .tooltip[data-state="open"] {
      opacity: 0;
      scale: 0.96;
    }
  }

  /* With reduced motion, it only fades in, without growing. */
  @media (prefers-reduced-motion: reduce) {
    .tooltip {
      transition: opacity 0.15s ease-out;
    }
    @starting-style {
      .tooltip[data-state="open"] {
        scale: 1;
      }
    }
  }

  /* Forced colors mode replaces the fill with the page's own colours, so the border marks its edge. */
  @media (forced-colors: active) {
    .tooltip {
      border-color: CanvasText;
      background-color: Canvas;
      color: CanvasText;
    }
  }
}
</style>
```
```ts [Tooltip.test.ts]
import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import Tooltip, { type TooltipProps } from "./Tooltip.vue";

// A trigger with a name of its own, like an icon-only Button's visually hidden label.
function tooltip(props: TooltipProps & Record<string, unknown>, name = "Settings") {
  return h(Tooltip, props, { default: ({ trigger }: { trigger: Record<string, unknown> }) => h("button", trigger, name) });
}

// jsdom has no Popover API, so a closed tooltip and an open one look the same to
// Testing Library's visibility checks: tests find it with `hidden: true`, or
// through its trigger, and read its state from `data-state`.
const tip = () => screen.getByRole("tooltip", { hidden: true });
// With type label, it has no role to find it by.
const tips = () => [...document.querySelectorAll<HTMLElement>(".tooltip")];

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  // Tooltips share the open one and the skipped delay, so let them settle between tests.
  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
  const setup = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  it("describes its trigger by default, as a role=tooltip that aria-describedby points to", async () => {
    render(tooltip({ label: "Changes apply to every project" }));
    // The ID is set once it mounts, so the server and the client never disagree on it.
    await nextTick();

    const button = screen.getByRole("button", { name: "Settings", description: "Changes apply to every project" });
    const tooltipElement = screen.getByRole("tooltip", { hidden: true });
    expect(button).toHaveAttribute("aria-describedby", tooltipElement.id);
    expect(tooltipElement).toHaveTextContent("Changes apply to every project");
    expect(tooltipElement).not.toHaveAttribute("aria-hidden");
    expect(button).not.toHaveAttribute("aria-labelledby");
  });

  it("only shows the trigger's own name with type label, hidden from screen readers and linked to nothing", async () => {
    render(tooltip({ label: "Settings", type: "label" }));
    await nextTick();

    const button = screen.getByRole("button", { name: "Settings" });
    const [tooltipElement] = tips();
    expect(tooltipElement).toHaveAttribute("aria-hidden", "true");
    expect(tooltipElement).not.toHaveAttribute("role");
    expect(button).not.toHaveAttribute("aria-describedby");
    expect(button).not.toHaveAttribute("aria-labelledby");
    expect(button).toHaveAccessibleDescription("");
    expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
  });

  it("stays in the page while it's closed, so the description is there before it opens", async () => {
    render(tooltip({ label: "Visible to everyone" }));
    await nextTick();

    expect(tip()).toHaveAttribute("data-state", "closed");
    expect(tip()).not.toHaveAttribute("data-delay");
    expect(screen.getByRole("button")).toHaveAccessibleDescription("Visible to everyone");
  });

  it("keeps an id you pass, and points the trigger at it", async () => {
    render(tooltip({ label: "Visible to everyone", id: "visibility-hint" }));
    await nextTick();

    expect(tip()).toHaveAttribute("id", "visibility-hint");
    expect(screen.getByRole("button")).toHaveAttribute("aria-describedby", "visibility-hint");
  });

  // An id can hold characters a CSS name can't, like "form.email:1", which would drop the anchor.
  it("names its anchor from a generated ID, whatever id you pass", async () => {
    let bound: Record<string, any> = {};
    render(
      h(Tooltip, { label: "Visible to everyone", id: "form.email:1" }, {
        default: ({ trigger }: { trigger: Record<string, any> }) => ((bound = trigger), h("button", trigger, "Settings")),
      }),
    );
    await nextTick();

    expect(bound["aria-describedby"]).toBe("form.email:1");
    expect(bound.style["anchor-name"]).toMatch(/^--tooltip-v-[\w-]+$/);
  });

  it("leaves generated IDs out of the server's markup, so hydration can't leave the trigger pointing at nothing", async () => {
    const html = await renderToString(createSSRApp({ render: () => tooltip({ label: "Visible to everyone" }) }));

    expect(html).toContain('role="tooltip"');
    expect(html).not.toMatch(/ id=|aria-describedby|anchor/);
  });

  it("opens as soon as its trigger gets focus, and closes when focus leaves", async () => {
    const user = setup();
    render({ render: () => [tooltip({ label: "Visible to everyone" }), h("button", "Next")] });

    await user.tab();
    expect(screen.getByRole("button", { name: "Settings" })).toHaveFocus();
    expect(tip()).toHaveAttribute("data-state", "open");

    await user.tab();
    expect(tip()).toHaveAttribute("data-state", "closed");
  });

  it("opens on hover only after the delay, and not when the pointer leaves before it", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));
    const button = screen.getByRole("button");

    await user.hover(button);
    await vi.advanceTimersByTimeAsync(499);
    expect(tip()).toHaveAttribute("data-state", "closed");
    await vi.advanceTimersByTimeAsync(1);
    expect(tip()).toHaveAttribute("data-state", "open");

    await user.unhover(button);
    await vi.advanceTimersByTimeAsync(1000);
    await user.hover(button);
    await vi.advanceTimersByTimeAsync(300);
    await user.unhover(button);
    await vi.advanceTimersByTimeAsync(1000);
    expect(tip()).toHaveAttribute("data-state", "closed");
  });

  it("takes another delay, and shows it as data-delay", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone", delay: 1000 }));
    expect(tip()).toHaveAttribute("data-delay", "1000");

    await user.hover(screen.getByRole("button"));
    await vi.advanceTimersByTimeAsync(999);
    expect(tip()).toHaveAttribute("data-state", "closed");
    await vi.advanceTimersByTimeAsync(1);
    expect(tip()).toHaveAttribute("data-state", "open");
  });

  it("skips the delay when the pointer moves straight on to the next trigger", async () => {
    const user = setup();
    render({
      render: () => [tooltip({ label: "Bold", type: "label" }, "Bold"), tooltip({ label: "Italic", type: "label" }, "Italic")],
    });
    const [bold, italic] = screen.getAllByRole("button");
    const [boldTip, italicTip] = tips();

    await user.hover(bold!);
    await vi.advanceTimersByTimeAsync(500);
    expect(boldTip).toHaveAttribute("data-state", "open");

    await user.hover(italic!);
    expect(boldTip).toHaveAttribute("data-state", "closed");
    expect(italicTip).toHaveAttribute("data-state", "open");
  });

  it("skips the delay for a moment after a tooltip closes, and only for a moment", async () => {
    const user = setup();
    render({
      render: () => [
        tooltip({ label: "Bold", type: "label" }, "Bold"),
        tooltip({ label: "Italic", type: "label" }, "Italic"),
        tooltip({ label: "Underline", type: "label" }, "Underline"),
      ],
    });
    const [bold, italic, underline] = screen.getAllByRole("button");
    const [, italicTip, underlineTip] = tips();

    await user.hover(bold!);
    await vi.advanceTimersByTimeAsync(500);
    await user.unhover(bold!);
    // Closed after its grace period, then on to the next trigger within 300ms.
    await vi.advanceTimersByTimeAsync(250);
    await user.hover(italic!);
    expect(italicTip).toHaveAttribute("data-state", "open");

    await user.unhover(italic!);
    await vi.advanceTimersByTimeAsync(1000);
    await user.hover(underline!);
    expect(underlineTip).toHaveAttribute("data-state", "closed");
    await vi.advanceTimersByTimeAsync(500);
    expect(underlineTip).toHaveAttribute("data-state", "open");
  });

  it("lets the pointer move onto the tooltip without closing, and closes once it leaves both", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));
    const button = screen.getByRole("button");

    await user.hover(button);
    await vi.advanceTimersByTimeAsync(500);
    await user.unhover(button);
    await user.hover(tip());
    await vi.advanceTimersByTimeAsync(1000);
    expect(tip()).toHaveAttribute("data-state", "open");

    await user.unhover(tip());
    await vi.advanceTimersByTimeAsync(1000);
    expect(tip()).toHaveAttribute("data-state", "closed");
  });

  it("stays open while its trigger is hovered or focused, and never closes on a timer", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));
    const button = screen.getByRole("button");

    await user.tab();
    await user.hover(button);
    await user.unhover(button);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(tip()).toHaveAttribute("data-state", "open");
  });

  it("stays open while the pointer is on its trigger after focus leaves, and closes once it leaves too", async () => {
    const user = setup();
    render({ render: () => [tooltip({ label: "Visible to everyone" }), h("button", "Next")] });
    const button = screen.getByRole("button", { name: "Settings" });

    await user.tab();
    await user.hover(button);
    await user.tab();
    await vi.advanceTimersByTimeAsync(1000);
    expect(tip()).toHaveAttribute("data-state", "open");

    await user.unhover(button);
    await vi.advanceTimersByTimeAsync(1000);
    expect(tip()).toHaveAttribute("data-state", "closed");
  });

  it("closes with Escape, keeping focus on the trigger", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));

    await user.tab();
    await user.keyboard("{Escape}");
    expect(tip()).toHaveAttribute("data-state", "closed");
    expect(screen.getByRole("button")).toHaveFocus();
  });

  it("closes with Escape after a hover, wherever focus is", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));

    await user.hover(screen.getByRole("button"));
    await vi.advanceTimersByTimeAsync(500);
    await user.keyboard("{Escape}");
    expect(tip()).toHaveAttribute("data-state", "closed");
    expect(document.body).toHaveFocus();
  });

  it("keeps Escape from reaching a dialog around it while it's open, and only then", async () => {
    const user = setup();
    const escapes = vi.fn();
    const onKeydown = (event: KeyboardEvent) => event.key === "Escape" && escapes();
    render({ render: () => h("div", { role: "dialog", "aria-label": "Edit project", onKeydown }, [tooltip({ label: "Visible to everyone" })]) });
    document.addEventListener("keydown", onKeydown);
    // Its default action is cancelled too, which is what keeps a native <dialog> open.
    let escape: KeyboardEvent | undefined;
    const record = (event: KeyboardEvent) => event.key === "Escape" && (escape = event);
    window.addEventListener("keydown", record, true);

    await user.tab();
    await user.keyboard("{Escape}");
    expect(tip()).toHaveAttribute("data-state", "closed");
    expect(escapes).not.toHaveBeenCalled();
    expect(escape?.defaultPrevented).toBe(true);
    window.removeEventListener("keydown", record, true);

    // With no tooltip open, Escape is the dialog's again.
    await user.keyboard("{Escape}");
    expect(escapes).toHaveBeenCalledTimes(2);
    document.removeEventListener("keydown", onKeydown);
  });

  it("opens one at a time", async () => {
    const user = setup();
    render({
      render: () => [tooltip({ label: "Bold", type: "label" }, "Bold"), tooltip({ label: "Italic", type: "label" }, "Italic")],
    });
    const [boldTip, italicTip] = tips();

    // Focus on one, the pointer on the other.
    await user.tab();
    expect(boldTip).toHaveAttribute("data-state", "open");
    await user.hover(screen.getByRole("button", { name: "Italic" }));
    await vi.advanceTimersByTimeAsync(500);
    expect(boldTip).toHaveAttribute("data-state", "closed");
    expect(italicTip).toHaveAttribute("data-state", "open");
  });

  it("never opens on a tap, even though the tap focuses the trigger", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));
    const button = screen.getByRole("button");

    await user.pointer({ keys: "[TouchA]", target: button });
    await vi.advanceTimersByTimeAsync(1000);
    expect(button).toHaveFocus();
    expect(tip()).toHaveAttribute("data-state", "closed");
  });

  it("still opens on keyboard focus after a touch that didn't focus the trigger, like a scroll", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));
    const button = screen.getByRole("button");

    // A touch that turns into a scroll is cancelled, and never focuses anything.
    button.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch", bubbles: true }));
    button.dispatchEvent(new PointerEvent("pointercancel", { pointerType: "touch", bubbles: true }));
    await user.tab();
    expect(button).toHaveFocus();
    expect(tip()).toHaveAttribute("data-state", "open");
  });

  it("passes the trigger props to the element you render, with no wrapper of its own", () => {
    const { container } = render(tooltip({ label: "Visible to everyone" }));

    const button = screen.getByRole("button");
    expect(container.firstElementChild).toBe(button);
    expect(button.nextElementSibling).toBe(tip());
  });

  it("draws an arrow by default, hidden from assistive technologies, and sets data-side once it opens", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));
    await nextTick();

    const arrow = tip().querySelector('[data-slot="arrow"]');
    expect(arrow).toHaveAttribute("aria-hidden", "true");
    expect(arrow).toBeEmptyDOMElement();
    expect(screen.getByRole("button")).toHaveAccessibleDescription("Visible to everyone");

    await user.tab();
    expect(tip()).toHaveAttribute("data-state", "open");
    expect(["top", "bottom", "left", "right"]).toContain(tip().getAttribute("data-side"));
  });

  it("has no arrow, and no data-side, when you turn it off", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone", arrow: false }));

    await user.tab();
    await vi.advanceTimersByTimeAsync(50);
    expect(tip()).toHaveAttribute("data-state", "open");
    expect(tip().querySelector('[data-slot="arrow"]')).toBeNull();
    expect(tip()).not.toHaveAttribute("data-side");
    expect(tip()).toHaveTextContent("Visible to everyone");
  });

  // Following the arrow asks for a frame on every frame, so a loop left behind would run until the page reloads.
  it("stops following its arrow once it closes, even when it opens and closes in the same task", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));
    const button = screen.getByRole("button");
    const frames = vi.spyOn(globalThis, "requestAnimationFrame");

    button.focus();
    button.blur();
    await vi.advanceTimersByTimeAsync(100);
    expect(tip()).toHaveAttribute("data-state", "closed");
    expect(frames).not.toHaveBeenCalled();

    await user.tab();
    await vi.advanceTimersByTimeAsync(50);
    expect(frames).toHaveBeenCalled();
    await user.tab();
    expect(tip()).toHaveAttribute("data-state", "closed");
    const calls = frames.mock.calls.length;
    await vi.advanceTimersByTimeAsync(100);
    expect(frames).toHaveBeenCalledTimes(calls);
    frames.mockRestore();
  });

  // The browser moves an anchored tooltip after a scroll, or when it flips, so the arrow is
  // aimed again on every frame while it's open. jsdom has no layout, so the boxes are given.
  it("moves its arrow to the side that faces the trigger on the next frame, as the tooltip moves", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));
    const button = screen.getByRole("button");
    const at = (top: number) => () => new DOMRect(0, top, 100, 30);
    button.getBoundingClientRect = at(100);
    tip().getBoundingClientRect = at(50);

    await user.tab();
    await vi.advanceTimersByTimeAsync(50);
    expect(tip()).toHaveAttribute("data-side", "top");

    tip().getBoundingClientRect = at(150);
    await vi.advanceTimersByTimeAsync(50);
    expect(tip()).toHaveAttribute("data-side", "bottom");
  });

  it("puts classes and attributes on the tooltip", () => {
    render(tooltip({ label: "Visible to everyone", class: "wide", "data-testid": "hint" }));

    expect(tip()).toHaveClass("tooltip", "wide");
    expect(tip()).toHaveAttribute("data-testid", "hint");
    expect(screen.getByRole("button")).not.toHaveClass("wide");
  });
});
```
:::
::

## FAQ

#### Tooltip or something else?

A tooltip is one of a few ways to show a hint, and each one suits a different hint:

| When the hint…                                                    | Use                                  | Because                                                          |
| ----------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| Names an icon-only button                                         | A Tooltip, with `type="label"`       | It shows the name the button already has, on hover and focus     |
| Adds a few words people can do without                            | A Tooltip, with `type="description"` | Screen readers read it with the trigger, and it stays out of the way |
| Is something people need, like a field's format                   | Visible text, like an Input's hint   | It's there on every device, and while people type                |
| Needs a press to show, or holds a link or a button                | A Popover                            | It opens on purpose, takes focus and closes when people are done |

#### Can a tooltip stay dark in dark mode?

Yes. Ours follows the theme's neutral pair, so it's dark on a light page and light on a dark one, which keeps it standing out from the page in both. Some design systems keep tooltips dark in both schemes, so they always read as something on top of the page, like [Styleframe](https://www.styleframe.dev/docs/theme/components/tooltip) does.

To do the same, swap the pair in dark mode from a class, with `light-dark()`, so the text keeps its 4.5:1 against the fill (`tooltip/contrast`). With our reference tokens, the swapped pair comes to 18.1:1, the same as the dark theme's own pair. Keep in mind that a dark fill is close to a dark page's own colour, so the tooltip's edge is harder to see there.

::framework-switcher
#react
```tsx [SettingsButton.tsx]
import styles from "./SettingsButton.module.css";

export function SettingsButton() {
  return (
    <Tooltip label="Settings" type="label" className={styles.alwaysDark}>
      {(trigger) => <Button {...trigger} label="Settings" variant="ghost" iconOnly leading={<SettingsIcon />} />}
    </Tooltip>
  );
}
```
```css [SettingsButton.module.css]
.alwaysDark {
  /* In dark mode, the dark theme's pair the other way round: a dark fill with light text. */
  --tooltip--background: light-dark(var(--color--neutral), var(--color--neutral-contrast));
  --tooltip--color: light-dark(var(--color--neutral-contrast), var(--color--neutral));
}
```

#vue
```vue
<template>
  <Tooltip label="Settings" type="label" class="always-dark" v-slot="{ trigger }">
    <Button v-bind="trigger" label="Settings" variant="ghost" icon-only>
      <template #leading><SettingsIcon /></template>
    </Button>
  </Tooltip>
</template>

<style scoped>
/* The class lands on the Tooltip's own element, which this component's scoped styles don't reach. */
:global(.always-dark) {
  /* In dark mode, the dark theme's pair the other way round: a dark fill with light text. */
  --tooltip--background: light-dark(var(--color--neutral), var(--color--neutral-contrast));
  --tooltip--color: light-dark(var(--color--neutral-contrast), var(--color--neutral));
}
</style>
```

#svelte
```svelte
<Tooltip label="Settings" type="label" class="always-dark">
  {#snippet children(trigger)}
    <Button {...trigger} label="Settings" variant="ghost" iconOnly>
      {#snippet leading()}<SettingsIcon />{/snippet}
    </Button>
  {/snippet}
</Tooltip>

<style>
  /* The class lands on the Tooltip's own element, which this component's scoped styles don't reach. */
  :global(.always-dark) {
    /* In dark mode, the dark theme's pair the other way round: a dark fill with light text. */
    --tooltip--background: light-dark(var(--color--neutral), var(--color--neutral-contrast));
    --tooltip--color: light-dark(var(--color--neutral-contrast), var(--color--neutral));
  }
</style>
```

#angular
```angular-ts
@Component({
  selector: "app-settings-button",
  imports: [Button, Tooltip, LucideAngularModule],
  template: `
    <button appButton label="Settings" variant="ghost" iconOnly appTooltip="Settings" tooltipType="label" tooltipClass="always-dark">
      <lucide-icon leading [img]="SettingsIcon" />
    </button>
  `,
  styles: `
    /* The tooltip renders outside this component's view, so the class needs ::ng-deep to reach it. */
    ::ng-deep .always-dark {
      /* In dark mode, the dark theme's pair the other way round: a dark fill with light text. */
      --tooltip--background: light-dark(var(--color--neutral), var(--color--neutral-contrast));
      --tooltip--color: light-dark(var(--color--neutral-contrast), var(--color--neutral));
    }
  `,
})
export class SettingsButton {
  SettingsIcon = SettingsIcon;
}
```

#solid
```tsx [SettingsButton.tsx]
import styles from "./SettingsButton.module.css";

export function SettingsButton() {
  return (
    <Tooltip label="Settings" type="label" class={styles.alwaysDark}>
      {(trigger) => <Button {...trigger} label="Settings" variant="ghost" iconOnly leading={<SettingsIcon />} />}
    </Tooltip>
  );
}
```
```css [SettingsButton.module.css]
.alwaysDark {
  /* In dark mode, the dark theme's pair the other way round: a dark fill with light text. */
  --tooltip--background: light-dark(var(--color--neutral), var(--color--neutral-contrast));
  --tooltip--color: light-dark(var(--color--neutral-contrast), var(--color--neutral));
}
```

#astro
```astro
<Tooltip label="Settings" type="label" class="always-dark">
  <Button label="Settings" variant="ghost" iconOnly>
    <SettingsIcon slot="leading" />
  </Button>
</Tooltip>

<style is:global>
  .always-dark {
    /* In dark mode, the dark theme's pair the other way round: a dark fill with light text. */
    --tooltip--background: light-dark(var(--color--neutral), var(--color--neutral-contrast));
    --tooltip--color: light-dark(var(--color--neutral-contrast), var(--color--neutral));
  }
</style>
```

#vanilla
```html
<span class="tooltip always-dark" aria-hidden="true" popover="manual" data-state="closed" data-placement="top">Settings<span data-slot="arrow" aria-hidden="true"></span></span>

<style>
  .always-dark {
    /* In dark mode, the dark theme's pair the other way round: a dark fill with light text. */
    --tooltip--background: light-dark(var(--color--neutral), var(--color--neutral-contrast));
    --tooltip--color: light-dark(var(--color--neutral-contrast), var(--color--neutral));
  }
</style>
```
::

::accordion
:::accordion-item{label="Can a tooltip hold a link?"}
No. A link in a tooltip can't be reached with the keyboard, since moving focus to it means leaving the trigger, which closes the tooltip. Touch screen users never see it at all. If a hint needs a link, like "Learn more", use a [Popover](/docs/components/popover), which opens when you press its button and takes focus.
:::

:::accordion-item{label="Why not use the title attribute?"}
Browsers show `title` as a tooltip of their own, but only on hover, after a delay and in a style you can't change, and never for the keyboard or on touch screens. It's also why the Tooltip's triggers shouldn't have one, since both tooltips would show up.
:::

:::accordion-item{label="Why doesn't a tap open it?"}
A tap on a button presses it, so a tooltip that opened too would cover whatever the press just changed, and nothing would close it until the next tap somewhere else. Touch screens also have no hover to close it with. So the Tooltip leaves touch alone, and the rule that a tooltip is never the only place for anything does the rest.
:::

:::accordion-item{label="Why not aria-label, or aria-labelledby?"}
Both replace the trigger's name. An icon-only Button already has a name, its visually hidden label, which gets translated along with the page and is the same mechanism for every button, so the tooltip doesn't need to give it another. For a hint, `aria-describedby` adds to the name rather than replacing it, which is what `type="description"` does.
:::

:::accordion-item{label="Can I turn the arrow off?"}
Yes, by setting `arrow` to `false`, where only one trigger could be meant and the offset already makes that clear. It's on by default since it shows at a glance which trigger a tooltip belongs to, which matters most when several triggers sit close together, like the icons of a toolbar. The arrow is a part of its own, `data-slot="arrow"`, sized with `--tooltip--arrow--size`, the name the [Design Tokens](/docs/foundations/design-tokens#groups) page gives it. While it's open, the Tooltip works out which side it's on, after any flip, sets `data-side` and points the arrow from there.
:::

:::accordion-item{label="Which browsers support the top layer and anchor positioning?"}
The Popover API is in Chrome and Edge 114, Firefox 125 and Safari 17. CSS anchor positioning, with `position-area` and `position-try-fallbacks`, is in Chrome and Edge 129, Firefox 147 and Safari 26, according to MDN's browser compatibility data. Chrome had `anchor-name` from version 125, before `position-area`, which is why our reference implementation checks for `position-area` before it leaves the placement to CSS. In a browser without either, the tooltip still opens beside its trigger, placed by its script, just without the top layer.
:::
::

## Sources

- [WAI-ARIA Authoring Practices: Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/), for opening on focus and closing with `Escape`
- [WAI-ARIA 1.2: tooltip](https://www.w3.org/TR/wai-aria-1.2/#tooltip) and [aria-describedby](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby)
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 1.4.13: Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html), for dismissible, hoverable and persistent
- [HTML Standard: the popover attribute](https://html.spec.whatwg.org/multipage/popover.html), for `popover="manual"` and the top layer
- [CSS Anchor Positioning](https://www.w3.org/TR/css-anchor-position-1/), for `anchor-name`, `position-area` and `position-try-fallbacks`
- MDN's browser compatibility data for [`showPopover()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/showPopover) (Chrome and Edge 114, Firefox 125, Safari 17), [`anchor-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-name) (Chrome and Edge 125, Firefox 147, Safari 26), [`position-area`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-area) (Chrome and Edge 129, Firefox 147, Safari 26) and [`position-try-fallbacks`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-try-fallbacks) (Chrome and Edge 128, Firefox 147, Safari 26)
- [CSS Color Adjustment: forced colors mode](https://www.w3.org/TR/css-color-adjust-1/)
- [Primer: Tooltip](https://primer.style/product/components/tooltip/), for the label and description types
- [Styleframe: Tooltip](https://www.styleframe.dev/docs/theme/components/tooltip), for the default text size and padding, and tooltips that stay dark in both schemes
- [Radix Primitives: Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip), for the hover delay and skipping it between triggers
- [Nielsen Norman Group: Tooltip Guidelines](https://www.nngroup.com/articles/tooltip-guidelines/), for an arrow that shows which of several nearby triggers a tooltip belongs to
- [Sarah Higley: Tooltips in the time of WCAG 2.1](https://sarahmhigley.com/writing/tooltips-in-wcag-21/), for hoverable and dismissible tooltips
