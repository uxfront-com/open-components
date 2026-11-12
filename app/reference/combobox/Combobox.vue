<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useAttrs, useId, useTemplateRef, watch } from "vue";
import { announce, prepareAnnouncer } from "../button/announce";
import { isGroup, isSeparator, type SelectItem, type SelectOption, toSections, usePlacement, useListbox } from "../select/listbox";
import SelectPanel from "../select/SelectPanel.vue";
import SelectTags from "../select/SelectTags.vue";
import "../select/select.css";

export interface ComboboxProps {
  /** What people pick from, the same list a Select takes: options, groups and separators. */
  options: SelectItem[];
  /** Picks any number of values, each shown as a tag, so the value is an array. */
  multiple?: boolean;
  /** Text shown in the empty field. It's never a value, so nothing submits. */
  placeholder?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  /** Shows the value, keeps it in its form and doesn't let people change it. */
  readonly?: boolean;
  required?: boolean;
  /**
   * Keeps text that matches no option as the value, and submits it as typed. Off, that text
   * goes back to the picked option's label when people leave the field. It's for one value:
   * with `multiple`, it does nothing, since typing any value as a tag is a Tags Input's job.
   */
  allowCustomValue?: boolean;
  /** Ends the list with an option that adds what people typed, which fires `create` with it. */
  creatable?: boolean;
  /** The create option's label. */
  createLabel?: (text: string) => string;
  /** Whether an option matches what people typed. By default, any part of its label, ignoring case and accents. */
  filter?: (option: SelectOption, text: string) => boolean;
  /** Shown in the panel, and announced, when no option matches. */
  emptyLabel?: string;
  /** What screen readers hear once people stop typing. */
  resultsLabel?: (count: number) => string;
  /** The toggle button's name, which voice control users say and screen readers read. */
  toggleLabel?: string;
  /** A tag's remove button's name. */
  removeLabel?: (label: string) => string;
  /** What screen readers hear once a value is removed. */
  removedLabel?: (label: string) => string;
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
  allowCustomValue = false,
  creatable = false,
  createLabel = (text: string) => `Create "${text}"`,
  filter,
  emptyLabel = "No results",
  resultsLabel = (count: number) => (count === 1 ? "1 result" : `${count} results`),
  toggleLabel = "Suggestions",
  removeLabel = (label: string) => `Remove ${label}`,
  removedLabel = (label: string) => `${label} removed`,
} = defineProps<ComboboxProps>();

/**
 * The value, which `v-model` binds: a string, or an array of them with `multiple`. It's an
 * option's `value`, or text people typed where `allowCustomValue` or `creatable` lets them.
 */
const model = defineModel<string | string[]>();

const emit = defineEmits<{
  /** People picked the create option. Add the text to `options` to keep it in the list. */
  create: [text: string];
}>();

defineSlots<{
  /** An icon before the text. */
  leading?: () => unknown;
  /** The chevron in the toggle button, which turns as the panel opens. */
  arrow?: () => unknown;
  /** How an option reads in the panel. The check mark stays beside it. */
  option?: (props: { option: SelectOption; selected: boolean; active: boolean }) => unknown;
  /** How a picked value reads in its tag. The remove button stays beside it. */
  tag?: (props: { option: SelectOption }) => unknown;
  /** How a group's heading reads. */
  "group-label"?: (props: { label: string }) => unknown;
  /** The rule between options or groups. */
  separator?: () => unknown;
  /** An icon for an option, shown before its label in the panel and in its tag, hidden from assistive technologies. */
  icon?: (props: { option: SelectOption }) => unknown;
}>();

const attrs = useAttrs();
// Classes and styles go on the root, which draws the field, so a class can set its
// variables. What a form reads goes on the <select>, and so do `change` and `input`, since
// it fires them when the value changes, rather than on every key. Everything else goes on
// the text field: `id`, `autocomplete`, ARIA and the other listeners.
const FORM_ATTRS = ["name", "form", "onChange", "onInput"];
const pick = (test: (key: string) => boolean) => Object.fromEntries(Object.entries(attrs).filter(([key]) => test(key)));
const onRoot = (key: string) => key === "class" || key === "style";
const rootAttrs = () => pick(onRoot);
const formAttrs = () => pick((key) => FORM_ATTRS.includes(key));
const controlAttrs = () => pick((key) => !onRoot(key) && !FORM_ATTRS.includes(key) && key !== "value");

