import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import Checkbox from "./Checkbox.vue";

const terms = () => "I agree to the terms";

describe("Checkbox", () => {
  it("is a native checkbox, named by the label it wraps, and nothing else", () => {
    render(Checkbox, { slots: { default: terms } });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    expect(checkbox.tagName).toBe("INPUT");
    expect(checkbox).toHaveAttribute("type", "checkbox");
    expect(checkbox.closest("label")).toHaveClass("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("toggles when its label is clicked", async () => {
    const user = userEvent.setup();
    render(Checkbox, { slots: { default: terms } });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    await user.click(screen.getByText("I agree to the terms"));
    expect(checkbox).toBeChecked();
    await user.click(screen.getByText("I agree to the terms"));
    expect(checkbox).not.toBeChecked();
  });

  it("is reached with Tab and toggled with Space, but not with Enter", async () => {
    const user = userEvent.setup();
    render(Checkbox, { slots: { default: terms } });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    await user.tab();
    expect(checkbox).toHaveFocus();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
    await user.keyboard("{Enter}");
    expect(checkbox).toBeChecked();
    await user.keyboard(" ");
    expect(checkbox).not.toBeChecked();
  });

  it("is mixed while indeterminate, set as a property rather than an attribute, and clears on the first click", async () => {
    const user = userEvent.setup();
    const mixed = ref(true);
    render({
      render: () => [
        h(
          Checkbox,
          { indeterminate: mixed.value, "onUpdate:indeterminate": (value: boolean) => (mixed.value = value) },
          () => "Bound",
        ),
        h(Checkbox, { indeterminate: true }, () => "Unbound"),
      ],
    });

    for (const name of ["Bound", "Unbound"]) {
      const checkbox = screen.getByRole<HTMLInputElement>("checkbox", { name });
      expect(checkbox).toBePartiallyChecked();
      expect(checkbox.indeterminate).toBe(true);
      expect(checkbox).not.toHaveAttribute("indeterminate");

      await user.click(checkbox);
      await nextTick();
      expect(checkbox).not.toBePartiallyChecked();
      expect(checkbox).toBeChecked();
    }
    expect(mixed.value).toBe(false);

    // Worked out again from the options it stands for, it follows them after the first render too.
    const bound = screen.getByRole<HTMLInputElement>("checkbox", { name: "Bound" });
    mixed.value = true;
    await nextTick();
    expect(bound.indeterminate).toBe(true);
    expect(bound).toBePartiallyChecked();
    mixed.value = false;
    await nextTick();
    expect(bound.indeterminate).toBe(false);
    expect(bound).not.toBePartiallyChecked();
  });

  it("puts attributes, listeners and refs on the input, and classes on its root", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const instance = ref<ComponentPublicInstance<{ input: HTMLInputElement }>>();
    render({
      render: () =>
        h(Checkbox, { ref: instance, id: "updates", class: "updates", name: "updates", value: "weekly", onChange }, terms),
    });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("id", "updates");
    expect(checkbox).toHaveAttribute("name", "updates");
    expect(checkbox).not.toHaveClass("updates");
    expect(checkbox.closest("label")).toHaveClass("checkbox", "updates");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(instance.value?.input).toBe(checkbox);
  });

  it("is submitted with its form by its name and value while checked, and not at all while unchecked", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () =>
        h("form", [
          h(Checkbox, { name: "updates", value: "weekly" }, () => "Weekly updates"),
          h(Checkbox, { name: "terms" }, terms),
        ]),
    });

    const form = container.querySelector("form")!;
    expect([...new FormData(form)]).toEqual([]);
    await user.click(screen.getByRole("checkbox", { name: "Weekly updates" }));
    await user.click(screen.getByRole("checkbox", { name: "I agree to the terms" }));
    // Without a value, a checked box is sent as "on".
    expect([...new FormData(form)]).toEqual([
      ["updates", "weekly"],
      ["terms", "on"],
    ]);
  });

  it("binds checked with v-model, or keeps its own state without it, starting from checked", async () => {
    const user = userEvent.setup();
    const agreed = ref(false);
    const seen: boolean[] = [];
    render({
      render: () => [
        h(
          Checkbox,
          {
            checked: agreed.value,
            "onUpdate:checked": (value: boolean) => (agreed.value = value),
            onChange: () => seen.push(agreed.value),
          },
          () => "Bound",
        ),
        h(Checkbox, { checked: true }, () => "Unbound"),
      ],
    });

    const bound = screen.getByRole("checkbox", { name: "Bound" });
    await user.click(bound);
    expect(agreed.value).toBe(true);
    // A change listener of yours already sees the new state.
    expect(seen).toEqual([true]);
    agreed.value = false;
    await nextTick();
    expect(bound).not.toBeChecked();

    const unbound = screen.getByRole("checkbox", { name: "Unbound" });
    expect(unbound).toBeChecked();
    await user.click(unbound);
    expect(unbound).not.toBeChecked();
  });

  it("keeps showing the state you hold when a bound change isn't taken", async () => {
    const user = userEvent.setup();
    const onChecked = vi.fn();
    const onIndeterminate = vi.fn();
    render({
      render: () => [
        h(Checkbox, { checked: true, "onUpdate:checked": onChecked }, () => "Email"),
        h(Checkbox, { indeterminate: true, "onUpdate:indeterminate": onIndeterminate }, () => "Select all"),
      ],
    });

    const email = screen.getByRole("checkbox", { name: "Email" });
    await user.click(email);
    expect(onChecked).toHaveBeenCalledWith(false);
    await nextTick();
    expect(email).toBeChecked();

    const all = screen.getByRole("checkbox", { name: "Select all" });
    await user.click(all);
    expect(onIndeterminate).toHaveBeenCalledWith(false);
    await nextTick();
    expect(all).toBePartiallyChecked();
  });

  it("passes required, aria-invalid and its error message to the input", () => {
    render({
      render: () => [
        h(Checkbox, { required: true, "aria-invalid": "true", "aria-describedby": "terms-error" }, terms),
        h("p", { id: "terms-error" }, "Agree to the terms to create an account"),
      ],
    });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    expect(checkbox).toBeRequired();
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAccessibleDescription("Agree to the terms to create an account");
  });

  it("can't be focused, toggled or submitted while disabled, or inside a disabled fieldset", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () =>
        h("form", [
          h(Checkbox, { name: "terms", checked: true, disabled: true }, terms),
          h("fieldset", { disabled: true }, [h(Checkbox, { name: "updates" }, () => "Weekly updates")]),
        ]),
    });

    const own = screen.getByRole("checkbox", { name: "I agree to the terms" });
    const grouped = screen.getByRole("checkbox", { name: "Weekly updates" });
    await user.tab();
    await user.click(own);
    await user.click(screen.getByText("Weekly updates"));
    expect(own).toBeDisabled();
    expect(grouped).toBeDisabled();
    expect(document.body).toHaveFocus();
    expect(own).toBeChecked();
    expect(grouped).not.toBeChecked();
    expect([...new FormData(container.querySelector("form")!)]).toEqual([]);
  });

  it("can be focused and submitted while read-only, but a click, its label or Space never toggle it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render({
      render: () =>
        h("form", [
          h(Checkbox, { name: "updates", checked: true, readonly: true, onChange }, () => "Email me updates"),
          h(Checkbox, { name: "all", indeterminate: true, readonly: true }, () => "Select all"),
        ]),
    });

    const updates = screen.getByRole("checkbox", { name: "Email me updates" });
    const all = screen.getByRole("checkbox", { name: "Select all" });
    expect(updates).toHaveAttribute("aria-readonly", "true");
    // HTML ignores readonly on a checkbox, so it's never set.
    expect(updates).not.toHaveAttribute("readonly");

    await user.tab();
    expect(updates).toHaveFocus();
    await user.keyboard(" ");
    await user.click(updates);
    await user.click(screen.getByText("Email me updates"));
    expect(updates).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();

    await user.click(all);
    expect(all).toBePartiallyChecked();
    expect([...new FormData(container.querySelector("form")!)]).toEqual([["updates", "on"]]);
  });

  it("mirrors its size as a data attribute, and hides its indicator from assistive technologies", () => {
    const { container } = render(Checkbox, { props: { size: "lg" }, slots: { default: terms } });

    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
    expect(container.querySelector('[data-slot="indicator"]')).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const options = { slots: { default: terms } };
    const first = render(Checkbox, options).container.innerHTML;
    const { container, rerender } = render(Checkbox, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["box", "indicator", "label"]);

    const input = root.querySelector("input");
    await rerender({ checked: true, indeterminate: true, disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect(root.querySelector("input")).toBe(input);
    expect(parts()).toEqual(["box", "indicator", "label"]);
  });

  it("warns in development when it has no label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Checkbox);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render(Checkbox, { slots: { default: terms } });
    render(Checkbox, { attrs: { "aria-label": "Select Ada Lovelace" } });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
