import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type VNodeChild } from "vue";
import Dialog from "../dialog/Dialog.vue";
import Tooltip from "../tooltip/Tooltip.vue";
import Popover, { type PopoverProps } from "./Popover.vue";

// jsdom has no Popover API, so these stand in for the parts the Popover relies on: showing
// and hiding with `beforetoggle` and `toggle`, a `popovertarget` button toggling its popover,
// and the closes the browser makes itself, after the event that caused them, for an Escape
// nobody cancelled and for a press that starts and ends outside. They can't put it in the top
// layer or place it, which the checklist checks in a browser instead.
const shown = new Set<HTMLElement>();

function toggle(el: HTMLElement, newState: "open" | "closed", source: Element | null = null) {
  const event = (type: string) => Object.assign(new Event(type), { newState, oldState: newState === "open" ? "closed" : "open", source });
  el.dispatchEvent(event("beforetoggle"));
  if (newState === "open") shown.add(el);
  else shown.delete(el);
  // jsdom hides every popover, as browsers hide a closed one, but can't match :popover-open,
  // which shows an open one, so this stands in for it.
  el.style.display = newState === "open" ? "flex" : "";
  el.dispatchEvent(event("toggle"));
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
    this.open = false;
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
    queueMicrotask(() => outside(event.target).filter((el) => pressed.includes(el)).forEach((el) => el.hidePopover()));
  });
});

afterEach(() => shown.clear());

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
  function inDialog() {
    const onDialogClose = vi.fn();
    const onClose = vi.fn();
    render({
      render: () =>
        h(Dialog, { id: "settings", title: "Settings", open: true, onClose: onDialogClose }, () => [
          button("Filters", { popovertarget: "filters", "aria-haspopup": "dialog" }),
          h(Popover, { id: "filters", title: "Filters", onClose }, () => field("open-only", "Open issues only")),
        ]),
    });
    return { onDialogClose, onClose };
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

    await openFrom(user);
    await vi.waitFor(() => expect(popover()).toHaveAttribute("data-side", "bottom"));
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
