<script setup lang="ts">
import Input from "~/reference/input/Input.vue";
import Textarea from "~/reference/textarea/Textarea.vue";
import type { TextareaProps } from "~/reference/textarea/Textarea.vue";

/** `::textarea-sizes-example`: a textarea of one row at each size, beside an Input of the same size. */
const sizes = ["xs", "sm", "md", "lg", "xl"] as const satisfies TextareaProps["size"][];
</script>

<template>
  <TextareaExample>
    <div class="flex w-full max-w-md flex-col gap-3">
      <div v-for="size in sizes" :key="size" class="flex items-start gap-2">
        <Input :size="size" :aria-label="`Subject (${size})`" class="flex-1" />
        <Textarea :size="size" :rows="1" :aria-label="`Message (${size})`" class="flex-1" />
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TextareaExample>
</template>
