<script setup lang="ts">
import Field from "~/reference/field/Field.vue";
import Radio from "~/reference/radio-group/Radio.vue";
import RadioGroup from "~/reference/radio-group/RadioGroup.vue";

/** `::field-radio-group-example`: a Radio Group, which renders the Field's hint and error itself. */
</script>

<template>
  <FieldExample>
    <Field hint="Express arrives the next working day" error="Choose a delivery option" required class="w-full max-w-sm">
      <RadioGroup name="radio-group-delivery" legend="Delivery">
        <Radio value="standard">Standard</Radio>
        <Radio value="express">Express</Radio>
      </RadioGroup>
    </Field>
    <template v-if="$slots.default" #code><slot /></template>
  </FieldExample>
</template>
