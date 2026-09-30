<script setup lang="ts">
import Button from "~/reference/button/Button.vue";

/** `::button-link-example`: a Button that navigates, rendered as a link. */
</script>

<template>
  <ButtonExample>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Button href="/docs" color="primary">
        Read the introduction
        <template #trailing><UIcon name="i-lucide-arrow-right" class="rtl:-scale-x-100" /></template>
      </Button>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ButtonExample>
</template>
