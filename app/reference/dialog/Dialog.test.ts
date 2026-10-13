import { fireEvent, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";
import { h, nextTick, ref, type VNodeChild } from "vue";
import Dialog, { type DialogProps } from "./Dialog.vue";

// jsdom has <dialog> and its `open`, but not showModal() or close(), so these stand in
// for them. They can't put the dialog in the top layer, make the rest of the page inert
// or keep Tab inside it, which is why the checklist checks those in a browser instead.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event("close"));
  });
});

beforeEach(() => {
  vi.mocked(HTMLDialogElement.prototype.showModal).mockClear();
});

// jsdom lays nothing out, so every box is 0 × 0 at 0, 0. This gives the dialog a real
// one, at 100, 100 and 400 × 300, so a press can land on the panel or on the backdrop.
function layOut(dialog: HTMLElement) {
  dialog.getBoundingClientRect = () => new DOMRect(100, 100, 400, 300);
}

async function press(target: Element, clientX: number, clientY: number) {
  await fireEvent.mouseDown(target, { clientX, clientY });
  await fireEvent.click(target, { clientX, clientY });
}

const field = (id: string, text: string) => [h("label", { for: id }, text), h("input", { id })];
const button = (text: string, attrs = {}) => h("button", { type: "button", ...attrs }, text);

// A page with a button that opens the dialog, which closes when `close` fires, the way
// you'd use it, unless `closes` is false.
function page(props: Partial<DialogProps> & Record<string, unknown> = {}, slots: Record<string, () => VNodeChild> = {}, { closes = true } = {}) {
  const open = ref(false);
  const onClose = vi.fn(() => {
    if (closes) open.value = false;
  });
  const result = render({
    render: () => [
      button("Edit profile", { onClick: () => (open.value = true) }),
      h(Dialog, { id: "edit-profile", title: "Edit profile", ...props, open: open.value, onClose }, slots),
    ],
  });
  return { ...result, open, onClose };
}

async function openFrom(user: ReturnType<typeof userEvent.setup>, name = "Edit profile") {
  await user.click(screen.getByRole("button", { name }));
}

