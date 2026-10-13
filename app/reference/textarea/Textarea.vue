<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useAttrs, useTemplateRef, watch, type TextareaHTMLAttributes } from "vue";
import { announce, prepareAnnouncer } from "../button/announce";

export interface TextareaProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** How many lines it shows. It's never shorter, even when people resize it. */
  rows?: number;
  /** Grows with its text, up to `maxRows`, rather than scrolling. People can't resize it then. */
  autoGrow?: boolean;
  /** How many lines it grows to with `autoGrow`, before it scrolls. Without it, it keeps growing. */
  maxRows?: number;
  /** The most characters it takes. It shows a count, and lets people go over, so nothing they paste gets cut off. */
  limit?: number;
  /** The count's text, for a number of characters left, which is negative over the limit. */
  countLabel?: (remaining: number) => string;
  disabled?: boolean;
}

// Attributes go on the <textarea> rather than on the root, so they're declared below.
defineOptions({ inheritAttrs: false });

const {
  size = "md",
  rows = 3,
  autoGrow = false,
  maxRows,
  limit,
  countLabel = (remaining: number) => {
    const count = Math.abs(remaining);
    const characters = count === 1 ? "character" : "characters";
    return remaining < 0 ? `${count} ${characters} too many` : `${count} ${characters} left`;
  },
  disabled = false,
} = defineProps<TextareaProps>();

/** The value, which `v-model` binds. Without it, the textarea keeps its own, and its form submits it. */
const model = defineModel<string>();

const attrs = useAttrs();
// Classes and styles go on the root, so a class can set its variables. Everything
// else goes on the <textarea>: `id`, `name`, `placeholder`, ARIA and listeners.
// Attrs aren't reactive, so these run on every render.
const onRoot = (key: string) => key === "class" || key === "style";
const rootAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => onRoot(key)));
const controlAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => !onRoot(key)));

const root = useTemplateRef<HTMLElement>("root");
const textarea = useTemplateRef<HTMLTextAreaElement>("textarea");

// What people have typed, so the count works without `v-model` too.
const typed = ref(typeof attrs.value === "string" ? attrs.value : "");
const value = computed(() => model.value ?? typed.value);

// Code points rather than UTF-16 code units, which is how most databases count a
// length limit, like PostgreSQL's varchar(n). An emoji made of several, like a
// family, counts as several.
const remaining = computed(() => (limit === undefined ? 0 : limit - [...value.value].length));
const over = computed(() => remaining.value < 0);
const countText = computed(() => countLabel(remaining.value));
// The count is named after the textarea, so it needs its `id` to describe it.
const countId = computed(() => (limit !== undefined && attrs.id ? `${attrs.id}-count` : undefined));
// Over the limit, it's invalid, whatever the page says.
const invalid = () => (over.value ? "true" : (attrs["aria-invalid"] as TextareaHTMLAttributes["aria-invalid"]));
const describedBy = () => [attrs["aria-describedby"], countId.value].filter(Boolean).join(" ") || undefined;

// `rows` and `maxRows` as variables, in lines, which the styles turn into a minimum
// and a maximum height. CSS can't read a number from an attribute in every browser
// yet, so they're set through the CSSOM, which a strict Content Security Policy
// allows, unlike a style attribute. They run after every render, since a change to
// your own `style` replaces the root's.
function setRows() {
  const el = root.value;
  if (!el) return;
  el.style.setProperty("--textarea--rows", String(rows));
  if (autoGrow && maxRows !== undefined) el.style.setProperty("--textarea--max-rows", String(maxRows));
  else el.style.removeProperty("--textarea--max-rows");
}
onMounted(setRows);
onUpdated(setRows);

// Browsers with `field-sizing: content` grow the textarea themselves. In the
// others, it's set to the height of its text, which max-height caps.
function grow() {
  const el = textarea.value;
  if (!autoGrow || !el || (typeof CSS !== "undefined" && CSS.supports?.("field-sizing", "content"))) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
}
watch(value, () => nextTick(grow));

// Screen readers hear the count once people pause near the limit, rather than on
// every keystroke, which would talk over what they're typing.
const NEAR_LIMIT = 0.8;
const PAUSE = 1000;
let timer: ReturnType<typeof setTimeout> | undefined;
let announced = "";
function announceCount() {
  if (limit === undefined) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    const near = limit - remaining.value >= limit * NEAR_LIMIT;
    if (!near || countText.value === announced) return;
    announced = countText.value;
    announce(countText.value);
  }, PAUSE);
}

