<script setup lang="ts">
/**
 * A picture for the media of the Card page's live examples, drawn as an SVG in a
 * data URL, so the examples don't load images of their own. It's an `<img>`, like
 * the ones in the examples' code, and it only illustrates the card's heading, so its
 * `alt` is empty. `hue` picks its colour, in OKLCH.
 */
const { hue = 275 } = defineProps<{ hue?: number }>();

const src = computed(
  () =>
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90">` +
        `<rect width="160" height="90" fill="oklch(90% 0.05 ${hue})"/>` +
        `<circle cx="116" cy="38" r="24" fill="oklch(72% 0.12 ${hue})"/>` +
        `<path d="M0 90 L52 44 L88 72 L110 58 L160 90 Z" fill="oklch(55% 0.14 ${hue})"/>` +
        `</svg>`,
    )}`,
);
</script>

<template>
  <img :src="src" alt="" width="160" height="90" />
</template>
