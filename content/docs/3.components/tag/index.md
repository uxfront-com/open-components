---
title: Tag
description: How to build a tag that labels what something is about, that people can remove or follow as a link, with a keyboard and a screen reader, and that agents can check.
navigation:
  title: Overview
---

Tags label what something is about, like the topics of a post, the labels on an issue or the filters on a search, so people can scan a page of them and see what goes together. They look like a word in a box, which is why the parts people act on are so often an afterthought. Think of a remove button that a screen reader calls "button, ×", a tag that's a `<div>` with a click handler, which keyboard users can't reach, or a close icon so small that a thumb removes the tag next to it.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/tag/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a tag looks, from its parts and its sizes to its icon, its states and the tokens that restyle each part.
:::

:::card{to="/docs/components/tag/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a tag behaves for every person, input and setting, from what screen readers hear to removing it, following it and every state in between.
:::

:::card{to="/docs/components/tag/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Tag, with one typed API that takes links and routers, fires one event and keeps no state of its own.
:::

:::card{to="/docs/components/tag/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, build and check a tag, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/tag#reference-implementation), which does its part of every rule in the [checklist](/docs/components/tag#checklist), so feel free to tab through them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Tag with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/tag/ax#deterministic).

A tag says what something is about, like a topic, a category or a value someone picked, and people can remove it or follow it to a page about it. That's where it ends and the Badge, on our [Roadmap](/docs/getting-started/roadmap), begins: a badge marks a status or a count, like "New" or "3", and nobody acts on it. A tag looks like the [Select](/docs/components/select)'s tags, size for size, and its remove button and its link work like the [Button](/docs/components/button)'s.

::tag-playground
::

| Aspect   | Tag                                                                                                   |
| -------- | ----------------------------------------------------------------------------------------------------- |
| Element  | `<span>`, with an `<a href>` in its label when it's a link and a `<button>` after it when it's removable |
| Role     | None of its own. Its link is a `link`, and its remove button a `button`                               |
| Name     | Its text. The remove button is named after it, like "Remove Bug"                                      |
| Keyboard | `Tab` to its link, then to its remove button, `Enter` to follow its link, and `Enter` or `Space` to press its remove button |
| States   | Hover and focus on its link and its remove button, disabled and read-only                             |
| Parts    | A leading icon, the label and a remove button, of which only the label is always there                 |
| Pattern  | None in the APG, since a link and a button cover it                                                   |
| WCAG 2.2 | 1.1.1, 1.4.1, 1.4.3, 1.4.4, 1.4.11, 2.1.1, 2.4.6, 2.4.7, 2.5.8 and 4.1.2, among others                |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A tag meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Tag itself, so they're the ones to check when you build or review one. **Usage** rules are met by the screens that use it, like keeping labels short, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like the remove button's name: the Tag builds it from the label, as long as you give it one.

The basis says where a rule comes from. Seven of the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and a few come from **HTML** and **WAI-ARIA**. The rest are **Open Components** rules, which are our own, like keeping a status out of a tag. Where a rule goes further than WCAG asks at level AA, its basis says so: `tag/target-size` names level **AAA** for 44px on touch screens, and a rule that asks for more than its criterion says **beyond**, like a link tag that looks different from a plain one, where WCAG would let colour alone tell them apart.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/tag/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/tag/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/tag/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/tag/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves. It reads the same theme tokens as the Button, so copy [`tokens.css`](/docs/components/button#reference-implementation) from the Button's reference implementation into your theme too.

The tests are in `Tag.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [Tag.vue]
<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";

export interface TagProps {
  /** The text, when it's plain text. The default slot takes precedence, but the remove button's name is built from this, so give it whenever the tag is removable. */
  label?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Makes the label a link (`<a href>`), to a page about what the tag names. */
  href?: string;
  /** Adds a remove button after the label, which fires `remove`. The tag doesn't remove itself. */
  removable?: boolean;
  /** The remove button's name, which screen readers read and voice control users say. */
  removeLabel?: (label: string) => string;
  /** Dims the tag, drops its remove button and turns its link off. */
  disabled?: boolean;
  /** Drops the remove button and keeps the tag's look, so people can read it but not remove it. A link still works. */
  readonly?: boolean;
}

const {
  label,
  size = "md",
  href,
  removable = false,
  removeLabel = (label: string) => `Remove ${label}`,
  disabled = false,
  readonly = false,
} = defineProps<TagProps>();

const emit = defineEmits<{
  /** Fires when the remove button is pressed. Never while disabled or read-only, which have no remove button. */
  remove: [event: MouseEvent];
}>();

defineSlots<{
  /** The label, when it's more than plain text, or your router's link, which the tag styles like its own. */
  default?: () => unknown;
  /** An icon before the label, hidden from assistive technologies. */
  leading?: () => unknown;
  /** The remove button's icon. The button and its name stay. */
  remove?: () => unknown;
}>();

const root = useTemplateRef<HTMLElement>("root");

onMounted(() => {
  if (import.meta.env.DEV && removable && !label) {
    console.warn("[Tag] is removable without a label, so its remove button can't say what it removes: give it a label.", root.value);
  }
});
</script>

<template>
  <!-- A plain <span>, with no role, so a screen reader reads the tag as text. Only its link
       and its remove button are interactive, and they're siblings, never one inside the other. -->
  <span
    ref="root"
    class="tag"
    :data-size="size"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <span v-if="$slots.leading" data-slot="leading" aria-hidden="true">
      <slot name="leading" />
    </span>
    <span data-slot="label">
      <!-- A disabled link loses its href, so it can't be followed, and keeps its role. -->
      <a
        v-if="href"
        :href="disabled ? undefined : href"
        :role="disabled ? 'link' : undefined"
        :aria-disabled="disabled || undefined"
      >
        <slot>{{ label }}</slot>
      </a>
      <slot v-else>{{ label }}</slot>
    </span>
    <button
      v-if="removable && !disabled && !readonly"
      data-slot="remove"
      type="button"
      :aria-label="removeLabel(label ?? '')"
      @click="emit('remove', $event)"
    >
      <slot name="remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </slot>
    </button>
  </span>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The tag's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .tag {
    /* The same sizes as the Select's tags. The text colour is set here, since a tag on its
       own isn't inside a field to inherit it from. */
    --tag--height: 1.5rem;
    --tag--padding: 0.5rem;
    --tag--gap: 0.25rem;
    --tag--radius: 0.25rem;
    --tag--font-size: 0.75rem;
    --tag--background: color-mix(in srgb, currentColor 10%, transparent);
    --tag--color: var(--color--neutral-text);
    --tag--border-color: transparent;
    --tag--icon--size: 1em;
    /* A link tag has a border, at 3:1 against the page like the Input's, so it looks different
       from a plain one without relying on colour. */
    --tag--link--border-color: color-mix(in srgb, currentColor 55%, transparent);
    --tag--hover--background: color-mix(in srgb, currentColor 16%, transparent);

    /* The containing block of the link's hit area and focus ring. */
    position: relative;
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    max-width: 100%;
    /* A min-height in rem rather than a height, so the tag grows with larger text. */
    min-height: var(--tag--height);
    padding-inline: var(--tag--padding);
    /* Drawn inside, so a link tag is the same size as a plain one, and as the Select's tags. */
    box-shadow: inset 0 0 0 1px var(--tag--border-color);
    border-radius: var(--tag--radius);
    background-color: var(--tag--background);
    color: var(--tag--color);
    font-family: inherit;
    font-size: var(--tag--font-size);
    line-height: 1.25;
    vertical-align: middle;
  }
  /* The remove button runs to the end edge, so it takes the end padding's place. */
  .tag:has(> [data-slot="remove"]) {
    padding-inline-end: 0;
  }

  /* Sizes */
  .tag[data-size="xs"] {
    --tag--height: 1.125rem;
    --tag--padding: 0.25rem;
    --tag--font-size: 0.6875rem;
  }
  .tag[data-size="sm"] {
    --tag--height: 1.25rem;
  }
  .tag[data-size="lg"] {
    --tag--height: 1.75rem;
    --tag--font-size: 0.875rem;
  }
  .tag[data-size="xl"] {
    --tag--height: 2rem;
    --tag--font-size: 0.875rem;
  }

  /* Parts */
  .tag > [data-slot="leading"] {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    margin-inline-end: var(--tag--gap);
  }
  .tag > [data-slot="leading"] > :slotted(svg) {
    width: var(--tag--icon--size);
    height: var(--tag--icon--size);
  }
  /* A long label stays on one line and ends in an ellipsis, while its full text stays in the DOM. */
  .tag > [data-slot="label"] {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* A link in the label, the Tag's own or one in the default slot, like a router's. Its
     ::before is its hit area, at least 24 × 24px, and its ::after the focus ring, both
     over the whole tag. The remove button sits above them, so it does what it says. */
  .tag:has(> [data-slot="label"] a) {
    --tag--border-color: var(--tag--link--border-color);
  }
  .tag > [data-slot="label"] :deep(a) {
    color: inherit;
    text-decoration: none;
    outline: none;
  }
  .tag > [data-slot="label"] :deep(a)::before,
  .tag > [data-slot="label"] :deep(a)::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--tag--radius);
  }
  .tag > [data-slot="label"] :deep(a)::before {
    inset-block: min(0px, (var(--tag--height) - 1.5rem) / 2);
    min-width: 1.5rem;
  }
  .tag > [data-slot="label"] :deep(a[href]) {
    cursor: pointer;
  }

  .tag > [data-slot="remove"] {
    position: relative;
    z-index: 1;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: var(--tag--height);
    height: var(--tag--height);
    margin: 0;
    padding: 0;
    /* Transparent, so a link tag's border shows through it, even behind its hover background. */
    border: 1px solid transparent;
    border-radius: inherit;
    background: transparent;
    background-clip: padding-box;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .tag > [data-slot="remove"] > :slotted(svg),
  .tag > [data-slot="remove"] > svg {
    width: 0.75em;
    height: 0.75em;
  }
  /* At least 24 × 24px to press, whatever the tag's size. Less 1px, since it's placed
     inside the button's transparent border. */
  .tag > [data-slot="remove"]::before {
    content: "";
    position: absolute;
    inset: calc(min(0px, (var(--tag--height) - 1.5rem) / 2) - 1px);
  }

  /* States. Focus shows on the link, around the whole tag, and on the remove button,
     inside it, so neither moves anything. */
  .tag > [data-slot="label"] :deep(a:focus-visible)::after {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  .tag > [data-slot="remove"]:focus-visible {
    outline: 2px solid var(--color--focus);
    outline-offset: -2px;
  }
  @media (hover: hover) {
    .tag:has(> [data-slot="label"] a[href]:hover) {
      --tag--background: var(--tag--hover--background);
    }
    .tag > [data-slot="label"] :deep(a[href]:hover) {
      text-decoration-line: underline;
      text-underline-offset: 0.2em;
    }
    .tag > [data-slot="remove"]:hover {
      background-color: var(--tag--hover--background);
    }
  }
  .tag[data-disabled] {
    opacity: 0.5;
  }
  .tag[data-disabled] > [data-slot="label"] :deep(a) {
    cursor: not-allowed;
  }

  /* On touch screens, the remove button and a link reach at least 44px tall. */
  @media (any-pointer: coarse) {
    .tag > [data-slot="label"] :deep(a)::before {
      inset-block: min(0px, (var(--tag--height) - 2.75rem) / 2);
    }
    .tag > [data-slot="remove"]::before {
      inset-block: calc(min(0px, (var(--tag--height) - 2.75rem) / 2) - 1px);
    }
  }

  /* With more contrast, a link's border is drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .tag {
      --tag--link--border-color: currentColor;
    }
  }

  /* Forced colors mode drops backgrounds and shadows, so every tag gets a real border in a
     system colour, as the Select's tags do, focus is drawn in Highlight and a disabled tag
     in GrayText. */
  @media (forced-colors: active) {
    .tag {
      border: 1px solid CanvasText;
    }
    /* Its transparent border would show, over the tag's own. Its hit area only grows. */
    .tag > [data-slot="remove"] {
      border: 0;
    }
    .tag:has(> [data-slot="label"] a[href]) {
      border-color: LinkText;
    }
    .tag > [data-slot="label"] :deep(a:focus-visible)::after,
    .tag > [data-slot="remove"]:focus-visible {
      outline-color: Highlight;
    }
    .tag[data-disabled] {
      border-color: GrayText;
      color: GrayText;
      opacity: 1;
    }
  }
}
</style>
```

```ts [Tag.test.ts]
import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, ref } from "vue";
import Tag from "./Tag.vue";

const icon = () => h("svg", { viewBox: "0 0 24 24" }, [h("circle", { cx: 12, cy: 12, r: 4 })]);

describe("Tag", () => {
  it("is plain text, with no role and no place in the tab order", async () => {
    const user = userEvent.setup();
    const { container } = render(Tag, { props: { label: "Bug" } });

    const tag = container.firstElementChild!;
    expect(tag.tagName).toBe("SPAN");
    expect(tag).not.toHaveAttribute("role");
    expect(tag).not.toHaveAttribute("tabindex");
    expect(tag).toHaveTextContent(/^Bug$/);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("makes its label a link with href, found by its text", () => {
    const { container } = render(Tag, { props: { label: "Bug", href: "/labels/bug" } });

    const link = screen.getByRole("link", { name: "Bug" });
    expect(link).toHaveAttribute("href", "/labels/bug");
    expect(link).not.toHaveAttribute("aria-disabled");
    expect(container.querySelector("[data-slot='label']")).toContainElement(link);
  });

  it("puts what its default slot holds inside its own link", () => {
    render(Tag, { props: { label: "Bug", href: "/labels/bug" }, slots: { default: () => h("strong", "Bug") } });

    expect(screen.getByRole("link", { name: "Bug" }).querySelector("strong")).toHaveTextContent("Bug");
  });

  it("takes a link in its default slot, like a router's, which keeps its own attributes", () => {
    const { container } = render(Tag, {
      props: { label: "Bug", removable: true },
      slots: { default: () => h("a", { href: "/labels/bug", target: "_blank", rel: "noopener" }, "Bug") },
    });

    const link = screen.getByRole("link", { name: "Bug" });
    expect(container.querySelector("[data-slot='label']")).toContainElement(link);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    // The remove button stays the link's sibling.
    expect(link).not.toContainElement(screen.getByRole("button", { name: "Remove Bug" }));
  });

  it("has a native remove button, named after the tag, that Enter, Space and a click press", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(Tag, { props: { label: "Bug", removable: true, onRemove } });

    const remove = screen.getByRole("button", { name: "Remove Bug" });
    expect(remove.tagName).toBe("BUTTON");
    expect(remove).toHaveAttribute("type", "button");
    await user.tab();
    expect(remove).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    await user.click(remove);
    expect(onRemove).toHaveBeenCalledTimes(3);
    expect(onRemove.mock.calls[0]![0]).toBeInstanceOf(MouseEvent);
  });

  it("names its remove button with removeLabel, for other languages", () => {
    render(Tag, { props: { label: "Bug", removable: true, removeLabel: (label: string) => `${label} entfernen` } });

    expect(screen.getByRole("button", { name: "Bug entfernen" })).toBeInTheDocument();
  });

  it("keeps the link and the remove button apart, and reaches each with Tab", async () => {
    const user = userEvent.setup();
    render(Tag, { props: { label: "Bug", href: "/labels/bug", removable: true } });

    const link = screen.getByRole("link", { name: "Bug" });
    const remove = screen.getByRole("button", { name: "Remove Bug" });
    expect(link).not.toContainElement(remove);
    expect(remove).not.toContainElement(link);
    await user.tab();
    expect(link).toHaveFocus();
    await user.tab();
    expect(remove).toHaveFocus();
  });

  it("drops its remove button and turns its link off while disabled", async () => {
    const user = userEvent.setup();
    const { container } = render(Tag, { props: { label: "Bug", href: "/labels/bug", removable: true, disabled: true } });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Bug" });
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(container.firstElementChild).toHaveAttribute("data-disabled", "");
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("drops its remove button while read-only, and keeps its link", () => {
    const { container } = render(Tag, { props: { label: "Bug", href: "/labels/bug", removable: true, readonly: true } });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Bug" });
    expect(link).toHaveAttribute("href", "/labels/bug");
    expect(link).not.toHaveAttribute("aria-disabled");
    expect(container.firstElementChild).toHaveAttribute("data-readonly", "");
  });

  it("fires remove and stays, so its parent decides whether it goes", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const { container } = render(Tag, { props: { label: "Bug", removable: true, onRemove } });

    await user.click(screen.getByRole("button", { name: "Remove Bug" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(container).toHaveTextContent("Bug");
    expect(screen.getByRole("button", { name: "Remove Bug" })).toBeInTheDocument();
  });

  it("hides its icons from assistive technologies, so the text alone names it", () => {
    const { container } = render(Tag, {
      props: { label: "Bug", href: "/labels/bug", removable: true },
      slots: { leading: icon },
    });

    expect(container.querySelector("[data-slot='leading']")).toHaveAttribute("aria-hidden", "true");
    expect(within(screen.getByRole("button", { name: "Remove Bug" })).getByText((_, element) => element?.tagName === "svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getByRole("link")).toHaveAccessibleName("Bug");
  });

  it("keeps the whole of a long label in the DOM, which CSS cuts off on screen", () => {
    const label = "Needs a decision from the design systems team before the next release";
    const { container } = render(Tag, { props: { label } });

    expect(container.querySelector("[data-slot='label']")).toHaveTextContent(label);
  });

  it("takes the Input's five sizes, md by default", () => {
    const { container } = render({
      render: () => (["xs", "sm", undefined, "lg", "xl"] as const).map((size) => h(Tag, { label: "Bug", size })),
    });

    const sizes = [...container.querySelectorAll(".tag")].map((tag) => tag.getAttribute("data-size"));
    expect(sizes).toEqual(["xs", "sm", "md", "lg", "xl"]);
  });

  it("renders the tag itself, so attributes, listeners and refs land on it", async () => {
    const user = userEvent.setup();
    const onFocusin = vi.fn();
    const tag = ref<{ $el: HTMLElement }>();
    const { container } = render({
      render: () => h(Tag, { ref: tag, id: "bug", class: "label-bug", lang: "en", label: "Bug", href: "/labels/bug", onFocusin }),
    });

    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("id", "bug");
    expect(root).toHaveClass("tag", "label-bug");
    expect(root).toHaveAttribute("lang", "en");
    await user.tab();
    expect(onFocusin).toHaveBeenCalled();
    expect(tag.value?.$el).toBe(root);
  });

  it("takes its label, its icon and its remove button's icon through slots, and keeps the button's name", () => {
    const { container } = render(Tag, {
      props: { label: "Bug", removable: true },
      slots: { default: () => h("strong", "Bug"), leading: icon, remove: () => h("span", "×") },
    });

    expect(container.querySelector("[data-slot='label'] > strong")).toHaveTextContent("Bug");
    expect(container.querySelector("[data-slot='leading'] > svg")).toBeInTheDocument();
    const remove = screen.getByRole("button", { name: "Remove Bug" });
    expect(remove).toHaveTextContent("×");
  });

  it("mirrors its props as data attributes, and marks its parts with data-slot", () => {
    const { container } = render(Tag, {
      props: { label: "Bug", size: "lg", removable: true, readonly: false },
      slots: { leading: icon },
    });

    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).not.toHaveAttribute("data-disabled");
    expect(root).not.toHaveAttribute("data-readonly");
    const parts = [...container.querySelectorAll("[data-slot]")].map((part) => part.getAttribute("data-slot"));
    expect(parts).toEqual(["leading", "label", "remove"]);
  });

  it("renders the same markup every time, and only adds the link and the remove button when asked", async () => {
    const options = { props: { label: "Bug", href: "/labels/bug", removable: true }, slots: { leading: icon } };
    const first = render(Tag, options).container.innerHTML;
    const { container, rerender } = render(Tag, options);
    expect(container.innerHTML).toBe(first);
    expect(container.innerHTML).not.toMatch(/\bid=/);

    // Read-only takes the remove button away, and every other state changes attributes.
    const label = container.querySelector("[data-slot='label']");
    await rerender({ label: "Bug", href: "/labels/bug", removable: true, readonly: true, size: "sm" });
    expect(container.querySelector("[data-slot='label']")).toBe(label);
    expect(container.querySelector("[data-slot='remove']")).not.toBeInTheDocument();

    const plain = render(Tag, { props: { label: "Bug" } }).container;
    expect([...plain.querySelectorAll("[data-slot]")].map((part) => part.getAttribute("data-slot"))).toEqual(["label"]);
    expect(plain.querySelector("a")).not.toBeInTheDocument();
  });

  it("warns in development when it's removable without a label, and only then", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render({
      render: () => [
        h(Tag, { label: "Bug", removable: true }),
        h(Tag, { href: "/labels/bug" }, { default: () => "Bug" }),
      ],
    });
    expect(warn).not.toHaveBeenCalled();

    render(Tag, { props: { removable: true }, slots: { default: () => "Bug" } });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("removable without a label"), expect.anything());
    warn.mockRestore();
  });
});
```
:::
::

## Sources

- [HTML Standard: interactive content](https://html.spec.whatwg.org/multipage/dom.html#interactive-content), [the a element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element) and [the button element](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element), for a link and a remove button that sit side by side, never one inside the other
- [WAI-ARIA 1.2: generic](https://www.w3.org/TR/wai-aria-1.2/#generic) and [aria-disabled](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled), for a tag with no role of its own and a link that's turned off
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), for 24 × 24px targets, and [SC 2.5.5: Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), for 44px on touch screens
- [Understanding SC 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [SC 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), for the label and the focus ring
- [Understanding SC 1.4.1: Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), for a link tag that differs from a plain one by more than its colour
- [Understanding SC 1.4.4: Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), for a tag that grows with its text
- [Understanding SC 1.1.1: Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html), for icons hidden from assistive technologies
- [Understanding SC 2.1.1: Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), [SC 2.4.3: Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) and [SC 2.4.7: Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), for reaching and seeing the link and the remove button
- [Understanding SC 2.4.6: Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html), [SC 2.5.3: Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html) and [SC 4.1.2: Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html), for a remove button named after its tag
- [Carbon Design System: Tag usage](https://carbondesignsystem.com/components/tag/usage/), for tags that label, categorise and filter, its read-only, dismissible, selectable and operational tags, and its advice against tags as links to other pages
- [Carbon Design System: Tag accessibility](https://carbondesignsystem.com/components/tag/accessibility/), for read-only tags that aren't in the tab order, a close icon that's the only part to press, and `Enter` or `Space` to dismiss
- [Atlassian Design System: Tag](https://atlassian.design/components/tag/usage), for a compact label that categorises content, a lozenge for status instead, removable tags, links and short labels that truncate
- [GOV.UK Design System: Tag](https://design-system.service.gov.uk/components/tag/), for a tag that shows a status and is never interactive, which is our Badge
- [Fluent 2: Tag](https://fluent2.microsoft.design/components/web/react/core/tag/usage), for optionally dismissible tags
