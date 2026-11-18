<script setup lang="ts">
/**
 * The day a post was published, as the changelog shows its entries' days
 * (ChangelogEntry.vue): "18 November 2026".
 */
const props = defineProps<{ date: string }>();

// Posts are dated like 2026-11-18, which Date reads as midnight UTC: formatted in
// UTC, it's the same day in every time zone, on the server and in the browser.
const formatted = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(
  new Date(props.date),
);
</script>

<template>
  <time :datetime="date">{{ formatted }}</time>
</template>
