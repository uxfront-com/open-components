<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import TagGroup from "~/reference/tag-group/TagGroup.vue";
import type { TagGroupItem, TagGroupProps } from "~/reference/tag-group/TagGroup.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a size and a few options, then use the reference Tag Group, remove its tags to see
 * where focus goes, and see its code, in the framework picked in the Framework select.
 *
 * ```md
 * ::tag-group-playground
 * ::
 * ```
 */
type Size = NonNullable<TagGroupProps["size"]>;

const ALL: TagGroupItem[] = [
  { value: "bug", label: "Bug" },
  { value: "docs", label: "Docs" },
  { value: "accessibility", label: "Accessibility" },
];

const size = ref<Size>("md");
const link = ref(false);
const removable = ref(true);
const disabled = ref(false);
const readonly = ref(false);
const labels = ref([...ALL]);
const reset = useTemplateRef<{ $el: HTMLElement }>("reset");

const sizes: Size[] = ["xs", "sm", "md", "lg", "xl"];
const tags = computed(() => labels.value.map((tag) => (link.value ? { ...tag, href: `#labels-${tag.value}` } : tag)));

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

// The Tag Group with only the props that differ from the defaults, the way you'd write them
// in each framework, or for Vanilla, its DOM contract with the first tag.
const code = computed(() => {
  const fw = framework.value;
  if (fw === "vanilla") {
    const removes = removable.value && !disabled.value && !readonly.value;
    const tagAttrs = [`class="tag"`, `data-size="${size.value}"`, disabled.value && "data-disabled", readonly.value && "data-readonly"].filter(Boolean);
    const label = link.value ? `<a ${disabled.value ? 'role="link" aria-disabled="true"' : 'href="/labels/bug"'}>Bug</a>` : "Bug";
    return [
      `<div class="tag-group" data-size="${size.value}">`,
      `  <ul data-slot="list" role="list" aria-label="Labels">`,
      `    <li data-slot="item">`,
      `      <span ${tagAttrs.join(" ")}>`,
      `        <span data-slot="label">${label}</span>`,
      removes && '        <button data-slot="remove" type="button" aria-label="Remove Bug">…</button>',
      "      </span>",
      "    </li>",
      "    <!-- …one <li> per tag -->",
      "  </ul>",
      "</div>",
    ]
      .filter(Boolean)
      .join("\n");
  }
  const tagsProp = { react: "tags={labels}", vue: ':tags="labels"', svelte: "tags={labels}", angular: '[tags]="labels"', solid: "tags={labels()}", astro: "tags={labels}" }[fw];
  const onRemove = { react: "onRemove={remove}", vue: '@remove="remove"', svelte: "onremove={remove}", angular: '(remove)="remove($event)"', solid: "onRemove={remove}", astro: "" }[fw];
  // The group names Reset as the place focus goes when no tag follows the one removed.
  const fallback = {
    react: "fallbackFocus={() => reset.current}",
    vue: ':fallback-focus="() => reset?.$el"',
    svelte: "fallbackFocus={() => reset}",
    angular: '[fallbackFocus]="reset"',
    solid: "fallbackFocus={() => reset}",
    astro: "",
  }[fw];
  const empty = fw === "vue" ? 'empty-label="No labels"' : 'emptyLabel="No labels"';
  const props = [
    'label="Labels"',
    tagsProp,
    size.value !== "md" && `size="${size.value}"`,
    removable.value && "removable",
    disabled.value && "disabled",
    readonly.value && "readonly",
    empty,
    removable.value && fallback,
    removable.value && onRemove,
  ].filter(Boolean);
  const links = link.value ? "\n\n<!-- Each tag in labels has an href, like { value: \"bug\", label: \"Bug\", href: \"/labels/bug\" }. -->" : "";
  if (fw === "angular") return `<div appTagGroup ${props.join(" ")}></div>${links}`;
  const comment = (text: string) => (fw === "react" || fw === "solid" ? `\n\n{/* ${text} */}` : `\n\n<!-- ${text} -->`);
  return `<TagGroup ${props.join(" ")} />${link.value ? comment('Each tag in labels has an href, like { value: "bug", label: "Bug", href: "/labels/bug" }.') : ""}`;
});
</script>

<template>
  <div class="tag-group-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-3">
      <UFormField label="Size" size="sm">
        <USelect v-model="size" :items="sizes" class="w-full" />
      </UFormField>
      <USwitch v-model="link" label="Links" size="sm" />
      <USwitch v-model="removable" label="Removable" size="sm" />
      <USwitch v-model="disabled" label="Disabled" size="sm" />
      <USwitch v-model="readonly" label="Read-only" size="sm" />
    </div>

    <div class="flex min-h-32 flex-wrap items-center justify-center gap-2 p-6">
      <TagGroup
        label="Labels"
        :tags="tags"
        :size="size"
        :removable="removable"
        :disabled="disabled"
        :readonly="readonly"
        empty-label="No labels"
        :fallback-focus="() => reset?.$el"
        @remove="(tag) => (labels = labels.filter((other) => other.value !== tag.value))"
      />
      <Button ref="reset" size="xs" variant="ghost" @click="labels = [...ALL]">Reset</Button>
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
.tag-group-playground {
  color-scheme: light;
}
.dark .tag-group-playground {
  color-scheme: dark;
}
</style>
