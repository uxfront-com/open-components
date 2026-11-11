<script setup lang="ts">
import Field from "~/reference/field/Field.vue";
import Select from "~/reference/select/Select.vue";
import type { SelectProps } from "~/reference/select/Select.vue";
import { countries } from "~/data/select-options";
import "~/reference/button/tokens.css";

/**
 * Pick a size and a few options, then use the reference Select, and see its code, in the
 * framework picked in the Framework select.
 *
 * ```md
 * ::select-playground
 * ::
 * ```
 */
type Size = NonNullable<SelectProps["size"]>;

const size = ref<Size>("md");
const multiple = ref(false);
const nativeOnTouch = ref(false);
const disabled = ref(false);
const readonly = ref(false);

const sizes: Size[] = ["xs", "sm", "md", "lg", "xl"];

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

// The Select with only the props that differ from the defaults, the way you'd write them in
// each framework, or for Vanilla, the first lines of its DOM contract.
const code = computed(() => {
  const fw = framework.value;
  const off: Record<string, string> = {
    react: "nativeOnTouch={false}",
    vue: ':native-on-touch="false"',
    svelte: "nativeOnTouch={false}",
    angular: '[nativeOnTouch]="false"',
    solid: "nativeOnTouch={false}",
    astro: "nativeOnTouch={false}",
  };
  if (fw === "vanilla") {
    return [
      `<div class="select" data-size="${size.value}" data-state="closed"${nativeOnTouch.value && !readonly.value ? " data-native" : ""}>`,
      `  <select id="playground-country" name="country"${multiple.value ? " multiple" : ""}${disabled.value ? " disabled" : ""} data-slot="native" tabindex="-1" aria-hidden="true">…</select>`,
      `  <button data-slot="control" type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="playground-country-panel"${readonly.value ? ' aria-readonly="true"' : ""}${disabled.value ? " disabled" : ""}>…</button>`,
      '  <span data-slot="arrow" aria-hidden="true">…</span>',
      '  <div id="playground-country-panel" data-slot="panel" popover="auto" role="listbox">…</div>',
      "</div>",
    ].join("\n");
  }
  const options = { react: "options={countries}", vue: ':options="countries"', svelte: "options={countries}", angular: '[options]="countries"', solid: "options={countries}", astro: "options={countries}" }[fw];
  const props = [
    options,
    size.value !== "md" && `size="${size.value}"`,
    multiple.value && "multiple",
    disabled.value && "disabled",
    readonly.value && "readonly",
    !nativeOnTouch.value && off[fw],
  ].filter(Boolean);
  if (fw === "angular") {
    return `<div appSelect ${props.join(" ")}>\n  <select id="playground-country" name="country"></select>\n</div>`;
  }
  return `<Select id="playground-country" name="country" ${props.join(" ")} />`;
});
</script>

<template>
  <div class="select-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-3">
      <UFormField label="Size" size="sm">
        <USelect v-model="size" :items="sizes" class="w-full" />
      </UFormField>
      <USwitch v-model="multiple" label="Multiple" size="sm" />
      <USwitch v-model="nativeOnTouch" label="Native on touch" size="sm" />
      <USwitch v-model="disabled" label="Disabled" size="sm" />
      <USwitch v-model="readonly" label="Read-only" size="sm" />
    </div>

    <div class="flex min-h-40 items-center justify-center p-6">
      <div class="w-full max-w-xs">
        <!-- A new one per mode, since a multiple Select's value is an array and a single one's a string. -->
        <Field id="playground-country" label="Country">
          <Select
            :key="multiple ? 'multiple' : 'single'"
            name="playground-country"
            :options="countries"
            :size="size"
            :multiple="multiple"
            :disabled="disabled"
            :readonly="readonly"
            :native-on-touch="nativeOnTouch"
            placeholder="Choose a country"
          />
        </Field>
      </div>
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
.select-playground {
  color-scheme: light;
}
.dark .select-playground {
  color-scheme: dark;
}
</style>
