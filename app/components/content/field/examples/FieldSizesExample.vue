<script setup lang="ts">
import Field from "~/reference/field/Field.vue";
import Input from "~/reference/input/Input.vue";

/** `::field-sizes-example`: a Field in every size, which its Input takes too. */
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <FieldExample>
    <div class="grid w-full max-w-sm gap-5">
      <Field
        v-for="size in sizes"
        :id="`sizes-name-${size}`"
        :key="size"
        :size="size"
        label="Full name"
        hint="As it's written on your card"
      >
        <Input autocomplete="name" />
      </Field>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </FieldExample>
</template>
