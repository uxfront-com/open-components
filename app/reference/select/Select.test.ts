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
