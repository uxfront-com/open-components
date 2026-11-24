<script setup lang="ts">
import Combobox from "~/reference/combobox/Combobox.vue";
import Field from "~/reference/field/Field.vue";
import { labels } from "~/data/select-options";

/** `::combobox-icons-example`: an icon per option, shown in the panel, beside the picked option's label and in each tag. */
const one = ref<string | Array<string>>("feature");
const several = ref<string | Array<string>>(["bug", "docs"]);
</script>

<template>
  <ComboboxExample>
    <div class="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <Field id="icons-type" label="Type">
        <Combobox v-model="one" name="icons-type" :options="labels" placeholder="Type a label">
          <template #icon="{ option }"><SelectLabelIcon :value="option.value" /></template>
        </Combobox>
      </Field>
      <Field id="icons-labels" label="Labels">
        <Combobox v-model="several" name="icons-labels" multiple :options="labels" placeholder="Type a label">
          <template #icon="{ option }"><SelectLabelIcon :value="option.value" /></template>
        </Combobox>
      </Field>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ComboboxExample>
</template>
