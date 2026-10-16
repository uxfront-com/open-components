<script setup lang="ts">
import Textarea from "~/reference/textarea/Textarea.vue";

/** `::textarea-height-example`: a textarea people resize, and one that grows with its text. */
</script>

<template>
  <TextareaExample>
    <div class="flex w-full max-w-md flex-col gap-5">
      <div class="flex flex-col gap-1.5">
        <label for="height-address" class="text-sm font-medium">Street address</label>
        <Textarea id="height-address" :rows="3" autocomplete="street-address" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="height-comment" class="text-sm font-medium">Comment</label>
        <Textarea id="height-comment" :rows="2" auto-grow :max-rows="6" />
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TextareaExample>
</template>
