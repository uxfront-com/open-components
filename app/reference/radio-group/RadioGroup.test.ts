import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import Radio from "./Radio.vue";
import RadioGroup from "./RadioGroup.vue";

const radios = (disabled?: string) =>
  ["Standard", "Express", "Next day"].map((label) =>
    h(Radio, { value: label.toLowerCase(), disabled: label === disabled }, () => label),
  );

describe("RadioGroup", () => {
  it("is a group of native radios in a fieldset, named by its legend", () => {
    render(RadioGroup, { props: { name: "delivery", legend: "Delivery" }, slots: { default: () => radios() } });

    const group = screen.getByRole("radiogroup", { name: "Delivery" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group).not.toHaveAttribute("aria-describedby");
    expect(group.firstElementChild?.tagName).toBe("LEGEND");
    // Named outright by its legend, rather than left to each browser's fieldset naming.
    expect(group).toHaveAttribute("aria-labelledby", "delivery-legend");
    expect(group.firstElementChild).toHaveAttribute("id", "delivery-legend");
    const standard = within(group).getByRole("radio", { name: "Standard" });
    expect(standard.tagName).toBe("INPUT");
    expect(within(group).getAllByRole("radio").map((radio) => radio.getAttribute("name"))).toEqual(["delivery", "delivery", "delivery"]);
  });

  it("enters once with Tab, on the checked radio, and leaves on the next Tab", async () => {
    const user = userEvent.setup();
    render({
      render: () => [
        h(RadioGroup, { name: "delivery", legend: "Delivery", modelValue: "express" }, () => radios()),
        h("button", "Continue"),
      ],
    });

    await user.tab();
    expect(screen.getByRole("radio", { name: "Express" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Continue" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("radio", { name: "Express" })).toHaveFocus();
  });

  it("enters on the first radio with Tab when none is checked", async () => {
    const user = userEvent.setup();
    render(RadioGroup, { props: { name: "delivery", legend: "Delivery" }, slots: { default: () => radios() } });

    await user.tab();
    expect(screen.getByRole("radio", { name: "Standard" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Standard" })).not.toBeChecked();
  });

  it("moves, selects and wraps with the arrow keys", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(RadioGroup, {
      props: { name: "delivery", legend: "Delivery", modelValue: "standard", "onUpdate:modelValue": onUpdate },
      slots: { default: () => radios() },
    });
    const radio = (name: string) => screen.getByRole("radio", { name });

    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(radio("Express")).toHaveFocus();
    expect(radio("Express")).toBeChecked();
    await user.keyboard("{ArrowRight}");
    expect(radio("Next day")).toBeChecked();
    await user.keyboard("{ArrowDown}");
    expect(radio("Standard")).toHaveFocus();
    expect(radio("Standard")).toBeChecked();
    await user.keyboard("{ArrowUp}");
    expect(radio("Next day")).toBeChecked();
    await user.keyboard("{ArrowLeft}");
    expect(radio("Express")).toBeChecked();
    expect(radio("Next day")).not.toBeChecked();
    expect(onUpdate.mock.calls.map(([value]) => value)).toEqual(["express", "next day", "standard", "next day", "express"]);
  });

  it("selects the focused radio with Space", async () => {
    const user = userEvent.setup();
    render(RadioGroup, { props: { name: "delivery", legend: "Delivery" }, slots: { default: () => radios() } });

    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Standard" })).toBeChecked();
  });

  it("selects a radio when its label is pressed", async () => {
    const user = userEvent.setup();
    render(RadioGroup, { props: { name: "delivery", legend: "Delivery" }, slots: { default: () => radios() } });

    await user.click(screen.getByText("Next day"));
    expect(screen.getByRole("radio", { name: "Next day" })).toBeChecked();
  });

  it("skips a disabled radio with the arrow keys, and leaves it out of the form", async () => {
    const user = userEvent.setup();
    render({
      render: () =>
        h("form", [h(RadioGroup, { name: "delivery", legend: "Delivery", modelValue: "standard" }, () => radios("Express"))]),
    });

    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Express" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Next day" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Next day" })).toBeChecked();
    await user.click(screen.getByText("Express"));
    expect(screen.getByRole("radio", { name: "Express" })).not.toBeChecked();
  });

  it("disables every radio while the group is disabled, and its form leaves them out", async () => {
    const user = userEvent.setup();
    render({
      render: () =>
        h("form", [
          h(RadioGroup, { name: "delivery", legend: "Delivery", modelValue: "standard", disabled: true }, () => radios()),
        ]),
    });

    await user.tab();
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
      expect(radio).not.toHaveFocus();
    }
    expect(new FormData(screen.getByRole("radiogroup").closest("form")!).has("delivery")).toBe(false);
  });

  it("submits the checked value with its form, under its name", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render({
      render: () =>
        h("form", { onSubmit }, [
          h(RadioGroup, { name: "delivery", legend: "Delivery" }, () => radios()),
          h("button", { type: "submit" }, "Continue"),
        ]),
    });

    await user.click(screen.getByRole("radio", { name: "Express" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    const form = onSubmit.mock.calls[0]![0].target as HTMLFormElement;
    expect(new FormData(form).get("delivery")).toBe("express");
  });

  it("marks every radio required while the group is, so its form can't be sent without one", () => {
    render({
      render: () => h("form", [h(RadioGroup, { name: "delivery", legend: "Delivery", required: true }, () => radios())]),
    });

    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeRequired();
    expect(screen.getByRole("radiogroup").closest("form")!.checkValidity()).toBe(false);
  });

  it("binds its value with v-model, both ways", async () => {
    const user = userEvent.setup();
    const delivery = ref<string | undefined>("standard");
    render({
      render: () =>
        h(
          RadioGroup,
          {
            name: "delivery",
            legend: "Delivery",
            modelValue: delivery.value,
            "onUpdate:modelValue": (value: string | undefined) => (delivery.value = value),
          },
          () => radios(),
        ),
    });

    expect(screen.getByRole("radio", { name: "Standard" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "Next day" }));
    expect(delivery.value).toBe("next day");

    delivery.value = "express";
    await nextTick();
    expect(screen.getByRole("radio", { name: "Express" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Next day" })).not.toBeChecked();
  });

  it("hands the group the value of a radio given checked, when it has none, so its value and its form agree", async () => {
    const user = userEvent.setup();
    const delivery = ref<string>();
    const rows = () => [
      h(Radio, { value: "standard", checked: true }, () => "Standard"),
      h(Radio, { value: "express" }, () => "Express"),
    ];
    render({
      render: () => [
        h(RadioGroup, { name: "delivery", legend: "Delivery" }, rows),
        h(
          RadioGroup,
          {
            name: "shipping",
            legend: "Shipping",
            modelValue: delivery.value,
            "onUpdate:modelValue": (value: string | undefined) => (delivery.value = value),
          },
          rows,
        ),
      ],
    });
    const [ownStandard, ownExpress, boundStandard, boundExpress] = screen.getAllByRole("radio");

    expect(ownStandard).toBeChecked();
    await user.click(ownExpress!);
    expect(ownExpress).toBeChecked();
    expect(ownStandard).not.toBeChecked();

    expect(boundStandard).toBeChecked();
    expect(delivery.value).toBe("standard");
    delivery.value = "express";
    await nextTick();
    expect(boundExpress).toBeChecked();
    expect(boundStandard).not.toBeChecked();
    delivery.value = "standard";
    await nextTick();
    expect(boundStandard).toBeChecked();
    expect(boundExpress).not.toBeChecked();
    delivery.value = undefined;
    await nextTick();
    expect(boundStandard).not.toBeChecked();
  });

  it("keeps its own value without v-model", async () => {
    const user = userEvent.setup();
    render(RadioGroup, { props: { name: "delivery", legend: "Delivery" }, slots: { default: () => radios() } });

    await user.click(screen.getByRole("radio", { name: "Express" }));
    await user.click(screen.getByRole("radio", { name: "Standard" }));
    expect(screen.getByRole("radio", { name: "Standard" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Express" })).not.toBeChecked();
  });

  it("describes the group with its hint, and with its error, which makes it invalid, only while it has one", async () => {
    const { rerender } = render(RadioGroup, {
      props: { name: "delivery", legend: "Delivery", hint: "Express arrives the next working day" },
      slots: { default: () => radios() },
    });

    const group = screen.getByRole("radiogroup", { name: "Delivery" });
    expect(group).toHaveAttribute("aria-describedby", "delivery-hint");
    expect(group).toHaveAccessibleDescription("Express arrives the next working day");
    expect(group).not.toHaveAttribute("aria-invalid");

    await rerender({ error: "Choose how you'd like your order delivered" });
    expect(screen.getByRole("radiogroup", { name: "Delivery" })).toBe(group);
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-describedby", "delivery-hint delivery-error");
    expect(group).toHaveAccessibleDescription("Express arrives the next working day Choose how you'd like your order delivered");
    for (const radio of screen.getAllByRole("radio")) expect(radio).not.toHaveAttribute("aria-invalid");

    await rerender({ error: undefined });
    expect(group).not.toHaveAttribute("aria-invalid");
    expect(group).toHaveAccessibleDescription("Express arrives the next working day");
  });

  it("puts the group's attributes on its fieldset, and a radio's on its input, with its classes on its root", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const instance = ref<ComponentPublicInstance<{ input: HTMLInputElement }>>();
    render(RadioGroup, {
      props: { name: "delivery", legend: "Delivery" },
      attrs: { class: "delivery", "data-testid": "delivery" },
      slots: {
        default: () =>
          h(Radio, { ref: instance, value: "standard", class: "standard", "aria-describedby": "standard-hint", onFocus }, () => "Standard"),
      },
    });

    const group = screen.getByRole("radiogroup", { name: "Delivery" });
    expect(group).toHaveClass("radio-group", "delivery");
    expect(group).toHaveAttribute("data-testid", "delivery");

    const radio = screen.getByRole("radio", { name: "Standard" });
    await user.tab();
    expect(radio).toHaveAttribute("aria-describedby", "standard-hint");
    expect(radio).not.toHaveClass("standard");
    expect(radio.closest("label")).toHaveClass("radio", "standard");
    expect(onFocus).toHaveBeenCalled();
    expect(instance.value?.input).toBe(radio);
  });

  it("mirrors its size as a data attribute, on the group and on every radio", () => {
    const { container } = render(RadioGroup, {
      props: { name: "delivery", legend: "Delivery", size: "lg" },
      slots: { default: () => radios() },
    });

    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
    for (const radio of container.querySelectorAll(".radio")) expect(radio).toHaveAttribute("data-size", "lg");
  });

  it("mirrors its orientation as a data attribute, keeps its radios in their own part, and never sets aria-orientation", async () => {
    const { rerender } = render(RadioGroup, {
      props: { name: "contact", legend: "Can we contact you?", hint: "We only call about your order" },
      slots: {
        default: () => [h(Radio, { value: "yes" }, () => "Yes"), h(Radio, { value: "no" }, () => "No")],
      },
    });

    const group = screen.getByRole("radiogroup", { name: "Can we contact you?" });
    expect(group).toHaveAttribute("data-orientation", "vertical");
    await rerender({ orientation: "horizontal" });
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).not.toHaveAttribute("aria-orientation");
    // The radios sit in a box of their own, so a row of them leaves the hint above.
    const options = group.querySelector('[data-slot="options"]')!;
    expect(within(options as HTMLElement).getAllByRole("radio")).toHaveLength(2);
    expect(options.contains(screen.getByText("We only call about your order"))).toBe(false);
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const options = {
      props: { name: "delivery", legend: "Delivery", hint: "Express arrives the next working day" },
      slots: { default: () => radios() },
    };
    const first = render(RadioGroup, options).container.innerHTML;
    const { container, rerender } = render(RadioGroup, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["legend", "hint", "options"]);
    const box = root.querySelector('[data-slot="options"]')!;
    expect([...box.children].map((part) => part.getAttribute("data-slot"))).toEqual(["radio", "radio", "radio"]);
    const radio = root.querySelector(".radio")!;
    expect([...radio.children].map((part) => part.getAttribute("data-slot"))).toEqual(["control", "label"]);

    const inputs = [...root.querySelectorAll("input")];
    await rerender({ error: "Choose how you'd like your order delivered", disabled: true, modelValue: "express" });
    expect(container.firstElementChild).toBe(root);
    expect([...root.querySelectorAll("input")]).toEqual(inputs);
    expect(parts()).toEqual(["legend", "hint", "error", "options"]);
  });

  it("warns in development when the group has no legend, or a radio has no group", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(RadioGroup, { props: { name: "delivery", legend: "" }, slots: { default: () => radios() } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no legend"), expect.anything());

    warn.mockClear();
    render(Radio, { props: { value: "standard" }, slots: { default: () => "Standard" } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("outside a RadioGroup"), expect.anything());

    warn.mockClear();
    render(RadioGroup, { props: { name: "delivery", legend: "Delivery" }, slots: { default: () => radios() } });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
