<script setup lang="ts">
// Replaces @uxfront/layer-docs's to start the header's menu with the
// Documentation and Changelog links below 768px, where AppHeaderCTA has no room
// for them beside the header's buttons. The rest is the layer's, which its package doesn't export:
// the Framework select, then Docus's navigation (docus/app/components/app/AppHeaderBody.vue),
// rendered with DocsNavigation.vue, as the sidebar is (DocsAsideLeftBody.vue), so a
// group with a page of its own, like the Button's, collapses there too.
import type { ContentNavigationItem } from "@nuxt/content";
import { getFirstPagePath } from "docus/app/composables/useSubNavigation";

const links = useHeaderLinks();
const { frameworks } = useFramework();
const labelId = useId();

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
  <UNavigationMenu :items="links" orientation="vertical" class="mb-4 -mx-2.5 md:hidden" />
  <div v-if="frameworks.length">
    <span :id="labelId" class="w-full pr-2.5 py-1.5 flex items-center text-sm text-muted">
      Framework
    </span>
    <DocsFrameworkSelect :aria-labelledby="labelId" class="mb-2" />
  </div>
  <DocsNavigation :navigation="items" />
</template>
