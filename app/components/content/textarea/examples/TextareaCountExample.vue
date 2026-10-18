<script setup lang="ts">
import Textarea from "~/reference/textarea/Textarea.vue";

/** `::textarea-count-example`: a limit stated in the hint, and a count that lets people go over it. */
</script>

<template>
  <TextareaExample>
    <div class="flex w-full max-w-md flex-col gap-1.5">
      <label for="count-bio" class="text-sm font-medium">Bio</label>
      <p id="count-bio-hint" class="text-muted text-sm">You can enter up to 160 characters</p>
      <Textarea
        id="count-bio"
        :limit="160"
        aria-describedby="count-bio-hint"
        value="Mathematician and writer, known for her work on Charles Babbage's Analytical Engine. She wrote what's often called the first computer program."
      />
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TextareaExample>
</template>
