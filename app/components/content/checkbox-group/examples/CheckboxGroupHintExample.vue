<script setup lang="ts">
import CheckboxGroup from "~/reference/checkbox-group/CheckboxGroup.vue";

/** `::checkbox-group-hint-example`: a group named by its legend, and described by its hint. */
const emails = [
  { value: "news", label: "Product news" },
  { value: "tips", label: "Tips and guides" },
  { value: "events", label: "Events near you" },
];
</script>

<template>
  <CheckboxGroupExample>
    <div class="flex w-full max-w-sm flex-col gap-1">
      <CheckboxGroup name="emails" :options="emails" aria-describedby="hint-emails-hint">Which emails would you like?</CheckboxGroup>
      <p id="hint-emails-hint" class="text-muted text-sm">Pick as many as you like. You can stop them at any time.</p>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxGroupExample>
</template>
