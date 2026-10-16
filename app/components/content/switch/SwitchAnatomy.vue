<script setup lang="ts">
import Switch from "~/reference/switch/Switch.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of a switch, numbered on a large reference Switch that's on. The list
 * the numbers point to is the default slot, so the page's markdown keeps it:
 *
 * ```md
 * ::switch-anatomy
 * 1. **Control** — The `<input>`, laid over the track.
 * 2. **Track** — The bar the thumb moves along.
 * ::
 * ```
 */
</script>

<template>
  <figure class="switch-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-6 py-16" inert aria-hidden="true">
      <div class="anatomy-stage">
        <span class="anatomy-marker anatomy-marker-control">1</span>
        <span class="anatomy-marker anatomy-marker-track">2</span>
        <span class="anatomy-marker anatomy-marker-thumb">3</span>
        <span class="anatomy-marker anatomy-marker-focus">4</span>
        <Switch size="xl" checked aria-label="Wi-Fi" tabindex="-1" class="anatomy-switch" />
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.switch-anatomy {
  color-scheme: light;
}
.dark .switch-anatomy {
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
  /* How far a number sits from what it names, and how far the control's outline sits
     outside the track. */
  --anatomy--distance: 0.625rem;
  --anatomy--outline: 0.5rem;

  position: relative;
  display: inline-flex;
}
.anatomy-marker {
  position: absolute;
  z-index: 2;
}
.anatomy-marker::before {
  content: "";
  position: absolute;
  background: var(--ui-bg-inverted);
}

/* A large switch, focused, with the control drawn as a dashed outline around the
   track, where it lies. The thumb's centre and top follow from these values. */
.anatomy-switch {
  --switch--track--width: 4.5rem;
  --switch--track--height: 2.5rem;
  --switch--thumb--offset: 0.25rem;
}
.anatomy-switch > :deep([data-slot="control"]) {
  width: 100%;
  height: 100%;
  appearance: none;
  border-radius: 999px;
  outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);
  outline-offset: var(--anatomy--outline);
  opacity: 1;
}
.anatomy-switch > :deep([data-slot="track"]) {
  outline: 2px solid var(--color--focus);
  outline-offset: 2px;
}

/* The control's number sits above, and its line runs down to the dashed outline. */
.anatomy-marker-control {
  bottom: calc(100% + var(--anatomy--outline) + var(--anatomy--distance));
  left: 1.25rem;
  translate: -50% 0;
}
.anatomy-marker-control::before {
  top: 100%;
  left: 50%;
  width: 1px;
  height: var(--anatomy--distance);
}
/* The track's number sits below, and its line crosses the focus ring to the track. */
.anatomy-marker-track {
  top: calc(100% + var(--anatomy--outline) + var(--anatomy--distance));
  left: 1.25rem;
  translate: -50% 0;
}
.anatomy-marker-track::before {
  bottom: 100%;
  left: 50%;
  width: 1px;
  height: calc(var(--anatomy--outline) + var(--anatomy--distance));
}
/* The thumb's number sits above the thumb, at the end of the track, and its line runs
   down to the thumb's top, 1px of border and the offset inside the track. */
.anatomy-marker-thumb {
  bottom: calc(100% + var(--anatomy--outline) + var(--anatomy--distance));
  left: calc(100% - 1.25rem);
  translate: -50% 0;
}
.anatomy-marker-thumb::before {
  top: 100%;
  left: 50%;
  width: 1px;
  height: calc(var(--anatomy--outline) + var(--anatomy--distance) + 0.25rem + 1px);
}
/* The focus ring's number sits after the switch, and its line ends on the ring, which
   reaches 4px past the track. */
.anatomy-marker-focus {
  top: 50%;
  left: calc(100% + 4px + var(--anatomy--distance));
  translate: 0 -50%;
}
.anatomy-marker-focus::before {
  top: 50%;
  right: 100%;
  width: var(--anatomy--distance);
  height: 1px;
}

/* The list from the markdown, numbered with the same markers: two parts down each column. */
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
    grid-template-rows: repeat(2, auto);
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
