<script setup lang="ts">
// Replaces @uxfront/layer-docs's to render Docus's navigation with
// DocsNavigation.vue, as the sidebar does (DocsAsideLeftBody.vue), so a group with
// a page of its own, like the Button's, collapses there too. The rest is the
// layer's: `docsTheme.headerLinks` below 768px, where AppHeaderCTA hides them,
// then the Framework select. The navigation is Docus's
// (docus/app/components/app/AppHeaderBody.vue).
import type { ContentNavigationItem } from "@nuxt/content";
import { getFirstPagePath } from "docus/app/composables/useSubNavigation";

const navigation = inject<Ref<ContentNavigationItem[]>>("navigation");
const { subNavigationMode } = useSubNavigation();
const items = computed<ContentNavigationItem[]>(() => {
  const nav = navigation?.value || [];
  if (!subNavigationMode.value) return nav;
  return nav.map(({ children, ...item }) => ({
    ...item,
    path: children?.length ? getFirstPagePath({ ...item, children }) : item.path,
  }));
});
</script>

<template>
  <AppHeaderLinks orientation="vertical" class="mb-4 -mx-2.5 md:hidden" />
  <AppHeaderFramework />
  <DocsNavigation :navigation="items" />
</template>
