<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Input from "~/reference/input/Input.vue";
import type { InputProps } from "~/reference/input/Input.vue";

/** `::input-sizes-example`: a search input at each size, beside a Button of the same size. */
const sizes = ["xs", "sm", "md", "lg", "xl"] as const satisfies InputProps["size"][];
</script>

<template>
  <InputExample>
    <div class="flex w-full max-w-sm flex-col gap-3">
      <div v-for="size in sizes" :key="size" class="flex items-center gap-2">
        <Input :size="size" type="search" :aria-label="`Search (${size})`" class="flex-1">
          <template #leading><UIcon name="i-lucide-search" mode="svg" /></template>
        </Input>
        <Button :size="size">Search</Button>
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </InputExample>
</template>
