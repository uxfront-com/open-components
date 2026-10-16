<script setup lang="ts">
import Card from "~/reference/card/Card.vue";

/** `::card-states-example`: a card on its own, and one that's a link, captioned. */
</script>

<template>
  <CardExample>
    <div class="grid w-full max-w-xl gap-x-6 gap-y-5 sm:grid-cols-2">
      <figure class="flex flex-col gap-1.5">
        <Card heading="Difference Engine" class="grow">
          <p>A machine for working out tables of numbers.</p>
        </Card>
        <figcaption class="text-muted text-xs">Without a link, it has no states</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <Card heading="Analytical Engine" href="#analytical-engine" class="grow">
          <p>A general-purpose mechanical computer.</p>
        </Card>
        <figcaption class="text-muted text-xs">A link (try hovering or tabbing to it)</figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CardExample>
</template>
