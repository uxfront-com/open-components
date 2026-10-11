<script setup lang="ts">
import Radio from "~/reference/radio-group/Radio.vue";
import RadioGroup from "~/reference/radio-group/RadioGroup.vue";
import type { RadioGroupProps } from "~/reference/radio-group/RadioGroup.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a size and the states, and see the reference Radio Group and its code, in the
 * framework picked in the Framework select.
 *
 * ```md
 * ::radio-group-playground
 * ::
 * ```
 */
const size = ref<NonNullable<RadioGroupProps["size"]>>("md");
const hint = ref(true);
const disabled = ref(false);
const oneDisabled = ref(false);
const required = ref(false);
const invalid = ref(false);
const value = ref<string>();

const sizes = ["xs", "sm", "md", "lg", "xl"];
const options = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "next-day", label: "Next day" },
];
const HINT = "Express and next day cost extra";
const ERROR = "Choose how you'd like your order delivered";

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
  return [...open, ...children.map((child) => `  ${child}`), `</${tag}>`];
}

// The group with only the props that differ from the defaults, and its radios, the way
// you'd write them in each framework, or for Vanilla, the markup from the DOM contract.
const code = computed(() => {
  const fw = framework.value;
  const name = 'name="delivery"';
  const states = [
    size.value !== "md" && `size="${size.value}"`,
    disabled.value && "disabled",
    required.value && "required",
  ];
  const isDisabled = (option: string) => oneDisabled.value && option === "express";

  if (fw === "vanilla") {
    const describedBy = [hint.value && "delivery-hint", invalid.value && "delivery-error"].filter(Boolean).join(" ");
    return element(
      "fieldset",
      [
        'class="radio-group"',
        'role="radiogroup"',
        `data-size="${size.value}"`,
        disabled.value && "disabled",
        invalid.value && 'aria-invalid="true"',
        describedBy && `aria-describedby="${describedBy}"`,
      ],
      [
        '<legend data-slot="legend">Delivery</legend>',
        hint.value && `<p id="delivery-hint" data-slot="hint">${HINT}</p>`,
        invalid.value && `<p id="delivery-error" data-slot="error">${ERROR}</p>`,
        ...options.flatMap((option) =>
          element(
            "label",
            ['class="radio"', 'data-slot="radio"', `data-size="${size.value}"`],
            [
              `<input ${[
                'data-slot="control"',
                'type="radio"',
                name,
                `value="${option.value}"`,
                value.value === option.value && "checked",
                isDisabled(option.value) && "disabled",
                required.value && "required",
              ]
                .filter(Boolean)
                .join(" ")} />`,
              `<span data-slot="label">${option.label}</span>`,
            ],
          ),
        ),
      ].filter((line): line is string => !!line),
    ).join("\n");
  }

  // The value is bound where the framework holds it. Astro has no state on the client,
  // so it checks the radio it starts with, and its radios take the group's name.
  const binding: Record<string, string[]> = {
    react: ["value={delivery}", "onChange={(event) => setDelivery(event.target.value)}"],
    vue: ['v-model="delivery"'],
    svelte: ["bind:value={delivery}"],
    angular: ['[(ngModel)]="delivery"'],
    solid: ["value={delivery()}", "onChange={(event) => setDelivery(event.target.value)}"],
    astro: [],
  };
  const group = [
    fw === "angular" && "appRadioGroup",
    name,
    'legend="Delivery"',
    hint.value && `hint="${HINT}"`,
    ...states,
    invalid.value && `error="${ERROR}"`,
    ...binding[fw]!,
  ];
  const radios = options.map((option) => {
    const attributes = [
      fw === "angular" && "appRadio",
      fw === "astro" && name,
      `value="${option.value}"`,
      fw === "astro" && value.value === option.value && "checked",
      isDisabled(option.value) && "disabled",
    ]
      .filter(Boolean)
      .join(" ");
    const tag = fw === "angular" ? "label" : "Radio";
    return `<${tag} ${attributes}>${option.label}</${tag}>`;
  });
  // Angular's components are directives on the native elements.
  return element(fw === "angular" ? "fieldset" : "RadioGroup", group, radios).join("\n");
});
</script>

<template>
  <div class="radio-group-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-3">
      <UFormField label="Size" size="sm" class="col-span-2 sm:col-span-1">
        <USelect v-model="size" :items="sizes" class="w-full" />
      </UFormField>
      <USwitch v-model="hint" label="Hint" size="sm" />
      <USwitch v-model="required" label="Required" size="sm" />
      <USwitch v-model="disabled" label="Disabled" size="sm" />
      <USwitch v-model="oneDisabled" label="One option disabled" size="sm" />
      <USwitch v-model="invalid" label="Invalid" size="sm" />
    </div>

    <div class="flex min-h-40 items-center justify-center p-6">
      <RadioGroup
        v-model="value"
        name="playground-delivery"
        legend="Delivery"
        :hint="hint ? HINT : undefined"
        :size="size"
        :disabled="disabled"
        :required="required"
        :error="invalid ? ERROR : undefined"
        class="w-full max-w-sm"
      >
        <Radio
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="oneDisabled && option.value === 'express'"
        >
          {{ option.label }}
        </Radio>
      </RadioGroup>
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
.radio-group-playground {
  color-scheme: light;
}
.dark .radio-group-playground {
  color-scheme: dark;
}
</style>
