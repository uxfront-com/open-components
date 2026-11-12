<script setup lang="ts">
import Combobox from "~/reference/combobox/Combobox.vue";
import Field from "~/reference/field/Field.vue";
import Select from "~/reference/select/Select.vue";
import { nations } from "~/data/select-options";

/**
 * `::combobox-restyle-example`: one class on a Combobox and on a Select, which restyles the
 * field, the panel, the options and the tags of both, since they read the same variables.
 * No inline styles.
 */
const country = ref<string | string[]>("fr");
const countries = ref<string | string[]>(["fr", "es"]);
</script>

<template>
  <ComboboxExample>
    <div class="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <Field id="restyle-combobox" label="Combobox">
        <Combobox v-model="countries" name="restyle-combobox" class="brand-field" multiple :options="nations" placeholder="Type a country" />
      </Field>
      <Field id="restyle-select" label="Select">
        <Select v-model="country" name="restyle-select" class="brand-field" :options="nations" :native-on-touch="false" />
      </Field>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ComboboxExample>
</template>

<style>
/* One class, from outside the components' layer, for both components. */
.brand-field {
  --select--radius: 1.25rem;
  --select--border-color: var(--color--primary);
  --select--panel--radius: 1rem;
  --select--panel--border-color: var(--color--primary);
  --select--option--radius: 1rem;
  --select--option--selected--background: color-mix(in srgb, var(--color--primary) 15%, transparent);
  --select--tag--radius: 1rem;
  --select--tag--background: var(--color--primary);
  --select--tag--color: var(--color--primary-contrast);
}
</style>
