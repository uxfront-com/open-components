<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import type { ButtonProps } from "~/reference/button/Button.vue";
import "~/reference/button/tokens.css";

/**
 * The live examples on the Button page, drawn with the reference implementation,
 * above the code that renders them:
 *
 * ```md
 * ::button-example{name="variants"}
 * ```vue
 * <Button variant="solid">Solid</Button>
 * ```
 * ::
 * ```
 *
 * The code is the default slot, so the page's markdown keeps a plain code block.
 */
defineProps<{
  name:
    | "link"
    | "variants"
    | "colors"
    | "sizes"
    | "icons"
    | "states"
    | "hierarchy"
    | "destructive"
    | "loading"
    | "languages";
}>();

const variants = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;
const colors = ["primary", "secondary", "neutral", "success", "info", "warning", "error"] as const;
const sizes = ["xs", "sm", "md", "lg", "xl"] as const satisfies ButtonProps["size"][];

const muted = ref(false);
const open = ref(false);

// A save that takes two seconds, then reports its outcome.
const saving = ref(false);
const status = ref("");
async function save() {
  saving.value = true;
  status.value = "";
  await new Promise((resolve) => setTimeout(resolve, 2000));
  saving.value = false;
  status.value = "Changes saved";
}
</script>

<template>
  <div class="my-5">
    <div
      class="button-example not-prose relative flex justify-center rounded-md border border-muted p-4"
      :class="{ 'rounded-b-none border-b-0': $slots.default }"
    >
      <div v-if="name === 'link'" class="flex flex-wrap items-center justify-center gap-3">
        <Button href="/docs" color="primary">
          Read the introduction
          <template #trailing><UIcon name="i-lucide-arrow-right" class="rtl:-scale-x-100" /></template>
        </Button>
      </div>

      <div v-else-if="name === 'variants'" class="flex flex-wrap items-center justify-center gap-3">
        <Button v-for="variant in variants" :key="variant" :variant="variant" color="primary">
          {{ variant[0]!.toUpperCase() + variant.slice(1) }}
        </Button>
      </div>

      <!-- Every colour in every variant: a picture of the table that follows, so
           it's inert and hidden. 42 more tab stops would only get in the way.
           Narrow containers wrap each colour's six variants onto two rows. -->
      <div v-else-if="name === 'colors'" class="@container w-full" inert aria-hidden="true">
        <div class="mx-auto grid w-fit grid-cols-[auto_repeat(3,auto)] items-center gap-x-2 gap-y-2 @xl:grid-cols-[auto_repeat(6,auto)] @xl:gap-x-3">
          <template v-for="color in colors" :key="color">
            <span class="text-muted row-span-2 pe-1 font-mono text-xs @xl:row-span-1">{{ color }}</span>
            <Button v-for="variant in variants" :key="variant" :variant="variant" :color="color" size="sm">
              {{ variant[0]!.toUpperCase() + variant.slice(1) }}
            </Button>
          </template>
        </div>
      </div>

      <div v-else-if="name === 'sizes'" class="flex flex-col items-center gap-4">
        <div class="flex flex-wrap items-center justify-center gap-3">
          <Button v-for="size in sizes" :key="size" :size="size" color="primary" variant="soft">
            <template #leading><UIcon name="i-lucide-plus" /></template>
            Add {{ size }}
          </Button>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <Button
            v-for="size in sizes"
            :key="size"
            :size="size"
            :label="`Settings (${size})`"
            variant="outline"
            icon-only
          >
            <template #leading><UIcon name="i-lucide-settings" /></template>
          </Button>
        </div>
      </div>

      <div v-else-if="name === 'icons'" class="flex flex-wrap items-center justify-center gap-3">
        <Button color="primary">
          <template #leading><UIcon name="i-lucide-plus" /></template>
          New project
        </Button>
        <Button variant="outline">
          Continue
          <template #trailing><UIcon name="i-lucide-arrow-right" class="rtl:-scale-x-100" /></template>
        </Button>
        <Button label="Delete" variant="ghost" color="error" icon-only>
          <template #leading><UIcon name="i-lucide-trash-2" /></template>
        </Button>
      </div>

      <div v-else-if="name === 'states'" class="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
        <figure class="flex flex-col items-center gap-2">
          <Button color="primary">Save</Button>
          <figcaption class="text-muted text-xs">At rest (try hovering, pressing or tabbing to it)</figcaption>
        </figure>
        <figure class="flex flex-col items-center gap-2">
          <Button color="primary" disabled>Save</Button>
          <figcaption class="text-muted text-xs">Disabled</figcaption>
        </figure>
        <figure class="flex flex-col items-center gap-2">
          <Button color="primary" disabled focusable-when-disabled>Save</Button>
          <figcaption class="text-muted text-xs">Disabled, but still focusable</figcaption>
        </figure>
        <figure class="flex flex-col items-center gap-2">
          <Button color="primary" loading loading-label="Saving">Save</Button>
          <figcaption class="text-muted text-xs">Loading</figcaption>
        </figure>
        <figure class="flex flex-col items-center gap-2">
          <Button variant="ghost" :aria-pressed="muted" @click="muted = !muted">
            <template #leading><UIcon :name="muted ? 'i-lucide-volume-x' : 'i-lucide-volume-2'" /></template>
            Mute
          </Button>
          <figcaption class="text-muted text-xs">Pressed: {{ muted }}</figcaption>
        </figure>
        <figure class="flex flex-col items-center gap-2">
          <Button variant="outline" aria-haspopup="menu" :aria-expanded="open" @click="open = !open">
            Options
            <template #trailing><UIcon name="i-lucide-chevron-down" /></template>
          </Button>
          <figcaption class="text-muted text-xs">Expanded: {{ open }}</figcaption>
        </figure>
      </div>

      <div v-else-if="name === 'hierarchy'" class="flex w-full max-w-md flex-col gap-4 rounded-lg border border-default p-5">
        <div>
          <p class="text-highlighted font-semibold">Publish this post?</p>
          <p class="text-muted text-sm">It goes live for all subscribers right away.</p>
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <Button variant="ghost">Cancel</Button>
          <Button variant="outline">Schedule…</Button>
          <Button color="primary">Publish post</Button>
        </div>
      </div>

      <div v-else-if="name === 'destructive'" class="flex w-full max-w-md flex-col gap-4 rounded-lg border border-default p-5">
        <div>
          <p class="text-highlighted font-semibold">Delete “Marketing site”?</p>
          <p class="text-muted text-sm">Its 24 pages and their history will be deleted for good.</p>
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <Button variant="outline">Keep project</Button>
          <Button color="error">Delete project</Button>
        </div>
      </div>

      <div v-else-if="name === 'languages'" class="flex flex-wrap items-end justify-center gap-x-10 gap-y-6">
        <figure class="flex flex-col items-center gap-2">
          <div class="w-40">
            <Button color="primary" lang="de">Alle Änderungen speichern</Button>
          </div>
          <figcaption class="text-muted text-xs">German, in a narrow column</figcaption>
        </figure>
        <figure class="flex flex-col items-center gap-2">
          <div dir="rtl" lang="ar">
            <Button variant="outline">
              متابعة
              <template #trailing><UIcon name="i-lucide-arrow-right" class="rtl:-scale-x-100" /></template>
            </Button>
          </div>
          <figcaption class="text-muted text-xs">Arabic, from right to left</figcaption>
        </figure>
      </div>

      <div v-else-if="name === 'loading'" class="flex flex-wrap items-center justify-center gap-3">
        <Button color="primary" :loading="saving" loading-label="Saving" @click="save">Save changes</Button>
        <!-- The page announces the outcome: a status message that's always in the page. -->
        <p role="status" class="text-muted min-w-28 text-sm">{{ status }}</p>
      </div>
    </div>

    <div v-if="$slots.default" class="[&>div>pre]:rounded-t-none [&>div]:my-0">
      <slot />
    </div>
  </div>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.button-example {
  color-scheme: light;
}
.dark .button-example {
  color-scheme: dark;
}
</style>
