---
title: Textarea
description: How to build a textarea that people can label, write in at length and fix, that grows or resizes without cutting anything off, and that agents can check.
navigation:
  title: Overview
---

Textareas are where people write more than a line, like a comment, a message, a description or a delivery note. They look like an input that's a few lines taller, which is why they're so often built as one and inherit all of its problems, along with a few of their own. Think of a box too small to see what you've written, a limit that silently cuts off the end of what you pasted, or an `Enter` key that sends a message you were still writing.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/textarea/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a textarea looks, from its parts and sizes to how tall it gets, its count, its states and its tokens.
:::

:::card{to="/docs/components/textarea/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a textarea behaves for every person, input and setting, so it's accessible, predictable, clear in every state and adaptive.
:::

:::card{to="/docs/components/textarea/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Textarea, with the Input's consistent, typed API that works with your forms however you build them.
:::

:::card{to="/docs/components/textarea/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, fill in and check a textarea, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/textarea#reference-implementation), which does its part of every rule in the [checklist](/docs/components/textarea#checklist), so feel free to write in them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Textarea with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/textarea/ax#deterministic).

The Textarea is the box you write in, like the [Input](/docs/components/input) is for a single line. Its label, hint and error message are elements of their own, which you link to it by ID, and a Field component, which is on our [Roadmap](/docs/getting-started/roadmap), will put them together for you. Until then, the examples do it with a plain `<label>`, and the rules hold either way.

::textarea-playground
::

| Aspect   | Textarea                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------- |
| Element  | `<textarea>`, inside a `<div>` that holds its count                                               |
| Role     | `textbox`, with `aria-multiline` implied, so screen readers can tell it from an input            |
| Name     | Its `<label>`, linked with `for`, and never its placeholder                                       |
| Keyboard | The browser's own text editing, with `Enter` for a new line, which never submits its form         |
| States   | Hover, focus, disabled, read-only and invalid                                                     |
| Height   | At least `rows` lines, resized by people on the block axis, or growing with its text up to `maxRows` |
| Count    | Optional, against a `limit`, which people can type and paste past                                 |
| Sizes    | `xs`, `sm`, `md`, `lg` and `xl`, with the same padding and text as the Input                      |
| Pattern  | None in the APG, since a native [`<textarea>`](https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element) covers it |
| WCAG 2.2 | 1.3.1, 1.4.3, 1.4.4, 1.4.10, 1.4.11, 2.4.7, 2.5.8, 3.3.1, 3.3.2, 4.1.2 and 4.1.3, among others    |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A textarea meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Textarea itself, so they're the ones to check when you build or review one. **Usage** rules are met by the forms that use it, like giving every textarea a label, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like `Enter`, which the Textarea leaves to the browser, as long as the page doesn't make it send the form.

The basis says where a rule comes from. About half the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and a few come from **HTML**. The rest are **Open Components** rules, which are our own, like counting past a limit rather than cutting people off. Where a rule goes further than WCAG asks at level AA, its basis says so: some come from level **AAA**, like the 44px height on touch screens, and a rule that asks for more than its criterion says **beyond**, like using a native `<textarea>`, where WCAG would let you rebuild one by hand.

Unit tests run without a layout, so the rules about height, resizing and growing are checked in the browser, at 200% zoom or with visual regression tests.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/textarea/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/textarea/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/textarea/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/textarea/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves. It announces its count with the Button's [`announce.ts`](/docs/components/button#reference-implementation), which every component that announces something shares, so you only need one copy of it, and it reads the same theme tokens, so copy the Button's `tokens.css` into your theme too.

The tests are in `Textarea.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [Textarea.vue]
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useAttrs, useTemplateRef, watch, type TextareaHTMLAttributes } from "vue";
import { announce, prepareAnnouncer } from "../button/announce";

export interface TextareaProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** How many lines it shows. It's never shorter, even when people resize it. */
  rows?: number;
  /** Grows with its text, up to `maxRows`, rather than scrolling. People can't resize it then. */
  autoGrow?: boolean;
  /** How many lines it grows to with `autoGrow`, before it scrolls. Without it, it keeps growing. */
  maxRows?: number;
  /** The most characters it takes. It shows a count, and lets people go over, so nothing they paste gets cut off. */
  limit?: number;
  /** The count's text, for a number of characters left, which is negative over the limit. */
  countLabel?: (remaining: number) => string;
  disabled?: boolean;
}

// Attributes go on the <textarea> rather than on the root, so they're declared below.
defineOptions({ inheritAttrs: false });

const {
  size = "md",
  rows = 3,
  autoGrow = false,
  maxRows,
  limit,
  countLabel = (remaining: number) => {
    const count = Math.abs(remaining);
    const characters = count === 1 ? "character" : "characters";
    return remaining < 0 ? `${count} ${characters} too many` : `${count} ${characters} left`;
  },
  disabled = false,
} = defineProps<TextareaProps>();

/** The value, which `v-model` binds. Without it, the textarea keeps its own, and its form submits it. */
const model = defineModel<string>();

const attrs = useAttrs();
// Classes and styles go on the root, so a class can set its variables. Everything
// else goes on the <textarea>: `id`, `name`, `placeholder`, ARIA and listeners.
// Attrs aren't reactive, so these run on every render.
const onRoot = (key: string) => key === "class" || key === "style";
const rootAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => onRoot(key)));
const controlAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => !onRoot(key)));

const root = useTemplateRef<HTMLElement>("root");
const textarea = useTemplateRef<HTMLTextAreaElement>("textarea");

// What people have typed, so the count works without `v-model` too.
const typed = ref(typeof attrs.value === "string" ? attrs.value : "");
const value = computed(() => model.value ?? typed.value);

// Code points rather than UTF-16 code units, which is how many databases count a
// length limit, like PostgreSQL's varchar(n). An emoji made of several, like a
// family, counts as several.
const remaining = computed(() => (limit === undefined ? 0 : limit - [...value.value].length));
const over = computed(() => remaining.value < 0);
const countText = computed(() => countLabel(remaining.value));
// The count is named after the textarea, so it needs its `id` to describe it.
const countId = computed(() => (limit !== undefined && attrs.id ? `${attrs.id}-count` : undefined));
// Over the limit, it's invalid, whatever the page says.
const invalid = () => (over.value ? "true" : (attrs["aria-invalid"] as TextareaHTMLAttributes["aria-invalid"]));
const describedBy = () => [attrs["aria-describedby"], countId.value].filter(Boolean).join(" ") || undefined;

// `rows` and `maxRows` as variables, in lines, which the styles turn into a minimum
// and a maximum height. Browsers with typed attr() read them from `data-rows` and
// `data-max-rows` before any script runs. The others can't read a number from an
// attribute yet, so they're also set through the CSSOM, which a strict Content
// Security Policy allows, unlike a style attribute. They run after every render,
// since a change to your own `style` replaces the root's.
function setRows() {
  const el = root.value;
  if (!el) return;
  el.style.setProperty("--textarea--rows", String(rows));
  if (autoGrow && maxRows !== undefined) el.style.setProperty("--textarea--max-rows", String(maxRows));
  else el.style.removeProperty("--textarea--max-rows");
}
onMounted(setRows);
onUpdated(setRows);

// Browsers with `field-sizing: content` grow the textarea themselves. In the
// others, it's set to the height of its text, which max-height caps.
function grow() {
  const el = textarea.value;
  if (!autoGrow || !el || (typeof CSS !== "undefined" && CSS.supports?.("field-sizing", "content"))) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
}
watch(value, () => nextTick(grow));

// Screen readers hear the count once people pause near the limit, rather than on
// every keystroke, which would talk over what they're typing.
const NEAR_LIMIT = 0.8;
const PAUSE = 1000;
let timer: ReturnType<typeof setTimeout> | undefined;
let announced = "";
function announceCount() {
  if (limit === undefined) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    const near = limit - remaining.value >= limit * NEAR_LIMIT;
    if (!near || countText.value === announced) return;
    announced = countText.value;
    announce(countText.value);
  }, PAUSE);
}

// The template shows the model, or the `value` attribute while there's none, so a
// textarea without `v-model`, like a read-only one, can still start with a value.
function onInput(event: Event) {
  const text = (event.target as HTMLTextAreaElement).value;
  typed.value = text;
  model.value = text;
  announceCount();
}

// A form reset puts back the textarea's first value without an input event, so
// the count reads it again once the reset is done. That's after the event and,
// for a click on a reset button, after the microtasks that follow it too.
let form: HTMLFormElement | null = null;
function onReset() {
  setTimeout(() => {
    const text = textarea.value?.value ?? "";
    typed.value = text;
    if (model.value !== undefined) model.value = text;
  });
}

// A ref to the Textarea gets you the <textarea>, through `textarea`.
defineExpose({ textarea });

onMounted(() => {
  // The live region has to be in the page before anything is announced.
  if (limit !== undefined) prepareAnnouncer();
  grow();
  form = textarea.value?.form ?? null;
  form?.addEventListener("reset", onReset);

  if (import.meta.env.DEV) {
    const el = textarea.value;
    const named = el?.labels?.length || el?.hasAttribute("aria-label") || el?.hasAttribute("aria-labelledby");
    if (el && !named) {
      console.warn("[Textarea] has no accessible name: give it a <label for>.", el);
    }
    if (el && limit !== undefined && !el.id) {
      console.warn("[Textarea] has a limit but no id: give it one, so its count can describe it.", el);
    }
  }
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  form?.removeEventListener("reset", onReset);
});
</script>

<template>
  <div
    ref="root"
    class="textarea"
    v-bind="rootAttrs()"
    :data-size="size"
    :data-rows="rows"
    :data-auto-grow="autoGrow ? '' : undefined"
    :data-max-rows="autoGrow ? maxRows : undefined"
    :data-limit="limit"
  >
    <textarea
      ref="textarea"
      data-slot="control"
      :rows="rows"
      :disabled="disabled"
      v-bind="controlAttrs()"
      :value="model ?? ($attrs.value as string | undefined)"
      :aria-invalid="invalid()"
      :aria-describedby="describedBy()"
      @input="onInput"
    />
    <span v-if="limit !== undefined" data-slot="count" :id="countId" :data-over-limit="over ? '' : undefined">
      {{ countText }}
    </span>
  </div>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The textarea's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .textarea {
    /* Set per size. The Input's values, so a textarea of one row is as tall as an
       input, and the two line up in a form. */
    --textarea--height: 2.25rem;
    --textarea--padding: 0.75rem;
    --textarea--font-size: 0.875rem;
    --textarea--radius: 0.5rem;
    /* The text colour at 55%, which has 3:1 against the page, so people can see where to type. */
    --textarea--border-color: color-mix(in srgb, currentColor 55%, transparent);
    /* The text colour at 70%, which has 4.5:1 against the page, like the placeholder. */
    --textarea--count--color: color-mix(in srgb, currentColor 70%, transparent);
    /* What's left of one row's height once its line of text is in, above and below it.
       `lh` is the textarea's line height, so it follows larger text and wider lines. */
    --textarea--padding-block: max(0.125rem, (var(--textarea--height) - 1lh) / 2 - 1px);
    /* `rows` lines, with their padding and border. Resizing and growing stop there.
       The rows come from `data-rows`, in browsers with typed attr(), so it holds before
       the script runs. In the others, it has no value until then, and the `rows`
       attribute sets the height, except with auto-grow, whose field-sizing ignores
       `rows`, so it starts at the height of its text, with no maximum. */
    --textarea--min-height: calc(
      var(--textarea--rows, attr(data-rows type(<number>))) * 1lh + 2 * var(--textarea--padding-block) + 2px
    );
    /* Only set with `maxRows`. Without it, max-height has no value, which is none. */
    --textarea--max-height: calc(
      var(--textarea--max-rows, attr(data-max-rows type(<number>))) * 1lh + 2 * var(--textarea--padding-block) + 2px
    );

    display: flex;
    flex-direction: column;
    /* In a flex row, it can get narrower than a <textarea> is on its own, rather than overflow. */
    min-width: 0;
    color: var(--color--neutral-text);
    font-family: inherit;
    font-size: var(--textarea--font-size);
  }

  /* Sizes */
  .textarea[data-size="xs"] {
    --textarea--height: 1.5rem;
    --textarea--padding: 0.5rem;
    --textarea--font-size: 0.75rem;
    --textarea--radius: 0.375rem;
  }
  .textarea[data-size="sm"] {
    --textarea--height: 2rem;
    --textarea--padding: 0.625rem;
    --textarea--radius: 0.375rem;
  }
  .textarea[data-size="lg"] {
    --textarea--height: 2.5rem;
    --textarea--padding: 0.875rem;
    --textarea--font-size: 1rem;
  }
  .textarea[data-size="xl"] {
    --textarea--height: 3rem;
    --textarea--padding: 1rem;
    --textarea--font-size: 1rem;
    --textarea--radius: 0.75rem;
  }

  /* Parts. The control draws the field itself, since its resize handle and its
     scrollbar belong to it. */
  .textarea > [data-slot="control"] {
    display: block;
    box-sizing: border-box;
    width: 100%;
    /* min-height rather than height, so it's never shorter than its rows, and grows with larger text. */
    min-height: var(--textarea--min-height);
    max-height: var(--textarea--max-height);
    margin: 0;
    padding: var(--textarea--padding-block) var(--textarea--padding);
    border: 1px solid var(--textarea--border-color);
    border-radius: var(--textarea--radius);
    background-color: transparent;
    color: inherit;
    font: inherit;
    /* Taller than the Input's, since people read their text back over several lines. */
    line-height: 1.5;
    letter-spacing: inherit;
    /* Only taller or shorter, so it never outgrows its column. `block` follows the
       writing mode, and `vertical` is for browsers that don't know it. */
    resize: vertical;
    resize: block;
  }
  .textarea > [data-slot="control"]::placeholder {
    /* The text colour at 70%, which has 4.5:1 against the page. Firefox lowers its opacity on its own. */
    color: color-mix(in srgb, currentColor 70%, transparent);
    opacity: 1;
  }
  /* It grows with its text, so there's nothing for people to resize. Browsers without
     field-sizing get their height from the script instead. */
  .textarea[data-auto-grow] > [data-slot="control"] {
    resize: none;
    field-sizing: content;
  }
  .textarea > [data-slot="count"] {
    margin-block-start: 0.375rem;
    color: var(--textarea--count--color);
    line-height: 1.25;
    text-align: end;
    /* So the count doesn't jiggle as its digits change. */
    font-variant-numeric: tabular-nums;
  }
  .textarea > [data-slot="count"][data-over-limit] {
    color: var(--color--error-text);
  }

  /* States. Each one reads the attribute on the <textarea> that exposes it, so what
     people see and what assistive technologies report can't drift apart. :invalid
     isn't one of them: it matches a required textarea before anyone has typed in it.
     The variables are set on the root, as every other one is, so a class of yours
     still sets them in every state. Hover is in :where(), so invalid always wins. */
  @media (hover: hover) {
    .textarea:where(:has(> [data-slot="control"]:hover:not(:disabled, [readonly]))) {
      --textarea--border-color: color-mix(in srgb, currentColor 80%, transparent);
    }
  }
  .textarea > [data-slot="control"]:focus-visible {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  .textarea > [data-slot="control"][readonly] {
    /* Dashed, so it reads as something you can't change, while the text keeps its contrast. */
    border-style: dashed;
    cursor: default;
  }
  .textarea:has(> [data-slot="control"][aria-invalid="true"]) {
    --textarea--border-color: var(--color--error-text);
  }
  .textarea > [data-slot="control"][aria-invalid="true"] {
    /* A second pixel of border, drawn inside, so the field doesn't grow. */
    box-shadow: inset 0 0 0 1px var(--textarea--border-color);
  }
  .textarea:has(> [data-slot="control"]:disabled) {
    opacity: 0.5;
  }
  .textarea > [data-slot="control"]:disabled {
    cursor: not-allowed;
    /* Nobody can write in it, so there's nothing to make room for. */
    resize: none;
  }

  /* On touch screens, the text is at least 16px, or Safari on iOS zooms in when the
     textarea gets focus, and the field is at least 44px tall, whatever its rows. */
  @media (any-pointer: coarse) {
    .textarea {
      font-size: max(var(--textarea--font-size), 1rem);
    }
    .textarea > [data-slot="control"] {
      min-height: max(var(--textarea--min-height), 2.75rem);
    }
  }

  /* With more contrast, the border is drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .textarea {
      --textarea--border-color: currentColor;
    }
  }

  /* Forced colors mode keeps borders but drops shadows, so mark states with system colours. */
  @media (forced-colors: active) {
    .textarea > [data-slot="control"]:focus-visible {
      outline-color: Highlight;
    }
    .textarea:has(> [data-slot="control"]:disabled) {
      color: GrayText;
      opacity: 1;
    }
    .textarea > [data-slot="control"]:disabled {
      border-color: GrayText;
    }
  }
}
</style>
```
```ts [Textarea.test.ts]
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import Textarea from "./Textarea.vue";

const label = (id: string, text: string) => h("label", { for: id }, text);

describe("Textarea", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is a native textarea, found by its role and its label", () => {
    render({ render: () => [label("message", "Message"), h(Textarea, { id: "message" })] });

    const textarea = screen.getByRole("textbox", { name: "Message" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).not.toHaveAttribute("contenteditable");
    expect(textarea).not.toHaveAttribute("role");
  });

  it("puts attributes, listeners and refs on the textarea, and classes and styles on its root", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const instance = ref<ComponentPublicInstance<{ textarea: HTMLTextAreaElement }>>();
    render({
      render: () => [
        label("address", "Street address"),
        h(Textarea, {
          ref: instance,
          id: "address",
          class: "address",
          style: "max-width: 320px",
          name: "address",
          autocomplete: "street-address",
          onFocus,
        }),
      ],
    });

    const textarea = screen.getByRole("textbox", { name: "Street address" });
    await user.tab();
    expect(textarea).toHaveAttribute("name", "address");
    expect(textarea).toHaveAttribute("autocomplete", "street-address");
    expect(textarea).not.toHaveClass("address");
    expect(textarea.parentElement).toHaveClass("textarea", "address");
    expect(textarea.parentElement).toHaveStyle({ maxWidth: "320px" });
    expect(textarea).not.toHaveStyle({ maxWidth: "320px" });
    expect(onFocus).toHaveBeenCalled();
    expect(instance.value?.textarea).toBe(textarea);
  });

  it("binds its value with v-model, or keeps its own without it", async () => {
    const user = userEvent.setup();
    const message = ref("Hello");
    render({
      render: () => [
        h(Textarea, {
          "aria-label": "Bound",
          modelValue: message.value,
          "onUpdate:modelValue": (value: string | undefined) => (message.value = value ?? ""),
        }),
        h(Textarea, { "aria-label": "Unbound" }),
      ],
    });

    const bound = screen.getByRole("textbox", { name: "Bound" });
    await user.type(bound, ", Ada");
    expect(message.value).toBe("Hello, Ada");
    message.value = "";
    await nextTick();
    expect(bound).toHaveValue("");

    const unbound = screen.getByRole("textbox", { name: "Unbound" });
    await user.type(unbound, "Ada");
    expect(unbound).toHaveValue("Ada");
  });

  it("is submitted with its form, by its name, whether its value is bound or not", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    const subject = ref("");
    render({
      render: () =>
        h("form", { onSubmit }, [
          label("subject", "Subject"),
          h(Textarea, {
            id: "subject",
            name: "subject",
            modelValue: subject.value,
            "onUpdate:modelValue": (value: string | undefined) => (subject.value = value ?? ""),
          }),
          label("message", "Message"),
          h(Textarea, { id: "message", name: "message" }),
          h("button", { type: "submit" }, "Send"),
        ]),
    });

    await user.type(screen.getByRole("textbox", { name: "Subject" }), "Hi");
    await user.type(screen.getByRole("textbox", { name: "Message" }), "Hello");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const data = new FormData(onSubmit.mock.calls[0]![0].target as HTMLFormElement);
    expect(data.get("subject")).toBe("Hi");
    expect(data.get("message")).toBe("Hello");
  });

  it("inserts a new line on Enter, and never submits its form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render({
      render: () =>
        h("form", { onSubmit }, [
          label("message", "Message"),
          h(Textarea, { id: "message", name: "message" }),
          h("button", { type: "submit" }, "Send"),
        ]),
    });

    const textarea = screen.getByRole("textbox", { name: "Message" });
    await user.type(textarea, "Dear Ada,{Enter}Thank you");
    expect(textarea).toHaveValue("Dear Ada,\nThank you");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps the browser's text editing keys, and lets people paste", async () => {
    const user = userEvent.setup();
    render({
      render: () => [label("message", "Message"), h(Textarea, { id: "message" }), h("button", { type: "button" }, "Send")],
    });

    const textarea = screen.getByRole("textbox", { name: "Message" });
    await user.tab();
    expect(textarea).toHaveFocus();
    await user.keyboard("Lovelace{Home}Ada ");
    expect(textarea).toHaveValue("Ada Lovelace");

    // Tab moves focus on, rather than typing a tab.
    await user.tab();
    expect(screen.getByRole("button", { name: "Send" })).toHaveFocus();
    expect(textarea).toHaveValue("Ada Lovelace");
    await user.tab({ shift: true });
    expect(textarea).toHaveFocus();

    await user.clear(textarea);
    await user.paste("Ada Lovelace");
    expect(textarea).toHaveValue("Ada Lovelace");
  });

  it("lets people type and paste past its limit, and counts what's left or how many too many", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () => [label("bio", "Bio"), h(Textarea, { id: "bio", limit: 10 })],
    });

    const textarea = screen.getByRole("textbox", { name: "Bio" });
    const count = container.querySelector('[data-slot="count"]');
    expect(textarea).not.toHaveAttribute("maxlength");
    expect(count).toHaveTextContent("10 characters left");

    await user.type(textarea, "Ada Lovel");
    expect(count).toHaveTextContent("1 character left");

    await user.paste("ace, mathematician");
    expect(textarea).toHaveValue("Ada Lovelace, mathematician");
    expect(count).toHaveTextContent("17 characters too many");
  });

  it("describes the textarea with its count, and marks it invalid over the limit", async () => {
    const user = userEvent.setup();
    render({
      render: () => [
        label("bio", "Bio"),
        h("p", { id: "bio-hint" }, "You can enter up to 10 characters"),
        h(Textarea, { id: "bio", limit: 10, "aria-describedby": "bio-hint" }),
      ],
    });

    const textarea = screen.getByRole("textbox", { name: "Bio" });
    expect(textarea).toHaveAccessibleDescription("You can enter up to 10 characters 10 characters left");
    expect(textarea).not.toHaveAttribute("aria-invalid");

    await user.type(textarea, "Ada Lovelace");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("You can enter up to 10 characters 2 characters too many");

    await user.type(textarea, "{Backspace}{Backspace}");
    expect(textarea).not.toHaveAttribute("aria-invalid");
  });

  it("announces the count once people pause near the limit, not on every keystroke", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render({ render: () => [label("bio", "Bio"), h(Textarea, { id: "bio", limit: 10 })] });

    // The page shares one live region, so clear what other tests announced.
    const status = screen.getByRole("status");
    status.replaceChildren();
    const textarea = screen.getByRole("textbox", { name: "Bio" });

    // Far from the limit, nothing is announced.
    await user.type(textarea, "Ada");
    vi.advanceTimersByTime(1000);
    expect(status).toHaveTextContent("");

    // Near it, the count is announced once people pause, and only once.
    await user.type(textarea, " Love");
    expect(status).toHaveTextContent("");
    vi.advanceTimersByTime(1000);
    expect(status).toHaveTextContent("2 characters left");
    expect(status.children).toHaveLength(1);

    // A count that's back where it was isn't announced again.
    await user.type(textarea, "l{Backspace}");
    vi.advanceTimersByTime(1000);
    expect(status.children).toHaveLength(1);

    await user.type(textarea, "lace");
    vi.advanceTimersByTime(1000);
    expect(status).toHaveTextContent("2 characters too many");
    expect(status.children).toHaveLength(2);
  });

  it("waits for people to pause near the limit, however slowly they type", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render({ render: () => [label("motto", "Motto"), h(Textarea, { id: "motto", limit: 10 })] });

    // The page shares one live region, so clear what other tests announced.
    const status = screen.getByRole("status");
    status.replaceChildren();
    const textarea = screen.getByRole("textbox", { name: "Motto" });

    // A key every 600ms is slow, but shorter than a pause, so nothing is announced until the last one.
    await user.type(textarea, "Ada Lov");
    for (const key of "ela") {
      vi.advanceTimersByTime(600);
      await user.type(textarea, key);
    }
    expect(status.children).toHaveLength(0);

    vi.advanceTimersByTime(1000);
    expect(status.children).toHaveLength(1);
    expect(status).toHaveTextContent("0 characters left");
  });

  it("counts again when its form is reset, whether its value is bound or not", async () => {
    const user = userEvent.setup();
    const bio = ref("");
    const { container } = render({
      render: () =>
        h("form", [
          label("bio", "Bio"),
          h(Textarea, { id: "bio", name: "bio", limit: 10 }),
          label("motto", "Motto"),
          h(Textarea, {
            id: "motto",
            name: "motto",
            limit: 10,
            modelValue: bio.value,
            "onUpdate:modelValue": (value: string | undefined) => (bio.value = value ?? ""),
          }),
        ]),
    });

    const unbound = screen.getByRole("textbox", { name: "Bio" });
    const bound = screen.getByRole("textbox", { name: "Motto" });
    await user.type(unbound, "Ada Lovelace");
    await user.type(bound, "Ada Lovelace");
    expect(unbound).toHaveAttribute("aria-invalid", "true");
    expect(bound).toHaveAttribute("aria-invalid", "true");

    // The reset event fires before the values are put back, so the count catches up after it.
    unbound.closest("form")!.reset();
    await vi.waitFor(() => {
      for (const count of container.querySelectorAll('[data-slot="count"]')) {
        expect(count).toHaveTextContent("10 characters left");
      }
      expect(unbound).not.toHaveAttribute("aria-invalid");
      expect(bound).not.toHaveAttribute("aria-invalid");
    });
    expect(bio.value).toBe("");
    expect(bound).toHaveValue("");
  });

  it("counts again after a reset button, which puts the text back only after the browser's microtasks", async () => {
    const user = userEvent.setup();
    render({ render: () => h("form", [label("bio", "Bio"), h(Textarea, { id: "bio", name: "bio", limit: 10 })]) });

    const textarea = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Bio" });
    await user.type(textarea, "Ada Lovelace");
    expect(textarea).toHaveAttribute("aria-invalid", "true");

    // A click on a reset button fires `reset`, runs microtasks, and only then puts the
    // text back. jsdom runs them last, so this plays the browser's order step by step.
    textarea.form!.dispatchEvent(new Event("reset", { cancelable: true }));
    await Promise.resolve();
    textarea.value = textarea.defaultValue;

    await vi.waitFor(() => {
      expect(screen.getByText("10 characters left")).toBeInTheDocument();
      expect(textarea).not.toHaveAttribute("aria-invalid");
    });
  });

  it("can't be focused or edited while disabled, and its form leaves it out", async () => {
    const user = userEvent.setup();
    render({
      render: () =>
        h("form", [label("notes", "Notes"), h(Textarea, { id: "notes", name: "notes", value: "Call back", disabled: true })]),
    });

    const textarea = screen.getByRole("textbox", { name: "Notes" });
    await user.tab();
    await user.type(textarea, " tomorrow");
    expect(textarea).toBeDisabled();
    expect(textarea).not.toHaveFocus();
    expect(textarea).toHaveValue("Call back");
    expect(new FormData(textarea.closest("form")!).has("notes")).toBe(false);
  });

  it("passes aria-invalid and its error message to the textarea", () => {
    render({
      render: () => [
        label("message", "Message"),
        h(Textarea, { id: "message", "aria-invalid": "true", "aria-describedby": "message-error" }),
        h("p", { id: "message-error" }, "Enter a message"),
      ],
    });

    const textarea = screen.getByRole("textbox", { name: "Message" });
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("Enter a message");
  });

  it("mirrors its size, rows, auto-grow, maximum and limit as data attributes, and passes its rows to the textarea", async () => {
    const { container, rerender } = render(Textarea, {
      attrs: { id: "message", "aria-label": "Message" },
      props: { size: "lg", rows: 2, autoGrow: true, maxRows: 6, limit: 500 },
    });

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveAttribute("data-auto-grow", "");
    expect(root).toHaveAttribute("data-limit", "500");
    expect(root).toHaveAttribute("data-rows", "2");
    expect(root).toHaveAttribute("data-max-rows", "6");
    expect(root.style.getPropertyValue("--textarea--rows")).toBe("2");
    expect(root.style.getPropertyValue("--textarea--max-rows")).toBe("6");
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveAttribute("rows", "2");

    // New rows reach the styles, and a maximum only counts while it grows.
    await rerender({ size: "lg", rows: 4, autoGrow: false, maxRows: 6, limit: 500 });
    expect(root).toHaveAttribute("data-rows", "4");
    expect(root.style.getPropertyValue("--textarea--rows")).toBe("4");
    expect(root).not.toHaveAttribute("data-max-rows");
    expect(root.style.getPropertyValue("--textarea--max-rows")).toBe("");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const options = { attrs: { id: "bio", "aria-label": "Bio" }, props: { limit: 200 } };
    const first = render(Textarea, options).container.innerHTML;
    const { container, rerender } = render(Textarea, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["control", "count"]);

    const textarea = root.querySelector("textarea");
    await rerender({ limit: 200, disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect(root.querySelector("textarea")).toBe(textarea);
    expect(parts()).toEqual(["control", "count"]);
  });

  it("warns in development when it has no label, or a limit without an id", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Textarea);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render(Textarea, { attrs: { "aria-label": "Bio" }, props: { limit: 200 } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no id"), expect.anything());

    warn.mockClear();
    render({ render: () => [label("bio", "Bio"), h(Textarea, { id: "bio", limit: 200 })] });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
```
:::
::

## Sources

- [HTML Standard: the textarea element](https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element), [implicit submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission) and [autofill](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill), for `rows`, `maxlength`, new lines and `street-address`
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 4.1.3: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), for announcing the count
- [Understanding SC 1.4.8: Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html), for keeping lines to 80 characters
- [CSS Box Sizing Module Level 4: field-sizing](https://drafts.csswg.org/css-sizing-4/#field-sizing), for growing with the text
- [CSS Basic User Interface Module Level 4: resize](https://drafts.csswg.org/css-ui/#resize), for resizing on the block axis
- [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/), for labels, instructions and validation
- [GOV.UK Design System: Textarea](https://design-system.service.gov.uk/components/textarea/) and [Character count](https://design-system.service.gov.uk/components/character-count/), for heights, letting people go over the limit and announcing the count when they pause
- [MDN: field-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing), for how `field-sizing: content` sizes a textarea
- [Base UI: Field](https://base-ui.com/react/components/field), for keeping the control apart from its label
- [Styleframe: Textarea](https://www.styleframe.dev/docs/theme/components/textarea), for not resizing a disabled textarea
