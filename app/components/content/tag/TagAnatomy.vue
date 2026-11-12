<script setup lang="ts">
import Tag from "~/reference/tag/Tag.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of a tag, numbered on a reference Tag that's a removable link, with a leading
 * icon and its focus ring. The list the numbers point to is the default slot, so the page's
 * markdown keeps it:
 *
 * ```md
 * ::tag-anatomy
 * 1. **Container** — The root, a `<span>`.
 * 2. **Leading icon** — Optional.
 * ::
 * ```
 */
</script>

<template>
  <figure class="tag-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-6 pt-16 pb-14" inert aria-hidden="true">
      <div class="anatomy-stage">
        <span class="anatomy-marker anatomy-marker-container">1</span>
        <Tag class="anatomy-tag" size="xl" label="Bug" href="#labels-bug" removable>
          <template #leading>
            <UIcon name="i-lucide-bug" mode="svg" />
            <span class="anatomy-marker anatomy-marker-part">2</span>
          </template>
          <span class="anatomy-anchor">Bug<span class="anatomy-marker anatomy-marker-part">3</span></span>
          <template #remove>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            <span class="anatomy-marker anatomy-marker-part">4</span>
          </template>
        </Tag>
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
.tag-anatomy {
  color-scheme: light;
}
.dark .tag-anatomy {
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
  text-decoration: none;
}

/* Every number sits beside what it names, and a line joins the two. */
.anatomy-stage {
  /* How far a number sits from what it names. */
  --anatomy--distance: 0.75rem;

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

/* The tag, its link focused, at the largest size, with each part outlined. */
.anatomy-tag {
  --tag--font-size: 1rem;
}
.anatomy-tag > :deep([data-slot]) {
  overflow: visible;
  outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);
  outline-offset: 2px;
}
.anatomy-tag > :deep([data-slot="remove"]) {
  outline-offset: -3px;
}
/* The leading icon and the remove button hold their numbers. The label doesn't, since the
   link's focus ring is drawn around the whole tag, so its text holds its number instead. */
.anatomy-tag > :deep([data-slot="leading"]),
.anatomy-anchor {
  position: relative;
}
.anatomy-tag :deep(a)::after {
  outline: 2px solid var(--color--focus);
  outline-offset: 2px;
}

/* A part's number sits above it, and its line runs down to the part's outline,
   past the tag's border and its focus ring. */
.anatomy-marker-part {
  bottom: calc(100% + var(--anatomy--distance) + 0.5rem);
  left: 50%;
  translate: -50% 0;
}
.anatomy-marker-part::before {
  top: 100%;
  left: 50%;
  width: 1px;
  height: calc(var(--anatomy--distance) + 0.5rem - 2px);
}
.anatomy-tag > :deep([data-slot="remove"]) .anatomy-marker-part {
  bottom: calc(100% + var(--anatomy--distance) + 0.25rem);
}

/* The container's number sits before the tag, and its line crosses the focus ring
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
/* The focus ring's number sits below the tag, and its line ends on the ring,
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

/* The list from the markdown, numbered with the same markers. */
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
