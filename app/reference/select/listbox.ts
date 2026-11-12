import { computed, type Ref } from "vue";

// What the Select and the Combobox share about their list: its items, how they're walked
// and where the panel goes. Both draw it with SelectPanel.vue, so neither keeps a copy.

export interface SelectOption {
  value: string;
  /** The text people read, and what typing searches. */
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

/** A group, a run of options outside any group, or a separator, which the panel draws in turn. */
export type Section = { separator?: true; label?: string; options: SelectOption[] };

export const isSeparator = (item: SelectItem): item is SelectSeparator => "separator" in item;
export const isGroup = (item: SelectItem): item is SelectGroup => "options" in item;

export function toSections(items: SelectItem[]) {
  const result: Section[] = [];
  for (const item of items) {
    if (isSeparator(item)) result.push({ separator: true, options: [] });
    else if (isGroup(item)) result.push({ label: item.label, options: item.options });
    else if (result.at(-1) && !result.at(-1)!.separator && result.at(-1)!.label === undefined) result.at(-1)!.options.push(item);
    else result.push({ options: [item] });
  }
  return result;
}

export interface ListboxOptions {
  /** What the panel shows. */
  items: () => SelectItem[];
  /** Every option, when the panel shows only some of them, so an option keeps its ID as the list narrows. */
  all?: () => SelectItem[];
  /** The control's `id`, or its `name`, which every ID in the panel starts with. */
  baseId: () => string | undefined;
  /** The highlighted option's index in what the panel shows. */
  active: Ref<number>;
}

export function useListbox({ items, all = items, baseId, active }: ListboxOptions) {
  const sections = computed(() => toSections(items()));
  const flat = computed(() => sections.value.flatMap((section) => section.options));
  const positions = computed(() => new Map(toSections(all()).flatMap((section) => section.options).map((option, index) => [option, index])));

  // IDs come from what you pass, rather than being made up, so the markup is the same on
  // the server, on the client and in every snapshot.
  const panelId = () => baseId() && `${baseId()}-panel`;
  const optionId = (option: SelectOption) => baseId() && `${baseId()}-option-${positions.value.get(option)}`;
  const groupId = (section: number) => baseId() && `${baseId()}-group-${section}`;

  const isEnabled = (index: number) => flat.value[index] !== undefined && !flat.value[index]!.disabled;
  // The nearest enabled option in a direction, or `from` at either end, since a listbox doesn't wrap.
  function step(from: number, by: 1 | -1) {
    for (let index = from + by; index >= 0 && index < flat.value.length; index += by) if (isEnabled(index)) return index;
    return from;
  }
  const firstEnabled = () => step(-1, 1);
  const lastEnabled = () => step(flat.value.length, -1);
  // PageDown and PageUp move ten options, stopping at either end.
  function jump(by: 1 | -1) {
    let index = active.value;
    for (let count = 0; count < 10; count++) index = step(index, by);
    return index;
  }

  return { sections, flat, panelId, optionId, groupId, isEnabled, step, firstEnabled, lastEnabled, jump };
}

export interface PlacementOptions {
  panel: () => HTMLElement | null | undefined;
  anchor: () => HTMLElement | null | undefined;
  /**
   * Fits the panel to the visual viewport while an on-screen keyboard shrinks it. CSS anchor
   * positioning works against the layout viewport, which the keyboard doesn't shrink, so the
   * panel takes the scripted path until the keyboard closes. Only a text field brings one up.
   */
  fitKeyboard?: boolean;
}

// CSS anchor positioning places the panel, where the browser has it. Elsewhere, place()
// does the same: as wide as the field, flipped when there's no room and kept on screen.
export const anchored = () => globalThis.CSS?.supports?.("position-area: top") ?? false;

export function usePlacement({ panel, anchor, fitKeyboard = false }: PlacementOptions) {
  // Whether an on-screen keyboard covers part of the page, which shrinks the visual viewport.
  const keyboardUp = () => fitKeyboard && !!window.visualViewport && window.visualViewport.height < window.innerHeight;
  const scripted = () => !anchored() || keyboardUp();

  function place() {
    const el = panel();
    const field = anchor();
    if (!el || !field) return;
    const keyboard = keyboardUp();
    // The data attribute turns CSS anchor positioning off, so the styles below take over.
    if (keyboard) el.dataset.fit = "visual";
    else delete el.dataset.fit;
    if (!keyboard && anchored()) {
      el.style.removeProperty("top");
      el.style.removeProperty("left");
      el.style.removeProperty("width");
      el.style.removeProperty("max-height");
      return;
    }
    const a = field.getBoundingClientRect();
    // Its margin is the gap, on the block sides only, which `top` places it outside of.
    const gap = parseFloat(getComputedStyle(el).marginTop) || 0;
    const { clientWidth, clientHeight } = document.documentElement;
    // The part of the page people can see: all of it, or what the keyboard leaves.
    const view = keyboard ? window.visualViewport! : undefined;
    const viewTop = view ? view.offsetTop : 0;
    const viewBottom = view ? view.offsetTop + view.height : clientHeight;
    const width = Math.min(a.width, clientWidth - 32);
    el.style.width = `${width}px`;
    el.style.maxHeight = "";
    const natural = el.offsetHeight;
    const below = viewBottom - a.bottom - 2 * gap;
    const above = a.top - viewTop - 2 * gap;
    // Under the field, or above it when there's no room, and when neither side has room,
    // shrunk on the bigger one, with its options scrolling.
    const under = natural <= below || (natural > above && below >= above);
    const height = Math.min(natural, Math.max(under ? below : above, 0));
    if (height < natural) el.style.maxHeight = `${height}px`;
    const top = under ? a.bottom : a.top - 2 * gap - height;
    el.style.left = `${Math.max(0, Math.min(a.left, clientWidth - width))}px`;
    el.style.top = `${Math.max(viewTop - gap, Math.min(top, viewBottom - height - gap))}px`;
  }

  // The scripted path follows the page as it scrolls and resizes, and the keyboard as it
  // opens and closes, while the panel is open.
  let listening = false;
  function listen(open: boolean) {
    const on = open && (scripted() || fitKeyboard);
    if (on === listening) return;
    listening = on;
    const method = on ? "addEventListener" : "removeEventListener";
    window[method]("scroll", place, { capture: true, passive: true } as AddEventListenerOptions);
    window[method]("resize", place);
    if (fitKeyboard) {
      window.visualViewport?.[method]("resize", place);
      window.visualViewport?.[method]("scroll", place);
    }
  }

  return { place, listen };
}