const root = useTemplateRef<HTMLElement>("root");
const select = useTemplateRef<HTMLSelectElement>("select");
const control = useTemplateRef<HTMLInputElement>("control");
const panelRef = useTemplateRef<InstanceType<typeof SelectPanel>>("panel");
const panel = computed(() => panelRef.value?.element);
const tags = useTemplateRef<InstanceType<typeof SelectTags>>("tags");

// Case and accents don't count, so "zur" finds "Zürich", as people expect from a search.
const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();
const matches = (option: SelectOption, text: string) => (filter ? filter(option, text) : fold(option.label).includes(fold(text)));

const everything = computed(() => toSections(options).flatMap((section) => section.options));
const byValue = computed(() => new Map(everything.value.map((option) => [option.value, option])));
const byLabel = (text: string) => everything.value.find((option) => !option.disabled && fold(option.label) === fold(text));

// Values that aren't options, which people typed and kept, are only values where a prop
// lets people type them.
const keepsText = computed(() => creatable || (allowCustomValue && !multiple));
const initial = attrs.value as string | string[] | undefined;
const current = computed(() => model.value ?? initial);
const values = computed<string[]>(() => {
  const value = current.value;
  const list = (multiple ? (value === undefined ? [] : [value].flat()) : [Array.isArray(value) ? value[0] : value]).filter(
    (item): item is string => item !== undefined && item !== "",
  );
  return list.filter((item) => byValue.value.has(item) || keepsText.value);
});
// In the list's order, which is the order the <select> submits, then the typed values in the
// order people added them, each read as its own text.
const selected = computed<SelectOption[]>(() => [
  ...everything.value.filter((option) => values.value.includes(option.value)),
  ...values.value.filter((value) => !byValue.value.has(value)).map((value) => ({ value, label: value })),
]);
const isPicked = (option: SelectOption) => values.value.includes(option.value);
// What the text field shows while people aren't typing: the picked option's label, or the
// text they kept. With several values, the tags show them and the text is for searching.
const display = computed(() => (multiple ? "" : (selected.value[0]?.label ?? "")));

const text = ref(display.value);
watch(display, (value) => (text.value = value));
// What people typed, once it differs from what the field shows. Opening the panel on a
// picked value shows every option, rather than only the one that matches its label.
const query = computed(() => (text.value !== display.value ? text.value.trim() : ""));

// What the panel shows: the options that match, in their groups, with a separator only
// between two things it separates.
const shown = computed<SelectItem[]>(() => {
  const q = query.value;
  if (!q) return options;
  const result: SelectItem[] = [];
  for (const item of options) {
    if (isSeparator(item)) {
      if (result.length && !isSeparator(result.at(-1)!)) result.push(item);
    } else if (isGroup(item)) {
      const found = item.options.filter((option) => matches(option, q));
      if (found.length) result.push({ label: item.label, options: found });
    } else if (matches(item, q)) result.push(item);
  }
  if (result.length && isSeparator(result.at(-1)!)) result.pop();
  return result;
});

const open = ref(false);
const active = ref(-1);
const panelName = ref<string>();

const baseId = () => (attrs.id ?? attrs.name) as string | undefined;
// Options keep their IDs as the list narrows, so a screen reader hears each new highlight.
const { sections, flat, panelId, optionId, groupId, step, firstEnabled, lastEnabled, jump } = useListbox({
  items: () => shown.value,
  all: () => options,
  baseId,
  active,
});

// The create option, after the matches, while the text isn't an option's label, an option's
// value, which would submit as that option, or a value already picked.
const creating = computed(() => {
  const q = query.value;
  return creatable && q && !byLabel(q) && !byValue.value.has(q) && !values.value.includes(q) ? q : "";
});
const createIndex = () => flat.value.length;
const onCreate = () => !!creating.value && active.value === createIndex();
const create = computed(
  () =>
    creating.value && {
      value: creating.value,
      label: createLabel(creating.value),
      id: baseId() && `${baseId()}-option-create`,
      active: onCreate(),
    },
);
const activeId = computed(() => {
  if (!open.value) return undefined;
  if (onCreate()) return create.value ? create.value.id : undefined;
  const option = flat.value[active.value];
  return option ? optionId(option) : undefined;
});

