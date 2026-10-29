import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import Checkbox from "../checkbox/Checkbox.vue";
import CheckboxGroup from "../checkbox-group/CheckboxGroup.vue";
import Input from "../input/Input.vue";
import Radio from "../radio-group/Radio.vue";
import RadioGroup from "../radio-group/RadioGroup.vue";
import Switch from "../switch/Switch.vue";
import Textarea from "../textarea/Textarea.vue";
import Field from "./Field.vue";

const parts = (root: Element) => [...root.children].map((part) => part.getAttribute("data-slot") ?? part.className);

// Each element with its attributes, which the server and the client write in different orders.
const markup = (root: Element) =>
  [...root.querySelectorAll("*")].map((element) =>
    [element.tagName, ...[...element.attributes].map(({ name, value }) => `${name}="${value}"`).sort()].join(" "),
  );

const options = [
  { value: "email", label: "Email" },
  { value: "sms", label: "Text message" },
];
const radios = () => ["Standard", "Express"].map((label) => h(Radio, { value: label.toLowerCase() }, () => label));

describe("Field", () => {
  it("names a text control with its label, and describes it with its hint", () => {
    render(Field, {
      props: { id: "phone", label: "Phone number", hint: "Include the country code" },
      slots: { default: () => h(Input, { type: "tel" }) },
    });

    const input = screen.getByRole("textbox", { name: "Phone number" });
    expect(input).toHaveAttribute("id", "phone");
    expect(input).toHaveAccessibleDescription("Include the country code");
    expect(input).toHaveAttribute("aria-describedby", "phone-hint");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("puts the label, the hint, the control and the error in that order around a text control", () => {
    const { container } = render(Field, {
      props: { id: "email", label: "Email address", hint: "We'll only use it for receipts", error: "Enter an email address" },
      slots: { default: () => h(Input, { type: "email" }) },
    });

    expect(parts(container.firstElementChild!)).toEqual(["label", "hint", "input", "error"]);
  });

  it("takes the control's id from its own id, else the control's id, else its name, and builds the hint's and error's from it", () => {
    const ids = (props: Record<string, string>, control: Record<string, string>) => {
      const { unmount } = render(Field, {
        props: { label: "Name", hint: "As on your card", error: "Enter your name", ...props },
        slots: { default: () => h(Input, control) },
      });
      const input = screen.getByRole("textbox", { name: "Name" });
      const result = [input.id, input.getAttribute("aria-describedby")];
      unmount();
      return result;
    };

    expect(ids({ id: "field" }, { id: "own", name: "full-name" })).toEqual(["field", "field-hint field-error"]);
    expect(ids({}, { id: "own", name: "full-name" })).toEqual(["own", "own-hint own-error"]);
    expect(ids({}, { name: "full-name" })).toEqual(["full-name", "full-name-hint full-name-error"]);
  });

  it("describes the control with its hint, then its error, which makes it invalid, only while it has one", async () => {
    const { rerender } = render(Field, {
      props: { id: "email", label: "Email address", hint: "We'll only use it for receipts" },
      slots: { default: () => h(Input, { type: "email" }) },
    });
    const input = screen.getByRole("textbox", { name: "Email address" });

    await rerender({ error: "Enter an email address in the correct format, like name@example.com" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-hint email-error");
    expect(input).toHaveAccessibleDescription(
      "We'll only use it for receipts Enter an email address in the correct format, like name@example.com",
    );
    // Read when people reach the control, rather than announced as it appears.
    expect(screen.getByText(/correct format/)).not.toHaveAttribute("aria-live");
    expect(screen.queryByRole("alert")).toBeNull();

    await rerender({ error: undefined });
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toHaveAttribute("aria-describedby", "email-hint");
    expect(screen.queryByText(/correct format/)).toBeNull();
  });

  it("keeps a description of the control's own after its hint and error", () => {
    render(Field, {
      props: { id: "email", label: "Email address", error: "Enter an email address" },
      slots: { default: () => h(Input, { "aria-describedby": "email-privacy" }) },
    });

    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveAttribute("aria-describedby", "email-error email-privacy");
  });

  it("keeps an aria-invalid set on the control while it has no error of its own", async () => {
    const { rerender } = render(Field, {
      props: { id: "code", label: "Discount code" },
      slots: { default: () => h(Input, { "aria-invalid": "true" }) },
    });
    const input = screen.getByRole("textbox", { name: "Discount code" });
    expect(input).toHaveAttribute("aria-invalid", "true");

    await rerender({ error: "Enter a code that hasn't expired" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a code that hasn't expired");
  });

  it("puts a Textarea's count after the hint and the error, and lets it stay invalid over its limit without one", async () => {
    const { rerender } = render(Field, {
      props: { id: "bio", label: "Bio", hint: "A sentence or two", error: "Tell us a little about yourself" },
      slots: { default: () => h(Textarea, { limit: 5, value: "Too long" }) },
    });

    const textarea = screen.getByRole("textbox", { name: "Bio" });
    expect(textarea).toHaveAttribute("aria-describedby", "bio-hint bio-error bio-count");

    await rerender({ error: undefined });
    expect(textarea).toHaveAttribute("aria-describedby", "bio-hint bio-count");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("sets the control's native required and disabled", async () => {
    const user = userEvent.setup();
    render(Field, {
      props: { id: "name", label: "Full name", required: true, disabled: true },
      slots: { default: () => h(Input) },
    });

    const input = screen.getByRole("textbox", { name: "Full name" });
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
    await user.tab();
    expect(input).not.toHaveFocus();
  });

  it("focuses the control when its label is pressed", async () => {
    const user = userEvent.setup();
    render(Field, { props: { id: "name", label: "Full name" }, slots: { default: () => h(Input) } });

    await user.click(screen.getByText("Full name"));
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveFocus();
  });

  it("labels a native select, textarea or text input as a text control", () => {
    render(Field, {
      props: { id: "country", label: "Country", hint: "Where you live", size: "lg" },
      slots: { default: () => h("select", [h("option", "Ireland"), h("option", "Portugal")]) },
    });

    const select = screen.getByRole("combobox", { name: "Country" });
    expect(select).toHaveAccessibleDescription("Where you live");
    expect(select).not.toHaveAttribute("size");
    expect(select.closest(".field")).toHaveAttribute("data-control", "text");
  });

  it("gives a Checkbox no second label, even with a label of its own, and describes it with the hint and error after it", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(Field, {
      props: {
        id: "terms",
        label: "Terms",
        hint: "You can read them before you sign up",
        error: "Agree to the terms to continue",
        required: true,
      },
      slots: { default: () => h(Checkbox, () => "I agree to the terms") },
    });

    const box = screen.getByRole("checkbox", { name: "I agree to the terms" });
    expect(box).toHaveAttribute("id", "terms");
    expect(box).toBeRequired();
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAccessibleDescription("You can read them before you sign up Agree to the terms to continue");
    expect(container.querySelectorAll("label")).toHaveLength(1);
    expect(parts(container.firstElementChild!)).toEqual(["checkbox", "hint", "error"]);
    expect(container.firstElementChild).toHaveAttribute("data-control", "checkbox");
    warn.mockRestore();
  });

  it("puts a Switch after its label, which names it, with the hint and error under them", async () => {
    const user = userEvent.setup();
    const { container } = render(Field, {
      props: { id: "alerts", label: "Price alerts", hint: "We'll email you when it drops", error: "Couldn't turn on price alerts" },
      slots: { default: () => h(Switch) },
    });

    const toggle = screen.getByRole("switch", { name: "Price alerts" });
    expect(toggle).toHaveAttribute("aria-invalid", "true");
    expect(toggle).toHaveAccessibleDescription("We'll email you when it drops Couldn't turn on price alerts");
    expect(parts(container.firstElementChild!)).toEqual(["label", "switch", "hint", "error"]);
    await user.click(screen.getByText("Price alerts"));
    expect(toggle).toBeChecked();
  });

  it("renders a Checkbox Group's hint and error after its fieldset, linked to it, with no label, and never makes it required", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(Field, {
      props: { id: "contact", label: "Contact", hint: "Pick at least one", error: "Choose how we can contact you", required: true },
      slots: { default: () => h(CheckboxGroup, { options, name: "contact" }, () => "How can we contact you?") },
    });

    const group = screen.getByRole("group", { name: "How can we contact you?" });
    expect(group).toHaveAttribute("id", "contact");
    expect(group).toHaveAttribute("aria-describedby", "contact-hint contact-error");
    expect(group).toHaveAccessibleDescription("Pick at least one Choose how we can contact you");
    expect(group).not.toHaveAttribute("required");
    for (const box of within(group).getAllByRole("checkbox")) {
      expect(box).not.toBeRequired();
      expect(box).toHaveAttribute("aria-invalid", "true");
    }
    expect(container.querySelector(".field > label")).toBeNull();
    expect(screen.queryByText("Contact")).toBeNull();
    expect(parts(container.firstElementChild!)).toEqual(["checkbox-group", "hint", "error"]);
    warn.mockRestore();
  });

  it("disables a Checkbox, a Switch and a Checkbox Group, so none of them can be focused or sent", async () => {
    const user = userEvent.setup();
    render({
      render: () => [
        h(Field, { id: "terms", disabled: true }, () => h(Checkbox, () => "I agree to the terms")),
        h(Field, { id: "alerts", label: "Price alerts", disabled: true }, () => h(Switch)),
        h(Field, { id: "contact", disabled: true }, () => h(CheckboxGroup, { options, name: "contact" }, () => "How can we contact you?")),
      ],
    });

    expect(screen.getByRole("checkbox", { name: "I agree to the terms" })).toBeDisabled();
    expect(screen.getByRole("switch", { name: "Price alerts" })).toBeDisabled();
    expect(screen.getByRole("group", { name: "How can we contact you?" })).toBeDisabled();
    for (const box of within(screen.getByRole("group")).getAllByRole("checkbox")) expect(box).toBeDisabled();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("hands a Radio Group its hint, error, required and disabled, and renders nothing of its own", () => {
    const { container } = render(Field, {
      props: { hint: "Express arrives the next working day", error: "Choose a delivery option", required: true, disabled: true },
      slots: { default: () => h(RadioGroup, { name: "delivery", legend: "Delivery" }, radios) },
    });

    const group = screen.getByRole("radiogroup", { name: "Delivery" });
    expect(container.firstElementChild).toBe(group);
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Express arrives the next working day Choose a delivery option");
    // Rendered once each, by the Radio Group, in its own order.
    expect(screen.getAllByText("Express arrives the next working day")).toHaveLength(1);
    expect(screen.getAllByText("Choose a delivery option")).toHaveLength(1);
    for (const radio of within(group).getAllByRole("radio")) {
      expect(radio).toBeRequired();
      expect(radio).toBeDisabled();
    }
  });

  it("wins over a Radio Group's own hint and error", () => {
    render(Field, {
      props: { hint: "From the Field", error: "Also from the Field" },
      slots: { default: () => h(RadioGroup, { name: "delivery", legend: "Delivery", hint: "From the group", error: "Also from the group" }, radios) },
    });

    expect(screen.getByRole("radiogroup", { name: "Delivery" })).toHaveAccessibleDescription("From the Field Also from the Field");
    expect(screen.queryByText("From the group")).toBeNull();
    expect(screen.queryByText("Also from the group")).toBeNull();
  });

  it("mirrors its size as a data attribute, passes it to the control, and takes the control's without one", () => {
    const { container, unmount } = render(Field, {
      props: { id: "name", label: "Full name", size: "lg" },
      slots: { default: () => h(Input) },
    });
    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
    expect(container.querySelector(".input")).toHaveAttribute("data-size", "lg");
    unmount();

    const other = render(Field, { props: { id: "name", label: "Full name" }, slots: { default: () => h(Input, { size: "sm" }) } });
    expect(other.container.firstElementChild).toHaveAttribute("data-size", "sm");
  });

  it("renders the same markup on the server as on the client, with no generated IDs", async () => {
    const field = () =>
      h(Field, { id: "email", label: "Email address", hint: "We'll only use it for receipts", error: "Enter an email address" }, () =>
        h(Input, { type: "email" }),
      );
    const server = document.createElement("div");
    server.innerHTML = await renderToString(createSSRApp({ render: field }));
    const { container } = render({ render: field });

    expect(markup(server)).toEqual(markup(container));
    expect(server.textContent).toBe(container.textContent);
    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id);
    expect(ids).toEqual(["email-hint", "email", "email-error"]);
  });

  it("renders the same markup every time, and keeps the control across states", async () => {
    const options = {
      props: { id: "email", label: "Email address", hint: "We'll only use it for receipts" },
      slots: { default: () => h(Input, { type: "email" }) },
    };
    const first = render(Field, options).container.innerHTML;
    const { container, rerender } = render(Field, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const input = root.querySelector("input");
    await rerender({ error: "Enter an email address", disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect(root.querySelector("input")).toBe(input);
    expect(parts(root)).toEqual(["label", "hint", "input", "error"]);
  });

  it("warns in development when it has no id, a label a control doesn't take, a native checkbox, or more than one control", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const warns = (props: Record<string, unknown>, ...children: ReturnType<typeof h>[]) => {
      warn.mockClear();
      render(Field, { props, slots: { default: () => children } });
      return warn.mock.calls.filter(([message]) => String(message).startsWith("[Field]")).map(([message]) => String(message));
    };

    expect(warns({ label: "Full name" }, h(Input))).toEqual([expect.stringContaining("no id")]);
    expect(warns({ id: "terms", label: "Terms" }, h(Checkbox, () => "I agree"))).toEqual([expect.stringContaining("a Checkbox names itself")]);
    expect(warns({ id: "contact", label: "Contact" }, h(CheckboxGroup, { options }, () => "Contact"))).toEqual([
      expect.stringContaining("a Checkbox Group names itself"),
    ]);
    expect(warns({ label: "Delivery" }, h(RadioGroup, { name: "delivery", legend: "Delivery" }, radios))).toEqual([
      expect.stringContaining("a Radio Group names itself"),
    ]);
    expect(warns({ id: "terms" }, h("input", { type: "checkbox" }))).toEqual([expect.stringContaining("native checkbox or radio")]);
    expect(warns({ id: "name", label: "Name" }, h(Input), h(Input))).toEqual([expect.stringContaining("exactly one control")]);
    expect(warns({ id: "name", label: "Full name" }, h(Input))).toEqual([]);
    warn.mockRestore();
  });
});
