---
title: Input
description: How to build a text input that people can label, fill in and fix, that works with every keyboard, autofill and password manager, and that agents can check.
navigation:
  title: Overview
---

Inputs are where people tell you things, like their name, their email address or what they're looking for. They look like the simplest component there is, a box with a border, which is why they're so often built in a hurry. Think of a placeholder that stands in for a label and disappears as soon as you type, a phone keyboard without an `@` on it, a password field that won't let you paste, or a red border that doesn't say what's wrong.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/input/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How an input looks, from its parts and sizes to its icons, prefixes, actions, states, width and tokens.
:::

:::card{to="/docs/components/input/ux" icon="i-lucide-user" title="User Experience (UX)"}
How an input behaves for every person, input and setting, so it's accessible, predictable, clear in every state and adaptive.
:::

:::card{to="/docs/components/input/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Input, with one consistent, typed API that works with any form and other components, whether its value is bound or not.
:::

:::card{to="/docs/components/input/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, fill in and check an input, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/input#reference-implementation), which does its part of every rule in the [checklist](/docs/components/input#checklist), so feel free to type into them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for an Input with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/input/ax#deterministic).

The Input is the box you type in. Its label, hint and error message are elements of their own, which you link to it by ID, and the [Field](/docs/components/field) puts them together for you. The examples on this page link them with a plain `<label>`, so you can see the markup the Field writes, and the rules hold either way.

::input-playground
::

| Aspect   | Input                                                                                          |
| -------- | ---------------------------------------------------------------------------------------------- |
| Element  | `<input>`, inside a `<div>` that draws the field                                               |
| Role     | `textbox`, or `searchbox` with `type="search"`, while ARIA has no role for a password input    |
| Name     | Its `<label>`, linked with `for`, and never its placeholder                                    |
| Keyboard | The browser's own text editing, `Tab` on to its actions, and `Enter` to submit its form        |
| States   | Hover, focus, disabled, read-only and invalid                                                  |
| Types    | `text`, `email`, `password`, `search`, `tel` and `url`                                         |
| Sizes    | `xs`, `sm`, `md`, `lg` and `xl`, with the same heights as the Button                           |
| Pattern  | None in the APG, since a native [`<input>`](https://html.spec.whatwg.org/multipage/input.html) covers it |
| WCAG 2.2 | 1.3.1, 1.3.5, 1.4.3, 1.4.11, 2.4.7, 2.5.8, 3.3.1, 3.3.2, 3.3.3, 3.3.8 and 4.1.2, among others  |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. An input meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Input itself, so they're the ones to check when you build or review one. **Usage** rules are met by the forms that use it, like giving every input a label, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like an invalid input: the Input looks invalid from `aria-invalid`, as long as you set it when the error message shows.

The basis says where a rule comes from. About half the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and a few come from **HTML**. The rest are **Open Components** rules, which are our own, like checking a value when people leave the input rather than while they type. Where a rule goes further than WCAG asks at level AA, its basis says so: some come from level **AAA**, like the 44px hit area on touch screens, and a rule that asks for more than its criterion says **beyond**, like using a native `<input>`, where WCAG would let you rebuild one by hand.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/input/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/input/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/input/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/input/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves. It reads the same theme tokens as the Button, so copy [`tokens.css`](/docs/components/button#reference-implementation) from the Button's reference implementation into your theme too.

The tests are in `Input.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [Input.vue]
<script setup lang="ts">
import { onMounted, useAttrs, useTemplateRef } from "vue";

export interface InputProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** The kind of text it takes, which picks the keyboard on phones. The other input types each get a component of their own. */
  type?: "text" | "email" | "password" | "search" | "tel" | "url";
  disabled?: boolean;
}

// Attributes go on the <input> rather than on the root, so they're declared below.
defineOptions({ inheritAttrs: false });

const { size = "md", type = "text", disabled = false } = defineProps<InputProps>();

/** The value, which `v-model` binds. Without it, the input keeps its own, and its form submits it. */
const model = defineModel<string>();

defineSlots<{
  /** An icon or a prefix before the value, like a currency. */
  leading?: () => unknown;
  /** An icon or a suffix after the value, like a unit. */
  trailing?: () => unknown;
  /** Buttons that act on the value, like Show password, which Tab reaches after the input. */
  actions?: () => unknown;
}>();

const attrs = useAttrs();
// Classes and styles go on the root, which draws the field, so a class can set its
// variables. Everything else goes on the <input>: `id`, `name`, `autocomplete`, ARIA
// and listeners. Attrs aren't reactive, so these run on every render.
const onRoot = (key: string) => key === "class" || key === "style";
const rootAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => onRoot(key)));
const controlAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => !onRoot(key)));

const input = useTemplateRef<HTMLInputElement>("input");

// The template shows the model, or the `value` attribute while there's none, so an
// input without `v-model`, like a read-only one, can still start with a value.
function onInput(event: Event) {
  model.value = (event.target as HTMLInputElement).value;
}

// A press on the field's icons or padding focuses the input, as a press on the input
// would. It's on mousedown, so an input that already has focus keeps it, without a
// blur that would run its validation.
function onMousedown(event: MouseEvent) {
  const target = event.target as Element;
  // The input itself, and the buttons in `actions`, do what they always do.
  if (target.closest("input, button, a[href], select, textarea, [tabindex]")) return;
  event.preventDefault();
  input.value?.focus();
}

// A ref to the Input gets you the <input>, through `input`.
defineExpose({ input });

onMounted(() => {
  if (import.meta.env.DEV) {
    const el = input.value;
    const named = el?.labels?.length || el?.hasAttribute("aria-label") || el?.hasAttribute("aria-labelledby");
    if (el && !named) {
      console.warn("[Input] has no accessible name: give it a <label for>, or an aria-label for a search.", el);
    }
  }
});
</script>

<template>
  <div class="input" v-bind="rootAttrs()" :data-size="size" @mousedown="onMousedown">
    <span v-if="$slots.leading" data-slot="leading" aria-hidden="true">
      <slot name="leading" />
    </span>
    <input
      ref="input"
      data-slot="control"
      :type="type"
      :disabled="disabled"
      v-bind="controlAttrs()"
      :value="model ?? $attrs.value"
      @input="onInput"
    />
    <span v-if="$slots.trailing" data-slot="trailing" aria-hidden="true">
      <slot name="trailing" />
    </span>
    <span v-if="$slots.actions" data-slot="actions">
      <slot name="actions" />
    </span>
  </div>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The input's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .input {
    /* Set per size. The heights are the Button's, so an input and a button line up in a row. */
    --input--height: 2.25rem;
    --input--padding: 0.75rem;
    --input--gap: 0.5rem;
    --input--font-size: 0.875rem;
    --input--icon--size: 1rem;
    --input--radius: 0.5rem;
    /* The text colour at 55%, which has 3:1 against the page, so people can see where to type. */
    --input--border-color: color-mix(in srgb, currentColor 55%, transparent);

    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    /* A min-height rather than a height, so the field grows with larger text. */
    min-height: var(--input--height);
    /* In a flex row, it can get narrower than an <input> is on its own, rather than overflow. */
    min-width: 0;
    border: 1px solid var(--input--border-color);
    border-radius: var(--input--radius);
    background-color: transparent;
    color: var(--color--neutral-text);
    font-family: inherit;
    font-size: var(--input--font-size);
    line-height: 1.25;
    cursor: text;
  }

  /* Sizes */
  .input[data-size="xs"] {
    --input--height: 1.5rem;
    --input--padding: 0.5rem;
    --input--gap: 0.25rem;
    --input--font-size: 0.75rem;
    --input--icon--size: 0.875rem;
    --input--radius: 0.375rem;
  }
  .input[data-size="sm"] {
    --input--height: 2rem;
    --input--padding: 0.625rem;
    --input--radius: 0.375rem;
  }
  .input[data-size="lg"] {
    --input--height: 2.5rem;
    --input--padding: 0.875rem;
    --input--font-size: 1rem;
    --input--icon--size: 1.25rem;
  }
  .input[data-size="xl"] {
    --input--height: 3rem;
    --input--padding: 1rem;
    --input--font-size: 1rem;
    --input--icon--size: 1.25rem;
    --input--radius: 0.75rem;
  }

  /* Parts. The control fills the field, with the same padding on both sides, since it
     can run in another direction than the field, like an email address in Arabic. */
  .input > [data-slot="control"] {
    flex: 1;
    align-self: stretch;
    min-width: 0;
    box-sizing: border-box;
    margin: 0;
    padding: 0 var(--input--padding);
    border: 0;
    /* So the browser's autofill colour follows the field's rounded corners. */
    border-radius: calc(var(--input--radius) - 1px);
    background-color: transparent;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    /* The root draws the focus ring, around the whole field. */
    outline: none;
  }
  .input > [data-slot="control"]::placeholder {
    /* The text colour at 70%, which has 4.5:1 against the page. Firefox lowers its opacity on its own. */
    color: color-mix(in srgb, currentColor 70%, transparent);
    opacity: 1;
  }
  .input > [data-slot="leading"],
  .input > [data-slot="trailing"] {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    /* Prefixes and suffixes, like a currency or a unit, at the placeholder's 4.5:1. */
    color: color-mix(in srgb, currentColor 70%, transparent);
    white-space: nowrap;
  }
  /* Icons take the icon size, and text, like a currency, the input's own. */
  .input > [data-slot] > :slotted(svg) {
    flex-shrink: 0;
    width: var(--input--icon--size);
    height: var(--input--icon--size);
  }
  .input > [data-slot="actions"] {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.25rem;
    cursor: auto;
  }
  /* The parts beside the control overlap its padding, down to the gap. */
  .input > [data-slot="leading"] {
    margin-inline-end: calc(var(--input--gap) - var(--input--padding));
    padding-inline-start: var(--input--padding);
  }
  .input > [data-slot="control"] + [data-slot] {
    margin-inline-start: calc(var(--input--gap) - var(--input--padding));
  }
  .input > [data-slot="trailing"] + [data-slot="actions"] {
    padding-inline-start: var(--input--gap);
  }
  .input > [data-slot="trailing"]:last-child {
    padding-inline-end: var(--input--padding);
  }
  /* Buttons sit closer to the edge, since they have padding of their own. */
  .input > [data-slot="actions"] {
    padding-inline-end: calc(var(--input--padding) / 2);
  }

  /* The browser's own clear button can't be reached with the keyboard, and only some
     browsers draw one, so a search input leaves it out. Put a Button in `actions` instead. */
  .input > [data-slot="control"]::-webkit-search-cancel-button {
    appearance: none;
  }
  /* Edge draws its own Show password button, so leave it out when there's one in `actions`. */
  .input:has(> [data-slot="actions"]) > [data-slot="control"]::-ms-reveal {
    display: none;
  }

  /* States. Each one reads the attribute on the <input> that exposes it, so what people
     see and what assistive technologies report can't drift apart. :invalid isn't one of
     them: it matches a required input before anyone has typed in it. */
  @media (hover: hover) {
    .input:hover:where(:not(:has(> [data-slot="control"]:is(:disabled, [readonly])))) {
      --input--border-color: color-mix(in srgb, currentColor 80%, transparent);
    }
  }
  .input:has(> [data-slot="control"]:focus-visible) {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  .input:has(> [data-slot="control"][readonly]) {
    /* Dashed, so it reads as something you can't change, while the value keeps its contrast. */
    border-style: dashed;
    cursor: default;
  }
  .input:has(> [data-slot="control"][aria-invalid="true"]) {
    --input--border-color: var(--color--error-text);
    /* A second pixel of border, drawn inside, so the field doesn't grow. */
    box-shadow: inset 0 0 0 1px var(--input--border-color);
  }
  .input:has(> [data-slot="control"]:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .input > [data-slot="control"]:disabled {
    cursor: inherit;
  }

  /* On touch screens, the text is at least 16px, or Safari on iOS zooms in when the
     input gets focus, and the input reaches past the field to a hit area at least 44px
     tall, with a transparent border that the browser's autofill colour doesn't paint. */
  @media (any-pointer: coarse) {
    .input {
      font-size: max(var(--input--font-size), 1rem);
    }
    .input > [data-slot="control"] {
      margin-block: min(0px, (var(--input--height) - 2.75rem) / 2 - 1px);
      border-block: max(0px, (2.75rem - var(--input--height)) / 2 + 1px) solid transparent;
      background-clip: padding-box;
    }
  }

  /* With more contrast, the border is drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .input,
    .input:hover {
      --input--border-color: currentColor;
    }
  }

  /* Forced colors mode keeps borders but drops shadows, so mark states with system colours. */
  @media (forced-colors: active) {
    .input:has(> [data-slot="control"]:focus-visible) {
      outline-color: Highlight;
    }
    .input:has(> [data-slot="control"]:disabled) {
      border-color: GrayText;
      color: GrayText;
      opacity: 1;
    }
  }
}
</style>
```
```ts [Input.test.ts]
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import Input from "./Input.vue";

const icon = () => h("svg");
const label = (id: string, text: string) => h("label", { for: id }, text);

describe("Input", () => {
  it("is a native input, found by its role and its label", () => {
    render({ render: () => [label("email", "Email address"), h(Input, { id: "email", type: "email" })] });

    const input = screen.getByRole("textbox", { name: "Email address" });
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("type", "email");
  });

  it("is a searchbox with type search, and found by its label with type password", () => {
    render({
      render: () => [
        h(Input, { type: "search", "aria-label": "Search" }),
        label("password", "Password"),
        h(Input, { id: "password", type: "password" }),
      ],
    });

    expect(screen.getByRole("searchbox", { name: "Search" })).toBeInTheDocument();
    // ARIA has no role for a password input, so it's found by its label alone.
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("puts attributes, listeners and refs on the input, and classes on its root", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const instance = ref<ComponentPublicInstance<{ input: HTMLInputElement }>>();
    render({
      render: () => [
        label("postcode", "Postcode"),
        h(Input, { ref: instance, id: "postcode", class: "postcode", name: "postcode", autocomplete: "postal-code", onFocus }),
      ],
    });

    const input = screen.getByRole("textbox", { name: "Postcode" });
    await user.tab();
    expect(input).toHaveAttribute("name", "postcode");
    expect(input).toHaveAttribute("autocomplete", "postal-code");
    expect(input).not.toHaveClass("postcode");
    expect(input.parentElement).toHaveClass("input", "postcode");
    expect(onFocus).toHaveBeenCalled();
    expect(instance.value?.input).toBe(input);
  });

  it("binds its value with v-model, or keeps its own without it", async () => {
    const user = userEvent.setup();
    const email = ref("ada@");
    render({
      render: () => [
        h(Input, {
          "aria-label": "Bound",
          modelValue: email.value,
          "onUpdate:modelValue": (value: string | undefined) => (email.value = value ?? ""),
        }),
        h(Input, { "aria-label": "Unbound" }),
      ],
    });

    const bound = screen.getByRole("textbox", { name: "Bound" });
    await user.type(bound, "example.com");
    expect(email.value).toBe("ada@example.com");
    email.value = "";
    await nextTick();
    expect(bound).toHaveValue("");

    const unbound = screen.getByRole("textbox", { name: "Unbound" });
    await user.type(unbound, "Ada");
    expect(unbound).toHaveValue("Ada");
  });

  it("is submitted with its form, by its name, and submits it on Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render({
      render: () =>
        h("form", { onSubmit }, [
          label("email", "Email address"),
          h(Input, { id: "email", name: "email", type: "email" }),
          h("button", { type: "submit" }, "Subscribe"),
        ]),
    });

    await user.type(screen.getByRole("textbox", { name: "Email address" }), "ada@example.com{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const form = onSubmit.mock.calls[0]![0].target as HTMLFormElement;
    expect(new FormData(form).get("email")).toBe("ada@example.com");
  });

  it("keeps the browser's text editing keys, and lets people paste", async () => {
    const user = userEvent.setup();
    render({ render: () => [label("name", "Full name"), h(Input, { id: "name" })] });

    const input = screen.getByRole("textbox", { name: "Full name" });
    await user.tab();
    await user.keyboard("Lovelace{Home}Ada ");
    expect(input).toHaveValue("Ada Lovelace");

    await user.clear(input);
    await user.paste("Ada Lovelace");
    expect(input).toHaveValue("Ada Lovelace");
  });

  it("can't be focused or edited while disabled, and its form leaves it out", async () => {
    const user = userEvent.setup();
    render({
      render: () =>
        h("form", [
          label("username", "Username"),
          h(Input, { id: "username", name: "username", value: "ada", disabled: true }),
        ]),
    });

    const input = screen.getByRole("textbox", { name: "Username" });
    await user.tab();
    await user.type(input, "lovelace");
    expect(input).toBeDisabled();
    expect(input).not.toHaveFocus();
    expect(input).toHaveValue("ada");
    expect(new FormData(input.closest("form")!).has("username")).toBe(false);
  });

  it("passes aria-invalid and its error message to the input", () => {
    render({
      render: () => [
        label("email", "Email address"),
        h(Input, { id: "email", "aria-invalid": "true", "aria-describedby": "email-error" }),
        h("p", { id: "email-error" }, "Enter an email address, like name@example.com"),
      ],
    });

    const input = screen.getByRole("textbox", { name: "Email address" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter an email address, like name@example.com");
  });

  it("hides its prefix and suffix from assistive technologies, but not its actions", () => {
    const { container } = render(Input, {
      attrs: { "aria-label": "Price, in US dollars" },
      slots: { leading: () => "$", trailing: () => "USD", actions: () => h("button", "Clear") },
    });

    const part = (name: string) => container.querySelector(`[data-slot="${name}"]`);
    expect(part("leading")).toHaveAttribute("aria-hidden", "true");
    expect(part("trailing")).toHaveAttribute("aria-hidden", "true");
    expect(part("actions")).not.toHaveAttribute("aria-hidden");
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("reaches its actions with Tab, after the input", async () => {
    const user = userEvent.setup();
    render(Input, {
      attrs: { "aria-label": "Search" },
      props: { type: "search" },
      slots: { actions: () => h("button", { type: "button" }, "Clear search") },
    });

    await user.tab();
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Clear search" })).toHaveFocus();
  });

  it("focuses the input when its icons or padding are pressed, without a blur", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    const { container } = render(Input, {
      attrs: { "aria-label": "Search", onBlur },
      props: { type: "search" },
      slots: { leading: icon },
    });

    const input = screen.getByRole("searchbox", { name: "Search" });
    await user.click(container.querySelector('[data-slot="leading"]')!);
    expect(input).toHaveFocus();
    await user.click(container.querySelector(".input")!);
    expect(input).toHaveFocus();
    expect(onBlur).not.toHaveBeenCalled();
  });

  it("mirrors its size as a data attribute", () => {
    const { container } = render(Input, { attrs: { "aria-label": "Search" }, props: { size: "lg" } });

    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const options = {
      attrs: { "aria-label": "Price, in US dollars" },
      slots: { leading: () => "$", trailing: () => "USD", actions: () => h("button", "Clear") },
    };
    const first = render(Input, options).container.innerHTML;
    const { container, rerender } = render(Input, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["leading", "control", "trailing", "actions"]);

    const input = root.querySelector("input");
    await rerender({ disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect(root.querySelector("input")).toBe(input);
    expect(parts()).toEqual(["leading", "control", "trailing", "actions"]);
  });

  it("warns in development when it has no label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Input);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render({ render: () => [label("name", "Full name"), h(Input, { id: "name" })] });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
```
:::
::

## Sources

- [HTML Standard: the input element](https://html.spec.whatwg.org/multipage/input.html), [implicit submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission) and [autofill](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), and its list of [input purposes](https://www.w3.org/TR/WCAG22/#input-purposes)
- [Understanding SC 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), for the borders of text inputs
- [Understanding SC 3.3.8: Accessible Authentication (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html), for pasting and password managers
- [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/), for labels, instructions and validation
- [GOV.UK Design System: Text input](https://design-system.service.gov.uk/components/text-input/) and [Error message](https://design-system.service.gov.uk/components/error-message/), for widths, prefixes and error messages
- [GOV.UK: Why the GOV.UK Design System team changed the input type for numbers](https://technology.blog.gov.uk/2020/02/24/why-the-gov-uk-design-system-team-changed-the-input-type-for-numbers/)
- [Primer: Text input](https://primer.style/product/components/text-input/), for leading and trailing visuals and actions
- [Base UI: Input](https://base-ui.com/react/components/input) and [Field](https://base-ui.com/react/components/field), for keeping the control apart from its label
