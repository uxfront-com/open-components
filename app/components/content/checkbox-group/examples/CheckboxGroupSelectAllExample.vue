<script setup lang="ts">
import CheckboxGroup from "~/reference/checkbox-group/CheckboxGroup.vue";

/** `::checkbox-group-select-all-example`: a select-all box that follows its options, and checks or clears them all. */
const emails = [
  { value: "news", label: "Product news" },
  { value: "tips", label: "Tips and guides" },
  { value: "events", label: "Events near you" },
];
const picked = ref(["news"]);
</script>

<template>
  <CheckboxGroupExample>
    <div class="flex w-full max-w-sm flex-col gap-3">
      <CheckboxGroup v-model:value="picked" name="emails" :options="emails" select-all="All emails">
        Which emails would you like?
      </CheckboxGroup>
      <p class="text-muted text-sm">You'll get {{ picked.length }} of {{ emails.length }}</p>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxGroupExample>
</template>
