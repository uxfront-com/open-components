<script setup lang="ts">
import { computed, nextTick, onMounted, useAttrs, useTemplateRef, watch } from "vue";
import { announce, prepareAnnouncer } from "../button/announce";
import Tag, { type TagProps } from "../tag/Tag.vue";

export interface TagGroupItem {
  /** The tag's key, unique in the group, and what `remove` hands back. */
  value: string;
  /** The tag's text, which also names its remove button, like "Remove Bug". */
  label: string;
  /** Makes the tag's label a link, to a page about what it names. */
  href?: string;
  /** Dims this tag, drops its remove button and turns its link off. */
  disabled?: boolean;
  /** Drops this tag's remove button, so people can read it but not remove it. */
  readonly?: boolean;
}

export interface TagGroupProps {
  /** The tags, in order. The group shows them and never changes the list itself. */
  tags: TagGroupItem[];
  /** Names the list, like "Labels", for screen readers. Or point `aria-labelledby` at a visible heading. */
  label?: string;
  size?: TagProps["size"];
  /** Gives every tag a remove button, which fires `remove`. */
  removable?: boolean;
  /** Dims every tag, drops their remove buttons and turns their links off. */
  disabled?: boolean;
  /** Drops every remove button, so people can read the tags but not remove them. Links still work. */
  readonly?: boolean;
  /** A remove button's name, which screen readers read and voice control users say. */
  removeLabel?: (label: string) => string;
  /** What screen readers announce once a tag that was removed has gone. */
  removedLabel?: (label: string) => string;
  /** What the group says when it has no tags. */
  emptyLabel?: string;
  /** Where focus goes when a removed tag has no tag with a remove button after it, like the field the tags came from. */
  fallbackFocus?: HTMLElement | null | (() => HTMLElement | null | undefined);
}

const {
  tags,
  label,
  size = "md",
  removable = false,
  disabled = false,
  readonly = false,
  removeLabel = (label: string) => `Remove ${label}`,
  removedLabel = (label: string) => `${label} removed`,
  emptyLabel = "No tags",
  fallbackFocus,
} = defineProps<TagGroupProps>();

const emit = defineEmits<{
  /** Fires when a tag's remove button is pressed. The group keeps the tag until `tags` drops it. */
  remove: [tag: TagGroupItem];
}>();

defineSlots<{
  /** A tag's label, when it's more than plain text, or your router's link. It goes to the Tag's default slot. */
  tag?: (props: { tag: TagGroupItem }) => unknown;
  /** An icon before a tag's label, hidden from assistive technologies. It goes to the Tag's leading slot. */
  leading?: (props: { tag: TagGroupItem }) => unknown;
  /** What the group shows when it has no tags, in place of `emptyLabel`. */
  empty?: () => unknown;
}>();

// The name belongs to the list, not to the wrapper around it, so these go to the <ul>
// and everything else, like a class or an id, to the root.
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const NAMING = ["aria-label", "aria-labelledby", "aria-describedby"];
const rootAttrs = computed(() => Object.fromEntries(Object.entries(attrs).filter(([key]) => !NAMING.includes(key))));
const listAttrs = computed(() => Object.fromEntries(Object.entries(attrs).filter(([key]) => NAMING.includes(key))));

const root = useTemplateRef<HTMLElement>("root");
const list = useTemplateRef<HTMLElement>("list");
const empty = useTemplateRef<HTMLElement>("empty");

// The tags whose remove button was pressed, so the group announces them once they've gone,
// and only them: a tag the app takes away for another reason isn't announced.
const pressed = new Set<string>();

function onRemove(tag: TagGroupItem) {
  pressed.add(tag.value);
  emit("remove", tag);
}

const removeButton = (item: Element | undefined) => item?.querySelector<HTMLElement>('button[data-slot="remove"]') ?? null;
const resolve = (target: TagGroupProps["fallbackFocus"]) => (typeof target === "function" ? target() : target) ?? null;

// The last resort, when tags are left but none has a remove button: the list itself takes
// focus, for as long as it holds it, so it never stops a click or a Tab otherwise.
function focusList(element: HTMLElement) {
  element.setAttribute("tabindex", "-1");
  element.addEventListener("blur", () => element.removeAttribute("tabindex"), { once: true });
  element.focus();
}

let previousTags = tags;

// Runs before the list re-renders, while the removed tags are still in the DOM, to see
// where focus is. Once they've gone, focus moves to the next remove button, then to
// fallbackFocus, then to the previous remove button, and with no tags left, to the empty
// state, or to the list when the tags left can't be removed, so keyboard users never fall
// back to the top of the page.
watch(
  () => tags.map((tag) => tag.value),
  (next, previous) => {
    const labels = new Map(previousTags.map((tag) => [tag.value, tag.label]));
    previousTags = tags;
    const removed = previous.filter((value) => !next.includes(value));
    if (!removed.length) return;
    const before = list.value ? [...list.value.children] : [];
    const active = document.activeElement;
    const focusedIndex = before.findIndex((item) => item.contains(active));
    const focusWasLost = !active || active === document.body;
    // Focus moves when it was on a tag that's gone, or when a tag whose button was pressed
    // went and focus is nowhere, like after a click in Safari, which doesn't focus buttons.
    // Anywhere else, like a dialog that asked first, it stays.
    let anchor = focusedIndex >= 0 && removed.includes(previous[focusedIndex]!) ? focusedIndex : -1;
    if (anchor < 0 && focusWasLost) anchor = previous.findIndex((value) => removed.includes(value) && pressed.has(value));
    const announced = removed.filter((value) => pressed.has(value));
    for (const value of removed) pressed.delete(value);

    nextTick(() => {
      if (anchor >= 0) {
        const items = list.value ? [...list.value.children] : [];
        const after = previous.slice(anchor + 1).filter((value) => next.includes(value));
        const prior = previous.slice(0, anchor).filter((value) => next.includes(value)).reverse();
        const find = (values: string[]) =>
          values.map((value) => removeButton(items[next.indexOf(value)])).find(Boolean) ?? null;
        const target = find(after) ?? resolve(fallbackFocus) ?? find(prior);
        if (target) target.focus();
        else if (list.value) focusList(list.value);
        else empty.value?.focus();
      }
      for (const value of announced) announce(removedLabel(labels.get(value) ?? value));
    });
  },
  { flush: "pre" },
);

