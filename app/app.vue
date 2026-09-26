<script setup lang="ts">
useHead({
  titleTemplate: (title) => (title ? `${title} - Open Components` : "Open Components"),
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtPage />
</template>
