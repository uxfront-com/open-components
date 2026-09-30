<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import type { ButtonProps } from "~/reference/button/Button.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a variant, colour, size and state, and see the reference Button and its code.
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

// Only the props that differ from the defaults, the way you'd write them.
const code = computed(() => {
  const props = [
    variant.value !== "solid" && `variant="${variant.value}"`,
    color.value !== "neutral" && `color="${color.value}"`,
    size.value !== "md" && `size="${size.value}"`,
    icon.value === "icon only" && `label="${LABEL}" icon-only`,
    disabled.value && "disabled",
    loading.value && "loading",
  ].filter(Boolean);
  const open = `<Button${props.length ? ` ${props.join(" ")}` : ""}>`;
  const lines = [open];
  if (icon.value === "leading" || icon.value === "icon only") {
    lines.push("  <template #leading><CheckIcon /></template>");
  }
  if (icon.value !== "icon only") lines.push(`  ${LABEL}`);
  if (icon.value === "trailing") {
    lines.push("  <template #trailing><ArrowRightIcon /></template>");
  }
  lines.push("</Button>");
  return lines.join("\n");
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
      language="vue"
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
