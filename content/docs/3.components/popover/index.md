---
title: Popover
description: How to build a popover that shows more next to what opened it, leaves the rest of the page working, opens and closes the way people expect and can be checked by your agents.
navigation:
  title: Overview
---

Popovers show more next to the button that opened them, like a set of filters, a short form or a hint with a link, while the rest of the page keeps working. They sit between a tooltip, which only hints, and a dialog, which takes over the page, so they inherit the hard parts of both: focus, `Escape` and the top layer. Think of a popover that keyboard users can open but never reach, one whose `Escape` closes the dialog behind it as well, or one that opens off the edge of a phone's screen.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/popover/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a popover looks, from its parts and where it opens to what goes in it, its states and its tokens.
:::

:::card{to="/docs/components/popover/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a popover behaves for every person, input and setting, so it's accessible, predictable, clear in every state and adaptive.
:::

:::card{to="/docs/components/popover/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Popover, opened by a Button with popovertarget, with one typed API and an open state that follows every open and close.
:::

:::card{to="/docs/components/popover/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, open and check a popover, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/popover#reference-implementation), which does its part of every rule in the [checklist](/docs/components/popover#checklist), so feel free to open them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Popover with the same API in each, apart from two names in Angular, which [Type-safe](/docs/components/popover/dx#type-safe) explains. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/popover/ax#deterministic).

The Popover is the non-modal sibling of the [Dialog](/docs/components/dialog) and the interactive sibling of the [Tooltip](/docs/components/tooltip). It keeps the rules they settled for focus, `Escape` and the top layer, and the Dropdown Menu and the Combobox on our [Roadmap](/docs/getting-started/roadmap) will build on the ones it settles for placement and closing.

::popover-playground
::

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

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A popover meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Popover itself, so they're the ones to check when you build or review one. **Usage** rules are met by the screens that use it, like pointing its trigger at it with `popovertarget`, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like focus going back to the trigger: the Popover gives it back, as long as the trigger points at it.

The basis says where a rule comes from. Many of the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and several come from **HTML** and **WAI-ARIA**. The rest are **Open Components** rules, which are our own, like closing only the layer on top. Where a rule goes further than WCAG asks at level AA, its basis says so: one comes from level **AAA**, reduced motion, and a rule that asks for more than its criterion says **beyond**, like using the `popover` attribute, where WCAG would let you rebuild one by hand.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/popover/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/popover/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/popover/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/popover/ax#ax-checklist)

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
  /**
   * Draws an arrow that points at the trigger, on whichever side it opens, so it's clear which
   * trigger it belongs to when several sit close together. Turn it off with `false`.
   */
  arrow?: boolean;
  /** The close button's label, which screen readers read and voice control users say. */
  closeLabel?: string;
}

const {
  id,
  title,
  placement = "bottom",
  arrow = true,
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

// With an arrow: the side it opened on, from where its edges are against the trigger's, since
// the screen's edge can push a side popover off the trigger's centre, and the scale it grows
// in from only moves them inwards. Then the arrow across from the trigger's centre, or as
// close as the rounded corners allow.
function aim() {
  const el = popover.value;
  const part = arrowPart.value;
  if (!el || !part || !trigger) return;
  const a = trigger.getBoundingClientRect();
  const p = el.getBoundingClientRect();
  const x = p.left + p.width / 2;
  const y = p.top + p.height / 2;
  side.value = p.right <= a.left ? "left" : p.left >= a.right ? "right" : p.bottom <= a.top ? "top" : "bottom";
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
        size="xs"
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
    /* Set wide enough for a few options or a short form, so every popover is the same size. */
    --popover--width: 15rem;
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
    width: min(var(--popover--width), 100vw - 2rem);
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
  }
  /* An `xs` Button, 24 × 24px, the smallest target WCAG 2.5.8 allows, pulled up and out by
     its own padding, so its icon lines up with the title and the edge of the content. */
  .popover [data-slot="close"] {
    margin-block-start: -0.25rem;
    margin-inline-end: -0.25rem;
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
    expect(parts).toEqual(["header", "title", "close", "body", "arrow"]);
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

  it("draws an arrow by default, hidden from assistive technologies, and sets data-side once it opens", async () => {
    const user = userEvent.setup();
    page();
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

  it("points its arrow from the side it opened on when the screen's edge pushes it off the trigger's centre", async () => {
    const user = userEvent.setup();
    page({ placement: "start" });
    const arrow = popover().querySelector<HTMLElement>('[data-slot="arrow"]')!;
    // Beside a trigger near the bottom of the screen, pushed up so its centre is above the
    // trigger's, but wholly to its left.
    screen.getByRole("button", { name: "Filters" }).getBoundingClientRect = () => new DOMRect(400, 700, 100, 30);
    popover().getBoundingClientRect = () => new DOMRect(180, 580, 200, 200);
    popover().style.width = "200px";
    popover().style.height = "200px";
    popover().style.borderTopLeftRadius = "8px";
    arrow.style.width = "12px";

    await openFrom(user);
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-side", "left"));
    // Across from the trigger's centre, at 715, 135px down from the popover's top at 580.
    expect(arrow.style.top).toBe("135px");
  });

  it("has no arrow, and no data-side, when you turn it off", async () => {
    const user = userEvent.setup();
    page({ arrow: false });

    await openFrom(user);
    expect(popover()).toHaveAttribute("data-state", "open");
    expect(popover().querySelector('[data-slot="arrow"]')).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(popover()).not.toHaveAttribute("data-side");
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
