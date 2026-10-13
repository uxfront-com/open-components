import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import Switch from "./Switch.vue";

const label = (id: string, text: string) => h("label", { for: id }, text);

describe("Switch", () => {
  it("is a native checkbox with the switch role, found by its role and its label", () => {
    render({ render: () => [label("wifi", "Wi-Fi"), h(Switch, { id: "wifi" })] });

    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(control.tagName).toBe("INPUT");
    expect(control).toHaveAttribute("type", "checkbox");
  });

  it("says whether it's on with checked, never aria-pressed, and keeps its name in both states", async () => {
    const user = userEvent.setup();
    render({ render: () => [label("wifi", "Wi-Fi"), h(Switch, { id: "wifi" })] });

    const control = screen.getByRole("switch", { name: "Wi-Fi", checked: false });
    await user.click(control);
    expect(screen.getByRole("switch", { name: "Wi-Fi", checked: true })).toBe(control);
    expect(control).not.toHaveAttribute("aria-pressed");
    expect(control).not.toHaveAttribute("aria-checked");
  });

  it("toggles with Space and with a click on its label, firing change each time", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render({ render: () => [label("wifi", "Wi-Fi"), h(Switch, { id: "wifi", onChange })] });

    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    await user.tab();
    expect(control).toHaveFocus();
    await user.keyboard(" ");
    expect(control).toBeChecked();
    await user.click(screen.getByText("Wi-Fi"));
    expect(control).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("binds checked with v-model, or keeps its own state without it", async () => {
    const user = userEvent.setup();
    const on = ref(true);
    render({
      render: () => [
        h(Switch, {
          "aria-label": "Bound",
          checked: on.value,
          "onUpdate:checked": (value: boolean) => (on.value = value),
        }),
        h(Switch, { "aria-label": "Unbound" }),
      ],
    });

    const bound = screen.getByRole("switch", { name: "Bound" });
    expect(bound).toBeChecked();
    await user.click(bound);
    expect(on.value).toBe(false);
    on.value = true;
    await nextTick();
    expect(bound).toBeChecked();

    const unbound = screen.getByRole("switch", { name: "Unbound" });
    await user.click(unbound);
    expect(unbound).toBeChecked();
  });

  it("is submitted with its form, by its name and value, only while it's on, bound or not", async () => {
    const user = userEvent.setup();
    const tips = ref(true);
    render({
      render: () =>
        h("form", [
          label("updates", "Product updates"),
          h(Switch, { id: "updates", name: "updates" }),
          label("tips", "Tips"),
          h(Switch, {
            id: "tips",
            name: "tips",
            value: "weekly",
            checked: tips.value,
            "onUpdate:checked": (value: boolean) => (tips.value = value),
          }),
        ]),
    });

    const updates = screen.getByRole("switch", { name: "Product updates" });
    const form = updates.closest("form")!;
    expect(new FormData(form).has("updates")).toBe(false);
    expect(new FormData(form).get("tips")).toBe("weekly");
    await user.click(updates);
    await user.click(screen.getByRole("switch", { name: "Tips" }));
    expect(new FormData(form).get("updates")).toBe("on");
    expect(new FormData(form).has("tips")).toBe(false);
  });

  it("puts attributes, listeners and refs on the input, and classes and styles on its root", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const instance = ref<ComponentPublicInstance<{ input: HTMLInputElement }>>();
    render({
      render: () => [
        label("wifi", "Wi-Fi"),
        h(Switch, { ref: instance, id: "wifi", class: "wifi", style: "--switch--track--width: 3rem", name: "wifi", value: "enabled", onFocus }),
      ],
    });

    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    await user.tab();
    expect(control).toHaveAttribute("name", "wifi");
    expect(control).toHaveAttribute("value", "enabled");
    expect(control).not.toHaveClass("wifi");
    expect(control.parentElement).toHaveClass("switch", "wifi");
    expect(control).not.toHaveAttribute("style");
    expect(control.parentElement).toHaveAttribute("style", "--switch--track--width: 3rem;");
    expect(onFocus).toHaveBeenCalled();
    expect(instance.value?.input).toBe(control);
  });

  it("can't be focused or toggled while disabled, and its form leaves it out", async () => {
    const user = userEvent.setup();
    render({
      render: () =>
        h("form", [label("sync", "Sync"), h(Switch, { id: "sync", name: "sync", checked: true, disabled: true })]),
    });

    const control = screen.getByRole("switch", { name: "Sync" });
    await user.tab();
    await user.click(control);
    expect(control).toBeDisabled();
    expect(control).not.toHaveFocus();
    expect(control).toBeChecked();
    expect(new FormData(control.closest("form")!).has("sync")).toBe(false);
  });

  it("can be focused but not flipped while read-only, says so, and its form still sends it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render({
      render: () =>
        h("form", [
          label("sso", "Single sign-on"),
          h(Switch, { id: "sso", name: "sso", checked: true, readonly: true, onChange }),
        ]),
    });

    const control = screen.getByRole("switch", { name: "Single sign-on" });
    expect(control).toHaveAttribute("aria-readonly", "true");
    await user.tab();
    expect(control).toHaveFocus();
    await user.keyboard(" ");
    await user.click(control);
    await user.click(screen.getByText("Single sign-on"));
    expect(control).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    expect(new FormData(control.closest("form")!).get("sso")).toBe("on");
  });

  it("passes aria-invalid and its error message to the input", () => {
    render({
      render: () => [
        label("alerts", "Price alerts"),
        h(Switch, { id: "alerts", "aria-invalid": "true", "aria-describedby": "alerts-error" }),
        h("p", { id: "alerts-error" }, "Couldn't turn on price alerts. Try again."),
      ],
    });

    const control = screen.getByRole("switch", { name: "Price alerts" });
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control).toHaveAccessibleDescription("Couldn't turn on price alerts. Try again.");
  });

  it("mirrors its size as a data attribute", () => {
    const { container } = render(Switch, { attrs: { "aria-label": "Wi-Fi" }, props: { size: "lg" } });

    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const options = { attrs: { "aria-label": "Wi-Fi" } };
    const first = render(Switch, options).container.innerHTML;
    const { container, rerender } = render(Switch, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.querySelectorAll("[data-slot]")].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["control", "track", "thumb"]);
    expect(root.querySelector('[data-slot="track"]')).toHaveAttribute("aria-hidden", "true");

    const input = root.querySelector("input");
    await rerender({ checked: true, disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect(root.querySelector("input")).toBe(input);
    expect(parts()).toEqual(["control", "track", "thumb"]);
  });

  it("warns in development when it has no label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Switch);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render({ render: () => [label("wifi", "Wi-Fi"), h(Switch, { id: "wifi" })] });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
