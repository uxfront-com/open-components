<script setup lang="ts">
import CheckboxGroup from "~/reference/checkbox-group/CheckboxGroup.vue";

/** `::checkbox-group-states-example`: each state, captioned. */
const emails = [
  { value: "news", label: "Product news" },
  { value: "tips", label: "Tips and guides" },
  { value: "events", label: "Events near you" },
];
</script>

<template>
  <CheckboxGroupExample>
    <div class="grid w-full max-w-xl gap-x-6 gap-y-6 sm:grid-cols-2">
      <figure class="flex flex-col gap-1.5">
        <CheckboxGroup name="states-default" :options="emails" :value="['news']">Which emails would you like?</CheckboxGroup>
        <figcaption class="text-muted text-xs">Some options checked (try tabbing through them)</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <CheckboxGroup name="states-mixed" :options="emails" :value="['news']" select-all="All emails">
          Which emails would you like?
        </CheckboxGroup>
        <figcaption class="text-muted text-xs">With a select-all box, mixed</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <CheckboxGroup name="states-disabled" :options="emails" :value="['news']" disabled>Which emails would you like?</CheckboxGroup>
        <figcaption class="text-muted text-xs">Disabled</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <div class="flex flex-col gap-1">
          <CheckboxGroup name="states-invalid" :options="emails" aria-invalid="true" aria-describedby="states-emails-error">
            Which emails would you like?
          </CheckboxGroup>
          <p id="states-emails-error" class="text-sm text-(--color--error-text)">Pick at least one email to sign up for</p>
        </div>
        <figcaption class="text-muted text-xs">Invalid</figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxGroupExample>
</template>
