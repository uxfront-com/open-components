<script setup lang="ts">
import Combobox from "~/reference/combobox/Combobox.vue";
import type { ComboboxProps } from "~/reference/combobox/Combobox.vue";
import Field from "~/reference/field/Field.vue";
import { nations } from "~/data/select-options";
import "~/reference/button/tokens.css";

/**
 * Pick a size and a few options, then use the reference Combobox, and see its code, in the
 * framework picked in the Framework select.
 *
 * ```md
 * ::combobox-playground
 * ::
 * ```
 */
type Size = NonNullable<ComboboxProps["size"]>;

const size = ref<Size>("md");
const multiple = ref(false);
const allowCustomValue = ref(false);
const creatable = ref(false);
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

// The Combobox with only the props that differ from the defaults, the way you'd write them
// in each framework, or for Vanilla, the first lines of its DOM contract.
const code = computed(() => {
  const fw = framework.value;
  if (fw === "vanilla") {
    return [
      `<div class="combobox" data-size="${size.value}" data-state="closed">`,
      `  <select name="country"${multiple.value ? " multiple" : ""}${disabled.value ? " disabled" : ""} data-slot="native" tabindex="-1" aria-hidden="true">…</select>`,
      `  <input id="playground-country" data-slot="control" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="playground-country-panel" autocomplete="off"${readonly.value ? ' aria-readonly="true" readonly' : ""}${disabled.value ? " disabled" : ""} />`,
      '  <button data-slot="arrow" type="button" tabindex="-1" aria-label="Suggestions" aria-expanded="false" aria-controls="playground-country-panel">…</button>',
      '  <div id="playground-country-panel" data-slot="panel" popover="manual" role="listbox">…</div>',
      "</div>",
    ].join("\n");
  }
  const vue = fw === "vue";
  const flag = (name: string, kebab: string) => (vue ? kebab : name);
  const options = { react: "options={countries}", vue: ':options="countries"', svelte: "options={countries}", angular: '[options]="countries"', solid: "options={countries}", astro: "options={countries}" }[fw];
  const props = [
    options,
    size.value !== "md" && `size="${size.value}"`,
    multiple.value && "multiple",
    allowCustomValue.value && flag("allowCustomValue", "allow-custom-value"),
    creatable.value && "creatable",
    disabled.value && "disabled",
    readonly.value && "readonly",
  ].filter(Boolean);
  if (fw === "angular") {
    return `<div appCombobox ${props.join(" ")}>\n  <select id="playground-country" name="country"></select>\n</div>`;
  }
  return `<Combobox id="playground-country" name="country" ${props.join(" ")} />`;
});
</script>

<template>
  <div class="combobox-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-3">
      <UFormField label="Size" size="sm">
        <USelect v-model="size" :items="sizes" class="w-full" />
      </UFormField>
      <USwitch v-model="multiple" label="Multiple" size="sm" />
      <USwitch v-model="allowCustomValue" label="Custom value" size="sm" :disabled="multiple" />
      <USwitch v-model="creatable" label="Creatable" size="sm" />
      <USwitch v-model="disabled" label="Disabled" size="sm" />
      <USwitch v-model="readonly" label="Read-only" size="sm" />
    </div>

    <div class="flex min-h-40 items-center justify-center p-6">
      <div class="w-full max-w-xs">
        <!-- A new one per mode, since a multiple Combobox's value is an array and a single one's a string. -->
        <Field id="playground-country" label="Country">
          <Combobox
            :key="multiple ? 'multiple' : 'single'"
            name="playground-country"
            :options="nations"
            :size="size"
            :multiple="multiple"
            :allow-custom-value="allowCustomValue && !multiple"
            :creatable="creatable"
            :disabled="disabled"
            :readonly="readonly"
            placeholder="Type a country"
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
.combobox-playground {
  color-scheme: light;
}
.dark .combobox-playground {
  color-scheme: dark;
}
</style>
