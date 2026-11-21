<script setup lang="ts">
/**
 * A group's cards on the components hub, content/docs/3.components/index.md, as a
 * grid. Each card is a `:::components-hub-card` in its default slot:
 *
 * ```md
 * ::components-hub
 * :::components-hub-card{preview="button"}
 * …
 * :::
 * ::
 * ```
 *
 * It's a list, so screen readers say how many components the group has before
 * their readers go through them.
 */
</script>

<template>
  <!-- `list-style: none` takes the list's role away in Safari, so it's set again. -->
  <ul class="components-hub not-prose" role="list">
    <slot />
  </ul>
</template>

<style scoped>
/* As many columns as fit, each at least 13rem wide, so no card's footer gets too
   narrow for its four links. One column on a phone. */
.components-hub {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
  gap: 1rem;
  margin: 1.25rem 0 2rem;
  padding: 0;
  list-style: none;
}
</style>
