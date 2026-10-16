<script setup lang="ts">
import Radio from "~/reference/radio-group/Radio.vue";
import RadioGroup from "~/reference/radio-group/RadioGroup.vue";

/** `::radio-group-hint-example`: a group named by its legend, and described by its hint. */
</script>

<template>
  <RadioGroupExample>
    <div class="flex w-full max-w-sm flex-col">
      <RadioGroup name="hint-delivery" legend="How would you like it delivered?" hint="Orders placed before 2pm leave the same day">
        <Radio value="standard">Standard, in 3 to 5 working days</Radio>
        <Radio value="express">Express, the next working day</Radio>
        <Radio value="pickup">Collect from a store</Radio>
      </RadioGroup>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </RadioGroupExample>
</template>
