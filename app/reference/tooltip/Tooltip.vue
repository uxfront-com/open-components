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

const { label, type = "description", delay = 500, placement = "top" } = defineProps<TooltipProps>();

defineSlots<{
  /** The trigger, which binds `trigger` on its focusable element. */
  default: (props: { trigger: TooltipTrigger }) => unknown;
}>();

// The ID, and the anchor's name made from it, are set once it mounts: the one you pass, or a
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
const tooltip = useTemplateRef<HTMLElement>("tooltip");

let anchor: HTMLElement | undefined;
let hovered = false;
let focused = false;
let touched = false;
// A tap doesn't always focus the trigger, like in Safari on iOS, or when it turns into a
// scroll, so the next key press, like the Tab that moves focus, forgets it.
const untouch = () => (touched = false);
let opening: ReturnType<typeof setTimeout> | undefined;
let closing: ReturnType<typeof setTimeout> | undefined;

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
  if (!anchored()) {
    // Once it's shown, so it has a size to measure.
    nextTick(place);
    addEventListener("scroll", place, { capture: true, passive: true });
    addEventListener("resize", place);
  }
}

function hide() {
  clearTimeout(opening);
  clearTimeout(closing);
  if (state.value === "closed") return;
  state.value = "closed";
  tooltip.value?.hidePopover?.();
  document.removeEventListener("keydown", onKeydown, true);
  removeEventListener("scroll", place, { capture: true });
  removeEventListener("resize", place);
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

// Without anchor positioning: the chosen side of the trigger, or the other side when it
// doesn't fit, centred on the trigger and kept inside the viewport.
function place() {
  const el = tooltip.value;
  if (!el || !anchor) return;
  // Its margin is the gap, which `left` and `top` place it outside of.
  const gap = parseFloat(getComputedStyle(el).marginTop) || 0;
  const a = anchor.getBoundingClientRect();
  const { width, height } = el.getBoundingClientRect();
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
    :style="anchorName && { 'position-anchor': anchorName }"
    @pointerenter="onTooltipEnter"
    @pointerleave="onTooltipLeave"
  >{{ label }}</span>
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
    --tooltip--font-size: 0.75rem;
    --tooltip--padding: 0.25rem 0.5rem;
    --tooltip--radius: 0.375rem;
    /* In ch, so long text wraps at about 32 characters, however big the text gets. */
    --tooltip--max-width: 32ch;
    /* The gap between the trigger and the tooltip. */
    --tooltip--offset: 0.5rem;

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
  .tooltip[data-placement="start"] {
    position-area: inline-start;
  }
  .tooltip[data-placement="end"] {
    position-area: inline-end;
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
