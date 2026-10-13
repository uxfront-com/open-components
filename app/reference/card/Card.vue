<script setup lang="ts">
export interface CardProps {
  /** The element it renders: `li` in a list of cards, or `section` or `div` for a card that isn't self-contained. */
  as?: "article" | "section" | "div" | "li";
  /** The heading, when it's plain text. The `heading` slot takes precedence. It isn't `title`, which is an HTML attribute that shows a tooltip. */
  heading?: string;
  /** The heading's level, which fits the page's outline: 3 under a section's `<h2>`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Links the card through its heading, and stretches the link over the whole card. */
  href?: string;
}

const { as = "article", heading, headingLevel = 3, href } = defineProps<CardProps>();

defineSlots<{
  /** The body, like a sentence or two and some details. */
  default?: () => unknown;
  /** The heading, when it's more than plain text, or your router's link. A link here stretches over the card too. */
  heading?: () => unknown;
  /** A short line shown above the heading, like a category, which comes after it in the DOM. */
  eyebrow?: () => unknown;
  /** An image, shown at the top, which comes after the heading in the DOM. */
  media?: () => unknown;
  /** Buttons that act on the card, like Save, which sit above the stretched link and stay reachable with Tab. */
  actions?: () => unknown;
  /** A last line of details about the card, like who made it or when. */
  footer?: () => unknown;
}>();
</script>

<template>
  <!-- The heading comes first in the DOM, so heading navigation lands at the start of
       the card. The media and the eyebrow come after it, and CSS shows them above it. -->
  <component :is="as" class="card">
    <div data-slot="header">
      <component :is="`h${headingLevel}`" data-slot="heading">
        <a v-if="href" data-slot="link" :href="href">
          <slot name="heading">{{ heading }}</slot>
        </a>
        <slot v-else name="heading">{{ heading }}</slot>
      </component>
      <p v-if="$slots.eyebrow" data-slot="eyebrow">
        <slot name="eyebrow" />
      </p>
    </div>
    <div v-if="$slots.media" data-slot="media">
      <slot name="media" />
    </div>
    <div v-if="$slots.default" data-slot="body">
      <slot />
    </div>
    <div v-if="$slots.actions" data-slot="actions">
      <slot name="actions" />
    </div>
    <div v-if="$slots.footer" data-slot="footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The card's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .card {
    --card--padding: 1.25rem;
    --card--gap: 0.75rem;
    --card--radius: 0.75rem;
    /* The card's border is decoration: its heading says what it is, so it doesn't need 3:1. */
    --card--border-color: color-mix(in srgb, currentColor 20%, transparent);
    --card--background: transparent;
    --card--media--aspect-ratio: 16 / 9;

    /* The containing block of the stretched link. */
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--card--gap);
    box-sizing: border-box;
    /* In a grid or a flex row, it can get narrower than its content, rather than overflow. */
    min-width: 0;
    margin: 0;
    padding: var(--card--padding);
    border: 1px solid var(--card--border-color);
    border-radius: var(--card--radius);
    background-color: var(--card--background);
    color: var(--color--neutral-text);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
    /* A list item's marker, when it's an `li`. */
    list-style: none;
    /* Long words, like a web address, wrap rather than overflow the card. */
    overflow-wrap: break-word;
  }

  /* Parts. They have no borders of their own: a line between two of them is a separator's
     job, which a page adds where it needs one. No height is fixed anywhere, so the card
     grows with its text. */
  .card > [data-slot="header"] {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  /* The body takes the spare height, so actions and footers line up across a row of
     cards of one height. */
  .card > [data-slot="body"] {
    flex-grow: 1;
  }
  .card > [data-slot="header"] > [data-slot="heading"] {
    margin: 0;
    color: inherit;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.375;
  }
  /* Shown above the heading, while screen readers read it after the heading. */
  .card > [data-slot="header"] > [data-slot="eyebrow"] {
    order: -1;
    margin: 0;
    /* The text colour at 70%, which has 4.5:1 against the page. */
    color: color-mix(in srgb, currentColor 70%, transparent);
    font-size: 0.75rem;
    font-weight: 500;
  }
  /* The media fills the top of the card, edge to edge, while it comes after the
     heading in the DOM. Its aspect ratio holds its space while the image loads. */
  .card > [data-slot="media"] {
    order: -1;
    margin-block-start: calc(-1 * var(--card--padding));
    margin-inline: calc(-1 * var(--card--padding));
    overflow: hidden;
    border-start-start-radius: calc(var(--card--radius) - 1px);
    border-start-end-radius: calc(var(--card--radius) - 1px);
    background-color: color-mix(in srgb, currentColor 8%, transparent);
    aspect-ratio: var(--card--media--aspect-ratio);
  }
  .card > [data-slot="media"] > :slotted(:is(img, picture, video, svg)) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .card > [data-slot="actions"] {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
  .card > [data-slot="footer"] {
    /* The text colour at 70%, which has 4.5:1 against the page. */
    color: color-mix(in srgb, currentColor 70%, transparent);
    font-size: 0.75rem;
  }

  /* A link in the heading, the Card's own or one in the `heading` slot, stretches over
     the card with a pseudo-element, so pressing anywhere on the card follows it,
     while the link's name stays the heading alone. */
  .card > [data-slot="header"] > [data-slot="heading"] :deep(a[href]) {
    color: inherit;
    text-decoration: none;
    outline: none;
  }
  .card > [data-slot="header"] > [data-slot="heading"] :deep(a[href])::after {
    content: "";
    position: absolute;
    /* Over the border too, so the focus ring sits where it would around the card. */
    inset: -1px;
    border-radius: var(--card--radius);
  }
  /* Everything else people can press sits above the stretched link, so it does what
     it says rather than follow the link. */
  .card > [data-slot="header"] > [data-slot="eyebrow"] :deep(a[href]),
  .card > :is([data-slot="body"], [data-slot="actions"], [data-slot="footer"]) :deep(:is(a[href], button, input, select, textarea, summary, [tabindex])) {
    position: relative;
    z-index: 1;
  }

  /* States. The card only has any when it's a link. Focus is drawn around the whole
     card, by the link's pseudo-element, while an action shows its own focus ring. */
  .card > [data-slot="header"] > [data-slot="heading"] :deep(a[href]:focus-visible)::after {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  @media (hover: hover) {
    /* Only while the pointer is over the link, so not over an action. */
    .card:has(> [data-slot="header"] > [data-slot="heading"] a[href]:hover) {
      --card--border-color: color-mix(in srgb, currentColor 45%, transparent);
    }
    .card > [data-slot="header"] > [data-slot="heading"] :deep(a[href]:hover) {
      text-decoration-line: underline;
      text-underline-offset: 0.2em;
    }
  }

  /* With more contrast, the border is drawn in the text colour at full strength, on
     hover too, so this repeats the hover rule's selector, which it comes after. */
  @media (prefers-contrast: more) {
    .card,
    .card:has(> [data-slot="header"] > [data-slot="heading"] a[href]:hover) {
      --card--border-color: currentColor;
    }
  }

  /* Forced colors mode keeps the border in a system colour, and the focus ring in Highlight. */
  @media (forced-colors: active) {
    .card > [data-slot="header"] > [data-slot="heading"] :deep(a[href]:focus-visible)::after {
      outline-color: Highlight;
    }
  }
}
</style>
