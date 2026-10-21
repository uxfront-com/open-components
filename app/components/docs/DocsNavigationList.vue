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
 *   its Overview, is a link to that page, in place of an "Overview" entry, with a
 *   chevron button beside it that opens and closes the group without navigating.
 *   It opens on any of its pages and closes once you leave them, and in between
 *   the chevron decides. The sidebar stays mounted as you move between pages, so
 *   the route sets it, rather than the state it mounted with.
 */
const props = withDefaults(
  defineProps<{
    navigation: ContentNavigationItem[];
    // The classes DocsNavigation.vue builds from Nuxt UI's theme.
    ui: Record<keyof typeof theme.slots, (variants?: Record<string, unknown>) => string>;
    level?: number;
    // Whether titles wrap rather than get cut short, like the Button's layers' full names.
    wrap?: boolean;
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
        <div v-if="ownPage(item)" class="flex items-center">
          <ULink v-slot="{ active, ...link }" :to="item.path" exact custom>
            <ULinkBase v-bind="link" data-slot="link" :class="ui.link({ active, level: level > 0 })">
              <UIcon v-if="item.icon" :name="String(item.icon)" :class="ui.linkLeadingIcon({ active })" />
              <span :class="ui.linkTitle()">{{ item.title }}</span>
            </ULinkBase>
          </ULink>
          <button
            type="button"
            :aria-label="`${item.title} pages`"
            :aria-expanded="open[item.path]"
            :aria-controls="`${id}-${index}`"
            class="shrink-0 inline-flex items-center justify-center size-7 rounded-md text-muted hover:text-highlighted focus-visible:outline-2 focus-visible:outline-primary transition-colors"
            @click="open[item.path] = !open[item.path]"
          >
            <UIcon
              :name="appConfig.ui.icons.chevronDown"
              class="size-5 transition-transform duration-200 ease-out motion-reduce:transition-none"
              :class="{ 'rotate-180': open[item.path] }"
            />
          </button>
        </div>
        <div v-else data-state="open" :class="[ui.link({ active: false }), ui.trigger({ disabled: true })]">
          <UIcon v-if="item.icon" :name="String(item.icon)" :class="ui.linkLeadingIcon({ active: false })" />
          <span :class="ui.linkTitle()">{{ item.title }}</span>
        </div>

        <div v-show="!ownPage(item) || open[item.path]" :id="`${id}-${index}`" data-slot="content" :class="ui.content()">
          <DocsNavigationList
            :navigation="item.children.filter((child) => child.path !== item.path)"
            :ui
            :level="level + 1"
            :wrap="ownPage(item)"
          />
        </div>
      </li>

      <li v-else data-slot="item" :class="ui.item({ level: level > 0 })">
        <ULink v-slot="{ active, ...link }" :to="item.path" exact custom>
          <ULinkBase v-bind="link" data-slot="link" :class="ui.link({ active, level: level > 0 })">
            <UIcon v-if="item.icon" :name="String(item.icon)" :class="ui.linkLeadingIcon({ active })" />
            <span :class="ui.linkTitle({ class: wrap && 'whitespace-normal' })">{{ item.title }}</span>
          </ULinkBase>
        </ULink>
      </li>
    </template>
  </ul>
</template>
