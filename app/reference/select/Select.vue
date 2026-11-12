<script lang="ts">
// The list's types live with the model the Select shares with the Combobox.
export type { SelectGroup, SelectItem, SelectOption, SelectSeparator } from "./listbox";
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useAttrs, useId, useTemplateRef, watch } from "vue";
import { announce, prepareAnnouncer } from "../button/announce";
import { type SelectItem, type SelectOption, usePlacement, useListbox } from "./listbox";
import SelectPanel from "./SelectPanel.vue";
import SelectTags from "./SelectTags.vue";
import "./select.css";

export interface SelectProps {
  /** What people pick from. A prop rather than child components, since both renderings need the same list. */
  options: SelectItem[];
  /** Picks any number of values, each shown as a tag, so the value is an array. */
  multiple?: boolean;
  /** Text shown while nothing is picked. It's never a value, so nothing submits. */
  placeholder?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  /** Shows the value, keeps it in its form and doesn't let people change it. It turns `nativeOnTouch` off, since a native select has no read-only state. */
  readonly?: boolean;
  required?: boolean;
  /**
   * Shows a native <select> where the primary pointer is coarse, so phones and tablets get
   * their own picker. It can't draw the panel, the options or the tags, so turn it off
   * with `false` when those have to look like your brand everywhere.
   */
  nativeOnTouch?: boolean;
  /** A tag's remove button's name, which screen readers read and voice control users say. */
  removeLabel?: (label: string) => string;
  /** What screen readers hear once a value is removed. */
  removedLabel?: (label: string) => string;
  /** What screen readers read as the value when too many are picked to list. */
  countLabel?: (count: number) => string;
}

// Attributes go on the control rather than on the root, so they're declared below.
defineOptions({ inheritAttrs: false });

const {
  options,
  multiple = false,
  placeholder,
  size = "md",
  disabled = false,
  readonly = false,
  required = false,
  nativeOnTouch = true,
  removeLabel = (label: string) => `Remove ${label}`,
  removedLabel = (label: string) => `${label} removed`,
  countLabel = (count: number) => `${count} selected`,
} = defineProps<SelectProps>();

/**
 * The value, which `v-model` binds: a string, or an array of them with `multiple`. Without
 * it, the Select keeps its own, starting from the `value` attribute, and its form submits it.
 */
const model = defineModel<string | string[]>();

defineSlots<{
  /** An icon before the value. It stays in both renderings. */
  leading?: () => unknown;
  /** How the picked value reads in the field. The native rendering draws its own text instead. */
  value?: (props: { selected: SelectOption[] }) => unknown;
  /** The chevron, which turns as the panel opens. It stays in both renderings. */
  arrow?: () => unknown;
  /** How an option reads in the panel. The check mark stays beside it. */
  option?: (props: { option: SelectOption; selected: boolean; active: boolean }) => unknown;
  /** How a picked value reads in its tag. The remove button stays beside it. */
  tag?: (props: { option: SelectOption }) => unknown;
  /** How a group's heading reads. */
  "group-label"?: (props: { label: string }) => unknown;
  /** The rule between options or groups. */
  separator?: () => unknown;
  /**
   * An icon for an option, like a label's colour or a country's flag, shown before its label in
   * the panel, in the field once it's picked and in its tag. It's hidden from assistive
   * technologies, since the label names the option. The native rendering draws text only.
   */
  icon?: (props: { option: SelectOption }) => unknown;
}>();

const attrs = useAttrs();
// Classes and styles go on the root, which draws the field, so a class can set its
// variables. What a form reads goes on the <select>, and so do `change` and `input`, since
// it fires both in each rendering. Everything else goes on whichever control is active:
// `id`, ARIA and the other listeners. Attrs aren't reactive, so these run on every render.
const FORM_ATTRS = ["name", "form", "autocomplete", "onChange", "onInput"];
const pick = (test: (key: string) => boolean) => Object.fromEntries(Object.entries(attrs).filter(([key]) => test(key)));
const onRoot = (key: string) => key === "class" || key === "style";
const rootAttrs = () => pick(onRoot);
const formAttrs = () => pick((key) => FORM_ATTRS.includes(key));
const activeAttrs = () => pick((key) => !onRoot(key) && !FORM_ATTRS.includes(key) && key !== "value");

