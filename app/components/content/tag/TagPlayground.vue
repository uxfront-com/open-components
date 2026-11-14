<script setup lang="ts">
import Tag from "~/reference/tag/Tag.vue";
import type { TagProps } from "~/reference/tag/Tag.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a size and a few options, then use the reference Tag, and see its code, in the
 * framework picked in the Framework select.
 *
 * ```md
 * ::tag-playground
 * ::
 * ```
 */
type Size = NonNullable<TagProps["size"]>;

const size = ref<Size>("md");
const icon = ref(false);
const link = ref(false);
const removable = ref(true);
const disabled = ref(false);
const readonly = ref(false);
// Removing it here only counts, so the tag stays to play with.
const removed = ref(0);

const sizes: Size[] = ["xs", "sm", "md", "lg", "xl"];

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

// The Tag with only the props that differ from the defaults, the way you'd write them in
// each framework, or for Vanilla, its DOM contract.
const code = computed(() => {
  const fw = framework.value;
  const removes = removable.value && !disabled.value && !readonly.value;
  if (fw === "vanilla") {
    const attrs = [`class="tag"`, `data-size="${size.value}"`, disabled.value && "data-disabled", readonly.value && "data-readonly"].filter(Boolean);
    const label = link.value
      ? `<a ${disabled.value ? 'role="link" aria-disabled="true"' : 'href="/labels/bug"'}>Bug</a>`
      : "Bug";
    return [
      `<span ${attrs.join(" ")}>`,
      icon.value && '  <span data-slot="leading" aria-hidden="true"><svg class="lucide-bug">…</svg></span>',
      `  <span data-slot="label">${label}</span>`,
      removes && '  <button data-slot="remove" type="button" aria-label="Remove Bug">…</button>',
      "</span>",
    ]
      .filter(Boolean)
      .join("\n");
  }
  const onRemove = { react: "onRemove={remove}", vue: '@remove="remove"', svelte: "onremove={remove}", angular: '(remove)="remove()"', solid: "onRemove={remove}", astro: "" }[fw];
  const href = { react: 'href="/labels/bug"', vue: 'href="/labels/bug"', svelte: 'href="/labels/bug"', angular: "[href]=\"'/labels/bug'\"", solid: 'href="/labels/bug"', astro: 'href="/labels/bug"' }[fw];
  const props = [
    'label="Bug"',
    size.value !== "md" && `size="${size.value}"`,
    link.value && href,
    removable.value && "removable",
    disabled.value && "disabled",
    readonly.value && "readonly",
    removable.value && onRemove,
  ].filter(Boolean);
  const leading = {
    react: "leading={<BugIcon />}",
    vue: "<template #leading><BugIcon /></template>",
    svelte: "{#snippet leading()}<BugIcon />{/snippet}",
    angular: '<lucide-icon leading name="bug" />',
    solid: "leading={<BugIcon />}",
    astro: '<BugIcon slot="leading" />',
  }[fw]!;
  if (fw === "angular") {
    return `<span appTag ${props.join(" ")}>${icon.value ? `\n  ${leading}\n` : ""}</span>`;
  }
  if (icon.value && (fw === "react" || fw === "solid")) props.push(leading);
  if (icon.value && fw !== "react" && fw !== "solid") return `<Tag ${props.join(" ")}>\n  ${leading}\n</Tag>`;
  return `<Tag ${props.join(" ")} />`;
});
</script>

<template>
  <div class="tag-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-3">
      <UFormField label="Size" size="sm">
        <USelect v-model="size" :items="sizes" class="w-full" />
      </UFormField>
      <USwitch v-model="icon" label="Leading icon" size="sm" />
      <USwitch v-model="link" label="Link" size="sm" />
      <USwitch v-model="removable" label="Removable" size="sm" />
      <USwitch v-model="disabled" label="Disabled" size="sm" />
      <USwitch v-model="readonly" label="Read-only" size="sm" />
    </div>

    <div class="flex min-h-32 flex-col items-center justify-center gap-2 p-6">
      <Tag
        label="Bug"
        :size="size"
        :href="link ? '#labels-bug' : undefined"
        :removable="removable"
        :disabled="disabled"
        :readonly="readonly"
        @remove="removed++"
      >
        <template v-if="icon" #leading><UIcon name="i-lucide-bug" mode="svg" /></template>
      </Tag>
      <p class="text-muted text-xs" aria-live="polite">
        <template v-if="removed">Fired remove {{ removed === 1 ? "once" : `${removed} times` }}</template>
      </p>
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
.tag-playground {
  color-scheme: light;
}
.dark .tag-playground {
  color-scheme: dark;
}
</style>
