<script setup lang="ts">
import Field from "~/reference/field/Field.vue";
import Textarea from "~/reference/textarea/Textarea.vue";

/** `::field-textarea-example`: a Textarea whose count comes after the Field's hint in its description. */
</script>

<template>
  <FieldExample>
    <Field id="textarea-bio" label="Bio" hint="A sentence or two about you, for your profile" class="w-full max-w-sm">
      <Textarea :limit="200" />
    </Field>
    <template v-if="$slots.default" #code><slot /></template>
  </FieldExample>
</template>
