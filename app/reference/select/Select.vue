<script setup lang="ts">
import { getCurrentInstance, onMounted, useAttrs, useTemplateRef } from "vue";

export interface SelectProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  /** The text of an empty first option, like "Choose a country". With `required`, choosing it fails validation. It never stands in for the label. */
  placeholder?: string;
}

// Attributes go on the <select> rather than on the root, so they're declared below.
defineOptions({ inheritAttrs: false });

const { size = "md", disabled = false, placeholder } = defineProps<SelectProps>();

/** The value of the chosen option, which `v-model` binds. Without it, the select keeps its own, and its form submits and resets it. */
const model = defineModel<string>();

defineSlots<{
  /** The options, as <option> and <optgroup> elements. */
  default?: () => unknown;
}>();

const attrs = useAttrs();
// Classes and styles go on the root, so a class can set its variables. Everything else
// goes on the <select>: `id`, `name`, `autocomplete`, `required`, ARIA and listeners.
// Attrs aren't reactive, so these run on every render.
const onRoot = (key: string) => key === "class" || key === "style";
const rootAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => onRoot(key)));

// Whether the parent binds the value. Without a binding, defineModel would keep a copy of
// its own, which a form's reset can't clear, so the <select> keeps its value instead.
const instance = getCurrentInstance();
function bound() {
  const props = instance?.vnode.props;
  return props?.modelValue !== undefined || props?.["model-value"] !== undefined;
}

// The value is only set when it's bound. Setting a <select>'s value to one that no option
// has deselects them all, which would drop the option marked `selected`.
const controlAttrs = () => ({
  ...Object.fromEntries(Object.entries(attrs).filter(([key]) => !onRoot(key))),
  ...(bound() ? { value: model.value } : {}),
});

const select = useTemplateRef<HTMLSelectElement>("select");

function onChange(event: Event) {
  model.value = (event.target as HTMLSelectElement).value;
}

// A ref to the Select gets you the <select>, through `select`.
defineExpose({ select });

onMounted(() => {
  // A server render can't choose the bound option, since a <select> has no `value`
  // attribute, and hydrating doesn't set it either, so it's chosen here.
  if (bound() && select.value) select.value.value = model.value ?? "";

  if (import.meta.env.DEV) {
    const el = select.value;
    const named = el?.labels?.length || el?.hasAttribute("aria-label") || el?.hasAttribute("aria-labelledby");
    if (el && !named) {
      console.warn("[Select] has no accessible name: give it a <label for>.", el);
    }
  }
});
</script>

