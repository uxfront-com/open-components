<script setup lang="ts">
import Tag from "~/reference/tag/Tag.vue";

/** `::tag-sizes-example`: the five sizes, each the height of the Select's tag at that size, removable. */
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <TagExample>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Tag v-for="size in sizes" :key="size" :size="size" :label="`Size ${size}`" removable />
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TagExample>
</template>
