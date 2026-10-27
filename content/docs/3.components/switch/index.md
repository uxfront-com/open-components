---
title: Switch
description: How to build a switch that turns a setting on or off right away, that everyone can see, label and flip, and that agents can check.
navigation:
  title: Overview
---

Switches turn a setting on or off, like Wi-Fi, dark mode or email notifications, and the change happens as soon as you flip one. They're small and familiar, which is why they're so easy to get wrong. Think of a switch whose only difference between on and off is its colour, a label that flips between "On" and "Off" so you can't tell what the setting is, or a switch in a form that does nothing until you find the Save button at the bottom.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/switch/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a switch looks, from its parts and sizes to its states and tokens.
:::

:::card{to="/docs/components/switch/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a switch behaves for every person, input and setting, so it's accessible, predictable, clear in every state and adaptive.
:::

:::card{to="/docs/components/switch/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Switch, with one consistent, typed API that works with your forms and leaves its state to you or the browser.
:::

:::card{to="/docs/components/switch/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, build and check a switch, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/switch#reference-implementation), which does its part of every rule in the [checklist](/docs/components/switch#checklist), so feel free to flip them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Switch with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/switch/ax#deterministic).

The Switch is the control you flip. Its label, hint and error message are elements of their own, which you link to it by ID, just like the [Input](/docs/components/input)'s, and a Field component, which is on our [Roadmap](/docs/getting-started/roadmap), will put them together for you. Until then, the examples do it with a plain `<label>`, and the rules hold either way.

::switch-playground
::

| Aspect   | Switch                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------- |
| Element  | `<input type="checkbox">`, inside a `<span>` with the track and the thumb                       |
| Role     | `switch`, which screen readers announce as on or off                                            |
| Name     | Its `<label>`, linked with `for`, which names the setting and never changes                     |
| Keyboard | `Space` to flip it, and `Tab` to move on                                                        |
| States   | Off and on, hover, focus, disabled, read-only and invalid                                       |
| Sizes    | `xs`, `sm`, `md`, `lg` and `xl`, the same names as the Input and the Button                     |
| Pattern  | [APG Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/), on a native checkbox            |
| WCAG 2.2 | 1.3.1, 1.4.1, 1.4.11, 2.1.1, 2.3.3, 2.4.7, 2.5.8, 3.2.2, 3.3.1 and 4.1.2, among others          |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A switch meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Switch itself, so they're the ones to check when you build or review one. **Usage** rules are met by the screens that use it, like giving every switch a label that names its setting, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like an invalid switch: the Switch looks invalid from `aria-invalid`, as long as you set it when the error message shows.

The basis says where a rule comes from. About half the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and a few come from **HTML**, **WAI-ARIA** and the **APG**. The rest are **Open Components** rules, which are our own, like applying a setting as soon as the switch is flipped. Where a rule goes further than WCAG asks at level AA, its basis says so: some come from level **AAA**, like the 44 × 44px hit area on touch screens, and a rule that asks for more than its criterion says **beyond**, like using a native checkbox, where WCAG would let you rebuild one by hand.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/switch/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/switch/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/switch/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/switch/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves. It reads the same theme tokens as the Button, so copy [`tokens.css`](/docs/components/button#reference-implementation) from the Button's reference implementation into your theme too.

The tests are in `Switch.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [Switch.vue]
<script setup lang="ts">
import { onMounted, useAttrs, useTemplateRef } from "vue";

export interface SwitchProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  /** Shows a setting people can see and focus, but not change. A checkbox has no `readonly` of its own, so the Switch blocks the flip and sets `aria-readonly`. */
  readonly?: boolean;
}

// Attributes go on the <input> rather than on the root, so they're declared below.
defineOptions({ inheritAttrs: false });

const { size = "md", disabled = false, readonly = false } = defineProps<SwitchProps>();

/** Whether it's on, which `v-model:checked` binds. Without it, the switch keeps its own state, and its form submits it while it's on. */
const checked = defineModel<boolean>("checked", { default: false });

const attrs = useAttrs();
// Classes and styles go on the root, which sizes the switch, so a class can set its
// variables. Everything else goes on the <input>: `id`, `name`, `value`, ARIA and
// listeners. Attrs aren't reactive, so these run on every render.
const onRoot = (key: string) => key === "class" || key === "style";
const rootAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => onRoot(key)));
const controlAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => !onRoot(key)));

const input = useTemplateRef<HTMLInputElement>("input");

function onChange(event: Event) {
  checked.value = (event.target as HTMLInputElement).checked;
}

// Space and a click on the label both click the <input>, so cancelling the click keeps a
// read-only switch as it is, without a change event. It still takes focus, and its form
// still sends it, unlike a disabled one.
function onClick(event: MouseEvent) {
  if (readonly) event.preventDefault();
}

// A ref to the Switch gets you the <input>, through `input`.
defineExpose({ input });

onMounted(() => {
  if (import.meta.env.DEV) {
    const el = input.value;
    const named = el?.labels?.length || el?.hasAttribute("aria-label") || el?.hasAttribute("aria-labelledby");
    if (el && !named) {
      console.warn("[Switch] has no accessible name: give it a <label for> that names the setting.", el);
    }
  }
});
</script>

<template>
  <span class="switch" v-bind="rootAttrs()" :data-size="size">
    <!-- A native checkbox, so Space, the label, forms and autofill work as they always do.
         `role="switch"` makes screen readers announce it as on or off rather than checked. -->
    <input
      ref="input"
      data-slot="control"
      :disabled="disabled"
      v-bind="controlAttrs()"
      type="checkbox"
      role="switch"
      :aria-readonly="readonly ? 'true' : undefined"
      :checked="checked"
      @click="onClick"
      @change="onChange"
    />
    <!-- The track and thumb only draw the state, which the <input> already exposes. -->
    <span data-slot="track" aria-hidden="true"><span data-slot="thumb" /></span>
  </span>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The switch's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .switch {
    /* Set per size. */
    --switch--track--width: 2.25rem;
    --switch--track--height: 1.25rem;
    /* The gap between the thumb and the track's border. */
    --switch--thumb--offset: 0.125rem;
    /* The thumb fills the track's height, inside its 1px border, less the offset on each side. */
    --switch--thumb--size: calc(var(--switch--track--height) - 2px - 2 * var(--switch--thumb--offset));
    /* Off, the track is an outline and the thumb a dot, both in the text colour at 55%,
       which has 3:1 against the page, like the Input's border. */
    --switch--track--border-color: color-mix(in srgb, currentColor 55%, transparent);
    --switch--track--background-color: transparent;
    --switch--thumb--background-color: var(--switch--track--border-color);

    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    vertical-align: middle;
    color: var(--color--neutral-text);
  }

  /* Sizes */
  .switch[data-size="xs"] {
    --switch--track--width: 1.75rem;
    --switch--track--height: 1rem;
  }
  .switch[data-size="sm"] {
    --switch--track--width: 2rem;
    --switch--track--height: 1.125rem;
  }
  .switch[data-size="lg"] {
    --switch--track--width: 2.75rem;
    --switch--track--height: 1.5rem;
  }
  .switch[data-size="xl"] {
    --switch--track--width: 3.25rem;
    --switch--track--height: 1.75rem;
  }

  /* The <input> lies on top of the track, invisible, so every press lands on the real
     control. It reaches past a small track to a hit area at least 24 × 24px. */
  .switch > [data-slot="control"] {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    width: max(100%, 1.5rem);
    height: max(100%, 1.5rem);
    margin: 0;
    translate: -50% -50%;
    opacity: 0;
    cursor: pointer;
  }
  .switch > [data-slot="control"]:disabled {
    cursor: not-allowed;
  }

  /* Parts */
  .switch > [data-slot="track"] {
    position: relative;
    box-sizing: border-box;
    width: var(--switch--track--width);
    height: var(--switch--track--height);
    border: 1px solid var(--switch--track--border-color);
    border-radius: 999px;
    background-color: var(--switch--track--background-color);
  }
  /* The thumb starts at the inline start and moves to the inline end, so it flips on its
     own in right-to-left languages, where on is on the left. */
  .switch > [data-slot="track"] > [data-slot="thumb"] {
    position: absolute;
    top: 50%;
    inset-inline-start: var(--switch--thumb--offset);
    width: var(--switch--thumb--size);
    height: var(--switch--thumb--size);
    border-radius: 999px;
    background-color: var(--switch--thumb--background-color);
    translate: 0 -50%;
    transition: inset-inline-start 150ms ease-out;
  }

  /* States. Each one reads the <input>, so what people see and what assistive technologies
     report can't drift apart. Like every variable, they're set on the root, where a class
     of yours can set them too. The thumb's colour follows the track's border unless a state
     sets its own. */
  @media (hover: hover) {
    .switch:hover:where(:has(> [data-slot="control"]:not(:checked, :disabled, [aria-readonly="true"]))) {
      --switch--track--border-color: color-mix(in srgb, currentColor 80%, transparent);
    }
  }
  .switch > [data-slot="control"]:focus-visible + [data-slot="track"] {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  /* On, the track fills and the thumb moves to the end, so on and off differ by more
     than colour. */
  .switch:has(> [data-slot="control"]:checked) {
    --switch--track--border-color: var(--color--primary);
    --switch--track--background-color: var(--color--primary);
    --switch--thumb--background-color: var(--color--primary-contrast);
  }
  .switch > [data-slot="control"]:checked + [data-slot="track"] > [data-slot="thumb"] {
    inset-inline-start: calc(100% - var(--switch--thumb--size) - var(--switch--thumb--offset));
  }
  .switch:has(> [data-slot="control"][aria-invalid="true"]) {
    --switch--track--border-color: var(--color--error-text);
  }
  .switch > [data-slot="control"][aria-invalid="true"] + [data-slot="track"] {
    /* A second pixel of border, drawn inside, so the switch doesn't grow. */
    box-shadow: inset 0 0 0 1px var(--switch--track--border-color);
  }
  .switch > [data-slot="control"]:disabled + [data-slot="track"] {
    opacity: 0.5;
  }
  /* Read-only, the track's border is dashed, like the Input's, so it reads as something you
     can't change. On, the dashes take the text colour, which stands out against the page
     around the fill, unless the switch is invalid, where the error colour wins. */
  .switch > [data-slot="control"][aria-readonly="true"] {
    cursor: default;
  }
  .switch > [data-slot="control"][aria-readonly="true"] + [data-slot="track"] {
    border-style: dashed;
  }
  .switch:has(> [data-slot="control"][aria-readonly="true"]:checked:not([aria-invalid="true"], :disabled)) {
    --switch--track--border-color: currentColor;
  }

  /* On touch screens, the hit area grows to at least 44 × 44px, without the switch
     looking any bigger. */
  @media (any-pointer: coarse) {
    .switch > [data-slot="control"] {
      width: max(100%, 2.75rem);
      height: max(100%, 2.75rem);
    }
  }

  /* The thumb jumps rather than slides when people ask for less motion. */
  @media (prefers-reduced-motion: reduce) {
    .switch > [data-slot="track"] > [data-slot="thumb"] {
      transition: none;
    }
  }

  /* With more contrast, the track and thumb are drawn in the text colour at full strength,
     hovered or not. */
  @media (prefers-contrast: more) {
    .switch,
    .switch:hover {
      --switch--track--border-color: currentColor;
    }
  }

  /* Forced colors mode would paint the track and thumb's backgrounds over with the page's,
     hiding the thumb and the on state, so they keep their colours and use system ones. */
  @media (forced-colors: active) {
    .switch,
    .switch:hover {
      --switch--track--border-color: CanvasText;
      --switch--track--background-color: Canvas;
      --switch--thumb--background-color: CanvasText;
    }
    .switch > [data-slot="track"] {
      forced-color-adjust: none;
    }
    .switch:has(> [data-slot="control"]:checked) {
      --switch--track--border-color: Highlight;
      --switch--track--background-color: Highlight;
      --switch--thumb--background-color: HighlightText;
    }
    /* On, the read-only dashes and the invalid border are drawn in CanvasText, so they show
       around the Highlight fill. The read-only selector matches the one above, so it wins.
       The invalid border keeps its second pixel, which tells it apart without colour. */
    .switch:has(> [data-slot="control"][aria-readonly="true"]:checked:not([aria-invalid="true"], :disabled)),
    .switch:has(> [data-slot="control"][aria-invalid="true"]) {
      --switch--track--border-color: CanvasText;
    }
    .switch > [data-slot="control"]:focus-visible + [data-slot="track"] {
      outline-color: Highlight;
    }
    .switch:has(> [data-slot="control"]:disabled) {
      --switch--track--border-color: GrayText;
      --switch--track--background-color: Canvas;
      --switch--thumb--background-color: GrayText;
    }
    .switch > [data-slot="control"]:disabled + [data-slot="track"] {
      opacity: 1;
    }
  }
}
</style>
```

```ts [Switch.test.ts]
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import Switch from "./Switch.vue";

const label = (id: string, text: string) => h("label", { for: id }, text);

describe("Switch", () => {
  it("is a native checkbox with the switch role, found by its role and its label", () => {
    render({ render: () => [label("wifi", "Wi-Fi"), h(Switch, { id: "wifi" })] });

    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(control.tagName).toBe("INPUT");
    expect(control).toHaveAttribute("type", "checkbox");
  });

  it("says whether it's on with checked, never aria-pressed, and keeps its name in both states", async () => {
    const user = userEvent.setup();
    render({ render: () => [label("wifi", "Wi-Fi"), h(Switch, { id: "wifi" })] });

    const control = screen.getByRole("switch", { name: "Wi-Fi", checked: false });
    await user.click(control);
    expect(screen.getByRole("switch", { name: "Wi-Fi", checked: true })).toBe(control);
    expect(control).not.toHaveAttribute("aria-pressed");
    expect(control).not.toHaveAttribute("aria-checked");
  });

  it("toggles with Space and with a click on its label, firing change each time", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render({ render: () => [label("wifi", "Wi-Fi"), h(Switch, { id: "wifi", onChange })] });

    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    await user.tab();
    expect(control).toHaveFocus();
    await user.keyboard(" ");
    expect(control).toBeChecked();
    await user.click(screen.getByText("Wi-Fi"));
    expect(control).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("binds checked with v-model, or keeps its own state without it", async () => {
    const user = userEvent.setup();
    const on = ref(true);
    render({
      render: () => [
        h(Switch, {
          "aria-label": "Bound",
          checked: on.value,
          "onUpdate:checked": (value: boolean) => (on.value = value),
        }),
        h(Switch, { "aria-label": "Unbound" }),
      ],
    });

    const bound = screen.getByRole("switch", { name: "Bound" });
    expect(bound).toBeChecked();
    await user.click(bound);
    expect(on.value).toBe(false);
    on.value = true;
    await nextTick();
    expect(bound).toBeChecked();

    const unbound = screen.getByRole("switch", { name: "Unbound" });
    await user.click(unbound);
    expect(unbound).toBeChecked();
  });

  it("is submitted with its form, by its name and value, only while it's on, bound or not", async () => {
    const user = userEvent.setup();
    const tips = ref(true);
    render({
      render: () =>
        h("form", [
          label("updates", "Product updates"),
          h(Switch, { id: "updates", name: "updates" }),
          label("tips", "Tips"),
          h(Switch, {
            id: "tips",
            name: "tips",
            value: "weekly",
            checked: tips.value,
            "onUpdate:checked": (value: boolean) => (tips.value = value),
          }),
        ]),
    });

    const updates = screen.getByRole("switch", { name: "Product updates" });
    const form = updates.closest("form")!;
    expect(new FormData(form).has("updates")).toBe(false);
    expect(new FormData(form).get("tips")).toBe("weekly");
    await user.click(updates);
    await user.click(screen.getByRole("switch", { name: "Tips" }));
    expect(new FormData(form).get("updates")).toBe("on");
    expect(new FormData(form).has("tips")).toBe(false);
  });

  it("puts attributes, listeners and refs on the input, and classes and styles on its root", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const instance = ref<ComponentPublicInstance<{ input: HTMLInputElement }>>();
    render({
      render: () => [
        label("wifi", "Wi-Fi"),
        h(Switch, { ref: instance, id: "wifi", class: "wifi", style: "--switch--track--width: 3rem", name: "wifi", value: "enabled", onFocus }),
      ],
    });

    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    await user.tab();
    expect(control).toHaveAttribute("name", "wifi");
    expect(control).toHaveAttribute("value", "enabled");
    expect(control).not.toHaveClass("wifi");
    expect(control.parentElement).toHaveClass("switch", "wifi");
    expect(control).not.toHaveAttribute("style");
    expect(control.parentElement).toHaveAttribute("style", "--switch--track--width: 3rem;");
    expect(onFocus).toHaveBeenCalled();
    expect(instance.value?.input).toBe(control);
  });

  it("can't be focused or toggled while disabled, and its form leaves it out", async () => {
    const user = userEvent.setup();
    render({
      render: () =>
        h("form", [label("sync", "Sync"), h(Switch, { id: "sync", name: "sync", checked: true, disabled: true })]),
    });

    const control = screen.getByRole("switch", { name: "Sync" });
    await user.tab();
    await user.click(control);
    expect(control).toBeDisabled();
    expect(control).not.toHaveFocus();
    expect(control).toBeChecked();
    expect(new FormData(control.closest("form")!).has("sync")).toBe(false);
  });

  it("can be focused but not flipped while read-only, says so, and its form still sends it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render({
      render: () =>
        h("form", [
          label("sso", "Single sign-on"),
          h(Switch, { id: "sso", name: "sso", checked: true, readonly: true, onChange }),
        ]),
    });

    const control = screen.getByRole("switch", { name: "Single sign-on" });
    expect(control).toHaveAttribute("aria-readonly", "true");
    await user.tab();
    expect(control).toHaveFocus();
    await user.keyboard(" ");
    await user.click(control);
    await user.click(screen.getByText("Single sign-on"));
    expect(control).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    expect(new FormData(control.closest("form")!).get("sso")).toBe("on");
  });

  it("passes aria-invalid and its error message to the input", () => {
    render({
      render: () => [
        label("alerts", "Price alerts"),
        h(Switch, { id: "alerts", "aria-invalid": "true", "aria-describedby": "alerts-error" }),
        h("p", { id: "alerts-error" }, "Couldn't turn on price alerts. Try again."),
      ],
    });

    const control = screen.getByRole("switch", { name: "Price alerts" });
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control).toHaveAccessibleDescription("Couldn't turn on price alerts. Try again.");
  });

  it("mirrors its size as a data attribute", () => {
    const { container } = render(Switch, { attrs: { "aria-label": "Wi-Fi" }, props: { size: "lg" } });

    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const options = { attrs: { "aria-label": "Wi-Fi" } };
    const first = render(Switch, options).container.innerHTML;
    const { container, rerender } = render(Switch, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.querySelectorAll("[data-slot]")].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["control", "track", "thumb"]);
    expect(root.querySelector('[data-slot="track"]')).toHaveAttribute("aria-hidden", "true");

    const input = root.querySelector("input");
    await rerender({ checked: true, disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect(root.querySelector("input")).toBe(input);
    expect(parts()).toEqual(["control", "track", "thumb"]);
  });

  it("warns in development when it has no label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Switch);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render({ render: () => [label("wifi", "Wi-Fi"), h(Switch, { id: "wifi" })] });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
```
:::
::

## Sources

- [WAI-ARIA Authoring Practices Guide: Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/), and its [checkbox-based example](https://www.w3.org/WAI/ARIA/apg/patterns/switch/examples/switch-checkbox/), for the role, the states and the keyboard
- [WAI-ARIA 1.2: the switch role](https://www.w3.org/TR/wai-aria-1.2/#switch), for a state that's on or off, with no mixed value, and [`aria-readonly`](https://www.w3.org/TR/wai-aria-1.2/#aria-readonly), which a checkbox takes and a switch inherits
- [HTML Standard: the checkbox state](https://html.spec.whatwg.org/multipage/input.html#checkbox-state-(type=checkbox)) and [the readonly attribute](https://html.spec.whatwg.org/multipage/input.html#the-readonly-attribute), which doesn't apply to checkboxes, so the Switch uses `aria-readonly`
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), for the track and the thumb
- [Understanding SC 3.2.2: On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html), for what flipping a switch may change
- [Sara Soueidan: On designing and building toggle switches](https://www.sarasoueidan.com/blog/toggle-switch-design/), for labels, states and the checkbox
- [Inclusive Components: Toggle Buttons](https://inclusive-components.design/toggle-button/), for toggle buttons against switches
- [Primer: Toggle switch](https://primer.style/product/components/toggle-switch/), for applying a setting right away and showing that it's saving
- [Apple Human Interface Guidelines: Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles), for switches in settings lists
