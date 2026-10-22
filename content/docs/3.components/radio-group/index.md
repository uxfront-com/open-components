---
title: Radio Group
description: How to build a radio group that asks one clear question, lets people pick one answer with a pointer or the arrow keys, says what's wrong when they skip it, and that agents can check.
navigation:
  title: Overview
---

Radio groups let people pick one option out of a few, like a delivery speed or a plan, while every option stays in view. They look like a list of circles with words beside them, which is why they're so often built from scratch. Think of radios that each have their own `name`, so people can check all of them at once, a question that's a heading rather than a legend, so screen readers never read it, or a group that turns red when people skip it, but doesn't tell screen reader users anything at all.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/radio-group/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a radio group looks, from its parts and sizes to its states, layout and tokens.
:::

:::card{to="/docs/components/radio-group/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a radio group behaves for every person, input and setting, so it's accessible, predictable, clear in every state and adaptive.
:::

:::card{to="/docs/components/radio-group/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Radio Group, with one consistent, typed API that works with your forms however you build them.
:::

:::card{to="/docs/components/radio-group/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, fill in and check a radio group, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/radio-group#reference-implementation), which does its part of every rule in the [checklist](/docs/components/radio-group#checklist), so feel free to click and arrow through them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Radio Group with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/radio-group/ax#deterministic).

The Radio Group is the question, and each Radio inside it is one answer. The group renders its legend, its hint and its error message, since a fieldset needs its legend inside it, and its radios share its name, its size and its value, so they can never disagree.

::radio-group-playground
::

| Aspect   | Radio Group                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------- |
| Element  | `<fieldset>` with a `<legend>`, around native `<input type="radio">`s, each inside its `<label>`         |
| Role     | `radiogroup` on the fieldset, and `radio` on each input                                                  |
| Name     | The group's `<legend>`, through `aria-labelledby`, and each radio's `<label>`                            |
| Keyboard | `Tab` stops once per group, the arrow keys move and check, wrapping round, and `Space` checks            |
| States   | Hover, focus, checked, disabled and invalid                                                              |
| Sizes    | `xs`, `sm`, `md`, `lg` and `xl`, with the same heights as the Input                                      |
| Pattern  | [Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) in the APG, which native radios follow    |
| WCAG 2.2 | 1.3.1, 1.4.1, 1.4.3, 1.4.11, 2.1.1, 2.4.7, 2.5.8, 3.2.2, 3.3.1, 3.3.2 and 4.1.2, among others            |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A radio group meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Radio Group itself, so they're the ones to check when you build or review one. **Usage** rules are met by the forms that use it, like asking a question in the legend, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like labelling every radio: the Radio wraps its input in its label, as long as you give it one.

The basis says where a rule comes from. About half the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and a few come from **HTML** or the **APG**. The rest are **Open Components** rules, which are our own, like checking a group when people submit rather than as they pass through it. Where a rule goes further than WCAG asks at level AA, its basis says so: some come from level **AAA**, like the 44px rows on touch screens, and a rule that asks for more than its criterion says **beyond**, like using native radios, where WCAG would let you rebuild them by hand.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/radio-group/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/radio-group/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/radio-group/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/radio-group/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. It's two components, the Radio Group and the Radio, which reads its name, size, required state and value from the group it's in. Feel free to copy them into your design system and change how they look, but try to keep how they behave. They read the same theme tokens as the Button, so copy [`tokens.css`](/docs/components/button#reference-implementation) from the Button's reference implementation into your theme too.

The tests are in `RadioGroup.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [RadioGroup.vue]
<script lang="ts">
import type { InjectionKey } from "vue";

export interface RadioGroupProps {
  /** The name every radio submits its value under. The legend's, hint's and error's IDs start with it, so give each group on a page its own. */
  name: string;
  /** Names the group, as its <legend>. Ask the question the radios answer, like "How would you like it delivered?" */
  legend: string;
  /** Help that applies to every option, which screen readers read with the group's name. */
  hint?: string;
  /** What's wrong and how to fix it. While it's set, the group is invalid, and screen readers say so. */
  error?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Stacks the radios, one per line, or sets them side by side. Keep `horizontal` for two short options, like "Yes" and "No". */
  orientation?: "vertical" | "horizontal";
  /** Disables every radio, and leaves the group out of its form. */
  disabled?: boolean;
  /** Makes every radio required, so its form can't be sent until one is checked. */
  required?: boolean;
}

/** What the group shares with its radios, which they read from it rather than from props of their own. */
export interface RadioGroupContext {
  readonly name: string;
  readonly size: NonNullable<RadioGroupProps["size"]>;
  readonly required: boolean;
  readonly value: string | undefined;
  select(value: string): void;
}

export const RadioGroupKey: InjectionKey<RadioGroupContext> = Symbol("RadioGroup");
</script>

<script setup lang="ts">
import { onMounted, provide, useTemplateRef } from "vue";

const {
  name,
  legend,
  hint,
  error,
  size = "md",
  orientation = "vertical",
  disabled = false,
  required = false,
} = defineProps<RadioGroupProps>();

/** The checked radio's value, which `v-model` binds. Without it, the group keeps its own, and its form submits it. */
const model = defineModel<string>();

defineSlots<{
  /** The radios, one Radio for each option. */
  default?: () => unknown;
}>();

// Getters, so the radios read the group's props as they are on every render.
provide(RadioGroupKey, {
  get name() {
    return name;
  },
  get size() {
    return size;
  },
  get required() {
    return required;
  },
  get value() {
    return model.value;
  },
  select(value: string) {
    model.value = value;
  },
});

// IDs come from the name rather than being made up, so the markup is the same on the
// server, on the client and in every snapshot.
const describedBy = () => [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ") || undefined;

const fieldset = useTemplateRef<HTMLFieldSetElement>("fieldset");

onMounted(() => {
  if (import.meta.env.DEV && !legend.trim()) {
    console.warn("[RadioGroup] has no legend: give it one that asks the question its radios answer.", fieldset.value);
  }
});
</script>

<template>
  <fieldset
    ref="fieldset"
    class="radio-group"
    role="radiogroup"
    :data-size="size"
    :data-orientation="orientation"
    :disabled="disabled"
    :aria-labelledby="`${name}-legend`"
    :aria-invalid="error ? 'true' : undefined"
    :aria-describedby="describedBy()"
  >
    <!-- A fieldset groups the radios and takes its name from its legend. ARIA only supports
         aria-invalid on the radiogroup role, not on a fieldset's own group role or on a
         radio, so the fieldset takes that role. HTML-AAM names a fieldset from its legend
         whatever its role, but aria-labelledby says it outright, so the name doesn't
         depend on each browser's fieldset naming. There's no aria-orientation: a
         horizontal group stacks again on narrow screens, which a fixed attribute can't
         follow, and the arrow keys move both ways either way. -->
    <legend :id="`${name}-legend`" data-slot="legend">{{ legend }}</legend>
    <p v-if="hint" :id="`${name}-hint`" data-slot="hint">{{ hint }}</p>
    <!-- Above the radios, so people read what's wrong before they choose again. -->
    <p v-if="error" :id="`${name}-error`" data-slot="error">{{ error }}</p>
    <!-- The radios get a box of their own, so laying them out in a row leaves the hint
         and the error above them. -->
    <div data-slot="options">
      <slot />
    </div>
  </fieldset>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The group's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .radio-group {
    --radio-group--gap: 0.25rem;
    /* Set per size. The text sizes are the Input's, so a group sits well in a form with one. */
    --radio-group--font-size: 0.875rem;
    /* The space between radios side by side, wide enough that each label reads as its own radio's. */
    --radio-group--options--column-gap: 1.5rem;

    display: flex;
    flex-direction: column;
    gap: var(--radio-group--gap);
    /* A fieldset is never narrower than its content on its own, so it would overflow a narrow column. */
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
    color: var(--color--neutral-text);
    font-family: inherit;
    font-size: var(--radio-group--font-size);
    line-height: 1.25;
  }

  /* Sizes */
  .radio-group[data-size="xs"] {
    --radio-group--font-size: 0.75rem;
  }
  .radio-group[data-size="lg"],
  .radio-group[data-size="xl"] {
    --radio-group--font-size: 1rem;
  }

  /* Parts */
  .radio-group > [data-slot="legend"] {
    margin-block-end: var(--radio-group--gap);
    padding: 0;
    font-weight: 500;
  }
  .radio-group > [data-slot="hint"],
  .radio-group > [data-slot="error"] {
    margin: 0;
  }
  .radio-group > [data-slot="hint"] {
    /* The text colour at 70%, which has 4.5:1 against the page, like the Input's placeholder. */
    color: color-mix(in srgb, currentColor 70%, transparent);
  }
  .radio-group > [data-slot="error"] {
    color: var(--color--error-text);
  }
  .radio-group > [data-slot="options"] {
    display: flex;
    flex-direction: column;
    /* Each radio is as wide as its label, so the space beside it doesn't select it. */
    align-items: flex-start;
    gap: var(--radio-group--gap);
  }

  /* Orientations. Side by side from 640px up, and stacked on narrower screens, like phones,
     as GOV.UK's inline radios are. They wrap onto the next line if the row runs out of room. */
  @media (min-width: 40rem) {
    .radio-group[data-orientation="horizontal"] > [data-slot="options"] {
      flex-flow: row wrap;
      column-gap: var(--radio-group--options--column-gap);
    }
  }
}
</style>
```
```vue [Radio.vue]
<script setup lang="ts">
import { inject, onMounted, ref, useAttrs, useTemplateRef } from "vue";
import { RadioGroupKey } from "./RadioGroup.vue";

export interface RadioProps {
  /** What the group's `v-model` holds, and its form submits, while this radio is checked. */
  value: string;
  /** Takes this one option away, while the others stay. Arrow keys skip it. */
  disabled?: boolean;
  /** Starts the group on this radio, when the group has no value yet. It hands the group its value, so `v-model`, the checked radio and the form agree, on the server too. Give it to one radio per group. */
  checked?: boolean;
}

// Attributes go on the <input> rather than on the root, so they're declared below.
defineOptions({ inheritAttrs: false });

const { value, disabled = false, checked = false } = defineProps<RadioProps>();

defineSlots<{
  /** The label, which names the radio and is part of what people can press to check it. */
  default?: () => unknown;
}>();

// The name, size, required state and checked value come from the group, so its radios
// can't disagree on them.
const group = inject(RadioGroupKey, undefined);

// A default answer becomes the group's value, rather than a checked radio the value
// doesn't know about, which would submit an answer while the bound value stays empty.
// A bound group only gets that value on its next render, so until it's mounted the
// radio checks itself, which is what the server renders and hydration matches.
const starting = ref(checked && group?.value === undefined);
if (starting.value) group?.select(value);

const attrs = useAttrs();
// Classes and styles go on the root, which lays out the row, so a class can set its
// variables. Everything else goes on the <input>: `id`, ARIA and listeners. Attrs aren't
// reactive, so these run on every render.
const onRoot = (key: string) => key === "class" || key === "style";
const rootAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => onRoot(key)));
const controlAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => !onRoot(key)));

const input = useTemplateRef<HTMLInputElement>("input");

// A ref to the Radio gets you the <input>, through `input`.
defineExpose({ input });

onMounted(() => {
  starting.value = false;
  if (import.meta.env.DEV && !group) {
    console.warn("[Radio] is outside a RadioGroup, so it has no name, legend or value to share: put it in one.", input.value);
  }
});
</script>

<template>
  <label class="radio" data-slot="radio" v-bind="rootAttrs()" :data-size="group?.size ?? 'md'">
    <!-- The <label> wraps the <input>, so it names the radio without an ID, and pressing
         anywhere on the row checks it. The browser does the rest: Tab stops once per
         group, the arrow keys move and check, and disabled radios are skipped. -->
    <input
      ref="input"
      data-slot="control"
      type="radio"
      :name="group?.name"
      :value="value"
      :checked="group ? group.value === value || (starting && group.value === undefined) : checked"
      :disabled="disabled"
      :required="group?.required"
      v-bind="controlAttrs()"
      @change="group?.select(value)"
    />
    <span data-slot="label"><slot /></span>
  </label>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The radio's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .radio {
    /* Set per size. The heights are the Input's, so a radio lines up with an input beside it. */
    --radio--height: 2.25rem;
    --radio--gap: 0.5rem;
    --radio--font-size: 0.875rem;
    /* The indicator is the size of the Input's icons. */
    --radio--indicator--size: 1rem;
    /* The text colour at 55%, which has 3:1 against the page, so people can see every option. */
    --radio--indicator--border-color: color-mix(in srgb, currentColor 55%, transparent);
    --radio--indicator--fill: transparent;
    --radio--dot--color: var(--color--primary-contrast);

    display: flex;
    align-items: center;
    gap: var(--radio--gap);
    box-sizing: border-box;
    /* A min-height rather than a height, so the row grows with larger text, or a label that wraps. */
    min-height: var(--radio--height);
    color: var(--color--neutral-text);
    font-size: var(--radio--font-size);
    line-height: 1.25;
    cursor: pointer;
  }

  /* Sizes */
  .radio[data-size="xs"] {
    --radio--height: 1.5rem;
    --radio--gap: 0.25rem;
    --radio--font-size: 0.75rem;
    --radio--indicator--size: 0.875rem;
  }
  .radio[data-size="sm"] {
    --radio--height: 2rem;
  }
  .radio[data-size="lg"] {
    --radio--height: 2.5rem;
    --radio--font-size: 1rem;
    --radio--indicator--size: 1.25rem;
  }
  .radio[data-size="xl"] {
    --radio--height: 3rem;
    --radio--font-size: 1rem;
    --radio--indicator--size: 1.25rem;
  }

  /* Parts. The control is the native radio, drawn as the indicator: a ring, filled
     with a dot once it's checked. */
  .radio > [data-slot="control"] {
    appearance: none;
    display: grid;
    flex-shrink: 0;
    place-content: center;
    box-sizing: border-box;
    width: var(--radio--indicator--size);
    height: var(--radio--indicator--size);
    margin: 0;
    border: 1px solid var(--radio--indicator--border-color);
    border-radius: 50%;
    background-color: var(--radio--indicator--fill);
    color: inherit;
    font: inherit;
    cursor: inherit;
  }
  .radio > [data-slot="control"]::before {
    content: "";
    width: calc(var(--radio--indicator--size) * 0.375);
    height: calc(var(--radio--indicator--size) * 0.375);
    border-radius: 50%;
    background-color: var(--radio--dot--color);
    scale: 0;
  }
  .radio > [data-slot="label"] {
    /* Long labels wrap beside the indicator rather than under it. */
    min-width: 0;
  }

  /* States. Each one reads the attribute that exposes it, on the <input> or on the
     group, so what people see and what assistive technologies report can't drift apart. */
  @media (hover: hover) {
    .radio:hover:where(:not(:has(> [data-slot="control"]:disabled))) {
      --radio--indicator--border-color: color-mix(in srgb, currentColor 80%, transparent);
    }
  }
  /* Checked is filled as well as dotted, so it differs from unchecked by more than a colour. */
  .radio:has(> [data-slot="control"]:checked) {
    --radio--indicator--border-color: var(--color--primary);
    --radio--indicator--fill: var(--color--primary);
  }
  .radio > [data-slot="control"]:checked::before {
    scale: 1;
  }
  .radio > [data-slot="control"]:focus-visible {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  /* The group's aria-invalid, which screen readers announce along with its error message. */
  .radio-group[aria-invalid="true"] .radio {
    --radio--indicator--border-color: var(--color--error-text);
  }
  .radio-group[aria-invalid="true"] .radio > [data-slot="control"] {
    /* A second pixel of border, drawn inside, so the indicator doesn't grow. */
    box-shadow: inset 0 0 0 1px var(--radio--indicator--border-color);
  }
  .radio:has(> [data-slot="control"]:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* On touch screens, each row is at least 44px tall, so a finger finds the right one. */
  @media (any-pointer: coarse) {
    .radio {
      min-height: max(var(--radio--height), 2.75rem);
    }
  }

  /* With more contrast, the ring is drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .radio,
    .radio:hover {
      --radio--indicator--border-color: currentColor;
    }
  }

  /* Forced colors mode drops backgrounds and shadows, which draw the dot, so the
     browser draws its own radio, in the user's colours. */
  @media (forced-colors: active) {
    .radio > [data-slot="control"] {
      appearance: auto;
    }
    .radio > [data-slot="control"]:focus-visible {
      outline-color: Highlight;
    }
    .radio:has(> [data-slot="control"]:disabled) {
      color: GrayText;
      opacity: 1;
    }
  }
}
</style>
```
```ts [RadioGroup.test.ts]
import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createSSRApp, h, nextTick, ref, type ComponentPublicInstance } from "vue";
import { renderToString } from "vue/server-renderer";
import Radio from "./Radio.vue";
import RadioGroup from "./RadioGroup.vue";

const radios = (disabled?: string) =>
  ["Standard", "Express", "Next day"].map((label) =>
    h(Radio, { value: label.toLowerCase(), disabled: label === disabled }, () => label),
  );

describe("RadioGroup", () => {
  it("is a group of native radios in a fieldset, named by its legend", () => {
    render(RadioGroup, { props: { name: "delivery", legend: "Delivery" }, slots: { default: () => radios() } });

    const group = screen.getByRole("radiogroup", { name: "Delivery" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group).not.toHaveAttribute("aria-describedby");
    expect(group.firstElementChild?.tagName).toBe("LEGEND");
    // Named outright by its legend, rather than left to each browser's fieldset naming.
    expect(group).toHaveAttribute("aria-labelledby", "delivery-legend");
    expect(group.firstElementChild).toHaveAttribute("id", "delivery-legend");
    const standard = within(group).getByRole("radio", { name: "Standard" });
    expect(standard.tagName).toBe("INPUT");
    expect(within(group).getAllByRole("radio").map((radio) => radio.getAttribute("name"))).toEqual(["delivery", "delivery", "delivery"]);
  });

  it("enters once with Tab, on the checked radio, and leaves on the next Tab", async () => {
    const user = userEvent.setup();
    render({
      render: () => [
        h(RadioGroup, { name: "delivery", legend: "Delivery", modelValue: "express" }, () => radios()),
        h("button", "Continue"),
      ],
    });

    await user.tab();
    expect(screen.getByRole("radio", { name: "Express" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Continue" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("radio", { name: "Express" })).toHaveFocus();
  });

  it("enters on the first radio with Tab when none is checked", async () => {
    const user = userEvent.setup();
    render(RadioGroup, { props: { name: "delivery", legend: "Delivery" }, slots: { default: () => radios() } });

    await user.tab();
    expect(screen.getByRole("radio", { name: "Standard" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Standard" })).not.toBeChecked();
  });

  it("moves, selects and wraps with the arrow keys", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(RadioGroup, {
      props: { name: "delivery", legend: "Delivery", modelValue: "standard", "onUpdate:modelValue": onUpdate },
      slots: { default: () => radios() },
    });
    const radio = (name: string) => screen.getByRole("radio", { name });

    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(radio("Express")).toHaveFocus();
    expect(radio("Express")).toBeChecked();
    await user.keyboard("{ArrowRight}");
    expect(radio("Next day")).toBeChecked();
    await user.keyboard("{ArrowDown}");
    expect(radio("Standard")).toHaveFocus();
    expect(radio("Standard")).toBeChecked();
    await user.keyboard("{ArrowUp}");
    expect(radio("Next day")).toBeChecked();
    await user.keyboard("{ArrowLeft}");
    expect(radio("Express")).toBeChecked();
    expect(radio("Next day")).not.toBeChecked();
    expect(onUpdate.mock.calls.map(([value]) => value)).toEqual(["express", "next day", "standard", "next day", "express"]);
  });

  it("selects the focused radio with Space", async () => {
    const user = userEvent.setup();
    render(RadioGroup, { props: { name: "delivery", legend: "Delivery" }, slots: { default: () => radios() } });

    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Standard" })).toBeChecked();
  });

  it("selects a radio when its label is pressed", async () => {
    const user = userEvent.setup();
    render(RadioGroup, { props: { name: "delivery", legend: "Delivery" }, slots: { default: () => radios() } });

    await user.click(screen.getByText("Next day"));
    expect(screen.getByRole("radio", { name: "Next day" })).toBeChecked();
  });

  it("skips a disabled radio with the arrow keys, and leaves it out of the form", async () => {
    const user = userEvent.setup();
    render({
      render: () =>
        h("form", [h(RadioGroup, { name: "delivery", legend: "Delivery", modelValue: "standard" }, () => radios("Express"))]),
    });

    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Express" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Next day" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Next day" })).toBeChecked();
    await user.click(screen.getByText("Express"));
    expect(screen.getByRole("radio", { name: "Express" })).not.toBeChecked();
  });

  it("disables every radio while the group is disabled, and its form leaves them out", async () => {
    const user = userEvent.setup();
    render({
      render: () =>
        h("form", [
          h(RadioGroup, { name: "delivery", legend: "Delivery", modelValue: "standard", disabled: true }, () => radios()),
        ]),
    });

    await user.tab();
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
      expect(radio).not.toHaveFocus();
    }
    expect(new FormData(screen.getByRole("radiogroup").closest("form")!).has("delivery")).toBe(false);
  });

  it("submits the checked value with its form, under its name", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render({
      render: () =>
        h("form", { onSubmit }, [
          h(RadioGroup, { name: "delivery", legend: "Delivery" }, () => radios()),
          h("button", { type: "submit" }, "Continue"),
        ]),
    });

    await user.click(screen.getByRole("radio", { name: "Express" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    const form = onSubmit.mock.calls[0]![0].target as HTMLFormElement;
    expect(new FormData(form).get("delivery")).toBe("express");
  });

  it("marks every radio required while the group is, so its form can't be sent without one", () => {
    render({
      render: () => h("form", [h(RadioGroup, { name: "delivery", legend: "Delivery", required: true }, () => radios())]),
    });

    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeRequired();
    expect(screen.getByRole("radiogroup").closest("form")!.checkValidity()).toBe(false);
  });

  it("binds its value with v-model, both ways", async () => {
    const user = userEvent.setup();
    const delivery = ref<string | undefined>("standard");
    render({
      render: () =>
        h(
          RadioGroup,
          {
            name: "delivery",
            legend: "Delivery",
            modelValue: delivery.value,
            "onUpdate:modelValue": (value: string | undefined) => (delivery.value = value),
          },
          () => radios(),
        ),
    });

    expect(screen.getByRole("radio", { name: "Standard" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "Next day" }));
    expect(delivery.value).toBe("next day");

    delivery.value = "express";
    await nextTick();
    expect(screen.getByRole("radio", { name: "Express" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Next day" })).not.toBeChecked();
  });

  it("hands the group the value of a radio given checked, when it has none, so its value and its form agree", async () => {
    const user = userEvent.setup();
    const delivery = ref<string>();
    const rows = () => [
      h(Radio, { value: "standard", checked: true }, () => "Standard"),
      h(Radio, { value: "express" }, () => "Express"),
    ];
    render({
      render: () => [
        h(RadioGroup, { name: "delivery", legend: "Delivery" }, rows),
        h(
          RadioGroup,
          {
            name: "shipping",
            legend: "Shipping",
            modelValue: delivery.value,
            "onUpdate:modelValue": (value: string | undefined) => (delivery.value = value),
          },
          rows,
        ),
      ],
    });
    const [ownStandard, ownExpress, boundStandard, boundExpress] = screen.getAllByRole("radio");

    expect(ownStandard).toBeChecked();
    await user.click(ownExpress!);
    expect(ownExpress).toBeChecked();
    expect(ownStandard).not.toBeChecked();

    expect(boundStandard).toBeChecked();
    expect(delivery.value).toBe("standard");
    delivery.value = "express";
    await nextTick();
    expect(boundExpress).toBeChecked();
    expect(boundStandard).not.toBeChecked();
    delivery.value = "standard";
    await nextTick();
    expect(boundStandard).toBeChecked();
    expect(boundExpress).not.toBeChecked();
    delivery.value = undefined;
    await nextTick();
    expect(boundStandard).not.toBeChecked();
  });

  it("renders the radio given checked as checked on the server, bound or not, so it shows and submits before hydration", async () => {
    const rows = () => [
      h(Radio, { value: "standard", checked: true }, () => "Standard"),
      h(Radio, { value: "express" }, () => "Express"),
    ];
    const checkedValues = (html: string) => [...html.matchAll(/value="(\w+)"[^>]*checked/g)].map(([, value]) => value);

    const own = await renderToString(createSSRApp({ render: () => h(RadioGroup, { name: "delivery", legend: "Delivery" }, rows) }));
    expect(checkedValues(own)).toEqual(["standard"]);

    const bound = await renderToString(
      createSSRApp({
        render: () =>
          h(RadioGroup, { name: "delivery", legend: "Delivery", modelValue: undefined, "onUpdate:modelValue": () => {} }, rows),
      }),
    );
    expect(checkedValues(bound)).toEqual(["standard"]);
  });

  it("keeps its own value without v-model", async () => {
    const user = userEvent.setup();
    render(RadioGroup, { props: { name: "delivery", legend: "Delivery" }, slots: { default: () => radios() } });

    await user.click(screen.getByRole("radio", { name: "Express" }));
    await user.click(screen.getByRole("radio", { name: "Standard" }));
    expect(screen.getByRole("radio", { name: "Standard" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Express" })).not.toBeChecked();
  });

  it("describes the group with its hint, and with its error, which makes it invalid, only while it has one", async () => {
    const { rerender } = render(RadioGroup, {
      props: { name: "delivery", legend: "Delivery", hint: "Express arrives the next working day" },
      slots: { default: () => radios() },
    });

    const group = screen.getByRole("radiogroup", { name: "Delivery" });
    expect(group).toHaveAttribute("aria-describedby", "delivery-hint");
    expect(group).toHaveAccessibleDescription("Express arrives the next working day");
    expect(group).not.toHaveAttribute("aria-invalid");

    await rerender({ error: "Choose how you'd like your order delivered" });
    expect(screen.getByRole("radiogroup", { name: "Delivery" })).toBe(group);
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-describedby", "delivery-hint delivery-error");
    expect(group).toHaveAccessibleDescription("Express arrives the next working day Choose how you'd like your order delivered");
    for (const radio of screen.getAllByRole("radio")) expect(radio).not.toHaveAttribute("aria-invalid");

    await rerender({ error: undefined });
    expect(group).not.toHaveAttribute("aria-invalid");
    expect(group).toHaveAccessibleDescription("Express arrives the next working day");
  });

  it("puts the group's attributes on its fieldset, and a radio's on its input, with its classes on its root", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const instance = ref<ComponentPublicInstance<{ input: HTMLInputElement }>>();
    render(RadioGroup, {
      props: { name: "delivery", legend: "Delivery" },
      attrs: { class: "delivery", "data-testid": "delivery" },
      slots: {
        default: () =>
          h(Radio, { ref: instance, value: "standard", class: "standard", "aria-describedby": "standard-hint", onFocus }, () => "Standard"),
      },
    });

    const group = screen.getByRole("radiogroup", { name: "Delivery" });
    expect(group).toHaveClass("radio-group", "delivery");
    expect(group).toHaveAttribute("data-testid", "delivery");

    const radio = screen.getByRole("radio", { name: "Standard" });
    await user.tab();
    expect(radio).toHaveAttribute("aria-describedby", "standard-hint");
    expect(radio).not.toHaveClass("standard");
    expect(radio.closest("label")).toHaveClass("radio", "standard");
    expect(onFocus).toHaveBeenCalled();
    expect(instance.value?.input).toBe(radio);
  });

  it("mirrors its size as a data attribute, on the group and on every radio", () => {
    const { container } = render(RadioGroup, {
      props: { name: "delivery", legend: "Delivery", size: "lg" },
      slots: { default: () => radios() },
    });

    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
    for (const radio of container.querySelectorAll(".radio")) expect(radio).toHaveAttribute("data-size", "lg");
  });

  it("mirrors its orientation as a data attribute, keeps its radios in their own part, and never sets aria-orientation", async () => {
    const { rerender } = render(RadioGroup, {
      props: { name: "contact", legend: "Can we contact you?", hint: "We only call about your order" },
      slots: {
        default: () => [h(Radio, { value: "yes" }, () => "Yes"), h(Radio, { value: "no" }, () => "No")],
      },
    });

    const group = screen.getByRole("radiogroup", { name: "Can we contact you?" });
    expect(group).toHaveAttribute("data-orientation", "vertical");
    await rerender({ orientation: "horizontal" });
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).not.toHaveAttribute("aria-orientation");
    // The radios sit in a box of their own, so a row of them leaves the hint above.
    const options = group.querySelector('[data-slot="options"]')!;
    expect(within(options as HTMLElement).getAllByRole("radio")).toHaveLength(2);
    expect(options.contains(screen.getByText("We only call about your order"))).toBe(false);
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const options = {
      props: { name: "delivery", legend: "Delivery", hint: "Express arrives the next working day" },
      slots: { default: () => radios() },
    };
    const first = render(RadioGroup, options).container.innerHTML;
    const { container, rerender } = render(RadioGroup, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["legend", "hint", "options"]);
    const box = root.querySelector('[data-slot="options"]')!;
    expect([...box.children].map((part) => part.getAttribute("data-slot"))).toEqual(["radio", "radio", "radio"]);
    const radio = root.querySelector(".radio")!;
    expect([...radio.children].map((part) => part.getAttribute("data-slot"))).toEqual(["control", "label"]);

    const inputs = [...root.querySelectorAll("input")];
    await rerender({ error: "Choose how you'd like your order delivered", disabled: true, modelValue: "express" });
    expect(container.firstElementChild).toBe(root);
    expect([...root.querySelectorAll("input")]).toEqual(inputs);
    expect(parts()).toEqual(["legend", "hint", "error", "options"]);
  });

  it("warns in development when the group has no legend, or a radio has no group", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(RadioGroup, { props: { name: "delivery", legend: "" }, slots: { default: () => radios() } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no legend"), expect.anything());

    warn.mockClear();
    render(Radio, { props: { value: "standard" }, slots: { default: () => "Standard" } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("outside a RadioGroup"), expect.anything());

    warn.mockClear();
    render(RadioGroup, { props: { name: "delivery", legend: "Delivery" }, slots: { default: () => radios() } });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
```
:::
::

## Sources

- [WAI-ARIA Authoring Practices: Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), for the keyboard
- [WAI-ARIA 1.2: `aria-invalid`](https://www.w3.org/TR/wai-aria-1.2/#aria-invalid) and [`radiogroup`](https://www.w3.org/TR/wai-aria-1.2/#radiogroup), for the roles `aria-invalid` is supported on
- [HTML Accessibility API Mappings: fieldset accessible name computation](https://www.w3.org/TR/html-aam-1.0/#fieldset-element-accessible-name-computation), for naming a fieldset from its legend whatever its role, which `aria-labelledby` backs up
- [HTML Standard: the radio button state](https://html.spec.whatwg.org/multipage/input.html#radio-button-state-(type=radio)) and [the fieldset element](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element)
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 3.2.2: On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html), for not acting on a change
- [WAI Forms Tutorial: Grouping Controls](https://www.w3.org/WAI/tutorials/forms/grouping/), for fieldsets and legends
- [GOV.UK Design System: Radios](https://design-system.service.gov.uk/components/radios/) and [Error message](https://design-system.service.gov.uk/components/error-message/), for stacking options, setting two short ones side by side and stacking them again on small screens, defaults and where the error message goes
- [Base UI: Radio Group](https://base-ui.com/react/components/radio), for radios as children that share the group's value