onMounted(() => {
  if (removable) prepareAnnouncer();
  if (import.meta.env.DEV && !label && !listAttrs.value["aria-label"] && !listAttrs.value["aria-labelledby"]) {
    console.warn(
      "[TagGroup] has no name, so screen readers can't say what its tags are: give it a label, or aria-labelledby.",
      root.value,
    );
  }
});
</script>

<template>
  <div ref="root" class="tag-group" :data-size="size" v-bind="rootAttrs">
    <!-- A real list, so screen readers say what the tags are and how many there are, like
         "list, Labels, 3 items". role="list" keeps it a list in Safari, which drops the role
         from a list without bullets. -->
    <ul v-if="tags.length" ref="list" data-slot="list" role="list" :aria-label="label" v-bind="listAttrs">
      <li v-for="tag in tags" :key="tag.value" data-slot="item">
        <Tag
          :label="tag.label"
          :size="size"
          :href="tag.href"
          :removable="removable"
          :remove-label="removeLabel"
          :disabled="disabled || tag.disabled"
          :readonly="readonly || tag.readonly"
          @remove="onRemove(tag)"
        >
          <template v-if="$slots.tag" #default><slot name="tag" :tag="tag" /></template>
          <template v-if="$slots.leading" #leading><slot name="leading" :tag="tag" /></template>
        </Tag>
      </li>
    </ul>
    <!-- Focus can land here once the last tag has gone, and it never joins the tab order. -->
    <p v-else ref="empty" data-slot="empty" tabindex="-1">
      <slot name="empty">{{ emptyLabel }}</slot>
    </p>
  </div>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The group's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .tag-group {
    /* The space between tags. Rows sit at least this far apart too. */
    --tag-group--gap: 0.25rem;
    /* The height of the Tag at the group's size, which the space between rows depends on.
       Set it too if you change the tags' height. */
    --tag-group--item--height: 1.5rem;
    /* Rows sit far enough apart that the tags' hit areas, at least 24px tall, don't cover the
       tags on the next row. */
    --tag-group--row-gap: max(var(--tag-group--gap), 1.5rem - var(--tag-group--item--height));
    --tag-group--empty--color: color-mix(in srgb, var(--color--neutral-text) 75%, transparent);
    --tag-group--empty--font-size: 0.75rem;
  }

  /* The Tag's heights and font sizes, size for size. */
  .tag-group[data-size="xs"] {
    --tag-group--item--height: 1.125rem;
    --tag-group--empty--font-size: 0.6875rem;
  }
  .tag-group[data-size="sm"] {
    --tag-group--item--height: 1.25rem;
  }
  .tag-group[data-size="lg"] {
    --tag-group--item--height: 1.75rem;
    --tag-group--empty--font-size: 0.875rem;
  }
  .tag-group[data-size="xl"] {
    --tag-group--item--height: 2rem;
    --tag-group--empty--font-size: 0.875rem;
  }

  /* Tags wrap onto as many rows as they need, so the group never scrolls sideways. */
  .tag-group > [data-slot="list"] {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--tag-group--row-gap) var(--tag-group--gap);
    margin: 0;
    padding: 0;
    list-style: none;
    outline: none;
  }
  /* An item can shrink, so a long label ends in the Tag's ellipsis rather than overflowing. */
  .tag-group [data-slot="item"] {
    display: flex;
    min-width: 0;
    max-width: 100%;
    margin: 0;
    padding: 0;
  }

  /* As tall as a tag, so nothing below the group jumps when the last tag goes. */
  .tag-group > [data-slot="empty"] {
    display: flex;
    align-items: center;
    min-height: var(--tag-group--item--height);
    margin: 0;
    color: var(--tag-group--empty--color);
    font-size: var(--tag-group--empty--font-size);
    line-height: 1.25;
  }
  .tag-group > [data-slot="empty"]:focus-visible,
  .tag-group > [data-slot="list"]:focus-visible {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }

  /* On touch screens, the tags' hit areas reach at least 44px tall, so rows sit further apart. */
  @media (any-pointer: coarse) {
    .tag-group {
      --tag-group--row-gap: max(var(--tag-group--gap), 2.75rem - var(--tag-group--item--height));
    }
  }

  @media (forced-colors: active) {
    .tag-group > [data-slot="empty"] {
      color: CanvasText;
    }
    .tag-group > [data-slot="empty"]:focus-visible,
    .tag-group > [data-slot="list"]:focus-visible {
      outline-color: Highlight;
    }
  }
}
</style>
