<script setup lang="ts">
// Replaces Docus's, which renders UContentNavigation with every group always
// open, to render DocsNavigation.vue instead, where a group with a page of its own,
// like the Button's, collapses. The rest is Docus's: keep it in step with theirs.
const { sidebarNavigation } = useSubNavigation();
</script>

<template>
  <DocsNavigation :navigation="sidebarNavigation" />
</template>
