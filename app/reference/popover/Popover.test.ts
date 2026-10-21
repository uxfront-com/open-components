import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type VNodeChild } from "vue";
import Dialog from "../dialog/Dialog.vue";
import Tooltip from "../tooltip/Tooltip.vue";
import Popover, { type PopoverProps } from "./Popover.vue";

// jsdom has no Popover API, so these stand in for the parts the Popover relies on: showing
// and hiding with `beforetoggle` and `toggle`, giving focus back to whatever had it before,
// a `popovertarget` button toggling its popover, and the closes the browser makes itself,
// after the event that caused them, for an Escape nobody cancelled and for a press that
// starts and ends outside. They can't put it in the top layer or place it, which the
// checklist checks in a browser instead.
const shown = new Set<HTMLElement>();
const previous = new Map<HTMLElement, Element | null>();
// Chrome fires `toggle` a task after it shows or hides a popover, and folds two in a row
// into one. Most tests fire it at once, which is easier to follow.
let deferToggle = false;
const pendingToggle = new Map<HTMLElement, { oldState: string; timer: ReturnType<typeof setTimeout> }>();

function toggle(el: HTMLElement, newState: "open" | "closed", source: Element | null = null, { focusPrevious = true } = {}) {
  const oldState = newState === "open" ? "closed" : "open";
  el.dispatchEvent(Object.assign(new Event("beforetoggle"), { newState, oldState, source }));
  if (newState === "open") {
    shown.add(el);
    previous.set(el, document.activeElement);
  } else {
    shown.delete(el);
    // Hiding it gives focus back to whatever had it before it opened, when focus is inside,
    // except after a press outside. That's the <body> when nothing had it, like in Safari,
    // where a click doesn't focus the button.
    const before = previous.get(el);
    if (focusPrevious && el.contains(document.activeElement)) {
      if (before instanceof HTMLElement && before !== document.body) before.focus();
      else (document.activeElement as HTMLElement).blur();
    }
  }
  // jsdom hides every popover, as browsers hide a closed one, but can't match :popover-open,
  // which shows an open one, so this stands in for it.
  el.style.display = newState === "open" ? "flex" : "";
  const fire = (old: string) => el.dispatchEvent(Object.assign(new Event("toggle"), { newState, oldState: old, source }));
  if (!deferToggle) return fire(oldState);
  const pending = pendingToggle.get(el);
  clearTimeout(pending?.timer);
  const old = pending?.oldState ?? oldState;
  pendingToggle.set(el, {
    oldState: old,
    timer: setTimeout(() => {
      pendingToggle.delete(el);
      fire(old);
    }),
  });
}

beforeAll(() => {
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    if (!shown.has(this)) toggle(this, "open");
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    if (shown.has(this)) toggle(this, "closed");
  };
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };

  document.addEventListener("click", (event) => {
    const invoker = (event.target as Element).closest<HTMLElement>("[popovertarget]");
    const target = invoker && document.getElementById(invoker.getAttribute("popovertarget")!);
    if (!target) return;
    queueMicrotask(() => (shown.has(target) ? toggle(target, "closed", invoker) : toggle(target, "open", invoker)));
  });
  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    queueMicrotask(() => [...shown].at(-1)?.hidePopover());
  });
  let down: EventTarget | null = null;
  document.addEventListener("pointerdown", (event) => (down = event.target), true);
  document.addEventListener("pointerup", (event) => {
    const outside = (target: EventTarget | null) =>
      [...shown].filter((el) => !el.contains(target as Node) && !(target as Element).closest(`[popovertarget="${el.id}"]`));
    const pressed = outside(down);
    queueMicrotask(() =>
      outside(event.target)
        .filter((el) => pressed.includes(el))
        .forEach((el) => toggle(el, "closed", null, { focusPrevious: false })),
    );
  });
});

afterEach(() => {
  shown.clear();
  deferToggle = false;
});

const field = (id: string, text: string) => [h("label", { for: id }, text), h("input", { id })];
const button = (text: string, attrs = {}) => h("button", { type: "button", ...attrs }, text);

