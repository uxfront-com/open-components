<script setup lang="ts">
import Button from "~/reference/button/Button.vue";

/** `::button-languages-example`: a long German label and a right-to-left Arabic one. */
</script>

<template>
  <ButtonExample>
    <div class="flex flex-wrap items-end justify-center gap-x-10 gap-y-6">
      <figure class="flex flex-col items-center gap-2">
        <div class="w-40">
          <Button color="primary" lang="de">Alle Änderungen speichern</Button>
        </div>
        <figcaption class="text-muted text-xs">German, in a narrow column</figcaption>
      </figure>
      <figure class="flex flex-col items-center gap-2">
        <div dir="rtl" lang="ar">
          <Button variant="outline">
            متابعة
            <template #trailing><UIcon name="i-lucide-arrow-right" class="rtl:-scale-x-100" /></template>
          </Button>
        </div>
        <figcaption class="text-muted text-xs">Arabic, from right to left</figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ButtonExample>
</template>
