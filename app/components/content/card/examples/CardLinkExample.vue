<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Card from "~/reference/card/Card.vue";

/** `::card-link-example`: a card that's a link through its heading, with two actions of its own. */
const saved = ref(false);
</script>

<template>
  <CardExample>
    <Card heading="Analytical Engine" href="#analytical-engine" class="w-full max-w-xs">
      <template #eyebrow>Project</template>
      <template #media><CardExampleArt /></template>
      <p>Charles Babbage's design for a general-purpose mechanical computer, first described in 1837.</p>
      <template #actions>
        <Button size="sm" variant="outline" :aria-pressed="saved" @click="saved = !saved">Save</Button>
        <Button size="sm" variant="ghost">Share…</Button>
      </template>
      <template #footer>By Charles Babbage</template>
    </Card>
    <template v-if="$slots.default" #code><slot /></template>
  </CardExample>
</template>
