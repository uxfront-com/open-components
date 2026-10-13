<script setup lang="ts">
import Select from "~/reference/select/Select.vue";
import type { SelectProps } from "~/reference/select/Select.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a size, a placeholder and a state, and see the reference Select, labelled,
 * and its code, in the framework picked in the Framework select.
 *
 * ```md
 * ::select-playground
 * ::
 * ```
 */
const size = ref<NonNullable<SelectProps["size"]>>("md");
const placeholder = ref(true);
const disabled = ref(false);
const invalid = ref(false);
const value = ref("");

const sizes = ["xs", "sm", "md", "lg", "xl"];
const options = [
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
];
const PLACEHOLDER = "Choose a country";
const ERROR = "Choose the country you live in";

// Without a placeholder, a native select starts on its first option, so the value does too.
watch(placeholder, (on) => {
  if (!on && !value.value) value.value = options[0]!.value;
});

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

// An element's lines, with one attribute per line once they no longer fit on one.
function element(tag: string, attributes: (string | false | undefined)[], children: string[]) {
  const attrs = attributes.filter((attribute) => !!attribute) as string[];
  const line = `<${tag}${attrs.map((attribute) => ` ${attribute}`).join("")}>`;
  const open = line.length > 88 ? [`<${tag}`, ...attrs.map((attribute) => `  ${attribute}`), ">"] : [line];
  return [...open, ...children.map((child) => `  ${child}`), `</${tag}>`];
}

// The label, the Select with only the props and attributes that differ from the
// defaults, and the error message, the way you'd write them in each framework, or
// for Vanilla, the markup from the DOM contract.
const code = computed(() => {
  const fw = framework.value;
  const native = fw === "angular" || fw === "vanilla";
  // Angular and Vanilla write out the <select>, so they write out the placeholder too.
  const optionLines = [
    ...(placeholder.value && native ? [`<option value="">${PLACEHOLDER}</option>`] : []),
    ...options.map((option) => `<option value="${option.value}">${option.label}</option>`),
  ];
  // The value is bound where the framework holds it, and left to the form where it doesn't.
  const binding: Record<string, string[]> = {
    react: ["value={country}", "onChange={(event) => setCountry(event.target.value)}"],
    vue: ['v-model="country"'],
    svelte: ["bind:value={country}"],
    angular: ['[(ngModel)]="country"'],
    solid: ["value={country()}", "onChange={(event) => setCountry(event.currentTarget.value)}"],
    astro: ['name="country"'],
    vanilla: ['name="country"'],
  };
  const early = fw === "vue" || fw === "svelte" || fw === "astro" || fw === "vanilla";
  const control = [
    fw === "vanilla" && 'data-slot="control"',
    'id="country"',
    ...(early ? binding[fw]! : []),
    !native && size.value !== "md" && `size="${size.value}"`,
    `${fw === "react" ? "autoComplete" : "autocomplete"}="country"`,
    placeholder.value && !native && `placeholder="${PLACEHOLDER}"`,
    placeholder.value && "required",
    disabled.value && "disabled",
    invalid.value && 'aria-invalid="true"',
    invalid.value && 'aria-describedby="country-error"',
    ...(early ? [] : binding[fw]!),
  ];

  let select: string[];
  if (fw === "angular") {
    select = element("div", ["appSelect", size.value !== "md" && `size="${size.value}"`], element("select", control, optionLines));
  } else if (fw === "vanilla") {
    select = element("div", ['class="select"', `data-size="${size.value}"`], [
      ...element("select", control, optionLines),
      '<span data-slot="indicator" aria-hidden="true"><svg class="lucide-chevron-down">…</svg></span>',
    ]);
  } else {
    select = element("Select", control, optionLines);
  }

  return [
    `<label ${fw === "react" ? "htmlFor" : "for"}="country">Country</label>`,
    ...select,
    invalid.value && `<p id="country-error">${ERROR}</p>`,
  ]
    .filter(Boolean)
    .join("\n");
});
</script>

<template>
  <div class="select-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-4">
      <UFormField label="Size" size="sm" class="col-span-2 sm:col-span-1">
        <USelect v-model="size" :items="sizes" class="w-full" />
      </UFormField>
      <USwitch v-model="placeholder" label="Placeholder" size="sm" />
      <USwitch v-model="disabled" label="Disabled" size="sm" />
      <USwitch v-model="invalid" label="Invalid" size="sm" />
    </div>

    <div class="flex min-h-40 items-center justify-center p-6">
      <div class="flex w-full max-w-sm flex-col gap-1.5">
        <label for="playground-country" class="text-sm font-medium">Country</label>
        <Select
          id="playground-country"
          v-model="value"
          :size="size"
          autocomplete="country"
          :placeholder="placeholder ? PLACEHOLDER : undefined"
          :required="placeholder"
          :disabled="disabled"
          :aria-invalid="invalid ? 'true' : undefined"
          :aria-describedby="invalid ? 'playground-country-error' : undefined"
        >
          <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
        </Select>
        <p v-if="invalid" id="playground-country-error" class="text-sm text-(--color--error-text)">{{ ERROR }}</p>
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
