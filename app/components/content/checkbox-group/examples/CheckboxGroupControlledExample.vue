<script setup lang="ts">
import CheckboxGroup from "~/reference/checkbox-group/CheckboxGroup.vue";

/** `::checkbox-group-controlled-example`: a group bound to state, beside one that keeps its own. */
const emails = [
  { value: "news", label: "Product news" },
  { value: "tips", label: "Tips and guides" },
  { value: "events", label: "Events near you" },
];
const contact = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
];
const picked = ref(["news"]);
</script>

<template>
  <CheckboxGroupExample>
    <div class="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <div class="flex flex-col gap-3">
        <CheckboxGroup v-model:value="picked" name="emails" :options="emails">Which emails would you like?</CheckboxGroup>
        <p class="text-muted text-sm">You picked: {{ picked.join(", ") || "nothing yet" }}</p>
      </div>
      <CheckboxGroup name="contact" :options="contact" :value="['email']">How can we reach you?</CheckboxGroup>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxGroupExample>
</template>
