<script setup lang="ts">
import Checkbox from "~/reference/checkbox/Checkbox.vue";
import type { CheckboxProps } from "~/reference/checkbox/Checkbox.vue";

/** `::checkbox-sizes-example`: a checkbox at each size. */
const sizes = ["xs", "sm", "md", "lg", "xl"] as const satisfies CheckboxProps["size"][];
</script>

<template>
  <CheckboxExample>
    <div class="flex flex-col gap-2">
      <Checkbox v-for="size in sizes" :key="size" :size="size" :checked="size === 'md'">
        Email me updates ({{ size }})
      </Checkbox>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxExample>
</template>
