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
      <div v-for="size in sizes" :key="size" class="grid grid-cols-2 items-start gap-x-2 gap-y-1">
        <label :for="`sizes-subject-${size}`" class="text-sm font-medium">Subject ({{ size }})</label>
        <label :for="`sizes-message-${size}`" class="text-sm font-medium">Message ({{ size }})</label>
        <Input :id="`sizes-subject-${size}`" :size="size" />
        <Textarea :id="`sizes-message-${size}`" :size="size" :rows="1" />
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TextareaExample>
</template>
