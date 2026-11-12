<script setup lang="ts">
import Tag from "~/reference/tag/Tag.vue";

/** `::tag-link-example`: a post's topics, each a link to the posts on that topic. */
const topics = ["Accessibility", "Design tokens", "Forms"];
</script>

<template>
  <TagExample>
    <p class="flex flex-wrap items-center justify-center gap-2 text-sm">
      <span class="text-muted">Topics:</span>
      <Tag v-for="topic in topics" :key="topic" :label="topic" :href="`#topics-${topic.toLowerCase().replace(' ', '-')}`" />
    </p>
    <template v-if="$slots.default" #code><slot /></template>
  </TagExample>
</template>
