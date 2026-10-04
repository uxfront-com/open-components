<script setup lang="ts">
/**
 * The Roadmap's checkbox, ticked once a component's page has shipped. It goes
 * before the component's name, in the first column of the page's tables:
 *
 * ```md
 * | :roadmap-check{shipped} [Button](/docs/components/button) | … |
 * | :roadmap-check Field                                     | … |
 * ```
 *
 * It only shows a status, so it draws a checkbox rather than rendering a form
 * control, and assistive technologies read the status as text instead.
 */
defineProps<{
  shipped?: boolean;
}>();
</script>

<template>
  <span class="roadmap-check">
    <span
      class="me-2 inline-flex size-4 items-center justify-center rounded-sm align-middle"
      :class="shipped ? 'bg-primary text-inverted' : 'ring ring-inset ring-(--ui-text-muted)'"
      aria-hidden="true"
    >
      <UIcon v-if="shipped" name="i-lucide-check" class="size-3" />
    </span>
    <span class="sr-only">{{ shipped ? "Shipped" : "Planned" }}</span>
  </span>
</template>
