<script setup lang="ts">
import { computed, onMounted, useTemplateRef, watch } from "vue";
import { announce, prepareAnnouncer } from "./announce";

export interface ButtonProps {
  /** How much attention the button asks for. */
  variant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link";
  /** What the action means. */
  color?: "primary" | "secondary" | "neutral" | "success" | "info" | "warning" | "error";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** The label, when it's plain text. The default slot takes precedence. */
  label?: string;
  /** Shows only the leading icon. The label is hidden, but it still names the button. */
  iconOnly?: boolean;
  /** "button" by default, so the button never submits a form by accident. */
  type?: "button" | "submit" | "reset";
  /** Renders a link (`<a href>`) that looks like a button, for navigation. */
  href?: string;
  disabled?: boolean;
  /** Keeps the disabled button in the tab order, so people can find it and learn why. */
  focusableWhenDisabled?: boolean;
  /** Blocks activation and shows a spinner, keeping the button's focus and size. */
  loading?: boolean;
  /** Announced to screen readers when loading starts. */
  loadingLabel?: string;
}

const {
  variant = "solid",
  color = "neutral",
  size = "md",
  label,
  iconOnly = false,
  type = "button",
  href,
  disabled = false,
  focusableWhenDisabled = false,
  loading = false,
  loadingLabel = "Loading",
} = defineProps<ButtonProps>();

const emit = defineEmits<{
  /** Not emitted while the button is disabled or loading. */
  click: [event: MouseEvent];
}>();

defineSlots<{
  /** The label. */
  default?: () => unknown;
  /** An icon before the label, which is also the icon of an icon-only button. */
  leading?: () => unknown;
  /** An icon after the label. */
  trailing?: () => unknown;
}>();

// The button can't be activated while it's disabled or loading.
const inactive = computed(() => disabled || loading);
// A loading button was just pressed, so it keeps its focus, which native
// `disabled` would drop. Links can't be natively disabled at all.
const focusable = computed(() => loading || focusableWhenDisabled);
const nativeDisabled = computed(() => disabled && !focusable.value && !href);

