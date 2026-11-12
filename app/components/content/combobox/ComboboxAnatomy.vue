<script setup lang="ts">
import "~/reference/button/tokens.css";

/**
 * The parts of a Combobox, numbered on a picture of the field with its panel drawn open
 * under it, the same as SelectAnatomy on the Select page: each number sits beside its part, with a
 * line to it, and the parts whose edges you can't see are outlined. It's a picture, since a real panel opens in the top
 * layer. The list the numbers point to is the default slot, so the page's markdown keeps it.
 */
</script>

<template>
  <figure class="combobox-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-6 pt-16 pb-10" inert aria-hidden="true">
      <div class="anatomy-stage">
        <div class="anatomy-field">
          <span class="anatomy-marker anatomy-marker-side">1</span>
          <div class="anatomy-row">
            <span class="anatomy-part anatomy-leading">
              <UIcon name="i-lucide-map-pin" mode="svg" />
              <span class="anatomy-marker anatomy-marker-up">2</span>
            </span>
            <span class="anatomy-part anatomy-outlined anatomy-value">
              Fr<span class="anatomy-caret" />
              <span class="anatomy-marker anatomy-marker-up">3</span>
            </span>
            <span class="anatomy-part anatomy-arrow">
              <UIcon name="i-lucide-chevron-down" mode="svg" />
              <span class="anatomy-marker anatomy-marker-up">4</span>
            </span>
          </div>
          <div class="anatomy-tags">
            <span class="anatomy-part anatomy-tag">
              Spain
              <UIcon name="i-lucide-x" mode="svg" class="anatomy-remove" />
              <span class="anatomy-marker anatomy-marker-tagside">5</span>
            </span>
          </div>
        </div>
        <div class="anatomy-panel">
          <span class="anatomy-marker anatomy-marker-side">6</span>
          <span class="anatomy-part anatomy-outlined anatomy-group">
            Europe
            <span class="anatomy-marker anatomy-marker-row">7</span>
          </span>
          <span class="anatomy-part anatomy-option anatomy-option-active">
            <span class="anatomy-option-label">France</span>
            <span class="anatomy-marker anatomy-marker-row">8</span>
          </span>
          <span class="anatomy-option anatomy-option-picked">
            <span class="anatomy-option-label">Spain</span>
            <UIcon name="i-lucide-check" mode="svg" class="anatomy-option-icon" />
          </span>
          <span class="anatomy-part anatomy-rule">
            <span class="anatomy-marker anatomy-marker-row">9</span>
          </span>
          <span class="anatomy-part anatomy-outlined anatomy-option">
            <span class="anatomy-option-label">Create "Fr"</span>
            <span class="anatomy-marker anatomy-marker-row">10</span>
          </span>
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
.combobox-anatomy {
  color-scheme: light;
}
.dark .combobox-anatomy {
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
  /* How far a number sits from what it names. */
  --anatomy--distance: 0.625rem;
  /* The field's height, which the numbers above it reach across. */
  --anatomy--field: 2.25rem;

  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  /* Room for the numbers on both sides, on the narrowest screens too. */
  width: min(17rem, 100% - 5rem);
  color: var(--color--neutral-text);
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.anatomy-marker {
  position: absolute;
}
.anatomy-marker::before {
  content: "";
  position: absolute;
  background: var(--ui-bg-inverted);
}
/* A part that shows its own edges, like an icon, a tag or a rule, needs no outline, and its line
   ends on it. Only the parts whose extent you can't see, the value, the group label and an
   option, are outlined, and their lines end on the outline. */
.anatomy-part {
  --anatomy--outline: 0px;

  position: relative;
}
.anatomy-outlined {
  --anatomy--outline: 2px;

  outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);
  outline-offset: var(--anatomy--outline);
}

