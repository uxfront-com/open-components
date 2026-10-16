import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import CheckboxGroup from "./CheckboxGroup.vue";

const options = [
  { value: "cheese", label: "Cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
];
const toppings = () => "Toppings";

describe("CheckboxGroup", () => {
  it("is a fieldset, named by its legend, with a native checkbox for each option", () => {
    render(CheckboxGroup, { props: { name: "toppings", options }, slots: { default: toppings } });

    const group = screen.getByRole("group", { name: "Toppings" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group.firstElementChild?.tagName).toBe("LEGEND");
    for (const { value, label } of options) {
      const checkbox = screen.getByRole("checkbox", { name: label });
      expect(checkbox.tagName).toBe("INPUT");
      expect(checkbox).toHaveAttribute("name", "toppings");
      expect(checkbox).toHaveAttribute("value", value);
      expect(group).toContainElement(checkbox);
    }
  });

  it("is described by its hint and its error, through aria-describedby on the fieldset", () => {
    render({
      render: () => [
        h(
          CheckboxGroup,
          { name: "toppings", options, "aria-invalid": "true", "aria-describedby": "toppings-hint toppings-error" },
          toppings,
        ),
        h("p", { id: "toppings-hint" }, "Pick as many as you like."),
        h("p", { id: "toppings-error" }, "Pick at least one topping"),
      ],
    });

    const group = screen.getByRole("group", { name: "Toppings" });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Pick as many as you like. Pick at least one topping");
    // The boxes look and read invalid along with the group, while the message stays on the group.
    for (const { label } of options) {
      expect(screen.getByRole("checkbox", { name: label })).toHaveAttribute("aria-invalid", "true");
    }
  });

  it("is submitted with its form as one name, with a value for each checked option", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () => h("form", [h(CheckboxGroup, { name: "toppings", options, selectAll: "All toppings" }, toppings)]),
    });

    const form = container.querySelector("form")!;
    expect([...new FormData(form)]).toEqual([]);
    await user.click(screen.getByRole("checkbox", { name: "Olives" }));
    await user.click(screen.getByRole("checkbox", { name: "Cheese" }));
    // In the options' order, and without the select-all box, which has no name.
    expect(new FormData(form).getAll("toppings")).toEqual(["cheese", "olives"]);
    expect([...new FormData(form)]).toHaveLength(2);
  });

  it("binds its value as a list with v-model, or keeps its own without it, starting from value", async () => {
    const user = userEvent.setup();
    const picked = ref<string[]>(["mushrooms"]);
    render({
      render: () => [
        h(
          CheckboxGroup,
          { name: "bound", options, value: picked.value, "onUpdate:value": (value: string[]) => (picked.value = value) },
          () => "Bound",
        ),
        h(CheckboxGroup, { name: "unbound", options: [{ value: "yes", label: "Unbound option" }], value: ["yes"] }, () => "Unbound"),
      ],
    });

    const bound = screen.getByRole("group", { name: "Bound" });
    const [cheese, mushrooms] = [...bound.querySelectorAll("input")];
    expect(mushrooms).toBeChecked();
    await user.click(cheese!);
    expect(picked.value).toEqual(["cheese", "mushrooms"]);
    picked.value = ["olives"];
    await nextTick();
    expect(cheese).not.toBeChecked();
    expect(mushrooms).not.toBeChecked();

    const unbound = screen.getByRole("checkbox", { name: "Unbound option" });
    expect(unbound).toBeChecked();
    await user.click(unbound);
    expect(unbound).not.toBeChecked();
  });

  it("keeps showing the value you hold when a bound change isn't taken", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(CheckboxGroup, {
      props: { name: "toppings", options, selectAll: "All toppings", value: ["cheese"], "onUpdate:value": onUpdate },
      slots: { default: toppings },
    });

    const cheese = screen.getByRole("checkbox", { name: "Cheese" });
    await user.click(cheese);
    expect(onUpdate).toHaveBeenCalledWith([]);
    await nextTick();
    expect(cheese).toBeChecked();

    const all = screen.getByRole("checkbox", { name: "All toppings" });
    await user.click(all);
    expect(onUpdate).toHaveBeenLastCalledWith(["cheese", "mushrooms", "olives"]);
    await nextTick();
    expect(all).toBePartiallyChecked();
    expect(screen.getByRole("checkbox", { name: "Olives" })).not.toBeChecked();
  });

  it("is reached with Tab one checkbox at a time, each toggled with Space, with no arrow keys", async () => {
    const user = userEvent.setup();
    render(CheckboxGroup, { props: { name: "toppings", options, selectAll: "All toppings" }, slots: { default: toppings } });

    for (const name of ["All toppings", "Cheese", "Mushrooms", "Olives"]) {
      await user.tab();
      expect(screen.getByRole("checkbox", { name })).toHaveFocus();
    }
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("checkbox", { name: "Olives" })).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("checkbox", { name: "Olives" })).toBeChecked();
    await user.tab({ shift: true });
    expect(screen.getByRole("checkbox", { name: "Mushrooms" })).toHaveFocus();
  });

  it("shows its select-all box checked, unchecked or mixed from its options, and checks or clears them all from it", async () => {
    const user = userEvent.setup();
    const picked = ref<string[]>([]);
    render({
      render: () =>
        h(
          CheckboxGroup,
          {
            name: "toppings",
            options,
            selectAll: "All toppings",
            value: picked.value,
            "onUpdate:value": (value: string[]) => (picked.value = value),
          },
          toppings,
        ),
    });

    const all = screen.getByRole<HTMLInputElement>("checkbox", { name: "All toppings" });
    expect(all).not.toBeChecked();
    expect(all).not.toBePartiallyChecked();

    await user.click(screen.getByRole("checkbox", { name: "Cheese" }));
    await nextTick();
    expect(all).toBePartiallyChecked();

    // From mixed, it checks every option, rather than going back to an earlier selection.
    await user.click(all);
    await nextTick();
    expect(picked.value).toEqual(["cheese", "mushrooms", "olives"]);
    expect(all).toBeChecked();
    expect(all).not.toBePartiallyChecked();

    // From checked, it clears them all.
    await user.click(all);
    await nextTick();
    expect(picked.value).toEqual([]);
    expect(all).not.toBeChecked();

    // From unchecked, it checks them all again.
    await user.click(all);
    await nextTick();
    expect(picked.value).toEqual(["cheese", "mushrooms", "olives"]);

    // And it follows the options, whichever way they change.
    picked.value = ["olives"];
    await nextTick();
    expect(all).toBePartiallyChecked();
    await user.click(screen.getByRole("checkbox", { name: "Olives" }));
    await nextTick();
    expect(all).not.toBeChecked();
    expect(all).not.toBePartiallyChecked();
  });

  it("can't be focused, changed or submitted while disabled, select-all box included", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () =>
        h("form", [
          h(
            CheckboxGroup,
            { name: "toppings", options, selectAll: "All toppings", value: ["cheese"], disabled: true },
            toppings,
          ),
        ]),
    });

    const group = screen.getByRole("group", { name: "Toppings" });
    expect(group).toBeDisabled();
    await user.tab();
    await user.click(screen.getByRole("checkbox", { name: "All toppings" }));
    await user.click(screen.getByText("Mushrooms"));
    expect(document.body).toHaveFocus();
    for (const checkbox of screen.getAllByRole("checkbox")) expect(checkbox).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Mushrooms" })).not.toBeChecked();
    expect([...new FormData(container.querySelector("form")!)]).toEqual([]);
  });

  it("puts attributes, listeners and refs on the fieldset", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const instance = ref<ComponentPublicInstance<{ fieldset: HTMLFieldSetElement }>>();
    render({
      render: () => h(CheckboxGroup, { ref: instance, id: "toppings", class: "toppings", name: "toppings", options, onChange }, toppings),
    });

    const group = screen.getByRole("group", { name: "Toppings" });
    expect(group).toHaveAttribute("id", "toppings");
    expect(group).toHaveClass("checkbox-group", "toppings");
    // Each checkbox's change bubbles up to the fieldset.
    await user.click(screen.getByRole("checkbox", { name: "Cheese" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(instance.value?.fieldset).toBe(group);
  });

  it("is vertical by default, and mirrors its size and orientation as data attributes, with its size on every checkbox", () => {
    const { container } = render(CheckboxGroup, { props: { name: "toppings", options }, slots: { default: toppings } });
    expect(container.firstElementChild).toHaveAttribute("data-orientation", "vertical");
    expect(container.firstElementChild).toHaveAttribute("data-size", "md");

    const { container: row } = render(CheckboxGroup, {
      props: { name: "toppings", options, size: "lg", orientation: "horizontal", selectAll: "All toppings" },
      slots: { default: toppings },
    });
    const root = row.firstElementChild!;
    expect(root).toHaveAttribute("data-orientation", "horizontal");
    expect(root).toHaveAttribute("data-size", "lg");
    for (const checkbox of root.querySelectorAll(".checkbox")) expect(checkbox).toHaveAttribute("data-size", "lg");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const props = { name: "toppings", options, selectAll: "All toppings" };
    const first = render(CheckboxGroup, { props, slots: { default: toppings } }).container.innerHTML;
    const { container, rerender } = render(CheckboxGroup, { props, slots: { default: toppings } });
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["legend", "select-all", "options"]);

    const inputs = [...root.querySelectorAll("input")];
    await rerender({ ...props, value: ["cheese"], disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect([...root.querySelectorAll("input")]).toEqual(inputs);
    expect(parts()).toEqual(["legend", "select-all", "options"]);
  });

  it("warns in development when it has no legend", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(CheckboxGroup, { props: { name: "toppings", options } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render(CheckboxGroup, { props: { name: "toppings", options }, slots: { default: toppings } });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
