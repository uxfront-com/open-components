<script setup lang="ts">
import "~/reference/button/tokens.css";

/**
 * The frame around each live example on the Button page: the example, drawn with
 * the reference implementation, above the code that renders it. Each example is
 * its own component, like ButtonVariantsExample, that passes the page's code block
 * on as the `code` slot, so the page's markdown keeps a plain code block:
 *
 * ```md
 * ::button-variants-example
 * ```vue
 * <Button variant="solid">Solid</Button>
 * ```
 * ::
 * ```
 */
</script>

<template>
  <div class="my-5">
    <div
      class="button-example not-prose relative flex justify-center rounded-md border border-muted p-4"
      :class="{ 'rounded-b-none border-b-0': $slots.code }"
    >
      <slot />
    </div>

    <div v-if="$slots.code" class="[&>div>pre]:rounded-t-none [&>div]:my-0">
      <slot name="code" />
    </div>
  </div>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.button-example {
  color-scheme: light;
}
.dark .button-example {
  color-scheme: dark;
}
</style>
