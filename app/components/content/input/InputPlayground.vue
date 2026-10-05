<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Input from "~/reference/input/Input.vue";
import type { InputProps } from "~/reference/input/Input.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a size, type, content and state, and see the reference Input, labelled, and
 * its code, in the framework picked in the Framework select.
 *
 * ```md
 * ::input-playground
 * ::
 * ```
 */
type Type = NonNullable<InputProps["type"]>;
type Content = "none" | "leading icon" | "prefix and suffix" | "action";

const size = ref<NonNullable<InputProps["size"]>>("md");
const type = ref<Type>("email");
const content = ref<Content>("none");
const disabled = ref(false);
const readonly = ref(false);
const invalid = ref(false);
const value = ref("");
const shown = ref(false);

const sizes = ["xs", "sm", "md", "lg", "xl"];
const types: Type[] = ["text", "email", "password", "search", "tel", "url"];
const contents: Content[] = ["none", "leading icon", "prefix and suffix", "action"];

// What each type asks for: its label (a search is named by its Search button instead),
// its autocomplete, and an error message that says how to fix it.
const fields: Record<Type, { id: string; label: string; autocomplete?: string; error: string }> = {
  text: { id: "name", label: "Full name", autocomplete: "name", error: "Enter your full name" },
  email: {
    id: "email",
    label: "Email address",
    autocomplete: "email",
    error: "Enter an email address in the correct format, like name@example.com",
  },
  password: { id: "password", label: "Password", autocomplete: "current-password", error: "Enter your password" },
  search: { id: "search", label: "Search", error: "Enter something to search for" },
  tel: { id: "phone", label: "Phone number", autocomplete: "tel", error: "Enter a phone number, like 01632 960 001" },
  url: { id: "website", label: "Website", autocomplete: "url", error: "Enter a web address, like https://example.com" },
};
const field = computed(() => fields[type.value]);
const errorId = computed(() => `${field.value.id}-error`);
const inputType = computed(() => (type.value === "password" && shown.value ? "text" : type.value));
const playgroundInput = useTemplateRef("playground-input");

function clear() {
  value.value = "";
  // Back to the input, ready for a new value.
  playgroundInput.value?.input?.focus();
}

