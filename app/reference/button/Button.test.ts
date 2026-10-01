import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, ref, type ComponentPublicInstance } from "vue";
import Button from "./Button.vue";

const icon = () => h("svg");

describe("Button", () => {
  it("is a button, named by its label, that never submits by accident", () => {
    render(Button, { slots: { default: "Save changes" } });

    const button = screen.getByRole("button", { name: "Save changes" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("activates with a click, Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(Button, { props: { onClick }, slots: { default: "Save" } });

    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("activates a link with Enter, but not with Space, like any other link", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(Button, { props: { href: "#settings", onClick }, slots: { default: "Settings" } });

    await user.tab();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does nothing while disabled, and leaves the tab order", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(Button, { props: { onClick, disabled: true }, slots: { default: "Save" } });

    const button = screen.getByRole("button", { name: "Save" });
    await user.click(button);
    await user.tab();
    expect(button).toBeDisabled();
    expect(button).not.toHaveFocus();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("stays in the tab order when disabled, if asked to", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(Button, {
      props: { onClick, disabled: true, focusableWhenDisabled: true },
      slots: { default: "Save" },
    });

    const button = screen.getByRole("button", { name: "Save" });
    await user.tab();
    await user.keyboard("{Enter}");
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps its focus and name while loading, and can't be activated again", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(Button, { props: { onClick }, slots: { default: "Save" } });

    const button = screen.getByRole("button", { name: "Save" });
    await user.click(button);
    await rerender({ onClick, loading: true });
    await user.keyboard("{Enter}");
    await user.click(button);

    expect(button).toHaveFocus();
    expect(button).toHaveAccessibleName("Save");
    // Browsers move focus off a natively disabled button (jsdom doesn't).
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("announces that it's loading", async () => {
    const { rerender } = render(Button, {
      props: { loadingLabel: "Saving" },
      slots: { default: "Save" },
    });

    await rerender({ loadingLabel: "Saving", loading: true });
    expect(await screen.findByRole("status")).toHaveTextContent("Saving");
  });

  it("doesn't submit its form while loading, even on Enter in a field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render({
      render: () =>
        h("form", { onSubmit }, [
          h("input", { "aria-label": "Name" }),
          h(Button, { type: "submit", loading: true }, () => "Save"),
        ]),
    });

    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada{Enter}");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders a link for navigation, with no href while disabled", async () => {
    const { rerender } = render(Button, {
      props: { href: "/settings" },
      slots: { default: "Settings" },
    });

    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toHaveAttribute("href", "/settings");
    expect(link).not.toHaveAttribute("type");

    await rerender({ href: "/settings", disabled: true });
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
  });

  it("renders the button itself, so attributes, listeners and refs land on it", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const instance = ref<ComponentPublicInstance>();
    render({
      render: () => h(Button, { ref: instance, class: "pill", name: "intent", onFocus }, () => "Save"),
    });

    const button = screen.getByRole("button", { name: "Save" });
    await user.tab();
    expect(button).toHaveClass("button", "pill");
    expect(button).toHaveAttribute("name", "intent");
    expect(onFocus).toHaveBeenCalled();
    expect(instance.value?.$el).toBe(button);
  });

  it("names an icon-only button by its hidden label", () => {
    render(Button, { props: { label: "Settings", iconOnly: true }, slots: { leading: icon } });

    expect(screen.getByRole("button", { name: "Settings" })).toBeVisible();
  });

  it("hides its icons from assistive technologies, so they don't add to its name", () => {
    const titled = () => h("svg", [h("title", "Plus")]);
    render(Button, { slots: { default: "New project", leading: titled, trailing: titled } });

    expect(screen.getByRole("button", { name: "New project" })).toBeInTheDocument();
  });

  it("passes ARIA states through, for toggle and menu buttons", () => {
    render(Button, { attrs: { "aria-pressed": "true" }, slots: { default: "Mute" } });
    render(Button, {
      attrs: { "aria-haspopup": "menu", "aria-expanded": "true" },
      slots: { default: "Options" },
    });

    expect(screen.getByRole("button", { name: "Mute", pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Options", expanded: true })).toHaveAttribute(
      "aria-haspopup",
      "menu",
    );
  });

  it("mirrors its props as data attributes", () => {
    render(Button, {
      props: { variant: "soft", color: "primary", size: "lg" },
      slots: { default: "Save" },
    });

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("data-variant", "soft");
    expect(button).toHaveAttribute("data-color", "primary");
    expect(button).toHaveAttribute("data-size", "lg");
  });

  it("renders its parts in a fixed order, and keeps its element across states", async () => {
    const { rerender } = render(Button, {
      slots: { default: "Save", leading: icon, trailing: icon },
    });

    const button = screen.getByRole("button", { name: "Save" });
    const parts = () => [...button.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["leading", "label", "trailing"]);

    await rerender({ loading: true });
    expect(screen.getByRole("button", { name: "Save" })).toBe(button);
    expect(parts()).toEqual(["leading", "label", "trailing", "spinner"]);
  });

  it("warns in development when it has no accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Button, { slots: { leading: icon } });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());
    warn.mockRestore();
  });
});
