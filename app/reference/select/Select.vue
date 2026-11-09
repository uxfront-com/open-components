<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useAttrs, useId, useTemplateRef, watch } from "vue";
import { announce, prepareAnnouncer } from "../button/announce";

export interface SelectOption {
  value: string;
  /** The text people read, and what typing a letter searches. */
  label: string;
  disabled?: boolean;
}
/** A heading over some of the options. */
export interface SelectGroup {
  label: string;
  options: SelectOption[];
}
/** A rule between options or groups. */
export interface SelectSeparator {
  separator: true;
}
export type SelectItem = SelectOption | SelectGroup | SelectSeparator;

export interface SelectProps {
  /** What people pick from. A prop rather than child components, since both renderings need the same list. */
  options: SelectItem[];
  /** Picks any number of values, each shown as a chip, so the value is an array. */
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
   * their own picker. It can't draw the panel, the options or the chips, so turn it off
   * with `false` when those have to look like your brand everywhere.
   */
  nativeOnTouch?: boolean;
  /** A chip's remove button's name, which screen readers read and voice control users say. */
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
  /** How a picked value reads in its chip. The remove button stays beside it. */
  chip?: (props: { option: SelectOption }) => unknown;
  /** How a group's heading reads. */
  "group-label"?: (props: { label: string }) => unknown;
  /** The rule between options or groups. */
  separator?: () => unknown;
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
const panel = useTemplateRef<HTMLElement>("panel");

// Whether the primary pointer is coarse. It starts true on the server and on the client's
// first render, so the two match, which is why CSS, and never this, decides what paints.
// A fine pointer corrects it on mount, and only attributes move.
const coarse = ref(true);
let pointer: MediaQueryList | undefined;
const onPointerChange = () => (coarse.value = pointer?.matches ?? false);
const canBeNative = computed(() => nativeOnTouch && !readonly);
const native = computed(() => canBeNative.value && coarse.value);

// The list as sections, so both renderings walk the same thing: a group, a run of options
// outside any group, or a separator.
const isSeparator = (item: SelectItem): item is SelectSeparator => "separator" in item;
const isGroup = (item: SelectItem): item is SelectGroup => "options" in item;
type Section = { separator?: true; label?: string; options: SelectOption[] };
const sections = computed(() => {
  const result: Section[] = [];
  for (const item of options) {
    if (isSeparator(item)) result.push({ separator: true, options: [] });
    else if (isGroup(item)) result.push({ label: item.label, options: item.options });
    else if (result.at(-1) && !result.at(-1)!.separator && result.at(-1)!.label === undefined) result.at(-1)!.options.push(item);
    else result.push({ options: [item] });
  }
  return result;
});
const flat = computed(() => sections.value.flatMap((section) => section.options));
const positions = computed(() => new Map(flat.value.map((option, index) => [option, index])));

// IDs come from what you pass, rather than being made up, so the markup is the same on
// the server, on the client and in every snapshot.
const baseId = () => (attrs.id ?? attrs.name) as string | undefined;
const panelId = () => baseId() && `${baseId()}-panel`;
const optionId = (option: SelectOption) => baseId() && `${baseId()}-option-${positions.value.get(option)}`;

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

// What the combobox reads as its value, which the chips can't give it from outside the
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

// The next chip's remove button takes focus, or the control when there's no chip after
// it, so keyboard users never fall back to the top of the page.
function remove(option: SelectOption, moveFocus = true) {
  const index = selected.value.indexOf(option);
  commit(selected.value.filter((item) => item !== option).map((item) => item.value));
  announce(removedLabel(option.label));
  if (moveFocus) {
    nextTick(() => {
      const next = root.value?.querySelectorAll<HTMLElement>('[data-slot="chip-remove"]')[index];
      (next ?? control.value)?.focus();
    });
  }
}

const open = ref(false);
const active = ref(-1);
const panelName = ref<string>();

const isEnabled = (index: number) => flat.value[index] !== undefined && !flat.value[index]!.disabled;
// The nearest enabled option in a direction, or `from` at either end, since a listbox doesn't wrap.
function step(from: number, by: 1 | -1) {
  for (let index = from + by; index >= 0 && index < flat.value.length; index += by) if (isEnabled(index)) return index;
  return from;
}
const firstEnabled = () => step(-1, 1);
const lastEnabled = () => step(flat.value.length, -1);
function jump(by: 1 | -1) {
  let index = active.value;
  for (let count = 0; count < 10; count++) index = step(index, by);
  return index;
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
  if (!anchored()) {
    const method = open.value ? "addEventListener" : "removeEventListener";
    window[method]("scroll", place, { capture: true, passive: true } as AddEventListenerOptions);
    window[method]("resize", place);
  }
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

// CSS anchor positioning places the panel, where the browser has it. Elsewhere, place()
// does the same: as wide as the field, flipped when there's no room and kept on screen.
const anchored = () => globalThis.CSS?.supports?.("position-area: top") ?? false;
function place() {
  const el = panel.value;
  const anchor = root.value;
  if (anchored() || !el || !anchor) return;
  const a = anchor.getBoundingClientRect();
  // Its margin is the gap, on the block sides only, which `top` places it outside of.
  const gap = parseFloat(getComputedStyle(el).marginTop) || 0;
  const { clientWidth, clientHeight } = document.documentElement;
  const width = Math.min(a.width, clientWidth - 32);
  el.style.width = `${width}px`;
  el.style.maxHeight = "";
  const natural = el.offsetHeight;
  const below = clientHeight - a.bottom - 2 * gap;
  const above = a.top - 2 * gap;
  // Under the field, or above it when there's no room, and when neither side has room,
  // shrunk on the bigger one, with its options scrolling.
  const under = natural <= below || (natural > above && below >= above);
  const height = Math.min(natural, Math.max(under ? below : above, 0));
  if (height < natural) el.style.maxHeight = `${height}px`;
  const top = under ? a.bottom : a.top - 2 * gap - height;
  el.style.left = `${Math.max(0, Math.min(a.left, clientWidth - width))}px`;
  el.style.top = `${Math.max(-gap, Math.min(top, clientHeight - height - gap))}px`;
}

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
  window.removeEventListener("scroll", place, { capture: true });
  window.removeEventListener("resize", place);
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
      <span data-slot="value" :data-placeholder="selected.length ? undefined : ''" :data-chips="multiple && selected.length ? '' : undefined">
        <slot name="value" :selected="selected">{{ selected.length ? summary : placeholder }}</slot>
      </span>
    </button>
    <!-- Beside the button, since a <button> can't hold other buttons, and after it, so Tab
         reaches the remove buttons after the control. -->
    <div v-if="multiple && selected.length" data-slot="chips">
      <span v-for="option in selected" :key="option.value" data-slot="chip">
        <span data-slot="chip-label"><slot name="chip" :option="option">{{ option.label }}</slot></span>
        <button
          v-if="!disabled && !readonly"
          data-slot="chip-remove"
          type="button"
          :aria-label="removeLabel(option.label)"
          @click="remove(option)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </span>
    </div>
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
         it in the top layer and lets the browser close it on a press outside. The press
         doesn't move focus, which stays on the control for the keyboard model to run. -->
    <div
      :id="panelId()"
      ref="panel"
      data-slot="panel"
      popover="auto"
      role="listbox"
      :aria-multiselectable="multiple ? 'true' : undefined"
      :aria-labelledby="attrs['aria-labelledby'] as string | undefined"
      :aria-label="attrs['aria-labelledby'] ? undefined : panelName"
      :style="anchorName && { 'position-anchor': anchorName }"
      @beforetoggle="onBeforetoggle"
      @mousedown.prevent
    >
      <template v-for="(section, s) in sections" :key="s">
        <!-- role="none", since a listbox doesn't allow a separator child. -->
        <div v-if="section.separator" role="none" data-slot="separator">
          <slot name="separator" />
        </div>
        <div
          v-else
          :role="section.label === undefined ? 'none' : 'group'"
          :data-slot="section.label === undefined ? undefined : 'group'"
          :aria-labelledby="section.label === undefined ? undefined : baseId() && `${baseId()}-group-${s}`"
        >
          <div v-if="section.label !== undefined" :id="baseId() && `${baseId()}-group-${s}`" role="presentation" data-slot="group-label">
            <slot name="group-label" :label="section.label">{{ section.label }}</slot>
          </div>
          <div
            v-for="option in section.options"
            :id="optionId(option)"
            :key="option.value"
            data-slot="option"
            role="option"
            :aria-selected="isPicked(option) ? 'true' : 'false'"
            :aria-disabled="option.disabled ? 'true' : undefined"
            :data-active="flat[active] === option ? 'true' : undefined"
            @click="pickOption(option)"
          >
            <span data-slot="option-label">
              <slot name="option" :option="option" :selected="isPicked(option)" :active="flat[active] === option">{{ option.label }}</slot>
            </span>
            <svg data-slot="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The Select's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .select {
    /* Set per size. The Input's, so a select, an input and a button line up in a row. */
    --select--height: 2.25rem;
    --select--padding: 0.75rem;
    --select--gap: 0.5rem;
    --select--font-size: 0.875rem;
    --select--icon--size: 1rem;
    --select--radius: 0.5rem;
    /* The text colour at 55%, which has 3:1 against the page, like the Input's border. */
    --select--border-color: color-mix(in srgb, currentColor 55%, transparent);
    --select--background: transparent;
    /* The text colour at 70%, which has 4.5:1 against the page, like the Input's placeholder. */
    --select--value--placeholder-color: color-mix(in srgb, currentColor 70%, transparent);
    --select--leading--color: color-mix(in srgb, currentColor 70%, transparent);
    --select--arrow--color: color-mix(in srgb, currentColor 70%, transparent);
    --select--arrow--size: 1rem;

    /* The panel looks like the Popover's. */
    --select--panel--offset: 0.25rem;
    --select--panel--padding: 0.25rem;
    --select--panel--max-height: 16rem;
    --select--panel--radius: 0.5rem;
    --select--panel--border-color: color-mix(in srgb, currentColor 20%, transparent);
    --select--panel--background: Canvas;
    --select--panel--box-shadow: 0 0.25rem 1rem color-mix(in srgb, #000 15%, transparent);

    --select--option--padding-block: 0.375rem;
    --select--option--padding-inline: 0.5rem;
    --select--option--radius: 0.25rem;
    --select--option--color: inherit;
    --select--option--hover--background: color-mix(in srgb, currentColor 8%, transparent);
    --select--option--selected--background: transparent;
    --select--option--selected--font-weight: 600;
    --select--option--disabled--opacity: 0.5;

    --select--chip--height: 1.5rem;
    --select--chip--padding: 0.5rem;
    --select--chip--radius: 0.25rem;
    --select--chip--font-size: 0.75rem;
    --select--chip--background: color-mix(in srgb, currentColor 10%, transparent);
    --select--chip--color: inherit;

    --select--group-label--padding-block: 0.375rem;
    --select--group-label--padding-inline: 0.5rem;
    --select--group-label--font-size: 0.75rem;
    --select--group-label--font-weight: 500;
    --select--group-label--color: color-mix(in srgb, currentColor 70%, transparent);

    --select--separator--color: color-mix(in srgb, currentColor 20%, transparent);
    --select--separator--margin: 0.25rem;

    /* Room for the arrow, and for the leading icon where there's one. */
    --select--padding-start: var(--select--padding);
    --select--padding-end: calc(var(--select--padding) + var(--select--arrow--size) + var(--select--gap));

    position: relative;
    display: grid;
    /* The parts share one cell, so the control fills the field under the chips and the
       icons, and a press anywhere on the field reaches it, while chips grow the field. */
    grid-template-columns: minmax(0, 1fr);
    box-sizing: border-box;
    /* A min-height rather than a height, so the field grows with larger text. */
    min-height: var(--select--height);
    min-width: 0;
    border: 1px solid var(--select--border-color);
    border-radius: var(--select--radius);
    background-color: var(--select--background);
    color: var(--color--neutral-text);
    font-family: inherit;
    font-size: var(--select--font-size);
    line-height: 1.25;
  }
  .select:has(> [data-slot="leading"]) {
    --select--padding-start: calc(var(--select--padding) + var(--select--icon--size) + var(--select--gap));
  }

  /* Sizes */
  .select[data-size="xs"] {
    --select--height: 1.5rem;
    --select--padding: 0.5rem;
    --select--gap: 0.25rem;
    --select--font-size: 0.75rem;
    --select--icon--size: 0.875rem;
    --select--arrow--size: 0.875rem;
    --select--radius: 0.375rem;
    --select--chip--height: 1.125rem;
    --select--chip--padding: 0.25rem;
    --select--chip--font-size: 0.6875rem;
  }
  .select[data-size="sm"] {
    --select--height: 2rem;
    --select--padding: 0.625rem;
    --select--radius: 0.375rem;
    --select--chip--height: 1.25rem;
  }
  .select[data-size="lg"] {
    --select--height: 2.5rem;
    --select--padding: 0.875rem;
    --select--font-size: 1rem;
    --select--icon--size: 1.25rem;
    --select--arrow--size: 1.25rem;
    --select--chip--height: 1.75rem;
    --select--chip--font-size: 0.875rem;
  }
  .select[data-size="xl"] {
    --select--height: 3rem;
    --select--padding: 1rem;
    --select--font-size: 1rem;
    --select--icon--size: 1.25rem;
    --select--arrow--size: 1.25rem;
    --select--radius: 0.75rem;
    --select--chip--height: 2rem;
    --select--chip--font-size: 0.875rem;
  }

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

  /* The control. It shares the field's one cell, under the chips and the icons. */
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
  /* The value the combobox reads out, while the chips show it. */
  .select > button > [data-slot="value"][data-chips] {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .select > [data-slot="leading"],
  .select > [data-slot="arrow"] {
    grid-area: 1 / 1;
    align-self: center;
    display: inline-flex;
    /* Decoration above the control, which a press goes through. */
    pointer-events: none;
  }
  .select > [data-slot="leading"] {
    justify-self: start;
    margin-inline-start: var(--select--padding);
    color: var(--select--leading--color);
  }
  .select > [data-slot="arrow"] {
    justify-self: end;
    margin-inline-end: var(--select--padding);
    color: var(--select--arrow--color);
  }
  .select > [data-slot="leading"] :slotted(svg) {
    width: var(--select--icon--size);
    height: var(--select--icon--size);
  }
  .select > [data-slot="arrow"] svg {
    display: block;
    width: var(--select--arrow--size);
    height: var(--select--arrow--size);
  }
  .select[data-state="open"] > [data-slot="arrow"] {
    rotate: 180deg;
  }

  /* The chips sit in the control's cell. Only their remove buttons take a press of their
     own, so a press on a chip's label, or between chips, opens the panel. */
  .select > [data-slot="chips"] {
    grid-area: 1 / 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    align-self: center;
    gap: 0.25rem;
    min-width: 0;
    padding-block: 0.25rem;
    padding-inline: calc(var(--select--padding) / 2) var(--select--padding-end);
    pointer-events: none;
  }
  .select:has(> [data-slot="leading"]) > [data-slot="chips"] {
    padding-inline-start: var(--select--padding-start);
  }
  .select [data-slot="chip"] {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    max-width: 100%;
    min-height: var(--select--chip--height);
    padding-inline: var(--select--chip--padding) 0;
    border-radius: var(--select--chip--radius);
    background-color: var(--select--chip--background);
    color: var(--select--chip--color);
    font-size: var(--select--chip--font-size);
    pointer-events: auto;
  }
  .select [data-slot="chip"]:not(:has(> [data-slot="chip-remove"])) {
    padding-inline-end: var(--select--chip--padding);
  }
  .select [data-slot="chip-label"] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .select [data-slot="chip-remove"] {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--select--chip--height);
    height: var(--select--chip--height);
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: inherit;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  .select [data-slot="chip-remove"] svg {
    width: 0.75em;
    height: 0.75em;
  }
  /* At least 24 × 24px to press, whatever the chip's size. */
  .select [data-slot="chip-remove"]::before {
    content: "";
    position: absolute;
    inset: min(0px, (var(--select--chip--height) - 1.5rem) / 2);
  }
  .select [data-slot="chip-remove"]:focus-visible {
    outline: 2px solid var(--color--focus);
    outline-offset: -2px;
  }

  /* The panel. Beside the field, as wide as it, and flipped when there's no room, the way
     the Popover settles it. When neither side has room, it shrinks on the bigger one. */
  .select > [data-slot="panel"] {
    position: fixed;
    position-area: block-end span-inline-end;
    position-try-fallbacks: flip-block, --select-fit, flip-block --select-fit;
    inset: auto;
    box-sizing: border-box;
    width: anchor-size(width);
    max-width: calc(100vw - 2rem);
    max-height: min(var(--select--panel--max-height), 100dvh - 2rem);
    margin: var(--select--panel--offset) 0;
    padding: var(--select--panel--padding);
    overflow-y: auto;
    border: 1px solid var(--select--panel--border-color);
    border-radius: var(--select--panel--radius);
    background-color: var(--select--panel--background);
    box-shadow: var(--select--panel--box-shadow);
    color: var(--color--neutral-text);
    font-family: inherit;
    font-size: var(--select--font-size);
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .select [data-slot="group-label"] {
    padding-block: var(--select--group-label--padding-block);
    padding-inline: var(--select--group-label--padding-inline);
    color: var(--select--group-label--color);
    font-size: var(--select--group-label--font-size);
    font-weight: var(--select--group-label--font-weight);
  }
  .select [data-slot="separator"] {
    height: 1px;
    margin-block: var(--select--separator--margin);
    background-color: var(--select--separator--color);
  }

  /* Options. Each state reads the attribute that exposes it, so what people see and what
     assistive technologies report can't drift apart. */
  .select [data-slot="option"] {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--select--gap);
    padding-block: var(--select--option--padding-block);
    padding-inline: var(--select--option--padding-inline);
    border-radius: var(--select--option--radius);
    color: var(--select--option--color);
    cursor: pointer;
  }
  .select [data-slot="option"] > [data-slot="check"] {
    flex-shrink: 0;
    width: var(--select--icon--size);
    height: var(--select--icon--size);
    visibility: hidden;
  }
  @media (hover: hover) {
    .select [data-slot="option"]:hover:not([aria-disabled="true"]) {
      background-color: var(--select--option--hover--background);
    }
  }
  /* The highlight from the keyboard, as an outline, since focus stays on the control. */
  .select [data-slot="option"][data-active="true"] {
    outline: 2px solid var(--color--focus);
    outline-offset: -2px;
  }
  .select [data-slot="option"][aria-selected="true"] {
    background-color: var(--select--option--selected--background);
    font-weight: var(--select--option--selected--font-weight);
  }
  /* A check mark as well as the weight, so a picked option doesn't rest on one cue. */
  .select [data-slot="option"][aria-selected="true"] > [data-slot="check"] {
    visibility: visible;
  }
  .select [data-slot="option"][aria-disabled="true"] {
    opacity: var(--select--option--disabled--opacity);
    cursor: not-allowed;
  }

  /* States of the field, read from the active control. */
  @media (hover: hover) {
    .select:hover:where(:not(:has(> [data-slot="control"]:disabled, > [data-slot="control"][aria-readonly="true"]))) {
      --select--border-color: color-mix(in srgb, currentColor 80%, transparent);
    }
  }
  .select:has(> [data-slot="control"]:focus-visible) {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  .select:has(> [data-slot="control"][aria-readonly="true"]) {
    /* Dashed, like a read-only Input, while the value keeps its contrast. */
    border-style: dashed;
  }
  .select:has(> [data-slot="control"][aria-readonly="true"]) > button[role="combobox"] {
    cursor: default;
  }
  .select:has(> [data-slot="control"][aria-invalid="true"]) {
    --select--border-color: var(--color--error-text);
    /* A second pixel of border, drawn inside, so the field doesn't grow. */
    box-shadow: inset 0 0 0 1px var(--select--border-color);
  }
  .select:has(> [data-slot="control"]:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* On touch screens, the text is at least 16px, or Safari on iOS zooms in when the control
     gets focus, as with the Input, and the targets reach at least 44px tall. */
  @media (any-pointer: coarse) {
    .select {
      font-size: max(var(--select--font-size), 1rem);
    }
    /* Less 1px, since these reach out from inside the root's border. */
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
    .select [data-slot="option"] {
      min-height: 2.75rem;
    }
    .select [data-slot="chip-remove"]::before {
      inset-block: min(0px, (var(--select--chip--height) - 2.75rem) / 2);
    }
    /* Rows of chips sit far enough apart that those targets don't cover each other. */
    .select > [data-slot="chips"] {
      row-gap: max(0.25rem, 2.75rem - var(--select--chip--height));
    }
  }

  /* The native rendering, where the primary pointer is coarse, the same query the script
     uses, so the two can't disagree. The <select> paints and the control and chips don't. */
  @media (pointer: coarse) {
    .select[data-native] > select {
      opacity: 1;
      pointer-events: auto;
    }
    .select[data-native] > button[role="combobox"],
    .select[data-native] > [data-slot="chips"] {
      display: none;
    }
  }

  /* The arrow turns and the panel fades in, unless people have asked for less motion. */
  @media (prefers-reduced-motion: no-preference) {
    .select > [data-slot="arrow"] {
      transition: rotate 150ms ease-out;
    }
    .select > [data-slot="panel"]:popover-open {
      transition: opacity 150ms ease-out;
    }
    @starting-style {
      .select > [data-slot="panel"]:popover-open {
        opacity: 0;
      }
    }
  }

  /* With more contrast, the border is drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .select,
    .select:hover {
      --select--border-color: currentColor;
      --select--panel--border-color: currentColor;
    }
  }

  /* Forced colors mode drops backgrounds and shadows, so states take system colours. */
  @media (forced-colors: active) {
    .select:has(> [data-slot="control"]:focus-visible),
    .select [data-slot="option"][data-active="true"],
    .select [data-slot="chip-remove"]:focus-visible {
      outline-color: Highlight;
    }
    .select:has(> [data-slot="control"]:disabled) {
      border-color: GrayText;
      color: GrayText;
      opacity: 1;
    }
    .select > [data-slot="panel"] {
      border-color: CanvasText;
    }
    .select [data-slot="chip"] {
      border: 1px solid CanvasText;
    }
    .select [data-slot="option"][aria-disabled="true"] {
      color: GrayText;
      opacity: 1;
    }
  }
}
/* Its last resort, as tall as the side it opens on allows, less the gap on each side. The
   minimum turns down a side with less than about half the screen, so it shrinks on the
   bigger side, as the Popover does. */
@position-try --select-fit {
  max-height: calc(100% - 2 * var(--select--panel--offset));
  min-height: calc(50dvh - 3rem);
}
</style>
