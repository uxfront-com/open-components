<script setup lang="ts">
import Tag from "~/reference/tag/Tag.vue";

/** `::tag-icons-example`: issue labels with a leading icon each. Each name is written out, so the icons are in the static build. */
</script>

<template>
  <TagExample>
    <div class="flex flex-wrap items-center justify-center gap-2">
      <Tag label="Bug">
        <template #leading><UIcon name="i-lucide-bug" mode="svg" /></template>
      </Tag>
      <Tag label="Feature">
        <template #leading><UIcon name="i-lucide-sparkles" mode="svg" /></template>
      </Tag>
      <Tag label="Docs">
        <template #leading><UIcon name="i-lucide-book-open" mode="svg" /></template>
      </Tag>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TagExample>
</template>
