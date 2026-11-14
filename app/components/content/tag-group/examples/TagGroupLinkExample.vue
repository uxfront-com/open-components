<script setup lang="ts">
import TagGroup from "~/reference/tag-group/TagGroup.vue";

/** `::tag-group-link-example`: a post's topics, each a link, in a list named by the visible "Topics" before it. */
const topics = [
  { value: "accessibility", label: "Accessibility", href: "#topics-accessibility" },
  { value: "design-tokens", label: "Design tokens", href: "#topics-design-tokens" },
  { value: "forms", label: "Forms", href: "#topics-forms" },
];
</script>

<template>
  <TagGroupExample>
    <div class="flex flex-wrap items-center justify-center gap-2 text-sm">
      <span id="tag-group-topics" class="text-muted">Topics</span>
      <TagGroup aria-labelledby="tag-group-topics" :tags="topics" />
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TagGroupExample>
</template>