// A page with a Filters button that opens the popover with popovertarget, and a link
// after them, the way you'd use it.
function page(props: Partial<PopoverProps> & Record<string, unknown> = {}, content: () => VNodeChild = () => field("open-only", "Open issues only")) {
  const onClose = vi.fn();
  const result = render({
    render: () => [
      button("Filters", { popovertarget: "filters", "aria-haspopup": "dialog" }),
      h(Popover, { id: "filters", title: "Filters", onClose, ...props }, { default: content }),
      h("a", { href: "#issues" }, "Issues"),
    ],
  });
  return { ...result, onClose };
}

const popover = () => document.querySelector<HTMLElement>(".popover")!;

async function openFrom(user: ReturnType<typeof userEvent.setup>, name = "Filters") {
  await user.click(screen.getByRole("button", { name }));
}

describe("Popover", () => {
  it("is a dialog with popover auto, named by its title, which a popovertarget button opens", async () => {
    const user = userEvent.setup();
    page();
    expect(popover()).toHaveAttribute("popover", "auto");
    expect(popover()).toHaveAttribute("data-state", "closed");

    await openFrom(user);
    const dialog = screen.getByRole("dialog", { name: "Filters" });
    expect(dialog).toBe(popover());
    expect(dialog).toHaveAttribute("data-state", "open");
    expect(dialog).toHaveAttribute("aria-labelledby", "filters-title");
    expect(screen.getByText("Filters", { selector: "p" })).toHaveAttribute("id", "filters-title");
  });

  it("isn't found while it's closed", () => {
    page();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("isn't modal, so nothing around it changes while it's open", async () => {
    const user = userEvent.setup();
    page();

    await openFrom(user);
    expect(popover()).not.toHaveAttribute("aria-modal");
    expect(screen.getByRole("link", { name: "Issues" }).closest("[inert]")).toBeNull();
  });

  it("closes when its trigger is pressed again, with the reason trigger", async () => {
    const user = userEvent.setup();
    const { onClose } = page();

    await openFrom(user);
    await openFrom(user);
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["trigger"]]);
  });

  it("moves focus to the control marked with data-autofocus, or else the first in its body", async () => {
    const user = userEvent.setup();
    const { unmount } = page({}, () => [...field("open-only", "Open issues only"), ...field("mine", "Mine only")]);
    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Open issues only" })).toHaveFocus();
    unmount();

    page({}, () => [...field("open-only", "Open issues only"), h("label", { for: "mine" }, "Mine only"), h("input", { id: "mine", "data-autofocus": "" })]);
    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Mine only" })).toHaveFocus();
  });

  it("counts a control marked with autofocus too, and starts on its close button with nothing to focus in its body", async () => {
    const user = userEvent.setup();
    const { unmount } = page({}, () => [...field("open-only", "Open issues only"), h("label", { for: "mine" }, "Mine only"), h("input", { id: "mine", autofocus: true })]);
    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Mine only" })).toHaveFocus();
    unmount();

    page({ id: "billing", title: "About billing" }, () => h("p", "You're billed on the first of each month."));
    render(() => button("About billing", { popovertarget: "billing" }));
    await openFrom(user, "About billing");
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("gives focus back to its trigger when it closes with Escape or its close button", async () => {
    const user = userEvent.setup();
    const { onClose } = page();
    const trigger = screen.getByRole("button", { name: "Filters" });

    await openFrom(user);
    // Safari doesn't focus a button on a click, so the trigger can't count on having focus.
    trigger.blur();
    screen.getByRole("textbox").focus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();

    await openFrom(user);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(trigger).toHaveFocus();
    expect(onClose.mock.calls).toEqual([["escape"], ["close-button"]]);
  });

  it("gives focus back to its trigger even when the trigger never had it, as after a click in Safari", async () => {
    page();
    const trigger = screen.getByRole("button", { name: "Filters" });

    // A click that doesn't focus the button, so the browser has nothing to give focus back to.
    trigger.click();
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-state", "open"));
    expect(screen.getByRole("textbox")).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("leaves focus off its trigger after a press outside on something that can't take focus", async () => {
    const user = userEvent.setup();
    const { onClose } = page({}, () => field("open-only", "Open issues only"));
    render(() => h("p", "Showing 12 issues"));

    await openFrom(user);
    expect(screen.getByRole("textbox")).toHaveFocus();
    await user.click(screen.getByText("Showing 12 issues"));
    expect(onClose.mock.calls).toEqual([["outside"]]);
    expect(screen.getByRole("button", { name: "Filters" })).not.toHaveFocus();
  });

  it("closes on a press outside, with the reason outside, and leaves focus where people pressed", async () => {
    const user = userEvent.setup();
    const { onClose } = page();

    await openFrom(user);
    await user.click(screen.getByRole("link", { name: "Issues" }));
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["outside"]]);
    expect(screen.getByRole("link", { name: "Issues" })).toHaveFocus();
  });

  it("stays open on a press inside it", async () => {
    const user = userEvent.setup();
    const { onClose } = page();

    await openFrom(user);
    await user.click(screen.getByRole("textbox"));
    expect(popover()).toHaveAttribute("data-state", "open");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes with Escape on its trigger too, and stops the key there", async () => {
    const user = userEvent.setup();
    const { onClose } = page();
    const trigger = screen.getByRole("button", { name: "Filters" });
    await openFrom(user);

    trigger.focus();
    const keydown = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    trigger.dispatchEvent(keydown);
    await nextTick();
    expect(keydown.defaultPrevented).toBe(true);
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
    expect(trigger).toHaveFocus();
  });

  it("says it closed with Escape when the browser closes it for an Escape elsewhere on the page", async () => {
    const user = userEvent.setup();
    const { onClose } = page();
    await openFrom(user);

    screen.getByRole("link", { name: "Issues" }).focus();
    await user.keyboard("{Escape}");
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
    // Focus wasn't in it, so it stays where it was.
    expect(screen.getByRole("link", { name: "Issues" })).toHaveFocus();
  });

  it("says closed for a close it can't tell apart, like another popover opening", async () => {
    const user = userEvent.setup();
    const { onClose } = page();
    await openFrom(user);

    popover().hidePopover();
    expect(onClose.mock.calls).toEqual([["closed"]]);
  });

  it("closes only a Tooltip open inside it on the first Escape, and itself on the second", async () => {
    const user = userEvent.setup();
    const { onClose } = page({}, () =>
      h(Tooltip, { label: "Hides closed issues" }, { default: ({ trigger }: { trigger: Record<string, unknown> }) => h("button", trigger, "Open only") }),
    );
    await openFrom(user);
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(screen.getByRole("button", { name: "Open only" })).toHaveFocus();
    expect(tooltip).toHaveAttribute("data-state", "open");

    await user.keyboard("{Escape}");
    expect(tooltip).toHaveAttribute("data-state", "closed");
    expect(popover()).toHaveAttribute("data-state", "open");
    expect(onClose).not.toHaveBeenCalled();

    await user.keyboard("{Escape}");
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
  });

  // A Dialog with a Filters button inside it, which opens the popover, as on a settings form.
  function inDialog({ doneKeydown }: { doneKeydown?: (event: KeyboardEvent) => void } = {}) {
    const onDialogClose = vi.fn();
    const onClose = vi.fn();
    const dialogOpen = ref(true);
    render({
      render: () =>
        h(Dialog, { id: "settings", title: "Settings", open: dialogOpen.value, onClose: onDialogClose }, () => [
          button("Filters", { popovertarget: "filters", "aria-haspopup": "dialog" }),
          h(Popover, { id: "filters", title: "Filters", onClose }, () => field("open-only", "Open issues only")),
          button("Done", { onKeydown: doneKeydown, onClick: () => (dialogOpen.value = false) }),
        ]),
    });
    return { onDialogClose, onClose, dialogOpen };
  }

  it("closes alone on Escape inside a Dialog, which fires no close, with focus in it", async () => {
    const user = userEvent.setup();
    const { onDialogClose, onClose } = inDialog();
    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Open issues only" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
    expect(onDialogClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Settings" })).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Filters" })).toHaveFocus();

    // With the popover closed, Escape is the Dialog's again.
    await user.keyboard("{Escape}");
    expect(onDialogClose).toHaveBeenCalledWith("escape", "");
  });

  it("closes alone on Escape inside a Dialog with focus on its trigger, too", async () => {
    const user = userEvent.setup();
    const { onDialogClose, onClose } = inDialog();
    await openFrom(user);

    screen.getByRole("button", { name: "Filters" }).focus();
    await user.keyboard("{Escape}");
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
    expect(onDialogClose).not.toHaveBeenCalled();
  });

  it("closes alone on Escape inside a Dialog with focus on another control in the Dialog", async () => {
    const user = userEvent.setup();
    const { onDialogClose, onClose } = inDialog();
    await openFrom(user);

    // Tab moves on out of it, and leaves it open.
    screen.getByRole("button", { name: "Done" }).focus();
    await user.keyboard("{Escape}");
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
    expect(onDialogClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Done" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(onDialogClose).toHaveBeenCalledWith("escape", "");
  });

  it("closes when a Dialog around it closes, like from its Done button", async () => {
    const user = userEvent.setup();
    const { onClose } = inDialog();
    await openFrom(user);

    screen.getByRole("button", { name: "Done" }).focus();
    await user.keyboard("{Enter}");
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-state", "closed"));
    expect(shown.has(popover())).toBe(false);
    expect(onClose.mock.calls).toEqual([["closed"]]);
    expect(screen.getByRole("button", { name: "Filters", hidden: true })).toHaveAttribute("aria-expanded", "false");
  });

  it("closes alone on Escape inside a Dialog with focus on the Dialog itself, like after a click on its text", async () => {
    const user = userEvent.setup();
    const { onDialogClose, onClose } = inDialog();
    await openFrom(user);

    // A click on text that can't take focus leaves it on the <dialog>.
    const dialog = screen.getByRole("dialog", { name: "Settings" });
    dialog.tabIndex = -1;
    dialog.focus();
    await user.keyboard("{Escape}");
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(onClose.mock.calls).toEqual([["escape"]]);
    expect(onDialogClose).not.toHaveBeenCalled();

    await user.keyboard("{Escape}");
    expect(onDialogClose).toHaveBeenCalledWith("escape", "");
  });

  it("leaves Escape to a control in the Dialog that handles it first", async () => {
    const user = userEvent.setup();
    const doneKeydown = vi.fn((event: KeyboardEvent) => event.key === "Escape" && event.preventDefault());
    const { onDialogClose, onClose } = inDialog({ doneKeydown });
    await openFrom(user);

    screen.getByRole("button", { name: "Done" }).focus();
    await user.keyboard("{Escape}");
    expect(doneKeydown).toHaveBeenCalled();
    expect(popover()).toHaveAttribute("data-state", "open");
    expect(onClose).not.toHaveBeenCalled();
    expect(onDialogClose).not.toHaveBeenCalled();
  });

  // A popover with a Filters button and its own popover inside it, in a Dialog or not.
  function nested({ dialog = false } = {}) {
    const content = () => [
      button("Share", { popovertarget: "share" }),
      h(Popover, { id: "share", title: "Share" }, () => [
        button("Filters", { popovertarget: "filters" }),
        h(Popover, { id: "filters", title: "Filters" }, () => field("open-only", "Open issues only")),
      ]),
      button("Done"),
    ];
    render(dialog ? { render: () => h(Dialog, { id: "settings", title: "Settings", open: true }, content) } : { render: content });
    const state = (id: string) => document.getElementById(id)!.getAttribute("data-state");
    return { state };
  }

  it("closes only the inner of two nested popovers on Escape, with focus in the outer", async () => {
    const user = userEvent.setup();
    const { state } = nested();
    await openFrom(user, "Share");
    await openFrom(user, "Filters");
    expect([state("share"), state("filters")]).toEqual(["open", "open"]);

    screen.getByRole("button", { name: "Filters" }).focus();
    within(document.getElementById("share")!).getAllByRole("button", { name: "Close" })[0]!.focus();
    await user.keyboard("{Escape}");
    expect([state("share"), state("filters")]).toEqual(["open", "closed"]);
    await user.keyboard("{Escape}");
    expect([state("share"), state("filters")]).toEqual(["closed", "closed"]);
  });

  it("closes only the inner of two nested popovers on Escape in a Dialog, with focus elsewhere in it", async () => {
    const user = userEvent.setup();
    const { state } = nested({ dialog: true });
    await openFrom(user, "Share");
    await openFrom(user, "Filters");

    screen.getByRole("button", { name: "Done" }).focus();
    await user.keyboard("{Escape}");
    expect([state("share"), state("filters")]).toEqual(["open", "closed"]);
    await user.keyboard("{Escape}");
    expect([state("share"), state("filters")]).toEqual(["closed", "closed"]);
  });

  // Two buttons that open the same popover, like a toolbar's and a menu's.
  function twoTriggers() {
    render({
      render: () => [
        button("Filters", { popovertarget: "filters", "aria-haspopup": "dialog" }),
        button("More filters", { popovertarget: "filters", "aria-haspopup": "dialog" }),
        h(Popover, { id: "filters", title: "Filters" }, () => field("open-only", "Open issues only")),
      ],
    });
    return [screen.getByRole("button", { name: "Filters" }), screen.getByRole("button", { name: "More filters" })] as const;
  }

  it("marks the trigger that opened it as expanded, and every trigger as collapsed while it's closed", async () => {
    const user = userEvent.setup();
    const [first, second] = twoTriggers();
    await nextTick();
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "false");

    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{Escape}");
    expect(second).toHaveAttribute("aria-expanded", "false");
  });

  it("anchors to the trigger that opened it, and only that one", async () => {
    const user = userEvent.setup();
    const [first, second] = twoTriggers();

    await user.click(first);
    const anchor = first.style.getPropertyValue("anchor-name");
    expect(anchor).toMatch(/^--popover-/);
    await user.keyboard("{Escape}");
    expect(first.style.getPropertyValue("anchor-name")).toBe("");

    await user.click(second);
    expect(second.style.getPropertyValue("anchor-name")).toBe(anchor);
    expect(first.style.getPropertyValue("anchor-name")).toBe("");
  });

  it("collapses the last trigger when another one opens it again before the browser says it closed", async () => {
    const user = userEvent.setup();
    const [first, second] = twoTriggers();
    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "true");

    deferToggle = true;
    popover().hidePopover();
    first.click();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");
    expect(second.style.getPropertyValue("anchor-name")).toBe("");

    // The last trigger no longer listens: its Escape is left to the browser, which closes the
    // popover as it would from anywhere else on the page.
    const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    second.dispatchEvent(escape);
    expect(escape.defaultPrevented).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "false");
  });

  it("collapses its trigger when it unmounts while it's open", async () => {
    const user = userEvent.setup();
    const shownPopover = ref(true);
    render({
      render: () => [
        button("Filters", { popovertarget: "filters" }),
        shownPopover.value ? h(Popover, { id: "filters", title: "Filters" }, () => field("open-only", "Open issues only")) : null,
      ],
    });
    await openFrom(user);
    const el = popover();
    expect(screen.getByRole("button", { name: "Filters" })).toHaveAttribute("aria-expanded", "true");

    shownPopover.value = false;
    await nextTick();
    expect(shown.has(el)).toBe(false);
    expect(screen.getByRole("button", { name: "Filters" })).toHaveAttribute("aria-expanded", "false");
  });

  it("opens again when your code closes it and opens it again before the browser says it closed", async () => {
    deferToggle = true;
    const open = ref(false);
    render({
      render: () => [
        button("Filters", { popovertarget: "filters" }),
        h(Popover, { id: "filters", title: "Filters", open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () =>
          field("open-only", "Open issues only"),
        ),
      ],
    });

    open.value = true;
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-state", "open"));
    // Closed, then opened again, before the `toggle` for the close arrives.
    open.value = false;
    await nextTick();
    open.value = true;
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(shown.has(popover())).toBe(true);
    expect(popover()).toHaveAttribute("data-state", "open");
    expect(open.value).toBe(true);
  });

  it("closes when your code opens it and closes it again before the browser says it opened", async () => {
    deferToggle = true;
    const open = ref(false);
    render({
      render: () => [
        button("Filters", { popovertarget: "filters" }),
        h(Popover, { id: "filters", title: "Filters", open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () =>
          field("open-only", "Open issues only"),
        ),
      ],
    });

    open.value = true;
    await nextTick();
    open.value = false;
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(shown.has(popover())).toBe(false);
    expect(popover()).toHaveAttribute("data-state", "closed");
    expect(open.value).toBe(false);
  });

  it("opens and closes with v-model:open, without firing close, and keeps it in step with its trigger and the browser", async () => {
    const user = userEvent.setup();
    const open = ref(false);
    const onClose = vi.fn();
    render({
      render: () => [
        button("Filters", { popovertarget: "filters" }),
        h(Popover, { id: "filters", title: "Filters", open: open.value, "onUpdate:open": (value: boolean) => (open.value = value), onClose }, () =>
          field("open-only", "Open issues only"),
        ),
        h("a", { href: "#issues" }, "Issues"),
      ],
    });

    open.value = true;
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-state", "open"));
    expect(screen.getByRole("textbox")).toHaveFocus();
    open.value = false;
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-state", "closed"));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Filters" })).toHaveFocus();

    // Its trigger opens it, and a press outside closes it, and `open` follows both.
    await openFrom(user);
    expect(open.value).toBe(true);
    await user.click(screen.getByRole("link", { name: "Issues" }));
    expect(open.value).toBe(false);
    expect(onClose.mock.calls).toEqual([["outside"]]);
  });

  it("opens on mount when open is true", async () => {
    render(Popover, { props: { id: "filters", title: "Filters", open: true } });
    await nextTick();
    expect(popover()).toHaveAttribute("data-state", "open");
  });

  it("names its close button Close, or its closeLabel", async () => {
    const user = userEvent.setup();
    const { onClose } = page({ closeLabel: "Fermer" });
    await openFrom(user);

    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalledWith("close-button");
  });

  it("puts attributes, classes and listeners on the popover", async () => {
    const user = userEvent.setup();
    const onKeyup = vi.fn();
    page({ class: "wide", "data-testid": "filters", onKeyup });

    await openFrom(user);
    await user.keyboard("a");
    expect(popover()).toHaveClass("popover", "wide");
    expect(popover()).toHaveAttribute("data-testid", "filters");
    expect(onKeyup).toHaveBeenCalled();
  });

  it("mirrors its placement and state as data attributes, and marks its parts", () => {
    const { container } = render(Popover, {
      props: { id: "filters", title: "Filters", placement: "end" },
      slots: { default: () => "Content" },
    });

    const el = container.querySelector(".popover")!;
    expect(el).toHaveAttribute("data-placement", "end");
    expect(el).toHaveAttribute("data-state", "closed");
    expect(el).not.toHaveAttribute("data-side");
    const fallback = render(Popover, { props: { id: "hint", title: "Hint" } });
    expect(fallback.container.querySelector(".popover")).toHaveAttribute("data-placement", "bottom");
    // The close button is a Button, with parts of its own.
    const parts = [...el.querySelectorAll("[data-slot]")]
      .filter((part) => !part.parentElement?.closest('[data-slot="close"]'))
      .map((part) => part.getAttribute("data-slot"));
    expect(parts).toEqual(["header", "title", "close", "body"]);
  });

  it("renders the same markup every time, with IDs from its own, and keeps its elements as it opens", async () => {
    const options = { props: { id: "filters", title: "Filters" }, slots: { default: () => "Content" } };
    const first = render(Popover, options).container.innerHTML;
    const { container, rerender } = render(Popover, options);
    // The anchor's name is generated once it mounts, so it's left out of the comparison.
    const strip = (html: string) => html.replace(/ style="[^"]*"/g, "");
    expect(strip(container.innerHTML)).toBe(strip(first));
    expect(first).not.toMatch(/id="(?!filters)/);

    const el = container.querySelector<HTMLElement>(".popover")!;
    const title = el.querySelector('[data-slot="title"]');
    await rerender({ open: true });
    await nextTick();
    expect(el).toHaveAttribute("data-state", "open");
    expect(container.querySelector(".popover")).toBe(el);
    expect(el.querySelector('[data-slot="title"]')).toBe(title);
  });

  it("draws an arrow when asked, hidden from assistive technologies, and sets data-side once it opens", async () => {
    const user = userEvent.setup();
    page({ arrow: true });
    const arrow = popover().querySelector('[data-slot="arrow"]');
    expect(arrow).toHaveAttribute("aria-hidden", "true");
    expect(arrow).toBeEmptyDOMElement();
    // jsdom has no layout, so the boxes are given: the popover below its trigger.
    screen.getByRole("button", { name: "Filters" }).getBoundingClientRect = () => new DOMRect(0, 100, 100, 30);
    popover().getBoundingClientRect = () => new DOMRect(0, 140, 200, 120);

    // Its size, corners and arrow, which jsdom computes from these.
    popover().style.width = "200px";
    popover().style.height = "120px";
    popover().style.borderTopLeftRadius = "8px";
    (arrow as HTMLElement).style.width = "12px";

    await openFrom(user);
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-side", "bottom"));
    // Across from the trigger's centre, 50px in from the popover's left edge.
    expect((arrow as HTMLElement).style.left).toBe("50px");

    // Flipped above a trigger near the left edge, as close to its centre as the corner allows:
    // the radius and half the arrow's diagonal, 8 + 12 / √2.
    screen.getByRole("button", { name: "Filters" }).getBoundingClientRect = () => new DOMRect(0, 300, 10, 30);
    popover().getBoundingClientRect = () => new DOMRect(0, 170, 200, 120);
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-side", "top"));
    expect(parseFloat((arrow as HTMLElement).style.left)).toBeCloseTo(8 + 12 / Math.SQRT2);
  });

  it("anchors to its trigger, and places start on the right in right-to-left text without anchor positioning", async () => {
    const user = userEvent.setup();
    // Like a browser without CSS anchor positioning, where the script places it.
    const supports = vi.spyOn(CSS, "supports").mockReturnValue(false);
    page({ placement: "start" });
    const trigger = screen.getByRole("button", { name: "Filters" });
    // A 200 × 100 popover, beside a trigger in the middle of a 1000 × 800 viewport.
    trigger.getBoundingClientRect = () => new DOMRect(400, 300, 100, 30);
    trigger.style.direction = "rtl";
    popover().style.width = "200px";
    popover().style.height = "100px";
    Object.defineProperties(document.documentElement, { clientWidth: { value: 1000, configurable: true }, clientHeight: { value: 800, configurable: true } });

    await openFrom(user);
    await nextTick();
    const anchor = trigger.style.getPropertyValue("anchor-name");
    expect(anchor).toMatch(/^--popover-/);
    expect(popover().style.getPropertyValue("position-anchor")).toBe(anchor);
    // Its start is the trigger's right in right-to-left text: past its right edge, at 500.
    expect(parseFloat(popover().style.left)).toBe(500);
    Reflect.deleteProperty(document.documentElement, "clientWidth");
    Reflect.deleteProperty(document.documentElement, "clientHeight");
    supports.mockRestore();
  });

  it("places end on the left in right-to-left text, and flips bottom above a trigger near the bottom, without anchor positioning", async () => {
    const user = userEvent.setup();
    const supports = vi.spyOn(CSS, "supports").mockReturnValue(false);
    Object.defineProperties(document.documentElement, { clientWidth: { value: 1000, configurable: true }, clientHeight: { value: 800, configurable: true } });
    const { unmount } = page({ placement: "end" });
    const trigger = () => screen.getByRole("button", { name: "Filters" });
    const size = () => {
      popover().style.width = "200px";
      popover().style.height = "100px";
    };
    trigger().getBoundingClientRect = () => new DOMRect(400, 300, 100, 30);
    trigger().style.direction = "rtl";
    size();

    await openFrom(user);
    await nextTick();
    // Its end is the trigger's left: 200px wide, before its left edge at 400.
    expect(parseFloat(popover().style.left)).toBe(200);
    unmount();

    page();
    // 30px from the bottom of an 800px viewport, so 100px doesn't fit below.
    trigger().getBoundingClientRect = () => new DOMRect(400, 740, 100, 30);
    size();
    await openFrom(user);
    await nextTick();
    expect(parseFloat(popover().style.top)).toBe(640);
    Reflect.deleteProperty(document.documentElement, "clientWidth");
    Reflect.deleteProperty(document.documentElement, "clientHeight");
    supports.mockRestore();
  });

  it("opens below a start or end trigger with room on neither side, without anchor positioning", async () => {
    const user = userEvent.setup();
    const supports = vi.spyOn(CSS, "supports").mockReturnValue(false);
    // A phone 390px wide, with the trigger in the middle, and a 300px wide popover.
    Object.defineProperties(document.documentElement, { clientWidth: { value: 390, configurable: true }, clientHeight: { value: 844, configurable: true } });
    page({ placement: "start" });
    screen.getByRole("button", { name: "Filters" }).getBoundingClientRect = () => new DOMRect(160, 300, 70, 36);
    popover().style.width = "300px";
    popover().style.height = "100px";

    await openFrom(user);
    await nextTick();
    expect(parseFloat(popover().style.top)).toBe(336);
    Reflect.deleteProperty(document.documentElement, "clientWidth");
    Reflect.deleteProperty(document.documentElement, "clientHeight");
    supports.mockRestore();
  });

  it("warns in development when it has no title", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Popover, { props: { id: "untitled", title: "" } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no title"), expect.anything());

    warn.mockClear();
    render(Popover, { props: { id: "filters", title: "Filters" } });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
