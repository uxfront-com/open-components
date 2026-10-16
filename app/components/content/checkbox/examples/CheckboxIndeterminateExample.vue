<script setup lang="ts">
import Checkbox from "~/reference/checkbox/Checkbox.vue";

/** `::checkbox-indeterminate-example`: a checkbox that starts out mixed, and clears on the first click. */
</script>

<template>
  <CheckboxExample>
    <Checkbox indeterminate>Select all</Checkbox>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxExample>
</template>
