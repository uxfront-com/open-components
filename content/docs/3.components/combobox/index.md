---
title: Combobox
description: How to build a combobox that filters a list of suggestions as people type, picks one or several, keeps text you allow and works with every form, keyboard and phone.
navigation:
  title: Overview
---

Comboboxes let people type into a text field to narrow a long list of suggestions and pick one, like a country, a city or the people to share a file with. They're also where a text field, a popover and a list most often fall out of step. Think of a list that picks the first match when people press `Enter`, so "Fra" quietly becomes France, a screen reader that hears nothing while the list empties as people type, or a phone's keyboard that slides up over the half of the list people were about to tap.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/combobox/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a combobox looks, from its parts and its sizes to one or several values, its states and the tokens it shares with the Select.
:::

:::card{to="/docs/components/combobox/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a combobox behaves for every person, input and setting, from the ARIA pattern and the keyboard to filtering, typed values, forms and the on-screen keyboard.
:::

:::card{to="/docs/components/combobox/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Combobox, with the Select's typed list of options, opt-in props for typed values and a slot for each part.
:::

:::card{to="/docs/components/combobox/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, operate and check a combobox, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/combobox#reference-implementation), which does its part of every rule in the [checklist](/docs/components/combobox#checklist), so feel free to open them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Combobox with the same API in each, apart from a few names in React, Solid and Angular, which [Type-safe](/docs/components/combobox/dx#type-safe) explains. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/combobox/ax#deterministic).

The Combobox builds on the [Select](/docs/components/select) for its panel, its options, its groups, its tags and the tokens that style them, on the [Popover](/docs/components/popover) for where the panel opens and how it flips, on the [Input](/docs/components/input) for how the text field looks and on the [Field](/docs/components/field) for its label, hint and error. It's a component of its own, rather than a mode of the Select, since typing changes what `Space`, letters, `Home` and `End` do, brings up the on-screen keyboard and can produce a value that isn't an option.

::combobox-playground
::

| Aspect   | Combobox                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Element  | A `<div>` that draws the field, holding an `<input>`, a hidden `<select>`, a toggle `<button>` and a `<div popover="manual">` panel                   |
| Role     | `combobox` on the `<input>`, with `aria-autocomplete="list"` and a `listbox` popup of options                                                         |
| Name     | The Field's `<label for>`, or `aria-label`                                                                                                            |
| Value    | The picked option's label in the text field, or several values as removable tags                                                                      |
| Keyboard | Typing filters, `ArrowDown` opens it and highlights, `Enter` picks, `Escape` closes, then clears                                                      |
| Pointer  | The toggle opens it, a press on an option picks it, and a press outside closes it                                                                     |
| Filter   | Any part of a label, ignoring case and accents, or a `filter` of your own                                                                             |
| States   | Hover, focus, open, disabled, read-only and invalid, and highlighted, selected and disabled options                                                   |
| Values   | One, or several as removable tags, with `multiple`, and typed values with `allowCustomValue` or `creatable`                                           |
| Sizes    | `xs`, `sm`, `md`, `lg` and `xl`, the Input's and the Select's five                                                                                    |
| Forms    | A hidden native `<select>` submits, validates and resets, for picked and typed values alike                                                           |
| Phones   | The panel fits the part of the screen the on-screen keyboard leaves                                                                                   |
| Pattern  | [WAI-ARIA APG Editable Combobox With List Autocomplete](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/)        |
| WCAG 2.2 | 1.3.1, 1.3.5, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 2.1.1, 2.4.7, 2.5.8, 4.1.2 and 4.1.3, among others                                                        |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A combobox meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Combobox itself, so they're the ones to check when you build or review one. **Usage** rules are met by the screens that use it, like giving it a label, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like a Combobox in a Dialog: the Combobox keeps `Escape` to itself, as long as you render it inside the Dialog.

The basis says where a rule comes from. Many of the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and several come from **HTML**, **WAI-ARIA** and the **APG**. The rest are **Open Components** rules, which are our own, like never picking an option people didn't choose. Where a rule goes further than WCAG asks at level AA, its basis says so: reduced motion comes from level **AAA**, and a rule that asks for more than its criterion says **beyond**.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/combobox/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/combobox/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/combobox/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/combobox/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves: the keyboard model, focus staying in the text, nothing picked while people type and the native `<select>` doing the form's work.

It draws its panel, options and tags with the Select's own files, `SelectPanel.vue`, `SelectTags.vue`, `listbox.ts` and `select.css`, so copy those from the [Select](/docs/components/select#reference-implementation) too, along with the Button's `announce.ts`, which it announces through. That's why one class restyles both components, and why fixing the panel once fixes it in both.

The tests are in `Combobox.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`. The tests stand in for what jsdom lacks, which [Unit tests](/docs/components/combobox/ax#unit-tests) explains, and they also mount the Field and the Dialog.

::code-collapse
:::code-group
```vue [Combobox.vue]
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
```

```ts [Combobox.test.ts]
import { render, screen, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import Dialog from "../dialog/Dialog.vue";
import Field from "../field/Field.vue";
import Select from "../select/Select.vue";
import type { SelectItem } from "../select/listbox";
import Combobox, { type ComboboxProps } from "./Combobox.vue";

// jsdom has no Popover API or scrollIntoView, so these stand in for them: showing and
// hiding with `beforetoggle`. The Combobox's panel is a manual popover, which the browser
// never closes on its own, so nothing stands in for light dismiss. They can't place the
// panel or draw it, which the checklist checks in a browser instead.
const shown = new Set<HTMLElement>();

function toggle(el: HTMLElement, newState: "open" | "closed") {
  el.dispatchEvent(Object.assign(new Event("beforetoggle"), { newState, oldState: newState === "open" ? "closed" : "open" }));
  if (newState === "open") shown.add(el);
  else shown.delete(el);
  el.style.display = newState === "open" ? "block" : "none";
}

beforeAll(() => {
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    if (!shown.has(this)) toggle(this, "open");
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    if (shown.has(this)) toggle(this, "closed");
  };
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
  Element.prototype.scrollIntoView = vi.fn();
  // jsdom has no requestSubmit, so this does what a browser does: validate, then submit.
  HTMLFormElement.prototype.requestSubmit = function (this: HTMLFormElement) {
    if (this.reportValidity()) this.dispatchEvent(new Event("submit", { cancelable: true }));
  };
});

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  warn = vi.spyOn(console, "warn");
});
afterEach(() => {
  shown.clear();
  document.querySelectorAll('[role="status"]').forEach((el) => el.remove());
  warn.mockRestore();
  vi.useRealTimers();
});

const countries: SelectItem[] = [
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", disabled: true },
  { value: "es", label: "Spain" },
  { value: "ch", label: "Zürich" },
  { value: "nz", label: "New Zealand" },
];
const places: SelectItem[] = [
  { label: "Europe", options: [{ value: "fr", label: "France" }, { value: "es", label: "Spain" }] },
  { separator: true },
  { label: "Oceania", options: [{ value: "nz", label: "New Zealand" }] },
];

type Props = Partial<ComboboxProps> & Record<string, unknown>;

// A Combobox in a Field in a form, the way you'd use it.
async function page(props: Props = {}, field: Record<string, unknown> = {}) {
  const submit = vi.fn((event: Event) => event.preventDefault());
  const result = render({
    render: () =>
      h("form", { "aria-label": "Shipping", onSubmit: submit }, [
        h(Field, { label: "Country", ...field }, () => h(Combobox, { id: "country", name: "country", options: countries, ...props })),
        h("button", { type: "submit" }, "Save"),
        h("button", { type: "reset" }, "Reset"),
      ]),
  });
  await nextTick();
  return { ...result, submit };
}

const form = () => screen.getByRole<HTMLFormElement>("form", { name: "Shipping" });
const input = () => screen.getByRole<HTMLInputElement>("combobox", { name: "Country" });
// The panel the text field controls, which is how assistive technologies find it. A
// multiple <select> is a listbox too, so the role alone doesn't tell them apart.
const listbox = () => document.getElementById(input().getAttribute("aria-controls")!)!;
const options = () => within(listbox()).queryAllByRole("option", { hidden: true }).map((el) => el.textContent?.trim());
const option = (name: string) => within(listbox()).getByRole("option", { name, hidden: true });
const submitted = () => new FormData(form()).getAll("country");
const announcements = () => screen.queryByRole("status")?.textContent ?? "";
const highlighted = () => {
  const id = input().getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.textContent?.trim() : undefined;
};

describe("Combobox", () => {
  describe("the ARIA pattern", () => {
    it("is a text field with the combobox role, named by its Field's label, that controls a listbox", async () => {
      await page();
      expect(input().tagName).toBe("INPUT");
      expect(input()).toHaveAttribute("aria-autocomplete", "list");
      expect(input()).toHaveAttribute("aria-expanded", "false");
      expect(input()).toHaveAttribute("aria-controls", listbox().id);
      expect(listbox()).toHaveAttribute("id", "country-panel");
    });

    it("names the listbox after the text field, and marks it multiselectable with multiple", async () => {
      const user = userEvent.setup();
      await page({ multiple: true });
      await user.click(input());
      await user.keyboard("{ArrowDown}");
      expect(listbox()).toHaveAttribute("aria-label", "Country");
      expect(listbox()).toHaveAttribute("aria-multiselectable", "true");
    });

    it("keeps focus in the text field and points aria-activedescendant at the highlight", async () => {
      const user = userEvent.setup();
      await page();
      await user.click(input());
      await user.keyboard("{ArrowDown}");
      expect(input()).toHaveFocus();
      expect(input()).toHaveAttribute("aria-expanded", "true");
      expect(highlighted()).toBe("France");
      expect(option("France")).toHaveAttribute("data-active", "true");
    });

    it("keeps each option's ID as the list narrows, so a new highlight is a new ID", async () => {
      const user = userEvent.setup();
      await page();
      await user.click(input());
      await user.keyboard("{ArrowDown}");
      const id = option("Spain").id;
      await user.type(input(), "sp");
      expect(option("Spain").id).toBe(id);
    });

    it("opens from the keyboard or the toggle, and not on focus alone", async () => {
      const user = userEvent.setup();
      await page();
      await user.click(input());
      expect(input()).toHaveAttribute("aria-expanded", "false");
      await user.click(screen.getByRole("button", { name: "Suggestions", hidden: true }));
      expect(input()).toHaveAttribute("aria-expanded", "true");
      expect(input()).toHaveFocus();
    });

    it("keeps the toggle out of the tab order", async () => {
      await page();
      expect(screen.getByRole("button", { name: "Suggestions", hidden: true })).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("the keyboard", () => {
    it("edits the text with letters, Space, Home and End, rather than jumping to an option", async () => {
      const user = userEvent.setup();
      await page();
      await user.click(input());
      await user.keyboard("new z{Home}N{End}x{ArrowLeft}{ArrowLeft}y{ArrowRight}w");
      expect(input()).toHaveValue("Nnew yzwx");
      expect(highlighted()).toBeUndefined();
    });

    it("drops the highlight as soon as people type, so Enter never picks what was highlighted before", async () => {
      const user = userEvent.setup();
      await page();
      await user.click(input());
      await user.keyboard("{ArrowDown}");
      expect(highlighted()).toBe("France");
      await user.keyboard("r");
      expect(highlighted()).toBeUndefined();
      await user.keyboard("{Enter}");
      expect(submitted()).toEqual([""]);
      expect(input()).toHaveValue("");
    });

    it("points aria-activedescendant at nothing once the panel closes", async () => {
      const user = userEvent.setup();
      await page();
      await user.click(input());
      await user.keyboard("{ArrowDown}{Escape}");
      expect(input()).toHaveAttribute("aria-expanded", "false");
      expect(input()).not.toHaveAttribute("aria-activedescendant");
    });

    it("highlights nothing as people type, so Enter keeps what they typed rather than the first match", async () => {
      const user = userEvent.setup();
      await page({ allowCustomValue: true });
      await user.click(input());
      await user.keyboard("Fra");
      expect(input()).toHaveAttribute("aria-expanded", "true");
      expect(highlighted()).toBeUndefined();
      await user.keyboard("{Enter}");
      expect(submitted()).toEqual(["Fra"]);
    });

    it("moves the highlight with the arrow keys, skipping disabled options, without wrapping", async () => {
      const user = userEvent.setup();
      await page();
      await user.click(input());
      await user.keyboard("{ArrowDown}{ArrowDown}");
      expect(highlighted()).toBe("Spain");
      await user.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}");
      expect(highlighted()).toBe("France");
      await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}");
      expect(highlighted()).toBe("New Zealand");
    });

    it("opens on the last option with ArrowUp, and with no highlight with Alt+ArrowDown", async () => {
      const user = userEvent.setup();
      await page();
      await user.click(input());
      await user.keyboard("{ArrowUp}");
      expect(highlighted()).toBe("New Zealand");
      await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
      expect(input()).toHaveAttribute("aria-expanded", "false");
      await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
      expect(input()).toHaveAttribute("aria-expanded", "true");
      expect(highlighted()).toBeUndefined();
    });

    it("moves ten options with PageDown and PageUp, stopping at either end", async () => {
      const user = userEvent.setup();
      const many = Array.from({ length: 25 }, (_, index) => ({ value: `c${index}`, label: `City ${index}` }));
      await page({ options: many });
      await user.click(input());
      await user.keyboard("{ArrowDown}{PageDown}");
      expect(highlighted()).toBe("City 10");
      await user.keyboard("{PageDown}{PageDown}");
      expect(highlighted()).toBe("City 24");
      await user.keyboard("{PageUp}{PageUp}{PageUp}");
      expect(highlighted()).toBe("City 0");
    });

    it("picks the highlighted option with Enter, shows its label and closes, without submitting", async () => {
      const user = userEvent.setup();
      const { submit } = await page();
      await user.click(input());
      await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
      expect(input()).toHaveValue("Spain");
      expect(input()).toHaveAttribute("aria-expanded", "false");
      expect(submitted()).toEqual(["es"]);
      expect(submit).not.toHaveBeenCalled();
    });

    it("submits the form with Enter on a closed panel, as a text field does", async () => {
      const user = userEvent.setup();
      const { submit } = await page({ value: "fr" });
      await user.click(input());
      await user.keyboard("{Enter}");
      expect(submit).toHaveBeenCalledTimes(1);
    });

    it("picks the highlighted option with Tab and moves on", async () => {
      const user = userEvent.setup();
      await page();
      await user.click(input());
      await user.keyboard("{ArrowDown}");
      await user.tab();
      expect(submitted()).toEqual(["fr"]);
      expect(input()).not.toHaveFocus();
      expect(input()).toHaveAttribute("aria-expanded", "false");
    });

    it("keeps what people toggled on Tab with multiple, rather than picking the highlighted option", async () => {
      const user = userEvent.setup();
      await page({ multiple: true });
      await user.click(input());
      await user.keyboard("{ArrowDown}");
      expect(highlighted()).toBe("France");
      await user.tab();
      expect(submitted()).toEqual([]);
      expect(input()).toHaveAttribute("aria-expanded", "false");
    });

    it("closes with Escape and keeps the text, then clears the text and the value with a second Escape", async () => {
      const user = userEvent.setup();
      await page({ value: "fr" });
      await user.click(input());
      await user.clear(input());
      await user.type(input(), "Sp");
      await user.keyboard("{Escape}");
      expect(input()).toHaveAttribute("aria-expanded", "false");
      expect(input()).toHaveValue("Sp");
      await user.keyboard("{Escape}");
      expect(input()).toHaveValue("");
      expect(submitted()).toEqual([""]);
    });

    it("keeps Escape from closing a Dialog around it, until there's nothing left to clear", async () => {
      const user = userEvent.setup();
      const close = vi.fn();
      render({
        render: () =>
          h(Dialog, { id: "shipping", title: "Shipping", open: true, onClose: close }, () =>
            h(Field, { label: "Country" }, () => h(Combobox, { id: "country", name: "country", options: countries })),
          ),
      });
      await nextTick();
      await user.click(input());
      await user.type(input(), "Sp");
      await user.keyboard("{Escape}{Escape}");
      expect(input()).toHaveValue("");
      expect(close).not.toHaveBeenCalled();
      await user.keyboard("{Escape}");
      expect(close).toHaveBeenCalledWith("escape", "");
    });

    it("removes the last tag with Backspace in empty text, with multiple", async () => {
      const user = userEvent.setup();
      await page({ multiple: true, value: ["fr", "es"] });
      await user.click(input());
      await user.keyboard("{Backspace}");
      expect(submitted()).toEqual(["fr"]);
      expect(announcements()).toBe("Spain removed");
    });

    it("leaves a key alone while an IME is composing", async () => {
      await page();
      input().focus();
      input().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", isComposing: true, bubbles: true }));
      // Safari's Enter that ends a composition.
      input().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", keyCode: 229, bubbles: true }));
      await nextTick();
      expect(input()).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("filtering", () => {
    it("matches any part of a label, ignoring case and accents", async () => {
      const user = userEvent.setup();
      await page();
      await user.click(input());
      await user.type(input(), "ZUR");
      expect(options()).toEqual(["Zürich"]);
      await user.clear(input());
      await user.type(input(), "an");
      expect(options()).toEqual(["France", "Germany", "New Zealand"]);
    });

    it("hides groups and separators that have no match", async () => {
      const user = userEvent.setup();
      await page({ options: places });
      await user.click(input());
      await user.type(input(), "zeal");
      expect(options()).toEqual(["New Zealand"]);
      expect(within(listbox()).getAllByRole("group", { hidden: true })).toHaveLength(1);
      expect(listbox().querySelector('[data-slot="separator"]')).toBeNull();
    });

    it("shows every option when it opens on a picked value, rather than only the one it shows", async () => {
      const user = userEvent.setup();
      await page({ value: "es" });
      await user.click(input());
      await user.keyboard("{ArrowDown}");
      expect(options()).toHaveLength(5);
    });

    it("takes a filter of your own", async () => {
      const user = userEvent.setup();
      await page({ filter: (item: { label: string }, text: string) => item.label.startsWith(text) });
      await user.click(input());
      await user.type(input(), "Sp");
      expect(options()).toEqual(["Spain"]);
      await user.clear(input());
      await user.type(input(), "pain");
      expect(options()).toEqual([]);
    });
  });

  describe("results", () => {
    it("says so in the panel when nothing matches, in a message that isn't an option", async () => {
      const user = userEvent.setup();
      await page();
      await user.click(input());
      await user.type(input(), "xyz");
      const empty = within(listbox()).getByText("No results");
      expect(empty).toHaveAttribute("aria-hidden", "true");
      expect(options()).toEqual([]);
    });

    it("announces the count once typing pauses, rather than on every key", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      await page();
      await user.click(input());
      await user.type(input(), "a");
      vi.advanceTimersByTime(1000);
      expect(announcements()).toBe("");
      await user.type(input(), "n");
      vi.advanceTimersByTime(1400);
      await waitFor(() => expect(announcements()).toBe("3 results"));
    });

    it("announces the empty message, and takes labels of your own", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      await page({ emptyLabel: "Aucun résultat", resultsLabel: (count: number) => `${count} pays` });
      await user.click(input());
      await user.type(input(), "xyz");
      vi.advanceTimersByTime(1400);
      await waitFor(() => expect(announcements()).toBe("Aucun résultat"));
      await user.clear(input());
      await user.type(input(), "sp");
      vi.advanceTimersByTime(1400);
      await waitFor(() => expect(announcements()).toBe("Aucun résultat1 pays"));
    });
  });

  describe("text that isn't an option", () => {
    it("goes back to the picked option's label on blur, with both props off, and the value stays", async () => {
      const user = userEvent.setup();
      await page({ value: "fr" });
      await user.click(input());
      await user.clear(input());
      await user.type(input(), "Fra");
      await user.tab();
      expect(input()).toHaveValue("France");
      expect(submitted()).toEqual(["fr"]);
    });

    it("picks the option whose label it is, ignoring case and accents, on blur", async () => {
      const user = userEvent.setup();
      await page();
      await user.click(input());
      await user.type(input(), "zurich");
      await user.tab();
      expect(input()).toHaveValue("Zürich");
      expect(submitted()).toEqual(["ch"]);
    });

    it("clears the value when people clear the text", async () => {
      const user = userEvent.setup();
      await page({ value: "fr" });
      await user.click(input());
      await user.clear(input());
      await user.tab();
      expect(submitted()).toEqual([""]);
    });

    it("keeps the picked option when people leave without changing its text, even when another has the same label", async () => {
      const user = userEvent.setup();
      const others: SelectItem[] = [
        { label: "Europe", options: [{ value: "eu-other", label: "Other" }] },
        { label: "Asia", options: [{ value: "as-other", label: "Other" }] },
      ];
      await page({ options: others });
      await user.click(input());
      await user.keyboard("{ArrowUp}{Enter}");
      expect(submitted()).toEqual(["as-other"]);
      await user.tab();
      expect(submitted()).toEqual(["as-other"]);
      await user.click(input());
      await user.tab();
      expect(submitted()).toEqual(["as-other"]);
    });

    it("keeps a picked disabled option when people leave without changing its text, with allowCustomValue", async () => {
      const user = userEvent.setup();
      await page({ value: "de", allowCustomValue: true });
      expect(input()).toHaveValue("Germany");
      await user.click(input());
      await user.tab();
      expect(submitted()).toEqual(["de"]);
    });

    it("never turns text that's an option's value, but not its label, into that option", async () => {
      const user = userEvent.setup();
      await page({ allowCustomValue: true });
      await user.click(input());
      await user.type(input(), "es");
      await user.tab();
      expect(submitted()).toEqual([""]);
      expect(input()).toHaveValue("");
    });

    it("doesn't offer to create text that's an option's value", async () => {
      const user = userEvent.setup();
      await page({ creatable: true, multiple: true });
      await user.click(input());
      await user.type(input(), "es");
      expect(options()).toEqual([]);
      expect(within(listbox()).getByText("No results")).toBeInTheDocument();
    });

    it("reverts unmatched text with Enter on a closed panel, before the form submits", async () => {
      const user = userEvent.setup();
      const values: unknown[] = [];
      const { submit } = await page({ value: "fr" });
      submit.mockImplementation((event: Event) => {
        event.preventDefault();
        values.push(...submitted());
      });
      await user.click(input());
      await user.clear(input());
      await user.type(input(), "Fra");
      await user.keyboard("{Escape}{Enter}");
      expect(input()).toHaveValue("France");
      expect(values).toEqual(["fr"]);
    });

    it("becomes the value with allowCustomValue, and submits as typed", async () => {
      const user = userEvent.setup();
      await page({ allowCustomValue: true });
      await user.click(input());
      await user.type(input(), "Lyon");
      await user.tab();
      expect(input()).toHaveValue("Lyon");
      expect(submitted()).toEqual(["Lyon"]);
    });

    it("submits the new value with Enter on a closed panel, once the value has changed", async () => {
      const user = userEvent.setup();
      const values: unknown[] = [];
      const { submit } = await page({ allowCustomValue: true });
      submit.mockImplementation((event: Event) => {
        event.preventDefault();
        values.push(...submitted());
      });
      await user.click(input());
      await user.type(input(), "Lyon");
      await user.keyboard("{Escape}{Enter}");
      await waitFor(() => expect(values).toEqual(["Lyon"]));
    });

    it.each([
      ["typed text, with allowCustomValue", { allowCustomValue: true }, "fr", "Lyon", ["Lyon"]],
      ["a label, with multiple", { multiple: true }, ["fr"], "Spain", ["fr", "es"]],
      ["another option's label", {}, "es", "France", ["fr"]],
    ])("submits the new value with Enter on a closed panel when its value is bound, after %s", async (_, props, start, typed, expected) => {
      const user = userEvent.setup();
      const value = ref<string | string[] | undefined>(start);
      const values: unknown[] = [];
      const submit = vi.fn((event: Event) => {
        event.preventDefault();
        values.push(new FormData(event.target as HTMLFormElement).getAll("country"));
      });
      render({
        render: () =>
          h("form", { "aria-label": "Shipping", onSubmit: submit }, [
            h(Field, { label: "Country" }, () =>
              h(Combobox, {
                id: "country",
                name: "country",
                options: countries,
                ...props,
                modelValue: value.value,
                "onUpdate:modelValue": (next?: string | string[]) => (value.value = next),
              }),
            ),
            h("button", { type: "submit" }, "Save"),
          ]),
      });
      await nextTick();
      await user.click(input());
      await user.clear(input());
      await user.type(input(), typed);
      await user.keyboard("{Escape}{Enter}");
      await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
      expect(values).toEqual([expected]);
    });

    it("offers a create option with creatable, which fires create and becomes the value", async () => {
      const user = userEvent.setup();
      const create = vi.fn();
      await page({ creatable: true, onCreate: create });
      await user.click(input());
      await user.type(input(), "Lyon");
      expect(options()).toEqual(['Create "Lyon"']);
      await user.keyboard("{ArrowDown}");
      expect(highlighted()).toBe('Create "Lyon"');
      await user.keyboard("{Enter}");
      expect(create).toHaveBeenCalledWith("Lyon");
      expect(input()).toHaveValue("Lyon");
      expect(submitted()).toEqual(["Lyon"]);
    });

    it("puts the create option after the matches, and leaves it out once the text is a label", async () => {
      const user = userEvent.setup();
      await page({ creatable: true, createLabel: (text: string) => `Add ${text}` });
      await user.click(input());
      await user.type(input(), "Fr");
      expect(options()).toEqual(["France", "Add Fr"]);
      await user.type(input(), "ance");
      expect(options()).toEqual(["France"]);
    });

    it("adds a created value as a tag with multiple, and submits it with the others", async () => {
      const user = userEvent.setup();
      const create = vi.fn();
      await page({ creatable: true, multiple: true, value: ["fr"], onCreate: create });
      await user.click(input());
      await user.type(input(), "Lyon");
      await user.click(option('Create "Lyon"'));
      expect(create).toHaveBeenCalledWith("Lyon");
      expect(submitted()).toEqual(["fr", "Lyon"]);
      expect(screen.getByRole("button", { name: "Remove Lyon" })).toBeInTheDocument();
      expect(input()).toHaveValue("");
    });

    it("ignores allowCustomValue with multiple, warns, and clears unmatched text on blur", async () => {
      const user = userEvent.setup();
      await page({ allowCustomValue: true, multiple: true });
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("ignores allowCustomValue with multiple"), expect.anything());
      await user.click(input());
      await user.type(input(), "Lyon");
      await user.tab();
      expect(input()).toHaveValue("");
      expect(submitted()).toEqual([]);
    });
  });

  describe("several values", () => {
    it("toggles options, keeps the panel open and clears the text after each pick", async () => {
      const user = userEvent.setup();
      await page({ multiple: true });
      await user.click(input());
      await user.type(input(), "fr");
      await user.keyboard("{ArrowDown}{Enter}");
      expect(input()).toHaveValue("");
      expect(input()).toHaveAttribute("aria-expanded", "true");
      expect(highlighted()).toBe("France");
      await user.keyboard("{ArrowDown}{Enter}");
      expect(submitted()).toEqual(["fr", "es"]);
      await user.keyboard("{ArrowUp}{Enter}");
      expect(submitted()).toEqual(["es"]);
    });

    it("shows each value as a tag after the text, whose button removes it and passes focus on", async () => {
      const user = userEvent.setup();
      await page({ multiple: true, value: ["fr", "es"] });
      const tags = document.querySelector('[data-slot="tags"]')!;
      expect(input().compareDocumentPosition(tags) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      await user.click(screen.getByRole("button", { name: "Remove France" }));
      expect(submitted()).toEqual(["es"]);
      expect(screen.getByRole("button", { name: "Remove Spain" })).toHaveFocus();
      expect(announcements()).toBe("France removed");
      await user.click(screen.getByRole("button", { name: "Remove Spain" }));
      expect(input()).toHaveFocus();
    });

    it("picks the option whose label people typed on blur, and clears the text", async () => {
      const user = userEvent.setup();
      await page({ multiple: true });
      await user.click(input());
      await user.type(input(), "spain");
      await user.tab();
      expect(submitted()).toEqual(["es"]);
      expect(input()).toHaveValue("");
    });
  });

  describe("forms", () => {
    it("submits the picked option's value under its name, not its label, and nothing with nothing picked", async () => {
      const user = userEvent.setup();
      await page();
      expect(submitted()).toEqual([""]);
      await user.click(input());
      await user.keyboard("{ArrowDown}{Enter}");
      expect(submitted()).toEqual(["fr"]);
      expect(input()).not.toHaveAttribute("name");
    });

    it("blocks a submit while required and empty, and moves focus from the select to the text", async () => {
      await page({ required: true });
      const native = document.querySelector("select")!;
      expect(native.validity.valueMissing).toBe(true);
      expect(input()).toHaveAttribute("aria-required", "true");
      native.focus();
      expect(input()).toHaveFocus();
    });

    it("resets with its form to its first value and that value's text", async () => {
      const user = userEvent.setup();
      await page({ value: "fr" });
      await user.click(input());
      await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
      expect(submitted()).toEqual(["es"]);
      await user.click(screen.getByRole("button", { name: "Reset" }));
      await waitFor(() => expect(input()).toHaveValue("France"));
      expect(submitted()).toEqual(["fr"]);
    });

    it("resets to a first value that was typed, with allowCustomValue", async () => {
      const user = userEvent.setup();
      await page({ value: "Lyon", allowCustomValue: true });
      expect(input()).toHaveValue("Lyon");
      await user.click(input());
      await user.keyboard("{ArrowDown}{Enter}");
      expect(submitted()).toEqual(["fr"]);
      await user.click(screen.getByRole("button", { name: "Reset" }));
      await waitFor(() => expect(input()).toHaveValue("Lyon"));
      expect(submitted()).toEqual(["Lyon"]);
    });

    it("resets several values", async () => {
      const user = userEvent.setup();
      await page({ multiple: true, value: ["fr"] });
      await user.click(screen.getByRole("button", { name: "Remove France" }));
      expect(submitted()).toEqual([]);
      await user.click(screen.getByRole("button", { name: "Reset" }));
      await waitFor(() => expect(submitted()).toEqual(["fr"]));
    });

    it("leaves its form while disabled, and can't be opened", async () => {
      const user = userEvent.setup();
      await page({ value: "fr" }, { disabled: true });
      expect(input()).toBeDisabled();
      expect(submitted()).toEqual([]);
      await user.click(screen.getByRole("button", { name: "Suggestions", hidden: true }));
      expect(input()).toHaveAttribute("aria-expanded", "false");
    });

    it("keeps its value while read-only, and doesn't let people change it", async () => {
      const user = userEvent.setup();
      await page({ value: "fr", readonly: true, multiple: true });
      expect(input()).toHaveAttribute("aria-readonly", "true");
      await user.click(input());
      await user.keyboard("{ArrowDown}");
      expect(input()).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("button", { name: "Remove France" })).toBeNull();
      await user.keyboard("{Backspace}");
      expect(submitted()).toEqual(["fr"]);
    });

    it("is invalid while its Field has an error, which describes it", async () => {
      await page({}, { error: "Choose a country" });
      expect(input()).toHaveAttribute("aria-invalid", "true");
      expect(input()).toHaveAccessibleDescription("Choose a country");
    });
  });

  describe("the API", () => {
    it("binds its value with v-model, and updates its text when the value changes", async () => {
      const user = userEvent.setup();
      const value = ref<string | string[]>("fr");
      render({
        render: () =>
          h(Field, { label: "Country" }, () =>
            h(Combobox, { id: "country", options: countries, modelValue: value.value, "onUpdate:modelValue": (next?: string | string[]) => (value.value = next ?? "") }),
          ),
      });
      await nextTick();
      await user.click(input());
      await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
      expect(value.value).toBe("es");
      value.value = "nz";
      await nextTick();
      expect(input()).toHaveValue("New Zealand");
    });

    it("fires the select's input and change events when the value changes, not on every key", async () => {
      const user = userEvent.setup();
      const fired: string[] = [];
      await page({ onChange: () => fired.push("change"), onInput: () => fired.push("input") });
      await user.click(input());
      await user.type(input(), "sp");
      expect(fired).toEqual([]);
      await user.keyboard("{ArrowDown}{Enter}");
      await waitFor(() => expect(fired).toEqual(["input", "change"]));
    });

    it("puts classes on the root, the name on the select, and id, ARIA and autocomplete on the text field", async () => {
      await page({ class: "brand", autocomplete: "country-name", "aria-describedby": "help" });
      expect(document.querySelector(".combobox")).toHaveClass("brand");
      expect(document.querySelector("select")).toHaveAttribute("name", "country");
      expect(input()).toHaveAttribute("id", "country");
      expect(input()).toHaveAttribute("autocomplete", "country-name");
      expect(input()).toHaveAttribute("aria-describedby", expect.stringContaining("help"));
    });

    it("takes every name and message it reads out from a prop, for another language", async () => {
      const user = userEvent.setup();
      await page({
        multiple: true,
        value: ["fr"],
        toggleLabel: "Suggestions de pays",
        removeLabel: (label: string) => `Retirer ${label}`,
        removedLabel: (label: string) => `${label} retiré`,
      });
      expect(screen.getByRole("button", { name: "Suggestions de pays", hidden: true })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Retirer France" }));
      expect(announcements()).toBe("France retiré");
    });

    it("turns the browser's own suggestions off by default, since they'd cover the panel", async () => {
      await page();
      expect(input()).toHaveAttribute("autocomplete", "off");
    });

    it("renders a slot for each part", async () => {
      const user = userEvent.setup();
      render({
        render: () =>
          h(Field, { label: "Country" }, () =>
            h(
              Combobox,
              { id: "country", options: places, multiple: true, value: ["fr"] },
              {
                leading: () => h("i", { "data-testid": "leading" }),
                arrow: () => h("i", { "data-testid": "arrow" }),
                option: ({ option }: { option: { label: string } }) => `Place: ${option.label}`,
                tag: ({ option }: { option: { label: string } }) => `Tag: ${option.label}`,
                "group-label": ({ label }: { label: string }) => `Group: ${label}`,
                separator: () => h("i", { "data-testid": "separator" }),
                icon: () => h("i", { "data-testid": "icon" }),
              },
            ),
          ),
      });
      await nextTick();
      await user.click(input());
      await user.keyboard("{ArrowDown}");
      expect(screen.getByTestId("leading")).toBeInTheDocument();
      expect(screen.getByTestId("arrow")).toBeInTheDocument();
      expect(screen.getByTestId("separator")).toBeInTheDocument();
      expect(screen.getAllByTestId("icon").length).toBeGreaterThan(1);
      expect(screen.getByText("Tag: France")).toBeInTheDocument();
      expect(within(listbox()).getByRole("group", { name: "Group: Europe", hidden: true })).toBeInTheDocument();
      expect(option("Place: Spain")).toBeInTheDocument();
    });

    it("gives a ref the text field and the select", async () => {
      const combobox = ref<{ control: HTMLInputElement; select: HTMLSelectElement }>();
      render({ render: () => h(Combobox, { ref: combobox, id: "country", "aria-label": "Country", options: countries }) });
      await nextTick();
      expect(combobox.value?.control).toBe(input());
      expect(combobox.value?.select.tagName).toBe("SELECT");
    });
  });

  describe("the on-screen keyboard", () => {
    const viewport = (height: number, offsetTop = 0) => {
      const target = new EventTarget();
      vi.stubGlobal("visualViewport", Object.assign(target, { height, offsetTop, width: 390 }));
      vi.spyOn(window, "innerHeight", "get").mockReturnValue(844);
    };
    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    async function openOn(field: Partial<DOMRect>, natural: number) {
      const user = userEvent.setup();
      vi.stubGlobal("CSS", { supports: () => true });
      await page();
      const root = document.querySelector<HTMLElement>(".combobox")!;
      vi.spyOn(root, "getBoundingClientRect").mockReturnValue({ width: 358, left: 16, top: 0, bottom: 0, ...field } as DOMRect);
      vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(390);
      vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(844);
      listbox().style.marginTop = "4px";
      vi.spyOn(listbox(), "offsetHeight", "get").mockReturnValue(natural);
      await user.click(input());
      await user.keyboard("{ArrowDown}");
      await nextTick();
      return listbox();
    }

    it("fits the panel in what the keyboard leaves of the screen, even where anchor positioning works", async () => {
      viewport(400);
      const panel = await openOn({ top: 300, bottom: 336 }, 256);
      expect(panel).toHaveAttribute("data-fit", "visual");
      expect(panel.style.top).toBe(`${300 - 8 - 256}px`);
      expect(panel.style.width).toBe("358px");
    });

    it("shrinks the panel to the room the keyboard leaves", async () => {
      viewport(420);
      const panel = await openOn({ top: 120, bottom: 156 }, 400);
      expect(panel.style.maxHeight).toBe(`${420 - 156 - 8}px`);
      expect(panel.style.top).toBe("156px");
    });

    it("follows the visual viewport when the page scrolls under the keyboard", async () => {
      viewport(400, 200);
      const panel = await openOn({ top: 450, bottom: 486 }, 100);
      expect(panel.style.top).toBe("486px");
      expect(panel.style.maxHeight).toBe("");
    });

    it("fits the panel when the keyboard comes up after it opened", async () => {
      viewport(844);
      const panel = await openOn({ top: 300, bottom: 336 }, 256);
      expect(panel).not.toHaveAttribute("data-fit");
      (window.visualViewport as unknown as { height: number }).height = 400;
      window.visualViewport!.dispatchEvent(new Event("resize"));
      expect(panel).toHaveAttribute("data-fit", "visual");
      expect(panel.style.top).toBe(`${300 - 8 - 256}px`);
    });

    it("leaves the Select's placement alone, since only a text field brings up a keyboard", async () => {
      const user = userEvent.setup();
      viewport(400);
      vi.stubGlobal("CSS", { supports: () => true });
      render({ render: () => h(Field, { label: "Size" }, () => h(Select, { id: "size", options: countries, nativeOnTouch: false })) });
      await nextTick();
      await user.click(screen.getByRole("combobox", { name: "Size" }));
      await nextTick();
      const panel = screen.getByRole("listbox", { hidden: true });
      expect(panel).not.toHaveAttribute("data-fit");
      expect(panel.style.top).toBe("");
    });

    it("goes back to anchor positioning once the keyboard closes", async () => {
      viewport(400);
      const panel = await openOn({ top: 300, bottom: 336 }, 256);
      (window.visualViewport as unknown as { height: number }).height = 844;
      window.visualViewport!.dispatchEvent(new Event("resize"));
      expect(panel).not.toHaveAttribute("data-fit");
      expect(panel.style.top).toBe("");
    });
  });

  describe("server rendering and the DOM", () => {
    it("hydrates without a mismatch", async () => {
      const markup = () =>
        h("form", [h(Field, { label: "Country" }, () => h(Combobox, { id: "country", name: "country", options: places, value: "nz", placeholder: "Pick" }))]);
      const host = document.createElement("div");
      host.innerHTML = await renderToString(createSSRApp({ render: markup }));
      document.body.append(host);
      const error = vi.spyOn(console, "error");
      const app = createSSRApp({ render: markup });
      app.mount(host);
      await nextTick();
      expect(warn.mock.calls.filter((call: unknown[]) => String(call[0]).includes("Hydration"))).toEqual([]);
      expect(error).not.toHaveBeenCalled();
      expect(host.querySelector("input")).toHaveValue("New Zealand");
      app.unmount();
      host.remove();
      error.mockRestore();
    });

    it("renders the same markup for the same props, with IDs made from its own id", async () => {
      const markup = () => renderToString(createSSRApp({ render: () => h(Combobox, { id: "country", name: "country", options: countries, value: "fr" }) }));
      const html = await markup();
      expect(await markup()).toBe(html);
      const host = document.createElement("div");
      host.innerHTML = html;
      expect(host.querySelector("input")).toHaveAttribute("aria-controls", "country-panel");
      expect(host.querySelector('[role="option"]')).toHaveAttribute("id", "country-option-0");
      expect(host.querySelector('option[value="fr"]')).toHaveAttribute("selected");
    });

    it("mirrors its state and size in data attributes, and marks its parts with data-slot in order", async () => {
      const user = userEvent.setup();
      await page({ size: "lg", multiple: true, value: ["fr"] });
      const root = document.querySelector(".combobox")!;
      expect(root).toHaveAttribute("data-size", "lg");
      expect(root).toHaveAttribute("data-state", "closed");
      await user.click(input());
      await user.keyboard("{ArrowDown}");
      expect(root).toHaveAttribute("data-state", "open");
      const parts = [...root.querySelectorAll("[data-slot]")].map((el) => el.getAttribute("data-slot"));
      expect([...new Set(parts)]).toEqual(["native", "control", "tags", "tag", "tag-label", "tag-remove", "arrow", "panel", "option", "option-label", "check"]);
    });

    it("closes on a press outside the field, and stays open on a press in its text", async () => {
      const user = userEvent.setup();
      await page();
      await user.click(input());
      await user.keyboard("{ArrowDown}");
      await user.pointer({ keys: "[MouseLeft]", target: input() });
      expect(input()).toHaveAttribute("aria-expanded", "true");
      // A press on something that doesn't take focus, so the text keeps it.
      document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      await nextTick();
      expect(input()).toHaveFocus();
      expect(input()).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("development warnings", () => {
    it("warns when it has no accessible name", async () => {
      render({ render: () => h(Combobox, { id: "country", options: countries }) });
      await nextTick();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());
    });

    it("warns when it has no id or name", async () => {
      render({ render: () => h(Combobox, { "aria-label": "Country", options: countries }) });
      await nextTick();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("no id or name"), expect.anything());
    });
  });
});
```
:::
::

## Sources

- [WAI-ARIA Authoring Practices: Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), for the editable combobox, its kinds of autocomplete and the optional `Alt+ArrowUp` and `Alt+ArrowDown`
- [WAI-ARIA Authoring Practices: Editable Combobox With List Autocomplete](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/), for the keyboard model, the toggle out of the tab order and `Escape` closing the list, then clearing the text
- [WAI-ARIA 1.2: combobox](https://www.w3.org/TR/wai-aria-1.2/#combobox), [aria-autocomplete](https://www.w3.org/TR/wai-aria-1.2/#aria-autocomplete) and [aria-activedescendant](https://www.w3.org/TR/wai-aria-1.2/#aria-activedescendant), for the attributes and what each one tells assistive technologies
- [HTML Standard: the select element](https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element), for the placeholder label option, default selectedness and reset
- [HTML Standard: autofill](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill), for `autocomplete` and its field names, like `country-name`
- [HTML Standard: the popover attribute](https://html.spec.whatwg.org/multipage/popover.html), for the top layer and manual popovers
- [CSS Anchor Positioning](https://www.w3.org/TR/css-anchor-position-1/), for placing the panel and flipping it
- MDN's [Visual Viewport API](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API), for the part of the page an on-screen keyboard leaves
- MDN's [`String.prototype.normalize()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize), for matching "Zürich" when people type "zurich"
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 4.1.2: Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html), for a combobox that has a name, a role and a value
- [Understanding SC 4.1.3: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), for announcing the count, "No results" and a removed value
- [Understanding SC 1.3.5: Identify Input Purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html), for `autocomplete` on a field about people themselves
- [Understanding SC 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), for 24 × 24px targets, and [SC 2.5.5: Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), for 44px on touch screens
- [Understanding SC 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), for fitting a 320px screen
- [GOV.UK accessible-autocomplete](https://github.com/alphagov/accessible-autocomplete), for waiting 1400ms after typing before announcing the results, and for saying when there are none
- [React Aria: ComboBox](https://react-aria.adobe.com/ComboBox) and [useFilter](https://react-aria.adobe.com/useFilter), for `allowsCustomValue`, opening on input rather than on focus, `multiple` on the combobox, and matching any part of a label, ignoring case and accents
- [Ark UI: Combobox](https://ark-ui.com/docs/components/combobox) and [Tags Input](https://ark-ui.com/docs/components/tags-input), for the name `allowCustomValue`, `multiple` on the combobox, and a Tags Input of its own, with tags people can edit
- [Material UI: Autocomplete](https://mui.com/material-ui/react-autocomplete/), for `freeSolo` and the "Creatable" pattern, a last option like 'Add "YOUR SEARCH"'
- [Base UI: Combobox](https://base-ui.com/react/components/combobox), for several values shown as chips in the field
- [Mantine: TagsInput](https://mantine.dev/core/tags-input/), for a Tags Input that's a component of its own, which splits values on a comma and on paste
- [Fluent UI: Combobox](https://storybooks.fluentui.dev/react/?path=/docs/components-combobox--docs), for `freeform`, another name for keeping typed text
