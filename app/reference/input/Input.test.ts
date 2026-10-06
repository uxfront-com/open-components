import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import Input from "./Input.vue";

const icon = () => h("svg");
const label = (id: string, text: string) => h("label", { for: id }, text);

describe("Input", () => {
  it("is a native input, found by its role and its label", () => {
    render({ render: () => [label("email", "Email address"), h(Input, { id: "email", type: "email" })] });

    const input = screen.getByRole("textbox", { name: "Email address" });
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("type", "email");
  });

  it("is a searchbox with type search, and found by its label with type password", () => {
    render({
      render: () => [
        h(Input, { type: "search", "aria-label": "Search" }),
        label("password", "Password"),
        h(Input, { id: "password", type: "password" }),
      ],
    });

    expect(screen.getByRole("searchbox", { name: "Search" })).toBeInTheDocument();
    // ARIA has no role for a password input, so it's found by its label alone.
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("puts attributes, listeners and refs on the input, and classes on its root", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const instance = ref<ComponentPublicInstance<{ input: HTMLInputElement }>>();
    render({
      render: () => [
        label("postcode", "Postcode"),
        h(Input, { ref: instance, id: "postcode", class: "postcode", name: "postcode", autocomplete: "postal-code", onFocus }),
      ],
    });

    const input = screen.getByRole("textbox", { name: "Postcode" });
    await user.tab();
    expect(input).toHaveAttribute("name", "postcode");
    expect(input).toHaveAttribute("autocomplete", "postal-code");
    expect(input).not.toHaveClass("postcode");
    expect(input.parentElement).toHaveClass("input", "postcode");
    expect(onFocus).toHaveBeenCalled();
    expect(instance.value?.input).toBe(input);
  });

  it("binds its value with v-model, or keeps its own without it", async () => {
    const user = userEvent.setup();
    const email = ref("ada@");
    render({
      render: () => [
        h(Input, {
          "aria-label": "Bound",
          modelValue: email.value,
          "onUpdate:modelValue": (value: string | undefined) => (email.value = value ?? ""),
        }),
        h(Input, { "aria-label": "Unbound" }),
      ],
    });

    const bound = screen.getByRole("textbox", { name: "Bound" });
    await user.type(bound, "example.com");
    expect(email.value).toBe("ada@example.com");
    email.value = "";
    await nextTick();
    expect(bound).toHaveValue("");

    const unbound = screen.getByRole("textbox", { name: "Unbound" });
    await user.type(unbound, "Ada");
    expect(unbound).toHaveValue("Ada");
  });

  it("is submitted with its form, by its name, and submits it on Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render({
      render: () =>
        h("form", { onSubmit }, [
          label("email", "Email address"),
          h(Input, { id: "email", name: "email", type: "email" }),
          h("button", { type: "submit" }, "Subscribe"),
        ]),
    });

    await user.type(screen.getByRole("textbox", { name: "Email address" }), "ada@example.com{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const form = onSubmit.mock.calls[0]![0].target as HTMLFormElement;
    expect(new FormData(form).get("email")).toBe("ada@example.com");
  });

  it("keeps the browser's text editing keys, and lets people paste", async () => {
    const user = userEvent.setup();
    render({ render: () => [label("name", "Full name"), h(Input, { id: "name" })] });

    const input = screen.getByRole("textbox", { name: "Full name" });
    await user.tab();
    await user.keyboard("Lovelace{Home}Ada ");
    expect(input).toHaveValue("Ada Lovelace");

    await user.clear(input);
    await user.paste("Ada Lovelace");
    expect(input).toHaveValue("Ada Lovelace");
  });

  it("can't be focused or edited while disabled, and its form leaves it out", async () => {
    const user = userEvent.setup();
    render({
      render: () =>
        h("form", [
          label("username", "Username"),
          h(Input, { id: "username", name: "username", value: "ada", disabled: true }),
        ]),
    });

    const input = screen.getByRole("textbox", { name: "Username" });
    await user.tab();
    await user.type(input, "lovelace");
    expect(input).toBeDisabled();
    expect(input).not.toHaveFocus();
    expect(input).toHaveValue("ada");
    expect(new FormData(input.closest("form")!).has("username")).toBe(false);
  });

  it("passes aria-invalid and its error message to the input", () => {
    render({
      render: () => [
        label("email", "Email address"),
        h(Input, { id: "email", "aria-invalid": "true", "aria-describedby": "email-error" }),
        h("p", { id: "email-error" }, "Enter an email address, like name@example.com"),
      ],
    });

    const input = screen.getByRole("textbox", { name: "Email address" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter an email address, like name@example.com");
  });

  it("hides its prefix and suffix from assistive technologies, but not its actions", () => {
    const { container } = render(Input, {
      attrs: { "aria-label": "Price, in US dollars" },
      slots: { leading: () => "$", trailing: () => "USD", actions: () => h("button", "Clear") },
    });

    const part = (name: string) => container.querySelector(`[data-slot="${name}"]`);
    expect(part("leading")).toHaveAttribute("aria-hidden", "true");
    expect(part("trailing")).toHaveAttribute("aria-hidden", "true");
    expect(part("actions")).not.toHaveAttribute("aria-hidden");
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("reaches its actions with Tab, after the input", async () => {
    const user = userEvent.setup();
    render(Input, {
      attrs: { "aria-label": "Search" },
      props: { type: "search" },
      slots: { actions: () => h("button", { type: "button" }, "Clear search") },
    });

    await user.tab();
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Clear search" })).toHaveFocus();
  });

  it("focuses the input when its icons or padding are pressed, without a blur", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    const { container } = render(Input, {
      attrs: { "aria-label": "Search", onBlur },
      props: { type: "search" },
      slots: { leading: icon },
    });

    const input = screen.getByRole("searchbox", { name: "Search" });
    await user.click(container.querySelector('[data-slot="leading"]')!);
    expect(input).toHaveFocus();
    await user.click(container.querySelector(".input")!);
    expect(input).toHaveFocus();
    expect(onBlur).not.toHaveBeenCalled();
  });

  it("mirrors its size as a data attribute", () => {
    const { container } = render(Input, { attrs: { "aria-label": "Search" }, props: { size: "lg" } });

    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const options = {
      attrs: { "aria-label": "Price, in US dollars" },
      slots: { leading: () => "$", trailing: () => "USD", actions: () => h("button", "Clear") },
    };
    const first = render(Input, options).container.innerHTML;
    const { container, rerender } = render(Input, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["leading", "control", "trailing", "actions"]);

    const input = root.querySelector("input");
    await rerender({ disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect(root.querySelector("input")).toBe(input);
    expect(parts()).toEqual(["leading", "control", "trailing", "actions"]);
  });

  it("warns in development when it has no label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Input);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render({ render: () => [label("name", "Full name"), h(Input, { id: "name" })] });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