const root = useTemplateRef<HTMLElement>("root");
const select = useTemplateRef<HTMLSelectElement>("select");
const control = useTemplateRef<HTMLButtonElement>("control");
const panelRef = useTemplateRef<InstanceType<typeof SelectPanel>>("panel");
const panel = computed(() => panelRef.value?.element);
const tags = useTemplateRef<InstanceType<typeof SelectTags>>("tags");

// Whether the primary pointer is coarse. It starts true on the server and on the client's
// first render, so the two match, which is why CSS, and never this, decides what paints.
// A fine pointer corrects it on mount, and only attributes move.
const coarse = ref(true);
let pointer: MediaQueryList | undefined;
const onPointerChange = () => (coarse.value = pointer?.matches ?? false);
const canBeNative = computed(() => nativeOnTouch && !readonly);
const native = computed(() => canBeNative.value && coarse.value);

const open = ref(false);
const active = ref(-1);
const panelName = ref<string>();

// The list as sections, so both renderings walk the same thing: a group, a run of options
// outside any group, or a separator. IDs come from the control's `id` or `name`.
const baseId = () => (attrs.id ?? attrs.name) as string | undefined;
const { sections, flat, panelId, optionId, groupId, isEnabled, step, firstEnabled, lastEnabled, jump } = useListbox({
  items: () => options,
  baseId,
  active,
});

// Without `v-model`, the value starts from the `value` attribute.
const initial = attrs.value as string | string[] | undefined;
const current = computed(() => model.value ?? initial);
const values = computed<string[]>(() => {
  const value = current.value;
  if (multiple) return value === undefined ? [] : [value].flat();
  const one = Array.isArray(value) ? value[0] : value;
  return one !== undefined && flat.value.some((option) => option.value === one) ? [one] : [];
});
// In the list's order, which is the order a native <select> reports and submits, so the
// value reads the same in both renderings.
const selected = computed(() => flat.value.filter((option) => values.value.includes(option.value)));
const isPicked = (option: SelectOption) => values.value.includes(option.value);

// What the combobox reads as its value, which the tags can't give it from outside the
// button. Past three, a count, since nobody wants a long list read out on every focus.
const SUMMARY_LIMIT = 3;
const summary = computed(() =>
  selected.value.length > SUMMARY_LIMIT ? countLabel(selected.value.length) : selected.value.map((option) => option.label).join(", "),
);

// A form's reset goes back to each option's default selectedness, which is the `selected`
// attribute. A client render doesn't set it from the first value, and Vue writes it after
// every change of the value, so it's put back after each render. Adding the attribute also
// selects an option whose selectedness hasn't been set yet, which browsers leave unset when
// the property already has that value, so what's picked is put back after it.
const first = [...values.value];
function setDefaults() {
  const el = select.value;
  if (!el) return;
  const list = Array.from(el.options);
  const picked = list.map((option) => option.selected);
  list.forEach((option, index) => {
    const placeholding = !multiple && index === 0;
    option.defaultSelected = placeholding ? !first.length : first.includes(option.value);
  });
  list.forEach((option, index) => (option.selected = picked[index]!));
}
onUpdated(setDefaults);

// The <select> reports what's picked, leaving out the option that stands for nothing.
function readSelect() {
  const picked = Array.from(select.value?.options ?? [])
    .filter((option) => option.selected && !option.hidden)
    .map((option) => option.value);
  return multiple ? picked : picked[0];
}

// The native picker's choice, or autofill's, and the events a selection in the panel fires
// itself, which have nothing new to report. It's bound before your own listeners, so they
// read the new value in both renderings.
function onNativeChange() {
  const next = readSelect();
  if ([next].flat().join() !== values.value.join()) model.value = next;
}

