<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";

export interface TagProps {
  /** The text, when it's plain text. The default slot takes precedence, but the remove button's name is built from this, so give it whenever the tag is removable. */
  label?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Makes the label a link (`<a href>`), to a page about what the tag names. */
  href?: string;
  /** Adds a remove button after the label, which fires `remove`. The tag doesn't remove itself. */
  removable?: boolean;
  /** The remove button's name, which screen readers read and voice control users say. */
  removeLabel?: (label: string) => string;
  /** Dims the tag, drops its remove button and turns its link off. */
  disabled?: boolean;
  /** Drops the remove button and keeps the tag's look, so people can read it but not remove it. A link still works. */
  readonly?: boolean;
}

const {
  label,
  size = "md",
  href,
  removable = false,
  removeLabel = (label: string) => `Remove ${label}`,
  disabled = false,
  readonly = false,
} = defineProps<TagProps>();

const emit = defineEmits<{
  /** Fires when the remove button is pressed. Never while disabled or read-only, which have no remove button. */
  remove: [event: MouseEvent];
}>();

defineSlots<{
  /** The label, when it's more than plain text, or your router's link, which the tag styles like its own. */
  default?: () => unknown;
  /** An icon before the label, hidden from assistive technologies. */
  leading?: () => unknown;
  /** The remove button's icon. The button and its name stay. */
  remove?: () => unknown;
}>();

const root = useTemplateRef<HTMLElement>("root");

onMounted(() => {
  if (import.meta.env.DEV && removable && !label) {
    console.warn("[Tag] is removable without a label, so its remove button can't say what it removes: give it a label.", root.value);
  }
});
</script>

