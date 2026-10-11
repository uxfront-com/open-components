<script setup lang="ts">
import { onMounted, useAttrs, useTemplateRef } from "vue";

export interface SwitchProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
}

// Attributes go on the <input> rather than on the root, so they're declared below.
defineOptions({ inheritAttrs: false });

const { size = "md", disabled = false } = defineProps<SwitchProps>();

/** Whether it's on, which `v-model:checked` binds. Without it, the switch keeps its own state, and its form submits it while it's on. */
const checked = defineModel<boolean>("checked", { default: false });

const attrs = useAttrs();
// Classes and styles go on the root, which sizes the switch, so a class can set its
// variables. Everything else goes on the <input>: `id`, `name`, `value`, ARIA and
// listeners. Attrs aren't reactive, so these run on every render.
const onRoot = (key: string) => key === "class" || key === "style";
const rootAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => onRoot(key)));
const controlAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => !onRoot(key)));

const input = useTemplateRef<HTMLInputElement>("input");

function onChange(event: Event) {
  checked.value = (event.target as HTMLInputElement).checked;
}

// A ref to the Switch gets you the <input>, through `input`.
defineExpose({ input });

onMounted(() => {
  if (import.meta.env.DEV) {
    const el = input.value;
    const named = el?.labels?.length || el?.hasAttribute("aria-label") || el?.hasAttribute("aria-labelledby");
    if (el && !named) {
      console.warn("[Switch] has no accessible name: give it a <label for> that names the setting.", el);
    }
  }
});
</script>

