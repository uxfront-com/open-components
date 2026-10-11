<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Card from "~/reference/card/Card.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of a card, numbered on a reference Card that's a link, with every part
 * and its focus ring. The list the numbers point to is the default slot, so the
 * page's markdown keeps it:
 *
 * ```md
 * ::card-anatomy
 * 1. **Container** — The root, an `<article>` by default.
 * 2. **Media** — Optional.
 * ::
 * ```
 */
</script>

<template>
  <figure class="card-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-6 py-14" inert aria-hidden="true">
      <div class="anatomy-stage">
        <span class="anatomy-marker anatomy-marker-container">1</span>
        <Card href="#analytical-engine" class="anatomy-card">
          <template #media>
            <CardExampleArt />
            <span class="anatomy-marker anatomy-marker-part anatomy-marker-edge">2</span>
          </template>
          <template #eyebrow>Project<span class="anatomy-marker anatomy-marker-part">3</span></template>
          <template #heading>Analytical Engine<span class="anatomy-marker anatomy-marker-part">4</span></template>
          <p>A general-purpose mechanical computer.</p>
          <span class="anatomy-marker anatomy-marker-part">5</span>
          <template #footer>
            <Button size="sm" variant="outline" tabindex="-1">Save</Button>
            <span class="anatomy-marker anatomy-marker-part">6</span>
          </template>
        </Card>
        <span class="anatomy-marker anatomy-marker-focus">7</span>
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.card-anatomy {
  color-scheme: light;
}
.dark .card-anatomy {
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

/* Every number sits beside what it names, and a line joins the two. */
.anatomy-stage {
  /* How far a number sits from the card's focus ring, and a part's outline from the part. */
  --anatomy--distance: 0.625rem;
  --anatomy--outline: 2px;

  position: relative;
  display: flex;
  /* Room for the numbers on both sides, on the narrowest screens too. */
  width: min(17rem, 100% - 5rem);
}
.anatomy-marker {
  position: absolute;
}
.anatomy-marker::before {
  content: "";
  position: absolute;
  background: var(--ui-bg-inverted);
}

/* The container's number sits before the card, and its line crosses the focus ring
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
/* The focus ring's number sits below the card, and its line ends on the ring,
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

/* The card, focused, with each part outlined, and placed so a number can sit beside it. */
.anatomy-card {
  flex: 1;
  outline: 2px solid var(--color--focus);
  outline-offset: 2px;
}
.anatomy-card > :deep(:is([data-slot="media"], [data-slot="body"], [data-slot="footer"])),
.anatomy-card :deep(:is([data-slot="eyebrow"], [data-slot="heading"])) {
  position: relative;
  outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);
  outline-offset: var(--anatomy--outline);
}
/* The media's number sits outside it, so the media shows it, and rounds the image instead. */
.anatomy-card > :deep([data-slot="media"]) {
  overflow: visible;
  outline-offset: calc(-1 * var(--anatomy--outline));
}
.anatomy-card > :deep([data-slot="media"]) img {
  border-start-start-radius: inherit;
  border-start-end-radius: inherit;
}

/* A part's number sits past the card's edge, beside the part, and its line runs back
   to the part's outline: across the card's padding, its border and its focus ring. */
.anatomy-marker-part {
  --anatomy--reach: calc(1.25rem + 1px + 4px + var(--anatomy--distance));

  top: 50%;
  left: calc(100% + var(--anatomy--reach));
  translate: 0 -50%;
}
.anatomy-marker-part::before {
  top: 50%;
  right: 100%;
  width: calc(var(--anatomy--reach) - var(--anatomy--outline));
  height: 1px;
}
/* The media reaches the card's edge. */
.anatomy-marker-edge {
  --anatomy--reach: calc(1px + 4px + var(--anatomy--distance));
}

/* The list from the markdown, numbered with the same markers: four parts down
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
    grid-template-rows: repeat(4, auto);
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
