<script setup lang="ts">
import CheckboxGroup from "~/reference/checkbox-group/CheckboxGroup.vue";
import type { CheckboxGroupProps } from "~/reference/checkbox-group/CheckboxGroup.vue";

/** `::checkbox-group-sizes-example`: a group at each size. */
const sizes = ["xs", "sm", "md", "lg", "xl"] as const satisfies CheckboxGroupProps["size"][];
const emails = [
  { value: "news", label: "Product news" },
  { value: "tips", label: "Tips and guides" },
];
</script>

<template>
  <CheckboxGroupExample>
    <div class="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <CheckboxGroup v-for="size in sizes" :key="size" :size="size" :name="`sizes-${size}`" :options="emails" :value="['news']">
        Which emails would you like? ({{ size }})
      </CheckboxGroup>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxGroupExample>
</template>
