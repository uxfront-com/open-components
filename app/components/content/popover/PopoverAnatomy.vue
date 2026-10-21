<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of a popover, numbered on a Filters Button with its popover drawn open below
 * it, the same as ButtonAnatomy on the Button page. The popover is a picture of the
 * reference Popover, at its size and with its arrow, since a real one opens in the top layer.
 * The list the numbers point to is the default slot, so the page's markdown keeps it:
 *
 * ```md
 * ::popover-anatomy
 * 1. **Trigger** — The Button that opens it.
 * 2. **Panel** — The popover itself.
 * …
 * ::
 * ```
 */
</script>

<template>
  <figure class="popover-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-6 pt-8 pb-8" inert aria-hidden="true">
      <div class="anatomy-stage">
        <Button variant="outline" class="anatomy-trigger">Filters</Button>
        <span class="anatomy-marker anatomy-marker-trigger">1</span>
        <span class="anatomy-marker anatomy-marker-offset">6</span>
        <div class="anatomy-panel">
          <span class="anatomy-arrow" />
          <div class="anatomy-header">
            <span class="anatomy-title">Filters</span>
            <span class="anatomy-close"><UIcon name="i-lucide-x" mode="svg" /></span>
          </div>
          <div class="anatomy-body">
            <span class="anatomy-option"><span class="anatomy-box anatomy-box-checked" />Open issues only</span>
            <span class="anatomy-option"><span class="anatomy-box" />Assigned to me</span>
          </div>
          <span class="anatomy-marker anatomy-marker-panel">2</span>
          <span class="anatomy-marker anatomy-marker-title">3</span>
          <span class="anatomy-marker anatomy-marker-close">4</span>
          <span class="anatomy-marker anatomy-marker-body">5</span>
          <span class="anatomy-marker anatomy-marker-arrow">7</span>
        </div>
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style scoped>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.popover-anatomy {
  color-scheme: light;
}
:global(.dark) .popover-anatomy {
  color-scheme: dark;
}

.anatomy-marker,
.anatomy-parts :deep(li)::before {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  background: var(--ui-bg-inverted);
  color: var(--ui-bg);
  font-size: 0.6875rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.anatomy-marker {
  position: absolute;
}

.anatomy-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* The popover's offset, wider than usual, so the offset's number fits beside it. */
  gap: 1.5rem;
}
.anatomy-trigger {
  outline: 1px dashed color-mix(in srgb, var(--ui-text-highlighted) 70%, transparent);
  outline-offset: 3px;
}

/* The reference Popover's look, with its own values: its width, padding, gap, border,
   radius, shadow and type. Change them together. */
.anatomy-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 15rem;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  border-radius: 0.5rem;
  background-color: Canvas;
  box-shadow: 0 0.25rem 1rem color-mix(in srgb, #000 15%, transparent);
  color: var(--color--neutral-text);
  font-size: 0.875rem;
  line-height: 1.5;
  outline: 1px dashed color-mix(in srgb, var(--ui-text-highlighted) 70%, transparent);
  outline-offset: 3px;
}
/* The arrow, like the reference's: a square turned 45deg, half of it past the edge. */
.anatomy-arrow {
  position: absolute;
  top: 0;
  left: 50%;
  width: 0.75rem;
  height: 0.75rem;
  border: inherit;
  border-right-width: 0;
  border-bottom-width: 0;
  background: inherit;
  translate: -50% -50%;
  rotate: 45deg;
}
.anatomy-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
}
.anatomy-title {
  font-weight: 600;
}
/* Its close button, an `xs` Button: 24 × 24px, with a 14px icon. */
.anatomy-close {
  display: inline-flex;
  margin: -0.25rem -0.25rem 0 0;
  padding: 0.3125rem;
  border-radius: 0.375rem;
}
.anatomy-close :deep(svg) {
  width: 0.875rem;
  height: 0.875rem;
}
.anatomy-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.anatomy-option {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.anatomy-box {
  width: 1rem;
  height: 1rem;
  border: 1px solid color-mix(in srgb, currentColor 50%, transparent);
  border-radius: 0.25rem;
}
.anatomy-box-checked {
  border-color: var(--color--neutral);
  background: var(--color--neutral);
}

/* The trigger's number sits before it, the offset's beside the gap, and each of the
   panel's before or after the part it names. */
.anatomy-marker-trigger {
  top: 1.25rem;
  right: calc(50% + 3.25rem);
  translate: 0 -50%;
}
.anatomy-marker-offset {
  /* Halfway down the gap, beside the arrow. */
  top: calc(2.5rem + 0.75rem);
  left: calc(50% + 1.25rem);
  translate: 0 -50%;
}
.anatomy-marker-panel {
  top: 50%;
  right: calc(100% + 0.875rem);
  translate: 0 -50%;
}
.anatomy-marker-title {
  top: 1.65rem;
  left: 4.5rem;
  translate: 0 -50%;
}
.anatomy-marker-close {
  top: 1.65rem;
  left: calc(100% + 0.875rem);
  translate: 0 -50%;
}
.anatomy-marker-body {
  bottom: 1.75rem;
  left: calc(100% + 0.875rem);
  translate: 0 50%;
}
.anatomy-marker-arrow {
  top: 0;
  right: calc(50% + 1.25rem);
  translate: 0 -50%;
}

/* The list from the markdown, numbered with the same markers. */
.anatomy-parts :deep(ol) {
  display: grid;
  gap: 0.5rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: part;
}
.anatomy-parts :deep(li) {
  position: relative;
  margin: 0;
  padding-left: 2rem;
  color: var(--ui-text-muted);
  line-height: 1.25rem;
  counter-increment: part;
}
.anatomy-parts :deep(li)::before {
  content: counter(part);
  position: absolute;
  top: 0;
  left: 0;
}
.anatomy-parts :deep(strong) {
  color: var(--ui-text-highlighted);
  font-weight: 600;
}
/* Small enough to keep the lines evenly spaced. */
.anatomy-parts :deep(code) {
  padding: 0 0.25rem;
  font-size: 0.75rem;
  line-height: 1rem;
}
</style>
