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

// The trigger is the button the browser says opened it, where it says so, or else the
// first one that points at it with `popovertarget`. TypeScript doesn't know `source` yet.
function findTrigger(event: Event) {
  const { source } = event as ToggleEvent & { source?: Element | null };
  if (source instanceof HTMLElement) return source;
  return document.querySelector<HTMLElement>(`[popovertarget="${id.replace(/["\\]/g, "\\$&")}"]`);
}

function onBeforetoggle(event: Event) {
  const el = popover.value!;
  if ((event as ToggleEvent).newState === "open") {
    trigger = findTrigger(event);
    opener = document.activeElement as HTMLElement | null;
    if (trigger && anchorName.value) trigger.style.setProperty("anchor-name", anchorName.value);
    return;
  }
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
// the document, so a tooltip inside it, which stops Escape on the document, closes first and
// alone. Cancelling it also keeps the browser from closing anything else on it.
function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || event.defaultPrevented || state.value !== "open") return;
  event.preventDefault();
  event.stopPropagation();
  dismiss("escape");
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
    if (value && state.value === "closed") el.showPopover();
    else if (!value && state.value === "open") dismiss(null);
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
  if (open.value) popover.value?.showPopover?.();

  if (import.meta.env.DEV && !title.trim()) {
    console.warn("[Popover] has no title: give it one, since it's what names the popover.", popover.value);
  }
});

onBeforeUnmount(() => {
  if (state.value === "open") dismiss(null);
  listen(false);
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

    /* Beside the trigger, centred on it, and on the other side when there's no room. */
    position: fixed;
    position-area: bottom;
    position-try-fallbacks: flip-block, flip-inline;
    inset: auto;
    margin: var(--popover--offset);
    box-sizing: border-box;
    flex-direction: column;
    gap: var(--popover--gap);
    /* Never wider or taller than the screen, less 16px on each side, so it fits at 320px wide. */
    width: max-content;
    max-width: min(var(--popover--max-width), 100vw - 2rem);
    max-height: calc(100vh - 2rem);
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
</style>
