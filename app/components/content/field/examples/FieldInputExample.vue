<script setup lang="ts">
import Field from "~/reference/field/Field.vue";
import Input from "~/reference/input/Input.vue";

/** `::field-input-example`: an Input with its label, hint and error message. */
</script>

<template>
  <FieldExample>
    <Field
      id="input-email"
      label="Email address"
      hint="We'll only use it to send your receipt"
      error="Enter your email address"
      required
      class="w-full max-w-sm"
    >
      <Input type="email" autocomplete="email" />
    </Field>
    <template v-if="$slots.default" #code><slot /></template>
  </FieldExample>
</template>
