<script setup lang="ts">
import TagGroup from "~/reference/tag-group/TagGroup.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of a tag group, numbered on a reference Tag Group of removable labels that wraps
 * onto two rows, beside an empty one. The list the numbers point to is the default slot, so
 * the page's markdown keeps it:
 *
 * ```md
 * ::tag-group-anatomy
 * 1. **List** — A `<ul>`.
 * 2. **Item** — An `<li>` per tag.
 * ::
 * ```
 */
const labels = [
  { value: "bug", label: "Bug" },
  { value: "docs", label: "Docs" },
  { value: "accessibility", label: "Accessibility" },
  { value: "good-first-issue", label: "Good first issue" },
];
</script>

<template>
  <figure class="tag-group-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex flex-wrap items-start justify-center gap-x-16 gap-y-12 px-6 pt-12 pb-10" inert aria-hidden="true">
      <div class="anatomy-stage">
        <TagGroup class="anatomy-group" size="lg" label="Labels" :tags="labels" removable />
        <span class="anatomy-marker anatomy-marker-list">1</span>
        <span class="anatomy-marker anatomy-marker-item">2</span>
        <span class="anatomy-marker anatomy-marker-gap">3</span>
      </div>
      <div class="anatomy-stage">
        <TagGroup class="anatomy-empty" size="lg" label="Labels" :tags="[]" />
        <span class="anatomy-marker anatomy-marker-empty">4</span>
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.tag-group-anatomy {
  color-scheme: light;
}
.dark .tag-group-anatomy {
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

/* The group in a column narrow enough to wrap it onto two rows, with a wider gap than
   usual, so the gap's number has room. Dashed lines show the list's and the items' edges. */
.anatomy-stage {
  position: relative;
  width: 13rem;
}
.anatomy-group {
  --tag-group--gap: 0.75rem;
}
.anatomy-group :deep([data-slot="list"]) {
  outline: 1px dashed var(--ui-border-inverted);
  outline-offset: 4px;
}
.anatomy-group :deep([data-slot="item"]) {
  outline: 1px dotted var(--ui-text-muted);
  outline-offset: 2px;
}
.anatomy-empty :deep([data-slot="empty"]) {
  outline: 1px dashed var(--ui-border-inverted);
  outline-offset: 4px;
}

.anatomy-marker {
  position: absolute;
}
/* The list's number sits before its top corner, outside its dashed edge. */
.anatomy-marker-list {
  top: -0.25rem;
  right: calc(100% + 0.75rem);
}
/* The first item's number sits above it, and the gap's above the space between the first
   two tags, each with a line down to what it names. */
.anatomy-marker-item,
.anatomy-marker-gap {
  bottom: calc(100% + 0.75rem);
}
.anatomy-marker-item {
  left: 1.25rem;
}
.anatomy-marker-gap {
  /* The first tag, "Bug", is about 4.25rem wide at this size, and the gap 0.75rem. */
  left: calc(4.25rem + 0.375rem - 0.625rem);
}
.anatomy-marker-item::before,
.anatomy-marker-gap::before {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  width: 1px;
  height: 0.75rem;
  background: var(--ui-bg-inverted);
}
.anatomy-marker-empty {
  top: 50%;
  right: calc(100% + 0.75rem);
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
