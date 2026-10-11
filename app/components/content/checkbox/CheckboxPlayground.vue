<script setup lang="ts">
import Checkbox from "~/reference/checkbox/Checkbox.vue";
import type { CheckboxProps } from "~/reference/checkbox/Checkbox.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a size and a state, and see the reference Checkbox and its code, in the
 * framework picked in the Framework select. Clicking the checkbox updates the
 * switches, since they're bound to the same state.
 *
 * ```md
 * ::checkbox-playground
 * ::
 * ```
 */
const size = ref<NonNullable<CheckboxProps["size"]>>("md");
const checked = ref(false);
const indeterminate = ref(false);
const disabled = ref(false);
const required = ref(false);
const invalid = ref(false);

const sizes = ["xs", "sm", "md", "lg", "xl"];
const label = "I agree to the terms";
const error = "Agree to the terms to create an account";

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
  const close = children.length ? ">" : "/>";
  const open =
    line.length > 88
      ? [`<${tag}`, ...attrs.map((attribute) => `  ${attribute}`), close]
      : [`${line}${children.length ? ">" : " />"}`];
  if (!children.length) return open;
  // A short child stays on the line, as in <Checkbox>I agree to the terms</Checkbox>.
  if (open.length === 1 && children.length === 1 && `${open[0]}${children[0]}</${tag}>`.length <= 88) {
    return [`${open[0]}${children[0]}</${tag}>`];
  }
  return [...open, ...children.map((child) => `  ${child}`), `</${tag}>`];
}

// The Checkbox with only the props and attributes that differ from the defaults,
// and the error message, the way you'd write them in each framework, or for
// Vanilla, the markup from the DOM contract.
const code = computed(() => {
  const fw = framework.value;
  const jsx = fw === "react" || fw === "solid";
  const scripted = fw === "astro" || fw === "vanilla";

  // The checked state is bound where the framework holds it, and left to the form where it doesn't.
  const binding: Record<string, string[]> = {
    react: ["checked={checked}", "onChange={(event) => setChecked(event.target.checked)}"],
    vue: ['v-model:checked="checked"'],
    svelte: ["bind:checked"],
    angular: ['[(ngModel)]="checked"'],
    solid: ["checked={checked()}", "onChange={(event) => setChecked(event.currentTarget.checked)}"],
    astro: ['name="terms"', checked.value && "checked"].filter((attribute) => !!attribute) as string[],
    vanilla: ['name="terms"', checked.value && "checked"].filter((attribute) => !!attribute) as string[],
  };
  // Angular binds the property on the <input>, and Astro and Vanilla set it from a script.
  const mixed = indeterminate.value && !scripted && (fw === "angular" ? '[indeterminate]="true"' : "indeterminate");
  const attributes = [
    fw === "vanilla" && 'data-slot="box"',
    fw === "vanilla" && 'type="checkbox"',
    fw === "angular" && 'type="checkbox"',
    scripted && indeterminate.value && 'id="terms"',
    ...binding[fw]!,
    fw !== "vanilla" && fw !== "angular" && size.value !== "md" && `size="${size.value}"`,
    mixed,
    disabled.value && "disabled",
    required.value && "required",
    invalid.value && 'aria-invalid="true"',
    invalid.value && 'aria-describedby="terms-error"',
  ];

  let checkbox: string[];
  if (fw === "angular" || fw === "vanilla") {
    // The <label> is the root, with the <input> written out inside it.
    const indicator = '<svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>';
    checkbox = element(
      "label",
      fw === "angular"
        ? ["appCheckbox", size.value !== "md" && `size="${size.value}"`]
        : ['class="checkbox"', `data-size="${size.value}"`],
      [
        ...element("input", attributes),
        ...(fw === "vanilla" ? [indicator, `<span data-slot="label">${label}</span>`] : [label]),
      ],
    );
  } else {
    checkbox = element("Checkbox", attributes, [label]);
  }

  const comment = (text: string) => (jsx ? `{/* ${text} */}` : `<!-- ${text} -->`);
  return [
    scripted && indeterminate.value && comment('A script sets it: document.querySelector("#terms").indeterminate = true'),
    ...checkbox,
    invalid.value && `<p id="terms-error">${error}</p>`,
  ]
    .filter(Boolean)
    .join("\n");
});
</script>

<template>
  <div class="checkbox-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-3">
      <UFormField label="Size" size="sm" class="col-span-2 sm:col-span-3">
        <USelect v-model="size" :items="sizes" class="w-full sm:w-40" />
      </UFormField>
      <USwitch v-model="checked" label="Checked" size="sm" />
      <USwitch v-model="indeterminate" label="Indeterminate" size="sm" />
      <USwitch v-model="disabled" label="Disabled" size="sm" />
      <USwitch v-model="required" label="Required" size="sm" />
      <USwitch v-model="invalid" label="Invalid" size="sm" />
    </div>

    <div class="flex min-h-40 items-center justify-center p-6">
      <div class="flex w-full max-w-sm flex-col gap-1">
        <Checkbox
          v-model:checked="checked"
          v-model:indeterminate="indeterminate"
          :size="size"
          name="terms"
          :disabled="disabled"
          :required="required"
          :aria-invalid="invalid ? 'true' : undefined"
          :aria-describedby="invalid ? 'playground-terms-error' : undefined"
        >
          {{ label }}
        </Checkbox>
        <p v-if="invalid" id="playground-terms-error" class="ps-6.5 text-sm text-(--color--error-text)">
          {{ error }}
        </p>
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
.checkbox-playground {
  color-scheme: light;
}
.dark .checkbox-playground {
  color-scheme: dark;
}
</style>