<template>
  <div class="select" v-bind="rootAttrs()" :data-size="size">
    <select ref="select" data-slot="control" :disabled="disabled" v-bind="controlAttrs()" @change="onChange">
      <option v-if="placeholder !== undefined" value="">{{ placeholder }}</option>
      <slot />
    </select>
    <!-- A picture of the select's state, so it's hidden, and presses go through it to the select. -->
    <span data-slot="indicator" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  </div>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The select's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .select {
    /* Set per size. The heights are the Input's and the Button's, so they line up in a row. */
    --select--height: 2.25rem;
    --select--padding: 0.75rem;
    --select--gap: 0.5rem;
    --select--font-size: 0.875rem;
    --select--indicator--size: 1rem;
    --select--radius: 0.5rem;
    /* The text colour at 55%, which has 3:1 against the page, so people can see the field. */
    --select--border-color: color-mix(in srgb, currentColor 55%, transparent);

    position: relative;
    display: flex;
    box-sizing: border-box;
    /* A min-height rather than a height, so the field grows with larger text. */
    min-height: var(--select--height);
    /* In a flex row, it can get narrower than its longest option, rather than overflow. */
    min-width: 0;
    border: 1px solid var(--select--border-color);
    border-radius: var(--select--radius);
    background-color: transparent;
    color: var(--color--neutral-text);
    font-family: inherit;
    font-size: var(--select--font-size);
    line-height: 1.25;
  }

  /* Sizes */
  .select[data-size="xs"] {
    --select--height: 1.5rem;
    --select--padding: 0.5rem;
    --select--gap: 0.25rem;
    --select--font-size: 0.75rem;
    --select--indicator--size: 0.875rem;
    --select--radius: 0.375rem;
  }
  .select[data-size="sm"] {
    --select--height: 2rem;
    --select--padding: 0.625rem;
    --select--radius: 0.375rem;
  }
  .select[data-size="lg"] {
    --select--height: 2.5rem;
    --select--padding: 0.875rem;
    --select--font-size: 1rem;
    --select--indicator--size: 1.25rem;
  }
  .select[data-size="xl"] {
    --select--height: 3rem;
    --select--padding: 1rem;
    --select--font-size: 1rem;
    --select--indicator--size: 1.25rem;
    --select--radius: 0.75rem;
  }

  /* Parts. The control fills the field, and leaves room at its end for the indicator. */
  .select > [data-slot="control"] {
    flex: 1;
    min-width: 0;
    box-sizing: border-box;
    margin: 0;
    padding-block: 0;
    padding-inline: var(--select--padding)
      calc(var(--select--padding) + var(--select--indicator--size) + var(--select--gap));
    border: 0;
    border-radius: calc(var(--select--radius) - 1px);
    /* The browser's own arrow goes, and the indicator takes its place. */
    appearance: none;
    background-color: transparent;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    /* A long option ends in an ellipsis, rather than running under the indicator. A styled
       picker's field clips it instead, below. */
    text-overflow: ellipsis;
    cursor: pointer;
    /* The root draws the focus ring, around the whole field. */
    outline: none;
  }
  .select > [data-slot="indicator"] {
    position: absolute;
    inset-block: 0;
    inset-inline-end: var(--select--padding);
    display: inline-flex;
    align-items: center;
    /* A press on it goes through to the select, which opens its picker. */
    pointer-events: none;
  }
  .select > [data-slot="indicator"] > svg {
    width: var(--select--indicator--size);
    height: var(--select--indicator--size);
  }

  /* States. Each one reads the attribute on the <select> that exposes it, so what people
     see and what assistive technologies report can't drift apart. :invalid isn't one of
     them: it matches a required select on its placeholder before anyone has chosen. */
  @media (hover: hover) {
    .select:hover:where(:not(:has(> [data-slot="control"]:disabled))) {
      --select--border-color: color-mix(in srgb, currentColor 80%, transparent);
    }
  }
  .select:has(> [data-slot="control"]:focus-visible) {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  .select:has(> [data-slot="control"][aria-invalid="true"]) {
    --select--border-color: var(--color--error-text);
    /* A second pixel of border, drawn inside, so the field doesn't grow. */
    box-shadow: inset 0 0 0 1px var(--select--border-color);
  }
  .select:has(> [data-slot="control"]:disabled) {
    opacity: 0.5;
  }
  .select > [data-slot="control"]:disabled {
    cursor: not-allowed;
  }

  /* On touch screens, the text is at least 16px, or Safari on iOS zooms in when the
     select gets focus, and the select reaches past the field to a hit area at least
     44px tall, with a transparent border. */
  @media (any-pointer: coarse) {
    .select {
      font-size: max(var(--select--font-size), 1rem);
    }
    .select > [data-slot="control"] {
      margin-block: min(0px, (var(--select--height) - 2.75rem) / 2 - 1px);
      border-block: max(0px, (2.75rem - var(--select--height)) / 2 + 1px) solid transparent;
      background-clip: padding-box;
    }
  }

  /* With more contrast, the border is drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .select,
    .select:hover {
      --select--border-color: currentColor;
    }
  }

  /* Forced colors mode keeps borders but drops shadows, so mark states with system colours. */
  @media (forced-colors: active) {
    .select:has(> [data-slot="control"]:focus-visible) {
      outline-color: Highlight;
    }
    .select:has(> [data-slot="control"]:disabled) {
      border-color: GrayText;
      color: GrayText;
      opacity: 1;
    }
  }

  /* Where the browser can style the picker (`appearance: base-select`), it takes the
     field's tokens. It's only an enhancement: everything above works without it. On
     touch screens, the phone's own picker stays, since it's built for a thumb. */
  @supports (appearance: base-select) {
    @media (pointer: fine) {
      .select > [data-slot="control"],
      .select > [data-slot="control"]::picker(select) {
        appearance: base-select;
      }
      .select > [data-slot="control"] {
        /* The chosen option sits in the middle of the field, as it does in a native select. */
        align-items: center;
        /* The browser draws the chosen option in a box of its own, which text-overflow
           doesn't reach. So it stays on one line, and the indicator's room is a transparent
           border rather than padding: overflow clips before a border, so a long option
           stops short of the indicator, while a press on the border still opens the picker. */
        padding-inline-end: 0;
        border-inline-end: calc(var(--select--padding) + var(--select--indicator--size) + var(--select--gap)) solid
          transparent;
        white-space: nowrap;
        overflow: hidden;
      }
      /* The browser draws an arrow of its own, ::picker-icon, which the indicator replaces,
         so a select looks the same in every browser. */
      .select > [data-slot="control"]::picker-icon {
        display: none;
      }
      .select > [data-slot="control"]::picker(select) {
        margin-block: 0.25rem;
        padding: 0.25rem;
        border: 1px solid var(--select--border-color);
        border-radius: var(--select--radius);
        background-color: Canvas;
        color: var(--color--neutral-text);
      }
      .select > [data-slot="control"] :deep(option) {
        min-height: var(--select--height);
        padding-inline: calc(var(--select--padding) - 0.25rem);
        border-radius: calc(var(--select--radius) - 0.25rem);
      }
      .select > [data-slot="control"] :deep(option:is(:hover, :focus-visible)) {
        background-color: color-mix(in srgb, currentColor 10%, transparent);
        outline: none;
      }
      .select > [data-slot="control"] :deep(option:focus-visible) {
        outline: 2px solid var(--color--focus);
        outline-offset: -2px;
      }
    }
  }
}
</style>
