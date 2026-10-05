<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import type { ButtonProps } from "~/reference/button/Button.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a variant, colour, size and state, and see the reference Button and its
 * code, in the framework picked in the Framework select.
 *
 * ```md
 * ::button-playground
 * ::
 * ```
 */
type Icon = "none" | "leading" | "trailing" | "icon only";

const variant = ref<NonNullable<ButtonProps["variant"]>>("solid");
const color = ref<NonNullable<ButtonProps["color"]>>("primary");
const size = ref<NonNullable<ButtonProps["size"]>>("md");
const icon = ref<Icon>("leading");
const disabled = ref(false);
const loading = ref(false);

const variants = ["solid", "outline", "soft", "subtle", "ghost", "link"];
const colors = ["primary", "secondary", "neutral", "success", "info", "warning", "error"];
const sizes = ["xs", "sm", "md", "lg", "xl"];
const icons: Icon[] = ["none", "leading", "trailing", "icon only"];

const LABEL = "Save changes";

const { current } = useFramework();
const framework = computed(() => current.value?.value ?? "react");

// Highlighted the way the page's own examples for each framework are.
const LANGUAGES: Record<string, string> = {
  react: "tsx",
  vue: "vue",
  svelte: "svelte",
  angular: "angular-html",
  solid: "tsx",
  astro: "astro",
  vanilla: "html",
};

// How each framework fills the `leading` and `trailing` slots, when it does so
// with a child rather than a prop (JSX).
function slot(name: "leading" | "trailing", component: string) {
  switch (framework.value) {
    case "vue":
      return `<template #${name}><${component} /></template>`;
    case "svelte":
      return `{#snippet ${name}()}<${component} />{/snippet}`;
    case "angular":
      return `<lucide-icon ${name} [img]="${component}" />`;
    default:
      return `<${component} slot="${name}" />`;
  }
}

// Only the props that differ from the defaults, the way you'd write them, or
// for Vanilla, the markup from the DOM contract.
const code = computed(() => {
  const iconOnly = icon.value === "icon only";
  const leading = icon.value === "leading" || iconOnly;
  const trailing = icon.value === "trailing";

  if (framework.value === "vanilla") {
    const attributes = [
      'class="button"',
      'type="button"',
      disabled.value && !loading.value && "disabled",
      loading.value && 'aria-disabled="true"',
      `data-variant="${variant.value}"`,
      `data-color="${color.value}"`,
      `data-size="${size.value}"`,
      iconOnly && "data-icon-only",
      loading.value && "data-loading",
    ].filter(Boolean);
    const parts = [
      leading && '<span data-slot="leading" aria-hidden="true"><svg class="lucide-check">…</svg></span>',
      `<span data-slot="label">${LABEL}</span>`,
      trailing &&
        '<span data-slot="trailing" aria-hidden="true"><svg class="lucide-arrow-right">…</svg></span>',
      loading.value &&
        '<svg class="spinner" viewBox="0 0 16 16" aria-hidden="true" data-slot="spinner">…</svg>',
    ].filter(Boolean);
    return [`<button ${attributes.join(" ")}>`, ...parts.map((part) => `  ${part}`), "</button>"].join(
      "\n",
    );
  }

  const jsx = framework.value === "react" || framework.value === "solid";
  const props = [
    variant.value !== "solid" && `variant="${variant.value}"`,
    color.value !== "neutral" && `color="${color.value}"`,
    size.value !== "md" && `size="${size.value}"`,
    iconOnly && `label="${LABEL}" ${framework.value === "vue" ? "icon-only" : "iconOnly"}`,
    disabled.value && "disabled",
    loading.value && "loading",
    jsx && leading && "leading={<CheckIcon />}",
    jsx && trailing && "trailing={<ArrowRightIcon />}",
  ].filter(Boolean);
  const children = [
    !jsx && leading && slot("leading", "CheckIcon"),
    !iconOnly && LABEL,
    !jsx && trailing && slot("trailing", "ArrowRightIcon"),
  ].filter(Boolean);

  // Angular's Button is a directive on the native element.
  const tag = framework.value === "angular" ? "button" : "Button";
  if (framework.value === "angular") props.unshift("appButton");
  const open = `<${tag}${props.length ? ` ${props.join(" ")}` : ""}`;
  if (!children.length) return `${open} />`;
  return [`${open}>`, ...children.map((child) => `  ${child}`), `</${tag}>`].join("\n");
});
</script>

<template>
  <div class="button-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-4">
      <UFormField label="Variant" size="sm">
        <USelect v-model="variant" :items="variants" class="w-full" />
      </UFormField>
      <UFormField label="Color" size="sm">
        <USelect v-model="color" :items="colors" class="w-full" />
      </UFormField>
      <UFormField label="Size" size="sm">
        <USelect v-model="size" :items="sizes" class="w-full" />
      </UFormField>
      <UFormField label="Icon" size="sm">
        <USelect v-model="icon" :items="icons" class="w-full" />
      </UFormField>
      <USwitch v-model="disabled" label="Disabled" size="sm" />
      <USwitch v-model="loading" label="Loading" size="sm" />
    </div>

    <div class="flex min-h-32 items-center justify-center p-6">
      <Button
        :variant="variant"
        :color="color"
        :size="size"
        :label="icon === 'icon only' ? LABEL : undefined"
        :icon-only="icon === 'icon only'"
        :disabled="disabled"
        :loading="loading"
      >
        <template v-if="icon === 'leading' || icon === 'icon only'" #leading>
          <UIcon name="i-lucide-check" />
        </template>
        <template v-if="icon !== 'icon only'" #default>{{ LABEL }}</template>
        <template v-if="icon === 'trailing'" #trailing>
          <UIcon name="i-lucide-arrow-right" class="rtl:-scale-x-100" />
        </template>
      </Button>
    </div>

    <ProsePre
      :code="code"
      :language="LANGUAGES[framework]"
      :ui="{ root: 'my-0' }"
      class="rounded-none border-0 border-t border-muted"
    >{{ code }}</ProsePre>
  </div>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.button-playground {
  color-scheme: light;
}
.dark .button-playground {
  color-scheme: dark;
}
</style>
