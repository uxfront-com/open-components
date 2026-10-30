<script setup lang="ts">
import Field from "~/reference/field/Field.vue";
import Switch from "~/reference/switch/Switch.vue";

/** `::field-switch-example`: a Switch after its label, on the same row, with the hint under both. */
</script>

<template>
  <FieldExample>
    <Field id="switch-alerts" label="Price alerts" hint="We'll email you when the price drops" class="w-full max-w-sm">
      <Switch />
    </Field>
    <template v-if="$slots.default" #code><slot /></template>
  </FieldExample>
</template>
