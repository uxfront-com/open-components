<script setup lang="ts">
import { inject, onMounted, useAttrs, useTemplateRef } from "vue";
import { RadioGroupKey } from "./RadioGroup.vue";

export interface RadioProps {
  /** What the group's `v-model` holds, and its form submits, while this radio is checked. */
  value: string;
  /** Takes this one option away, while the others stay. Arrow keys skip it. */
  disabled?: boolean;
  /** Starts the group on this radio, when the group has no value yet. It hands the group its value, so `v-model`, the checked radio and the form agree. */
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
if (checked && group && group.value === undefined) group.select(value);

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
      :checked="group ? group.value === value : checked"
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
