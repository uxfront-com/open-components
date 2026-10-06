<script setup lang="ts">
import Input from "~/reference/input/Input.vue";

/** `::input-types-example`: the types that pick the keyboard on phones, with their autocomplete. */
</script>

<template>
  <InputExample>
    <div class="grid w-full max-w-xl gap-x-6 gap-y-5 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <label for="types-email" class="text-sm font-medium">Email address</label>
        <Input id="types-email" type="email" autocomplete="email" spellcheck="false" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="types-phone" class="text-sm font-medium">Phone number</label>
        <Input id="types-phone" type="tel" autocomplete="tel" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="types-website" class="text-sm font-medium">Website</label>
        <Input id="types-website" type="url" autocomplete="url" spellcheck="false" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="types-code" class="text-sm font-medium">Security code</label>
        <Input id="types-code" inputmode="numeric" autocomplete="one-time-code" spellcheck="false" />
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </InputExample>
</template>
