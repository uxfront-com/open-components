<script setup lang="ts">
import Field from "~/reference/field/Field.vue";
import Input from "~/reference/input/Input.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of a field, numbered on a large reference Field around an Input. The list
 * the numbers point to is the default slot, so the page's markdown keeps it:
 *
 * ```md
 * ::field-anatomy
 * 1. **Container** — The root `<div>`, which lays out the parts.
 * 2. **Label** — The `<label>`, which names the control.
 * ::
 * ```
 */
</script>

<template>
  <figure class="field-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-6 py-10" inert aria-hidden="true">
      <div class="anatomy-stage">
        <span class="anatomy-marker anatomy-marker-container">1</span>
        <Field
          id="anatomy-email"
          size="lg"
          label="Email address"
          hint="We'll only use it to send your receipt"
          error="Enter your email address"
          class="anatomy-field"
        >
          <Input type="email" tabindex="-1" />
        </Field>
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.field-anatomy {
  color-scheme: light;
}
.dark .field-anatomy {
  color-scheme: dark;
}
</style>

<style scoped>
.anatomy-marker,
.anatomy-field > :deep(*)::after,
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

/* Every number sits before what it names, the container's above it. */
.anatomy-stage {
  --anatomy--distance: 0.75rem;

  position: relative;
  display: flex;
  /* Room for the numbers before the field, on the narrowest screens too. */
  width: min(20rem, 100% - 3rem);
  padding-top: 1.75rem;
}
.anatomy-marker-container {
  position: absolute;
  top: 0;
  right: calc(100% + var(--anatomy--distance));
}
.anatomy-field {
  flex: 1;
  counter-reset: anatomy 1;
  outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);
  outline-offset: 0.375rem;
}
/* Each part is outlined, and numbered in the order it renders, from 2. */
.anatomy-field > :deep(*) {
  position: relative;
  counter-increment: anatomy;
}
.anatomy-field > :deep([data-slot]) {
  outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);
  outline-offset: 2px;
}
.anatomy-field > :deep(*)::after {
  content: counter(anatomy);
  position: absolute;
  top: 50%;
  right: calc(100% + var(--anatomy--distance));
  translate: 0 -50%;
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
