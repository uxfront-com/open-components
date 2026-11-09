---
title: Select
description: How to build a select that picks one option or several from a list, looks like your brand, works with every form and hands phones their own picker.
navigation:
  title: Overview
---

Selects let people pick one option, or several, out of a list that's too long to show on the page, like a country, a time zone or the labels on an issue. They're also the form control teams most often rebuild from scratch, usually to make the list look like the rest of the product, and that's where they go wrong. Think of a custom dropdown a screen reader reads as a plain button with no value, a form that submits nothing because the choice never reached it, or a list that opens off the bottom of a phone's screen when the phone has a perfectly good picker of its own.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/select/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a select looks, from its seven parts and its sizes to one or several values, its states and the tokens that restyle each part.
:::

:::card{to="/docs/components/select/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a select behaves for every person, input and setting, from the ARIA pattern and the keyboard to forms, Dialogs and the native picker on touch screens.
:::

:::card{to="/docs/components/select/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Select, with one typed list of options, a value that works bound or unbound, and a slot for each part.
:::

:::card{to="/docs/components/select/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, operate and check a select, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/select#reference-implementation), which does its part of every rule in the [checklist](/docs/components/select#checklist), so feel free to open them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Select with the same API in each, apart from a few names in Angular and in React and Solid, which [Type-safe](/docs/components/select/dx#type-safe) explains. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/select/ax#deterministic).

The Select builds on the [Popover](/docs/components/popover) for where its panel opens, how it flips and how it closes, and on the [Field](/docs/components/field) for its label, hint and error. Most of the examples turn off the native picker, so you'll see the panel and the chips on a phone too.

::select-playground
::

| Aspect    | Select                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------- |
| Element   | A `<div>` that draws the field, holding a `<button>`, a `<select>` and a `<div popover="auto">` panel   |
| Role      | `combobox` on the button, with a `listbox` popup of options                                             |
| Name      | The Field's `<label for>`, or `aria-label`                                                              |
| Value     | The button's text, which is the option's label, a list of labels, or a count past three                 |
| Keyboard  | `ArrowDown`, `Enter` or `Space` opens it, letters search it, `Enter` picks, `Escape` closes             |
| Pointer   | A press on the field opens it, a press outside closes it, and a press on its label only takes focus     |
| Values    | One, or several as removable chips, with `multiple`                                                     |
| Forms     | A native `<select>` is always in the page, which submits, validates and resets                          |
| Touch     | `nativeOnTouch` shows the native `<select>` where the primary pointer is coarse, and is on by default   |
| Pattern   | The APG's [select-only combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/)                                                                 |
| WCAG 2.2  | 1.3.1, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 2.1.1, 2.4.3, 2.4.7, 2.5.8, 4.1.2 and 4.1.3, among others          |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A select meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Select itself, so they're the ones to check when you build or review one. **Usage** rules are met by the screens that use it, like giving it a label, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like a Select inside a Dialog, which only works when it's rendered inside it.

The basis says where a rule comes from. Many of the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and several come from **HTML**, **WAI-ARIA** and the **APG**. The rest are **Open Components** rules, which are our own, like not picking a first option nobody looked at. Where a rule goes further than WCAG asks at level AA, its basis says so: reduced motion comes from level **AAA**, and a rule that asks for more than its criterion says **beyond**.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/select/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/select/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/select/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/select/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves: the keyboard model, focus staying on the control, and the native `<select>` doing the form's work. It announces through the Button's `announce.ts`, so copy that from the [Button](/docs/components/button#reference-implementation) too.

The tests are in `Select.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`. jsdom has no Popover API, `matchMedia` or `scrollIntoView`, so the tests stand in for them, at the top of the file, and for one thing jsdom gets wrong: it enters a selected option in the form data even when it's disabled. They also mount the Field and the Dialog.

::code-collapse
:::code-group
```vue [Select.vue]
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
```

```ts [Select.test.ts]
import { render, screen, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import Dialog from "../dialog/Dialog.vue";
import Field from "../field/Field.vue";
import Select, { type SelectItem, type SelectProps } from "./Select.vue";

// jsdom has no Popover API, matchMedia or scrollIntoView, so these stand in for them:
// showing and hiding with `beforetoggle`, the light dismiss of a press outside the panel,
// and a `(pointer: coarse)` query each test can set. They can't place the panel, or draw
// either rendering, which the checklist checks in a browser instead.
const shown = new Set<HTMLElement>();
let coarse = false;
const mediaListeners = new Set<() => void>();

function toggle(el: HTMLElement, newState: "open" | "closed") {
  el.dispatchEvent(Object.assign(new Event("beforetoggle"), { newState, oldState: newState === "open" ? "closed" : "open" }));
  if (newState === "open") shown.add(el);
  else shown.delete(el);
  // jsdom can't match :popover-open, so this stands in for it.
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
  window.matchMedia = ((query: string) => ({
    get matches() {
      return query === "(pointer: coarse)" && coarse;
    },
    addEventListener: (_: string, listener: () => void) => mediaListeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => mediaListeners.delete(listener),
  })) as unknown as typeof window.matchMedia;

  // A press that starts outside every open panel closes them, before the click arrives.
  document.addEventListener(
    "pointerup",
    (event) => {
      for (const el of [...shown]) if (!el.contains(event.target as Node)) el.hidePopover();
    },
    true,
  );
});

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  coarse = false;
  warn = vi.spyOn(console, "warn");
});
afterEach(() => {
  shown.clear();
  mediaListeners.clear();
  document.querySelectorAll('[role="status"]').forEach((el) => el.remove());
  warn.mockRestore();
});

const countries: SelectItem[] = [
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", disabled: true },
  { value: "es", label: "Spain" },
  { value: "nz", label: "New Zealand" },
];
const fruit: SelectItem[] = [
  { label: "Citrus", options: [{ value: "lemon", label: "Lemon" }, { value: "lime", label: "Lime" }] },
  { separator: true },
  { value: "apple", label: "Apple" },
];

type Props = Partial<SelectProps> & Record<string, unknown>;

// A Select in a Field in a form, the way you'd use it.
async function page(props: Props = {}, field: Record<string, unknown> = {}) {
  const result = render({
    render: () =>
      h("form", { "aria-label": "Shipping" }, [
        h(Field, { label: "Country", ...field }, () => h(Select, { id: "country", name: "country", options: countries, ...props })),
        h("button", { type: "reset" }, "Reset"),
        h("a", { href: "#next" }, "Next"),
      ]),
  });
  await nextTick();
  return result;
}

const form = () => screen.getByRole<HTMLFormElement>("form", { name: "Shipping" });
const native = () => document.querySelector("select") as HTMLSelectElement;
const trigger = () => screen.getByRole("combobox", { name: "Country" });
const listbox = () => document.querySelector<HTMLElement>('[role="listbox"]')!;
// jsdom enters a selected option in the form data even when it's disabled, which the HTML
// Standard and browsers don't, so this leaves those out. The checklist checks it in a browser too.
const submitted = () => {
  const disabled = Array.from(native().selectedOptions).filter((option) => option.disabled).map((option) => option.value);
  return new FormData(form()).getAll("country").filter((value) => !disabled.includes(String(value)));
};
const option = (name: string) => within(listbox()).getByRole("option", { name, hidden: true });
const announcements = () => document.querySelector('[role="status"]')?.textContent ?? "";

// Picks a value the way people would in each rendering.
async function change(user: ReturnType<typeof userEvent.setup>, value: string, label: string, isNative: boolean) {
  if (isNative) {
    native().value = value;
    native().dispatchEvent(new Event("input", { bubbles: true }));
    native().dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    await user.click(trigger());
    await user.click(option(label));
  }
  await nextTick();
  await nextTick();
}

async function press(user: ReturnType<typeof userEvent.setup>, keys: string) {
  trigger().focus();
  await user.keyboard(keys);
  await nextTick();
}

describe("Select", () => {
  describe("custom rendering", () => {
    it("is a combobox on a button, named by its label, whose text is its value", async () => {
      await page({ modelValue: "fr", nativeOnTouch: false });
      const control = trigger();
      expect(control.tagName).toBe("BUTTON");
      expect(control).toHaveAttribute("type", "button");
      expect(control).toHaveAttribute("aria-haspopup", "listbox");
      expect(control).toHaveAttribute("aria-expanded", "false");
      expect(control).toHaveAttribute("aria-controls", "country-panel");
      expect(control).toHaveAttribute("data-slot", "control");
      expect(control).toHaveTextContent("France");
    });

    it("opens with a press, highlights the picked option and leaves focus on the control", async () => {
      const user = userEvent.setup();
      await page({ modelValue: "es", nativeOnTouch: false });
      await user.click(trigger());
      await nextTick();
      expect(trigger()).toHaveAttribute("aria-expanded", "true");
      expect(trigger()).toHaveFocus();
      expect(trigger()).toHaveAttribute("aria-activedescendant", option("Spain").id);
      expect(option("Spain")).toHaveAttribute("aria-selected", "true");
    });

    it("closes with a second press rather than opening again after light dismiss", async () => {
      const user = userEvent.setup();
      await page({ nativeOnTouch: false });
      await user.click(trigger());
      expect(trigger()).toHaveAttribute("aria-expanded", "true");
      await user.click(trigger());
      await nextTick();
      expect(trigger()).toHaveAttribute("aria-expanded", "false");
    });

    it("closes on a press outside, leaving the value as it was", async () => {
      const user = userEvent.setup();
      await page({ value: "fr", nativeOnTouch: false });
      await user.click(trigger());
      await user.click(screen.getByRole("link", { name: "Next" }));
      await nextTick();
      expect(trigger()).toHaveAttribute("aria-expanded", "false");
      expect(trigger()).toHaveTextContent("France");
    });

    it("takes focus without opening when its label is pressed", async () => {
      const user = userEvent.setup();
      await page({ nativeOnTouch: false });
      await user.click(screen.getByText("Country", { selector: "label" }));
      await nextTick();
      expect(trigger()).toHaveFocus();
      expect(trigger()).toHaveAttribute("aria-expanded", "false");
    });

    it("still opens on a click with detail 0, which is how a screen reader activates it", async () => {
      await page({ nativeOnTouch: false });
      trigger().dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }));
      await nextTick();
      expect(trigger()).toHaveAttribute("aria-expanded", "true");
    });

    it("focuses the control on a press, for Safari, which doesn't", async () => {
      await page({ nativeOnTouch: false });
      trigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
      expect(trigger()).toHaveFocus();
    });

    it("picks with a press, closes and keeps focus, firing a change the form can hear", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await page({ nativeOnTouch: false, onChange });
      await user.click(trigger());
      await user.click(option("Spain"));
      await nextTick();
      await nextTick();
      expect(trigger()).toHaveTextContent("Spain");
      expect(trigger()).toHaveAttribute("aria-expanded", "false");
      expect(trigger()).toHaveFocus();
      expect(submitted()).toEqual(["es"]);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0]![0].bubbles).toBe(true);
    });

    it("doesn't fire a change when people pick what's already picked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await page({ value: "es", nativeOnTouch: false, onChange });
      await user.click(trigger());
      await user.click(option("Spain"));
      await nextTick();
      await nextTick();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("ignores a press on a disabled option, which it marks with aria-disabled", async () => {
      const user = userEvent.setup();
      await page({ nativeOnTouch: false });
      await user.click(trigger());
      expect(option("Germany")).toHaveAttribute("aria-disabled", "true");
      await user.click(option("Germany"));
      expect(trigger()).toHaveAttribute("aria-expanded", "true");
      expect(submitted()).toEqual([]);
    });

    describe("keyboard", () => {
      it.each(["{ArrowDown}", "{Enter}", " "])("opens on %s and keeps what's highlighted", async (key) => {
        const user = userEvent.setup();
        await page({ value: "es", nativeOnTouch: false });
        await press(user, key);
        expect(trigger()).toHaveAttribute("aria-expanded", "true");
        expect(trigger()).toHaveAttribute("aria-activedescendant", option("Spain").id);
      });

      it("opens on ArrowUp and Home at the first option, and on End at the last", async () => {
        const user = userEvent.setup();
        await page({ value: "es", nativeOnTouch: false });
        await press(user, "{ArrowUp}");
        expect(trigger()).toHaveAttribute("aria-activedescendant", option("France").id);
        await press(user, "{Escape}");
        await press(user, "{End}");
        expect(trigger()).toHaveAttribute("aria-activedescendant", option("New Zealand").id);
      });

      it("skips disabled options and stops at the ends", async () => {
        const user = userEvent.setup();
        await page({ nativeOnTouch: false });
        await press(user, "{ArrowDown}");
        expect(option("France")).toHaveAttribute("data-active", "true");
        await press(user, "{ArrowDown}");
        expect(option("Spain")).toHaveAttribute("data-active", "true");
        await press(user, "{ArrowDown}{ArrowDown}{ArrowDown}");
        expect(option("New Zealand")).toHaveAttribute("data-active", "true");
        await press(user, "{Home}{ArrowUp}");
        expect(option("France")).toHaveAttribute("data-active", "true");
      });

      it("moves ten options with PageDown and PageUp, stopping at the ends", async () => {
        const user = userEvent.setup();
        await page({ nativeOnTouch: false });
        await press(user, "{ArrowDown}{PageDown}");
        expect(option("New Zealand")).toHaveAttribute("data-active", "true");
        await press(user, "{PageUp}");
        expect(option("France")).toHaveAttribute("data-active", "true");
      });

      it.each(["{Enter}", " "])("commits the highlighted option with %s and closes", async (key) => {
        const user = userEvent.setup();
        await page({ nativeOnTouch: false });
        await press(user, "{ArrowDown}{ArrowDown}");
        await press(user, key);
        expect(trigger()).toHaveAttribute("aria-expanded", "false");
        expect(trigger()).toHaveTextContent("Spain");
      });

      it("commits on Alt+ArrowUp and closes", async () => {
        const user = userEvent.setup();
        await page({ nativeOnTouch: false });
        await press(user, "{ArrowDown}{ArrowDown}");
        await press(user, "{Alt>}{ArrowUp}{/Alt}");
        expect(trigger()).toHaveAttribute("aria-expanded", "false");
        expect(trigger()).toHaveTextContent("Spain");
      });

      it("closes on Alt+ArrowUp with several values, keeping what's toggled", async () => {
        const user = userEvent.setup();
        await page({ multiple: true, nativeOnTouch: false });
        await press(user, "{ArrowDown}");
        await press(user, "{Alt>}{ArrowUp}{/Alt}");
        expect(trigger()).toHaveAttribute("aria-expanded", "false");
        expect(submitted()).toEqual([]);
      });

      it("commits the highlighted option on Tab and moves on", async () => {
        const user = userEvent.setup();
        await page({ nativeOnTouch: false });
        await press(user, "{ArrowDown}{ArrowDown}");
        await user.tab();
        await nextTick();
        expect(trigger()).toHaveAttribute("aria-expanded", "false");
        expect(trigger()).toHaveTextContent("Spain");
        expect(screen.getByRole("button", { name: "Reset" })).toHaveFocus();
      });

      it("closes on Escape without changing the value", async () => {
        const user = userEvent.setup();
        await page({ value: "fr", nativeOnTouch: false });
        await press(user, "{ArrowDown}{ArrowDown}{Escape}");
        expect(trigger()).toHaveAttribute("aria-expanded", "false");
        expect(trigger()).toHaveTextContent("France");
        expect(trigger()).toHaveFocus();
      });

      it("opens on a printable key and moves to the option that starts with it", async () => {
        const user = userEvent.setup();
        await page({ nativeOnTouch: false });
        await press(user, "s");
        expect(trigger()).toHaveAttribute("aria-expanded", "true");
        expect(option("Spain")).toHaveAttribute("data-active", "true");
      });

      it("matches what people typed in a row, spaces included, and skips disabled options", async () => {
        const user = userEvent.setup();
        await page({ nativeOnTouch: false });
        await press(user, "new z");
        expect(option("New Zealand")).toHaveAttribute("data-active", "true");
        expect(trigger()).toHaveAttribute("aria-expanded", "true");
      });

      it("skips a disabled option that starts with what people typed", async () => {
        const user = userEvent.setup();
        await page({ nativeOnTouch: false });
        await press(user, "g");
        expect(option("Germany")).not.toHaveAttribute("data-active");
      });

      it("cycles through options that start with one letter pressed again", async () => {
        const user = userEvent.setup();
        await page({ options: fruit, nativeOnTouch: false });
        await press(user, "l");
        expect(option("Lemon")).toHaveAttribute("data-active", "true");
        await press(user, "l");
        expect(option("Lime")).toHaveAttribute("data-active", "true");
      });

      it("forgets what people typed after half a second", async () => {
        vi.useFakeTimers();
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        await page({ nativeOnTouch: false });
        await press(user, "s");
        expect(option("Spain")).toHaveAttribute("data-active", "true");
        vi.advanceTimersByTime(501);
        await press(user, "f");
        expect(option("France")).toHaveAttribute("data-active", "true");
        vi.useRealTimers();
      });

      it("cancels the keyup of Space, so Firefox doesn't click what Space just opened", async () => {
        await page({ nativeOnTouch: false });
        const event = new KeyboardEvent("keyup", { key: " ", bubbles: true, cancelable: true });
        trigger().dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
      });
    });

    it("stops Escape, so a Dialog around it stays open", async () => {
      const user = userEvent.setup();
      const outside = vi.fn();
      render({
        render: () =>
          h("div", { onKeydown: outside }, [
            h(Dialog, { id: "shipping", title: "Shipping", open: true }, () =>
              h(Field, { label: "Country" }, () => h(Select, { id: "country", options: countries, nativeOnTouch: false })),
            ),
          ]),
      });
      await nextTick();
      const control = screen.getByRole("combobox", { name: "Country" });
      control.focus();
      await user.keyboard("{ArrowDown}");
      outside.mockClear();
      await user.keyboard("{Escape}");
      await nextTick();
      expect(control).toHaveAttribute("aria-expanded", "false");
      expect(document.querySelector("dialog")!.open).toBe(true);
      expect(outside).not.toHaveBeenCalled();
    });

    it("lists groups and separators the way a listbox allows", async () => {
      const user = userEvent.setup();
      await page({ options: fruit, nativeOnTouch: false });
      await user.click(trigger());
      const group = within(listbox()).getByRole("group", { name: "Citrus", hidden: true });
      expect(within(group).getAllByRole("option", { hidden: true })).toHaveLength(2);
      expect(listbox().querySelector('[data-slot="separator"]')).toHaveAttribute("role", "none");
    });

    it("names the listbox after the control", async () => {
      const user = userEvent.setup();
      await page({ nativeOnTouch: false });
      await user.click(trigger());
      expect(listbox()).toHaveAttribute("aria-label", "Country");
    });

    it("moves focus to the control the moment the browser focuses the hidden select", async () => {
      await page({ nativeOnTouch: false });
      native().focus();
      expect(document.activeElement).toBe(trigger());
    });

    it("takes in a value the browser filled into the hidden select, like autofill", async () => {
      const update = vi.fn();
      await page({ nativeOnTouch: false, "onUpdate:modelValue": update });
      native().value = "es";
      native().dispatchEvent(new Event("change", { bubbles: true }));
      expect(update).toHaveBeenCalledWith("es");
    });

    it("hides the select from assistive technologies and the tab order", async () => {
      await page({ nativeOnTouch: false });
      expect(native()).toHaveAttribute("tabindex", "-1");
      expect(native()).toHaveAttribute("aria-hidden", "true");
      expect(native()).toHaveAttribute("data-slot", "native");
    });
  });

  describe("several values", () => {
    const several = { multiple: true, nativeOnTouch: false };

    it("stays open while toggling, and marks the listbox multiselectable", async () => {
      const user = userEvent.setup();
      await page(several);
      await user.click(trigger());
      expect(listbox()).toHaveAttribute("aria-multiselectable", "true");
      await user.click(option("France"));
      await user.click(option("Spain"));
      expect(trigger()).toHaveAttribute("aria-expanded", "true");
      expect(submitted()).toEqual(["fr", "es"]);
    });

    it("toggles with Enter and Space, and keeps what's toggled on Tab", async () => {
      const user = userEvent.setup();
      await page(several);
      await press(user, "{ArrowDown}{Enter}{ArrowDown} ");
      expect(submitted()).toEqual(["fr", "es"]);
      await user.tab();
      await nextTick();
      expect(trigger()).toHaveAttribute("aria-expanded", "false");
      expect(submitted()).toEqual(["fr", "es"]);
    });

    it("lists the values in the options' order, whatever order they were picked in", async () => {
      const user = userEvent.setup();
      const update = vi.fn();
      await page({ ...several, "onUpdate:modelValue": update });
      await user.click(trigger());
      await user.click(option("Spain"));
      await user.click(option("France"));
      expect(update.mock.lastCall![0]).toEqual(["fr", "es"]);
    });

    it("reads the values out as the control's text", async () => {
      await page({ ...several, value: ["fr", "es"] });
      expect(trigger()).toHaveTextContent("France, Spain");
    });

    it("reads a count once there are too many to list", async () => {
      await page({ ...several, value: ["fr", "es", "nz", "de"] });
      expect(trigger()).toHaveTextContent("4 selected");
    });

    it("shows a chip per value, with a remove button named after it", async () => {
      await page({ ...several, value: ["fr", "es"] });
      expect(screen.getByRole("button", { name: "Remove France" })).toHaveAttribute("data-slot", "chip-remove");
      expect(screen.getByRole("button", { name: "Remove Spain" })).toBeInTheDocument();
    });

    it("removes by pointer, announces it and moves focus to the next remove button", async () => {
      const user = userEvent.setup();
      await page({ ...several, value: ["fr", "es", "nz"] });
      await user.click(screen.getByRole("button", { name: "Remove Spain" }));
      await nextTick();
      expect(submitted()).toEqual(["fr", "nz"]);
      expect(screen.getByRole("button", { name: "Remove New Zealand" })).toHaveFocus();
      expect(announcements()).toContain("Spain removed");
    });

    it("removes by keyboard, Tab then Enter on the remove button", async () => {
      const user = userEvent.setup();
      await page({ ...several, value: ["fr", "es"] });
      trigger().focus();
      await user.tab();
      expect(screen.getByRole("button", { name: "Remove France" })).toHaveFocus();
      await user.keyboard("{Enter}");
      await nextTick();
      expect(submitted()).toEqual(["es"]);
      expect(screen.getByRole("button", { name: "Remove Spain" })).toHaveFocus();
    });

    it("moves focus to the control when no remove button comes after the one pressed", async () => {
      const user = userEvent.setup();
      await page({ ...several, value: ["fr"] });
      await user.click(screen.getByRole("button", { name: "Remove France" }));
      await nextTick();
      expect(trigger()).toHaveFocus();
      expect(submitted()).toEqual([]);
    });

    it("removes the last value with Backspace on the closed control, keeping focus", async () => {
      const user = userEvent.setup();
      await page({ ...several, value: ["fr", "es"] });
      await press(user, "{Backspace}");
      expect(submitted()).toEqual(["fr"]);
      expect(trigger()).toHaveFocus();
      expect(announcements()).toContain("Spain removed");
    });

    it("fires one update, in the list's order, when a value is removed", async () => {
      const user = userEvent.setup();
      const value = ref(["es", "fr", "de"]);
      const update = vi.fn((next: unknown) => (value.value = next as string[]));
      render({
        render: () =>
          h(Field, { label: "Country" }, () =>
            h(Select, { id: "country", name: "country", multiple: true, options: countries, nativeOnTouch: false, modelValue: value.value, "onUpdate:modelValue": update }),
          ),
      });
      await nextTick();
      await user.click(screen.getByRole("button", { name: "Remove Germany" }));
      await nextTick();
      await nextTick();
      expect(update).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledWith(["fr", "es"]);
    });

    it("has no remove buttons while disabled or read-only", async () => {
      await page({ ...several, value: ["fr"], disabled: true });
      expect(screen.queryByRole("button", { name: "Remove France" })).toBeNull();
    });

    it("has no remove buttons while read-only, and Backspace does nothing", async () => {
      const user = userEvent.setup();
      await page({ multiple: true, readonly: true, value: ["fr"] });
      expect(screen.queryByRole("button", { name: "Remove France" })).toBeNull();
      await press(user, "{Backspace}");
      expect(submitted()).toEqual(["fr"]);
    });

    it("names the remove button and the announcement through its props", async () => {
      const user = userEvent.setup();
      await page({
        ...several,
        value: ["fr"],
        removeLabel: (label: string) => `Quitar ${label}`,
        removedLabel: (label: string) => `${label} quitado`,
      });
      await user.click(screen.getByRole("button", { name: "Quitar France" }));
      await nextTick();
      expect(announcements()).toContain("France quitado");
    });
  });

  // The same suite in both renderings, since a Select has to behave the same in each.
  describe.each([
    ["custom", false],
    ["native", true],
  ])("forms and the Field, in the %s rendering", (rendering, isCoarse) => {
    const active = () => (isCoarse ? native() : trigger());
    beforeEach(() => {
      coarse = isCoarse;
    });

    it("puts the id and ARIA on the active control, and marks it data-slot=control", async () => {
      await page({}, { hint: "Where it ships.", error: "Pick a country." });
      expect(active()).toHaveAttribute("id", "country");
      expect(active()).toHaveAttribute("data-slot", "control");
      expect(active()).toHaveAttribute("aria-invalid", "true");
      expect(active()).toHaveAttribute("aria-describedby", "country-hint country-error");
      const other = isCoarse ? document.querySelector('button[role="combobox"]')! : native();
      expect(other).not.toHaveAttribute("id");
      expect(other).not.toHaveAttribute("aria-invalid");
    });

    it("is named by the Field's label", async () => {
      await page();
      expect(screen.getByLabelText("Country")).toBe(active());
    });

    it("dims the label from the active control's disabled state", async () => {
      await page({}, { disabled: true });
      expect(active()).toBeDisabled();
      expect(active().matches('[data-slot="control"]:disabled')).toBe(true);
    });

    it("submits its value under its name", async () => {
      await page({ value: "es" });
      expect(native().value).toBe("es");
      expect(submitted()).toEqual(["es"]);
    });

    it("submits several values under its name", async () => {
      await page({ multiple: true, value: ["fr", "es"] });
      expect(submitted()).toEqual(["fr", "es"]);
    });

    it("follows the model", async () => {
      const value = ref("fr");
      render({ render: () => h("form", { "aria-label": "Shipping" }, [h(Field, { label: "Country" }, () => h(Select, { id: "country", name: "country", options: countries, modelValue: value.value }))]) });
      await nextTick();
      value.value = "es";
      await nextTick();
      expect(native().value).toBe("es");
      expect(submitted()).toEqual(["es"]);
    });

    it("goes back to its first value on reset, without a binding", async () => {
      const user = userEvent.setup();
      await page({ value: "fr" });
      await change(user, "es", "Spain", isCoarse);
      expect(native().value).toBe("es");
      await user.click(screen.getByRole("button", { name: "Reset" }));
      await waitFor(() => expect(native().value).toBe("fr"));
      expect(submitted()).toEqual(["fr"]);
      await waitFor(() => expect(active()).toSatisfy((el: HTMLElement) => isCoarse || el.textContent!.includes("France")));
    });

    it("goes back to its first value on reset, with a binding, and updates the model", async () => {
      const user = userEvent.setup();
      const value = ref("fr");
      render({
        render: () =>
          h("form", { "aria-label": "Shipping" }, [
            h(Field, { label: "Country" }, () =>
              h(Select, { id: "country", name: "country", options: countries, modelValue: value.value, "onUpdate:modelValue": (next: unknown) => (value.value = next as string) }),
            ),
            h("button", { type: "reset" }, "Reset"),
          ]),
      });
      await nextTick();
      await change(user, "es", "Spain", isCoarse);
      expect(value.value).toBe("es");
      await user.click(screen.getByRole("button", { name: "Reset" }));
      await waitFor(() => expect(value.value).toBe("fr"));
      expect(native().value).toBe("fr");
    });

    it("has the new value by the time a listener on it hears input and change", async () => {
      const user = userEvent.setup();
      const value = ref("fr");
      const heard: string[] = [];
      render({
        render: () =>
          h(Field, { label: "Country" }, () =>
            h(Select, {
              id: "country",
              name: "country",
              options: countries,
              modelValue: value.value,
              "onUpdate:modelValue": (next: unknown) => (value.value = next as string),
              onInput: () => heard.push(value.value),
              onChange: () => heard.push(value.value),
            }),
          ),
      });
      await nextTick();
      await change(user, "es", "Spain", isCoarse);
      expect(heard).toEqual(["es", "es"]);
    });

    it("goes back to several first values on reset", async () => {
      const user = userEvent.setup();
      await page({ multiple: true, value: ["fr", "es"] });
      if (isCoarse) {
        for (const item of Array.from(native().options)) item.selected = item.value === "nz";
        native().dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        await user.click(trigger());
        await user.click(option("New Zealand"));
        await user.keyboard("{Escape}");
      }
      await nextTick();
      expect(submitted()).not.toEqual(["fr", "es"]);
      await user.click(screen.getByRole("button", { name: "Reset" }));
      await waitFor(() => expect(submitted()).toEqual(["fr", "es"]));
    });

    describe.each([
      ["with a placeholder", "Choose a country"],
      ["without a placeholder", undefined],
    ])("empty, %s", (_, placeholder) => {
      it("starts with nothing picked and submits nothing", async () => {
        const update = vi.fn();
        await page({ placeholder, "onUpdate:modelValue": update });
        await nextTick();
        expect(native().value).toBe("");
        expect(submitted()).toEqual([]);
        expect(update).not.toHaveBeenCalled();
      });

      it("is missing a value when required", async () => {
        await page({ placeholder, required: true });
        expect(native().validity.valueMissing).toBe(true);
      });

      it("isn't missing a value once one is picked", async () => {
        await page({ placeholder, required: true, value: "fr" });
        expect(native().validity.valueMissing).toBe(false);
      });

      it("goes back to nothing on reset", async () => {
        const user = userEvent.setup();
        await page({ placeholder });
        await change(user, "es", "Spain", isCoarse);
        expect(native().value).toBe("es");
        await user.click(screen.getByRole("button", { name: "Reset" }));
        await waitFor(() => expect(native().value).toBe(""));
        expect(submitted()).toEqual([]);
      });

      it("has a disabled, hidden option that stands for nothing", async () => {
        await page({ placeholder });
        const first = native().options[0]!;
        expect(first.disabled).toBe(true);
        expect(first.hidden).toBe(true);
        expect(first.value).toBe("");
        expect(first.textContent).toBe(placeholder ?? "");
      });
    });

    it("has no option that stands for nothing with several values", async () => {
      await page({ multiple: true });
      expect(native().options[0]!.value).toBe("fr");
      expect(submitted()).toEqual([]);
    });

    it("lists the same options, with groups", async () => {
      await page({ options: fruit });
      expect(native().querySelector("optgroup")).toHaveAttribute("label", "Citrus");
      expect(Array.from(native().options).map((option) => option.value)).toEqual(["", "lemon", "lime", "apple"]);
      expect(native().querySelector("hr")).not.toBeNull();
    });

    it("leaves a disabled Select out of its form", async () => {
      await page({ value: "fr", disabled: true });
      expect(submitted()).toEqual([]);
    });

    it(`keeps quiet in the console in the ${rendering} rendering`, async () => {
      await page({ value: "fr" });
      await nextTick();
      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe("native rendering", () => {
    beforeEach(() => {
      coarse = true;
    });

    it("picks through the select and updates the model", async () => {
      const update = vi.fn();
      await page({ "onUpdate:modelValue": update });
      native().value = "es";
      native().dispatchEvent(new Event("change", { bubbles: true }));
      expect(update).toHaveBeenCalledWith("es");
    });

    it("reports several values as an array", async () => {
      const update = vi.fn();
      await page({ multiple: true, "onUpdate:modelValue": update });
      for (const option of Array.from(native().options)) option.selected = option.value !== "nz";
      native().dispatchEvent(new Event("change", { bubbles: true }));
      expect(update).toHaveBeenCalledWith(["fr", "de", "es"]);
    });

    it("leaves the select in the tab order and the accessibility tree", async () => {
      await page();
      expect(native()).not.toHaveAttribute("tabindex");
      expect(native()).not.toHaveAttribute("aria-hidden");
    });

    it("keeps focus on the select", async () => {
      await page();
      native().focus();
      expect(document.activeElement).toBe(native());
    });

    it("never opens the panel", async () => {
      const user = userEvent.setup();
      await page();
      document.querySelector<HTMLElement>('button[role="combobox"]')!.click();
      await user.keyboard("{Enter}");
      expect(document.querySelector('button[role="combobox"]')).toHaveAttribute("aria-expanded", "false");
    });

    it("moves to the custom rendering when the primary pointer changes", async () => {
      await page();
      coarse = false;
      mediaListeners.forEach((listener) => listener());
      await nextTick();
      expect(trigger()).toHaveAttribute("id", "country");
      expect(native()).toHaveAttribute("aria-hidden", "true");
    });

    it("turns the fallback off with nativeOnTouch false", async () => {
      await page({ nativeOnTouch: false });
      expect(trigger()).toHaveAttribute("id", "country");
      expect(document.querySelector(".select")).not.toHaveAttribute("data-native");
    });

    it("turns the fallback off while read-only, since nothing opens", async () => {
      await page({ readonly: true });
      expect(trigger()).toHaveAttribute("aria-readonly", "true");
      expect(document.querySelector(".select")).not.toHaveAttribute("data-native");
    });
  });

  describe("states", () => {
    it("disables both controls", async () => {
      await page({ disabled: true, nativeOnTouch: false });
      expect(trigger()).toBeDisabled();
      expect(native()).toBeDisabled();
    });

    it("doesn't open while read-only, and keeps its value in the form", async () => {
      const user = userEvent.setup();
      await page({ readonly: true, value: "fr" });
      await user.click(trigger());
      await press(user, "{ArrowDown}");
      expect(trigger()).toHaveAttribute("aria-expanded", "false");
      expect(submitted()).toEqual(["fr"]);
    });

    it("exposes required on the control", async () => {
      await page({ nativeOnTouch: false }, { required: true });
      expect(trigger()).toHaveAttribute("aria-required", "true");
      expect(native()).toBeRequired();
    });

    it("takes the Input's five sizes", async () => {
      await page({ size: "lg" });
      expect(document.querySelector(".select")).toHaveAttribute("data-size", "lg");
    });

    it("puts classes and styles on the root, which draws the field", async () => {
      await page({ class: "brand", nativeOnTouch: false });
      expect(document.querySelector(".select")).toHaveClass("brand");
      expect(trigger()).not.toHaveClass("brand");
    });

    it("keeps every part in the page while it's closed", async () => {
      await page({ value: "fr", nativeOnTouch: false });
      expect(listbox()).toBeInTheDocument();
      expect(listbox()).toHaveAttribute("popover", "auto");
    });

    it("derives every ID from the control's id", async () => {
      const user = userEvent.setup();
      await page({ options: fruit, nativeOnTouch: false });
      await user.click(trigger());
      expect(listbox()).toHaveAttribute("id", "country-panel");
      expect(option("Lemon")).toHaveAttribute("id", "country-option-0");
      expect(document.querySelector('[data-slot="group-label"]')).toHaveAttribute("id", "country-group-0");
    });

    it("marks the option with its state attributes", async () => {
      const user = userEvent.setup();
      await page({ value: "fr", nativeOnTouch: false });
      await user.click(trigger());
      expect(option("France")).toHaveAttribute("aria-selected", "true");
      expect(option("Spain")).toHaveAttribute("aria-selected", "false");
    });
  });

  describe("slots", () => {
    it("fills the value, option, chip, group label, separator, leading and arrow slots", async () => {
      const user = userEvent.setup();
      render({
        render: () =>
          h(Field, { label: "Country" }, () =>
            h(
              Select,
              { id: "country", options: fruit, multiple: true, value: ["apple"], nativeOnTouch: false },
              {
                leading: () => h("i", { "data-testid": "leading" }),
                arrow: () => h("i", { "data-testid": "arrow" }),
                value: ({ selected }: { selected: { label: string }[] }) => `Picked ${selected.length}`,
                option: ({ option }: { option: { label: string } }) => `Fruit: ${option.label}`,
                chip: ({ option }: { option: { label: string } }) => `Chip: ${option.label}`,
                "group-label": ({ label }: { label: string }) => `Group: ${label}`,
                separator: () => h("i", { "data-testid": "separator" }),
              },
            ),
          ),
      });
      await nextTick();
      await user.click(screen.getByRole("combobox", { name: "Country" }));
      expect(screen.getByRole("combobox", { name: "Country" })).toHaveTextContent("Picked 1");
      expect(screen.getByTestId("leading")).toBeInTheDocument();
      expect(screen.getByTestId("arrow")).toBeInTheDocument();
      expect(screen.getByTestId("separator")).toBeInTheDocument();
      expect(document.querySelector('[data-slot="chip"]')).toHaveTextContent("Chip: Apple");
      expect(document.querySelector('[data-slot="group-label"]')).toHaveTextContent("Group: Citrus");
      expect(within(listbox()).getByRole("option", { name: "Fruit: Lemon", hidden: true })).toBeInTheDocument();
    });
  });

  describe("placing the panel without CSS anchor positioning", () => {
    const place = async (field: Partial<DOMRect>, viewport: [number, number], natural: number) => {
      const user = userEvent.setup();
      vi.stubGlobal("CSS", { supports: () => false });
      await page({ nativeOnTouch: false });
      const root = document.querySelector<HTMLElement>(".select")!;
      vi.spyOn(root, "getBoundingClientRect").mockReturnValue({ width: 320, left: 0, top: 0, bottom: 0, ...field } as DOMRect);
      vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(viewport[0]);
      vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(viewport[1]);
      listbox().style.marginTop = "4px";
      vi.spyOn(listbox(), "offsetHeight", "get").mockReturnValue(natural);
      await user.click(trigger());
      await nextTick();
      return listbox().style;
    };
    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it("lines up with the field, under it, as wide as it", async () => {
      const style = await place({ left: 588, top: 432, bottom: 468 }, [1440, 900], 160);
      expect(style.left).toBe("588px");
      expect(style.top).toBe("468px");
      expect(style.width).toBe("320px");
      expect(style.maxHeight).toBe("");
    });

    it("flips above the field when there's no room below", async () => {
      const style = await place({ left: 20, top: 700, bottom: 736 }, [1440, 800], 160);
      expect(style.top).toBe(`${700 - 8 - 160}px`);
    });

    it("shrinks on the bigger side when it fits neither, and stays on screen", async () => {
      const style = await place({ left: 20, top: 114, bottom: 150, width: 400 }, [320, 256], 300);
      expect(style.maxHeight).toBe("106px");
      expect(style.top).toBe("0px");
      expect(style.left).toBe("20px");
      expect(style.width).toBe("288px");
    });

    it("stays on screen when the field runs past the edge", async () => {
      const style = await place({ left: 300, top: 100, bottom: 136, width: 300 }, [320, 800], 160);
      expect(style.left).toBe("32px");
    });
  });

  describe("server rendering", () => {
    it.each([
      ["coarse", true],
      ["fine", false],
    ])("hydrates without a mismatch on a %s pointer", async (_, isCoarse) => {
      coarse = isCoarse;
      const form = () =>
        h("form", [h(Field, { label: "Country" }, () => h(Select, { id: "country", name: "country", options: fruit, value: "lime", placeholder: "Pick" }))]);
      const host = document.createElement("div");
      host.innerHTML = await renderToString(createSSRApp({ render: form }));
      document.body.append(host);
      const error = vi.spyOn(console, "error");
      const app = createSSRApp({ render: form });
      app.mount(host);
      await nextTick();
      expect(warn.mock.calls.filter((call: unknown[]) => String(call[0]).includes("Hydration"))).toEqual([]);
      expect(error).not.toHaveBeenCalled();
      app.unmount();
      host.remove();
      error.mockRestore();
    });

    it("keeps a value picked after hydrating, where a new selected attribute selects an untouched option", async () => {
      coarse = true;
      const render = () => h("form", [h(Select, { id: "country", name: "country", "aria-label": "Country", options: countries })]);
      const host = document.createElement("div");
      host.innerHTML = await renderToString(createSSRApp({ render }));
      document.body.append(host);
      const app = createSSRApp({ render });
      app.mount(host);
      await nextTick();
      // A browser selects an option whose selectedness was never set when it gains the
      // `selected` attribute, and hydrating never sets it. jsdom marks them all as set.
      const defaultSelected = Object.getOwnPropertyDescriptor(HTMLOptionElement.prototype, "defaultSelected")!;
      Object.defineProperty(HTMLOptionElement.prototype, "defaultSelected", {
        ...defaultSelected,
        set(this: HTMLOptionElement, value: boolean) {
          const gaining = value && !this.hasAttribute("selected");
          defaultSelected.set!.call(this, value);
          if (gaining) this.selected = true;
        },
      });
      const el = host.querySelector("select")!;
      Array.from(el.options).find((item) => item.value === "es")!.selected = true;
      el.dispatchEvent(new Event("change", { bubbles: true }));
      await nextTick();
      Object.defineProperty(HTMLOptionElement.prototype, "defaultSelected", defaultSelected);
      expect(el.value).toBe("es");
      app.unmount();
      host.remove();
    });

    it("renders the attributes on the select in the server's markup, so a phone's label works before any script", async () => {
      const html = await renderToString(createSSRApp({ render: () => h(Select, { id: "country", name: "country", options: countries }) }));
      const host = document.createElement("div");
      host.innerHTML = html;
      expect(host.querySelector("select")).toHaveAttribute("id", "country");
      expect(host.querySelector("select")).toHaveAttribute("data-slot", "control");
      expect(host.querySelector("button")).not.toHaveAttribute("id");
    });

    it("selects the first value in the server's markup, so reset works without a script", async () => {
      const html = await renderToString(createSSRApp({ render: () => h(Select, { id: "country", name: "country", options: countries, value: "es" }) }));
      const host = document.createElement("div");
      host.innerHTML = html;
      expect(host.querySelector('option[value="es"]')).toHaveAttribute("selected");
    });
  });

  describe("development warnings", () => {
    it("warns when it has no accessible name", async () => {
      render({ render: () => h(Select, { id: "country", options: countries, nativeOnTouch: false }) });
      await nextTick();
      await nextTick();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());
    });

    it("warns when it has no id or name", async () => {
      render({ render: () => h(Select, { "aria-label": "Country", options: countries, nativeOnTouch: false }) });
      await nextTick();
      await nextTick();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("no id or name"), expect.anything());
    });
  });
});
```
:::
::

## Sources

- [WAI-ARIA Authoring Practices: Select-Only Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/), for the keyboard model, typeahead, focus staying on the control and the warning about support on touch devices
- [WAI-ARIA Authoring Practices: Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) and [Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), for the roles and the `aria-multiselectable` listbox
- [WAI-ARIA 1.2: combobox](https://www.w3.org/TR/wai-aria-1.2/#combobox), [listbox](https://www.w3.org/TR/wai-aria-1.2/#listbox) and [aria-activedescendant](https://www.w3.org/TR/wai-aria-1.2/#aria-activedescendant), for the attributes and what a listbox can hold
- [ARIA in HTML: button](https://www.w3.org/TR/html-aria/#el-button), for allowing `role="combobox"` on a `<button>`
- [HTML Accessibility API Mappings](https://www.w3.org/TR/html-aam-1.0/), for how `<select>` and `<option>` reach the accessibility tree
- [HTML Standard: the select element](https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element) and [the option element](https://html.spec.whatwg.org/multipage/form-elements.html#the-option-element), for the placeholder label option, default selectedness and reset, and for `<hr>` and `<optgroup>` in a list
- [HTML Standard: labelable elements](https://html.spec.whatwg.org/multipage/forms.html#category-label) and [interactive content](https://html.spec.whatwg.org/multipage/dom.html#interactive-content), for why a `<button>` can take a `<label for>` and can't hold the remove buttons
- [HTML Standard: the popover attribute](https://html.spec.whatwg.org/multipage/popover.html), for the top layer and light dismiss
- [Media Queries Level 4: pointer](https://www.w3.org/TR/mediaqueries-4/#pointer), for `pointer` reading the primary pointer and `any-pointer` reading any of them
- [CSS Anchor Positioning](https://www.w3.org/TR/css-anchor-position-1/), for placing the panel and flipping it
- MDN's browser compatibility data for [`position-area`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-area) (Chrome and Edge 129, Firefox 147, Safari 26)
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 4.1.2: Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html), for a combobox that has a name and a value
- [Understanding SC 4.1.3: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), for announcing a removed value
- [Understanding SC 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), for 24 × 24px targets, and [SC 2.5.5: Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), for 44px on touch screens
- [Understanding SC 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), for fitting a 320px screen
- [Open UI: Customizable Select](https://open-ui.org/components/customizableselect/) and MDN's [customizable select elements](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select) and [`appearance`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/appearance), for `appearance: base-select` and what it does on phones
- [web.dev: New to the web platform in September](https://web.dev/blog/web-platform-09-2026) and [caniuse: appearance base-select](https://caniuse.com/mdn-css_properties_appearance_base-select), for support in Chrome 135, Safari 27 and not yet in Firefox
- [Sarah Higley: `<select>` Your Poison](https://www.24a11y.com/2019/select-your-poison/), for the mapping of a native select to a combobox on Windows and a popup button on macOS, iOS and Android
- [GOV.UK Design System: Select](https://design-system.service.gov.uk/components/select/), for trying fewer options first, and for not preselecting an answer
- [Styleframe: Select](https://www.styleframe.dev/docs/theme/components/select), for the seven parts and what each one styles
- [Radix Primitives: Select](https://www.radix-ui.com/primitives/docs/components/select), for a trigger that's a `<button>` with the `combobox` role
- [React Aria: Select](https://react-spectrum.adobe.com/react-aria/Select.html), for a hidden native select that takes part in the form
- [Material UI: Select](https://mui.com/material-ui/react-select/), for offering the platform's native select on mobile
