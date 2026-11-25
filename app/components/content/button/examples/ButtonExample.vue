<script setup lang="ts">
import "~/reference/button/tokens.css";

/**
 * The frame around the Button page's link example, the one live example there
 * that Inkline's Button can't show yet: the example, drawn with
 * the reference implementation, above the code that renders it. Each example is
 * its own component, like ButtonLinkExample, that passes the page's markdown
 * on as the `code` slot: a `::framework-switcher` with the code in every framework,
 * which shows the reader's pick. Nest it with as many colons as the example, since
 * remark-mdc only gives `#react` and the other slots to a nested component written
 * that way:
 *
 * ```md
 * ::button-link-example
 * ::framework-switcher
 * #react
 * ```tsx
 * <Button href="/docs">Read the introduction</Button>
 * ```
 *
 * #vue
 * ```vue
 * <Button href="/docs">Read the introduction</Button>
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
.button-example {
	color-scheme: light;
}
.dark .button-example {
	color-scheme: dark;
}
</style>
