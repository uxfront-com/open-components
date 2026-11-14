<script setup lang="ts">
import TagGroup from "~/reference/tag-group/TagGroup.vue";

/** `::tag-group-states-example`: a removable group, a group of links, a disabled one, a read-only one and an empty one, captioned. */
const labels = [
  { value: "bug", label: "Bug" },
  { value: "docs", label: "Docs" },
];
const links = labels.map((tag) => ({ ...tag, href: `#labels-${tag.value}` }));
</script>

<template>
  <TagGroupExample>
    <div class="grid w-full max-w-xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
      <figure class="flex flex-col items-start gap-1.5">
        <TagGroup label="Removable labels" :tags="labels" removable />
        <figcaption class="text-muted text-xs">Removable</figcaption>
      </figure>
      <figure class="flex flex-col items-start gap-1.5">
        <TagGroup label="Linked labels" :tags="links" />
        <figcaption class="text-muted text-xs">Links</figcaption>
      </figure>
      <figure class="flex flex-col items-start gap-1.5">
        <TagGroup label="Disabled labels" :tags="links" removable disabled />
        <figcaption class="text-muted text-xs">Disabled</figcaption>
      </figure>
      <figure class="flex flex-col items-start gap-1.5">
        <TagGroup label="Read-only labels" :tags="links" removable readonly />
        <figcaption class="text-muted text-xs">Read-only</figcaption>
      </figure>
      <figure class="flex flex-col items-start gap-1.5">
        <TagGroup label="Empty labels" :tags="[]" empty-label="No labels" />
        <figcaption class="text-muted text-xs">Empty</figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TagGroupExample>
</template>
