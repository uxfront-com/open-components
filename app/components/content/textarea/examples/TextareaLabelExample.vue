<script setup lang="ts">
import Textarea from "~/reference/textarea/Textarea.vue";

/** `::textarea-label-example`: a textarea named by its label, and described by its hint. */
</script>

<template>
  <TextareaExample>
    <div class="flex w-full max-w-md flex-col gap-1.5">
      <label for="label-details" class="text-sm font-medium">What went wrong?</label>
      <p id="label-details-hint" class="text-muted text-sm">
        Include what you were doing, and any error message you saw
      </p>
      <Textarea id="label-details" :rows="4" aria-describedby="label-details-hint" />
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TextareaExample>
</template>
