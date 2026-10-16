<script setup lang="ts">
import CheckboxGroup from "~/reference/checkbox-group/CheckboxGroup.vue";
import type { CheckboxGroupProps } from "~/reference/checkbox-group/CheckboxGroup.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a size, an orientation and a state, and see the reference CheckboxGroup and
 * its code, in the framework picked in the Framework select. Checking its boxes
 * updates the code, since the value is bound to the same state.
 *
 * ```md
 * ::checkbox-group-playground
 * ::
 * ```
 */
const size = ref<NonNullable<CheckboxGroupProps["size"]>>("md");
const orientation = ref<NonNullable<CheckboxGroupProps["orientation"]>>("vertical");
const selectAll = ref(false);
const disabled = ref(false);
const invalid = ref(false);
const picked = ref<string[]>(["news"]);

const sizes = ["xs", "sm", "md", "lg", "xl"];
const orientations = ["vertical", "horizontal"];
const legend = "Which emails would you like?";
const allLabel = "All emails";
const error = "Pick at least one email to sign up for";
const options = [
  { value: "news", label: "Product news" },
  { value: "tips", label: "Tips and guides" },
  { value: "events", label: "Events near you" },
];

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
function element(tag: string, attributes: (string | false | undefined)[], children: string[] = []) {
  const attrs = attributes.filter((attribute) => !!attribute) as string[];
  const line = `<${tag}${attrs.map((attribute) => ` ${attribute}`).join("")}`;
  const open = line.length > 88 ? [`<${tag}`, ...attrs.map((attribute) => `  ${attribute}`), ">"] : [`${line}>`];
  // A short child stays on the line, as in <legend>Which emails would you like?</legend>.
  if (open.length === 1 && children.length === 1 && `${open[0]}${children[0]}</${tag}>`.length <= 88) {
    return [`${open[0]}${children[0]}</${tag}>`];
  }
  return [...open, ...children.map((child) => `  ${child}`), `</${tag}>`];
}

// A Checkbox from the DOM contract, for Vanilla.
function box(attributes: string[], label: string) {
  return element("label", ['class="checkbox"', `data-size="${size.value}"`], [
    `<input ${['data-slot="box"', 'type="checkbox"', ...attributes].join(" ")} />`,
    '<svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>',
    `<span data-slot="label">${label}</span>`,
  ]);
}

// The CheckboxGroup with only the props and attributes that differ from the defaults,
// and the error message, the way you'd write them in each framework, or for Vanilla,
// the markup from the DOM contract.
const code = computed(() => {
  const fw = framework.value;
  const jsx = fw === "react" || fw === "solid";
  const scripted = fw === "astro" || fw === "vanilla";
  const comment = (text: string) => (jsx ? `{/* ${text} */}` : `<!-- ${text} -->`);
  const errorLines = invalid.value ? [`<p id="emails-error">${error}</p>`] : [];
  const notes = scripted && selectAll.value ? [comment("A script keeps the select-all box in step, as under Select all.")] : [];

  if (fw === "vanilla") {
    const invalidAttributes = invalid.value ? ['aria-invalid="true"'] : [];
    const group = element(
      "fieldset",
      [
        'class="checkbox-group"',
        `data-size="${size.value}"`,
        `data-orientation="${orientation.value}"`,
        disabled.value && "disabled",
        invalid.value && 'aria-invalid="true"',
        invalid.value && 'aria-describedby="emails-error"',
      ],
      [
        `<legend data-slot="legend">${legend}</legend>`,
        ...(selectAll.value ? element("div", ['data-slot="select-all"'], box([], allLabel)) : []),
        ...element(
          "div",
          ['data-slot="options"'],
          options.flatMap((option) =>
            box(
              [
                'name="emails"',
                `value="${option.value}"`,
                ...(picked.value.includes(option.value) ? ["checked"] : []),
                ...invalidAttributes,
              ],
              option.label,
            ),
          ),
        ),
      ],
    );
    return [...notes, ...group, ...errorLines].join("\n");
  }

  // The value is bound where the framework holds it, and left to the form where it doesn't.
  const binding: Record<string, string[]> = {
    react: ["options={emails}", "value={picked}", "onValueChange={setPicked}"],
    vue: [':options="emails"', 'v-model:value="picked"'],
    svelte: ["options={emails}", "bind:value={picked}"],
    angular: ['[options]="emails"', '[(value)]="picked"'],
    solid: ["options={emails}", "value={picked()}", "onValueChange={setPicked}"],
    astro: ["options={emails}", `value={${JSON.stringify(picked.value)}}`],
  };
  const attributes = [
    fw === "angular" && "appCheckboxGroup",
    'name="emails"',
    ...binding[fw]!,
    size.value !== "md" && `size="${size.value}"`,
    orientation.value !== "vertical" && `orientation="${orientation.value}"`,
    selectAll.value && `${fw === "vue" ? "select-all" : "selectAll"}="${allLabel}"`,
    disabled.value && "disabled",
    invalid.value && 'aria-invalid="true"',
    invalid.value && 'aria-describedby="emails-error"',
  ];
  const group = element(fw === "angular" ? "fieldset" : "CheckboxGroup", attributes, [legend]);
  return [...notes, ...group, ...errorLines].join("\n");
});
</script>

<template>
  <div class="checkbox-group-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-3">
      <UFormField label="Size" size="sm">
        <USelect v-model="size" :items="sizes" class="w-full sm:w-40" />
      </UFormField>
      <UFormField label="Orientation" size="sm" class="sm:col-span-2">
        <USelect v-model="orientation" :items="orientations" class="w-full sm:w-40" />
      </UFormField>
      <USwitch v-model="selectAll" label="Select all" size="sm" />
      <USwitch v-model="disabled" label="Disabled" size="sm" />
      <USwitch v-model="invalid" label="Invalid" size="sm" />
    </div>

    <div class="flex min-h-48 items-center justify-center p-6">
      <div class="flex w-full max-w-sm flex-col gap-1">
        <CheckboxGroup
          v-model:value="picked"
          name="emails"
          :options="options"
          :size="size"
          :orientation="orientation"
          :select-all="selectAll ? allLabel : undefined"
          :disabled="disabled"
          :aria-invalid="invalid ? 'true' : undefined"
          :aria-describedby="invalid ? 'playground-emails-error' : undefined"
        >
          {{ legend }}
        </CheckboxGroup>
        <p v-if="invalid" id="playground-emails-error" class="text-sm text-(--color--error-text)">{{ error }}</p>
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
.checkbox-group-playground {
  color-scheme: light;
}
.dark .checkbox-group-playground {
  color-scheme: dark;
}
</style>
