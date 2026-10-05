<script setup lang="ts">
import Input from "~/reference/input/Input.vue";

/** `::input-label-example`: an input named by its label, and described by its hint. */
</script>

<template>
  <InputExample>
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <label for="label-phone" class="text-sm font-medium">Phone number</label>
      <p id="label-phone-hint" class="text-muted text-sm">For international numbers, include the country code</p>
      <Input id="label-phone" type="tel" autocomplete="tel" aria-describedby="label-phone-hint" />
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </InputExample>
</template>
