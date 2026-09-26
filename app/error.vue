<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();

const code = props.error.statusCode ?? 500;
const notFound = code === 404;
const title = notFound ? "Page not found" : "Something went wrong";

useSeoMeta({
  title,
  description: title,
  robots: "noindex",
});

const goHome = (event: MouseEvent) => {
  event.preventDefault();
  void clearError({ redirect: "/" });
};
</script>

<template>
  <UxErrorPage
    :code="code"
    :title="title"
    :lead="notFound ? 'This page is not part of the standard.' : 'Please try again in a moment.'"
    home-label="Back to Open Components"
    @home="goHome"
  />
</template>
