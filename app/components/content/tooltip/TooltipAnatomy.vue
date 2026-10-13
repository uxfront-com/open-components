<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of a tooltip, numbered on an icon-only Button with its tooltip drawn
 * open above it, the same as ButtonAnatomy on the Button page. The tooltip is a
 * picture of the reference Tooltip, since a real one only opens on hover and focus.
 * The list the numbers point to is the default slot, so the page's markdown keeps it:
 *
 * ```md
 * ::tooltip-anatomy
 * 1. **Trigger** — The element it describes.
 * 2. **Tooltip** — The text, on a filled box.
 * 3. **Offset** — The gap between them.
 * 4. **Arrow** — Optional. A point on the edge that faces the trigger.
 * ::
 * ```
 */
</script>

<template>
  <figure class="tooltip-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-6 pt-8 pb-12" inert aria-hidden="true">
      <div class="anatomy-stage">
        <span class="anatomy-tip">Settings<span class="anatomy-arrow" /></span>
        <span class="anatomy-marker anatomy-marker-tip">2</span>
        <span class="anatomy-marker anatomy-marker-offset">3</span>
        <span class="anatomy-marker anatomy-marker-arrow">4</span>
        <Button label="Settings" variant="outline" icon-only class="anatomy-trigger">
          <template #leading><UIcon name="i-lucide-settings" mode="svg" /></template>
        </Button>
        <span class="anatomy-marker anatomy-marker-trigger">1</span>
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style scoped>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.tooltip-anatomy {
  color-scheme: light;
}
:global(.dark) .tooltip-anatomy {
  color-scheme: dark;
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
  line-height: 1;
}

.anatomy-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* The tooltip's offset, wider than twice its size, so the arrow's number fits beside the arrow. */
  gap: 1.75rem;
}
.anatomy-marker {
  position: absolute;
}

/* The reference Tooltip's look, at twice its size so its parts are easy to see. */
.anatomy-tip {
  position: relative;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  background-color: var(--color--neutral);
  color: var(--color--neutral-contrast);
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 1.4;
  outline: 1px dashed color-mix(in srgb, var(--ui-text-highlighted) 70%, transparent);
  outline-offset: 3px;
}
/* The arrow, like the reference's: a square turned 45deg, half of it past the edge. */
.anatomy-arrow {
  position: absolute;
  top: 100%;
  left: 50%;
  width: 1rem;
  height: 1rem;
  background: inherit;
  translate: -50% -50%;
  rotate: 45deg;
}
.anatomy-trigger {
  --button--height: 4.5rem;
  --button--icon--size: 2rem;
  --button--radius: 1rem;

  outline: 1px dashed color-mix(in srgb, var(--ui-text-highlighted) 70%, transparent);
  outline-offset: 3px;
}

/* The tooltip's number sits before it, the offset's beside the gap, the arrow's before the gap,
   and the trigger's before it. */
.anatomy-marker-tip {
  top: 1.975rem;
  right: calc(100% + 0.875rem);
  translate: 0 -50%;
}
.anatomy-marker-offset {
  /* Halfway down the gap, under the tooltip, which is 3.95rem tall. */
  top: calc(3.95rem + 0.875rem);
  /* Past the tooltip's edge, which is wider than the trigger. */
  left: calc(100% + 0.875rem);
  translate: 0 -50%;
}
.anatomy-marker-arrow {
  top: calc(3.95rem + 0.875rem);
  /* Just before the arrow, at the tooltip's centre. */
  right: calc(50% + 1.125rem);
  translate: 0 -50%;
}
.anatomy-marker-trigger {
  bottom: 2.25rem;
  right: calc(50% + 2.25rem + 0.875rem);
  translate: 0 50%;
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
