<script setup lang="ts">
import TagGroup from "~/reference/tag-group/TagGroup.vue";

/**
 * `::tag-group-restyle-example{part="list"}`: one of the two parts the UI page restyles, with
 * a class that sets its variables, and with its slot where it has one. No inline styles.
 */
const { part } = defineProps<{ part: "list" | "empty" }>();
const labels = [
  { value: "bug", label: "Bug" },
  { value: "docs", label: "Docs" },
  { value: "accessibility", label: "Accessibility" },
];
</script>

<template>
  <TagGroupExample>
    <div class="w-full max-w-56">
      <TagGroup v-if="part === 'list'" class="restyle-list" label="Labels" :tags="labels" removable />
      <TagGroup v-else class="restyle-empty" label="Labels" :tags="[]">
        <template #empty>No labels yet. Add one from the menu.</template>
      </TagGroup>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TagGroupExample>
</template>

<style>
/* Each sets the variables of its one part, from outside the component's layer. */
.restyle-list {
  --tag-group--gap: 0.5rem;
}
.restyle-empty {
  --tag-group--empty--color: var(--color--neutral-text);
  --tag-group--empty--font-size: 0.875rem;
}
</style>
