<script setup lang="ts">
import { nextTick, onMounted, useAttrs, useTemplateRef, watchEffect } from "vue";

export interface CheckboxProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
}

// Attributes go on the <input> rather than on the root, so they're declared below.
defineOptions({ inheritAttrs: false });

const { size = "md", disabled = false } = defineProps<CheckboxProps>();

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
    font-family: inherit;
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
    .checkbox:hover:where(:not(:has(> [data-slot="box"]:disabled))) {
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
