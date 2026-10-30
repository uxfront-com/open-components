<script setup lang="ts">
import CheckboxGroup from "~/reference/checkbox-group/CheckboxGroup.vue";
import Field from "~/reference/field/Field.vue";

/** `::field-checkbox-group-example`: a Checkbox Group, named by its legend, with the Field's hint and error after it. */
const contact = [
  { value: "email", label: "Email" },
  { value: "sms", label: "Text message" },
  { value: "phone", label: "Phone call" },
];
</script>

<template>
  <FieldExample>
    <Field
      id="checkbox-group-contact"
      hint="Pick at least one"
      error="Choose how we can contact you"
      class="w-full max-w-sm"
    >
      <CheckboxGroup name="contact" :options="contact">How can we contact you?</CheckboxGroup>
    </Field>
    <template v-if="$slots.default" #code><slot /></template>
  </FieldExample>
</template>
