<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Checkbox from "~/reference/checkbox/Checkbox.vue";
import Popover from "~/reference/popover/Popover.vue";
import type { PopoverProps } from "~/reference/popover/Popover.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a placement, an arrow and what goes inside, then press the trigger to open the
 * reference Popover, and see its code, in the framework picked in the Framework select.
 *
 * ```md
 * ::popover-playground
 * ::
 * ```
 */
type Placement = NonNullable<PopoverProps["placement"]>;
type Content = "filters" | "hint";

const placement = ref<Placement>("bottom");
const arrow = ref(false);
const content = ref<Content>("filters");

const placements: Placement[] = ["top", "bottom", "start", "end"];
const contents: Content[] = ["filters", "hint"];

// A few options to pick from, or a hint with a link, the two things popovers most often hold.
const scenarios = {
  filters: { id: "playground-filters", opener: "Filters", title: "Filters" },
  hint: { id: "playground-shortcuts", opener: "Shortcuts", title: "Keyboard shortcuts" },
} as const;
const scenario = computed(() => scenarios[content.value]);
const filters = ["Open issues only", "Assigned to me", "Has a pull request"];

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

// The trigger, then the Popover with only the props that differ from the defaults and its
// content, the way you'd write them in each framework, or for Vanilla, the markup from the
// DOM contract.
const code = computed(() => {
  const fw = framework.value;
  const { id, opener, title } = scenario.value;
  const comment = (text: string) => (fw === "react" || fw === "solid" ? `{/* ${text} */}` : `<!-- ${text} -->`);

  // React spells it the DOM property's way, popoverTarget, and the rest use the attribute.
  const target = `${fw === "react" ? "popoverTarget" : "popovertarget"}="${id}"`;
  const trigger =
    fw === "vanilla"
      ? element(
          "button",
          ['class="button"', 'type="button"', target, 'aria-haspopup="dialog"', 'data-variant="outline"', 'data-color="neutral"', 'data-size="md"'],
          [`<span data-slot="label">${opener}</span>`],
        )
      : [`<${fw === "angular" ? "button appButton" : "Button"} ${target} aria-haspopup="dialog" variant="outline">${opener}</${fw === "angular" ? "button" : "Button"}>`];

  const body =
    content.value === "filters"
      ? [comment("…a Checkbox for each filter")]
      : ["<p>Press <kbd>?</kbd> anywhere to see them all. <a href=\"/shortcuts\">Every shortcut</a></p>"];

  let popover: string[];
  if (fw === "vanilla") {
    const close = element(
      "button",
      ['class="button"', 'type="button"', 'data-variant="ghost"', 'data-color="neutral"', 'data-size="sm"', "data-icon-only", 'data-slot="close"'],
      ['<span data-slot="leading" aria-hidden="true"><svg class="lucide-x">…</svg></span>', '<span data-slot="label">Close</span>'],
    );
    popover = element(
      "div",
      [
        'class="popover"',
        `id="${id}"`,
        'role="dialog"',
        `aria-labelledby="${id}-title"`,
        'popover="auto"',
        'data-state="closed"',
        `data-placement="${placement.value}"`,
      ],
      [
        ...element("div", ['data-slot="header"'], [`<p id="${id}-title" data-slot="title">${title}</p>`, ...close]),
        ...element("div", ['data-slot="body"'], body),
        ...(arrow.value ? ['<span data-slot="arrow" aria-hidden="true"></span>'] : []),
      ],
    );
  } else {
    const props = [
      fw === "angular" && "appPopover",
      `id="${id}"`,
      // Angular's Popover is on the element itself, which keeps a `title` attribute as a tooltip.
      `${fw === "angular" ? "popoverTitle" : "title"}="${title}"`,
      placement.value !== "bottom" && `placement="${placement.value}"`,
      arrow.value && "arrow",
    ];
    popover = element(fw === "angular" ? "div" : "Popover", props, body);
  }

  return [
    ...(fw === "vanilla" || fw === "astro" ? [comment("popovertarget opens it, before any script loads.")] : []),
    ...trigger,
    ...popover,
  ].join("\n");
});
</script>

<template>
  <div class="popover-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-3">
      <UFormField label="Placement" size="sm">
        <USelect v-model="placement" :items="placements" class="w-full" />
      </UFormField>
      <UFormField label="Content" size="sm">
        <USelect v-model="content" :items="contents" class="w-full" />
      </UFormField>
      <USwitch v-model="arrow" label="Arrow" size="sm" />
    </div>

    <div class="flex min-h-48 items-center justify-center p-6">
      <Button :popovertarget="scenario.id" aria-haspopup="dialog" variant="outline">{{ scenario.opener }}</Button>
      <Popover :id="scenario.id" :key="scenario.id" :title="scenario.title" :placement="placement" :arrow="arrow">
        <div v-if="content === 'filters'" class="flex flex-col gap-2">
          <Checkbox v-for="(filter, index) in filters" :key="filter" :checked="index === 0">{{ filter }}</Checkbox>
        </div>
        <p v-else>Press <kbd>?</kbd> anywhere to see them all. <a href="/docs/components/popover#keyboard" class="underline">Every shortcut</a></p>
      </Popover>
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
.popover-playground {
  color-scheme: light;
}
.dark .popover-playground {
  color-scheme: dark;
}
</style>
