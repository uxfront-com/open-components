<script setup lang="ts">
import Field from "~/reference/field/Field.vue";
import Input from "~/reference/input/Input.vue";

/** `::field-states-example`: a required field, an optional one, a disabled one and an invalid one, each captioned. */
</script>

<template>
  <FieldExample>
    <div class="grid w-full max-w-xl gap-x-6 gap-y-5 sm:grid-cols-2">
      <figure class="flex flex-col gap-1.5">
        <Field id="states-name" label="Full name" required>
          <Input autocomplete="name" />
        </Field>
        <figcaption class="text-muted text-xs">Required, which screen readers announce</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <Field id="states-company" label="Company (optional)">
          <Input autocomplete="organization" />
        </Field>
        <figcaption class="text-muted text-xs">Optional, in words</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <Field id="states-username" label="Username" hint="You can't change it" disabled>
          <Input value="ada" />
        </Field>
        <figcaption class="text-muted text-xs">Disabled</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <Field id="states-email" label="Email address" error="Enter an email address in the correct format, like name@example.com">
          <Input type="email" value="ada@" autocomplete="email" />
        </Field>
        <figcaption class="text-muted text-xs">Invalid</figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </FieldExample>
</template>
