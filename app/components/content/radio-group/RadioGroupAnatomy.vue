<script setup lang="ts">
import Radio from "~/reference/radio-group/Radio.vue";
import RadioGroup from "~/reference/radio-group/RadioGroup.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of a radio group, numbered on a large reference Radio Group. The list
 * the numbers point to is the default slot, so the page's markdown keeps it:
 *
 * ```md
 * ::radio-group-anatomy
 * 1. **Group** — The `<fieldset>`, which groups the radios.
 * 2. **Legend** — The question.
 * ::
 * ```
 */
</script>

<template>
  <figure class="radio-group-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-14 py-10" inert aria-hidden="true">
      <RadioGroup
        size="lg"
        name="anatomy-delivery"
        legend="Delivery"
        hint="Orders placed before 2pm leave the same day"
        model-value="standard"
        class="anatomy-group"
      >
        <Radio value="standard" tabindex="-1">Standard</Radio>
        <Radio value="express" tabindex="-1">Express</Radio>
      </RadioGroup>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.radio-group-anatomy {
  color-scheme: light;
}
.dark .radio-group-anatomy {
  color-scheme: dark;
}
</style>

<style scoped>
/* The parts are drawn by the Radio Group and its Radios, which have no room for a
   marker of their own, so each marker is a part's ::before, and the line that joins
   it to the part is its ::after. */
.anatomy-group {
  /* How far a number sits from its part, and how far a part's outline sits from the part. */
  --anatomy--distance: 0.75rem;
  --anatomy--outline: 2px;

  position: relative;
  outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);
  outline-offset: 0.5rem;
}
.anatomy-group :deep([data-slot="legend"]),
.anatomy-group :deep([data-slot="hint"]),
.anatomy-group :deep(.radio:first-of-type),
.anatomy-group :deep(.radio:last-of-type > [data-slot="control"]),
.anatomy-group :deep(.radio:last-of-type > [data-slot="label"]) {
  position: relative;
  outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);
  outline-offset: var(--anatomy--outline);
}

/* The second radio isn't outlined as a whole, but still places its marker. */
.anatomy-group :deep(.radio:last-of-type) {
  position: relative;
}

/* Every marker, numbered with the same counters as the list. */
.anatomy-group::before,
.anatomy-group :deep([data-slot="legend"])::before,
.anatomy-group :deep([data-slot="hint"])::before,
.anatomy-group :deep(.radio:first-of-type)::before,
.anatomy-group :deep(.radio:last-of-type)::before,
.anatomy-group :deep(.radio:last-of-type > [data-slot="label"])::before,
.anatomy-parts :deep(li)::before {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  background: var(--ui-bg-inverted);
  color: var(--ui-bg);
  font-size: 0.6875rem;
  font-weight: 600;
  font-style: normal;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.anatomy-group::before,
.anatomy-group::after,
.anatomy-group :deep(:is([data-slot="legend"], [data-slot="hint"], .radio, [data-slot="label"]))::before,
.anatomy-group :deep(:is([data-slot="legend"], [data-slot="hint"], .radio, [data-slot="label"]))::after {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
}
.anatomy-group::after,
.anatomy-group :deep(:is([data-slot="legend"], [data-slot="hint"], .radio, [data-slot="label"]))::after {
  height: 1px;
  background: var(--ui-bg-inverted);
}

/* The legend, the hint and the radios are numbered before the group, where they start.
   The first radio's number points to the whole row, and the second's to its indicator,
   which starts where the row does. */
.anatomy-group :deep([data-slot="legend"])::before {
  content: "2";
}
.anatomy-group :deep([data-slot="hint"])::before {
  content: "3";
}
.anatomy-group :deep(.radio:first-of-type)::before {
  content: "4";
}
.anatomy-group :deep(.radio:last-of-type)::before {
  content: "5";
}
.anatomy-group :deep(:is([data-slot="legend"], [data-slot="hint"], .radio))::before {
  right: calc(100% + var(--anatomy--distance));
}
.anatomy-group :deep(:is([data-slot="legend"], [data-slot="hint"], .radio))::after {
  content: "";
  right: calc(100% + var(--anatomy--outline));
  width: calc(var(--anatomy--distance) - var(--anatomy--outline));
}
/* The group and the label are numbered after them. */
.anatomy-group::before {
  content: "1";
  left: calc(100% + 0.5rem + var(--anatomy--distance));
}
.anatomy-group::after {
  content: "";
  left: calc(100% + 0.5rem);
  width: var(--anatomy--distance);
}
.anatomy-group :deep(.radio:last-of-type > [data-slot="label"])::before {
  content: "6";
  left: calc(100% + var(--anatomy--distance));
}
.anatomy-group :deep(.radio:last-of-type > [data-slot="label"])::after {
  content: "";
  left: calc(100% + var(--anatomy--outline));
  width: calc(var(--anatomy--distance) - var(--anatomy--outline));
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
