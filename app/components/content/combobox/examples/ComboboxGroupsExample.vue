<script setup lang="ts">
import Combobox from "~/reference/combobox/Combobox.vue";
import Field from "~/reference/field/Field.vue";
import { destinations } from "~/data/select-options";

/** `::combobox-groups-example`: groups and a separator, which hide when nothing in them matches. */
</script>

<template>
  <ComboboxExample>
    <div class="w-full max-w-xs">
      <Field id="groups-destination" label="Destination">
        <Combobox name="groups-destination" :options="destinations" placeholder="Type a country" />
      </Field>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ComboboxExample>
</template>
