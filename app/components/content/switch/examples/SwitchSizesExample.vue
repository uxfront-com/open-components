<script setup lang="ts">
import Switch from "~/reference/switch/Switch.vue";
import type { SwitchProps } from "~/reference/switch/Switch.vue";

/** `::switch-sizes-example`: a switch at each size, each beside its label. */
const sizes = ["xs", "sm", "md", "lg", "xl"] as const satisfies SwitchProps["size"][];
</script>

<template>
  <SwitchExample>
    <div class="flex w-full max-w-xs flex-col gap-3">
      <div v-for="size in sizes" :key="size" class="flex items-center justify-between gap-4">
        <label :for="`sizes-${size}`" class="text-sm font-medium">Notifications ({{ size }})</label>
        <Switch :id="`sizes-${size}`" :size="size" checked />
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SwitchExample>
</template>
