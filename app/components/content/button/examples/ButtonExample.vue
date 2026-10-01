<script setup lang="ts">
import "~/reference/button/tokens.css";

/**
 * The frame around each live example on the Button page: the example, drawn with
 * the reference implementation, above the code that renders it. Each example is
 * its own component, like ButtonVariantsExample, that passes the page's markdown
 * on as the `code` slot: a `::framework-switcher` with the code in every framework,
 * which the frame shows as the code's header. Nest it with as many colons as the
 * example, since remark-mdc only gives `#react` and the other slots to a nested
 * component written that way:
 *
 * ```md
 * ::button-variants-example
 * ::framework-switcher
 * #react
 * ```tsx
 * <Button variant="solid">Solid</Button>
 * ```
 *
 * #vue
 * ```vue
 * <Button variant="solid">Solid</Button>
 * ```
 * ::
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

    <div v-if="$slots.code" class="button-example-code [&>div>pre]:rounded-t-none [&>div]:my-0">
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

/* The framework switcher joins the example to its code: its tabs are the code's header. */
.button-example-code .framework-switcher {
  margin: 0;
  gap: 0;
}
.button-example-code .framework-switcher > [data-slot="list"] {
  border: 1px solid var(--ui-border-muted);
  border-bottom: 0;
  background-color: var(--ui-bg);
  box-shadow: inset 0 -1px 0 var(--ui-border-muted);
}
.button-example-code .framework-switcher > [role="tabpanel"] > p {
  margin: 0;
  border-inline: 1px solid var(--ui-border-muted);
  padding: 0.5rem 1rem;
}
.button-example-code .framework-switcher > [role="tabpanel"] > div > pre {
  border-top: 0;
  border-start-start-radius: 0;
  border-start-end-radius: 0;
}
</style>
