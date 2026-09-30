<script setup lang="ts">
import Button from "~/reference/button/Button.vue";

/** `::button-icons-example`: leading, trailing and icon-only. */
</script>

<template>
  <ButtonExample>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Button color="primary">
        <template #leading><UIcon name="i-lucide-plus" /></template>
        New project
      </Button>
      <Button variant="outline">
        Continue
        <template #trailing><UIcon name="i-lucide-arrow-right" class="rtl:-scale-x-100" /></template>
      </Button>
      <Button label="Delete" variant="ghost" color="error" icon-only>
        <template #leading><UIcon name="i-lucide-trash-2" /></template>
      </Button>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ButtonExample>
</template>
