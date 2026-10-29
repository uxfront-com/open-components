<script setup lang="ts">
import Checkbox from "~/reference/checkbox/Checkbox.vue";
import Field from "~/reference/field/Field.vue";

/** `::field-checkbox-example`: a Checkbox, which names itself, with the Field's hint and error under its label. */
</script>

<template>
  <FieldExample>
    <Field
      id="checkbox-terms"
      hint="You can read them before you sign up"
      error="Agree to the terms to create an account"
      required
      class="w-full max-w-sm"
    >
      <Checkbox name="terms">I agree to the terms</Checkbox>
    </Field>
    <template v-if="$slots.default" #code><slot /></template>
  </FieldExample>
</template>