/* The field, drawn like the reference Combobox: the text on its first row, the tags under it. */
.anatomy-field {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border: 1px solid color-mix(in srgb, currentColor 55%, transparent);
  border-radius: 0.5rem;
}
.anatomy-field > .anatomy-marker-side {
  top: calc(var(--anatomy--field) / 2);
}
.anatomy-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: calc(var(--anatomy--field) - 2px);
  padding-inline: 0.75rem;
}
.anatomy-tags {
  display: flex;
  padding: 0 0.375rem 0.25rem;
}
.anatomy-caret {
  display: inline-block;
  width: 1px;
  height: 1rem;
  margin-inline-start: 1px;
  vertical-align: middle;
  background: currentColor;
}
.anatomy-option-active {
  outline: 2px solid var(--color--focus);
  outline-offset: -2px;
}
/* The tag's number sits before the field, and its line runs across the field's edge. */
.anatomy-marker-tagside {
  --anatomy--reach: calc(0.375rem + 1px + var(--anatomy--distance));

  top: 50%;
  right: calc(100% + var(--anatomy--reach));
  translate: 0 -50%;
}
.anatomy-marker-tagside::before {
  top: 50%;
  left: 100%;
  width: var(--anatomy--reach);
  height: 1px;
}
.anatomy-leading,
.anatomy-arrow {
  --anatomy--height: 1rem;

  display: inline-flex;
  color: color-mix(in srgb, currentColor 70%, transparent);
}
.anatomy-leading svg,
.anatomy-arrow svg,
.anatomy-icon svg,
.anatomy-option-icon {
  width: 1rem;
  height: 1rem;
}
.anatomy-arrow {
  margin-inline-start: auto;
}
.anatomy-tag {
  --anatomy--height: 1.5rem;

  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  height: var(--anatomy--height);
  padding-inline: 0.375rem 0.25rem;
  border-radius: 0.25rem;
  background: color-mix(in srgb, currentColor 10%, transparent);
  font-size: 0.75rem;
}
.anatomy-icon {
  --anatomy--height: 0.75rem;

  display: inline-flex;
}
.anatomy-icon svg,
.anatomy-remove {
  width: 0.75rem;
  height: 0.75rem;
}
.anatomy-value {
  --anatomy--height: 1.25rem;
}

/* The panel, drawn like the reference Select's. */
.anatomy-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.25rem;
  border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  border-radius: 0.5rem;
  background: Canvas;
  box-shadow: 0 0.25rem 1rem color-mix(in srgb, #000 15%, transparent);
}
.anatomy-group {
  padding: 0.25rem 0.5rem;
  color: color-mix(in srgb, currentColor 70%, transparent);
  font-size: 0.75rem;
  font-weight: 500;
}
.anatomy-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem;
}
.anatomy-option-label {
  flex: 1;
}
.anatomy-option-picked {
  font-weight: 600;
}
.anatomy-rule {
  height: 1px;
  margin-block: 0.375rem;
  background: color-mix(in srgb, currentColor 20%, transparent);
}

/* The field's and the panel's numbers sit before them, and their lines end on the border. */
.anatomy-marker-side {
  top: 50%;
  right: calc(100% + var(--anatomy--distance));
  translate: 0 -50%;
}
.anatomy-marker-side::before {
  top: 50%;
  left: 100%;
  width: var(--anatomy--distance);
  height: 1px;
}
/* The panel's number sits below it, away from the options and the numbers beside them, and
   its line runs up to the panel's bottom border, so it can only mean the panel. */
.anatomy-panel > .anatomy-marker-side {
  top: calc(100% + var(--anatomy--distance));
  right: auto;
  left: 50%;
  translate: -50% 0;
}
.anatomy-panel > .anatomy-marker-side::before {
  top: auto;
  bottom: 100%;
  left: 50%;
  width: 1px;
  height: var(--anatomy--distance);
}

/* A part in the field has its number above the field, and its line runs down to the part's
   outline, across the space between the part and the field's edge. */
.anatomy-marker-up {
  --anatomy--reach: calc((var(--anatomy--field) - var(--anatomy--height)) / 2 + var(--anatomy--distance));

  bottom: calc(100% + var(--anatomy--reach));
  left: 50%;
  translate: -50% 0;
}
.anatomy-marker-up::before {
  top: 100%;
  left: 50%;
  width: 1px;
  height: calc(var(--anatomy--reach) - var(--anatomy--outline));
}
/* The tag's number sits over its label, clear of its icon's. */
.anatomy-marker-tag {
  left: 75%;
}

/* A part in the panel has its number past the panel's edge, and its line runs back across
   the panel's padding and border to the part's outline. */
.anatomy-marker-row {
  --anatomy--reach: calc(0.25rem + 1px + var(--anatomy--distance));

  top: 50%;
  left: calc(100% + var(--anatomy--reach));
  translate: 0 -50%;
}
.anatomy-marker-row::before {
  top: 50%;
  right: 100%;
  width: calc(var(--anatomy--reach) - var(--anatomy--outline));
  height: 1px;
}

/* The list from the markdown, numbered with the same markers: five parts down each column. */
.anatomy-parts :deep(ol) {
  display: grid;
  gap: 0.75rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: part;
}
@media (min-width: 40rem) {
  .anatomy-parts :deep(ol) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(5, auto);
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
