<script setup lang="ts">
import Spinner from "~/reference/spinner/Spinner.vue";

/** `::spinner-size-example`: Spinners that take their size and colour from the text around them. */
</script>

<template>
  <SpinnerExample>
    <div class="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
      <p class="text-muted text-sm"><Spinner /> Saving draft</p>
      <p class="text-highlighted text-xl font-semibold"><Spinner /> Loading results</p>
      <Spinner class="large text-primary" />
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SpinnerExample>
</template>

<style scoped>
.large {
  --spinner--size: 2rem;
}
</style>
