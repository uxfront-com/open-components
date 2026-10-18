<script setup lang="ts">
import CheckboxGroup from "~/reference/checkbox-group/CheckboxGroup.vue";
import "~/reference/button/tokens.css";

/**
 * The parts of a checkbox group, numbered on a reference CheckboxGroup drawn at its
 * `xl` size. The list the numbers point to is the default slot, so the page's
 * markdown keeps it:
 *
 * ```md
 * ::checkbox-group-anatomy
 * 1. **Group** — The `<fieldset>`, which holds everything else.
 * 2. **Legend** — The `<legend>`, which names the group.
 * ::
 * ```
 */
const emails = [
  { value: "news", label: "Product news" },
  { value: "tips", label: "Tips and guides" },
];
</script>

<template>
  <figure class="checkbox-group-anatomy not-prose my-5 overflow-hidden rounded-md border border-muted">
    <!-- A picture of the list below it, so it's inert and hidden from assistive technologies. -->
    <div class="flex justify-center px-16 py-10" inert aria-hidden="true">
      <div class="anatomy-stage">
        <CheckboxGroup
          size="xl"
          name="anatomy-emails"
          :options="emails"
          :value="['news']"
          select-all="All emails"
          class="anatomy-group"
        >
          Which emails would you like?
        </CheckboxGroup>
        <p class="anatomy-hint">Pick as many as you like.</p>
      </div>
    </div>
    <figcaption class="anatomy-parts border-t border-muted p-4 text-sm">
      <slot />
    </figcaption>
  </figure>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.checkbox-group-anatomy {
  color-scheme: light;
}
.dark .checkbox-group-anatomy {
  color-scheme: dark;
}
</style>

<style scoped>
.anatomy-stage {
  /* How far a number sits from what it names. */
  --anatomy--distance: 0.75rem;
  --anatomy--outline: 1px dashed color-mix(in srgb, var(--color--neutral-text) 70%, transparent);

  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Every part is outlined, with its number beside it: the group's after it, the rest before. */
.anatomy-group,
.anatomy-group > :deep([data-slot]),
.anatomy-hint {
  position: relative;
  outline: var(--anatomy--outline);
  outline-offset: 3px;
}
.anatomy-group {
  outline-offset: 0.75rem;
}
.anatomy-group::before,
.anatomy-group > :deep([data-slot])::before,
.anatomy-hint::before,
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
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.anatomy-group::before,
.anatomy-group > :deep([data-slot])::before,
.anatomy-hint::before {
  position: absolute;
  top: 0;
  right: calc(100% + var(--anatomy--distance));
}
.anatomy-group::before {
  content: "1";
  top: 50%;
  right: auto;
  left: calc(100% + 0.75rem + var(--anatomy--distance));
  translate: 0 -50%;
}
.anatomy-group > :deep([data-slot="legend"])::before {
  content: "2";
}
.anatomy-group > :deep([data-slot="select-all"])::before {
  content: "3";
}
.anatomy-group > :deep([data-slot="options"])::before {
  content: "4";
}
.anatomy-hint {
  margin: 0.75rem 0 0;
  color: var(--ui-text-muted);
  font-size: 1rem;
}
.anatomy-hint::before {
  content: "5";
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
