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
