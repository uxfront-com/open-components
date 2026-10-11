<script setup lang="ts">
import Radio from "~/reference/radio-group/Radio.vue";
import RadioGroup from "~/reference/radio-group/RadioGroup.vue";
import type { RadioGroupProps } from "~/reference/radio-group/RadioGroup.vue";

/** `::radio-group-sizes-example`: the same group at each size. */
const sizes = ["xs", "sm", "md", "lg", "xl"] as const satisfies RadioGroupProps["size"][];
</script>

<template>
  <RadioGroupExample>
    <div class="flex w-full flex-wrap justify-center gap-x-8 gap-y-4">
      <RadioGroup
        v-for="size in sizes"
        :key="size"
        :size="size"
        :name="`sizes-delivery-${size}`"
        :legend="`Delivery (${size})`"
        model-value="standard"
      >
        <Radio value="standard">Standard</Radio>
        <Radio value="express">Express</Radio>
      </RadioGroup>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </RadioGroupExample>
</template>
