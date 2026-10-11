<script lang="ts">
import type { InjectionKey } from "vue";

export interface RadioGroupProps {
  /** The name every radio submits its value under. The hint's and error's IDs start with it, so give each group on a page its own. */
  name: string;
  /** Names the group, as its <legend>. Ask the question the radios answer, like "How would you like it delivered?" */
  legend: string;
  /** Help that applies to every option, which screen readers read with the group's name. */
  hint?: string;
  /** What's wrong and how to fix it. While it's set, the group is invalid, and screen readers say so. */
  error?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
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

const { name, legend, hint, error, size = "md", disabled = false, required = false } = defineProps<RadioGroupProps>();

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
    :disabled="disabled"
    :aria-invalid="error ? 'true' : undefined"
    :aria-describedby="describedBy()"
  >
    <!-- A fieldset groups the radios and takes its name from its legend. ARIA only supports
         aria-invalid on the radiogroup role, not on a fieldset's own group role or on a
         radio, so the fieldset takes that role, and keeps its legend as its name. -->
    <legend data-slot="legend">{{ legend }}</legend>
    <p v-if="hint" :id="`${name}-hint`" data-slot="hint">{{ hint }}</p>
    <!-- Above the radios, so people read what's wrong before they choose again. -->
    <p v-if="error" :id="`${name}-error`" data-slot="error">{{ error }}</p>
    <slot />
  </fieldset>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The group's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .radio-group {
    /* Set per size. The text sizes are the Input's, so a group sits well in a form with one. */
    --radio-group--gap: 0.25rem;
    --radio-group--font-size: 0.875rem;

    display: flex;
    flex-direction: column;
    /* Each radio is as wide as its label, so the space beside it doesn't select it. */
    align-items: flex-start;
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
}
</style>
