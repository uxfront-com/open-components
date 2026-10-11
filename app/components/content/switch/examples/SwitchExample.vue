<script setup lang="ts">
import "~/reference/button/tokens.css";

/**
 * The frame around each live example on the Switch page, the same as ButtonExample
 * on the Button page: the example, drawn with the reference implementation, above
 * the code that renders it, which is the page's `::framework-switcher`. Nest it with
 * as many colons as the example:
 *
 * ```md
 * ::switch-sizes-example
 * ::framework-switcher
 * #vue
 * ```vue
 * <Switch id="wifi" size="xs" />
 * ```
 * ::
 * ::
 * ```
 */
</script>

<template>
  <div class="my-5">
    <div
      class="switch-example not-prose relative flex justify-center rounded-md border border-muted p-4"
      :class="{ 'rounded-b-none border-b-0': $slots.code }"
    >
      <slot />
    </div>

    <div
      v-if="$slots.code"
      class="[&>div>pre]:rounded-t-none [&>div]:my-0 [&>p]:my-0 [&>p]:border-x [&>p]:border-muted [&>p]:px-4 [&>p]:py-2"
    >
      <slot name="code" />
    </div>
  </div>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.switch-example {
  color-scheme: light;
}
.dark .switch-example {
  color-scheme: dark;
}
</style>
