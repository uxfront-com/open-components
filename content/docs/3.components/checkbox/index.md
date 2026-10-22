---
title: Checkbox
description: How to build a checkbox that people can check with a click on its label, that says what it means and when it's mixed, that forms send the way they expect, and that agents can check.
navigation:
  title: Overview
---

Checkboxes let people say yes or no to one thing, like agreeing to the terms, or asking for a newsletter. The browser has had one built in for as long as there have been forms, but its box is hard to style, so many teams rebuild it, and that's where it goes wrong. Think of a box so small you keep missing it, a label that does nothing when you click it, or a "Select all" that screen readers announce as unchecked when half its options are checked.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/checkbox/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a checkbox looks, from its parts and sizes to its states and tokens.
:::

:::card{to="/docs/components/checkbox/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a checkbox behaves for every person, input and setting, so it's accessible, predictable, clear in every state and adaptive.
:::

:::card{to="/docs/components/checkbox/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Checkbox, with one consistent, typed API that works with your forms however you build them.
:::

:::card{to="/docs/components/checkbox/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, build and check a checkbox, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/checkbox#reference-implementation), which does its part of every rule in the [checklist](/docs/components/checkbox#checklist), so feel free to check and uncheck them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Checkbox with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/checkbox/ax#deterministic).

The Checkbox is one box with its label. Its hint and error message are elements of their own, which you link to it by ID, like the [Input](/docs/components/input)'s. A list of options that people check any number of is a group, with a `<fieldset>` and a `<legend>`, which the [Checkbox Group](/docs/components/checkbox-group) builds out of Checkboxes.

::checkbox-playground
::

| Aspect   | Checkbox                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------- |
| Element  | `<input type="checkbox">`, inside the `<label>` that names it                                  |
| Role     | `checkbox`                                                                                     |
| Name     | The text inside its `<label>`, or an `aria-label` when there's no text to show                 |
| Keyboard | `Tab` to reach it and `Space` to check or uncheck it, while `Enter` never toggles it           |
| States   | Hover, focus, checked, indeterminate, disabled, read-only and invalid                          |
| Sizes    | `xs`, `sm`, `md`, `lg` and `xl`, with the box scaled to the text                               |
| Pattern  | [WAI-ARIA APG Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), which a native [`<input type="checkbox">`](https://html.spec.whatwg.org/multipage/input.html#checkbox-state-%28type%3Dcheckbox%29) covers |
| WCAG 2.2 | 1.3.1, 1.4.3, 1.4.11, 2.1.1, 2.4.7, 2.5.8, 3.3.1, 3.3.2 and 4.1.2, among others                |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A checkbox meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Checkbox itself, so they're the ones to check when you build or review one. **Usage** rules are met by the forms that use it, like writing a label that says what checking the box means, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like an invalid checkbox: the Checkbox looks invalid from `aria-invalid`, as long as you set it when the error message shows.

The basis says where a rule comes from. About half the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and a few come from **HTML**, **WAI-ARIA** or the **APG**. The rest are **Open Components** rules, which are our own, like keeping a checkbox's label positive. Where a rule goes further than WCAG asks at level AA, its basis says so: a rule that asks for more than its criterion says **beyond**, like the 24 × 24px hit area around every box, where WCAG would also accept a smaller box with enough space around it.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/checkbox/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/checkbox/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/checkbox/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/checkbox/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves. It reads the same theme tokens as the Button, so copy [`tokens.css`](/docs/components/button#reference-implementation) from the Button's reference implementation into your theme too.

The tests are in `Checkbox.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [Checkbox.vue]
<script setup lang="ts">
import { nextTick, onMounted, useAttrs, useTemplateRef, watchEffect } from "vue";

export interface CheckboxProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  /** Shows a state people can focus and send with the form, but not change. HTML ignores `readonly` on a checkbox, so it's `aria-readonly`, and a click is cancelled. */
  readonly?: boolean;
}

// Attributes go on the <input> rather than on the root, so they're declared below.
defineOptions({ inheritAttrs: false });

const { size = "md", disabled = false, readonly = false } = defineProps<CheckboxProps>();

/** Whether it's checked, which `v-model:checked` binds. Without it, the checkbox keeps its own, and starts from `checked`. */
const checked = defineModel<boolean>("checked", { default: false });
/**
 * Neither checked nor unchecked, like a select-all box when only some of its options
 * are. The browser clears it as soon as people click, which `v-model:indeterminate`
 * hears about.
 */
const indeterminate = defineModel<boolean>("indeterminate", { default: false });

defineSlots<{
  /** The label, which the <label> wraps along with the box, so it names the checkbox. */
  default?: () => unknown;
}>();

const attrs = useAttrs();
// Classes and styles go on the root, the <label>, so a class can set its variables.
// Everything else goes on the <input>: `id`, `name`, `value`, `required`, ARIA and
// listeners. Attrs aren't reactive, so these run on every render.
const onRoot = (key: string) => key === "class" || key === "style";
const rootAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => onRoot(key)));
const controlAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => !onRoot(key)));

const input = useTemplateRef<HTMLInputElement>("input");

// A cancelled click puts back the checked and indeterminate states, and fires no
// change, whether it came from the box, its label or Space.
function onClick(event: MouseEvent) {
  if (readonly) event.preventDefault();
}

// Bound before your own listeners, so a `change` listener of yours already sees the new state.
async function onChange(event: Event) {
  const box = event.target as HTMLInputElement;
  checked.value = box.checked;
  indeterminate.value = false;
  // A bound state that didn't take the change, like an option people can't uncheck,
  // wins once it has rendered, so the box always shows the state you hold.
  await nextTick();
  box.checked = checked.value;
  box.indeterminate = indeterminate.value;
}

// HTML has no attribute for indeterminate, so it's set on the <input> as a property,
// once it has rendered, which also keeps it out of the server's markup.
watchEffect(
  () => {
    if (input.value) input.value.indeterminate = indeterminate.value;
  },
  { flush: "post" },
);

// A ref to the Checkbox gets you the <input>, through `input`.
defineExpose({ input });

onMounted(() => {
  if (import.meta.env.DEV) {
    const el = input.value;
    const named =
      [...(el?.labels ?? [])].some((label) => label.textContent?.trim()) ||
      el?.hasAttribute("aria-label") ||
      el?.hasAttribute("aria-labelledby");
    if (el && !named) {
      console.warn("[Checkbox] has no accessible name: give it a label, or an aria-label when it has none.", el);
    }
  }
});
</script>

<template>
  <label class="checkbox" v-bind="rootAttrs()" :data-size="size">
    <input
      ref="input"
      data-slot="box"
      type="checkbox"
      :disabled="disabled"
      :aria-readonly="readonly ? 'true' : undefined"
      @click="onClick"
      @change="onChange"
      v-bind="controlAttrs()"
      :checked="checked"
    />
    <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">
      <path data-mark="check" d="M3.5 8.5 6.5 11.5 12.5 4.5" />
      <path data-mark="dash" d="M4 8h8" />
    </svg>
    <span v-if="$slots.default" data-slot="label"><slot /></span>
  </label>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The checkbox's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .checkbox {
    /* Set per size. The box grows with the text. */
    --checkbox--box--size: 1.125rem;
    --checkbox--box--radius: 0.25rem;
    /* The text colour at 55%, which has 3:1 against the page, so people can see the box. */
    --checkbox--box--border-color: color-mix(in srgb, currentColor 55%, transparent);
    --checkbox--box--fill: var(--color--primary);
    --checkbox--indicator--color: var(--color--primary-contrast);
    --checkbox--gap: 0.5rem;
    --checkbox--font-size: 0.875rem;
    /* The hit area around the box, whatever its size (WCAG 2.5.8). */
    --checkbox--hit-area--size: 1.5rem;

    position: relative;
    display: inline-grid;
    /* The box and its check share the first column, and the label takes a second. */
    grid-template-columns: var(--checkbox--box--size);
    column-gap: var(--checkbox--gap);
    align-items: start;
    color: var(--color--neutral-text);
    font-size: var(--checkbox--font-size);
    line-height: 1.25;
    cursor: pointer;
  }

  /* A press anywhere in the hit area toggles the box, since it's part of the <label>.
     Each checkbox is at least as tall as its hit area, so stacked ones never overlap. */
  .checkbox::before {
    content: "";
    position: absolute;
    top: max(0px, (var(--checkbox--box--size) - var(--checkbox--hit-area--size)) / 2);
    inset-inline-start: calc((var(--checkbox--box--size) - var(--checkbox--hit-area--size)) / 2);
    width: var(--checkbox--hit-area--size);
    height: var(--checkbox--hit-area--size);
  }

  /* Sizes */
  .checkbox[data-size="xs"] {
    --checkbox--box--size: 0.875rem;
    --checkbox--gap: 0.375rem;
    --checkbox--font-size: 0.75rem;
  }
  .checkbox[data-size="sm"] {
    --checkbox--box--size: 1rem;
  }
  .checkbox[data-size="lg"] {
    --checkbox--box--size: 1.25rem;
    --checkbox--box--radius: 0.375rem;
    --checkbox--font-size: 1rem;
  }
  .checkbox[data-size="xl"] {
    --checkbox--box--size: 1.5rem;
    --checkbox--box--radius: 0.375rem;
    --checkbox--gap: 0.625rem;
    --checkbox--font-size: 1rem;
  }

  /* Parts. The box and its check are centred in the first line, or in the hit area
     when that's taller, and so is the label's first line, however long it runs. */
  .checkbox > [data-slot="box"],
  .checkbox > [data-slot="indicator"] {
    grid-area: 1 / 1;
    box-sizing: border-box;
    width: var(--checkbox--box--size);
    height: var(--checkbox--box--size);
    margin: max(0px, (var(--checkbox--hit-area--size) - var(--checkbox--box--size)) / 2) 0;
  }
  .checkbox > [data-slot="box"] {
    /* Above the hit area, which is positioned too, so the box still gets its own hover and press. */
    position: relative;
    /* The browser's own box can't be sized or coloured the same way everywhere. */
    appearance: none;
    border: 1px solid var(--checkbox--box--border-color);
    border-radius: var(--checkbox--box--radius);
    background-color: transparent;
    /* Inputs don't inherit the text colour, which the border is mixed from. */
    color: inherit;
    cursor: inherit;
  }
  .checkbox > [data-slot="indicator"] {
    /* Positioned too, so it's drawn over the box, while clicks go through to it. */
    position: relative;
    pointer-events: none;
    color: var(--checkbox--indicator--color);
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .checkbox > [data-slot="indicator"] > [data-mark] {
    display: none;
  }
  .checkbox > [data-slot="label"] {
    grid-row: 1;
    grid-column: 2;
    padding-block: max(0px, (var(--checkbox--hit-area--size) - 1.25 * var(--checkbox--font-size)) / 2);
  }

  /* States. Each one reads the <input>, which is what assistive technologies report,
     so what people see and what they hear can't drift apart. */
  @media (hover: hover) {
    .checkbox:hover:where(:not(:has(> [data-slot="box"]:is(:disabled, [aria-readonly="true"])))) {
      --checkbox--box--border-color: color-mix(in srgb, currentColor 80%, transparent);
    }
  }
  .checkbox > [data-slot="box"]:focus-visible {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  .checkbox > [data-slot="box"]:is(:checked, :indeterminate) {
    --checkbox--box--border-color: var(--checkbox--box--fill);
    background-color: var(--checkbox--box--fill);
  }
  /* The browser clears :indeterminate on the first click, and the dash takes precedence
     over the check, as it does in native checkboxes. */
  .checkbox > [data-slot="box"]:checked:not(:indeterminate) + [data-slot="indicator"] > [data-mark="check"],
  .checkbox > [data-slot="box"]:indeterminate + [data-slot="indicator"] > [data-mark="dash"] {
    display: inline;
  }
  /* Read-only: dashed, like a read-only Input, with the check in the text colour and no
     fill, so it reads as a state you can see but not change. :read-only can't tell it
     apart, since it matches every checkbox. */
  .checkbox:has(> [data-slot="box"][aria-readonly="true"]) {
    cursor: default;
  }
  .checkbox > [data-slot="box"][aria-readonly="true"] {
    /* The container's border colour, which more contrast still strengthens. */
    --checkbox--box--border-color: inherit;
    border-style: dashed;
    background-color: transparent;
  }
  .checkbox > [data-slot="box"][aria-readonly="true"] + [data-slot="indicator"] {
    color: inherit;
  }
  .checkbox > [data-slot="box"][aria-invalid="true"] {
    --checkbox--box--border-color: var(--color--error-text);
    /* A second pixel of border, drawn inside, so the box doesn't grow. */
    box-shadow: inset 0 0 0 1px var(--checkbox--box--border-color);
  }
  /* :disabled matches inside a <fieldset disabled> too, so a whole group looks disabled. */
  .checkbox:has(> [data-slot="box"]:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* With more contrast, the border is drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .checkbox,
    .checkbox:hover {
      --checkbox--box--border-color: currentColor;
    }
  }

  /* Forced colors mode keeps borders but drops backgrounds and shadows, so mark the
     checked box and its states with system colours. */
  @media (forced-colors: active) {
    .checkbox > [data-slot="box"]:is(:checked, :indeterminate) {
      --checkbox--box--border-color: Highlight;
      background-color: Highlight;
    }
    .checkbox > [data-slot="indicator"] {
      color: HighlightText;
    }
    .checkbox > [data-slot="box"][aria-readonly="true"] {
      --checkbox--box--border-color: CanvasText;
      background-color: transparent;
    }
    .checkbox > [data-slot="box"][aria-readonly="true"] + [data-slot="indicator"] {
      color: CanvasText;
    }
    .checkbox > [data-slot="box"]:focus-visible {
      outline-color: Highlight;
    }
    .checkbox:has(> [data-slot="box"]:disabled) {
      color: GrayText;
      opacity: 1;
    }
    .checkbox > [data-slot="box"]:disabled {
      --checkbox--box--border-color: GrayText;
    }
    .checkbox > [data-slot="box"]:disabled:is(:checked, :indeterminate) {
      background-color: GrayText;
    }
    .checkbox > [data-slot="box"]:disabled + [data-slot="indicator"] {
      color: Canvas;
    }
  }
}
</style>
```

```ts [Checkbox.test.ts]
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import Checkbox from "./Checkbox.vue";

const terms = () => "I agree to the terms";

describe("Checkbox", () => {
  it("is a native checkbox, named by the label it wraps, and nothing else", () => {
    render(Checkbox, { slots: { default: terms } });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    expect(checkbox.tagName).toBe("INPUT");
    expect(checkbox).toHaveAttribute("type", "checkbox");
    expect(checkbox.closest("label")).toHaveClass("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("toggles when its label is clicked", async () => {
    const user = userEvent.setup();
    render(Checkbox, { slots: { default: terms } });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    await user.click(screen.getByText("I agree to the terms"));
    expect(checkbox).toBeChecked();
    await user.click(screen.getByText("I agree to the terms"));
    expect(checkbox).not.toBeChecked();
  });

  it("is reached with Tab and toggled with Space, but not with Enter", async () => {
    const user = userEvent.setup();
    render(Checkbox, { slots: { default: terms } });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    await user.tab();
    expect(checkbox).toHaveFocus();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
    await user.keyboard("{Enter}");
    expect(checkbox).toBeChecked();
    await user.keyboard(" ");
    expect(checkbox).not.toBeChecked();
  });

  it("is mixed while indeterminate, set as a property rather than an attribute, and clears on the first click", async () => {
    const user = userEvent.setup();
    const mixed = ref(true);
    render({
      render: () => [
        h(
          Checkbox,
          { indeterminate: mixed.value, "onUpdate:indeterminate": (value: boolean) => (mixed.value = value) },
          () => "Bound",
        ),
        h(Checkbox, { indeterminate: true }, () => "Unbound"),
      ],
    });

    for (const name of ["Bound", "Unbound"]) {
      const checkbox = screen.getByRole<HTMLInputElement>("checkbox", { name });
      expect(checkbox).toBePartiallyChecked();
      expect(checkbox.indeterminate).toBe(true);
      expect(checkbox).not.toHaveAttribute("indeterminate");

      await user.click(checkbox);
      await nextTick();
      expect(checkbox).not.toBePartiallyChecked();
      expect(checkbox).toBeChecked();
    }
    expect(mixed.value).toBe(false);

    // Worked out again from the options it stands for, it follows them after the first render too.
    const bound = screen.getByRole<HTMLInputElement>("checkbox", { name: "Bound" });
    mixed.value = true;
    await nextTick();
    expect(bound.indeterminate).toBe(true);
    expect(bound).toBePartiallyChecked();
    mixed.value = false;
    await nextTick();
    expect(bound.indeterminate).toBe(false);
    expect(bound).not.toBePartiallyChecked();
  });

  it("puts attributes, listeners and refs on the input, and classes on its root", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const instance = ref<ComponentPublicInstance<{ input: HTMLInputElement }>>();
    render({
      render: () =>
        h(Checkbox, { ref: instance, id: "updates", class: "updates", name: "updates", value: "weekly", onChange }, terms),
    });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("id", "updates");
    expect(checkbox).toHaveAttribute("name", "updates");
    expect(checkbox).not.toHaveClass("updates");
    expect(checkbox.closest("label")).toHaveClass("checkbox", "updates");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(instance.value?.input).toBe(checkbox);
  });

  it("is submitted with its form by its name and value while checked, and not at all while unchecked", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () =>
        h("form", [
          h(Checkbox, { name: "updates", value: "weekly" }, () => "Weekly updates"),
          h(Checkbox, { name: "terms" }, terms),
        ]),
    });

    const form = container.querySelector("form")!;
    expect([...new FormData(form)]).toEqual([]);
    await user.click(screen.getByRole("checkbox", { name: "Weekly updates" }));
    await user.click(screen.getByRole("checkbox", { name: "I agree to the terms" }));
    // Without a value, a checked box is sent as "on".
    expect([...new FormData(form)]).toEqual([
      ["updates", "weekly"],
      ["terms", "on"],
    ]);
  });

  it("binds checked with v-model, or keeps its own state without it, starting from checked", async () => {
    const user = userEvent.setup();
    const agreed = ref(false);
    const seen: boolean[] = [];
    render({
      render: () => [
        h(
          Checkbox,
          {
            checked: agreed.value,
            "onUpdate:checked": (value: boolean) => (agreed.value = value),
            onChange: () => seen.push(agreed.value),
          },
          () => "Bound",
        ),
        h(Checkbox, { checked: true }, () => "Unbound"),
      ],
    });

    const bound = screen.getByRole("checkbox", { name: "Bound" });
    await user.click(bound);
    expect(agreed.value).toBe(true);
    // A change listener of yours already sees the new state.
    expect(seen).toEqual([true]);
    agreed.value = false;
    await nextTick();
    expect(bound).not.toBeChecked();

    const unbound = screen.getByRole("checkbox", { name: "Unbound" });
    expect(unbound).toBeChecked();
    await user.click(unbound);
    expect(unbound).not.toBeChecked();
  });

  it("keeps showing the state you hold when a bound change isn't taken", async () => {
    const user = userEvent.setup();
    const onChecked = vi.fn();
    const onIndeterminate = vi.fn();
    render({
      render: () => [
        h(Checkbox, { checked: true, "onUpdate:checked": onChecked }, () => "Email"),
        h(Checkbox, { indeterminate: true, "onUpdate:indeterminate": onIndeterminate }, () => "Select all"),
      ],
    });

    const email = screen.getByRole("checkbox", { name: "Email" });
    await user.click(email);
    expect(onChecked).toHaveBeenCalledWith(false);
    await nextTick();
    expect(email).toBeChecked();

    const all = screen.getByRole("checkbox", { name: "Select all" });
    await user.click(all);
    expect(onIndeterminate).toHaveBeenCalledWith(false);
    await nextTick();
    expect(all).toBePartiallyChecked();
  });

  it("passes required, aria-invalid and its error message to the input", () => {
    render({
      render: () => [
        h(Checkbox, { required: true, "aria-invalid": "true", "aria-describedby": "terms-error" }, terms),
        h("p", { id: "terms-error" }, "Agree to the terms to create an account"),
      ],
    });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    expect(checkbox).toBeRequired();
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAccessibleDescription("Agree to the terms to create an account");
  });

  it("can't be focused, toggled or submitted while disabled, or inside a disabled fieldset", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () =>
        h("form", [
          h(Checkbox, { name: "terms", checked: true, disabled: true }, terms),
          h("fieldset", { disabled: true }, [h(Checkbox, { name: "updates" }, () => "Weekly updates")]),
        ]),
    });

    const own = screen.getByRole("checkbox", { name: "I agree to the terms" });
    const grouped = screen.getByRole("checkbox", { name: "Weekly updates" });
    await user.tab();
    await user.click(own);
    await user.click(screen.getByText("Weekly updates"));
    expect(own).toBeDisabled();
    expect(grouped).toBeDisabled();
    expect(document.body).toHaveFocus();
    expect(own).toBeChecked();
    expect(grouped).not.toBeChecked();
    expect([...new FormData(container.querySelector("form")!)]).toEqual([]);
  });

  it("can be focused and submitted while read-only, but a click, its label or Space never toggle it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onUpdate = vi.fn();
    const { container } = render({
      render: () =>
        h("form", [
          h(
            Checkbox,
            { name: "updates", checked: true, readonly: true, onChange, "onUpdate:checked": onUpdate },
            () => "Email me updates",
          ),
          h(Checkbox, { name: "all", indeterminate: true, readonly: true }, () => "Select all"),
        ]),
    });

    const updates = screen.getByRole("checkbox", { name: "Email me updates" });
    const all = screen.getByRole("checkbox", { name: "Select all" });
    expect(updates).toHaveAttribute("aria-readonly", "true");
    // HTML ignores readonly on a checkbox, so it's never set.
    expect(updates).not.toHaveAttribute("readonly");

    await user.tab();
    expect(updates).toHaveFocus();
    await user.keyboard(" ");
    await user.click(updates);
    await user.click(screen.getByText("Email me updates"));
    expect(updates).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();

    await user.click(all);
    expect(all).toBePartiallyChecked();
    expect([...new FormData(container.querySelector("form")!)]).toEqual([["updates", "on"]]);
  });

  it("mirrors its size as a data attribute, and hides its indicator from assistive technologies", () => {
    const { container } = render(Checkbox, { props: { size: "lg" }, slots: { default: terms } });

    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
    expect(container.querySelector('[data-slot="indicator"]')).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const options = { slots: { default: terms } };
    const first = render(Checkbox, options).container.innerHTML;
    const { container, rerender } = render(Checkbox, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["box", "indicator", "label"]);

    const input = root.querySelector("input");
    await rerender({ checked: true, indeterminate: true, disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect(root.querySelector("input")).toBe(input);
    expect(parts()).toEqual(["box", "indicator", "label"]);
  });

  it("warns in development when it has no label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Checkbox);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render(Checkbox, { slots: { default: terms } });
    render(Checkbox, { attrs: { "aria-label": "Select Ada Lovelace" } });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
```
:::
::

## Sources

- [HTML Standard: the checkbox state](https://html.spec.whatwg.org/multipage/input.html#checkbox-state-%28type%3Dcheckbox%29), [the label element](https://html.spec.whatwg.org/multipage/forms.html#the-label-element), [implicit submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission) and [constructing the form data set](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set), for indeterminate, labels, `Enter` and what a form sends
- [WAI-ARIA Authoring Practices Guide: Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), for the keyboard and the mixed state
- [WAI-ARIA 1.2: aria-readonly](https://www.w3.org/TR/wai-aria-1.2/#aria-readonly) and the HTML Standard's [readonly attribute](https://html.spec.whatwg.org/multipage/input.html#the-readonly-attribute), which doesn't apply to checkboxes, for the read-only state
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), for the box, its fill and its check
- [Understanding SC 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), for the hit area and the spacing exception
- [GOV.UK Design System: Checkboxes](https://design-system.service.gov.uk/components/checkboxes/), for positive labels, large hit areas and error messages
- [Primer: Checkbox](https://primer.style/product/components/checkbox/), for the indeterminate state and its look
- [Base UI: Checkbox](https://base-ui.com/react/components/checkbox), for a controlled and an uncontrolled checked state
