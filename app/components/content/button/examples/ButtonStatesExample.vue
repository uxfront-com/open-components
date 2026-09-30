<script setup lang="ts">
import Button from "~/reference/button/Button.vue";

/** `::button-states-example`: each state, captioned, with working toggle and menu buttons. */
const muted = ref(false);
const open = ref(false);
</script>

<template>
  <ButtonExample>
    <div class="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
      <figure class="flex flex-col items-center gap-2">
        <Button color="primary">Save</Button>
        <figcaption class="text-muted text-xs">At rest (try hovering, pressing or tabbing to it)</figcaption>
      </figure>
      <figure class="flex flex-col items-center gap-2">
        <Button color="primary" disabled>Save</Button>
        <figcaption class="text-muted text-xs">Disabled</figcaption>
      </figure>
      <figure class="flex flex-col items-center gap-2">
        <Button color="primary" disabled focusable-when-disabled>Save</Button>
        <figcaption class="text-muted text-xs">Disabled, but still focusable</figcaption>
      </figure>
      <figure class="flex flex-col items-center gap-2">
        <Button color="primary" loading loading-label="Saving">Save</Button>
        <figcaption class="text-muted text-xs">Loading</figcaption>
      </figure>
      <figure class="flex flex-col items-center gap-2">
        <Button variant="ghost" :aria-pressed="muted" @click="muted = !muted">
          <template #leading><UIcon :name="muted ? 'i-lucide-volume-x' : 'i-lucide-volume-2'" /></template>
          Mute
        </Button>
        <figcaption class="text-muted text-xs">Pressed: {{ muted }}</figcaption>
      </figure>
      <figure class="flex flex-col items-center gap-2">
        <Button variant="outline" aria-haspopup="menu" :aria-expanded="open" @click="open = !open">
          Options
          <template #trailing><UIcon name="i-lucide-chevron-down" /></template>
        </Button>
        <figcaption class="text-muted text-xs">Expanded: {{ open }}</figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ButtonExample>
</template>
