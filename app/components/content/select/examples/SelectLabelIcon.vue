<script setup lang="ts">
/** An issue label's icon, for the Select's icons example. Each name is written out, so the icons are in the static build. */
defineProps<{ value: string }>();
</script>

<template>
  <UIcon v-if="value === 'bug'" name="i-lucide-bug" mode="svg" />
  <UIcon v-else-if="value === 'feature'" name="i-lucide-sparkles" mode="svg" />
  <UIcon v-else-if="value === 'docs'" name="i-lucide-book-open" mode="svg" />
  <UIcon v-else name="i-lucide-circle-help" mode="svg" />
</template>
