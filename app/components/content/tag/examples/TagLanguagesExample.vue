<script setup lang="ts">
import Tag from "~/reference/tag/Tag.vue";

/** `::tag-languages-example`: removable tags in a right-to-left language, which mirror themselves. */
</script>

<template>
  <TagExample>
    <div dir="rtl" lang="ar" class="flex flex-wrap items-center justify-center gap-2">
      <Tag label="خطأ" removable :remove-label="(label: string) => `إزالة ${label}`">
        <template #leading><UIcon name="i-lucide-bug" mode="svg" /></template>
      </Tag>
      <Tag label="ميزة" removable :remove-label="(label: string) => `إزالة ${label}`">
        <template #leading><UIcon name="i-lucide-sparkles" mode="svg" /></template>
      </Tag>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TagExample>
</template>