// A Button among the actions is two sizes below the input.
const actionSizes = { xs: "xs", sm: "xs", md: "xs", lg: "sm", xl: "md" } as const;
const actionSize = computed(() => actionSizes[size.value]);
// The action: Show password in a password input, and Clear in any other it can change.
const action = computed(() => {
  if (content.value !== "action") return;
  if (type.value === "password") return "show password";
  if (!disabled.value && !readonly.value) return "clear";
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
function element(tag: string, attributes: (string | false | undefined)[], children: string[] = []) {
  const attrs = attributes.filter((attribute) => !!attribute) as string[];
  const line = `<${tag}${attrs.map((attribute) => ` ${attribute}`).join("")}`;
  const close = children.length ? ">" : "/>";
  const open =
    line.length > 88 || attrs.some((attribute) => attribute.includes("\n"))
      ? [`<${tag}`, ...attrs.flatMap((attribute) => attribute.split("\n").map((part) => `  ${part}`)), close]
      : [`${line}${children.length ? ">" : " />"}`];
  if (!children.length) return open;
  return [...open, ...children.map((child) => `  ${child}`), `</${tag}>`];
}

// The label, the Input with only the props and attributes that differ from the
// defaults, and the error message, the way you'd write them in each framework, or
// for Vanilla, the markup from the DOM contract.
const code = computed(() => {
  const fw = framework.value;
  const jsx = fw === "react" || fw === "solid";
  const scripted = fw === "astro" || fw === "vanilla";
  // Solid and Angular read a signal by calling it.
  const read = fw === "solid" || fw === "angular" ? "()" : "";
  const { id, label, autocomplete, error } = field.value;
  const search = type.value === "search";
  const toggles = action.value === "show password";

  // How each framework fills a slot with a child, when it doesn't with a prop (JSX).
  function slot(name: "leading" | "trailing", content: string, icon = false) {
    switch (fw) {
      case "vue":
        return `<template #${name}>${icon ? `<${content} />` : content}</template>`;
      case "svelte":
        return `{#snippet ${name}()}${icon ? `<${content} />` : content}{/snippet}`;
      case "angular":
        return icon ? `<lucide-icon ${name} [img]="${content}" />` : `<span ${name}>${content}</span>`;
      case "astro":
        return icon ? `<${content} slot="${name}" />` : `<Fragment slot="${name}">${content}</Fragment>`;
      default: {
        const svg = `<svg class="lucide-${content.replace(/Icon$/, "").toLowerCase()}">…</svg>`;
        return `<span data-slot="${name}" aria-hidden="true">${icon ? svg : content}</span>`;
      }
    }
  }

  // The Button among the actions, with its state where the framework holds it.
  function actionButton() {
    const name = toggles ? "Show password" : "Clear";
    const icon = toggles ? "EyeIcon" : "XIcon";
    if (fw === "vanilla") {
      return element(
        "button",
        [
          'class="button"',
          'type="button"',
          disabled.value && "disabled",
          toggles && `aria-controls="${id}"`,
          toggles && 'aria-pressed="false"',
          'data-variant="ghost"',
          'data-color="neutral"',
          `data-size="${actionSize.value}"`,
          "data-icon-only",
        ],
        [slot("leading", icon, true), `<span data-slot="label">${name}</span>`],
      );
    }
    const pressed: Record<string, string> = {
      react: "aria-pressed={shown}",
      vue: ':aria-pressed="shown"',
      svelte: "aria-pressed={shown}",
      angular: '[attr.aria-pressed]="shown()"',
      solid: "aria-pressed={shown()}",
      astro: 'aria-pressed="false"',
    };
    const click: Record<string, string> = toggles
      ? {
          react: "onClick={() => setShown(!shown)}",
          vue: '@click="shown = !shown"',
          svelte: "onclick={() => (shown = !shown)}",
          angular: '(click)="shown.set(!shown())"',
          solid: "onClick={() => setShown(!shown())}",
        }
      : {
          react: "onClick={clear}",
          vue: '@click="clear"',
          svelte: "onclick={clear}",
          angular: '(click)="clear()"',
          solid: "onClick={clear}",
        };
    return element(
      // Angular's Button is a directive on the native element.
      fw === "angular" ? "button" : "Button",
      [
        fw === "angular" && "appButton",
        fw === "angular" && "actions",
        fw === "astro" && 'slot="actions"',
        `label="${name}"`,
        'variant="ghost"',
        `size="${actionSize.value}"`,
        fw === "vue" ? "icon-only" : "iconOnly",
        toggles && `aria-controls="${id}"`,
        toggles && pressed[fw],
        disabled.value && "disabled",
        click[fw],
        jsx && `leading={<${icon} />}`,
      ],
      jsx ? [] : [slot("leading", icon, true)],
    );
  }

  // The <input>'s own attributes, which every framework but Vanilla and Angular
  // passes through the Input.
  const typeNow = "shown" + read + " ? 'text' : 'password'";
  const typeAttribute =
    toggles && !scripted
      ? fw === "vue"
        ? `:type="${typeNow}"`
        : fw === "angular"
          ? `[type]="${typeNow}"`
          : `type={${typeNow.replaceAll("'", '"')}}`
      : (type.value !== "text" || fw === "vanilla") && `type="${type.value}"`;
  // The value is bound where the framework holds it, and left to the form where it doesn't.
  const binding: Record<string, string[]> = {
    react: ["value={value}", "onChange={(event) => setValue(event.target.value)}"],
    vue: ['v-model="value"'],
    svelte: ["bind:value"],
    angular: ['[(ngModel)]="value"'],
    solid: ["value={value()}", "onInput={(event) => setValue(event.currentTarget.value)}"],
    astro: [`name="${search ? "q" : id}"`],
    vanilla: [`name="${search ? "q" : id}"`],
  };
  const early = fw === "vue" || fw === "svelte" || scripted;
  const control = [
    fw === "vanilla" && 'data-slot="control"',
    fw === "vanilla" && typeAttribute,
    fw === "vanilla" && disabled.value && "disabled",
    search ? `aria-label="${label}"` : `id="${id}"`,
    ...(early ? binding[fw]! : []),
    fw !== "vanilla" && typeAttribute,
    fw !== "vanilla" && fw !== "angular" && size.value !== "md" && `size="${size.value}"`,
    autocomplete && `${fw === "react" ? "autoComplete" : "autocomplete"}="${autocomplete}"`,
    fw !== "vanilla" && disabled.value && "disabled",
    readonly.value && (jsx ? "readOnly" : "readonly"),
    invalid.value && 'aria-invalid="true"',
    invalid.value && `aria-describedby="${id}-error"`,
    ...(early ? [] : binding[fw]!),
  ];

  const icon = content.value === "leading icon";
  const affixes = content.value === "prefix and suffix";
  const button = action.value ? actionButton() : [];
  let input: string[];
  if (jsx) {
    input = element("Input", [
      ...control,
      icon && "leading={<SearchIcon />}",
      affixes && 'leading="$"',
      affixes && 'trailing="USD"',
      action.value && ["actions={", ...button.map((line) => `  ${line}`), "}"].join("\n"),
    ]);
  } else {
    const leading = icon ? [slot("leading", "SearchIcon", true)] : affixes ? [slot("leading", "$")] : [];
    const trailing = affixes ? [slot("trailing", "USD")] : [];
    // Vue and Svelte wrap the Button in the slot, Angular and Astro mark it, and
    // Vanilla writes out the part.
    const wrappers: Record<string, [string, string]> = {
      vue: ["<template #actions>", "</template>"],
      svelte: ["{#snippet actions()}", "{/snippet}"],
      vanilla: ['<span data-slot="actions">', "</span>"],
    };
    const wrapper = wrappers[fw];
    const actions = !action.value
      ? []
      : wrapper
        ? [wrapper[0], ...button.map((line) => `  ${line}`), wrapper[1]]
        : button;
    input =
      fw === "angular" || fw === "vanilla"
        ? // The field is the root, with the <input> written out inside it.
          element(
            "div",
            fw === "angular"
              ? ["appInput", size.value !== "md" && `size="${size.value}"`]
              : ['class="input"', `data-size="${size.value}"`],
            [...leading, ...element("input", control), ...trailing, ...actions],
          )
        : element("Input", control, [...leading, ...trailing, ...actions]);
  }

  const comment = (text: string) => (jsx ? `{/* ${text} */}` : `<!-- ${text} -->`);
  return [
    toggles && scripted && comment("A script flips aria-pressed and the input's type, as under Passwords."),
    action.value === "clear" &&
      comment(
        scripted
          ? "A script empties the input, and moves focus back to it."
          : "clear() empties the value, and moves focus back to the input.",
      ),
    !search && `<label ${fw === "react" ? "htmlFor" : "for"}="${id}">${label}</label>`,
    ...input,
    invalid.value && `<p id="${id}-error">${error}</p>`,
  ]
    .filter(Boolean)
    .join("\n");
});
</script>

<template>
  <div class="input-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-3">
      <UFormField label="Size" size="sm">
        <USelect v-model="size" :items="sizes" class="w-full" />
      </UFormField>
      <UFormField label="Type" size="sm">
        <USelect v-model="type" :items="types" class="w-full" />
      </UFormField>
      <UFormField label="Content" size="sm" class="col-span-2 sm:col-span-1">
        <USelect v-model="content" :items="contents" class="w-full" />
      </UFormField>
      <USwitch v-model="disabled" label="Disabled" size="sm" />
      <USwitch v-model="readonly" label="Read-only" size="sm" />
      <USwitch v-model="invalid" label="Invalid" size="sm" />
    </div>

    <div class="flex min-h-40 items-center justify-center p-6">
      <div class="flex w-full max-w-sm flex-col gap-1.5">
        <label v-if="type !== 'search'" :for="`playground-${field.id}`" class="text-sm font-medium">
          {{ field.label }}
        </label>
        <Input
          :id="`playground-${field.id}`"
          ref="playground-input"
          v-model="value"
          :type="inputType"
          :size="size"
          :autocomplete="field.autocomplete ?? 'off'"
          :disabled="disabled"
          :readonly="readonly"
          :aria-label="type === 'search' ? field.label : undefined"
          :aria-invalid="invalid ? 'true' : undefined"
          :aria-describedby="invalid ? `playground-${errorId}` : undefined"
        >
          <template v-if="content === 'leading icon'" #leading>
            <UIcon name="i-lucide-search" mode="svg" />
          </template>
          <template v-else-if="content === 'prefix and suffix'" #leading>$</template>
          <template v-if="content === 'prefix and suffix'" #trailing>USD</template>
          <template v-if="action === 'show password'" #actions>
            <Button
              label="Show password"
              variant="ghost"
              :size="actionSize"
              icon-only
              :aria-controls="`playground-${field.id}`"
              :aria-pressed="shown"
              :disabled="disabled"
              @click="shown = !shown"
            >
              <template #leading><UIcon :name="shown ? 'i-lucide-eye-off' : 'i-lucide-eye'" /></template>
            </Button>
          </template>
          <template v-else-if="action === 'clear'" #actions>
            <Button label="Clear" variant="ghost" :size="actionSize" icon-only @click="clear">
              <template #leading><UIcon name="i-lucide-x" /></template>
            </Button>
          </template>
        </Input>
        <p v-if="invalid" :id="`playground-${errorId}`" class="text-sm text-(--color--error-text)">
          {{ field.error }}
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
.input-playground {
  color-scheme: light;
}
.dark .input-playground {
  color-scheme: dark;
}
</style>
