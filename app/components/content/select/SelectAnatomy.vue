<script setup lang="ts">
import "~/reference/button/tokens.css";

/**
 * The parts of a Select, numbered on a picture of the field with its panel drawn open under
 * it, the same as PopoverAnatomy on the Popover page. It's a picture, since a real panel
 * opens in the top layer. The list the numbers point to is the default slot.
 */
</script>

<template>
  <figure class="select-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-6 pt-8 pb-8" inert aria-hidden="true">
      <div class="anatomy-stage">
        <div class="anatomy-field">
          <span class="anatomy-marker anatomy-marker-trigger">1</span>
          <UIcon name="i-lucide-globe" mode="svg" class="anatomy-icon" />
          <span class="anatomy-chip">France <UIcon name="i-lucide-x" mode="svg" class="anatomy-remove" /></span>
          <span class="anatomy-value">Spain</span>
          <UIcon name="i-lucide-chevron-down" mode="svg" class="anatomy-icon anatomy-arrow" />
          <span class="anatomy-marker anatomy-marker-leading">2</span>
          <span class="anatomy-marker anatomy-marker-chip">4</span>
          <span class="anatomy-marker anatomy-marker-value">3</span>
          <span class="anatomy-marker anatomy-marker-arrow">5</span>
        </div>
        <div class="anatomy-panel">
          <span class="anatomy-marker anatomy-marker-panel">6</span>
          <span class="anatomy-group">Europe</span>
          <span class="anatomy-marker anatomy-marker-group">8</span>
          <span class="anatomy-option anatomy-option-picked">France <UIcon name="i-lucide-check" mode="svg" /></span>
          <span class="anatomy-marker anatomy-marker-option">7</span>
          <span class="anatomy-option">Spain</span>
          <span class="anatomy-rule" />
          <span class="anatomy-marker anatomy-marker-rule">9</span>
          <span class="anatomy-option">New Zealand</span>
        </div>
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style scoped>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.select-anatomy {
  color-scheme: light;
}
:global(.dark .select-anatomy) {
  color-scheme: dark;
}

.anatomy-stage {
  width: min(18rem, 100%);
  color: var(--color--neutral-text);
  font-size: 0.875rem;
}
.anatomy-field {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.25rem;
  padding-inline: 0.75rem;
  border: 1px solid color-mix(in srgb, currentColor 55%, transparent);
  border-radius: 0.5rem;
}
.anatomy-icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  color: color-mix(in srgb, currentColor 70%, transparent);
}
.anatomy-arrow {
  margin-inline-start: auto;
}
.anatomy-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  background: color-mix(in srgb, currentColor 10%, transparent);
  font-size: 0.75rem;
}
.anatomy-remove {
  width: 0.75rem;
  height: 0.75rem;
}
.anatomy-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  margin-top: 0.25rem;
  padding: 0.25rem;
  border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  border-radius: 0.5rem;
  background: Canvas;
  box-shadow: 0 0.25rem 1rem color-mix(in srgb, #000 15%, transparent);
}
.anatomy-group {
  padding: 0.375rem 0.5rem;
  color: color-mix(in srgb, currentColor 70%, transparent);
  font-size: 0.75rem;
  font-weight: 500;
}
.anatomy-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem;
}
.anatomy-option-picked {
  font-weight: 600;
}
.anatomy-rule {
  height: 1px;
  margin-block: 0.25rem;
  background: color-mix(in srgb, currentColor 20%, transparent);
}

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
}
.anatomy-marker {
  position: absolute;
}
.anatomy-marker-trigger {
  top: -0.625rem;
  inset-inline-start: -0.625rem;
}
.anatomy-marker-leading {
  top: -1.5rem;
  inset-inline-start: 0.625rem;
}
.anatomy-marker-chip {
  top: -1.5rem;
  inset-inline-start: 3.5rem;
}
.anatomy-marker-value {
  top: -1.5rem;
  inset-inline-start: 7.5rem;
}
.anatomy-marker-arrow {
  top: -1.5rem;
  inset-inline-end: 0.625rem;
}
.anatomy-marker-panel {
  top: -0.625rem;
  inset-inline-end: -0.625rem;
}
.anatomy-marker-group {
  top: 0.375rem;
  inset-inline-end: 0.5rem;
}
.anatomy-marker-option {
  top: 2rem;
  inset-inline-end: -1.75rem;
}
.anatomy-marker-rule {
  bottom: 2.125rem;
  inset-inline-end: -1.75rem;
}

.anatomy-parts :deep(ol) {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: part;
}
.anatomy-parts :deep(li) {
  display: flex;
  gap: 0.5rem;
  margin-block: 0.375rem;
  counter-increment: part;
}
.anatomy-parts :deep(li)::before {
  content: counter(part);
  margin-top: 0.0625rem;
}
</style>
