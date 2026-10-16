<script setup lang="ts">
import Checkbox from "~/reference/checkbox/Checkbox.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of a checkbox, numbered on a reference Checkbox drawn at three times
 * its `md` size. The list the numbers point to is the default slot, so the page's
 * markdown keeps it:
 *
 * ```md
 * ::checkbox-anatomy
 * 1. **Container** — The `<label>`, which wraps the box and its label.
 * 2. **Box** — The `<input type="checkbox">` itself.
 * ::
 * ```
 */
</script>

<template>
  <figure class="checkbox-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-6 py-16" inert aria-hidden="true">
      <div class="anatomy-stage">
        <span class="anatomy-marker anatomy-marker-container">1</span>
        <Checkbox checked tabindex="-1" class="anatomy-checkbox">
          <span class="anatomy-part">Email me<span class="anatomy-marker anatomy-marker-part">4</span></span>
          <!-- The <input> can't hold markers of its own, so the label places the ones around the box. -->
          <span class="anatomy-hit-area" />
          <span class="anatomy-marker anatomy-marker-box">2</span>
          <span class="anatomy-marker anatomy-marker-indicator">3</span>
          <span class="anatomy-marker anatomy-marker-hit-area">5</span>
          <span class="anatomy-marker anatomy-marker-focus">6</span>
        </Checkbox>
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.checkbox-anatomy {
  color-scheme: light;
}
.dark .checkbox-anatomy {
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
  /* How far a number sits from what it names, and how far the container's outline sits from it. */
  --anatomy--distance: 0.625rem;
  --anatomy--container: 1rem;

  position: relative;
  display: flex;
}
.anatomy-marker {
  position: absolute;
}
.anatomy-marker::before {
  content: "";
  position: absolute;
  background: var(--ui-bg-inverted);
}

/* The checkbox at three times its md size, set from a class, as you'd tune your own,
   with its focus ring showing and its container outlined. */
.anatomy-checkbox {
  --checkbox--box--size: 3.375rem;
  --checkbox--box--radius: 0.75rem;
  --checkbox--gap: 1.5rem;
  --checkbox--font-size: 2.25rem;
  --checkbox--hit-area--size: 4.5rem;
  /* How far the box sits from the top of its hit area. */
  --anatomy--inset: calc((var(--checkbox--hit-area--size) - var(--checkbox--box--size)) / 2);

  outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);
  outline-offset: var(--anatomy--container);
}
.anatomy-checkbox > :deep([data-slot="box"]) {
  outline: 2px solid var(--color--focus);
  outline-offset: 2px;
}

/* The container's number sits before it, and its line ends on its outline. */
.anatomy-marker-container {
  top: 50%;
  right: calc(100% + var(--anatomy--container) + var(--anatomy--distance));
  translate: 0 -50%;
}
.anatomy-marker-container::before {
  top: 50%;
  left: 100%;
  width: var(--anatomy--distance);
  height: 1px;
}

/* The label's number sits above it, and its line ends on its outline. */
.anatomy-part {
  position: relative;
  display: inline-flex;
  outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);
  outline-offset: 2px;
}
.anatomy-marker-part {
  /* Its line of text sits this far below the top of the checkbox. */
  --anatomy--rise: calc((var(--checkbox--hit-area--size) - 1.25 * var(--checkbox--font-size)) / 2);

  bottom: calc(100% + var(--anatomy--rise) + var(--anatomy--container) + var(--anatomy--distance));
  left: 50%;
  translate: -50% 0;
}
.anatomy-marker-part::before {
  top: 100%;
  left: 50%;
  width: 1px;
  height: calc(var(--anatomy--rise) + var(--anatomy--container) + var(--anatomy--distance) - 2px);
}

/* The hit area, outlined where the reference implementation's ::before sits. */
.anatomy-hit-area {
  position: absolute;
  top: 0;
  left: calc(-1 * var(--anatomy--inset));
  width: var(--checkbox--hit-area--size);
  height: var(--checkbox--hit-area--size);
  outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);
}

/* The box's and the indicator's numbers sit above the checkbox, over the box, and the
   hit area's and the focus ring's below it. Their lines cross the container's outline. */
.anatomy-marker-box,
.anatomy-marker-indicator {
  bottom: calc(100% + var(--anatomy--container) + var(--anatomy--distance));
  translate: -50% 0;
}
.anatomy-marker-hit-area,
.anatomy-marker-focus {
  top: calc(100% + var(--anatomy--container) + var(--anatomy--distance));
  translate: -50% 0;
}
.anatomy-marker-box,
.anatomy-marker-hit-area {
  left: calc(var(--checkbox--box--size) * 0.25);
}
.anatomy-marker-indicator,
.anatomy-marker-focus {
  left: calc(var(--checkbox--box--size) * 0.75);
}
.anatomy-marker-box::before,
.anatomy-marker-indicator::before {
  top: 100%;
  left: 50%;
  width: 1px;
}
.anatomy-marker-hit-area::before,
.anatomy-marker-focus::before {
  bottom: 100%;
  left: 50%;
  width: 1px;
}
/* To the top of the box's border. */
.anatomy-marker-box::before {
  height: calc(var(--anatomy--container) + var(--anatomy--distance) + var(--anatomy--inset));
}
/* To the check, which starts a quarter of the way down the box at this point. */
.anatomy-marker-indicator::before {
  height: calc(var(--anatomy--container) + var(--anatomy--distance) + var(--anatomy--inset) + var(--checkbox--box--size) * 0.3);
}
/* To the bottom of the hit area, which is the bottom of the checkbox. */
.anatomy-marker-hit-area::before {
  height: calc(var(--anatomy--container) + var(--anatomy--distance));
}
/* To the focus ring, which reaches 4px past the box. */
.anatomy-marker-focus::before {
  height: calc(var(--anatomy--container) + var(--anatomy--distance) + var(--anatomy--inset) - 4px);
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
