<script setup lang="ts">
import CheckboxGroup from "~/reference/checkbox-group/CheckboxGroup.vue";

/** `::checkbox-group-languages-example`: a group in a right-to-left layout. */
const emails = [
  { value: "news", label: "أخبار المنتج" },
  { value: "tips", label: "نصائح وإرشادات" },
];
</script>

<template>
  <CheckboxGroupExample>
    <div dir="rtl" lang="ar" class="flex w-full max-w-sm">
      <CheckboxGroup name="emails" :options="emails" :value="['news']" select-all="كل الرسائل">
        ما الرسائل التي تريدها؟
      </CheckboxGroup>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxGroupExample>
</template>
