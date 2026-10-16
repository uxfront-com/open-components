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
