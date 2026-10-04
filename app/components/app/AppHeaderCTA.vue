<script setup lang="ts">
// Replaces Docus's, which is empty, to link the docs and the changelog from the
// header's right side, beside its buttons.
const links = useHeaderLinks();
</script>

<template>
  <UNavigationMenu :items="links" class="hidden sm:flex" />
</template>
