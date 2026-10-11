<script setup lang="ts">
import Textarea from "~/reference/textarea/Textarea.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of a textarea, numbered on a large reference Textarea. The list the
 * numbers point to is the default slot, so the page's markdown keeps it:
 *
 * ```md
 * ::textarea-anatomy
 * 1. **Container** — The root `<div>`, which carries the size.
 * 2. **Control** — The `<textarea>`.
 * ::
 * ```
 */
</script>

<template>
  <figure class="textarea-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-6 py-10" inert aria-hidden="true">
      <div class="anatomy-stage">
        <span class="anatomy-marker anatomy-marker-container">1</span>
        <span class="anatomy-marker anatomy-marker-control">2</span>
        <span class="anatomy-marker anatomy-marker-resize">3</span>
        <span class="anatomy-marker anatomy-marker-count">4</span>
        <span class="anatomy-marker anatomy-marker-focus">5</span>
        <Textarea
          id="anatomy-bio"
          size="lg"
          :rows="3"
          :limit="160"
          value="Mathematician and writer, known for her work on the Analytical Engine."
          aria-label="Bio"
          tabindex="-1"
          class="anatomy-textarea"
        />
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.textarea-anatomy {
  color-scheme: light;
}
.dark .textarea-anatomy {
  color-scheme: dark;
}
</style>

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

/* Every number sits right beside what it names, and a line joins the two. */
.anatomy-stage {
  /* How far a number sits from what it names. */
  --anatomy--distance: 0.625rem;
  /* The field's height at size lg: three rows of 24px, with their padding and border. */
  --anatomy--field: calc(3 * 1.5rem + 2 * ((2.5rem - 1.5rem) / 2 - 1px) + 2px);

  position: relative;
  /* Room for the numbers on either side, on the narrowest screens too. */
  width: min(22rem, 100% - 4rem);
}
.anatomy-marker {
  position: absolute;
  z-index: 1;
}
.anatomy-marker::before {
  content: "";
  position: absolute;
  background: var(--ui-bg-inverted);
}

/* The container's number sits before it, level with the field, and its line ends
   on the container's dashed outline. */
.anatomy-marker-container {
  top: 2rem;
  right: calc(100% + var(--anatomy--distance) + 0.5rem);
}
.anatomy-marker-container::before {
  top: 50%;
  left: 100%;
  width: calc(var(--anatomy--distance) + 0.5rem);
  height: 1px;
}
/* The control's number sits above the field, over the start of its text. */
.anatomy-marker-control {
  bottom: calc(100% + var(--anatomy--distance) + 0.5rem);
  left: 2rem;
}
.anatomy-marker-control::before {
  top: 100%;
  left: 50%;
  width: 1px;
  height: calc(var(--anatomy--distance) + 0.5rem + 0.875rem);
}
/* The resize handle's number sits past the field's end, level with its bottom corner. */
.anatomy-marker-resize {
  top: calc(var(--anatomy--field) - 1.25rem);
  left: calc(100% + var(--anatomy--distance) + 0.5rem);
}
.anatomy-marker-resize::before {
  top: 50%;
  right: 100%;
  width: calc(var(--anatomy--distance) + 0.5rem + 0.5rem);
  height: 1px;
}
/* The count's number sits past its end, level with it. */
.anatomy-marker-count {
  bottom: -0.125rem;
  left: calc(100% + var(--anatomy--distance) + 0.5rem);
}
.anatomy-marker-count::before {
  top: 50%;
  right: 100%;
  width: var(--anatomy--distance);
  height: 1px;
}
/* The focus ring's number sits above the field's end, and its line ends on the ring. */
.anatomy-marker-focus {
  bottom: calc(100% + var(--anatomy--distance) + 0.5rem);
  right: 2rem;
}
.anatomy-marker-focus::before {
  top: 100%;
  left: 50%;
  width: 1px;
  height: calc(var(--anatomy--distance) + 0.5rem - 4px);
}

/* The textarea, focused, with its container outlined around it. */
.anatomy-textarea {
  outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);
  outline-offset: 0.5rem;
}
.anatomy-textarea > :deep([data-slot="control"]) {
  outline: 2px solid var(--color--focus);
  outline-offset: 2px;
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
