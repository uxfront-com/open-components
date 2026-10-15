import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import Textarea from "./Textarea.vue";

const label = (id: string, text: string) => h("label", { for: id }, text);

describe("Textarea", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is a native textarea, found by its role and its label", () => {
    render({ render: () => [label("message", "Message"), h(Textarea, { id: "message" })] });

    const textarea = screen.getByRole("textbox", { name: "Message" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).not.toHaveAttribute("contenteditable");
    expect(textarea).not.toHaveAttribute("role");
  });

  it("puts attributes, listeners and refs on the textarea, and classes and styles on its root", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const instance = ref<ComponentPublicInstance<{ textarea: HTMLTextAreaElement }>>();
    render({
      render: () => [
        label("address", "Street address"),
        h(Textarea, {
          ref: instance,
          id: "address",
          class: "address",
          style: "max-width: 320px",
          name: "address",
          autocomplete: "street-address",
          onFocus,
        }),
      ],
    });

    const textarea = screen.getByRole("textbox", { name: "Street address" });
    await user.tab();
    expect(textarea).toHaveAttribute("name", "address");
    expect(textarea).toHaveAttribute("autocomplete", "street-address");
    expect(textarea).not.toHaveClass("address");
    expect(textarea.parentElement).toHaveClass("textarea", "address");
    expect(textarea.parentElement).toHaveStyle({ maxWidth: "320px" });
    expect(textarea).not.toHaveStyle({ maxWidth: "320px" });
    expect(onFocus).toHaveBeenCalled();
    expect(instance.value?.textarea).toBe(textarea);
  });

  it("binds its value with v-model, or keeps its own without it", async () => {
    const user = userEvent.setup();
    const message = ref("Hello");
    render({
      render: () => [
        h(Textarea, {
          "aria-label": "Bound",
          modelValue: message.value,
          "onUpdate:modelValue": (value: string | undefined) => (message.value = value ?? ""),
        }),
        h(Textarea, { "aria-label": "Unbound" }),
      ],
    });

    const bound = screen.getByRole("textbox", { name: "Bound" });
    await user.type(bound, ", Ada");
    expect(message.value).toBe("Hello, Ada");
    message.value = "";
    await nextTick();
    expect(bound).toHaveValue("");

    const unbound = screen.getByRole("textbox", { name: "Unbound" });
    await user.type(unbound, "Ada");
    expect(unbound).toHaveValue("Ada");
  });

  it("is submitted with its form, by its name, whether its value is bound or not", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    const subject = ref("");
    render({
      render: () =>
        h("form", { onSubmit }, [
          label("subject", "Subject"),
          h(Textarea, {
            id: "subject",
            name: "subject",
            modelValue: subject.value,
            "onUpdate:modelValue": (value: string | undefined) => (subject.value = value ?? ""),
          }),
          label("message", "Message"),
          h(Textarea, { id: "message", name: "message" }),
          h("button", { type: "submit" }, "Send"),
        ]),
    });

    await user.type(screen.getByRole("textbox", { name: "Subject" }), "Hi");
    await user.type(screen.getByRole("textbox", { name: "Message" }), "Hello");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const data = new FormData(onSubmit.mock.calls[0]![0].target as HTMLFormElement);
    expect(data.get("subject")).toBe("Hi");
    expect(data.get("message")).toBe("Hello");
  });

  it("inserts a new line on Enter, and never submits its form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render({
      render: () =>
        h("form", { onSubmit }, [
          label("message", "Message"),
          h(Textarea, { id: "message", name: "message" }),
          h("button", { type: "submit" }, "Send"),
        ]),
    });

    const textarea = screen.getByRole("textbox", { name: "Message" });
    await user.type(textarea, "Dear Ada,{Enter}Thank you");
    expect(textarea).toHaveValue("Dear Ada,\nThank you");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps the browser's text editing keys, and lets people paste", async () => {
    const user = userEvent.setup();
    render({
      render: () => [label("message", "Message"), h(Textarea, { id: "message" }), h("button", { type: "button" }, "Send")],
    });

    const textarea = screen.getByRole("textbox", { name: "Message" });
    await user.tab();
    expect(textarea).toHaveFocus();
    await user.keyboard("Lovelace{Home}Ada ");
    expect(textarea).toHaveValue("Ada Lovelace");

    // Tab moves focus on, rather than typing a tab.
    await user.tab();
    expect(screen.getByRole("button", { name: "Send" })).toHaveFocus();
    expect(textarea).toHaveValue("Ada Lovelace");
    await user.tab({ shift: true });
    expect(textarea).toHaveFocus();

    await user.clear(textarea);
    await user.paste("Ada Lovelace");
    expect(textarea).toHaveValue("Ada Lovelace");
  });

  it("lets people type and paste past its limit, and counts what's left or how many too many", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () => [label("bio", "Bio"), h(Textarea, { id: "bio", limit: 10 })],
    });

    const textarea = screen.getByRole("textbox", { name: "Bio" });
    const count = container.querySelector('[data-slot="count"]');
    expect(textarea).not.toHaveAttribute("maxlength");
    expect(count).toHaveTextContent("10 characters left");

    await user.type(textarea, "Ada Lovel");
    expect(count).toHaveTextContent("1 character left");

    await user.paste("ace, mathematician");
    expect(textarea).toHaveValue("Ada Lovelace, mathematician");
    expect(count).toHaveTextContent("17 characters too many");
  });

  it("describes the textarea with its count, and marks it invalid over the limit", async () => {
    const user = userEvent.setup();
    render({
      render: () => [
        label("bio", "Bio"),
        h("p", { id: "bio-hint" }, "You can enter up to 10 characters"),
        h(Textarea, { id: "bio", limit: 10, "aria-describedby": "bio-hint" }),
      ],
    });

    const textarea = screen.getByRole("textbox", { name: "Bio" });
    expect(textarea).toHaveAccessibleDescription("You can enter up to 10 characters 10 characters left");
    expect(textarea).not.toHaveAttribute("aria-invalid");

    await user.type(textarea, "Ada Lovelace");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("You can enter up to 10 characters 2 characters too many");

    await user.type(textarea, "{Backspace}{Backspace}");
    expect(textarea).not.toHaveAttribute("aria-invalid");
  });

  it("announces the count once people pause near the limit, not on every keystroke", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render({ render: () => [label("bio", "Bio"), h(Textarea, { id: "bio", limit: 10 })] });

    const status = screen.getByRole("status");
    const textarea = screen.getByRole("textbox", { name: "Bio" });

    // Far from the limit, nothing is announced.
    await user.type(textarea, "Ada");
    vi.advanceTimersByTime(1000);
    expect(status).toHaveTextContent("");

    // Near it, the count is announced once people pause, and only once.
    await user.type(textarea, " Love");
    expect(status).toHaveTextContent("");
    vi.advanceTimersByTime(1000);
    expect(status).toHaveTextContent("2 characters left");
    expect(status.children).toHaveLength(1);

    // A count that's back where it was isn't announced again.
    await user.type(textarea, "l{Backspace}");
    vi.advanceTimersByTime(1000);
    expect(status.children).toHaveLength(1);

    await user.type(textarea, "lace");
    vi.advanceTimersByTime(1000);
    expect(status).toHaveTextContent("2 characters too many");
    expect(status.children).toHaveLength(2);
  });

  it("waits for people to pause near the limit, however slowly they type", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render({ render: () => [label("motto", "Motto"), h(Textarea, { id: "motto", limit: 10 })] });

    // The page shares one live region, so clear what earlier tests announced.
    const status = screen.getByRole("status");
    status.replaceChildren();
    const textarea = screen.getByRole("textbox", { name: "Motto" });

    // A key every 600ms is slow, but shorter than a pause, so nothing is announced until the last one.
    await user.type(textarea, "Ada Lov");
    for (const key of "ela") {
      vi.advanceTimersByTime(600);
      await user.type(textarea, key);
    }
    expect(status.children).toHaveLength(0);

    vi.advanceTimersByTime(1000);
    expect(status.children).toHaveLength(1);
    expect(status).toHaveTextContent("0 characters left");
  });

  it("counts again when its form is reset, whether its value is bound or not", async () => {
    const user = userEvent.setup();
    const bio = ref("");
    const { container } = render({
      render: () =>
        h("form", [
          label("bio", "Bio"),
          h(Textarea, { id: "bio", name: "bio", limit: 10 }),
          label("motto", "Motto"),
          h(Textarea, {
            id: "motto",
            name: "motto",
            limit: 10,
            modelValue: bio.value,
            "onUpdate:modelValue": (value: string | undefined) => (bio.value = value ?? ""),
          }),
        ]),
    });

    const unbound = screen.getByRole("textbox", { name: "Bio" });
    const bound = screen.getByRole("textbox", { name: "Motto" });
    await user.type(unbound, "Ada Lovelace");
    await user.type(bound, "Ada Lovelace");
    expect(unbound).toHaveAttribute("aria-invalid", "true");
    expect(bound).toHaveAttribute("aria-invalid", "true");

    // The reset event fires before the values are put back, so the count catches up after it.
    unbound.closest("form")!.reset();
    await vi.waitFor(() => {
      for (const count of container.querySelectorAll('[data-slot="count"]')) {
        expect(count).toHaveTextContent("10 characters left");
      }
      expect(unbound).not.toHaveAttribute("aria-invalid");
      expect(bound).not.toHaveAttribute("aria-invalid");
    });
    expect(bio.value).toBe("");
    expect(bound).toHaveValue("");
  });

  it("counts again after a reset button, which puts the text back only after the browser's microtasks", async () => {
    const user = userEvent.setup();
    render({ render: () => h("form", [label("bio", "Bio"), h(Textarea, { id: "bio", name: "bio", limit: 10 })]) });

    const textarea = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Bio" });
    await user.type(textarea, "Ada Lovelace");
    expect(textarea).toHaveAttribute("aria-invalid", "true");

    // A click on a reset button fires `reset`, runs microtasks, and only then puts the
    // text back. jsdom runs them last, so this plays the browser's order step by step.
    textarea.form!.dispatchEvent(new Event("reset", { cancelable: true }));
    await Promise.resolve();
    textarea.value = textarea.defaultValue;

    await vi.waitFor(() => {
      expect(screen.getByText("10 characters left")).toBeInTheDocument();
      expect(textarea).not.toHaveAttribute("aria-invalid");
    });
  });

  it("can't be focused or edited while disabled, and its form leaves it out", async () => {
    const user = userEvent.setup();
    render({
      render: () =>
        h("form", [label("notes", "Notes"), h(Textarea, { id: "notes", name: "notes", value: "Call back", disabled: true })]),
    });

    const textarea = screen.getByRole("textbox", { name: "Notes" });
    await user.tab();
    await user.type(textarea, " tomorrow");
    expect(textarea).toBeDisabled();
    expect(textarea).not.toHaveFocus();
    expect(textarea).toHaveValue("Call back");
    expect(new FormData(textarea.closest("form")!).has("notes")).toBe(false);
  });

  it("passes aria-invalid and its error message to the textarea", () => {
    render({
      render: () => [
        label("message", "Message"),
        h(Textarea, { id: "message", "aria-invalid": "true", "aria-describedby": "message-error" }),
        h("p", { id: "message-error" }, "Enter a message"),
      ],
    });

    const textarea = screen.getByRole("textbox", { name: "Message" });
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("Enter a message");
  });

  it("mirrors its size, rows, auto-grow, maximum and limit as data attributes, and passes its rows to the textarea", async () => {
    const { container, rerender } = render(Textarea, {
      attrs: { id: "message", "aria-label": "Message" },
      props: { size: "lg", rows: 2, autoGrow: true, maxRows: 6, limit: 500 },
    });

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveAttribute("data-auto-grow", "");
    expect(root).toHaveAttribute("data-limit", "500");
    expect(root).toHaveAttribute("data-rows", "2");
    expect(root).toHaveAttribute("data-max-rows", "6");
    expect(root.style.getPropertyValue("--textarea--rows")).toBe("2");
    expect(root.style.getPropertyValue("--textarea--max-rows")).toBe("6");
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveAttribute("rows", "2");

    // New rows reach the styles, and a maximum only counts while it grows.
    await rerender({ size: "lg", rows: 4, autoGrow: false, maxRows: 6, limit: 500 });
    expect(root).toHaveAttribute("data-rows", "4");
    expect(root.style.getPropertyValue("--textarea--rows")).toBe("4");
    expect(root).not.toHaveAttribute("data-max-rows");
    expect(root.style.getPropertyValue("--textarea--max-rows")).toBe("");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const options = { attrs: { id: "bio", "aria-label": "Bio" }, props: { limit: 200 } };
    const first = render(Textarea, options).container.innerHTML;
    const { container, rerender } = render(Textarea, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["control", "count"]);

    const textarea = root.querySelector("textarea");
    await rerender({ limit: 200, disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect(root.querySelector("textarea")).toBe(textarea);
    expect(parts()).toEqual(["control", "count"]);
  });

  it("warns in development when it has no label, or a limit without an id", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Textarea);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render(Textarea, { attrs: { "aria-label": "Bio" }, props: { limit: 200 } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no id"), expect.anything());

    warn.mockClear();
    render({ render: () => [label("bio", "Bio"), h(Textarea, { id: "bio", limit: 200 })] });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
