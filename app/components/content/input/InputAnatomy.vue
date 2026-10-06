<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Input from "~/reference/input/Input.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of an input, numbered on a large reference Input. The list the
 * numbers point to is the default slot, so the page's markdown keeps it:
 *
 * ```md
 * ::input-anatomy
 * 1. **Container** — The root `<div>`, which draws the field.
 * 2. **Leading** — Optional.
 * ::
 * ```
 */
</script>

<template>
  <figure class="input-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-6 py-14" inert aria-hidden="true">
      <div class="anatomy-stage">
        <span class="anatomy-marker anatomy-marker-container">1</span>
        <Input size="xl" value="1,250.00" aria-label="Price, in US dollars" tabindex="-1" class="anatomy-input">
          <template #leading>
            <span class="anatomy-part">$<span class="anatomy-marker anatomy-marker-part">2</span></span>
            <!-- An <input> can't hold a marker of its own, so the leading part places the control's. -->
            <span class="anatomy-marker anatomy-marker-part anatomy-marker-control">3</span>
          </template>
          <template #trailing>
            <span class="anatomy-part">USD<span class="anatomy-marker anatomy-marker-part">4</span></span>
          </template>
          <template #actions>
            <span class="anatomy-part anatomy-part-actions">
              <Button label="Clear" variant="ghost" size="md" icon-only tabindex="-1">
                <template #leading><UIcon name="i-lucide-x" /></template>
              </Button>
              <span class="anatomy-marker anatomy-marker-part">5</span>
            </span>
          </template>
        </Input>
        <span class="anatomy-marker anatomy-marker-focus">6</span>
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.input-anatomy {
  color-scheme: light;
}
.dark .input-anatomy {
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
  /* How far a number sits from the field, and how far a part's outline sits from the part. */
  --anatomy--distance: 0.625rem;
  --anatomy--outline: 2px;

  position: relative;
  display: flex;
  /* Room for the container's number before the field, on the narrowest screens too. */
  width: min(20rem, 100% - 4rem);
}
.anatomy-marker {
  position: absolute;
}
.anatomy-marker::before {
  content: "";
  position: absolute;
  background: var(--ui-bg-inverted);
}

/* The container's number sits before the field, and its line crosses the focus ring
   to end on the border. */
.anatomy-marker-container {
  top: 50%;
  right: calc(100% + var(--anatomy--distance) + 4px);
  translate: 0 -50%;
}
.anatomy-marker-container::before {
  top: 50%;
  left: 100%;
  width: calc(var(--anatomy--distance) + 4px);
  height: 1px;
}
/* The focus ring's number sits below the field, and its line ends on the ring,
   which reaches 4px past the border. */
.anatomy-marker-focus {
  top: calc(100% + var(--anatomy--distance) + 4px);
  left: 50%;
  translate: -50% 0;
}
.anatomy-marker-focus::before {
  bottom: 100%;
  left: 50%;
  width: 1px;
  height: var(--anatomy--distance);
}

/* The input, focused. */
.anatomy-input {
  /* How far a line of text sits below the top of the field, which centres it. */
  --anatomy--rise: calc((var(--input--height) - 1.25 * var(--input--font-size)) / 2);

  flex: 1;
  outline: 2px solid var(--color--focus);
  outline-offset: 2px;
}
/* Its parts side by side, rather than overlapping the control's padding as they do
   in the reference implementation, so each one's outline holds that part alone. */
.anatomy-input > :deep([data-slot="leading"]) {
  position: relative;
  margin-inline-end: 0;
}
.anatomy-input > :deep([data-slot="control"]) {
  align-self: center;
  margin-inline: var(--input--gap);
  padding-inline: 0;
  border-radius: 0;
}
.anatomy-input > :deep([data-slot="control"] + [data-slot]) {
  margin-inline-start: 0;
}
/* Each part is outlined, the Button among the actions as a whole. */
.anatomy-part {
  position: relative;
  display: inline-flex;
}
.anatomy-part,
.anatomy-input > :deep([data-slot="control"]) {
  outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);
  outline-offset: var(--anatomy--outline);
}
.anatomy-part-actions {
  /* The Button is taller than a line of text, so it sits closer to the top of the field. */
  --anatomy--rise: calc((var(--input--height) - 2.25rem) / 2);
}

/* A part's number sits above the field, over the part, and its line runs down
   to the part's outline. */
.anatomy-marker-part {
  bottom: calc(100% + var(--anatomy--rise) + var(--anatomy--distance) + 4px);
  left: 50%;
  translate: -50% 0;
}
.anatomy-marker-part::before {
  top: 100%;
  left: 50%;
  width: 1px;
  height: calc(var(--anatomy--rise) + var(--anatomy--distance) + 4px - var(--anatomy--outline));
}
/* The control's, over the start of its value. */
.anatomy-marker-control {
  left: calc(100% + var(--input--gap) + 2rem);
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
