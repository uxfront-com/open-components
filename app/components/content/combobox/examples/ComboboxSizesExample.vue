<script setup lang="ts">
import Combobox from "~/reference/combobox/Combobox.vue";
import Field from "~/reference/field/Field.vue";
import { nations } from "~/data/select-options";

/** `::combobox-sizes-example`: the five sizes, with a tag in each, so the panel and the tags follow the field. */
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <ComboboxExample>
    <div class="flex w-full max-w-xs flex-col gap-3">
      <Field v-for="size in sizes" :id="`size-${size}`" :key="size" :label="size" :size="size">
        <Combobox :name="`size-${size}`" multiple :options="nations" :value="['fr']" placeholder="Type a country" />
      </Field>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ComboboxExample>
</template>
