<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Dialog from "~/reference/dialog/Dialog.vue";
import type { DialogProps } from "~/reference/dialog/Dialog.vue";
import Input from "~/reference/input/Input.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a role, size and content, open the reference Dialog, and see its code, in
 * the framework picked in the Framework select.
 *
 * ```md
 * ::dialog-playground
 * ::
 * ```
 */
type Role = NonNullable<DialogProps["role"]>;
type Content = "form" | "message";

const role = ref<Role>("dialog");
const size = ref<NonNullable<DialogProps["size"]>>("md");
const content = ref<Content>("form");
const described = ref(true);
const open = ref(false);

const roles: Role[] = ["dialog", "alertdialog"];
const sizes = ["sm", "md", "lg"];
const contents: Content[] = ["form", "message"];

// What each kind of dialog asks: a confirmation is an alert dialog, with its least
// destructive action first, and the rest are dialogs with a form or a message.
const scenarios = {
  form: {
    id: "edit-profile",
    opener: "Edit profile",
    title: "Edit profile",
    description: "Your name and email address, as other people see them.",
    actions: [
      { label: "Cancel", value: "cancel", variant: "outline" },
      { label: "Save changes", value: "save", color: "primary" },
    ],
  },
  message: {
    id: "whats-new",
    opener: "What's new",
    title: "What's new",
    description: "Version 2.4 is out, with dark mode and faster search.",
    actions: [{ label: "Done", value: "done" }],
  },
  confirmation: {
    id: "delete-project",
    opener: "Delete project",
    title: "Delete project?",
    description: "This deletes the project and its 12 files for everyone. You can't undo it.",
    actions: [
      { label: "Keep project", value: "keep", variant: "outline" },
      { label: "Delete project", value: "delete", color: "error" },
    ],
  },
} as const;

type Action = { label: string; value: string; variant?: "outline"; color?: "primary" | "error" };
const scenario = computed(() => scenarios[role.value === "alertdialog" ? "confirmation" : content.value]);
const actions = computed<readonly Action[]>(() => scenario.value.actions);
const form = computed(() => role.value === "dialog" && content.value === "form");

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

