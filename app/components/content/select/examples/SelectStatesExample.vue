<script setup lang="ts">
import Field from "~/reference/field/Field.vue";
import Select from "~/reference/select/Select.vue";
import { countries } from "~/data/select-options";

/** `::select-states-example`: disabled, read-only and invalid, each set the usual way. */
</script>

<template>
  <SelectExample>
    <div class="grid w-full max-w-xl gap-4 sm:grid-cols-3">
      <Field id="state-disabled" label="Disabled" disabled>
        <Select name="state-disabled" :options="countries" value="fr" />
      </Field>
      <Field id="state-readonly" label="Read-only">
        <Select name="state-readonly" :options="countries" value="fr" readonly />
      </Field>
      <Field id="state-invalid" label="Invalid" error="Pick a country we ship to.">
        <Select name="state-invalid" :options="countries" placeholder="Choose a country" :native-on-touch="false" />
      </Field>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>
