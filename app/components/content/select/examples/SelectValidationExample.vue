<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Select from "~/reference/select/Select.vue";

/** `::select-validation-example`: a required select, checked when people submit, and again as they choose. */
const country = ref("");
const error = ref("");
const status = ref("");
const countrySelect = useTemplateRef("country-select");

// Returns an error message, or an empty string once a country is chosen.
function validateCountry(value: string) {
  return value ? "" : "Choose the country you live in";
}

function update(value = "") {
  country.value = value;
  // Once an error shows, check again as people choose, so it clears as soon as it's fixed.
  if (error.value) error.value = validateCountry(value);
}

async function save() {
  error.value = validateCountry(country.value);
  if (error.value) {
    status.value = "Couldn't save. Check your country.";
    // Focus once the error is in the page, so screen readers read it with the select.
    await nextTick();
    countrySelect.value?.select?.focus();
    return;
  }
  status.value = "Saved";
}
</script>

<template>
  <SelectExample>
    <form class="flex w-full max-w-sm flex-col gap-1.5" novalidate @submit.prevent="save">
      <label for="validation-country" class="text-sm font-medium">Country</label>
      <Select
        id="validation-country"
        ref="country-select"
        autocomplete="country"
        placeholder="Choose a country"
        required
        :model-value="country"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? 'validation-country-error' : undefined"
        @update:model-value="update"
      >
        <option value="FR">France</option>
        <option value="DE">Germany</option>
        <option value="IT">Italy</option>
        <option value="ES">Spain</option>
      </Select>
      <p v-if="error" id="validation-country-error" class="text-sm text-(--color--error-text)">{{ error }}</p>
      <div class="mt-2 flex flex-wrap items-center gap-3">
        <Button type="submit" color="primary">Save</Button>
        <!-- Always in the page, so screen readers announce what it says. -->
        <p role="status" class="text-muted text-sm">{{ status }}</p>
      </div>
    </form>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>
