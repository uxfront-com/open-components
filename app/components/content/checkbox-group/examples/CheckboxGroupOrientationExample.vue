<script setup lang="ts">
import CheckboxGroup from "~/reference/checkbox-group/CheckboxGroup.vue";

/** `::checkbox-group-orientation-example`: a column of options, and a row of short ones. */
const emails = [
  { value: "news", label: "Product news" },
  { value: "tips", label: "Tips and guides" },
  { value: "events", label: "Events near you" },
];
const contact = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "post", label: "Post" },
];
</script>

<template>
  <CheckboxGroupExample>
    <div class="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <CheckboxGroup name="orientation-emails" :options="emails">Which emails would you like?</CheckboxGroup>
      <CheckboxGroup name="orientation-contact" :options="contact" orientation="horizontal">How can we reach you?</CheckboxGroup>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxGroupExample>
</template>