describe("Dialog", () => {
  it("is a native dialog, opened with showModal() and found by its role and its title", async () => {
    const user = userEvent.setup();
    page({}, { default: () => field("name", "Full name") });

    await openFrom(user);
    const dialog = screen.getByRole("dialog", { name: "Edit profile" });
    expect(dialog.tagName).toBe("DIALOG");
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
    expect(vi.mocked(HTMLDialogElement.prototype.showModal).mock.contexts[0]).toBe(dialog);
    expect(dialog).toHaveAttribute("aria-labelledby", "edit-profile-title");
    expect(screen.getByRole("heading", { level: 2, name: "Edit profile" })).toHaveAttribute("id", "edit-profile-title");
  });

  it("names its close button Close, or its closeLabel", async () => {
    const user = userEvent.setup();
    const { onClose } = page({ closeLabel: "Fermer" }, {}, { closes: false });
    await openFrom(user);

    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalledWith("close-button", "");
  });

  it("is an alertdialog with role alertdialog, without a close button", async () => {
    const user = userEvent.setup();
    page(
      { id: "delete-project", title: "Delete project?", role: "alertdialog" },
      { actions: () => [button("Keep project"), button("Delete project")] },
    );

    await openFrom(user);
    expect(screen.getByRole("alertdialog", { name: "Delete project?" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("is described by its description, and not by the rest of its content", async () => {
    const user = userEvent.setup();
    const { unmount } = page(
      { description: "Your name and email address, as other people see them." },
      { default: () => field("name", "Full name") },
    );

    await openFrom(user);
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      "Your name and email address, as other people see them.",
    );

    unmount();
    page({ id: "rename", title: "Rename file" }, { default: () => field("file", "File name") });
    await openFrom(user);
    expect(screen.getByRole("dialog", { name: "Rename file" })).not.toHaveAttribute("aria-describedby");
  });

  it("isn't found while it's closed", () => {
    page();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("moves focus to the control marked with data-autofocus, or else the first in its body", async () => {
    const user = userEvent.setup();
    const { unmount } = page({}, { default: () => [...field("name", "Full name"), ...field("email", "Email address")] });
    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveFocus();
    unmount();

    page(
      {},
      {
        default: () => [
          ...field("name", "Full name"),
          h("label", { for: "email" }, "Email address"),
          h("input", { id: "email", "data-autofocus": "" }),
        ],
      },
    );
    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveFocus();
  });

  it("counts a control marked with autofocus too", async () => {
    const user = userEvent.setup();
    page(
      {},
      {
        default: () => [
          ...field("name", "Full name"),
          h("label", { for: "email" }, "Email address"),
          h("input", { id: "email", autofocus: true }),
        ],
      },
    );

    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveFocus();
  });

  it("moves focus to the first action without controls in its body, never the close button", async () => {
    const user = userEvent.setup();
    page({}, { default: () => h("p", "Your changes are saved."), actions: () => button("Done") });

    await openFrom(user);
    expect(screen.getByRole("button", { name: "Done" })).toHaveFocus();
  });

  it("moves focus to the least destructive action in an alert dialog, when it comes first", async () => {
    const user = userEvent.setup();
    page(
      { id: "delete-project", title: "Delete project?", role: "alertdialog" },
      { actions: () => [button("Keep project"), button("Delete project")] },
    );

    await openFrom(user);
    expect(screen.getByRole("button", { name: "Keep project" })).toHaveFocus();
  });

  it("gives focus back to the control that opened it when it closes", async () => {
    const user = userEvent.setup();
    page({}, { default: () => field("name", "Full name") });

    await openFrom(user);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit profile" })).toHaveFocus();
  });

  it("asks to close on Escape, the close button and the backdrop, and stays open until it's closed", async () => {
    const user = userEvent.setup();
    const { onClose } = page({}, { default: () => field("name", "Full name") }, { closes: false });
    await openFrom(user);
    const dialog = screen.getByRole("dialog", { name: "Edit profile" });

    layOut(dialog);

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Close" }));
    await press(dialog, 20, 20);

    expect(onClose.mock.calls).toEqual([
      ["escape", ""],
      ["close-button", ""],
      ["backdrop", ""],
    ]);
    expect(dialog).toHaveAttribute("open");
  });

  it("closes an alert dialog on Escape too, but not on the backdrop", async () => {
    const user = userEvent.setup();
    const { onClose } = page(
      { id: "delete-project", title: "Delete project?", role: "alertdialog" },
      { actions: () => button("Keep project") },
      { closes: false },
    );
    await openFrom(user);
    const dialog = screen.getByRole("alertdialog");
    layOut(dialog);

    await press(dialog, 20, 20);
    await user.keyboard("{Escape}");
    expect(onClose.mock.calls).toEqual([["escape", ""]]);
  });

  it("ignores a press that starts inside it and ends on the backdrop, and Escape a control inside handles", async () => {
    const user = userEvent.setup();
    const { onClose } = page(
      {},
      {
        default: () => [
          h("label", { for: "menu" }, "Search"),
          h("input", { id: "menu", onKeydown: (event: KeyboardEvent) => event.preventDefault() }),
        ],
      },
      { closes: false },
    );
    await openFrom(user);
    const dialog = screen.getByRole("dialog");
    layOut(dialog);

    await fireEvent.mouseDown(screen.getByRole("heading", { name: "Edit profile" }), { clientX: 200, clientY: 120 });
    await fireEvent.click(dialog, { clientX: 20, clientY: 20 });
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("ignores a press on its own padding, inside its box", async () => {
    const user = userEvent.setup();
    const { onClose } = page({}, { default: () => field("name", "Full name") }, { closes: false });
    await openFrom(user);
    const dialog = screen.getByRole("dialog");
    layOut(dialog);

    // The press lands on the <dialog> itself, as on the backdrop, but inside its box.
    await press(dialog, 300, 390);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("asks to close on other close requests, like the back gesture on Android, rather than closing", async () => {
    const user = userEvent.setup();
    const { onClose } = page({}, { default: () => field("name", "Full name") }, { closes: false });
    await openFrom(user);
    const dialog = screen.getByRole("dialog");

    const cancel = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose.mock.calls).toEqual([["escape", ""]]);
  });

  it("says it's closed, and gives focus back, when the browser closes it anyway", async () => {
    const user = userEvent.setup();
    // A page that keeps the dialog open, like for unsaved changes, unless it's already closed.
    const open = ref(false);
    const onClose = vi.fn((reason: string) => {
      if (reason === "closed") open.value = false;
    });
    render({
      render: () => [
        button("Edit profile", { onClick: () => (open.value = true) }),
        h(Dialog, { id: "edit-profile", title: "Edit profile", open: open.value, onClose }, () =>
          field("name", "Full name"),
        ),
      ],
    });
    await openFrom(user);
    const dialog = screen.getByRole("dialog") as HTMLDialogElement;

    await user.keyboard("{Escape}");
    expect(dialog.open).toBe(true);

    // Like a close request the browser no longer lets the page turn down.
    dialog.close();
    expect(onClose.mock.calls).toEqual([
      ["escape", ""],
      ["closed", ""],
    ]);
    await nextTick();
    expect(open.value).toBe(false);
    expect(dialog.open).toBe(open.value);
    expect(screen.getByRole("button", { name: "Edit profile" })).toHaveFocus();

    // It opens again, since `open` followed it.
    await openFrom(user);
    expect(dialog.open).toBe(true);
  });

  it("doesn't fire close when you close it", async () => {
    const user = userEvent.setup();
    const { open, onClose } = page({}, { default: () => field("name", "Full name") });
    await openFrom(user);

    open.value = false;
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Edit profile" })).toHaveFocus();
  });

  it("asks to close with the button's value when a form with method dialog is sent", async () => {
    const user = userEvent.setup();
    const { onClose } = page(
      { id: "delete-project", title: "Delete project?", role: "alertdialog" },
      {
        actions: () =>
          h("form", { method: "dialog" }, [
            h("button", { value: "keep" }, "Keep project"),
            h("button", { value: "delete" }, "Delete project"),
          ]),
      },
      { closes: false },
    );
    await openFrom(user);

    await user.click(screen.getByRole("button", { name: "Delete project" }));
    expect(onClose).toHaveBeenCalledWith("action", "delete");
    expect(screen.getByRole("alertdialog")).toHaveAttribute("open");
  });

  it("leaves any other form alone, unless its button has formmethod dialog", async () => {
    const user = userEvent.setup();
    // The page sends the form itself, from a listener further up, once the dialog has
    // seen the submit, and leaves the Cancel button to the dialog.
    const onSubmit = vi.fn((event: SubmitEvent) => {
      if (event.submitter?.getAttribute("formmethod") !== "dialog") event.preventDefault();
    });
    document.addEventListener("submit", onSubmit);
    onTestFinished(() => document.removeEventListener("submit", onSubmit));
    const { onClose } = page(
      {},
      {
        default: () =>
          h("form", { method: "post" }, [
            ...field("name", "Full name"),
            h("button", { value: "save" }, "Save changes"),
            h("button", { value: "cancel", formmethod: "dialog" }, "Cancel"),
          ]),
      },
      { closes: false },
    );
    await openFrom(user);

    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose.mock.calls).toEqual([["action", "cancel"]]);
  });

  it("opens and closes with its open prop alone", async () => {
    const open = ref(true);
    render({ render: () => h(Dialog, { id: "edit-profile", title: "Edit profile", open: open.value }) });

    const dialog = screen.getByRole("dialog", { name: "Edit profile" });
    open.value = false;
    await vi.waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    open.value = true;
    await vi.waitFor(() => expect(dialog).toHaveAttribute("open"));
  });

  it("puts attributes, classes and listeners on the dialog", async () => {
    const user = userEvent.setup();
    const onKeyup = vi.fn();
    page({ class: "wide", "data-testid": "profile", onKeyup }, { default: () => field("name", "Full name") });

    await openFrom(user);
    const dialog = screen.getByRole("dialog");
    await user.keyboard("a");
    expect(dialog).toHaveClass("dialog", "wide");
    expect(dialog).toHaveAttribute("data-testid", "profile");
    expect(onKeyup).toHaveBeenCalled();
  });

  it("mirrors its size as a data attribute, and marks its parts", () => {
    const { container } = render(Dialog, {
      props: { id: "edit-profile", title: "Edit profile", description: "As other people see them.", size: "lg" },
      slots: { default: () => "Content", actions: () => button("Save") },
    });

    const dialog = container.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("data-size", "lg");
    const fallback = render(Dialog, { props: { id: "rename", title: "Rename file" } });
    expect(fallback.container.querySelector("dialog")).toHaveAttribute("data-size", "md");
    // The close button is a Button, with parts of its own.
    const parts = [...dialog.querySelectorAll("[data-slot]")]
      .filter((part) => !part.parentElement?.closest('[data-slot="close"]'))
      .map((part) => part.getAttribute("data-slot"));
    expect(parts).toEqual(["header", "title", "close", "description", "body", "actions"]);
  });

  it("renders the same markup every time, with IDs from its own, and keeps its elements as it opens", async () => {
    const options = {
      props: { id: "edit-profile", title: "Edit profile", description: "As other people see them." },
      slots: { default: () => "Content", actions: () => button("Save") },
    };
    const first = render(Dialog, options).container.innerHTML;
    const { container, rerender } = render(Dialog, options);
    expect(container.innerHTML).toBe(first);
    expect(first).not.toMatch(/id="(?!edit-profile)/);

    const dialog = container.querySelector("dialog")!;
    const title = dialog.querySelector('[data-slot="title"]');
    await rerender({ open: true });
    expect(container.querySelector("dialog")).toBe(dialog);
    expect(dialog.querySelector('[data-slot="title"]')).toBe(title);
  });

  it("warns in development when it has no title", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Dialog, { props: { id: "untitled", title: "" } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no title"), expect.anything());

    warn.mockClear();
    render(Dialog, { props: { id: "edit-profile", title: "Edit profile" } });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
