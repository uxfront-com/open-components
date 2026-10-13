<script setup lang="ts">
import { onMounted, useAttrs, useTemplateRef } from "vue";

export interface SwitchProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  /** Shows a setting people can see and focus, but not change. A checkbox has no `readonly` of its own, so the Switch blocks the flip and sets `aria-readonly`. */
  readonly?: boolean;
}

// Attributes go on the <input> rather than on the root, so they're declared below.
defineOptions({ inheritAttrs: false });

const { size = "md", disabled = false, readonly = false } = defineProps<SwitchProps>();

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

// Space and a click on the label both click the <input>, so cancelling the click keeps a
// read-only switch as it is, without a change event. It still takes focus, and its form
// still sends it, unlike a disabled one.
function onClick(event: MouseEvent) {
  if (readonly) event.preventDefault();
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
      :aria-readonly="readonly ? 'true' : undefined"
      :checked="checked"
      @click="onClick"
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
    /* The gap between the thumb and the track's border. */
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

  /* States. Each one reads the <input>, so what people see and what assistive technologies
     report can't drift apart. Like every variable, they're set on the root, where a class
     of yours can set them too. The thumb's colour follows the track's border unless a state
     sets its own. */
  @media (hover: hover) {
    .switch:hover:where(:has(> [data-slot="control"]:not(:checked, :disabled, [aria-readonly="true"]))) {
      --switch--track--border-color: color-mix(in srgb, currentColor 80%, transparent);
    }
  }
  .switch > [data-slot="control"]:focus-visible + [data-slot="track"] {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  /* On, the track fills and the thumb moves to the end, so on and off differ by more
     than colour. */
  .switch:has(> [data-slot="control"]:checked) {
    --switch--track--border-color: var(--color--primary);
    --switch--track--background-color: var(--color--primary);
    --switch--thumb--background-color: var(--color--primary-contrast);
  }
  .switch > [data-slot="control"]:checked + [data-slot="track"] > [data-slot="thumb"] {
    inset-inline-start: calc(100% - var(--switch--thumb--size) - var(--switch--thumb--offset));
  }
  .switch:has(> [data-slot="control"][aria-invalid="true"]) {
    --switch--track--border-color: var(--color--error-text);
  }
  .switch > [data-slot="control"][aria-invalid="true"] + [data-slot="track"] {
    /* A second pixel of border, drawn inside, so the switch doesn't grow. */
    box-shadow: inset 0 0 0 1px var(--switch--track--border-color);
  }
  .switch > [data-slot="control"]:disabled + [data-slot="track"] {
    opacity: 0.5;
  }
  /* Read-only, the track's border is dashed, like the Input's, so it reads as something you
     can't change. On, the dashes take the text colour, which stands out against the page
     around the fill, unless the switch is invalid, where the error colour wins. */
  .switch > [data-slot="control"][aria-readonly="true"] {
    cursor: default;
  }
  .switch > [data-slot="control"][aria-readonly="true"] + [data-slot="track"] {
    border-style: dashed;
  }
  .switch:has(> [data-slot="control"][aria-readonly="true"]:checked:not([aria-invalid="true"])) {
    --switch--track--border-color: currentColor;
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

  /* With more contrast, the track and thumb are drawn in the text colour at full strength,
     hovered or not. */
  @media (prefers-contrast: more) {
    .switch,
    .switch:hover {
      --switch--track--border-color: currentColor;
    }
  }

  /* Forced colors mode would paint the track and thumb's backgrounds over with the page's,
     hiding the thumb and the on state, so they keep their colours and use system ones. */
  @media (forced-colors: active) {
    .switch,
    .switch:hover {
      --switch--track--border-color: CanvasText;
      --switch--track--background-color: Canvas;
      --switch--thumb--background-color: CanvasText;
    }
    .switch > [data-slot="track"] {
      forced-color-adjust: none;
    }
    /* The invalid border keeps its second pixel, which tells it apart without colour. */
    .switch:has(> [data-slot="control"][aria-invalid="true"]) {
      --switch--track--border-color: CanvasText;
    }
    .switch:has(> [data-slot="control"]:checked) {
      --switch--track--border-color: Highlight;
      --switch--track--background-color: Highlight;
      --switch--thumb--background-color: HighlightText;
    }
    .switch:has(> [data-slot="control"][aria-readonly="true"]:checked:not([aria-invalid="true"])) {
      --switch--track--border-color: CanvasText;
    }
    .switch > [data-slot="control"]:focus-visible + [data-slot="track"] {
      outline-color: Highlight;
    }
    .switch:has(> [data-slot="control"]:disabled) {
      --switch--track--border-color: GrayText;
      --switch--track--background-color: Canvas;
      --switch--thumb--background-color: GrayText;
    }
    .switch > [data-slot="control"]:disabled + [data-slot="track"] {
      opacity: 1;
    }
  }
}
</style>
