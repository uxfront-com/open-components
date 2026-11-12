<script setup lang="ts">
import Tag from "~/reference/tag/Tag.vue";

/**
 * `::tag-restyle-example{part="root"}`: one of the three parts the UI page restyles, with a
 * class that sets its variables, and with its slot where it has one. No inline styles.
 */
const { part } = defineProps<{ part: "root" | "leading" | "remove" }>();
</script>

<template>
  <TagExample>
    <div class="flex flex-wrap items-center justify-center gap-2">
      <Tag v-for="label in ['Bug', 'Feature']" :key="label" :class="`restyle-${part}`" :label="label" removable>
        <template v-if="part === 'leading'" #leading><UIcon name="i-lucide-tag" mode="svg" /></template>
        <template v-if="part === 'remove'" #remove><UIcon name="i-lucide-circle-x" mode="svg" /></template>
      </Tag>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TagExample>
</template>

<style>
/* Each sets the variables of its one part, from outside the component's layer. */
.restyle-root {
  --tag--radius: 1rem;
  --tag--background: var(--color--primary);
  --tag--color: var(--color--primary-contrast);
}
.restyle-leading {
  --tag--icon--size: 0.875rem;
  --tag--gap: 0.375rem;
}
.restyle-remove {
  --tag--hover--background: color-mix(in srgb, var(--color--error) 20%, transparent);
}
</style>