// The template shows the model, or the `value` attribute while there's none, so a
// textarea without `v-model`, like a read-only one, can still start with a value.
function onInput(event: Event) {
  const text = (event.target as HTMLTextAreaElement).value;
  typed.value = text;
  model.value = text;
  announceCount();
}

// A form reset puts back the textarea's first value without an input event, so
// the count reads it again once the reset is done, which is after the event.
let form: HTMLFormElement | null = null;
function onReset() {
  queueMicrotask(() => {
    const text = textarea.value?.value ?? "";
    typed.value = text;
    if (model.value !== undefined) model.value = text;
  });
}

// A ref to the Textarea gets you the <textarea>, through `textarea`.
defineExpose({ textarea });

onMounted(() => {
  // The live region has to be in the page before anything is announced.
  if (limit !== undefined) prepareAnnouncer();
  grow();
  form = textarea.value?.form ?? null;
  form?.addEventListener("reset", onReset);

  if (import.meta.env.DEV) {
    const el = textarea.value;
    const named = el?.labels?.length || el?.hasAttribute("aria-label") || el?.hasAttribute("aria-labelledby");
    if (el && !named) {
      console.warn("[Textarea] has no accessible name: give it a <label for>.", el);
    }
    if (el && limit !== undefined && !el.id) {
      console.warn("[Textarea] has a limit but no id: give it one, so its count can describe it.", el);
    }
  }
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  form?.removeEventListener("reset", onReset);
});
</script>

