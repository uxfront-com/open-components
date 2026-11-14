<script setup lang="ts">
import TagGroup from "~/reference/tag-group/TagGroup.vue";

/** `::tag-group-languages-example`: a removable group in a right-to-left language, which wraps and mirrors itself. */
const labels = ref([
  { value: "bug", label: "خطأ" },
  { value: "feature", label: "ميزة" },
  { value: "docs", label: "توثيق" },
]);
</script>

<template>
  <TagGroupExample>
    <div dir="rtl" lang="ar" class="flex justify-center">
      <TagGroup
        label="التصنيفات"
        :tags="labels"
        removable
        :remove-label="(label: string) => `إزالة ${label}`"
        :removed-label="(label: string) => `تمت إزالة ${label}`"
        empty-label="لا توجد تصنيفات"
        @remove="(tag) => (labels = labels.filter((other) => other.value !== tag.value))"
      />
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TagGroupExample>
</template>