// The highlight steps over disabled options and ends on the create option, without wrapping.
// -1 is no highlight, and the create option's index is one past the last match.
const firstIndex = () => (firstEnabled() >= 0 ? firstEnabled() : creating.value ? createIndex() : -1);
const lastIndex = () => (creating.value ? createIndex() : lastEnabled() < flat.value.length ? lastEnabled() : -1);
function move(by: 1 | -1) {
  if (active.value < 0) active.value = by === 1 ? firstIndex() : lastIndex();
  else if (by === 1 && !onCreate()) {
    const next = step(active.value, 1);
    active.value = next === active.value && creating.value ? createIndex() : next;
  } else if (by === -1) {
    const from = onCreate() ? flat.value.length : active.value;
    const next = step(from, -1);
    if (next !== from) active.value = next;
  }
}

// A form's reset goes back to each option's default selectedness, which is the `selected`
// attribute. A client render doesn't set it from the first value, and Vue writes it after
// every change of the value, so it's put back after each render, as in the Select.
const first = [...values.value];
// The <select> holds every option, so reset can go back to any of them, and an option for
// each typed value, so it submits too.
const extra = computed(() => [...new Set([...first, ...values.value])].filter((value) => !byValue.value.has(value)));
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

function readSelect() {
  const picked = Array.from(select.value?.options ?? [])
    .filter((option) => option.selected && !option.hidden)
    .map((option) => option.value);
  return multiple ? picked : picked[0];
}

