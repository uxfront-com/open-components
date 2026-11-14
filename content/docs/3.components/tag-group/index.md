---
title: Tag Group
description: How to build a group of tags that screen readers name and count, that wraps without crowding touch targets, and that keeps keyboard users in place as tags are removed.
navigation:
  title: Overview
---

Tag groups hold the tags that belong together, like an issue's labels, a post's topics or the filters on a search, and lay them out in rows that people can scan, follow and clear one by one. The tags themselves are the easy part, since the [Tag](/docs/components/tag) settles how each one looks and works. What goes wrong is what happens between them. Think of a row of labels that a screen reader reads as loose words, with no sign of how many there are, a thumb that lands on the tag in the row below, or a remove button that takes focus with it when its tag goes, so keyboard users find themselves back at the top of the page.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/tag-group/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a tag group looks, from its list and its sizes to the space between rows, its states and the tokens that restyle it.
:::

:::card{to="/docs/components/tag-group/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a tag group behaves for every person, input and setting, from what screen readers hear to where focus goes when a tag is removed.
:::

:::card{to="/docs/components/tag-group/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Tag Group, with one typed API that takes a list of tags, fires one event and keeps no tags of its own.
:::

:::card{to="/docs/components/tag-group/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, build and check a tag group, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/tag-group#reference-implementation), which does its part of every rule in the [checklist](/docs/components/tag-group#checklist), so feel free to tab through them and remove a few tags as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Tag Group with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/tag-group/ax#deterministic).

A tag group is a named list of [Tags](/docs/components/tag), and it only owns what sits between them: the list that names and counts them, the space between them, where focus goes when one is removed, what screen readers hear about it and what shows once none are left. Each tag is the shipped Tag, unchanged, so its look, its link and its remove button work exactly as the Tag page says. Nobody selects a tag in a group. A filter that turns on and off is a [toggle button](/docs/components/button/ux#toggle-buttons), and picking from a set is a [Checkbox Group](/docs/components/checkbox-group).

::tag-group-playground
::

| Aspect   | Tag Group                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Element  | A `<div>` holding a `<ul>`, with an `<li>` and a Tag per tag, or a `<p>` with the empty state when there are none |
| Role     | `list`, with a `listitem` per tag. Each tag's link and remove button keep their own roles             |
| Name     | `label`, like "Labels", or a visible heading through `aria-labelledby`                                 |
| Keyboard | `Tab` to each link and remove button in turn, as on a lone Tag. No arrow keys                          |
| States   | Removable, disabled, read-only and empty, and every Tag's own                                          |
| Parts    | The list, an item per tag and the empty state                                                          |
| Pattern  | None in the APG. A list of links and buttons, rather than the APG's [grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) |
| WCAG 2.2 | 1.3.1, 1.4.3, 1.4.10, 2.1.1, 2.4.3, 2.5.8 and 4.1.3, among others                                      |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A tag group meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it. Its tags meet the [Tag's rules](/docs/components/tag#checklist) too, since each one is a Tag.

The scope says who meets a rule. **Component** rules are met by the Tag Group itself, so they're the ones to check when you build or review one. **Usage** rules are met by the screens that use it, like keeping a group short, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like the list's name: the Tag Group puts it on the list, as long as you give it one.

The basis says where a rule comes from. Eight of the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them. The rest are **Open Components** rules, which are our own, like keeping a group free of selection. Where a rule goes further than WCAG asks at level AA, its basis says so: `tag-group/row-gap` names level **AAA** for 44px on touch screens, and a rule that asks for more than its criterion says **beyond**, like naming the list, where WCAG would accept a list with no name.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/tag-group/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/tag-group/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/tag-group/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/tag-group/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves: the named list, the tab stops and where focus goes after a removal. It renders the [Tag](/docs/components/tag#reference-implementation)'s reference implementation and announces through the Button's `announce.ts`, so copy those too, from the Tag and the [Button](/docs/components/button#reference-implementation), along with the Button's `tokens.css`.

The tests are in `TagGroup.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [TagGroup.vue]
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

// A copy, since an app may change the same array in place, like with splice, and the
// labels of the tags that went are only in the copy.
let previousTags = [...tags];

// Runs before the list re-renders, while the removed tags are still in the DOM, to see
// where focus is. Once they've gone, focus moves to the next remove button, then to
// fallbackFocus, then to the previous remove button, and with no tags left, to the empty
// state, or to the list when the tags left can't be removed, so keyboard users never fall
// back to the top of the page.
watch(
  () => tags.map((tag) => tag.value),
  (next, previous) => {
    const labels = new Map(previousTags.map((tag) => [tag.value, tag.label]));
    previousTags = [...tags];
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
        // A candidate that can't take focus, like a disabled button, gives way to the next.
        const focused = (target: HTMLElement | null) => {
          target?.focus();
          return !!target && document.activeElement === target;
        };
        if (!focused(find(after)) && !focused(resolve(fallbackFocus)) && !focused(find(prior))) {
          if (list.value) focusList(list.value);
          else empty.value?.focus();
        }
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
```

```ts [TagGroup.test.ts]
import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, reactive, ref } from "vue";
import TagGroup, { type TagGroupItem, type TagGroupProps } from "./TagGroup.vue";

const LABELS: TagGroupItem[] = [
  { value: "bug", label: "Bug" },
  { value: "docs", label: "Docs" },
  { value: "feature", label: "Feature" },
];

const announcements = () => document.querySelector('[role="status"]')?.textContent ?? "";

// The live region is shared by the whole page, so it would outlive each test, along with what
// it announced. Each test starts without one, and the group or an announcement makes it again.
beforeEach(() => document.querySelector('[role="status"]')?.remove());

// A page that owns its tags: it drops a tag when the group fires remove, unless it keeps it,
// and renders a Reset button after the group, which some tests pass as fallbackFocus.
function renderOwned(
  props: Partial<TagGroupProps> & { keep?: string[]; withFallback?: boolean | "element"; disabledFallback?: boolean } = {},
) {
  const { keep = [], withFallback = false, disabledFallback = false, ...rest } = props;
  const tags = ref<TagGroupItem[]>(props.tags ?? LABELS.map((tag) => ({ ...tag })));
  const reset = ref<HTMLElement | null>(null);
  const onRemove = vi.fn((tag: TagGroupItem) => {
    if (!keep.includes(tag.value)) tags.value = tags.value.filter((other) => other.value !== tag.value);
  });
  const Page = defineComponent({
    setup: () => () => [
      h(TagGroup, {
        label: "Labels",
        removable: true,
        ...rest,
        tags: tags.value,
        fallbackFocus: withFallback === "element" ? reset.value : withFallback ? () => reset.value : undefined,
        onRemove,
      }),
      h("button", { ref: reset, type: "button", disabled: disabledFallback }, "Reset"),
    ],
  });
  return { ...render(Page), tags, onRemove };
}

describe("TagGroup", () => {
  it("is a list named by its label, with an item per tag, each holding a Tag", () => {
    render(TagGroup, { props: { tags: LABELS, label: "Labels" } });

    const list = screen.getByRole("list", { name: "Labels" });
    expect(list.tagName).toBe("UL");
    // Safari drops the role of a list without bullets, unless it's set.
    expect(list).toHaveAttribute("role", "list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items.map((item) => item.tagName)).toEqual(["LI", "LI", "LI"]);
    expect(items.map((item) => item.firstElementChild?.className)).toEqual(["tag", "tag", "tag"]);
    expect(items.map((item) => item.textContent)).toEqual(["Bug", "Docs", "Feature"]);
  });

  it("takes its name from a visible heading through aria-labelledby, and its description through aria-describedby", () => {
    const { container } = render({
      render: () => [
        h("h2", { id: "labels-heading" }, "Labels"),
        h("p", { id: "labels-hint" }, "Remove a label to stop tracking it."),
        h(TagGroup, { tags: LABELS, "aria-labelledby": "labels-heading", "aria-describedby": "labels-hint" }),
      ],
    });

    const list = screen.getByRole("list", { name: "Labels" });
    expect(list).toHaveAttribute("aria-labelledby", "labels-heading");
    expect(list).toHaveAccessibleDescription("Remove a label to stop tracking it.");
    expect(container.querySelector(".tag-group")).not.toHaveAttribute("aria-labelledby");
  });

  it("warns in development when the list has no name, and only then", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render({
      render: () => [
        h(TagGroup, { tags: LABELS, label: "Labels" }),
        h(TagGroup, { tags: LABELS, "aria-labelledby": "heading" }),
        h(TagGroup, { tags: LABELS, "aria-label": "Labels" }),
      ],
    });
    expect(warn).not.toHaveBeenCalled();

    render(TagGroup, { props: { tags: LABELS } });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("has no name"), expect.anything());
    warn.mockRestore();
  });

  it("puts each link and remove button in the tab order, and the arrow keys move nothing", async () => {
    const user = userEvent.setup();
    render(TagGroup, {
      props: {
        label: "Labels",
        removable: true,
        tags: [
          { value: "bug", label: "Bug", href: "/labels/bug" },
          { value: "docs", label: "Docs" },
        ],
      },
    });

    await user.tab();
    expect(screen.getByRole("link", { name: "Bug" })).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowDown}");
    expect(screen.getByRole("link", { name: "Bug" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Remove Bug" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Remove Docs" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}{ArrowUp}{Home}{End}");
    expect(screen.getByRole("button", { name: "Remove Docs" })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
    expect(screen.getByRole("list")).not.toHaveAttribute("tabindex");
  });

  describe("after a removal", () => {
    it("moves focus to the next tag's remove button", async () => {
      const user = userEvent.setup();
      renderOwned();

      await user.click(screen.getByRole("button", { name: "Remove Bug" }));
      expect(screen.queryByText("Bug")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Remove Docs" })).toHaveFocus();
    });

    it("skips a next tag that has no remove button, to the one after it", async () => {
      const user = userEvent.setup();
      renderOwned({
        tags: [
          { value: "bug", label: "Bug" },
          { value: "docs", label: "Docs", readonly: true },
          { value: "feature", label: "Feature" },
        ],
      });

      await user.click(screen.getByRole("button", { name: "Remove Bug" }));
      expect(screen.getByRole("button", { name: "Remove Feature" })).toHaveFocus();
    });

    it("moves focus to the next tag's remove button rather than to fallbackFocus", async () => {
      const user = userEvent.setup();
      renderOwned({ withFallback: true });

      await user.click(screen.getByRole("button", { name: "Remove Docs" }));
      expect(screen.getByRole("button", { name: "Remove Feature" })).toHaveFocus();
    });

    it("moves focus to fallbackFocus, given as an element, when no tag follows", async () => {
      const user = userEvent.setup();
      renderOwned({ withFallback: "element" });

      await user.click(screen.getByRole("button", { name: "Remove Feature" }));
      expect(screen.getByRole("button", { name: "Reset" })).toHaveFocus();
    });

    it("skips a fallbackFocus that can't take focus, like a disabled button, to the previous tag", async () => {
      const user = userEvent.setup();
      renderOwned({ withFallback: true, disabledFallback: true });

      await user.click(screen.getByRole("button", { name: "Remove Feature" }));
      expect(screen.getByRole("button", { name: "Remove Docs" })).toHaveFocus();
    });

    it("moves focus to fallbackFocus when no tag follows", async () => {
      const user = userEvent.setup();
      renderOwned({ withFallback: true });

      await user.click(screen.getByRole("button", { name: "Remove Feature" }));
      expect(screen.getByRole("button", { name: "Reset" })).toHaveFocus();
    });

    it("moves focus to the previous tag's remove button when no tag follows and there's no fallbackFocus", async () => {
      const user = userEvent.setup();
      renderOwned();

      await user.click(screen.getByRole("button", { name: "Remove Feature" }));
      expect(screen.getByRole("button", { name: "Remove Docs" })).toHaveFocus();
    });

    it("moves focus to the empty state once the last tag has gone", async () => {
      const user = userEvent.setup();
      renderOwned({ tags: [{ value: "bug", label: "Bug" }] });

      await user.click(screen.getByRole("button", { name: "Remove Bug" }));
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.getByText("No tags")).toHaveFocus();
    });

    it("moves focus to the list when the tags left have no remove button, until it leaves", async () => {
      const user = userEvent.setup();
      renderOwned({
        tags: [
          { value: "bug", label: "Bug", readonly: true },
          { value: "docs", label: "Docs" },
        ],
      });

      await user.click(screen.getByRole("button", { name: "Remove Docs" }));
      const list = screen.getByRole("list", { name: "Labels" });
      expect(list).toHaveFocus();
      expect(list).toHaveAttribute("tabindex", "-1");
      await user.tab();
      expect(list).not.toHaveAttribute("tabindex");
    });

    it("works with the keyboard as it does with a pointer", async () => {
      const user = userEvent.setup();
      renderOwned();

      await user.tab();
      expect(screen.getByRole("button", { name: "Remove Bug" })).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(screen.getByRole("button", { name: "Remove Docs" })).toHaveFocus();
      await user.keyboard(" ");
      expect(screen.getByRole("button", { name: "Remove Feature" })).toHaveFocus();
    });

    it("announces the tag that went through the shared live region, once it's gone", async () => {
      const user = userEvent.setup();
      renderOwned();

      expect(announcements()).toBe("");
      await user.click(screen.getByRole("button", { name: "Remove Docs" }));
      expect(announcements()).toBe("Docs removed");
    });

    it("announces a tag by its label when the app removes it from the same array, in place", async () => {
      const user = userEvent.setup();
      const tags = reactive<TagGroupItem[]>([
        { value: "u-1", label: "Alpha" },
        { value: "u-2", label: "Beta" },
      ]);
      render({
        render: () =>
          h(TagGroup, {
            label: "Labels",
            removable: true,
            tags,
            onRemove: (tag: TagGroupItem) => tags.splice(tags.findIndex((other) => other.value === tag.value), 1),
          }),
      });

      await user.click(screen.getByRole("button", { name: "Remove Alpha" }));
      expect(announcements()).toBe("Alpha removed");
      expect(screen.getByRole("button", { name: "Remove Beta" })).toHaveFocus();
    });

    it("prepares the live region as soon as it's removable, so the first announcement is heard", () => {
      render(TagGroup, { props: { label: "Labels", tags: LABELS, removable: true } });

      expect(document.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it("names the announcement with removedLabel, for other languages", async () => {
      const user = userEvent.setup();
      renderOwned({ removeLabel: (label) => `${label} entfernen`, removedLabel: (label) => `${label} entfernt` });

      await user.click(screen.getByRole("button", { name: "Feature entfernen" }));
      expect(announcements()).toBe("Feature entfernt");
    });

    it("moves focus even when the press didn't focus the button, like a click in Safari", async () => {
      renderOwned();

      screen.getByRole("button", { name: "Remove Bug" }).click();
      await nextTick();
      await nextTick();
      expect(screen.getByRole("button", { name: "Remove Docs" })).toHaveFocus();
    });
  });

  it("fires remove with the tag, and keeps a tag the app keeps, without moving focus or announcing it", async () => {
    const user = userEvent.setup();
    const { onRemove } = renderOwned({ keep: ["bug"] });
    const before = announcements();

    const remove = screen.getByRole("button", { name: "Remove Bug" });
    await user.click(remove);
    expect(onRemove).toHaveBeenCalledWith({ value: "bug", label: "Bug" });
    expect(screen.getByText("Bug")).toBeInTheDocument();
    expect(remove).toHaveFocus();
    expect(announcements()).toBe(before);
  });

  it("leaves focus where the app put it, like a dialog that asked first, and still announces the tag once it's gone", async () => {
    const user = userEvent.setup();
    const { tags } = renderOwned({ keep: ["bug"] });
    const reset = screen.getByRole("button", { name: "Reset" });

    await user.click(screen.getByRole("button", { name: "Remove Bug" }));
    expect(announcements()).toBe("");
    // The app asks first, somewhere else, then drops the tag.
    reset.focus();
    tags.value = tags.value.filter((tag) => tag.value !== "bug");
    await nextTick();
    await nextTick();
    expect(reset).toHaveFocus();
    expect(announcements()).toBe("Bug removed");
  });

  it("leaves focus where it is, and announces nothing, when the app takes a tag away for another reason", async () => {
    const user = userEvent.setup();
    const { tags } = renderOwned();
    const reset = screen.getByRole("button", { name: "Reset" });
    await user.click(reset);
    const before = announcements();

    tags.value = tags.value.slice(1);
    await nextTick();
    await nextTick();
    expect(reset).toHaveFocus();
    expect(announcements()).toBe(before);
  });

  it("leaves focus where it is when it's nowhere and the app takes away a tag nobody pressed", async () => {
    const { tags } = renderOwned();
    (document.activeElement as HTMLElement | null)?.blur();
    expect(document.body).toHaveFocus();

    tags.value = tags.value.slice(1);
    await nextTick();
    await nextTick();
    expect(document.body).toHaveFocus();
    expect(announcements()).toBe("");
  });

  it("shows its empty state with no tags, from emptyLabel or the empty slot, focusable but not a tab stop", async () => {
    const user = userEvent.setup();
    const { container } = render(TagGroup, { props: { tags: [], label: "Labels", emptyLabel: "No labels yet" } });

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    const empty = screen.getByText("No labels yet");
    expect(empty).toHaveAttribute("data-slot", "empty");
    expect(empty).toHaveAttribute("tabindex", "-1");
    await user.tab();
    expect(document.body).toHaveFocus();

    const slotted = render(TagGroup, { props: { tags: [], label: "Labels" }, slots: { empty: () => h("em", "Nothing here") } }).container;
    expect(slotted.querySelector("[data-slot='empty'] > em")).toHaveTextContent("Nothing here");
    expect(container.querySelector("[data-slot='empty']")).toHaveTextContent("No labels yet");
    expect(render(TagGroup, { props: { tags: [], label: "Labels" } }).getByText("No tags")).toBeInTheDocument();
  });

  it("passes size, disabled and readonly to every Tag, and each tag's href, disabled and readonly to its own", () => {
    const { container } = render(TagGroup, {
      props: {
        label: "Labels",
        size: "sm",
        removable: true,
        tags: [
          { value: "bug", label: "Bug", href: "/labels/bug" },
          { value: "docs", label: "Docs", disabled: true },
          { value: "feature", label: "Feature", readonly: true },
          { value: "triage", label: "Triage" },
        ],
      },
    });

    const tags = [...container.querySelectorAll("[data-slot='item'] > span")];
    expect(tags.map((tag) => tag.getAttribute("data-size"))).toEqual(["sm", "sm", "sm", "sm"]);
    expect(screen.getByRole("link", { name: "Bug" })).toHaveAttribute("href", "/labels/bug");
    expect(tags[1]).toHaveAttribute("data-disabled", "");
    expect(tags[2]).toHaveAttribute("data-readonly", "");
    expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toEqual(["Remove Bug", "Remove Triage"]);

    const all = render(TagGroup, { props: { label: "Others", tags: LABELS, removable: true, disabled: true } }).container;
    expect([...all.querySelectorAll("[data-slot='item'] > span")].every((tag) => tag.hasAttribute("data-disabled"))).toBe(true);
    const readonly = render(TagGroup, { props: { label: "More", tags: LABELS, removable: true, readonly: true } }).container;
    expect([...readonly.querySelectorAll("[data-slot='item'] > span")].every((tag) => tag.hasAttribute("data-readonly"))).toBe(true);
    expect(readonly.querySelector("button")).not.toBeInTheDocument();
  });

  it("has no selection and no grid: no aria-selected, aria-pressed, grid or row", () => {
    const { container } = render(TagGroup, {
      props: { label: "Labels", removable: true, tags: [{ value: "bug", label: "Bug", href: "/labels/bug" }, ...LABELS.slice(1)] },
    });

    expect(container.querySelector("[aria-selected], [aria-pressed], [role='grid'], [role='row'], [role='gridcell']")).toBeNull();
    expect(container.querySelector("[tabindex]")).toBeNull();
  });

  it("passes its tag and leading slots to each Tag, and keeps each remove button's name", () => {
    const { container } = render(TagGroup, {
      props: { label: "Labels", tags: LABELS.slice(0, 2), removable: true },
      slots: {
        tag: ({ tag }: { tag: TagGroupItem }) => h("strong", tag.label),
        leading: ({ tag }: { tag: TagGroupItem }) => h("svg", { "data-icon": tag.value }),
      },
    });

    expect([...container.querySelectorAll("[data-slot='label'] > strong")].map((label) => label.textContent)).toEqual(["Bug", "Docs"]);
    expect([...container.querySelectorAll("[data-slot='leading'] > svg")].map((icon) => icon.getAttribute("data-icon"))).toEqual(["bug", "docs"]);
    expect(screen.getByRole("button", { name: "Remove Docs" })).toBeInTheDocument();
  });

  it("renders the group itself as its root, so attributes, listeners and refs land on it, and names its list", async () => {
    const user = userEvent.setup();
    const onFocusin = vi.fn();
    const group = ref<{ $el: HTMLElement }>();
    const { container } = render({
      render: () =>
        h(TagGroup, { ref: group, id: "labels", class: "issue-labels", label: "Labels", tags: LABELS, removable: true, onFocusin }),
    });

    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("id", "labels");
    expect(root).toHaveClass("tag-group", "issue-labels");
    expect(root).not.toHaveAttribute("aria-label");
    expect(screen.getByRole("list")).toHaveAccessibleName("Labels");
    await user.tab();
    expect(onFocusin).toHaveBeenCalled();
    expect(group.value?.$el).toBe(root);
  });

  it("mirrors its size as a data attribute, and marks its parts with data-slot", () => {
    const { container, rerender } = render(TagGroup, { props: { label: "Labels", tags: LABELS, size: "lg" } });

    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root.firstElementChild).toHaveAttribute("data-slot", "list");
    expect([...root.querySelectorAll("[data-slot='item']")]).toHaveLength(3);
    return rerender({ tags: [] }).then(() => {
      expect(root.firstElementChild).toHaveAttribute("data-slot", "empty");
    });
  });

  it("renders the same markup every time, with no generated IDs", () => {
    const options = { props: { label: "Labels", tags: LABELS, removable: true } };
    const first = render(TagGroup, options).container.innerHTML;
    const { container } = render(TagGroup, options);
    expect(container.innerHTML).toBe(first);
    expect(container.innerHTML).not.toMatch(/\bid=/);
  });
});
```
:::
::

## Sources

- [HTML Standard: the ul element](https://html.spec.whatwg.org/multipage/grouping-content.html#the-ul-element) and [the li element](https://html.spec.whatwg.org/multipage/grouping-content.html#the-li-element), for a group of tags marked up as a list
- [WAI-ARIA 1.2: list](https://www.w3.org/TR/wai-aria-1.2/#list) and [aria-labelledby](https://www.w3.org/TR/wai-aria-1.2/#aria-labelledby), for a named list and its count
- [WAI-ARIA Authoring Practices Guide: Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/), for layout grids that group interactive elements behind one tab stop, which we chose not to use
- [Scott O'Hara: "Fixing" Lists](https://www.scottohara.me/blog/2019/01/12/lists-and-safari.html), for Safari dropping a list's role when its bullets are removed, and `role="list"` to keep it
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 1.3.1: Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html), for tags that belong together marked up as a list
- [Understanding SC 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), for tags that wrap rather than scroll sideways
- [Understanding SC 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) and [SC 2.5.5: Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), for rows far enough apart that the tags' hit areas never cover each other
- [Understanding SC 2.1.1: Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) and [SC 2.4.3: Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), for reaching every tag and keeping focus in place when one is removed
- [Understanding SC 4.1.3: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), for announcing a removal through a live region
- [Understanding SC 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), for the empty state's text, and [SC 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), for the focus ring on it and on the list
- [Understanding SC 2.4.7: Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), for the focus ring on the empty state and the list after a removal
- [Understanding SC 1.4.4: Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) and [SC 1.4.12: Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), for rows that grow with the text and wrap rather than overflow
- [Understanding SC 2.3.3: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), for a removal animation that only runs for people who haven't asked for less motion
- [Understanding SC 4.1.2: Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html), for a list and its tags that agents and assistive technologies find by role and name
- [React Aria: TagGroup](https://react-aria.adobe.com/TagGroup), for a tag group's name, its selection, its removal and its empty state, and [its source](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/tag/useTagGroup.ts), for the `grid` role it renders, with `Backspace` and `Delete` to remove a tag
- [Atlassian Design System: Tag group](https://atlassian.design/components/tag-group/examples), for tags that wrap onto the next line, focus that goes to the next tag after a removal, and [its usage](https://atlassian.design/components/tag-group/usage), for not mixing removable tags with ones that aren't
