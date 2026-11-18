<script setup lang="ts">
import type { BlogCollectionItem } from "@nuxt/content";
import { readingTime } from "~/lib/reading-time";

/**
 * A post's byline: its author, linked when the post gives a URL, the day it was
 * published and its reading time, set apart by "·". On /blog, each row shows the
 * day above the title instead, so the byline leaves it out there.
 */
const props = defineProps<{
  post: BlogCollectionItem;
  // On /blog, which lists every post.
  listed?: boolean;
}>();

const minutes = computed(() => readingTime(props.post.body));
</script>

<template>
  <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
    <span>
      By
      <NuxtLink v-if="post.author.url" :to="post.author.url" class="font-medium text-default hover:underline">
        {{ post.author.name }}
      </NuxtLink>
      <span v-else class="font-medium text-default">{{ post.author.name }}</span>
    </span>
    <template v-if="!listed">
      <span aria-hidden="true">·</span>
      <BlogDate :date="post.date" />
    </template>
    <span aria-hidden="true">·</span>
    <span>{{ minutes }} min read</span>
  </p>
</template>