// The opener, the Dialog with only the props that differ from the defaults, its
// content and its actions, the way you'd write them in each framework, or for
// Vanilla, the markup from the DOM contract.
const code = computed(() => {
  const fw = framework.value;
  const jsx = fw === "react" || fw === "solid";
  // Astro and Vanilla have no state to bind, so the Dialog's script opens the dialog
  // a button controls, and a <form method="dialog"> closes it.
  const scripted = fw === "astro" || fw === "vanilla";
  const { id, opener, title, description } = scenario.value;
  const comment = (text: string) => (jsx ? `{/* ${text} */}` : `<!-- ${text} -->`);

  const set = (value: boolean) =>
    ({
      react: `setOpen(${value})`,
      vue: `open = ${value}`,
      svelte: `(open = ${value})`,
      angular: `open.set(${value})`,
      solid: `setOpen(${value})`,
    })[fw]!;
  const onClick = (value: boolean) =>
    ({
      react: `onClick={() => ${set(value)}}`,
      vue: `@click="${set(value)}"`,
      svelte: `onclick={() => ${set(value)}}`,
      angular: `(click)="${set(value)}"`,
      solid: `onClick={() => ${set(value)}}`,
    })[fw];

  function button(label: string, attrs: (string | false | undefined)[], variant = "solid", color = "neutral") {
    if (fw === "vanilla") {
      return element(
        "button",
        ['class="button"', ...attrs, `data-variant="${variant}"`, `data-color="${color}"`, 'data-size="md"'],
        [`<span data-slot="label">${label}</span>`],
      );
    }
    const tag = fw === "angular" ? "button" : "Button";
    const line = element(
      tag,
      // Like the page's examples: what the button sends first, then how it looks, then
      // what it does when pressed.
      [
        fw === "angular" && "appButton",
        ...(scripted ? attrs : []),
        variant !== "solid" && `variant="${variant}"`,
        color !== "neutral" && `color="${color}"`,
        ...(scripted ? [] : attrs),
      ],
      [label],
    );
    return line.length === 3 ? [`${line[0]}${label}</${tag}>`] : line;
  }

  // A destructive action looks like one, before and in the dialog it opens.
  const [variant, color] = role.value === "alertdialog" ? ["outline", "error"] : [];
  const openerButton = scripted
    ? button(opener, [fw === "vanilla" && 'type="button"', 'aria-haspopup="dialog"', `aria-controls="${id}"`], variant, color)
    : button(opener, [onClick(true)], variant, color);

  const actionButtons = actions.value.flatMap((action) =>
    button(
      action.label,
      scripted ? ['type="submit"', `value="${action.value}"`] : [onClick(false)],
      action.variant,
      action.color,
    ),
  );
  const actionsBlock = scripted ? element("form", ['method="dialog"'], actionButtons) : actionButtons;

  const body = form.value
    ? [comment("…the form's fields")]
    : role.value === "dialog"
      ? ["<p>Turn it on under Settings, or keep following your system's.</p>"]
      : [];

  let dialog: string[];
  if (fw === "vanilla") {
    const close = element(
      "button",
      [
        'class="button"',
        'type="button"',
        'data-slot="close"',
        'data-variant="ghost"',
        'data-color="neutral"',
        'data-size="sm"',
        "data-icon-only",
      ],
      ['<span data-slot="leading" aria-hidden="true"><svg class="lucide-x">…</svg></span>', '<span data-slot="label">Close</span>'],
    );
    const header = element("div", ['data-slot="header"'], [
      `<h2 id="${id}-title" data-slot="title">${title}</h2>`,
      ...(role.value === "dialog" ? close : []),
      ...(described.value ? [`<p id="${id}-description" data-slot="description">${description}</p>`] : []),
    ]);
    dialog = element(
      "dialog",
      [
        'class="dialog"',
        `id="${id}"`,
        role.value === "alertdialog" && 'role="alertdialog"',
        `aria-labelledby="${id}-title"`,
        described.value && `aria-describedby="${id}-description"`,
        `data-size="${size.value}"`,
      ],
      [
        ...header,
        ...(body.length ? element("div", ['data-slot="body"'], body) : []),
        ...element("div", ['data-slot="actions"'], actionsBlock),
      ],
    );
  } else {
    const bound: Record<string, (string | false)[]> = {
      react: ["open={open}", "onClose={() => setOpen(false)}"],
      vue: [':open="open"', '@close="open = false"'],
      svelte: ["{open}", "onclose={() => (open = false)}"],
      angular: ['[open]="open()"', '(closeRequest)="open.set(false)"'],
      solid: ["open={open()}", "onClose={() => setOpen(false)}"],
      astro: [],
    };
    const props = [
      fw === "angular" && "appDialog",
      `id="${id}"`,
      role.value === "alertdialog" && 'role="alertdialog"',
      size.value !== "md" && `size="${size.value}"`,
      // Angular's Dialog is on the <dialog>, which keeps a `title` attribute as a tooltip.
      `${fw === "angular" ? "dialogTitle" : "title"}="${title}"`,
      described.value && `description="${description}"`,
      ...bound[fw]!,
    ];
    if (jsx) {
      const fragment = ["<>", ...actionsBlock.map((line) => `  ${line}`), "</>"];
      dialog = element("Dialog", [...props, ["actions={", ...fragment.map((line) => `  ${line}`), "}"].join("\n")], body);
    } else {
      const wrappers: Record<string, [string, string]> = {
        vue: ["<template #actions>", "</template>"],
        svelte: ["{#snippet actions()}", "{/snippet}"],
        angular: ["<div actions>", "</div>"],
        astro: ['<Fragment slot="actions">', "</Fragment>"],
      };
      const [start, end] = wrappers[fw]!;
      dialog = element(fw === "angular" ? "dialog" : "Dialog", props, [
        ...body,
        start,
        ...actionsBlock.map((line) => `  ${line}`),
        end,
      ]);
    }
  }

  return [
    scripted && comment("The Dialog's script opens it from the button that controls it."),
    ...openerButton,
    "",
    ...dialog,
  ]
    .filter((line) => line !== false)
    .join("\n");
});
</script>

<template>
  <div class="dialog-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-3">
      <UFormField label="Role" size="sm">
        <USelect v-model="role" :items="roles" class="w-full" />
      </UFormField>
      <UFormField label="Size" size="sm">
        <USelect v-model="size" :items="sizes" class="w-full" />
      </UFormField>
      <UFormField label="Content" size="sm" class="col-span-2 sm:col-span-1">
        <USelect v-model="content" :items="contents" :disabled="role === 'alertdialog'" class="w-full" />
      </UFormField>
      <USwitch v-model="described" label="Description" size="sm" />
    </div>

    <div class="flex min-h-32 items-center justify-center p-6">
      <Button
        :variant="role === 'alertdialog' ? 'outline' : 'solid'"
        :color="role === 'alertdialog' ? 'error' : 'neutral'"
        @click="open = true"
      >
        {{ scenario.opener }}
      </Button>
      <Dialog
        :id="`playground-${scenario.id}`"
        :role="role"
        :size="size"
        :title="scenario.title"
        :description="described ? scenario.description : undefined"
        :open="open"
        @close="open = false"
      >
        <div v-if="form" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="playground-name" class="text-sm font-medium">Full name</label>
            <Input id="playground-name" autocomplete="name" value="Ada Lovelace" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="playground-email" class="text-sm font-medium">Email address</label>
            <Input id="playground-email" type="email" autocomplete="email" value="ada@example.com" />
          </div>
        </div>
        <p v-else-if="role === 'dialog'">Turn it on under Settings, or keep following your system's.</p>
        <template #actions>
          <Button
            v-for="action in actions"
            :key="action.value"
            :variant="action.variant"
            :color="action.color"
            @click="open = false"
          >
            {{ action.label }}
          </Button>
        </template>
      </Dialog>
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
.dialog-playground {
  color-scheme: light;
}
.dark .dialog-playground {
  color-scheme: dark;
}
</style>
