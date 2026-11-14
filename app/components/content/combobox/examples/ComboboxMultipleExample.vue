<script setup lang="ts">
import Combobox from "~/reference/combobox/Combobox.vue";
import Field from "~/reference/field/Field.vue";
import { nations } from "~/data/select-options";

/** `::combobox-multiple-example`: several values, each a tag under the text, with a remove button. */
const value = ref<string | string[]>(["fr", "es"]);
</script>

<template>
  <ComboboxExample>
    <div class="w-full max-w-xs">
      <Field id="multiple-countries" label="Countries">
        <Combobox v-model="value" name="multiple-countries" multiple :options="nations" placeholder="Type a country" />
      </Field>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ComboboxExample>
</template>
