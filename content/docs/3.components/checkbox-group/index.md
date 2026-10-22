---
title: Checkbox Group
description: How to build a group of checkboxes that people can pick any number of options from, that's named by its question, that says when they need to pick one, and that agents can check.
navigation:
  title: Overview
---

Checkbox groups let people pick any number of options from a short list, like the emails they'd like to get, or the days they're free. Each box on its own is a [Checkbox](/docs/components/checkbox), and what goes wrong is usually what holds them together. Think of boxes that a screen reader announces one by one, without the question they answer, a "Select all" box that stays unchecked when every option is checked, or a form that says "This field is required" until you've checked every single box.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/checkbox-group/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a checkbox group looks, from its parts, sizes and orientation to its states and tokens.
:::

:::card{to="/docs/components/checkbox-group/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a checkbox group behaves for every person, input and setting, so it's accessible, predictable, clear in every state and adaptive.
:::

:::card{to="/docs/components/checkbox-group/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Checkbox Group, with one consistent, typed API that's built from Checkboxes and works with your forms however you build them.
:::

:::card{to="/docs/components/checkbox-group/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, build and check a checkbox group, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/checkbox-group#reference-implementation), which does its part of every rule in the [checklist](/docs/components/checkbox-group#checklist), so feel free to check and uncheck them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Checkbox Group with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/checkbox-group/ax#deterministic).

The Checkbox Group is a `<fieldset>` of Checkboxes, so every rule on the [Checkbox](/docs/components/checkbox#checklist) page holds for each of its boxes, and this page covers what a group adds on top. Its hint and error message are elements of their own, which you link to it by ID, like the [Input](/docs/components/input)'s.

::checkbox-group-playground
::

| Aspect      | Checkbox Group                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Element     | `<fieldset>`, with a `<legend>` and a [Checkbox](/docs/components/checkbox) for each option      |
| Role        | `group`, holding a `checkbox` for each option                                                    |
| Name        | The text of its `<legend>`                                                                       |
| Description | Its hint and its error message, linked with `aria-describedby`                                   |
| Value       | A list of the checked options' values, sent with one shared `name`                               |
| Keyboard    | `Tab` reaches each checkbox in turn and `Space` checks or unchecks it, with no arrow keys        |
| States      | Disabled and invalid, along with each checkbox's own, and a select-all box that can be mixed     |
| Sizes       | `xs`, `sm`, `md`, `lg` and `xl`, the same as the Checkbox's                                      |
| Orientation | `vertical`, the default, or `horizontal` for two or three short options                          |
| Pattern     | [WAI-ARIA APG Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), with its [mixed-state example](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/), and the HTML [`<fieldset>`](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element) |
| WCAG 2.2    | 1.3.1, 1.4.10, 2.1.1, 3.3.1, 3.3.2, 3.3.3 and 4.1.2, among others                                |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A checkbox group meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it. Each of its boxes is a Checkbox, so the [Checkbox's checklist](/docs/components/checkbox#checklist) applies to every one of them as well, and the rules below only cover what the group adds.

The scope says who meets a rule. **Component** rules are met by the Checkbox Group itself, so they're the ones to check when you build or review one. **Usage** rules are met by the forms that use it, like writing a legend that asks the question, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like an invalid group: the Checkbox Group marks its boxes invalid from `aria-invalid`, as long as you set it when the error message shows.

The basis says where a rule comes from. Many rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and a few come from **HTML** or the **APG**. The rest are **Open Components** rules, which are our own, like stacking options in a column. Where a rule goes further than WCAG asks at level AA, its basis says so with **beyond**.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/checkbox-group/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/checkbox-group/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/checkbox-group/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/checkbox-group/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves. It's built out of the [Checkbox](/docs/components/checkbox#reference-implementation), which it imports from `../checkbox/Checkbox.vue`, so copy `Checkbox.vue` too. Both read the same theme tokens as the Button, so copy [`tokens.css`](/docs/components/button#reference-implementation) from the Button's reference implementation into your theme as well.

The tests are in `CheckboxGroup.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [CheckboxGroup.vue]
<script setup lang="ts">
import { computed, onMounted, useAttrs, useTemplateRef } from "vue";
import Checkbox from "../checkbox/Checkbox.vue";

export interface CheckboxGroupOption {
  /** What the form sends for it while it's checked, and what the group's value lists. */
  value: string;
  /** The text that names its checkbox. */
  label: string;
}

export interface CheckboxGroupProps {
  /** One checkbox per option, in this order. */
  options: CheckboxGroupOption[];
  /** The name every checkbox shares, so the form sends the group as one field with a value per checked option. */
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** A column by default, which is quicker to scan. A row only suits two or three short options. */
  orientation?: "vertical" | "horizontal";
  /** Disables every checkbox in it, with `<fieldset disabled>`. */
  disabled?: boolean;
  /** The label of a box above the options that checks or clears them all, and shows whether all, some or none are checked. */
  selectAll?: string;
}

// Attributes go on the <fieldset> through `attrs`, which also tells the options below when the group is invalid.
defineOptions({ inheritAttrs: false });

const { options, name, size = "md", orientation = "vertical", disabled = false, selectAll } = defineProps<CheckboxGroupProps>();

/** The checked options' values, in the options' order, which `v-model:value` binds. Without it, the group keeps its own, and starts from `value`. */
const value = defineModel<string[]>("value", { default: () => [] });

defineSlots<{
  /** The legend, which names the group. */
  default?: () => unknown;
}>();

const attrs = useAttrs();
// While the group is invalid, so is each of its options, so they look and read
// invalid too. The error message stays on the group, where it's described.
const invalid = () => attrs["aria-invalid"] === true || attrs["aria-invalid"] === "true";

const all = computed(() => options.length > 0 && options.every((option) => value.value.includes(option.value)));
// Worked out from the options every time they change, so it can't disagree with them.
const some = computed(() => !all.value && options.some((option) => value.value.includes(option.value)));

function toggle(option: CheckboxGroupOption, checked: boolean) {
  value.value = options
    .map(({ value }) => value)
    .filter((candidate) => (candidate === option.value ? checked : value.value.includes(candidate)));
}

// Checking the box, from unchecked or mixed, checks every option, and unchecking it
// clears them all, as the APG asks. It never goes back to an earlier selection, so a
// press always does what the box shows it will.
function toggleAll(checked: boolean) {
  value.value = checked ? options.map(({ value }) => value) : [];
}

const fieldset = useTemplateRef<HTMLFieldSetElement>("fieldset");

// A ref to the CheckboxGroup gets you the <fieldset>, through `fieldset`.
defineExpose({ fieldset });

onMounted(() => {
  if (import.meta.env.DEV) {
    const el = fieldset.value;
    const named =
      el?.querySelector(":scope > legend")?.textContent?.trim() ||
      el?.hasAttribute("aria-label") ||
      el?.hasAttribute("aria-labelledby");
    if (el && !named) {
      console.warn("[CheckboxGroup] has no accessible name: give it a legend that says what its options are for.", el);
    }
  }
});
</script>

<template>
  <fieldset
    ref="fieldset"
    class="checkbox-group"
    v-bind="attrs"
    :data-size="size"
    :data-orientation="orientation"
    :disabled="disabled"
  >
    <!-- The fieldset's first child, which names it. -->
    <legend data-slot="legend"><slot /></legend>
    <div v-if="selectAll" data-slot="select-all">
      <!-- No name, so the form never sends it: it stands for the options, which it does send.
           Its mixed state is bound, and its own update ignored, so it always shows what they add up to. -->
      <Checkbox
        :size="size"
        :checked="all"
        :indeterminate="some"
        @update:checked="toggleAll"
        @update:indeterminate="() => {}"
      >
        {{ selectAll }}
      </Checkbox>
    </div>
    <div data-slot="options">
      <Checkbox
        v-for="option in options"
        :key="option.value"
        :size="size"
        :name="name"
        :value="option.value"
        :checked="value.includes(option.value)"
        :aria-invalid="invalid() ? 'true' : undefined"
        @update:checked="(checked: boolean) => toggle(option, checked)"
      >
        {{ option.label }}
      </Checkbox>
    </div>
  </fieldset>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The group's styles go in `components`, so
   they win over the resets in `base`, and give way to utilities and to any style
   outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .checkbox-group {
    /* Set per size, along with the Checkbox's own. */
    --checkbox-group--legend--font-size: 0.875rem;
    /* How far the options sit in from a select-all box: its box and gap, so their boxes line up with its label. */
    --checkbox-group--indent: 1.625rem;
    /* 8px between stacked checkboxes, so a tap between two never toggles the wrong one. */
    --checkbox-group--row-gap: 0.5rem;
    --checkbox-group--column-gap: 1.5rem;
    --checkbox-group--legend--margin-bottom: 0.5rem;

    display: flex;
    flex-direction: column;
    gap: var(--checkbox-group--row-gap);
    min-inline-size: 0;
    margin: 0;
    padding: 0;
    border: 0;
    color: var(--color--neutral-text);
  }

  /* Sizes */
  .checkbox-group[data-size="xs"] {
    --checkbox-group--legend--font-size: 0.75rem;
    --checkbox-group--indent: 1.25rem;
  }
  .checkbox-group[data-size="sm"] {
    --checkbox-group--indent: 1.5rem;
  }
  .checkbox-group[data-size="lg"] {
    --checkbox-group--legend--font-size: 1rem;
    --checkbox-group--indent: 1.75rem;
  }
  .checkbox-group[data-size="xl"] {
    --checkbox-group--legend--font-size: 1rem;
    --checkbox-group--indent: 2.125rem;
  }

  /* Parts */
  .checkbox-group > [data-slot="legend"] {
    /* A rendered legend sits outside the flex box the fieldset lays its content out in, so it gets a margin rather than the gap. */
    margin-bottom: var(--checkbox-group--legend--margin-bottom);
    padding: 0;
    font-size: var(--checkbox-group--legend--font-size);
    font-weight: 600;
    line-height: 1.25;
  }
  .checkbox-group > [data-slot="options"] {
    display: flex;
    flex-direction: column;
    gap: var(--checkbox-group--row-gap) var(--checkbox-group--column-gap);
  }
  .checkbox-group > [data-slot="select-all"] + [data-slot="options"] {
    padding-inline-start: var(--checkbox-group--indent);
  }
  /* A row wraps when it runs out of room, rather than overflowing. */
  .checkbox-group[data-orientation="horizontal"] > [data-slot="options"] {
    flex-direction: row;
    flex-wrap: wrap;
  }

  /* States. :disabled matches a <fieldset disabled>, and every Checkbox inside it
     looks disabled on its own, since its look comes from :disabled too. */
  .checkbox-group:disabled > [data-slot="legend"] {
    opacity: 0.5;
  }

  @media (forced-colors: active) {
    .checkbox-group:disabled > [data-slot="legend"] {
      color: GrayText;
      opacity: 1;
    }
  }
}
</style>
```

```ts [CheckboxGroup.test.ts]
import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import CheckboxGroup from "./CheckboxGroup.vue";

const options = [
  { value: "cheese", label: "Cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
];
const toppings = () => "Toppings";

describe("CheckboxGroup", () => {
  it("is a fieldset, named by its legend, with a native checkbox for each option", () => {
    render(CheckboxGroup, { props: { name: "toppings", options }, slots: { default: toppings } });

    const group = screen.getByRole("group", { name: "Toppings" });
    expect(group).toHaveAccessibleName("Toppings");
    expect(group.tagName).toBe("FIELDSET");
    expect(group.firstElementChild?.tagName).toBe("LEGEND");
    for (const { value, label } of options) {
      const checkbox = screen.getByRole("checkbox", { name: label });
      expect(checkbox.tagName).toBe("INPUT");
      // Only an invalid group marks its options invalid.
      expect(checkbox).not.toHaveAttribute("aria-invalid");
      expect(checkbox).toHaveAttribute("name", "toppings");
      expect(checkbox).toHaveAttribute("value", value);
      expect(group).toContainElement(checkbox);
    }
  });

  it("is described by its hint and its error, through aria-describedby on the fieldset", () => {
    render({
      render: () => [
        h(
          CheckboxGroup,
          { name: "toppings", options, "aria-invalid": "true", "aria-describedby": "toppings-hint toppings-error" },
          toppings,
        ),
        h("p", { id: "toppings-hint" }, "Pick as many as you like."),
        h("p", { id: "toppings-error" }, "Pick at least one topping"),
      ],
    });

    const group = screen.getByRole("group", { name: "Toppings" });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Pick as many as you like. Pick at least one topping");
    // The boxes look and read invalid along with the group, while the message stays on the group.
    for (const { label } of options) {
      expect(screen.getByRole("checkbox", { name: label })).toHaveAttribute("aria-invalid", "true");
    }
  });

  it("is submitted with its form as one name, with a value for each checked option", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () => h("form", [h(CheckboxGroup, { name: "toppings", options, selectAll: "All toppings" }, toppings)]),
    });

    const form = container.querySelector("form")!;
    expect([...new FormData(form)]).toEqual([]);
    await user.click(screen.getByRole("checkbox", { name: "Olives" }));
    await user.click(screen.getByRole("checkbox", { name: "Cheese" }));
    // In the options' order, and without the select-all box, which has no name.
    expect(new FormData(form).getAll("toppings")).toEqual(["cheese", "olives"]);
    expect([...new FormData(form)]).toHaveLength(2);
  });

  it("binds its value as a list with v-model, or keeps its own without it, starting from value", async () => {
    const user = userEvent.setup();
    const picked = ref<string[]>(["mushrooms"]);
    render({
      render: () => [
        h(
          CheckboxGroup,
          { name: "bound", options, value: picked.value, "onUpdate:value": (value: string[]) => (picked.value = value) },
          () => "Bound",
        ),
        h(CheckboxGroup, { name: "unbound", options: [{ value: "yes", label: "Unbound option" }], value: ["yes"] }, () => "Unbound"),
      ],
    });

    const bound = within(screen.getByRole("group", { name: "Bound" }));
    const cheese = bound.getByRole("checkbox", { name: "Cheese" });
    const mushrooms = bound.getByRole("checkbox", { name: "Mushrooms" });
    expect(mushrooms).toBeChecked();
    await user.click(cheese);
    expect(picked.value).toEqual(["cheese", "mushrooms"]);
    picked.value = ["olives"];
    await nextTick();
    expect(cheese).not.toBeChecked();
    expect(mushrooms).not.toBeChecked();

    const unbound = screen.getByRole("checkbox", { name: "Unbound option" });
    expect(unbound).toBeChecked();
    await user.click(unbound);
    expect(unbound).not.toBeChecked();
  });

  it("keeps showing the value you hold when a bound change isn't taken", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(CheckboxGroup, {
      props: { name: "toppings", options, selectAll: "All toppings", value: ["cheese"], "onUpdate:value": onUpdate },
      slots: { default: toppings },
    });

    const cheese = screen.getByRole("checkbox", { name: "Cheese" });
    await user.click(cheese);
    expect(onUpdate).toHaveBeenCalledWith([]);
    await nextTick();
    expect(cheese).toBeChecked();

    const all = screen.getByRole("checkbox", { name: "All toppings" });
    await user.click(all);
    expect(onUpdate).toHaveBeenLastCalledWith(["cheese", "mushrooms", "olives"]);
    await nextTick();
    expect(all).toBePartiallyChecked();
    expect(screen.getByRole("checkbox", { name: "Olives" })).not.toBeChecked();
  });

  it("is reached with Tab one checkbox at a time, each toggled with Space, with no arrow keys", async () => {
    const user = userEvent.setup();
    render(CheckboxGroup, { props: { name: "toppings", options, selectAll: "All toppings" }, slots: { default: toppings } });

    for (const name of ["All toppings", "Cheese", "Mushrooms", "Olives"]) {
      await user.tab();
      expect(screen.getByRole("checkbox", { name })).toHaveFocus();
    }
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("checkbox", { name: "Olives" })).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("checkbox", { name: "Olives" })).toBeChecked();
    await user.tab({ shift: true });
    expect(screen.getByRole("checkbox", { name: "Mushrooms" })).toHaveFocus();
  });

  it("shows its select-all box checked, unchecked or mixed from its options, and checks or clears them all from it", async () => {
    const user = userEvent.setup();
    const picked = ref<string[]>([]);
    render({
      render: () =>
        h(
          CheckboxGroup,
          {
            name: "toppings",
            options,
            selectAll: "All toppings",
            value: picked.value,
            "onUpdate:value": (value: string[]) => (picked.value = value),
          },
          toppings,
        ),
    });

    const all = screen.getByRole<HTMLInputElement>("checkbox", { name: "All toppings" });
    expect(all).not.toBeChecked();
    expect(all).not.toBePartiallyChecked();

    await user.click(screen.getByRole("checkbox", { name: "Cheese" }));
    await nextTick();
    expect(all).toBePartiallyChecked();

    // From mixed, it checks every option, rather than going back to an earlier selection.
    await user.click(all);
    await nextTick();
    expect(picked.value).toEqual(["cheese", "mushrooms", "olives"]);
    expect(all).toBeChecked();
    expect(all).not.toBePartiallyChecked();

    // From checked, it clears them all.
    await user.click(all);
    await nextTick();
    expect(picked.value).toEqual([]);
    expect(all).not.toBeChecked();

    // From unchecked, it checks them all again.
    await user.click(all);
    await nextTick();
    expect(picked.value).toEqual(["cheese", "mushrooms", "olives"]);

    // And it follows the options, whichever way they change.
    picked.value = ["olives"];
    await nextTick();
    expect(all).toBePartiallyChecked();
    await user.click(screen.getByRole("checkbox", { name: "Olives" }));
    await nextTick();
    expect(all).not.toBeChecked();
    expect(all).not.toBePartiallyChecked();
  });

  it("can't be focused, changed or submitted while disabled, select-all box included", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () =>
        h("form", [
          h(
            CheckboxGroup,
            { name: "toppings", options, selectAll: "All toppings", value: ["cheese"], disabled: true },
            toppings,
          ),
        ]),
    });

    const group = screen.getByRole("group", { name: "Toppings" });
    expect(group).toBeDisabled();
    await user.tab();
    await user.click(screen.getByRole("checkbox", { name: "All toppings" }));
    await user.click(screen.getByText("Mushrooms"));
    expect(document.body).toHaveFocus();
    for (const checkbox of screen.getAllByRole("checkbox")) expect(checkbox).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Mushrooms" })).not.toBeChecked();
    expect([...new FormData(container.querySelector("form")!)]).toEqual([]);
  });

  it("puts attributes, listeners and refs on the fieldset", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const instance = ref<ComponentPublicInstance<{ fieldset: HTMLFieldSetElement }>>();
    render({
      render: () => h(CheckboxGroup, { ref: instance, id: "toppings", class: "toppings", name: "toppings", options, onChange }, toppings),
    });

    const group = screen.getByRole("group", { name: "Toppings" });
    expect(group).toHaveAttribute("id", "toppings");
    expect(group).toHaveClass("checkbox-group", "toppings");
    // Each checkbox's change bubbles up to the fieldset.
    await user.click(screen.getByRole("checkbox", { name: "Cheese" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(instance.value?.fieldset).toBe(group);
  });

  it("is vertical by default, and mirrors its size and orientation as data attributes, with its size on every checkbox", () => {
    const { container } = render(CheckboxGroup, { props: { name: "toppings", options }, slots: { default: toppings } });
    expect(container.firstElementChild).toHaveAttribute("data-orientation", "vertical");
    expect(container.firstElementChild).toHaveAttribute("data-size", "md");

    const { container: row } = render(CheckboxGroup, {
      props: { name: "toppings", options, size: "lg", orientation: "horizontal", selectAll: "All toppings" },
      slots: { default: toppings },
    });
    const root = row.firstElementChild!;
    expect(root).toHaveAttribute("data-orientation", "horizontal");
    expect(root).toHaveAttribute("data-size", "lg");
    for (const checkbox of root.querySelectorAll(".checkbox")) expect(checkbox).toHaveAttribute("data-size", "lg");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const props = { name: "toppings", options, selectAll: "All toppings" };
    const first = render(CheckboxGroup, { props, slots: { default: toppings } }).container.innerHTML;
    const { container, rerender } = render(CheckboxGroup, { props, slots: { default: toppings } });
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["legend", "select-all", "options"]);

    const inputs = [...root.querySelectorAll("input")];
    await rerender({ ...props, value: ["cheese"], disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect([...root.querySelectorAll("input")]).toEqual(inputs);
    expect(parts()).toEqual(["legend", "select-all", "options"]);
  });

  it("warns in development when it has no legend", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(CheckboxGroup, { props: { name: "toppings", options } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render(CheckboxGroup, { props: { name: "toppings", options }, slots: { default: toppings } });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
```
:::
::

## Sources

- [HTML Standard: the fieldset element](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element), [the legend element](https://html.spec.whatwg.org/multipage/form-elements.html#the-legend-element), [the checkbox state](https://html.spec.whatwg.org/multipage/input.html#checkbox-state-%28type%3Dcheckbox%29) and [constructing the form data set](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set), for the group's name, `disabled`, what `required` means on a checkbox and what the form sends
- [WAI-ARIA Authoring Practices Guide: Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), for the select-all box's states and what checking and unchecking it does, and for describing a group with `aria-describedby`
- [APG: Checkbox (Mixed-State) Example](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/), for the `<fieldset>` and `<legend>` around the options, and `Tab` between them
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 1.3.1: Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html), for grouping related controls under a name
- [Understanding SC 3.3.2: Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html), for saying when people have to pick one
- [GOV.UK Design System: Checkboxes](https://design-system.service.gov.uk/components/checkboxes/), for legends written as questions, hints like "Select all that apply", the order of the options and options given as data
- [React Aria: CheckboxGroup](https://react-spectrum.adobe.com/react-aria/CheckboxGroup.html), for the value as a list and a vertical or horizontal orientation
