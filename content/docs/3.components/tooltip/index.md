---
title: Tooltip
description: How to build a tooltip that shows a short hint on hover and keyboard focus, that people can reach, read and dismiss, and that agents can check.
navigation:
  title: Overview
---

Tooltips show a short hint next to the element it's about, like the name of an icon-only button or what an action will do, when people hover or focus it. They're small, and they're everywhere, which is why they so often get in the way. Think of a tooltip that only opens for a mouse, so keyboard users never see it, one that vanishes as you move the pointer towards it to read it, or one with a link inside that nobody can ever click.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/tooltip/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a tooltip looks, from its parts and the two jobs it can do to where it opens, its states and its tokens.
:::

:::card{to="/docs/components/tooltip/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a tooltip behaves for every person, input and setting, so it's accessible, predictable, clear in every state and adaptive.
:::

:::card{to="/docs/components/tooltip/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Tooltip, with one consistent, typed API that you wrap around any trigger and that handles when to open, where and for whom.
:::

:::card{to="/docs/components/tooltip/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, build and check a tooltip, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/tooltip#reference-implementation), which does its part of every rule in the [checklist](/docs/components/tooltip#checklist), so hover or tab to the examples as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Tooltip with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/tooltip/ax#deterministic).

The Tooltip is one of the overlays on our [Roadmap](/docs/getting-started/roadmap), the components that sit on top of the page. The rules it settles for opening in the top layer and closing with `Escape` are the ones the Popover, the Dialog and the Dropdown Menu will follow too.

::tooltip-playground
::

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

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A tooltip meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Tooltip itself, so they're the ones to check when you build or review one. **Usage** rules are met by the screens that use it, like never hiding something people need in a tooltip, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like contrast: the Tooltip uses the theme's neutral pair, as long as your theme's pair passes.

The basis says where a rule comes from. A third of the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, most often [1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html), and a few come from **HTML** or **WAI-ARIA**. The rest are **Open Components** rules, which are our own, like opening one tooltip at a time. Where a rule goes further than WCAG asks at level AA, its basis says so: the reduced-motion rule comes from level **AAA**, and a rule that asks for more than its criterion says **beyond**, like keeping a disabled trigger focusable.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/tooltip/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/tooltip/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/tooltip/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/tooltip/ax#ax-checklist)

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