<template>
  <div
    ref="root"
    class="textarea"
    v-bind="rootAttrs()"
    :data-size="size"
    :data-auto-grow="autoGrow ? '' : undefined"
    :data-max-rows="autoGrow ? maxRows : undefined"
    :data-limit="limit"
  >
    <textarea
      ref="textarea"
      data-slot="control"
      :rows="rows"
      :disabled="disabled"
      v-bind="controlAttrs()"
      :value="model ?? ($attrs.value as string | undefined)"
      :aria-invalid="invalid()"
      :aria-describedby="describedBy()"
      @input="onInput"
    />
    <span v-if="limit !== undefined" data-slot="count" :id="countId" :data-over-limit="over ? '' : undefined">
      {{ countText }}
    </span>
  </div>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The textarea's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .textarea {
    /* Set per size. The Input's values, so a textarea of one row is as tall as an
       input, and the two line up in a form. */
    --textarea--height: 2.25rem;
    --textarea--padding: 0.75rem;
    --textarea--font-size: 0.875rem;
    --textarea--radius: 0.5rem;
    /* The text colour at 55%, which has 3:1 against the page, so people can see where to type. */
    --textarea--border-color: color-mix(in srgb, currentColor 55%, transparent);
    /* The text colour at 70%, which has 4.5:1 against the page, like the placeholder. */
    --textarea--count--color: color-mix(in srgb, currentColor 70%, transparent);
    /* What's left of one row's height once its line of text is in, above and below it.
       `lh` is the textarea's line height, so it follows larger text and wider lines. */
    --textarea--padding-block: max(0.125rem, (var(--textarea--height) - 1lh) / 2 - 1px);
    /* `rows` lines, with their padding and border. Resizing and growing stop there.
       Until the script sets the rows, it has no value, and the `rows` attribute sets the height. */
    --textarea--min-height: calc(var(--textarea--rows) * 1lh + 2 * var(--textarea--padding-block) + 2px);
    /* Only set with `maxRows`. Without it, max-height has no value, which is none. */
    --textarea--max-height: calc(var(--textarea--max-rows) * 1lh + 2 * var(--textarea--padding-block) + 2px);

    display: flex;
    flex-direction: column;
    /* In a flex row, it can get narrower than a <textarea> is on its own, rather than overflow. */
    min-width: 0;
    color: var(--color--neutral-text);
    font-family: inherit;
    font-size: var(--textarea--font-size);
  }

  /* Sizes */
  .textarea[data-size="xs"] {
    --textarea--height: 1.5rem;
    --textarea--padding: 0.5rem;
    --textarea--font-size: 0.75rem;
    --textarea--radius: 0.375rem;
  }
  .textarea[data-size="sm"] {
    --textarea--height: 2rem;
    --textarea--padding: 0.625rem;
    --textarea--radius: 0.375rem;
  }
  .textarea[data-size="lg"] {
    --textarea--height: 2.5rem;
    --textarea--padding: 0.875rem;
    --textarea--font-size: 1rem;
  }
  .textarea[data-size="xl"] {
    --textarea--height: 3rem;
    --textarea--padding: 1rem;
    --textarea--font-size: 1rem;
    --textarea--radius: 0.75rem;
  }

  /* Parts. The control draws the field itself, since its resize handle and its
     scrollbar belong to it. */
  .textarea > [data-slot="control"] {
    display: block;
    box-sizing: border-box;
    width: 100%;
    /* min-height rather than height, so it's never shorter than its rows, and grows with larger text. */
    min-height: var(--textarea--min-height);
    max-height: var(--textarea--max-height);
    margin: 0;
    padding: var(--textarea--padding-block) var(--textarea--padding);
    border: 1px solid var(--textarea--border-color);
    border-radius: var(--textarea--radius);
    background-color: transparent;
    color: inherit;
    font: inherit;
    /* Taller than the Input's, since people read their text back over several lines. */
    line-height: 1.5;
    letter-spacing: inherit;
    /* Only taller or shorter, so it never outgrows its column. `block` follows the
       writing mode, and `vertical` is for browsers that don't know it. */
    resize: vertical;
    resize: block;
  }
  .textarea > [data-slot="control"]::placeholder {
    /* The text colour at 70%, which has 4.5:1 against the page. Firefox lowers its opacity on its own. */
    color: color-mix(in srgb, currentColor 70%, transparent);
    opacity: 1;
  }
  /* It grows with its text, so there's nothing for people to resize. Browsers without
     field-sizing get their height from the script instead. */
  .textarea[data-auto-grow] > [data-slot="control"] {
    resize: none;
    field-sizing: content;
  }
  .textarea > [data-slot="count"] {
    margin-block-start: 0.375rem;
    color: var(--textarea--count--color);
    line-height: 1.25;
    text-align: end;
    /* So the count doesn't jiggle as its digits change. */
    font-variant-numeric: tabular-nums;
  }
  .textarea > [data-slot="count"][data-over-limit] {
    color: var(--color--error-text);
  }

  /* States. Each one reads the attribute on the <textarea> that exposes it, so what
     people see and what assistive technologies report can't drift apart. :invalid
     isn't one of them: it matches a required textarea before anyone has typed in it.
     The variables are set on the root, as every other one is, so a class of yours
     still sets them in every state. Hover is in :where(), so invalid always wins. */
  @media (hover: hover) {
    .textarea:where(:has(> [data-slot="control"]:hover:not(:disabled, [readonly]))) {
      --textarea--border-color: color-mix(in srgb, currentColor 80%, transparent);
    }
  }
  .textarea > [data-slot="control"]:focus-visible {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  .textarea > [data-slot="control"][readonly] {
    /* Dashed, so it reads as something you can't change, while the text keeps its contrast. */
    border-style: dashed;
  }
  .textarea:has(> [data-slot="control"][aria-invalid="true"]) {
    --textarea--border-color: var(--color--error-text);
  }
  .textarea > [data-slot="control"][aria-invalid="true"] {
    /* A second pixel of border, drawn inside, so the field doesn't grow. */
    box-shadow: inset 0 0 0 1px var(--textarea--border-color);
  }
  .textarea:has(> [data-slot="control"]:disabled) {
    opacity: 0.5;
  }
  .textarea > [data-slot="control"]:disabled {
    cursor: not-allowed;
  }

  /* On touch screens, the text is at least 16px, or Safari on iOS zooms in when the
     textarea gets focus, and the field is at least 44px tall, whatever its rows. */
  @media (any-pointer: coarse) {
    .textarea {
      font-size: max(var(--textarea--font-size), 1rem);
    }
    .textarea > [data-slot="control"] {
      min-height: max(var(--textarea--min-height), 2.75rem);
    }
  }

  /* With more contrast, the border is drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .textarea {
      --textarea--border-color: currentColor;
    }
  }

  /* Forced colors mode keeps borders but drops shadows, so mark states with system colours. */
  @media (forced-colors: active) {
    .textarea > [data-slot="control"]:focus-visible {
      outline-color: Highlight;
    }
    .textarea:has(> [data-slot="control"]:disabled) {
      color: GrayText;
      opacity: 1;
    }
    .textarea > [data-slot="control"]:disabled {
      border-color: GrayText;
    }
  }
}
</style>