// A selection in the panel changes the <select> too, once it has rendered, then fires the
// events it would fire itself, so form-level listeners and form libraries hear it.
function commit(next: string | string[]) {
  model.value = next;
  nextTick(() => {
    select.value?.dispatchEvent(new Event("input", { bubbles: true }));
    select.value?.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function pickOption(option: SelectOption) {
  if (option.disabled) return;
  if (multiple) {
    const next = isPicked(option) ? values.value.filter((value) => value !== option.value) : [...values.value, option.value];
    commit(flat.value.filter((item) => next.includes(item.value)).map((item) => item.value));
    return;
  }
  hide();
  if (values.value[0] !== option.value) commit(option.value);
}

// The next tag's remove button takes focus, or the control when there's no tag after
// it, so keyboard users never fall back to the top of the page.
async function remove(option: SelectOption, moveFocus = true) {
  const index = selected.value.indexOf(option);
  commit(selected.value.filter((item) => item !== option).map((item) => item.value));
  announce(removedLabel(option.label));
  if (moveFocus && !(await tags.value?.focusAt(index))) control.value?.focus();
}

function show(to?: number) {
  if (open.value || disabled || readonly || native.value) return;
  const picked = flat.value.findIndex(isPicked);
  active.value = to ?? (picked >= 0 ? picked : firstEnabled());
  // The panel carries the control's name, which is the Field's <label>, or an aria-label.
  panelName.value = (attrs["aria-label"] as string | undefined) ?? control.value?.labels?.[0]?.textContent ?? undefined;
  panel.value?.showPopover?.();
  nextTick(() => {
    place();
    scrollToActive();
  });
}

function hide() {
  if (open.value) panel.value?.hidePopover?.();
}

function scrollToActive() {
  if (open.value) panel.value?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
}
watch(active, scrollToActive, { flush: "post" });

// It follows `beforetoggle`, which the browser fires as it shows or hides the panel, a task
// before `toggle`, so a key pressed right after opening finds it open.
function onBeforetoggle(event: Event) {
  open.value = (event as ToggleEvent).newState === "open";
  listen(open.value);
}

// A key that typed a printable character, without a modifier that makes it a shortcut.
const printable = (event: KeyboardEvent) => event.key.length === 1 && !event.ctrlKey && !event.metaKey;

// Typing moves to the option that starts with what people typed in the last half second,
// and pressing one letter again moves on to the next option that starts with it.
const TYPEAHEAD_PAUSE = 500;
let typed = "";
let typedTimer: ReturnType<typeof setTimeout> | undefined;
function typeahead(key: string) {
  clearTimeout(typedTimer);
  typedTimer = setTimeout(() => (typed = ""), TYPEAHEAD_PAUSE);
  const letter = key.toLowerCase();
  const repeating = typed.length > 0 && [...typed].every((character) => character === letter);
  typed += letter;
  const search = repeating ? letter : typed;
  const count = flat.value.length;
  const start = active.value + (search.length === 1 ? 1 : 0);
  for (let offset = 0; offset < count; offset++) {
    const index = (start + offset) % count;
    if (isEnabled(index) && flat.value[index]!.label.toLowerCase().startsWith(search)) {
      active.value = index;
      return;
    }
  }
}

// APG's keyboard model for a select-only combobox. DOM focus stays on the control the
// whole time, and aria-activedescendant says which option is highlighted.
function onKeydown(event: KeyboardEvent) {
  if (readonly) return;
  const { key } = event;
  const space = key === " ";

  if (!open.value) {
    if (key === "Backspace" && multiple && selected.value.length) {
      event.preventDefault();
      remove(selected.value.at(-1)!, false);
    } else if (key === "ArrowDown" || key === "Enter" || space) {
      event.preventDefault();
      show();
    } else if (key === "ArrowUp" || key === "Home") {
      event.preventDefault();
      show(firstEnabled());
    } else if (key === "End") {
      event.preventDefault();
      show(lastEnabled());
    } else if (printable(event)) {
      event.preventDefault();
      show();
      // With nothing picked, the first option is only a default, and a letter can land on it.
      if (!selected.value.length) active.value = -1;
      typeahead(key);
      if (active.value < 0) active.value = firstEnabled();
    }
    return;
  }

  const option = flat.value[active.value];
  // Space is part of what people are typing, as in "New Zealand", while they're typing.
  if (space && typed) {
    event.preventDefault();
    typeahead(key);
  } else if (key === "ArrowDown") {
    event.preventDefault();
    active.value = step(active.value, 1);
  } else if (key === "ArrowUp" && event.altKey) {
    event.preventDefault();
    // Several values close and keep what people toggled, as Tab does.
    if (option && !multiple) pickOption(option);
    hide();
  } else if (key === "ArrowUp") {
    event.preventDefault();
    active.value = step(active.value, -1);
  } else if (key === "Home") {
    event.preventDefault();
    active.value = firstEnabled();
  } else if (key === "End") {
    event.preventDefault();
    active.value = lastEnabled();
  } else if (key === "PageDown" || key === "PageUp") {
    event.preventDefault();
    active.value = jump(key === "PageDown" ? 1 : -1);
  } else if (key === "Enter" || space) {
    event.preventDefault();
    if (option) pickOption(option);
  } else if (key === "Tab") {
    // Not cancelled, so focus goes on. A single value takes the highlighted option, as
    // APG says, while several values keep what people toggled.
    if (option && !multiple) pickOption(option);
    hide();
  } else if (key === "Escape") {
    // It goes no further, so a Dialog or a Popover around the Select stays open.
    event.preventDefault();
    event.stopPropagation();
    hide();
  } else if (printable(event)) {
    event.preventDefault();
    typeahead(key);
  }
}

// A press on a <label for> clicks the button, which would open the panel. A native select
// only takes focus, so this notes it, on the way down, before the button hears the click.
// `detail` can't tell the two apart, since a screen reader's activation has 0 as well.
let fromLabel = false;
function onDocumentClick(event: MouseEvent) {
  if (event.target === control.value) return;
  const label = (event.target as Element).closest?.("label");
  fromLabel = !!label && label.control === control.value;
}

// A press on the control closes an open panel by light dismiss before its click arrives,
// so the click would open it again.
let pressedWhileOpen = false;
function onPointerdown() {
  pressedWhileOpen = open.value;
}

function onClick() {
  // Safari doesn't focus a clicked button, and the keyboard model runs on focus.
  control.value?.focus();
  if (fromLabel || pressedWhileOpen) {
    fromLabel = false;
    pressedWhileOpen = false;
    return;
  }
  if (open.value) hide();
  else show();
}

// If the browser focuses the hidden <select> to report a problem, focus moves to the
// control right away, in this handler: Chromium hides its validation bubble on any later
// change of focus, so a deferred move would block the submit with no message.
function onSelectFocus() {
  if (!native.value) control.value?.focus();
}

// A form's reset puts back each option's default selectedness without a change event, so
// the model reads the <select> again once the reset is done.
let form: HTMLFormElement | null = null;
function onReset() {
  setTimeout(() => (model.value = readSelect()));
}

// The anchor's name is set once it mounts, from a generated ID, since an id you pass can
// hold characters a CSS name can't, like "1:2".
const uid = useId();
const anchorName = ref<string>();

// CSS anchor positioning places the panel, where the browser has it, and place() does the
// same elsewhere, from the model the Select shares with the Combobox.
const { place, listen } = usePlacement({ panel: () => panel.value, anchor: () => root.value });

// Moving to the native rendering, like when a tablet's keyboard is detached, closes the panel.
watch(native, (value) => value && hide());

// A ref to the Select gets you both controls, through `control` and `select`.
defineExpose({ control, select });

onMounted(() => {
  anchorName.value = `--select-${uid}`;
  pointer = window.matchMedia?.("(pointer: coarse)");
  onPointerChange();
  pointer?.addEventListener("change", onPointerChange);
  setDefaults();
  prepareAnnouncer();
  document.addEventListener("click", onDocumentClick, true);
  form = select.value?.form ?? null;
  form?.addEventListener("reset", onReset);

  if (import.meta.env.DEV) {
    // Once the attributes have moved to the active control.
    nextTick(() => {
      const el = native.value ? select.value : control.value;
      const named = el?.labels?.length || el?.hasAttribute("aria-label") || el?.hasAttribute("aria-labelledby");
      if (el && !named) console.warn("[Select] has no accessible name: give it a <label for>, or put it in a Field.", el);
      if (el && !baseId()) console.warn("[Select] has no id or name: give it one, so the control can point at its options.", el);
    });
  }
});

onBeforeUnmount(() => {
  clearTimeout(typedTimer);
  pointer?.removeEventListener("change", onPointerChange);
  document.removeEventListener("click", onDocumentClick, true);
  form?.removeEventListener("reset", onReset);
  listen(false);
});
</script>

<template>
  <div
    ref="root"
    class="select"
    v-bind="rootAttrs()"
    :style="anchorName && { 'anchor-name': anchorName }"
    :data-size="size"
    :data-state="open ? 'open' : 'closed'"
    :data-native="canBeNative ? '' : undefined"
  >
    <!-- Always in the page, and it does the form's work in both renderings: submitting,
         required and reset. In the custom rendering it's see-through, never display: none,
         which would make a required select unfocusable and block the submit in silence. -->
    <select
      ref="select"
      @input="onNativeChange"
      @change="onNativeChange"
      v-bind="{ ...formAttrs(), ...(native ? activeAttrs() : {}) }"
      :data-slot="native ? 'control' : 'native'"
      :multiple="multiple"
      :required="required"
      :disabled="disabled"
      :tabindex="native ? undefined : -1"
      :aria-hidden="native ? undefined : 'true'"
      @focus="onSelectFocus"
    >
      <!-- Stands for no value. Disabled, so a native picker can't choose it, and selected
           while nothing is picked, the one form that submits nothing and is valueMissing. -->
      <option v-if="!multiple" value="" disabled hidden :selected="!values.length">{{ placeholder }}</option>
      <template v-for="(section, s) in sections" :key="s">
        <hr v-if="section.separator" />
        <optgroup v-else-if="section.label !== undefined" :label="section.label">
          <option
            v-for="option in section.options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            :selected="isPicked(option)"
          >
            {{ option.label }}
          </option>
        </optgroup>
        <template v-else>
          <option
            v-for="option in section.options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            :selected="isPicked(option)"
          >
            {{ option.label }}
          </option>
        </template>
      </template>
    </select>
    <!-- A <button> rather than a <div>, since the Field's <label for> can only name a
         labelable element. Its text is the combobox's value, and its label its name. -->
    <button
      ref="control"
      v-bind="native ? {} : activeAttrs()"
      :data-slot="native ? undefined : 'control'"
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="panelId()"
      :aria-activedescendant="open && flat[active] ? optionId(flat[active]!) : undefined"
      :aria-required="required ? 'true' : undefined"
      :aria-readonly="readonly ? 'true' : undefined"
      :disabled="disabled"
      @click="onClick"
      @pointerdown="onPointerdown"
      @keydown="onKeydown"
      @keyup.space.prevent
      @blur="hide"
    >
      <!-- The picked option's icon, beside the value, so it looks the same here as in the panel. -->
      <span v-if="$slots.icon && !multiple && selected[0]" data-slot="icon" aria-hidden="true">
        <slot name="icon" :option="selected[0]" />
      </span>
      <span data-slot="value" :data-placeholder="selected.length ? undefined : ''" :data-tags="multiple && selected.length ? '' : undefined">
        <slot name="value" :selected="selected">{{ selected.length ? summary : placeholder }}</slot>
      </span>
    </button>
    <!-- Beside the button, since a <button> can't hold other buttons, and after it, so Tab
         reaches the remove buttons after the control. -->
    <SelectTags v-if="multiple" ref="tags" :selected="selected" :removable="!disabled && !readonly" :remove-label="removeLabel" @remove="remove">
      <template v-if="$slots.icon" #icon="props"><slot name="icon" v-bind="props" /></template>
      <template #tag="props"><slot name="tag" v-bind="props">{{ props.option.label }}</slot></template>
    </SelectTags>
    <span v-if="$slots.leading" data-slot="leading" aria-hidden="true">
      <slot name="leading" />
    </span>
    <span data-slot="arrow" aria-hidden="true">
      <slot name="arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </slot>
    </span>
    <!-- A child of the root, so a class on the root reaches its tokens. popover="auto" puts
         it in the top layer and lets the browser close it on a press outside. -->
    <SelectPanel
      :id="panelId()"
      ref="panel"
      :sections="sections"
      :active="flat[active]"
      :is-picked="isPicked"
      :option-id="optionId"
      :group-id="groupId"
      :multiple="multiple"
      :label="panelName"
      :labelledby="attrs['aria-labelledby'] as string | undefined"
      :anchor-name="anchorName"
      @beforetoggle="onBeforetoggle"
      @pick="pickOption"
    >
      <template v-if="$slots.icon" #icon="props"><slot name="icon" v-bind="props" /></template>
      <template #option="props"><slot name="option" v-bind="props">{{ props.option.label }}</slot></template>
      <template #group-label="props"><slot name="group-label" v-bind="props">{{ props.label }}</slot></template>
      <template #separator><slot name="separator" /></template>
    </SelectPanel>
  </div>
</template>

<style scoped>
/* The field, the panel, the options and the tags are drawn by select.css, which the Select
   shares with the Combobox. These are the Select's own parts: the button and the <select>.
   The same layer order as Tailwind CSS, so a class of yours still wins. */
@layer theme, base, components, utilities;

@layer components {
  /* The <select>, which fills the field, see-through and out of reach in the custom
     rendering. CSS alone decides what paints, before any script runs, so nothing moves. */
  .select > select {
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    margin: 0;
    padding-block: 0;
    padding-inline: var(--select--padding-start) var(--select--padding-end);
    border: 0;
    border-radius: inherit;
    appearance: none;
    background: transparent;
    color: inherit;
    font: inherit;
    /* The root draws the focus ring, around the whole field. */
    outline: none;
    opacity: 0;
    pointer-events: none;
  }
  .select > select:has(> option[hidden]:checked) {
    color: var(--select--value--placeholder-color);
  }

  /* The control. It shares the field's one cell, under the tags and the icons. */
  .select > button[role="combobox"] {
    grid-area: 1 / 1;
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    margin: 0;
    padding-block: 0;
    padding-inline: var(--select--padding-start) var(--select--padding-end);
    border: 0;
    border-radius: inherit;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
    outline: none;
    cursor: pointer;
  }
  .select > button[role="combobox"]:disabled {
    cursor: inherit;
  }
  .select > button > [data-slot="value"] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .select > button > [data-slot="value"][data-placeholder] {
    color: var(--select--value--placeholder-color);
  }
  /* The value the combobox reads out, while the tags show it. */
  .select > button > [data-slot="value"][data-tags] {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .select > button > [data-slot="icon"] {
    margin-inline-end: var(--select--gap);
  }
  .select:has(> [data-slot="control"][aria-readonly="true"]) > button[role="combobox"] {
    cursor: default;
  }
  /* The default chevron. An icon in the arrow slot keeps its own size. */
  .select > [data-slot="arrow"] svg {
    display: block;
    width: var(--select--arrow--size);
    height: var(--select--arrow--size);
  }

  /* On touch screens, the targets reach at least 44px tall. Less 1px, since these reach
     out from inside the root's border. */
  @media (any-pointer: coarse) {
    .select > select {
      inset-block: min(0px, (var(--select--height) - 2.75rem) / 2 - 1px);
      height: auto;
    }
    .select > button[role="combobox"]::after {
      content: "";
      position: absolute;
      inset-block: min(0px, (var(--select--height) - 2.75rem) / 2 - 1px);
      inset-inline: 0;
    }
  }

  /* The native rendering, where the primary pointer is coarse, the same query the script
     uses, so the two can't disagree. The <select> paints and the control and tags don't. */
  @media (pointer: coarse) {
    .select[data-native] > select {
      opacity: 1;
      pointer-events: auto;
    }
    .select[data-native] > button[role="combobox"],
    .select[data-native] > :deep([data-slot="tags"]) {
      display: none;
    }
  }
}
</style>
