<script setup lang="ts">
import Select from "~/reference/select/Select.vue";

/** `::select-states-example`: each state, labelled and captioned. */
</script>

<template>
  <SelectExample>
    <div class="grid w-full max-w-xl gap-x-6 gap-y-5 sm:grid-cols-2">
      <figure class="flex flex-col gap-1.5">
        <label for="states-language" class="text-sm font-medium">Language</label>
        <Select id="states-language">
          <option value="en">English</option>
          <option value="fr">Français</option>
        </Select>
        <figcaption class="text-muted text-xs">At rest (try hovering, clicking or tabbing to it)</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <label for="states-plan" class="text-sm font-medium">Plan</label>
        <Select id="states-plan" disabled>
          <option value="team">Team</option>
        </Select>
        <figcaption class="text-muted text-xs">Disabled</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <label for="states-country" class="text-sm font-medium">Country</label>
        <Select
          id="states-country"
          autocomplete="off"
          placeholder="Choose a country"
          required
          aria-invalid="true"
          aria-describedby="states-country-error"
        >
          <option value="FR">France</option>
          <option value="DE">Germany</option>
        </Select>
        <p id="states-country-error" class="text-sm text-(--color--error-text)">Choose the country you live in</p>
        <figcaption class="text-muted text-xs">Invalid</figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>
