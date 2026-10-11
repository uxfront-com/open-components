<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Card from "~/reference/card/Card.vue";

/** `::card-layout-example`: a list of linked cards in a grid, one height per row, with their footers lined up. */
const projects = [
  { name: "Analytical Engine", hue: 275, summary: "A general-purpose mechanical computer, first described in 1837." },
  { name: "Difference Engine", hue: 160, summary: "A machine for working out tables of numbers." },
  { name: "Note G", hue: 30, summary: "Ada Lovelace's program for working out Bernoulli numbers on the Analytical Engine." },
];
</script>

<template>
  <CardExample>
    <ul class="card-layout-example-list">
      <Card
        v-for="project in projects"
        :key="project.name"
        as="li"
        :heading="project.name"
        :href="`#${project.name.toLowerCase().replaceAll(' ', '-')}`"
      >
        <template #media><CardExampleArt :hue="project.hue" /></template>
        <p>{{ project.summary }}</p>
        <template #footer><Button size="sm" variant="outline">Save</Button></template>
      </Card>
    </ul>
    <template v-if="$slots.default" #code><slot /></template>
  </CardExample>
</template>

<style scoped>
.card-layout-example-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(12rem, 100%), 1fr));
  gap: 1rem;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
