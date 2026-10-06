<script setup lang="ts">
import Input from "~/reference/input/Input.vue";

/** `::input-states-example`: each state, labelled and captioned. */
</script>

<template>
  <InputExample>
    <div class="grid w-full max-w-xl gap-x-6 gap-y-5 sm:grid-cols-2">
      <figure class="flex flex-col gap-1.5">
        <label for="states-name" class="text-sm font-medium">Full name</label>
        <Input id="states-name" autocomplete="off" value="Ada Lovelace" />
        <figcaption class="text-muted text-xs">At rest (try hovering, clicking or tabbing to it)</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <label for="states-username" class="text-sm font-medium">Username</label>
        <Input id="states-username" value="ada" disabled />
        <figcaption class="text-muted text-xs">Disabled</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <label for="states-account" class="text-sm font-medium">Account ID</label>
        <Input id="states-account" value="ACME-4821" readonly />
        <figcaption class="text-muted text-xs">Read-only</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <label for="states-email" class="text-sm font-medium">Email address</label>
        <Input
          id="states-email"
          type="email"
          autocomplete="off"
          value="ada@"
          aria-invalid="true"
          aria-describedby="states-email-error"
        />
        <p id="states-email-error" class="text-sm text-(--color--error-text)">
          Enter an email address in the correct format, like name@example.com
        </p>
        <figcaption class="text-muted text-xs">Invalid</figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </InputExample>
</template>
