<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Card from "~/reference/card/Card.vue";

/** `::card-content-example`: a card with a heading and a body, and one with every part. */
</script>

<template>
  <CardExample>
    <div class="grid w-full max-w-xl items-start gap-4 sm:grid-cols-2">
      <Card heading="Difference Engine">
        <p>Babbage's machine for working out tables of numbers, by the method of differences.</p>
      </Card>
      <Card heading="Analytical Engine">
        <template #eyebrow>Project</template>
        <template #media><CardExampleArt /></template>
        <p>Charles Babbage's design for a general-purpose mechanical computer, first described in 1837.</p>
        <template #footer><Button size="sm" variant="outline">Save</Button></template>
      </Card>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CardExample>
</template>
