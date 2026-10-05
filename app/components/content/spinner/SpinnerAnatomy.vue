<script setup lang="ts">
import Spinner from "~/reference/spinner/Spinner.vue";

/**
 * The parts of a spinner, numbered on a large, still reference Spinner, the same
 * as ButtonAnatomy on the Button page. The list the numbers point to is the
 * default slot, so the page's markdown keeps it:
 *
 * ```md
 * ::spinner-anatomy
 * 1. **Container** — The `<svg>`.
 * 2. **Track** — A faint full circle.
 * 3. **Indicator** — A quarter of the circle, at full strength.
 * ::
 * ```
 */
</script>

<template>
  <figure class="spinner-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-6 py-14" inert aria-hidden="true">
      <div class="anatomy-stage text-highlighted">
        <span class="anatomy-marker anatomy-marker-container">1</span>
        <Spinner class="anatomy-spinner" />
        <span class="anatomy-marker anatomy-marker-track">2</span>
        <span class="anatomy-marker anatomy-marker-indicator">3</span>
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style scoped>
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

.anatomy-stage {
  position: relative;
  display: inline-flex;
}
.anatomy-marker {
  position: absolute;
}
/* The container's number sits before it, the track's below the bottom of the
   circle, where there's only track, and the indicator's by its top right quarter. */
.anatomy-marker-container {
  top: 50%;
  right: calc(100% + 0.875rem);
  translate: 0 -50%;
}
.anatomy-marker-track {
  top: calc(100% + 0.875rem);
  left: 50%;
  translate: -50% 0;
}
.anatomy-marker-indicator {
  bottom: calc(100% - 0.25rem);
  left: calc(100% - 0.25rem);
}

/* Large and still, with the indicator in its starting place, and the container
   outlined like the Button's parts. */
.anatomy-spinner {
  --spinner--size: 6rem;

  animation: none;
  outline: 1px dashed color-mix(in srgb, currentColor 70%, transparent);
  outline-offset: 3px;
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
