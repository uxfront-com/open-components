<script setup lang="ts">
// This app.vue replaces the Docus one, so docs pages, the changelog and the blog
// mount the Docus shell (header, sidebar, search) themselves. The homepage brings its own,
// and doesn't load this one.
const DocusApp = defineAsyncComponent(() => import("docus/app/app.vue"));

const route = useRoute();
const usesDocus = computed(() =>
  ["/docs", "/changelog", "/blog"].some((base) => route.path === base || route.path.startsWith(`${base}/`)),
);

useHead({
  titleTemplate: (title) => (title ? `${title} - Open Components` : "Open Components"),
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <DocusApp v-if="usesDocus" />
  <NuxtPage v-else />
</template>