<template>
  <span class="switch" v-bind="rootAttrs()" :data-size="size">
    <!-- A native checkbox, so Space, the label, forms and autofill work as they always do.
         `role="switch"` makes screen readers announce it as on or off rather than checked. -->
    <input
      ref="input"
      data-slot="control"
      :disabled="disabled"
      v-bind="controlAttrs()"
      type="checkbox"
      role="switch"
      :checked="checked"
      @change="onChange"
    />
    <!-- The track and thumb only draw the state, which the <input> already exposes. -->
    <span data-slot="track" aria-hidden="true"><span data-slot="thumb" /></span>
  </span>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The switch's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .switch {
    /* Set per size. */
    --switch--track--width: 2.25rem;
    --switch--track--height: 1.25rem;
    --switch--thumb--offset: 0.125rem;
    /* The thumb fills the track's height, inside its 1px border, less the offset on each side. */
    --switch--thumb--size: calc(var(--switch--track--height) - 2px - 2 * var(--switch--thumb--offset));
    /* Off, the track is an outline and the thumb a dot, both in the text colour at 55%,
       which has 3:1 against the page, like the Input's border. */
    --switch--track--border-color: color-mix(in srgb, currentColor 55%, transparent);
    --switch--track--background-color: transparent;
    --switch--thumb--background-color: var(--switch--track--border-color);

    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    vertical-align: middle;
    color: var(--color--neutral-text);
  }

  /* Sizes */
  .switch[data-size="xs"] {
    --switch--track--width: 1.75rem;
    --switch--track--height: 1rem;
  }
  .switch[data-size="sm"] {
    --switch--track--width: 2rem;
    --switch--track--height: 1.125rem;
  }
  .switch[data-size="lg"] {
    --switch--track--width: 2.75rem;
    --switch--track--height: 1.5rem;
  }
  .switch[data-size="xl"] {
    --switch--track--width: 3.25rem;
    --switch--track--height: 1.75rem;
  }

  /* The <input> lies on top of the track, invisible, so every press lands on the real
     control. It reaches past a small track to a hit area at least 24 × 24px. */
  .switch > [data-slot="control"] {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    width: max(100%, 1.5rem);
    height: max(100%, 1.5rem);
    margin: 0;
    translate: -50% -50%;
    opacity: 0;
    cursor: pointer;
  }
  .switch > [data-slot="control"]:disabled {
    cursor: not-allowed;
  }

  /* Parts */
  .switch > [data-slot="track"] {
    position: relative;
    box-sizing: border-box;
    width: var(--switch--track--width);
    height: var(--switch--track--height);
    border: 1px solid var(--switch--track--border-color);
    border-radius: 999px;
    background-color: var(--switch--track--background-color);
  }
  /* The thumb starts at the inline start and moves to the inline end, so it flips on its
     own in right-to-left languages, where on is on the left. */
  .switch > [data-slot="track"] > [data-slot="thumb"] {
    position: absolute;
    top: 50%;
    inset-inline-start: var(--switch--thumb--offset);
    width: var(--switch--thumb--size);
    height: var(--switch--thumb--size);
    border-radius: 999px;
    background-color: var(--switch--thumb--background-color);
    translate: 0 -50%;
    transition: inset-inline-start 150ms ease-out;
  }

  /* States. Each one reads the <input> before the track, so what people see and what
     assistive technologies report can't drift apart. They set the track's variables,
     which the thumb inherits, so a class on the root sets the switch at rest. */
  @media (hover: hover) {
    .switch:hover > :where([data-slot="control"]:not(:checked, :disabled)) + [data-slot="track"] {
      --switch--track--border-color: color-mix(in srgb, currentColor 80%, transparent);
      --switch--thumb--background-color: var(--switch--track--border-color);
    }
  }
  .switch > [data-slot="control"]:focus-visible + [data-slot="track"] {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  /* On, the track fills and the thumb moves to the end, so on and off differ by more
     than colour. */
  .switch > [data-slot="control"]:checked + [data-slot="track"] {
    --switch--track--border-color: var(--color--primary);
    --switch--track--background-color: var(--color--primary);
    --switch--thumb--background-color: var(--color--primary-contrast);
  }
  .switch > [data-slot="control"]:checked + [data-slot="track"] > [data-slot="thumb"] {
    inset-inline-start: calc(100% - var(--switch--thumb--size) - var(--switch--thumb--offset));
  }
  .switch > [data-slot="control"][aria-invalid="true"] + [data-slot="track"] {
    --switch--track--border-color: var(--color--error-text);
    /* A second pixel of border, drawn inside, so the switch doesn't grow. */
    box-shadow: inset 0 0 0 1px var(--switch--track--border-color);
  }
  .switch > [data-slot="control"]:disabled + [data-slot="track"] {
    opacity: 0.5;
  }

  /* On touch screens, the hit area grows to at least 44 × 44px, without the switch
     looking any bigger. */
  @media (any-pointer: coarse) {
    .switch > [data-slot="control"] {
      width: max(100%, 2.75rem);
      height: max(100%, 2.75rem);
    }
  }

  /* The thumb jumps rather than slides when people ask for less motion. */
  @media (prefers-reduced-motion: reduce) {
    .switch > [data-slot="track"] > [data-slot="thumb"] {
      transition: none;
    }
  }

  /* With more contrast, the track and thumb are drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .switch {
      --switch--track--border-color: currentColor;
    }
  }

  /* Forced colors mode would paint the track and thumb's backgrounds over with the page's,
     hiding the thumb and the on state, so they keep their colours and use system ones. */
  @media (forced-colors: active) {
    .switch > [data-slot="track"],
    .switch:hover > [data-slot="track"] {
      --switch--track--border-color: CanvasText;
      --switch--track--background-color: Canvas;
      --switch--thumb--background-color: CanvasText;
      forced-color-adjust: none;
    }
    /* The invalid border keeps its second pixel, which tells it apart without colour. */
    .switch > [data-slot="control"][aria-invalid="true"] + [data-slot="track"] {
      --switch--track--border-color: CanvasText;
    }
    .switch > [data-slot="control"]:checked + [data-slot="track"] {
      --switch--track--border-color: Highlight;
      --switch--track--background-color: Highlight;
      --switch--thumb--background-color: HighlightText;
    }
    .switch > [data-slot="control"]:focus-visible + [data-slot="track"] {
      outline-color: Highlight;
    }
    .switch > [data-slot="control"]:disabled + [data-slot="track"] {
      --switch--track--border-color: GrayText;
      --switch--track--background-color: Canvas;
      --switch--thumb--background-color: GrayText;
      opacity: 1;
    }
  }
}
</style>
