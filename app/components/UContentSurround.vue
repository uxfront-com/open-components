<script setup lang="ts">
/**
 * Replaces Nuxt UI's UContentSurround, the links to the previous and next pages
 * at the foot of Docus's docs page (docus/app/pages/[[lang]]/[...slug].vue), to
 * find those pages in the sidebar's order, with the component pages by name
 * (app/lib/navigation.ts), rather than in the order of the `surround` Docus passes
 * it, which Nuxt Content's queryCollectionItemSurroundings() finds by file path.
 * It renders Nuxt UI's own with them: keep it in step with how Docus uses it.
 */
import type { ContentNavigationItem } from "@nuxt/content";
import ContentSurround from "#ui/components/content/ContentSurround.vue";
import { findSurround, sortNavigation } from "~/lib/navigation";

// Docus's surround, which this replaces. Any other attribute goes on to Nuxt UI's.
defineProps<{ surround?: unknown }>();

const route = useRoute();
// The tree Nuxt Content builds the surround from, with each page's description,
// which the links show under their titles, as Docus asks for.
const { data: navigation } = await useAsyncData("docs-surround", () =>
  queryCollectionNavigation("docs", ["description"]),
);
// A null where there's no page, which Nuxt UI's leaves a gap for, as Docus's has.
const pages = computed(() => findSurround(sortNavigation(navigation.value ?? []), route.path));
</script>

<template>
  <ContentSurround :surround="pages as ContentNavigationItem[]" />
</template>
