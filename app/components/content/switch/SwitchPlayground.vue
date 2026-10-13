<script setup lang="ts">
import Switch from "~/reference/switch/Switch.vue";
import type { SwitchProps } from "~/reference/switch/Switch.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a size and a state, flip the reference Switch, labelled, and see its code,
 * in the framework picked in the Framework select.
 *
 * ```md
 * ::switch-playground
 * ::
 * ```
 */
const size = ref<NonNullable<SwitchProps["size"]>>("md");
const checked = ref(true);
const disabled = ref(false);
const readonly = ref(false);
const invalid = ref(false);

const sizes = ["xs", "sm", "md", "lg", "xl"];

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
  const open =
    line.length > 88
      ? [`<${tag}`, ...attrs.map((attribute) => `  ${attribute}`), children.length ? ">" : "/>"]
      : [`${line}${children.length ? ">" : " />"}`];
  if (!children.length) return open;
  return [...open, ...children.map((child) => `  ${child}`), `</${tag}>`];
}

// The label, the Switch with only the props and attributes that differ from the
// defaults, and the error message, the way you'd write them in each framework, or
// for Vanilla, the markup from the DOM contract.
const code = computed(() => {
  const fw = framework.value;
  // Bound where the framework holds the state, and written out where it doesn't.
  const binding: Record<string, string[]> = {
    react: ["checked={on}", "onChange={(event) => setOn(event.target.checked)}"],
    vue: ['v-model:checked="on"'],
    svelte: ["bind:checked={on}"],
    angular: ['[(ngModel)]="on"'],
    solid: ["checked={on()}", "onChange={(event) => setOn(event.currentTarget.checked)}"],
    astro: ['name="wifi"', checked.value ? "checked" : ""],
    vanilla: ['name="wifi"', checked.value ? "checked" : ""],
  };
  const native = fw === "angular" || fw === "vanilla";
  const control = [
    fw === "vanilla" && 'data-slot="control"',
    native && 'type="checkbox"',
    native && 'role="switch"',
    'id="wifi"',
    ...binding[fw]!,
    !native && size.value !== "md" && `size="${size.value}"`,
    disabled.value && "disabled",
    // A checkbox has no readonly of its own: the Switch takes a prop, Angular's on its <span>,
    // and Vanilla writes out the attribute, with a script that cancels the click.
    readonly.value && fw === "vanilla" && 'aria-readonly="true"',
    readonly.value && !native && (fw === "react" || fw === "solid" ? "readOnly" : "readonly"),
    invalid.value && 'aria-invalid="true"',
    invalid.value && 'aria-describedby="wifi-error"',
  ];

  let input: string[];
  if (fw === "angular") {
    // The Switch is a component on a <span>, around the <input> you write out.
    input = element(
      "span",
      ["appSwitch", size.value !== "md" && `size="${size.value}"`, readonly.value && "readonly"],
      element("input", control),
    );
  } else if (fw === "vanilla") {
    input = element(
      "span",
      ['class="switch"', `data-size="${size.value}"`],
      [...element("input", control), '<span data-slot="track" aria-hidden="true"><span data-slot="thumb"></span></span>'],
    );
  } else {
    input = element("Switch", control);
  }

  return [
    readonly.value && fw === "vanilla" && "<!-- A script cancels the click on it, as under Read-only. -->",
    `<label ${fw === "react" ? "htmlFor" : "for"}="wifi">Wi-Fi</label>`,
    ...input,
    invalid.value && `<p id="wifi-error">Couldn't turn on Wi-Fi. Try again.</p>`,
  ]
    .filter(Boolean)
    .join("\n");
});
</script>

<template>
  <div class="switch-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 items-end gap-3 border-b border-muted p-4 sm:grid-cols-3">
      <UFormField label="Size" size="sm" class="col-span-2 sm:col-span-1">
        <USelect v-model="size" :items="sizes" class="w-full" />
      </UFormField>
      <USwitch v-model="disabled" label="Disabled" size="sm" />
      <USwitch v-model="readonly" label="Read-only" size="sm" />
      <USwitch v-model="invalid" label="Invalid" size="sm" />
    </div>

    <div class="flex min-h-40 items-center justify-center p-6">
      <div class="flex w-full max-w-xs flex-col gap-1.5">
        <div class="flex items-center justify-between gap-4">
          <label for="playground-wifi" class="text-sm font-medium">Wi-Fi</label>
          <Switch
            id="playground-wifi"
            v-model:checked="checked"
            :size="size"
            :disabled="disabled"
            :readonly="readonly"
            :aria-invalid="invalid ? 'true' : undefined"
            :aria-describedby="invalid ? 'playground-wifi-error' : undefined"
          />
        </div>
        <p v-if="invalid" id="playground-wifi-error" class="text-sm text-(--color--error-text)">
          Couldn't turn on Wi-Fi. Try again.
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
.switch-playground {
  color-scheme: light;
}
.dark .switch-playground {
  color-scheme: dark;
}
</style>
