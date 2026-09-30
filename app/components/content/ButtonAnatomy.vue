<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of a button, numbered on a large reference Button. The list the
 * numbers point to is the default slot, so the page's markdown keeps it:
 *
 * ```md
 * ::button-anatomy
 * 1. **Container** — The `<button>`, or the `<a href>` when it navigates.
 * 2. **Leading icon** — Optional.
 * ::
 * ```
 */
</script>

<template>
  <figure class="button-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-6 py-14" inert aria-hidden="true">
      <div class="anatomy-stage">
        <span class="anatomy-marker anatomy-marker-container">1</span>
        <Button color="primary" size="xl" class="anatomy-button">
          <template #leading><UIcon name="i-lucide-plus" /></template>
          New project
          <template #trailing><UIcon name="i-lucide-chevron-down" /></template>
        </Button>
        <span class="anatomy-marker anatomy-marker-focus">5</span>
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.button-anatomy {
  color-scheme: light;
}
.dark .button-anatomy {
  color-scheme: dark;
}
</style>

<style scoped>
.anatomy-marker,
.anatomy-button :deep([data-slot])::after,
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
.anatomy-marker-container,
.anatomy-marker-focus {
  position: absolute;
}
/* The container's number sits before it, the focus ring's below it. */
.anatomy-marker-container {
  top: 50%;
  right: calc(100% + 0.875rem);
  translate: 0 -50%;
}
.anatomy-marker-focus {
  top: calc(100% + 0.875rem);
  left: 50%;
  translate: -50% 0;
}

/* The button, focused, with its parts outlined and numbered like the list. */
.anatomy-button {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
.anatomy-button :deep([data-slot]) {
  position: relative;
  outline: 1px dashed color-mix(in srgb, currentColor 70%, transparent);
  outline-offset: 3px;
}
.anatomy-button :deep([data-slot])::after {
  position: absolute;
  bottom: calc(100% + 0.875rem);
  left: 50%;
  translate: -50% 0;
}
.anatomy-button :deep([data-slot="leading"])::after {
  content: "2";
}
.anatomy-button :deep([data-slot="label"])::after {
  content: "3";
}
.anatomy-button :deep([data-slot="trailing"])::after {
  content: "4";
}

/* The list from the markdown, numbered with the same markers: three parts down
   the first column, the rest down the second. */
.anatomy-parts :deep(ol) {
  display: grid;
  gap: 0.5rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: part;
}
@media (min-width: 40rem) {
  .anatomy-parts :deep(ol) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(3, auto);
    grid-auto-flow: column;
  }
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
