<script setup lang="ts">
import { onMounted, useAttrs, useTemplateRef } from "vue";

export interface InputProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** The kind of text it takes, which picks the keyboard on phones. Other types are other components. */
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