// A change of the value changes the <select> once it has rendered, then fires the events
// it would fire itself, so form-level listeners and form libraries hear it.
function commit(next: string | string[]) {
  model.value = next;
  nextTick(() => {
    select.value?.dispatchEvent(new Event("input", { bubbles: true }));
    select.value?.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
// Whether the value changed, from what was decided here, since a bound value only changes
// once your framework renders it again.
function setValue(next: string[]) {
  if (next.join() === values.value.join()) return false;
  commit(multiple ? next : (next[0] ?? ""));
  return true;
}

function pickOption(option: SelectOption) {
  if (option.disabled) return;
  if (multiple) {
    setValue(isPicked(option) ? values.value.filter((value) => value !== option.value) : [...values.value, option.value]);
    // The text clears for the next search, and the highlight stays on the option people toggled.
    text.value = "";
    active.value = flat.value.indexOf(option);
    return;
  }
  hide();
  setValue([option.value]);
  text.value = option.label;
}

function pickCreate() {
  const value = creating.value;
  if (!value) return;
  emit("create", value);
  if (multiple) {
    setValue([...values.value, value]);
    text.value = "";
    active.value = -1;
    return;
  }
  hide();
  setValue([value]);
  text.value = value;
}

// What happens to the text when people leave the field, press Tab, or Enter with nothing
// highlighted. Text that's an option's label picks it, kept text becomes the value where a
// prop allows it, and anything else goes back to what the field showed. It returns whether
// the value changed.
function commitText() {
  const typed = text.value.trim();
  if (multiple) {
    const option = typed ? byLabel(typed) : undefined;
    text.value = "";
    return !!option && !isPicked(option) && setValue([...values.value, option.value]);
  }
  // Text people didn't change keeps the value it shows, even when another option has the
  // same label, or the picked one is disabled.
  if (fold(typed) === fold(display.value)) {
    text.value = display.value;
    return false;
  }
  const option = typed ? byLabel(typed) : undefined;
  let next = values.value;
  let shown = display.value;
  if (!typed) [next, shown] = [[], ""];
  else if (option) [next, shown] = [[option.value], option.label];
  // Text that's an option's value, but not its label, would submit as that option, so it
  // isn't kept, and goes back like any other text.
  else if (allowCustomValue && !byValue.value.has(typed)) [next, shown] = [[typed], typed];
  text.value = shown;
  return setValue(next);
}

async function remove(option: SelectOption, moveFocus = true) {
  const index = selected.value.indexOf(option);
  setValue(values.value.filter((value) => value !== option.value));
  announce(removedLabel(option.label));
  if (moveFocus && !(await tags.value?.focusAt(index))) control.value?.focus();
}

function show(to = -1) {
  if (open.value || disabled || readonly) return;
  active.value = to;
  panelName.value = (attrs["aria-label"] as string | undefined) ?? control.value?.labels?.[0]?.textContent ?? undefined;
  panel.value?.showPopover?.();
  nextTick(() => {
    place();
    scrollToActive();
  });
}
function hide() {
  clearTimeout(countTimer);
  if (open.value) panel.value?.hidePopover?.();
}

function scrollToActive() {
  if (open.value) panel.value?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
}
watch(active, scrollToActive, { flush: "post" });

function onBeforetoggle(event: Event) {
  open.value = (event as ToggleEvent).newState === "open";
  listen(open.value);
}

// The count is read once typing pauses, rather than on every key, which would talk over
// what people type. GOV.UK's accessible-autocomplete waits 1400ms.
const COUNT_PAUSE = 1400;
let countTimer: ReturnType<typeof setTimeout> | undefined;
function announceCount() {
  clearTimeout(countTimer);
  countTimer = setTimeout(() => {
    if (!open.value) return;
    const count = flat.value.length;
    announce(count ? resultsLabel(count) : creating.value ? createLabel(creating.value) : emptyLabel);
  }, COUNT_PAUSE);
}

function onInput(event: Event) {
  text.value = (event.target as HTMLInputElement).value;
  // Autofill types too, without focus, and leaves the panel closed.
  if (document.activeElement !== control.value) return;
  // Nothing is highlighted while people type, so Enter keeps what they typed. That's the
  // APG's list autocomplete with manual selection.
  active.value = -1;
  show();
  announceCount();
}

// Autofill's change, which comes without focus, settles at once.
function onChange() {
  if (document.activeElement !== control.value) commitText();
}

// The fields that keep Enter from submitting a form without a submit button, once there's more than one.
const BLOCKING = ["text", "search", "url", "tel", "email", "password", "date", "month", "week", "time", "datetime-local", "number"];

// What `Enter` does once the value has to change first. Submitting waits for the <select>
// to render the new value, then goes through the form's default button, as it would have.
async function submitAfter() {
  const form = select.value?.form;
  await nextTick();
  if (!form) return;
  const submitter = Array.from(form.elements).find((el): el is HTMLButtonElement => (el as HTMLButtonElement).type === "submit");
  if (submitter?.disabled) return;
  // Without a submit button, Enter only submits a form with one text field, as the HTML
  // Standard's implicit submission says.
  const fields = Array.from(form.elements).filter((el) => el instanceof HTMLInputElement && BLOCKING.includes(el.type));
  if (!submitter && fields.length > 1) return;
  form.requestSubmit(submitter);
}

// APG's keyboard model for an editable combobox with list autocomplete. DOM focus stays in
// the text field, and aria-activedescendant says which option is highlighted. Letters,
// Space, Home, End and the side arrows edit the text, as in any text field.
function onKeydown(event: KeyboardEvent) {
  // Safari ends a composition with an Enter whose keyCode is 229 and isComposing false.
  if (readonly || event.isComposing || event.keyCode === 229) return;
  const { key } = event;

  if (key === "ArrowDown") {
    event.preventDefault();
    if (!open.value) show(event.altKey ? -1 : firstIndex());
    else move(1);
  } else if (key === "ArrowUp") {
    event.preventDefault();
    if (!open.value) {
      if (!event.altKey) show(lastIndex());
    } else if (event.altKey) hide();
    else move(-1);
  } else if ((key === "PageDown" || key === "PageUp") && open.value && !onCreate()) {
    event.preventDefault();
    active.value = jump(key === "PageDown" ? 1 : -1);
  } else if (key === "Enter") {
    if (open.value) {
      // People were choosing, so Enter picks rather than submitting.
      event.preventDefault();
      const option = flat.value[active.value];
      if (onCreate()) pickCreate();
      else if (option) pickOption(option);
      else {
        commitText();
        hide();
      }
    } else {
      if (commitText()) {
        event.preventDefault();
        submitAfter();
      }
    }
  } else if (key === "Tab") {
    // Not cancelled, so focus goes on. A single value takes the highlighted option, as the
    // APG says, and with several, what people toggled stays.
    const option = flat.value[active.value];
    if (open.value && !multiple && onCreate()) pickCreate();
    else if (open.value && !multiple && option) pickOption(option);
    else commitText();
    hide();
  } else if (key === "Escape") {
    // The first press closes the panel and keeps the text, the second clears it, and both
    // go no further, so a Dialog around the Combobox stays open. With nothing to clear, it does.
    if (open.value) hide();
    else if (text.value) {
      text.value = "";
      if (!multiple) setValue([]);
    } else return;
    event.preventDefault();
    event.stopPropagation();
  } else if (key === "Backspace" && multiple && !text.value && selected.value.length) {
    event.preventDefault();
    remove(selected.value.at(-1)!, false);
  }
}

function onBlur() {
  commitText();
  hide();
}

// The panel is a manual popover, since a press in the text, outside the panel, mustn't
// close it. A press outside the field does, as light dismiss would.
function onDocumentPointerdown(event: PointerEvent) {
  if (open.value && !root.value?.contains(event.target as Node)) hide();
}

// The toggle doesn't take focus, which stays in the text, as in the APG's example.
function onToggle() {
  if (disabled || readonly) return;
  control.value?.focus();
  if (open.value) hide();
  else show();
}

// A press on the field around the text, like between the tags or on the icon, puts the
// caret in it, as the Input does. It's on mousedown, so the text keeps focus, with no blur.
function onRootMousedown(event: MouseEvent) {
  const target = event.target as Element;
  if (target.closest("input, button, select")) return;
  event.preventDefault();
  control.value?.focus();
}

// If the browser focuses the hidden <select> to report a problem, focus moves to the text
// right away, in this handler, so its message still shows.
function onSelectFocus() {
  control.value?.focus();
}

let form: HTMLFormElement | null = null;
function onReset() {
  setTimeout(() => {
    model.value = readSelect();
    text.value = display.value;
  });
}

const uid = useId();
const anchorName = ref<string>();
// The on-screen keyboard covers part of the page while people type, so the panel fits
// what's left of it, above or below the field.
const { place, listen } = usePlacement({ panel: () => panel.value, anchor: () => root.value, fitKeyboard: true });

defineExpose({ control, select });

onMounted(() => {
  anchorName.value = `--combobox-${uid}`;
  setDefaults();
  prepareAnnouncer();
  document.addEventListener("pointerdown", onDocumentPointerdown, true);
  form = select.value?.form ?? null;
  form?.addEventListener("reset", onReset);

  if (import.meta.env.DEV) {
    const el = control.value;
    const named = el?.labels?.length || el?.hasAttribute("aria-label") || el?.hasAttribute("aria-labelledby");
    if (el && !named) console.warn("[Combobox] has no accessible name: give it a <label for>, or put it in a Field.", el);
    if (el && !baseId()) console.warn("[Combobox] has no id or name: give it one, so the text field can point at its options.", el);
    if (multiple && allowCustomValue) console.warn("[Combobox] ignores allowCustomValue with multiple: use creatable to add new values.", el);
  }
});

onBeforeUnmount(() => {
  clearTimeout(countTimer);
  document.removeEventListener("pointerdown", onDocumentPointerdown, true);
  form?.removeEventListener("reset", onReset);
  listen(false);
});
</script>

<template>
  <div
    ref="root"
    class="combobox"
    v-bind="rootAttrs()"
    :style="anchorName && { 'anchor-name': anchorName }"
    :data-size="size"
    :data-state="open ? 'open' : 'closed'"
    @mousedown="onRootMousedown"
  >
    <!-- Always in the page, and it does the form's work: submitting, required and reset, for
         picked and typed values alike. See-through, never display: none, which would make a
         required one unfocusable and block the submit in silence. -->
    <select
      ref="select"
      v-bind="formAttrs()"
      data-slot="native"
      :multiple="multiple"
      :required="required"
      :disabled="disabled"
      tabindex="-1"
      aria-hidden="true"
      @focus="onSelectFocus"
    >
      <option v-if="!multiple" value="" disabled hidden :selected="!values.length" />
      <option v-for="option in everything" :key="option.value" :value="option.value" :disabled="option.disabled" :selected="isPicked(option)">
        {{ option.label }}
      </option>
      <option v-for="value in extra" :key="`extra-${value}`" :value="value" :selected="values.includes(value)">{{ value }}</option>
    </select>
    <!-- The text field people type in, with the combobox role, so the Field's <label for>
         names it and the on-screen keyboard comes up for it. It has no name of its own,
         since what people typed isn't the value until it's picked or kept. -->
    <input
      ref="control"
      autocomplete="off"
      v-bind="controlAttrs()"
      data-slot="control"
      type="text"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="panelId()"
      :aria-activedescendant="activeId"
      :aria-required="required ? 'true' : undefined"
      :aria-readonly="readonly ? 'true' : undefined"
      :value="text"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      spellcheck="false"
      autocapitalize="off"
      @input="onInput"
      @change="onChange"
      @keydown="onKeydown"
      @blur="onBlur"
    />
    <!-- After the text, so Tab reaches the remove buttons in the order people read them. -->
    <SelectTags v-if="multiple" ref="tags" :selected="selected" :removable="!disabled && !readonly" :remove-label="removeLabel" @remove="remove">
      <template v-if="$slots.icon" #icon="props"><slot name="icon" v-bind="props" /></template>
      <template #tag="props"><slot name="tag" v-bind="props">{{ props.option.label }}</slot></template>
    </SelectTags>
    <span v-if="$slots.leading" data-slot="leading" aria-hidden="true">
      <slot name="leading" />
    </span>
    <!-- Out of the tab order, since the arrow keys open the panel from the text, and it
         keeps focus there. It's a button for a pointer, voice control and a screen reader. -->
    <button
      data-slot="arrow"
      type="button"
      tabindex="-1"
      :aria-label="toggleLabel"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="panelId()"
      :disabled="disabled || readonly"
      @mousedown.prevent
      @click="onToggle"
    >
      <slot name="arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </slot>
    </button>
    <SelectPanel
      :id="panelId()"
      ref="panel"
      popover="manual"
      :sections="sections"
      :active="open && !onCreate() ? flat[active] : undefined"
      :is-picked="isPicked"
      :option-id="optionId"
      :group-id="groupId"
      :multiple="multiple"
      :label="panelName"
      :labelledby="attrs['aria-labelledby'] as string | undefined"
      :anchor-name="anchorName"
      :create="create || undefined"
      :empty="emptyLabel"
      @beforetoggle="onBeforetoggle"
      @pick="pickOption"
      @create="pickCreate"
    >
      <template v-if="$slots.icon" #icon="props"><slot name="icon" v-bind="props" /></template>
      <template #option="props"><slot name="option" v-bind="props">{{ props.option.label }}</slot></template>
      <template #group-label="props"><slot name="group-label" v-bind="props">{{ props.label }}</slot></template>
      <template #separator><slot name="separator" /></template>
    </SelectPanel>
  </div>
</template>

<style scoped>
/* The field, the panel, the options and the tags are drawn by the Select's select.css, with
   the Select's variables, so one class restyles both. These are the Combobox's own parts:
   the text field and the toggle. The same layer order as Tailwind CSS, so a class wins. */
@layer theme, base, components, utilities;

@layer components {
  .combobox {
    /* The "No results" text, at the placeholder's 4.5:1. */
    --combobox--empty--padding-block: 0.375rem;
    --combobox--empty--padding-inline: 0.5rem;
    --combobox--empty--color: color-mix(in srgb, currentColor 70%, transparent);

    cursor: text;
  }

  /* The <select>, which fills the field, see-through and out of reach. */
  .combobox > select {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    appearance: none;
    opacity: 0;
    pointer-events: none;
  }

  /* The text field, in the first row, under the icons, with room for the arrow. */
  .combobox > input {
    grid-area: 1 / 1;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    min-height: calc(var(--select--height) - 2px);
    margin: 0;
    padding-block: 0;
    padding-inline: var(--select--padding-start) var(--select--padding-end);
    border: 0;
    /* So the browser's autofill colour follows the field's rounded corners. */
    border-radius: calc(var(--select--radius) - 1px);
    background: transparent;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    /* The root draws the focus ring, around the whole field. */
    outline: none;
  }
  .combobox > input::placeholder {
    color: var(--select--value--placeholder-color);
    opacity: 1;
  }
  .combobox > input:disabled {
    cursor: inherit;
  }

  /* The toggle takes a press of its own, at least 24 × 24px, and 44px tall on touch screens. */
  .combobox > button[data-slot="arrow"] {
    position: relative;
    margin-block: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--select--arrow--color);
    font: inherit;
    cursor: pointer;
    pointer-events: auto;
  }
  .combobox > button[data-slot="arrow"]:disabled {
    cursor: inherit;
  }
  /* The default chevron. An icon in the arrow slot keeps its own size, as on the Select. */
  .combobox > button[data-slot="arrow"] svg {
    display: block;
    width: var(--select--arrow--size);
    height: var(--select--arrow--size);
  }
  .combobox > button[data-slot="arrow"]::before {
    content: "";
    position: absolute;
    inset: min(0px, (var(--select--arrow--size) - 1.5rem) / 2);
  }
  @media (any-pointer: coarse) {
    .combobox > button[data-slot="arrow"]::before {
      inset-block: min(0px, (var(--select--arrow--size) - 2.75rem) / 2);
    }
  }

  /* The empty message, drawn by the shared panel, with tokens of the Combobox's own. */
  .combobox :deep([data-slot="empty"]) {
    padding-block: var(--combobox--empty--padding-block);
    padding-inline: var(--combobox--empty--padding-inline);
    color: var(--combobox--empty--color);
  }

  @media (forced-colors: active) {
    .combobox :deep([data-slot="empty"]) {
      color: GrayText;
    }
  }
}
</style>
