<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import type { ButtonProps } from "~/reference/button/Button.vue";

/** `::button-sizes-example`: the five sizes, with a label and icon-only. */
const sizes = ["xs", "sm", "md", "lg", "xl"] as const satisfies ButtonProps["size"][];
</script>

<template>
  <ButtonExample>
    <div class="flex flex-col items-center gap-4">
      <div class="flex flex-wrap items-center justify-center gap-3">
        <Button v-for="size in sizes" :key="size" :size="size" color="primary" variant="soft">
          <template #leading><UIcon name="i-lucide-plus" /></template>
          Add {{ size }}
        </Button>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <Button
          v-for="size in sizes"
          :key="size"
          :size="size"
          :label="`Settings (${size})`"
          variant="outline"
          icon-only
        >
          <template #leading><UIcon name="i-lucide-settings" /></template>
        </Button>
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ButtonExample>
</template>
