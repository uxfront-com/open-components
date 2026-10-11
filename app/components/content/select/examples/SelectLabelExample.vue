<script setup lang="ts">
import Select from "~/reference/select/Select.vue";

/** `::select-label-example`: a select named by its label, described by its hint, that starts on its placeholder. */
</script>

<template>
  <SelectExample>
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <label for="label-country" class="text-sm font-medium">Country</label>
      <p id="label-country-hint" class="text-muted text-sm">Where you live, for tax purposes</p>
      <Select id="label-country" autocomplete="country" placeholder="Choose a country" aria-describedby="label-country-hint">
        <option value="FR">France</option>
        <option value="DE">Germany</option>
        <option value="IT">Italy</option>
        <option value="ES">Spain</option>
      </Select>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>
