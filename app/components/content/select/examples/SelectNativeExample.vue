<script setup lang="ts">
import Field from "~/reference/field/Field.vue";
import Select from "~/reference/select/Select.vue";
import { countries } from "~/data/select-options";

/** `::select-native-example`: the default, a custom panel with a mouse and the device's own picker on touch. */
</script>

<template>
  <SelectExample>
    <div class="w-full max-w-xs">
      <Field id="native-country" label="Country">
        <Select name="native-country" :options="countries" placeholder="Choose a country" />
      </Field>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>
