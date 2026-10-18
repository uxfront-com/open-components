<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of a dialog, numbered on a picture of an open one. A real dialog would
 * cover the page, so this draws its parts in place, with the same spacing as the
 * reference Dialog. The list the numbers point to is the default slot, so the
 * page's markdown keeps it:
 *
 * ```md
 * ::dialog-anatomy
 * 1. **Backdrop** — The `::backdrop` behind the dialog.
 * 2. **Panel** — The `<dialog>` itself.
 * ::
 * ```
 */
</script>

<template>
  <figure class="dialog-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="anatomy-backdrop" inert aria-hidden="true">
      <span class="anatomy-marker anatomy-marker-backdrop">1</span>
      <div class="anatomy-panel">
        <span class="anatomy-marker anatomy-marker-panel">2</span>
        <div class="anatomy-header">
          <p class="anatomy-part anatomy-title">Edit profile<span class="anatomy-marker">3</span></p>
          <span class="anatomy-part anatomy-close">
            <Button label="Close" variant="ghost" size="sm" icon-only tabindex="-1">
              <template #leading><UIcon name="i-lucide-x" /></template>
            </Button>
            <span class="anatomy-marker">4</span>
          </span>
          <p class="anatomy-part anatomy-description">
            Your name and email address, as other people see them.<span class="anatomy-marker">5</span>
          </p>
        </div>
        <div class="anatomy-part anatomy-body">
          <span class="anatomy-line" />
          <span class="anatomy-line anatomy-line-short" />
          <span class="anatomy-marker">6</span>
        </div>
        <div class="anatomy-part anatomy-actions">
          <Button variant="outline" tabindex="-1">Cancel</Button>
          <Button color="primary" tabindex="-1">Save changes</Button>
          <span class="anatomy-marker">7</span>
        </div>
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.dialog-anatomy {
  color-scheme: light;
}
.dark .dialog-anatomy {
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

/* The page, dimmed by the backdrop, with the panel in the middle, drawn the way the
   reference Dialog draws it. */
.anatomy-backdrop {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  background-color: color-mix(in srgb, #000 50%, transparent);
}
.anatomy-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-sizing: border-box;
  width: min(24rem, 100%);
  padding: 1.25rem;
  border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  border-radius: 0.75rem;
  background-color: Canvas;
  color: var(--color--neutral-text);
  font-size: 0.875rem;
  line-height: 1.5;
}
.anatomy-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 0.25rem 1rem;
}
.anatomy-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.375;
}
.anatomy-close {
  margin-block: calc((1.375rem - 2rem) / 2);
  margin-inline-end: -0.5rem;
}
.anatomy-description {
  grid-column: 1 / -1;
  margin: 0;
  color: color-mix(in srgb, currentColor 70%, transparent);
}
.anatomy-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.anatomy-line {
  height: 0.5rem;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 15%, transparent);
}
.anatomy-line-short {
  width: 60%;
}
.anatomy-actions {
  display: flex;
  gap: 0.5rem;
}

/* Each part is outlined, with its number on its top corner. */
.anatomy-part {
  position: relative;
  outline: 1px dashed color-mix(in srgb, currentColor 70%, transparent);
  outline-offset: 2px;
}
.anatomy-marker {
  position: absolute;
  top: -0.625rem;
  left: -0.875rem;
}
.anatomy-marker-backdrop {
  top: 0.75rem;
  left: 0.75rem;
}
.anatomy-marker-panel {
  top: -0.625rem;
  left: -0.625rem;
}

/* The list from the markdown, numbered with the same markers: four parts down the
   first column, the rest down the second. */
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
