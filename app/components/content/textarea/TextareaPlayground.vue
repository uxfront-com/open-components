<script setup lang="ts">
import Textarea from "~/reference/textarea/Textarea.vue";
import type { TextareaProps } from "~/reference/textarea/Textarea.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a size, rows, height and state, and see the reference Textarea, labelled,
 * and its code, in the framework picked in the Framework select.
 *
 * ```md
 * ::textarea-playground
 * ::
 * ```
 */
type Height = "resizable" | "auto-grow";

const size = ref<NonNullable<TextareaProps["size"]>>("md");
const rows = ref(3);
const height = ref<Height>("resizable");
const counted = ref(false);
const disabled = ref(false);
const readonly = ref(false);
const invalid = ref(false);
const value = ref("");

const sizes = ["xs", "sm", "md", "lg", "xl"];
const rowCounts = [1, 2, 3, 4, 5, 6];
const heights: Height[] = ["resizable", "auto-grow"];

const LIMIT = 200;
const MAX_ROWS = 8;
const autoGrow = computed(() => height.value === "auto-grow");

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
// A <textarea> is never self-closing in HTML, so `paired` closes it with a tag.
function element(tag: string, attributes: (string | false | undefined)[], children: string[] = [], paired = false) {
  const attrs = attributes.filter((attribute) => !!attribute) as string[];
  const line = `<${tag}${attrs.map((attribute) => ` ${attribute}`).join("")}`;
  const close = children.length || paired ? ">" : "/>";
  const end = paired && !children.length ? `</${tag}>` : "";
  const open =
    line.length > 88
      ? [`<${tag}`, ...attrs.map((attribute) => `  ${attribute}`), close + end]
      : [`${line}${children.length || paired ? ">" : " />"}${end}`];
  if (!children.length) return open;
  return [...open, ...children.map((child) => `  ${child}`), `</${tag}>`];
}

// The label, the hint, the Textarea with only the props and attributes that differ
// from the defaults, and the error message, the way you'd write them in each
// framework, or for Vanilla, the markup from the DOM contract.
const code = computed(() => {
  const fw = framework.value;
  const jsx = fw === "react" || fw === "solid";
  const described = [counted.value && "message-hint", invalid.value && "message-error"].filter(Boolean).join(" ");

  // Props in each framework's syntax: a number, and a flag.
  const number = (name: string, kebab: string, n: number) =>
    fw === "vue" ? `:${kebab}="${n}"` : fw === "angular" ? `[${name}]="${n}"` : `${name}={${n}}`;
  const flag = (name: string, kebab: string) => (fw === "vue" ? kebab : name);

  const binding: Record<string, string[]> = {
    react: ["value={value}", "onChange={(event) => setValue(event.target.value)}"],
    vue: ['v-model="value"'],
    svelte: ["bind:value"],
    angular: ['[(ngModel)]="value"'],
    solid: ["value={value()}", "onInput={(event) => setValue(event.currentTarget.value)}"],
    astro: ['name="message"'],
    vanilla: ['name="message"'],
  };
  // The <textarea>'s own attributes, which every framework but Vanilla and Angular
  // passes through the Textarea.
  const control = [
    fw === "vanilla" && 'data-slot="control"',
    (fw === "vanilla" || fw === "angular") && `rows="${rows.value}"`,
    'id="message"',
    ...binding[fw]!,
    disabled.value && "disabled",
    readonly.value && (jsx ? "readOnly" : "readonly"),
    invalid.value && 'aria-invalid="true"',
    fw === "vanilla"
      ? (described || counted.value) && `aria-describedby="${[described, counted.value && "message-count"].filter(Boolean).join(" ")}"`
      : described && `aria-describedby="${described}"`,
  ];
  // The Textarea's own props, which Angular sets on its root.
  const props = [
    size.value !== "md" && `size="${size.value}"`,
    fw !== "angular" && rows.value !== 3 && number("rows", "rows", rows.value),
    autoGrow.value && flag("autoGrow", "auto-grow"),
    autoGrow.value && number("maxRows", "max-rows", MAX_ROWS),
    counted.value && number("limit", "limit", LIMIT),
  ];

  let textarea: string[];
  if (fw === "vanilla") {
    const count = `${LIMIT - [...value.value].length} characters left`;
    textarea = element(
      "div",
      [
        'class="textarea"',
        `data-size="${size.value}"`,
        `data-rows="${rows.value}"`,
        autoGrow.value && "data-auto-grow",
        autoGrow.value && `data-max-rows="${MAX_ROWS}"`,
        counted.value && `data-limit="${LIMIT}"`,
      ],
      [
        ...element("textarea", control, [], true),
        ...(counted.value ? [`<span data-slot="count" id="message-count">${count}</span>`] : []),
      ],
    );
  } else if (fw === "angular") {
    // The Textarea is a component on a <div>, which projects the native <textarea>.
    textarea = element("div", ["appTextarea", ...props], element("textarea", control, [], true));
  } else {
    // Vue and Svelte put the binding first, the others after the id.
    textarea = element("Textarea", [...control, ...props]);
  }

  return [
    `<label ${fw === "react" ? "htmlFor" : "for"}="message">Message</label>`,
    counted.value && `<p id="message-hint">You can enter up to ${LIMIT} characters</p>`,
    ...textarea,
    invalid.value && '<p id="message-error">Enter a message</p>',
  ]
    .filter(Boolean)
    .join("\n");
});
</script>

<template>
  <div class="textarea-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-3">
      <UFormField label="Size" size="sm">
        <USelect v-model="size" :items="sizes" class="w-full" />
      </UFormField>
      <UFormField label="Rows" size="sm">
        <USelect v-model="rows" :items="rowCounts" class="w-full" />
      </UFormField>
      <UFormField label="Height" size="sm" class="col-span-2 sm:col-span-1">
        <USelect v-model="height" :items="heights" class="w-full" />
      </UFormField>
      <USwitch v-model="counted" label="Count" size="sm" />
      <USwitch v-model="disabled" label="Disabled" size="sm" />
      <USwitch v-model="readonly" label="Read-only" size="sm" />
      <USwitch v-model="invalid" label="Invalid" size="sm" />
    </div>

    <div class="flex min-h-48 items-center justify-center p-6">
      <div class="flex w-full max-w-md flex-col gap-1.5">
        <label for="playground-message" class="text-sm font-medium">Message</label>
        <p v-if="counted" id="playground-message-hint" class="text-muted text-sm">
          You can enter up to {{ LIMIT }} characters
        </p>
        <!-- Keyed by what changes its markup, so the textarea starts over at its new height. -->
        <Textarea
          id="playground-message"
          :key="`${counted}-${autoGrow}`"
          v-model="value"
          :size="size"
          :rows="rows"
          :auto-grow="autoGrow"
          :max-rows="autoGrow ? MAX_ROWS : undefined"
          :limit="counted ? LIMIT : undefined"
          :disabled="disabled"
          :readonly="readonly"
          :aria-invalid="invalid ? 'true' : undefined"
          :aria-describedby="
            [counted && 'playground-message-hint', invalid && 'playground-message-error'].filter(Boolean).join(' ') ||
            undefined
          "
        />
        <p v-if="invalid" id="playground-message-error" class="text-sm text-(--color--error-text)">Enter a message</p>
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
.textarea-playground {
  color-scheme: light;
}
.dark .textarea-playground {
  color-scheme: dark;
}
</style>