function onClick(event: MouseEvent) {
  if (inactive.value) {
    // aria-disabled doesn't stop activation on its own, so cancel the form
    // submission or navigation, and keep the click from reaching other listeners.
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  emit("click", event);
}

watch(
  () => loading,
  (isLoading) => {
    if (isLoading) announce(loadingLabel);
  },
);

const root = useTemplateRef<HTMLElement>("root");

onMounted(() => {
  prepareAnnouncer();

  if (import.meta.env.DEV) {
    const el = root.value;
    const named = el?.textContent?.trim() || el?.hasAttribute("aria-label") || el?.hasAttribute("aria-labelledby");
    if (el && !named) {
      console.warn("[Button] has no accessible name: give it a label, even when icon-only.", el);
    }
  }
});
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    ref="root"
    class="button"
    :type="href ? undefined : type"
    :href="href && !inactive ? href : undefined"
    :role="href && inactive ? 'link' : undefined"
    :tabindex="href && inactive && focusable ? 0 : undefined"
    :disabled="nativeDisabled"
    :aria-disabled="(inactive && !nativeDisabled) || undefined"
    :data-variant="variant"
    :data-color="color"
    :data-size="size"
    :data-icon-only="iconOnly ? '' : undefined"
    :data-loading="loading ? '' : undefined"
    @click="onClick"
  >
    <span v-if="$slots.leading" data-slot="leading" aria-hidden="true">
      <slot name="leading" />
    </span>
    <span v-if="$slots.default || label" data-slot="label">
      <slot>{{ label }}</slot>
    </span>
    <span v-if="$slots.trailing && !iconOnly" data-slot="trailing" aria-hidden="true">
      <slot name="trailing" />
    </span>
    <svg v-if="loading" data-slot="spinner" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="2" opacity="0.25" />
      <path d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </component>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The button's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .button {
    /* Set per size. */
    --button--height: 2.25rem;
    --button--padding: 1rem;
    --button--gap: 0.5rem;
    --button--font-size: 0.875rem;
    --button--icon--size: 1rem;
    --button--radius: 0.5rem;
    /* Set per colour, from the theme tokens. */
    --button--fill: var(--color--neutral);
    --button--fill-contrast: var(--color--neutral-contrast);
    --button--text: var(--color--neutral-text);
    /* The state layer lays the label's colour over the background (8% on hover, 12% when pressed). */
    --button--state: 0%;

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--button--gap);
    box-sizing: border-box;
    /* A min-height rather than a height, so the button grows with larger text and wrapped labels. */
    min-height: var(--button--height);
    min-width: var(--button--height);
    padding: 0.125rem var(--button--padding);
    margin: 0;
    /* Transparent, until forced colors mode draws it as the button's outline. */
    border: 1px solid transparent;
    border-radius: var(--button--radius);
    background-color: transparent;
    background-image: linear-gradient(
      color-mix(in srgb, currentColor var(--button--state), transparent) 0 0
    );
    font-family: inherit;
    font-size: var(--button--font-size);
    font-weight: 500;
    line-height: 1.25;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  /* Sizes */
  .button[data-size="xs"] {
    --button--height: 1.5rem;
    --button--padding: 0.5rem;
    --button--gap: 0.25rem;
    --button--font-size: 0.75rem;
    --button--icon--size: 0.875rem;
    --button--radius: 0.375rem;
  }
  .button[data-size="sm"] {
    --button--height: 2rem;
    --button--padding: 0.75rem;
    --button--radius: 0.375rem;
  }
  .button[data-size="lg"] {
    --button--height: 2.5rem;
    --button--padding: 1.25rem;
    --button--font-size: 1rem;
    --button--icon--size: 1.25rem;
  }
  .button[data-size="xl"] {
    --button--height: 3rem;
    --button--padding: 1.5rem;
    --button--font-size: 1rem;
    --button--icon--size: 1.25rem;
    --button--radius: 0.75rem;
  }

  /* Colours */
  .button[data-color="primary"] {
    --button--fill: var(--color--primary);
    --button--fill-contrast: var(--color--primary-contrast);
    --button--text: var(--color--primary-text);
  }
  .button[data-color="secondary"] {
    --button--fill: var(--color--secondary);
    --button--fill-contrast: var(--color--secondary-contrast);
    --button--text: var(--color--secondary-text);
  }
  .button[data-color="success"] {
    --button--fill: var(--color--success);
    --button--fill-contrast: var(--color--success-contrast);
    --button--text: var(--color--success-text);
  }
  .button[data-color="info"] {
    --button--fill: var(--color--info);
    --button--fill-contrast: var(--color--info-contrast);
    --button--text: var(--color--info-text);
  }
  .button[data-color="warning"] {
    --button--fill: var(--color--warning);
    --button--fill-contrast: var(--color--warning-contrast);
    --button--text: var(--color--warning-text);
  }
  .button[data-color="error"] {
    --button--fill: var(--color--error);
    --button--fill-contrast: var(--color--error-contrast);
    --button--text: var(--color--error-text);
  }

  /* Variants, from the most emphasis to the least */
  .button[data-variant="solid"] {
    background-color: var(--button--fill);
    color: var(--button--fill-contrast);
  }
  .button[data-variant="outline"] {
    border-color: color-mix(in srgb, currentColor 40%, transparent);
    color: var(--button--text);
  }
  .button[data-variant="soft"],
  .button[data-variant="subtle"] {
    background-color: color-mix(in srgb, var(--button--fill) 12%, transparent);
    color: var(--button--text);
  }
  .button[data-variant="subtle"] {
    border-color: color-mix(in srgb, currentColor 25%, transparent);
  }
  .button[data-variant="ghost"] {
    color: var(--button--text);
  }
  .button[data-variant="link"] {
    min-width: 0;
    padding-inline: 0;
    background-image: none;
    color: var(--button--text);
    /* Underlined at rest, so it doesn't rely on colour alone to stand out from the text around it. */
    text-decoration-line: underline;
    text-underline-offset: 0.25em;
  }

  /* States. Each one reads the attribute that exposes it, so what people see and
     what assistive technologies report can't drift apart. */
  @media (hover: hover) {
    .button:hover {
      --button--state: 8%;
    }
    .button[data-variant="link"]:hover:not(:disabled, [aria-disabled="true"]) {
      text-decoration-thickness: 2px;
    }
  }
  .button:active,
  .button[aria-pressed="true"],
  .button[aria-expanded="true"] {
    --button--state: 12%;
  }
  .button:focus-visible {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  .button:disabled,
  .button[aria-disabled="true"] {
    --button--state: 0%;
    cursor: not-allowed;
  }
  .button:disabled:not([data-loading]),
  .button[aria-disabled="true"]:not([data-loading]) {
    opacity: 0.5;
  }
  .button[data-loading] {
    cursor: progress;
  }

  /* Parts */
  [data-slot="leading"],
  [data-slot="trailing"] {
    display: inline-flex;
    flex-shrink: 0;
    width: var(--button--icon--size);
    height: var(--button--icon--size);
  }
  [data-slot="leading"] > :slotted(*),
  [data-slot="trailing"] > :slotted(*) {
    width: 100%;
    height: 100%;
  }
  .button[data-icon-only] {
    padding-inline: 0;
  }

  /* While loading, the spinner covers the content, which stays in place so the
     size doesn't change, and in the accessibility tree so the name doesn't either. */
  .button[data-loading] > :not([data-slot="spinner"]) {
    opacity: 0;
  }
  [data-slot="spinner"] {
    position: absolute;
    inset: 0;
    width: var(--button--icon--size);
    height: var(--button--icon--size);
    margin: auto;
    animation: button-spin 0.8s linear infinite;
  }
  @keyframes button-spin {
    to {
      rotate: 1turn;
    }
  }
  @keyframes button-pulse {
    50% {
      opacity: 0.4;
    }
  }

  /* When the button is icon-only, the label is visually hidden, but it still names the button. */
  .button[data-icon-only] > [data-slot="label"] {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* On touch screens, every size gets a hit area of at least 44 × 44px. */
  @media (any-pointer: coarse) {
    .button::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: max(100%, 2.75rem);
      height: max(100%, 2.75rem);
      translate: -50% -50%;
    }
  }

  /* With reduced motion, the spinner pulses instead of turning. */
  @media (prefers-reduced-motion: reduce) {
    [data-slot="spinner"] {
      animation: button-pulse 1.6s ease-in-out infinite;
    }
  }

  /* With more contrast, borders are drawn in the label's colour at full strength. */
  @media (prefers-contrast: more) {
    .button[data-variant="outline"],
    .button[data-variant="subtle"] {
      border-color: currentColor;
    }
  }

  /* Forced colors mode drops backgrounds and gradients, so mark states with system colours. */
  @media (forced-colors: active) {
    .button:focus-visible {
      outline-color: Highlight;
    }
    .button[aria-pressed="true"],
    .button[aria-expanded="true"] {
      /* We set a system colour pair ourselves, so opt out, or the browser puts a
         Canvas backplate behind the label. */
      forced-color-adjust: none;
      background-color: Highlight;
      color: HighlightText;
    }
    .button:disabled,
    .button[aria-disabled="true"] {
      border-color: GrayText;
      color: GrayText;
      opacity: 1;
    }
    .button[data-variant="link"] {
      padding-inline: 0.25rem;
    }
  }
}
</style>
