<script setup lang="ts">
/**
 * Replaces @uxfront/layer-docs's, which adds a tab per framework to every
 * example. The Framework select above the sidebar already picks the framework
 * for the whole site, so this only shows the code for the reader's pick:
 *
 * ```md
 * ::framework-switcher
 * #react
 * …
 * #vue
 * …
 * ::
 * ```
 *
 * A page can cover only some frameworks. The others show the first one it
 * covers, with a note saying so.
 */
const { frameworks, current } = useFramework();
const slots = useSlots();

const shown = computed(() =>
  current.value && slots[current.value.value]
    ? current.value
    : frameworks.value.find((option) => slots[option.value]),
);
</script>

<template>
  <p v-if="current && shown && shown !== current" class="my-5 text-sm text-muted">
    Not available for {{ current.label }}, showing {{ shown.label }}.
  </p>
  <slot v-if="shown" :name="shown.value" />
</template>
