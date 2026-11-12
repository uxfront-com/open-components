<script setup lang="ts">
import Combobox from "~/reference/combobox/Combobox.vue";
import Field from "~/reference/field/Field.vue";
import { nations } from "~/data/select-options";

/** `::combobox-states-example`: disabled, read-only and invalid, each set the usual way. */
</script>

<template>
  <ComboboxExample>
    <div class="grid w-full max-w-xl gap-4 sm:grid-cols-3">
      <Field id="state-disabled" label="Disabled" disabled>
        <Combobox name="state-disabled" :options="nations" value="fr" />
      </Field>
      <Field id="state-readonly" label="Read-only">
        <Combobox name="state-readonly" :options="nations" value="fr" readonly />
      </Field>
      <Field id="state-invalid" label="Invalid" error="Pick a country we ship to.">
        <Combobox name="state-invalid" :options="nations" placeholder="Type a country" />
      </Field>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ComboboxExample>
</template>
