<script setup lang="ts">
import Checkbox from "~/reference/checkbox/Checkbox.vue";

/** `::checkbox-languages-example`: checkboxes in a right-to-left layout. */
</script>

<template>
  <CheckboxExample>
    <div dir="rtl" lang="ar" class="flex w-full max-w-sm flex-col gap-2">
      <Checkbox checked>أرسل لي التحديثات عبر البريد الإلكتروني</Checkbox>
      <Checkbox>أوافق على الشروط</Checkbox>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxExample>
</template>
