<script setup lang="ts">
import Checkbox from "~/reference/checkbox/Checkbox.vue";
import CheckboxGroup from "~/reference/checkbox-group/CheckboxGroup.vue";
import Field from "~/reference/field/Field.vue";
import type { FieldProps } from "~/reference/field/Field.vue";
import Input from "~/reference/input/Input.vue";
import Radio from "~/reference/radio-group/Radio.vue";
import RadioGroup from "~/reference/radio-group/RadioGroup.vue";
import Switch from "~/reference/switch/Switch.vue";
import Textarea from "~/reference/textarea/Textarea.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a control, a size and a state, and see the reference Field lay out its label,
 * hint and error around it, with its code in the framework picked in the Framework select.
 *
 * ```md
 * ::field-playground
 * ::
 * ```
 */
type Control = "Input" | "Textarea" | "Checkbox" | "Switch" | "CheckboxGroup" | "RadioGroup";

const control = ref<Control>("Input");
const size = ref<NonNullable<FieldProps["size"]>>("md");
const withHint = ref(true);
const required = ref(true);
const disabled = ref(false);
const invalid = ref(false);

const controls: { label: string; value: Control }[] = [
  { label: "Input", value: "Input" },
  { label: "Textarea", value: "Textarea" },
  { label: "Checkbox", value: "Checkbox" },
  { label: "Switch", value: "Switch" },
  { label: "Checkbox Group", value: "CheckboxGroup" },
  { label: "Radio Group", value: "RadioGroup" },
];
const sizes = ["xs", "sm", "md", "lg", "xl"];
const contact = [
  { value: "email", label: "Email" },
  { value: "sms", label: "Text message" },
];

// What each control asks, and what its hint and error say.
const COPY: Record<Control, { id: string; label?: string; text?: string; hint: string; error: string }> = {
  Input: { id: "email", label: "Email address", hint: "We'll only use it to send your receipt", error: "Enter your email address" },
  Textarea: { id: "bio", label: "Bio", hint: "A sentence or two about you", error: "Tell us a little about yourself" },
  Checkbox: { id: "terms", text: "I agree to the terms", hint: "You can read them before you sign up", error: "Agree to the terms to continue" },
  Switch: { id: "alerts", label: "Price alerts", hint: "We'll email you when the price drops", error: "Couldn't turn on price alerts" },
  CheckboxGroup: { id: "contact", text: "How can we contact you?", hint: "Pick at least one", error: "Choose how we can contact you" },
  RadioGroup: { id: "delivery", text: "Delivery", hint: "Express arrives the next working day", error: "Choose a delivery option" },
};
const copy = computed(() => COPY[control.value]);
// A Checkbox Group never takes `required`, since HTML can't require one of a group of checkboxes.
const takesRequired = computed(() => control.value !== "CheckboxGroup");

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

const indent = (lines: string[], by = 2) => lines.map((line) => (line ? `${" ".repeat(by)}${line}` : line));

// An element's lines, with one attribute per line once they no longer fit on one.
function element(tag: string, attributes: (string | false | undefined)[], children?: string[]) {
  const attrs = attributes.filter((attribute) => !!attribute) as string[];
  const line = `<${tag}${attrs.map((attribute) => ` ${attribute}`).join("")}`;
  const open =
    line.length > 88 ? [`<${tag}`, ...indent(attrs), children ? ">" : "/>"] : [`${line}${children ? ">" : " />"}`];
  return children ? [...open, ...indent(children), `</${tag}>`] : open;
}

// The control in a framework that renders components, with what the Field hands it spread in
// where the framework needs that.
function component(fw: string, spread: boolean) {
  const extra = spread ? "{...control}" : undefined;
  switch (control.value) {
    case "Input":
      return element("Input", ['type="email"', extra]);
    case "Textarea":
      return element("Textarea", [fw === "vue" ? ':limit="200"' : "limit={200}", extra]);
    case "Checkbox":
      return [`<Checkbox${extra ? ` ${extra}` : ""}>${copy.value.text}</Checkbox>`];
    case "Switch":
      return element("Switch", [extra]);
    case "CheckboxGroup":
      return [
        `<CheckboxGroup name="contact" ${fw === "vue" ? ':options="contact"' : "options={contact}"}${extra ? ` ${extra}` : ""}>${copy.value.text}</CheckboxGroup>`,
      ];
    case "RadioGroup": {
      // Astro's Radios can't read their group, so each takes its name.
      const name = fw === "astro" ? ' name="delivery"' : "";
      return element("RadioGroup", ['name="delivery"', 'legend="Delivery"', extra], [
        `<Radio${name} value="standard">Standard</Radio>`,
        `<Radio${name} value="express">Express</Radio>`,
      ]);
    }
  }
}

