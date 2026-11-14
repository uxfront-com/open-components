<script setup lang="ts">
import Tag from "~/reference/tag/Tag.vue";

/** `::tag-states-example`: a plain tag, a link, a removable tag, a disabled one and a read-only one, captioned. */
</script>

<template>
  <TagExample>
    <div class="grid w-full max-w-xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
      <figure class="flex flex-col items-start gap-1.5">
        <Tag label="Bug" />
        <figcaption class="text-muted text-xs">Plain</figcaption>
      </figure>
      <figure class="flex flex-col items-start gap-1.5">
        <Tag label="Bug" href="#labels-bug" />
        <figcaption class="text-muted text-xs">A link (try hovering or tabbing to it)</figcaption>
      </figure>
      <figure class="flex flex-col items-start gap-1.5">
        <Tag label="Bug" removable />
        <figcaption class="text-muted text-xs">Removable</figcaption>
      </figure>
      <figure class="flex flex-col items-start gap-1.5">
        <Tag label="Bug" href="#labels-bug" removable disabled />
        <figcaption class="text-muted text-xs">Disabled</figcaption>
      </figure>
      <figure class="flex flex-col items-start gap-1.5">
        <Tag label="Bug" href="#labels-bug" removable readonly />
        <figcaption class="text-muted text-xs">Read-only</figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TagExample>
</template>
