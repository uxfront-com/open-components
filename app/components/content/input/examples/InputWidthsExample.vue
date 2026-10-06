<script setup lang="ts">
import Input from "~/reference/input/Input.vue";

/** `::input-widths-example`: inputs as wide as the values they expect. */
</script>

<template>
  <InputExample>
    <div class="flex w-full max-w-md flex-col gap-5">
      <div class="flex flex-col gap-1.5">
        <label for="widths-street" class="text-sm font-medium">Street address</label>
        <Input id="widths-street" autocomplete="street-address" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="widths-postcode" class="text-sm font-medium">Postcode</label>
        <Input id="widths-postcode" class="postcode" autocomplete="postal-code" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="widths-phone" class="text-sm font-medium">Phone number</label>
        <Input id="widths-phone" class="phone" type="tel" autocomplete="tel" />
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </InputExample>
</template>

<style scoped>
/* Room for the value, in characters, plus the padding on both sides. */
.postcode {
  width: calc(10ch + 2 * var(--input--padding));
}
.phone {
  width: calc(20ch + 2 * var(--input--padding));
}
</style>