// The same control in Angular, a directive on the native element you write out.
function angular() {
  switch (control.value) {
    case "Input":
      return ['<div appInput><input type="email" /></div>'];
    case "Textarea":
      return ['<div appTextarea [limit]="200"><textarea></textarea></div>'];
    case "Checkbox":
      return [`<label appCheckbox><input type="checkbox" />${copy.value.text}</label>`];
    case "Switch":
      return ['<span appSwitch><input type="checkbox" role="switch" /></span>'];
    case "CheckboxGroup":
      return ['<fieldset appCheckboxGroup name="contact" [options]="contact">', `  <legend>${copy.value.text}</legend>`, "</fieldset>"];
    case "RadioGroup":
      return [
        '<fieldset appRadioGroup name="delivery" legend="Delivery">',
        '  <label appRadio value="standard">Standard</label>',
        '  <label appRadio value="express">Express</label>',
        "</fieldset>",
      ];
  }
}

// The markup from the DOM contract, for Vanilla.
function vanilla() {
  const { id, label, text, hint, error } = copy.value;
  const s = size.value;
  if (control.value === "RadioGroup") {
    const describedBy = [withHint.value && `${id}-hint`, invalid.value && `${id}-error`].filter(Boolean).join(" ");
    return [
      "<!-- The Radio Group renders the Field's hint and error itself. -->",
      ...element(
        "fieldset",
        [
          'class="radio-group"',
          'role="radiogroup"',
          `data-size="${s}"`,
          'data-orientation="vertical"',
          disabled.value && "disabled",
          `aria-labelledby="${id}-legend"`,
          invalid.value && 'aria-invalid="true"',
          describedBy && `aria-describedby="${describedBy}"`,
        ],
        [
          `<legend id="${id}-legend" data-slot="legend">${text}</legend>`,
          withHint.value && `<p id="${id}-hint" data-slot="hint">${hint}</p>`,
          invalid.value && `<p id="${id}-error" data-slot="error">${error}</p>`,
          '<div data-slot="options">',
          `  <label class="radio" data-slot="radio" data-size="${s}">`,
          ...indent(
            element("input", ['data-slot="control"', 'type="radio"', `name="${id}"`, 'value="standard"', required.value && "required"]),
            4,
          ),
          '    <span data-slot="label">Standard</span>',
          "  </label>",
          "  <!-- …a Radio for each option -->",
          "</div>",
        ].filter((line): line is string => !!line),
      ),
    ];
  }
  const describedBy = [withHint.value && `${id}-hint`, invalid.value && `${id}-error`].filter(Boolean).join(" ");
  const wired = [
    `id="${id}"`,
    describedBy && `aria-describedby="${describedBy}"`,
    invalid.value && 'aria-invalid="true"',
    required.value && takesRequired.value && "required",
    disabled.value && "disabled",
  ];
  const kind = { Input: "text", Textarea: "text", Checkbox: "checkbox", Switch: "switch", CheckboxGroup: "checkbox-group" }[control.value];
  let markup: string[];
  switch (control.value) {
    case "Input":
      markup = element("div", ['class="input"', `data-size="${s}"`], element("input", ['data-slot="control"', 'type="email"', ...wired]));
      break;
    case "Textarea":
      markup = element("div", ['class="textarea"', `data-size="${s}"`, 'data-rows="3"', 'data-limit="200"'], [
        // The Textarea adds its count after the Field's hint and error.
        `<textarea ${['data-slot="control"', 'rows="3"', ...wired.filter((attribute) => attribute && !attribute.startsWith("aria-describedby")), `aria-describedby="${[describedBy, `${id}-count`].filter(Boolean).join(" ")}"`].filter(Boolean).join(" ")}></textarea>`,
        `<span data-slot="count" id="${id}-count">200 characters left</span>`,
      ]);
      break;
    case "Checkbox":
      markup = element("label", ['class="checkbox"', `data-size="${s}"`], [
        ...element("input", ['data-slot="box"', 'type="checkbox"', ...wired]),
        '<svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>',
        `<span data-slot="label">${text}</span>`,
      ]);
      break;
    case "Switch":
      markup = element("span", ['class="switch"', `data-size="${s}"`], [
        ...element("input", ['data-slot="control"', 'type="checkbox"', 'role="switch"', ...wired]),
        '<span data-slot="track" aria-hidden="true"><span data-slot="thumb"></span></span>',
      ]);
      break;
    default:
      markup = element("fieldset", ['class="checkbox-group"', ...wired, `data-size="${s}"`, 'data-orientation="vertical"'], [
        `<legend data-slot="legend">${text}</legend>`,
        '<div data-slot="options">',
        "  <!-- …a Checkbox for each option -->",
        "</div>",
      ]);
  }
  const labelled = kind === "text" || kind === "switch";
  return element("div", ['class="field"', `data-size="${s}"`, `data-control="${kind}"`], [
    labelled ? `<label data-slot="label" for="${id}">${label}</label>` : "",
    withHint.value && kind === "text" ? `<p data-slot="hint" id="${id}-hint">${hint}</p>` : "",
    ...markup,
    withHint.value && kind !== "text" ? `<p data-slot="hint" id="${id}-hint">${hint}</p>` : "",
    invalid.value ? `<p data-slot="error" id="${id}-error">${error}</p>` : "",
  ].filter(Boolean));
}

