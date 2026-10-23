<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import theme from "#build/ui/content/content-navigation";
import { tv } from "#ui/utils/tv";
import { sortNavigation } from "~/lib/navigation";

/**
 * The docs' navigation, in the sidebar (DocsAsideLeftBody.vue) and the header's
 * menu (app/components/app/AppHeaderBody.vue), in place of the UContentNavigation
 * Docus renders in both, which keeps every group open. It looks the same, with
 * Nuxt UI's theme for it and Docus's options, and the top-level sections stay
 * open, but a group with a page of its own, like the Button's, has a label that
 * opens and closes the group (see DocsNavigationList.vue). It lists the component pages by name, as the links
 * to the previous and next pages do (app/lib/navigation.ts).
 */
const props = defineProps<{ navigation: ContentNavigationItem[] }>();
const navigation = computed(() => sortNavigation(props.navigation));

const appConfig = useAppConfig();
const variants = useUIConfig("contentNavigation");
// Each of the theme's slots, like `link`, as a function from its variants to classes.
const ui = computed(
  () =>
    tv({ extend: theme, ...(appConfig.ui?.contentNavigation || {}) })({
      color: variants.value.color,
      variant: variants.value.variant ?? "link",
      highlight: variants.value.highlight ?? true,
      highlightColor: variants.value.highlightColor || variants.value.color,
    } as never) as unknown as Record<keyof typeof theme.slots, (variants?: Record<string, unknown>) => string>,
);
</script>

<template>
  <nav data-slot="root" :class="ui.root()">
    <DocsNavigationList :navigation :ui />
  </nav>
</template>
