<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import type theme from "#build/ui/content/content-navigation";

/**
 * One level of DocsNavigation.vue, with the markup and classes of Nuxt UI's
 * UContentNavigation, so it looks the same. Its groups come in two kinds:
 *
 * - A group without a page of its own, like a top-level section, has a label and
 *   stays open.
 * - A group with a page of its own, like the Button's folder, whose index.md is
 *   its Overview, has a label that opens and closes the group without
 *   navigating. You reach its pages from the group, which lists its Overview
 *   first.
 *   It opens on any of its pages and closes once you leave them, and in between
 *   the label decides. The sidebar stays mounted as you move between pages, so
 *   the route sets it, rather than the state it mounted with.
 */
const props = withDefaults(
  defineProps<{
    navigation: ContentNavigationItem[];
    // The classes DocsNavigation.vue builds from Nuxt UI's theme.
    ui: Record<keyof typeof theme.slots, (variants?: Record<string, unknown>) => string>;
    level?: number;
  }>(),
  { level: 0 },
);

const route = useRoute();
const appConfig = useAppConfig();
const id = useId();

// Whether a group has a page of its own: a child at the group's own path.
const ownPage = (item: ContentNavigationItem) => item.children?.some((child) => child.path === item.path);
const inside = (item: ContentNavigationItem, path: string): boolean =>
  item.path === path || !!item.children?.some((child) => inside(child, path));

const open = ref<Record<string, boolean>>({});
watch(
  () => route.path,
  (path) => {
    for (const item of props.navigation) if (ownPage(item)) open.value[item.path] = inside(item, path);
  },
  { immediate: true },
);
</script>

<template>
  <ul :class="level ? ui.listWithChildren() : ui.list()">
    <template v-for="(item, index) in navigation" :key="`${index}-${item.path}`">
      <li
        v-if="item.children?.length"
        data-slot="itemWithChildren"
        :data-state="!ownPage(item) || open[item.path] ? 'open' : 'closed'"
        :class="ui.itemWithChildren({ level: level > 0 })"
      >
        <button
          v-if="ownPage(item)"
          type="button"
          data-slot="link"
          :data-state="open[item.path] ? 'open' : 'closed'"
          :aria-expanded="open[item.path]"
          :aria-controls="`${id}-${index}`"
          :class="ui.link({ active: false, level: level > 0 })"
          @click="open[item.path] = !open[item.path]"
        >
          <UIcon v-if="item.icon" :name="String(item.icon)" :class="ui.linkLeadingIcon({ active: false })" />
          <span :class="ui.linkTitle()">{{ item.title }}</span>
          <!-- Docus hides the theme's linkTrailing slot, which would hide the chevron too. -->
          <span data-slot="linkTrailing" class="ms-auto inline-flex items-center">
            <UIcon :name="appConfig.ui.icons.chevronDown" :class="ui.linkTrailingIcon()" />
          </span>
        </button>
        <div v-else data-state="open" :class="[ui.link({ active: false }), ui.trigger({ disabled: true })]">
          <UIcon v-if="item.icon" :name="String(item.icon)" :class="ui.linkLeadingIcon({ active: false })" />
          <span :class="ui.linkTitle()">{{ item.title }}</span>
        </div>

        <div v-show="!ownPage(item) || open[item.path]" :id="`${id}-${index}`" data-slot="content" :class="ui.content()">
          <DocsNavigationList
            :navigation="item.children"
            :ui
            :level="level + 1"
          />
        </div>
      </li>

      <li v-else data-slot="item" :class="ui.item({ level: level > 0 })">
        <ULink v-slot="{ active, ...link }" :to="item.path" exact custom>
          <ULinkBase v-bind="link" data-slot="link" :class="ui.link({ active, level: level > 0 })">
            <UIcon v-if="item.icon" :name="String(item.icon)" :class="ui.linkLeadingIcon({ active })" />
            <span :class="ui.linkTitle()">{{ item.title }}</span>
          </ULinkBase>
        </ULink>
      </li>
    </template>
  </ul>
</template>
