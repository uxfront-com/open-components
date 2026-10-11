import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import Select from "./Select.vue";

const label = (id: string, text: string) => h("label", { for: id }, text);
const option = (value: string, text: string, attrs = {}) => h("option", { value, ...attrs }, text);
const countries = () => [option("fr", "France"), option("de", "Germany"), option("it", "Italy")];

describe("Select", () => {
  it("is a native select, found by its role and its label", () => {
    render({ render: () => [label("country", "Country"), h(Select, { id: "country" }, countries)] });

    const select = screen.getByRole("combobox", { name: "Country" });
    expect(select.tagName).toBe("SELECT");
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["France", "Germany", "Italy"]);
  });

  it("puts attributes, listeners and refs on the select, and classes on its root", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const instance = ref<ComponentPublicInstance<{ select: HTMLSelectElement }>>();
    render({
      render: () => [
        label("country", "Country"),
        h(Select, { ref: instance, id: "country", class: "country", name: "country", autocomplete: "country", onFocus }, countries),
      ],
    });

    const select = screen.getByRole("combobox", { name: "Country" });
    await user.tab();
    expect(select).toHaveAttribute("name", "country");
    expect(select).toHaveAttribute("autocomplete", "country");
    expect(select).not.toHaveClass("country");
    expect(select.parentElement).toHaveClass("select", "country");
    expect(onFocus).toHaveBeenCalled();
    expect(instance.value?.select).toBe(select);
  });

  it("updates its v-model when people choose an option", async () => {
    const user = userEvent.setup();
    const country = ref("fr");
    render({
      render: () => [
        label("country", "Country"),
        h(
          Select,
          { id: "country", modelValue: country.value, "onUpdate:modelValue": (value: string | undefined) => (country.value = value ?? "") },
          countries,
        ),
      ],
    });

    const select = screen.getByRole("combobox", { name: "Country" });
    expect(select).toHaveValue("fr");
    await user.selectOptions(select, "Italy");
    expect(country.value).toBe("it");
    country.value = "de";
    await nextTick();
    expect(select).toHaveValue("de");
  });

  it("keeps its own value without a model", async () => {
    const user = userEvent.setup();
    render({ render: () => [label("country", "Country"), h(Select, { id: "country" }, countries)] });

    const select = screen.getByRole("combobox", { name: "Country" });
    await user.selectOptions(select, "Germany");
    expect(select).toHaveValue("de");
  });

  it("starts on the option marked selected without a model, or on the first option, as a native select does", () => {
    render({
      render: () => [
        label("marked", "Marked"),
        h(Select, { id: "marked" }, () => [option("fr", "France"), option("de", "Germany", { selected: true })]),
        label("unmarked", "Unmarked"),
        h(Select, { id: "unmarked" }, countries),
      ],
    });

    expect(screen.getByRole("combobox", { name: "Marked" })).toHaveValue("de");
    expect(screen.getByRole("combobox", { name: "Unmarked" })).toHaveValue("fr");
  });

  it("keeps the bound option chosen when the options change after it mounts", async () => {
    const loaded = ref(false);
    render({
      render: () => [
        label("country", "Country"),
        // The options arrive after the value, as they do when they're fetched.
        h(Select, { id: "country", modelValue: "it" }, () => (loaded.value ? countries() : [option("", "Loading…")])),
      ],
    });

    loaded.value = true;
    await nextTick();
    expect(screen.getByRole("combobox", { name: "Country" })).toHaveValue("it");
  });

  it("is submitted with its form, by its name", async () => {
    const user = userEvent.setup();
    render({ render: () => h("form", [label("country", "Country"), h(Select, { id: "country", name: "country" }, countries)]) });

    const select = screen.getByRole("combobox", { name: "Country" });
    await user.selectOptions(select, "Germany");
    expect(new FormData(select.closest("form")!).get("country")).toBe("de");
  });

  it("never submits its form when people choose an option", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render({
      render: () =>
        h("form", { onSubmit }, [
          label("sort", "Sort by"),
          h(Select, { id: "sort", name: "sort" }, () => [option("new", "Newest"), option("old", "Oldest")]),
          h("button", { type: "submit" }, "Apply"),
        ]),
    });

    await user.selectOptions(screen.getByRole("combobox", { name: "Sort by" }), "Oldest");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("starts on its placeholder, an empty first option, which fails validation when it's required", async () => {
    const user = userEvent.setup();
    render({
      render: () => [label("country", "Country"), h(Select, { id: "country", required: true, placeholder: "Choose a country" }, countries)],
    });

    const select = screen.getByRole<HTMLSelectElement>("combobox", { name: "Country" });
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("Choose a country");
    expect(select).toHaveValue("");
    expect(select.checkValidity()).toBe(false);
    await user.selectOptions(select, "France");
    expect(select.checkValidity()).toBe(true);
  });

  it("goes back to its starting option when its form resets, and stays there, without a model", async () => {
    const user = userEvent.setup();
    const more = ref(false);
    render({
      render: () =>
        h("form", [
          label("country", "Country"),
          h(Select, { id: "country", name: "country" }, () => [
            option("fr", "France"),
            option("de", "Germany", { selected: true }),
            more.value && option("it", "Italy"),
          ]),
        ]),
    });

    const select = screen.getByRole("combobox", { name: "Country" });
    await user.selectOptions(select, "France");
    select.closest("form")!.reset();
    expect(select).toHaveValue("de");
    // A later render, like one for new options, keeps what the reset chose.
    more.value = true;
    await nextTick();
    expect(select).toHaveValue("de");
  });

  it("can't be focused or changed while disabled, and its form leaves it out", async () => {
    const user = userEvent.setup();
    render({ render: () => h("form", [label("country", "Country"), h(Select, { id: "country", name: "country", disabled: true }, countries)]) });

    const select = screen.getByRole("combobox", { name: "Country" });
    await user.tab();
    expect(select).toBeDisabled();
    expect(select).not.toHaveFocus();
    await user.selectOptions(select, "Italy");
    expect(select).toHaveValue("fr");
    expect(new FormData(select.closest("form")!).has("country")).toBe(false);
  });

  it("passes aria-invalid and its error message to the select", () => {
    render({
      render: () => [
        label("country", "Country"),
        h(Select, { id: "country", "aria-invalid": "true", "aria-describedby": "country-error" }, countries),
        h("p", { id: "country-error" }, "Choose the country you live in"),
      ],
    });

    const select = screen.getByRole("combobox", { name: "Country" });
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAccessibleDescription("Choose the country you live in");
  });

  it("hides its indicator from assistive technologies", () => {
    const { container } = render(Select, { attrs: { "aria-label": "Country" }, slots: { default: countries } });

    expect(container.querySelector('[data-slot="indicator"]')).toHaveAttribute("aria-hidden", "true");
  });

  it("mirrors its size as a data attribute", () => {
    const { container } = render(Select, { attrs: { "aria-label": "Country" }, props: { size: "lg" }, slots: { default: countries } });

    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const options = { attrs: { "aria-label": "Country" }, props: { placeholder: "Choose a country" }, slots: { default: countries } };
    const first = render(Select, options).container.innerHTML;
    const { container, rerender } = render(Select, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["control", "indicator"]);

    const select = root.querySelector("select");
    await rerender({ disabled: true, placeholder: "Choose a country" });
    expect(container.firstElementChild).toBe(root);
    expect(root.querySelector("select")).toBe(select);
    expect(parts()).toEqual(["control", "indicator"]);
  });

  it("warns in development when it has no label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Select, { slots: { default: countries } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render({ render: () => [label("country", "Country"), h(Select, { id: "country" }, countries)] });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
