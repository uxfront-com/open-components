<script setup lang="ts">
import Combobox from "~/reference/combobox/Combobox.vue";
import Field from "~/reference/field/Field.vue";
import type { SelectItem } from "~/reference/select/Select.vue";
import { nations, topics } from "~/data/select-options";

/**
 * `::combobox-new-values-example{mode="creatable"}`: text that isn't an option, kept as typed
 * with `allowCustomValue`, or added as a new option with `creatable`, which the page then
 * keeps in its list.
 */
const { mode } = defineProps<{ mode: "custom" | "creatable" }>();

const list = ref<SelectItem[]>([...topics]);
const value = ref<string | string[]>(mode === "creatable" ? ["accessibility"] : "");

// What a page does with `create`: it adds the new value to the list, so people find it again.
function add(text: string) {
  list.value = [...list.value, { value: text, label: text }];
}
</script>

<template>
  <ComboboxExample>
    <div class="w-full max-w-xs">
      <Field v-if="mode === 'custom'" id="custom-destination" label="Destination" hint="Type one that isn't in the list, and it's kept.">
        <Combobox v-model="value" name="custom-destination" :options="nations" allow-custom-value placeholder="Type a country or a city" />
      </Field>
      <Field v-else id="creatable-topics" label="Topics">
        <Combobox v-model="value" name="creatable-topics" multiple creatable :options="list" placeholder="Type a topic" @create="add" />
      </Field>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ComboboxExample>
</template>
