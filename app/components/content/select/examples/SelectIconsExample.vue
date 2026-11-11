<script setup lang="ts">
import Field from "~/reference/field/Field.vue";
import Select from "~/reference/select/Select.vue";
import { labels } from "~/data/select-options";

/** `::select-icons-example`: an icon per option, shown in the panel, in the field and in each tag. */
const one = ref<string | string[]>("feature");
const several = ref<string | string[]>(["bug", "docs"]);
</script>

<template>
  <SelectExample>
    <div class="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <Field id="icons-type" label="Type">
        <Select v-model="one" name="icons-type" :options="labels" :native-on-touch="false">
          <template #icon="{ option }"><SelectLabelIcon :value="option.value" /></template>
        </Select>
      </Field>
      <Field id="icons-labels" label="Labels">
        <Select v-model="several" name="icons-labels" multiple :options="labels" :native-on-touch="false">
          <template #icon="{ option }"><SelectLabelIcon :value="option.value" /></template>
        </Select>
      </Field>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>