// The Field with only the props that differ from the defaults, around its control, the
// way you'd write it in each framework, or for Vanilla, the markup from the DOM contract.
const code = computed(() => {
  const fw = framework.value;
  if (fw === "vanilla") return vanilla().join("\n");
  const { id, label, hint, error } = copy.value;
  const radios = control.value === "RadioGroup";
  const props = [
    !radios && `id="${id}"`,
    size.value !== "md" && `size="${size.value}"`,
    label && `label="${label}"`,
    withHint.value && `hint="${hint}"`,
    invalid.value && `error="${error}"`,
    required.value && takesRequired.value && "required",
    disabled.value && "disabled",
  ];
  if (fw === "angular") return element("div", ["appField", ...props], angular()).join("\n");
  let body: string[];
  if (fw === "react" || fw === "vue") body = component(fw, false);
  else if (fw === "svelte") body = ["{#snippet children(control)}", ...indent(component(fw, true)), "{/snippet}"];
  else {
    const inner = component(fw, true);
    body = inner.length === 1 ? [`{(control) => ${inner[0]}}`] : ["{(control) => (", ...indent(inner), ")}"];
  }
  return element("Field", props, body).join("\n");
});
</script>

<template>
  <div class="field-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 items-end gap-3 border-b border-muted p-4 sm:grid-cols-4">
      <UFormField label="Control" size="sm" class="col-span-2 sm:col-span-2">
        <USelect v-model="control" :items="controls" class="w-full" />
      </UFormField>
      <UFormField label="Size" size="sm" class="col-span-2 sm:col-span-2">
        <USelect v-model="size" :items="sizes" class="w-full" />
      </UFormField>
      <USwitch v-model="withHint" label="Hint" size="sm" />
      <USwitch v-model="required" label="Required" size="sm" :disabled="!takesRequired" />
      <USwitch v-model="disabled" label="Disabled" size="sm" />
      <USwitch v-model="invalid" label="Invalid" size="sm" />
    </div>

    <div class="flex min-h-48 items-center justify-center p-6">
      <Field
        :id="control === 'RadioGroup' ? undefined : `playground-${copy.id}`"
        :key="control"
        class="w-full max-w-xs"
        :size="size"
        :label="copy.label"
        :hint="withHint ? copy.hint : undefined"
        :error="invalid ? copy.error : undefined"
        :required="required"
        :disabled="disabled"
      >
        <Input v-if="control === 'Input'" type="email" />
        <Textarea v-else-if="control === 'Textarea'" :limit="200" />
        <Checkbox v-else-if="control === 'Checkbox'">{{ copy.text }}</Checkbox>
        <Switch v-else-if="control === 'Switch'" />
        <CheckboxGroup v-else-if="control === 'CheckboxGroup'" name="playground-contact" :options="contact">
          {{ copy.text }}
        </CheckboxGroup>
        <RadioGroup v-else name="playground-delivery" legend="Delivery">
          <Radio value="standard">Standard</Radio>
          <Radio value="express">Express</Radio>
        </RadioGroup>
      </Field>
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
.field-playground {
  color-scheme: light;
}
.dark .field-playground {
  color-scheme: dark;
}
</style>
