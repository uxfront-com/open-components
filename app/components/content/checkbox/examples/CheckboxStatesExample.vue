<script setup lang="ts">
import Checkbox from "~/reference/checkbox/Checkbox.vue";

/** `::checkbox-states-example`: each state, captioned. */
</script>

<template>
  <CheckboxExample>
    <div class="grid w-full max-w-xl gap-x-6 gap-y-5 sm:grid-cols-2">
      <figure class="flex flex-col gap-1.5">
        <Checkbox>Email me updates</Checkbox>
        <figcaption class="text-muted text-xs">Unchecked (try hovering, clicking or tabbing to it)</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <Checkbox checked>Email me updates</Checkbox>
        <figcaption class="text-muted text-xs">Checked</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <Checkbox indeterminate>Select all</Checkbox>
        <figcaption class="text-muted text-xs">Indeterminate</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <div class="flex flex-col gap-1">
          <Checkbox disabled>Text me updates</Checkbox>
          <Checkbox checked disabled>Email me updates</Checkbox>
        </div>
        <figcaption class="text-muted text-xs">Disabled</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <div class="flex flex-col gap-1">
          <Checkbox readonly>Text me updates</Checkbox>
          <Checkbox checked readonly>Email me updates</Checkbox>
        </div>
        <figcaption class="text-muted text-xs">Read-only (try clicking or pressing Space)</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <Checkbox required aria-invalid="true" aria-describedby="states-terms-error">I agree to the terms</Checkbox>
        <p id="states-terms-error" class="ps-6.5 text-sm text-(--color--error-text)">Agree to the terms to create an account</p>
        <figcaption class="text-muted text-xs">Invalid</figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxExample>
</template>
