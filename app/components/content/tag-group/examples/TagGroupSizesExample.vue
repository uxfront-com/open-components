<script setup lang="ts">
import TagGroup from "~/reference/tag-group/TagGroup.vue";

/**
 * `::tag-group-sizes-example`: the five sizes, each a group of removable labels in a narrow
 * column, so they wrap onto a second row and show the space between rows. Removing only
 * counts here, so the tags stay to compare.
 */
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const labels = [
  { value: "bug", label: "Bug" },
  { value: "docs", label: "Docs" },
  { value: "accessibility", label: "Accessibility" },
  { value: "good-first-issue", label: "Good first issue" },
  { value: "help-wanted", label: "Help wanted" },
];
</script>

<template>
  <TagGroupExample>
    <div class="grid w-full max-w-3xl grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
      <figure v-for="size in sizes" :key="size" class="flex max-w-60 flex-col gap-1.5">
        <TagGroup :size="size" :label="`Labels, size ${size}`" :tags="labels" removable />
        <figcaption class="text-muted text-xs"><code>{{ size }}</code></figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TagGroupExample>
</template>
