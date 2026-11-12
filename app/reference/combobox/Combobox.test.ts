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
