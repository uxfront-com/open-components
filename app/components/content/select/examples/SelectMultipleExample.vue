<script setup lang="ts">
import Field from "~/reference/field/Field.vue";
import Select from "~/reference/select/Select.vue";
import { countries } from "~/data/select-options";

/** `::select-multiple-example`: several values, each a tag with a remove button. */
const value = ref<string | string[]>(["fr", "es"]);
</script>

<template>
  <SelectExample>
    <div class="w-full max-w-xs">
      <Field id="multiple-countries" label="Countries">
        <Select v-model="value" name="multiple-countries" multiple :options="countries" placeholder="Choose countries" :native-on-touch="false" />
      </Field>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>
