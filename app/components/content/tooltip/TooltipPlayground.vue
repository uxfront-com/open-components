<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Tooltip from "~/reference/tooltip/Tooltip.vue";
import type { TooltipProps } from "~/reference/tooltip/Tooltip.vue";
import "~/reference/button/tokens.css";

/**
 * Pick a type, a placement, a delay and an arrow, then hover or focus the trigger to see the
 * reference Tooltip, and its code, in the framework picked in the Framework select.
 *
 * ```md
 * ::tooltip-playground
 * ::
 * ```
 */
type Type = NonNullable<TooltipProps["type"]>;
type Placement = NonNullable<TooltipProps["placement"]>;

const type = ref<Type>("label");
const placement = ref<Placement>("top");
const delay = ref("500");
const arrow = ref(false);

const types: Type[] = ["label", "description"];
const placements: Placement[] = ["top", "bottom", "start", "end"];
const delays = ["300", "500", "700", "1000"];

// A label shows an icon-only button's hidden name, and a description adds a hint to a named one.
const label = computed(() => (type.value === "label" ? "Settings" : "Archived projects stay in search"));
// Changing the type swaps the trigger, so the Tooltip starts over.
const key = computed(() => `${type.value}-${placement.value}-${delay.value}-${arrow.value}`);

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

// The Tooltip with only the props that differ from the defaults, around its trigger,
// the way you'd write them in each framework, or for Vanilla, the markup from the
// DOM contract, which its script wires up.
const code = computed(() => {
  const fw = framework.value;
  const icon = type.value === "label";
  const props = [
    `label="${label.value}"`,
    icon && 'type="label"',
    delay.value !== "500" && (fw === "vue" ? `:delay="${delay.value}"` : `delay={${delay.value}}`),
    placement.value !== "top" && `placement="${placement.value}"`,
    arrow.value && "arrow",
  ].filter(Boolean) as string[];

  switch (fw) {
    case "react":
    case "solid":
      return [
        `<Tooltip ${props.join(" ")}>`,
        "  {(trigger) => (",
        icon
          ? '    <Button\n      {...trigger}\n      label="Settings"\n      variant="outline"\n      iconOnly\n      leading={<SettingsIcon />}\n    />'
          : '    <Button {...trigger} variant="outline" leading={<ArchiveIcon />}>\n      Archive\n    </Button>',
        "  )}",
        "</Tooltip>",
      ].join("\n");
    case "vue":
      return [
        `<Tooltip ${props.join(" ")} v-slot="{ trigger }">`,
        icon ? '  <Button v-bind="trigger" label="Settings" variant="outline" icon-only>' : '  <Button v-bind="trigger" variant="outline">',
        `    <template #leading><${icon ? "SettingsIcon" : "ArchiveIcon"} /></template>`,
        ...(icon ? [] : ["    Archive"]),
        "  </Button>",
        "</Tooltip>",
      ].join("\n");
    case "svelte":
      return [
        `<Tooltip ${props.join(" ")}>`,
        "  {#snippet children(trigger)}",
        icon ? '    <Button {...trigger} label="Settings" variant="outline" iconOnly>' : '    <Button {...trigger} variant="outline">',
        `      {#snippet leading()}<${icon ? "SettingsIcon" : "ArchiveIcon"} />{/snippet}`,
        ...(icon ? [] : ["      Archive"]),
        "    </Button>",
        "  {/snippet}",
        "</Tooltip>",
      ].join("\n");
    case "angular": {
      const attrs = [
        `appTooltip="${label.value}"`,
        icon && 'tooltipType="label"',
        delay.value !== "500" && `[tooltipDelay]="${delay.value}"`,
        placement.value !== "top" && `tooltipPlacement="${placement.value}"`,
        arrow.value && "tooltipArrow",
      ].filter(Boolean);
      return [
        icon
          ? `<button appButton label="Settings" variant="outline" iconOnly ${attrs.join(" ")}>`
          : `<button appButton variant="outline" ${attrs.join(" ")}>`,
        `  <lucide-icon leading [img]="${icon ? "SettingsIcon" : "ArchiveIcon"}" />`,
        ...(icon ? [] : ["  Archive"]),
        "</button>",
      ].join("\n");
    }
    case "astro":
      return [
        `<Tooltip ${props.join(" ")}>`,
        icon ? '  <Button label="Settings" variant="outline" iconOnly>' : '  <Button variant="outline">',
        `    <${icon ? "SettingsIcon" : "ArchiveIcon"} slot="leading" />`,
        ...(icon ? [] : ["    Archive"]),
        "  </Button>",
        "</Tooltip>",
      ].join("\n");
    default: {
      const data = [
        `data-state="closed"`,
        `data-placement="${placement.value}"`,
        delay.value !== "500" && `data-delay="${delay.value}"`,
      ].filter(Boolean);
      const part = arrow.value ? '<span data-slot="arrow" aria-hidden="true"></span>' : "";
      return [
        "<!-- tooltip.js, written out under Label and description, wires each .tooltip to the element right before it. -->",
        icon
          ? '<button class="button" type="button" data-variant="outline" data-color="neutral" data-size="md" data-icon-only>'
          : '<button class="button" type="button" aria-describedby="archive-tooltip" data-variant="outline" data-color="neutral" data-size="md">',
        `  <span data-slot="leading" aria-hidden="true"><svg class="lucide-${icon ? "settings" : "archive"}">…</svg></span>`,
        `  <span data-slot="label">${icon ? "Settings" : "Archive"}</span>`,
        "</button>",
        icon
          ? `<span class="tooltip" aria-hidden="true" popover="manual" ${data.join(" ")}>${label.value}${part}</span>`
          : `<span class="tooltip" id="archive-tooltip" role="tooltip" popover="manual" ${data.join(" ")}>\n  ${label.value}${part}\n</span>`,
      ].join("\n");
    }
  }
});
</script>

<template>
  <div class="tooltip-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-3 items-end gap-3 border-b border-muted p-4 sm:grid-cols-4">
      <UFormField label="Type" size="sm">
        <USelect v-model="type" :items="types" class="w-full" />
      </UFormField>
      <UFormField label="Placement" size="sm">
        <USelect v-model="placement" :items="placements" class="w-full" />
      </UFormField>
      <UFormField label="Delay" size="sm">
        <USelect v-model="delay" :items="delays" class="w-full" />
      </UFormField>
      <USwitch v-model="arrow" label="Arrow" size="sm" class="pb-1.5" />
    </div>

    <div class="flex min-h-40 items-center justify-center p-6">
      <Tooltip :key="key" :label="label" :type="type" :placement="placement" :delay="Number(delay)" :arrow="arrow" v-slot="{ trigger }">
        <Button v-if="type === 'label'" v-bind="trigger" label="Settings" variant="outline" icon-only>
          <template #leading><UIcon name="i-lucide-settings" mode="svg" /></template>
        </Button>
        <Button v-else v-bind="trigger" variant="outline">
          <template #leading><UIcon name="i-lucide-archive" mode="svg" /></template>
          Archive
        </Button>
      </Tooltip>
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
.tooltip-playground {
  color-scheme: light;
}
.dark .tooltip-playground {
  color-scheme: dark;
}
</style>
