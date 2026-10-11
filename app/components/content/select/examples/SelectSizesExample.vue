<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Select from "~/reference/select/Select.vue";
import type { SelectProps } from "~/reference/select/Select.vue";

/** `::select-sizes-example`: a select at each size, beside a Button of the same size. */
const sizes = ["xs", "sm", "md", "lg", "xl"] as const satisfies SelectProps["size"][];
</script>

<template>
  <SelectExample>
    <div class="flex w-full max-w-sm flex-col gap-3">
      <div v-for="size in sizes" :key="size" class="flex items-center gap-2">
        <label :for="`sizes-sort-${size}`" class="w-16 shrink-0 text-sm font-medium">Sort by</label>
        <Select :id="`sizes-sort-${size}`" :size="size" class="flex-1">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name</option>
        </Select>
        <Button :size="size">Apply</Button>
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>
