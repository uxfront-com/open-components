<script setup lang="ts">
import Select from "~/reference/select/Select.vue";

/** `::select-widths-example`: selects as wide as their longest option. */
</script>

<template>
  <SelectExample>
    <div class="flex w-full max-w-md flex-col gap-5">
      <div class="flex flex-col gap-1.5">
        <label for="widths-title" class="text-sm font-medium">Title</label>
        <Select id="widths-title" class="title" autocomplete="honorific-prefix">
          <option>Mr</option>
          <option>Mrs</option>
          <option>Ms</option>
          <option>Mx</option>
          <option>Dr</option>
        </Select>
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="widths-month" class="text-sm font-medium">Expiry month</label>
        <Select id="widths-month" class="month" autocomplete="cc-exp-month">
          <option value="01">January</option>
          <option value="02">February</option>
          <option value="09">September</option>
        </Select>
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>

<style scoped>
/* Room for the longest option, in characters, plus the padding and the indicator. */
.title {
  width: calc(5ch + 2 * var(--select--padding) + var(--select--indicator--size) + var(--select--gap));
}
.month {
  width: calc(11ch + 2 * var(--select--padding) + var(--select--indicator--size) + var(--select--gap));
  max-width: 100%;
}
</style>