<template>
  <!-- A plain <span>, with no role, so a screen reader reads the tag as text. Only its link
       and its remove button are interactive, and they're siblings, never one inside the other. -->
  <span
    ref="root"
    class="tag"
    :data-size="size"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <span v-if="$slots.leading" data-slot="leading" aria-hidden="true">
      <slot name="leading" />
    </span>
    <span data-slot="label">
      <!-- A disabled link loses its href, so it can't be followed, and keeps its role. -->
      <a
        v-if="href"
        :href="disabled ? undefined : href"
        :role="disabled ? 'link' : undefined"
        :aria-disabled="disabled || undefined"
      >
        <slot>{{ label }}</slot>
      </a>
      <slot v-else>{{ label }}</slot>
    </span>
    <button
      v-if="removable && !disabled && !readonly"
      data-slot="remove"
      type="button"
      :aria-label="removeLabel(label ?? '')"
      @click="emit('remove', $event)"
    >
      <slot name="remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </slot>
    </button>
  </span>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The tag's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .tag {
    /* The same values as the Select's tags, size for size. */
    --tag--height: 1.5rem;
    --tag--padding: 0.5rem;
    --tag--gap: 0.25rem;
    --tag--radius: 0.25rem;
    --tag--font-size: 0.75rem;
    --tag--background: color-mix(in srgb, currentColor 10%, transparent);
    --tag--color: var(--color--neutral-text);
    --tag--border-color: transparent;
    --tag--icon--size: 1em;
    /* A link tag has a border, at 3:1 against the page like the Input's, so it looks different
       from a plain one without relying on colour. */
    --tag--link--border-color: color-mix(in srgb, currentColor 55%, transparent);
    --tag--hover--background: color-mix(in srgb, currentColor 16%, transparent);

    /* The containing block of the link's hit area and focus ring. */
    position: relative;
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    max-width: 100%;
    /* A min-height in rem rather than a height, so the tag grows with larger text. */
    min-height: var(--tag--height);
    padding-inline: var(--tag--padding);
    /* Drawn inside, so a link tag is the same size as a plain one, and as the Select's tags. */
    box-shadow: inset 0 0 0 1px var(--tag--border-color);
    border-radius: var(--tag--radius);
    background-color: var(--tag--background);
    color: var(--tag--color);
    font-family: inherit;
    font-size: var(--tag--font-size);
    line-height: 1.25;
    vertical-align: middle;
  }
  /* The remove button runs to the end edge, so it takes the end padding's place. */
  .tag:has(> [data-slot="remove"]) {
    padding-inline-end: 0;
  }

  /* Sizes */
  .tag[data-size="xs"] {
    --tag--height: 1.125rem;
    --tag--padding: 0.25rem;
    --tag--font-size: 0.6875rem;
  }
  .tag[data-size="sm"] {
    --tag--height: 1.25rem;
  }
  .tag[data-size="lg"] {
    --tag--height: 1.75rem;
    --tag--font-size: 0.875rem;
  }
  .tag[data-size="xl"] {
    --tag--height: 2rem;
    --tag--font-size: 0.875rem;
  }

  /* Parts */
  .tag > [data-slot="leading"] {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    margin-inline-end: var(--tag--gap);
  }
  .tag > [data-slot="leading"] > :slotted(svg) {
    width: var(--tag--icon--size);
    height: var(--tag--icon--size);
  }
  /* A long label stays on one line and ends in an ellipsis, while its full text stays in the DOM. */
  .tag > [data-slot="label"] {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* A link in the label, the Tag's own or one in the default slot, like a router's. Its
     ::before is its hit area, at least 24 × 24px, and its ::after the focus ring, both
     over the whole tag. The remove button sits above them, so it does what it says. */
  .tag:has(> [data-slot="label"] a) {
    --tag--border-color: var(--tag--link--border-color);
  }
  .tag > [data-slot="label"] :deep(a) {
    color: inherit;
    text-decoration: none;
    outline: none;
  }
  .tag > [data-slot="label"] :deep(a)::before,
  .tag > [data-slot="label"] :deep(a)::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--tag--radius);
  }
  .tag > [data-slot="label"] :deep(a)::before {
    inset-block: min(0px, (var(--tag--height) - 1.5rem) / 2);
    min-width: 1.5rem;
  }
  .tag > [data-slot="label"] :deep(a[href]) {
    cursor: pointer;
  }

  .tag > [data-slot="remove"] {
    position: relative;
    z-index: 1;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: var(--tag--height);
    height: var(--tag--height);
    margin: 0;
    padding: 0;
    /* Transparent, so a link tag's border shows through it, even behind its hover background. */
    border: 1px solid transparent;
    border-radius: inherit;
    background: transparent;
    background-clip: padding-box;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .tag > [data-slot="remove"] > :slotted(svg),
  .tag > [data-slot="remove"] > svg {
    width: 0.75em;
    height: 0.75em;
  }
  /* At least 24 × 24px to press, whatever the tag's size. Less 1px, since it's placed
     inside the button's transparent border. */
  .tag > [data-slot="remove"]::before {
    content: "";
    position: absolute;
    inset: calc(min(0px, (var(--tag--height) - 1.5rem) / 2) - 1px);
  }

  /* States. Focus shows on the link, around the whole tag, and on the remove button,
     inside it, so neither moves anything. */
  .tag > [data-slot="label"] :deep(a:focus-visible)::after {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  .tag > [data-slot="remove"]:focus-visible {
    outline: 2px solid var(--color--focus);
    outline-offset: -2px;
  }
  @media (hover: hover) {
    .tag:has(> [data-slot="label"] a[href]:hover) {
      --tag--background: var(--tag--hover--background);
    }
    .tag > [data-slot="label"] :deep(a[href]:hover) {
      text-decoration-line: underline;
      text-underline-offset: 0.2em;
    }
    .tag > [data-slot="remove"]:hover {
      background-color: var(--tag--hover--background);
    }
  }
  .tag[data-disabled] {
    opacity: 0.5;
  }
  .tag[data-disabled] > [data-slot="label"] :deep(a) {
    cursor: not-allowed;
  }

  /* On touch screens, the remove button and a link reach at least 44px tall. */
  @media (any-pointer: coarse) {
    .tag > [data-slot="label"] :deep(a)::before {
      inset-block: min(0px, (var(--tag--height) - 2.75rem) / 2);
    }
    .tag > [data-slot="remove"]::before {
      inset-block: calc(min(0px, (var(--tag--height) - 2.75rem) / 2) - 1px);
    }
  }

  /* With more contrast, a link's border is drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .tag {
      --tag--link--border-color: currentColor;
    }
  }

  /* Forced colors mode drops backgrounds and shadows, so every tag gets a real border in a
     system colour, as the Select's tags do, focus is drawn in Highlight and a disabled tag
     in GrayText. */
  @media (forced-colors: active) {
    .tag {
      border: 1px solid CanvasText;
    }
    /* Its transparent border would show, over the tag's own. Its hit area only grows. */
    .tag > [data-slot="remove"] {
      border: 0;
    }
    .tag:has(> [data-slot="label"] a[href]) {
      border-color: LinkText;
    }
    .tag > [data-slot="label"] :deep(a:focus-visible)::after,
    .tag > [data-slot="remove"]:focus-visible {
      outline-color: Highlight;
    }
    .tag[data-disabled] {
      border-color: GrayText;
      color: GrayText;
      opacity: 1;
    }
  }
}
</style>
