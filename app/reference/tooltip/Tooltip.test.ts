import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import Tooltip, { type TooltipProps } from "./Tooltip.vue";

// A trigger with a name of its own, like an icon-only Button's visually hidden label.
function tooltip(props: TooltipProps & Record<string, unknown>, name = "Settings") {
  return h(Tooltip, props, { default: ({ trigger }: { trigger: Record<string, unknown> }) => h("button", trigger, name) });
}

// jsdom has no Popover API, so a closed tooltip and an open one look the same to
// Testing Library's visibility checks: tests find it with `hidden: true`, or
// through its trigger, and read its state from `data-state`.
const tip = () => screen.getByRole("tooltip", { hidden: true });
// With type label, it has no role to find it by.
const tips = () => [...document.querySelectorAll<HTMLElement>(".tooltip")];

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  // Tooltips share the open one and the skipped delay, so let them settle between tests.
  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
  const setup = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  it("describes its trigger by default, as a role=tooltip that aria-describedby points to", async () => {
    render(tooltip({ label: "Changes apply to every project" }));
    // The ID is set once it mounts, so the server and the client never disagree on it.
    await nextTick();

    const button = screen.getByRole("button", { name: "Settings", description: "Changes apply to every project" });
    const tooltipElement = screen.getByRole("tooltip", { hidden: true });
    expect(button).toHaveAttribute("aria-describedby", tooltipElement.id);
    expect(tooltipElement).toHaveTextContent("Changes apply to every project");
    expect(tooltipElement).not.toHaveAttribute("aria-hidden");
    expect(button).not.toHaveAttribute("aria-labelledby");
  });

  it("only shows the trigger's own name with type label, hidden from screen readers and linked to nothing", async () => {
    render(tooltip({ label: "Settings", type: "label" }));
    await nextTick();

    const button = screen.getByRole("button", { name: "Settings" });
    const [tooltipElement] = tips();
    expect(tooltipElement).toHaveAttribute("aria-hidden", "true");
    expect(tooltipElement).not.toHaveAttribute("role");
    expect(button).not.toHaveAttribute("aria-describedby");
    expect(button).not.toHaveAttribute("aria-labelledby");
    expect(button).toHaveAccessibleDescription("");
    expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
  });

  it("stays in the page while it's closed, so the description is there before it opens", async () => {
    render(tooltip({ label: "Visible to everyone" }));
    await nextTick();

    expect(tip()).toHaveAttribute("data-state", "closed");
    expect(screen.getByRole("button")).toHaveAccessibleDescription("Visible to everyone");
  });

  it("keeps an id you pass, and points the trigger at it", async () => {
    render(tooltip({ label: "Visible to everyone", id: "visibility-hint" }));
    await nextTick();

    expect(tip()).toHaveAttribute("id", "visibility-hint");
    expect(screen.getByRole("button")).toHaveAttribute("aria-describedby", "visibility-hint");
  });

  it("leaves generated IDs out of the server's markup, so hydration can't leave the trigger pointing at nothing", async () => {
    const html = await renderToString(createSSRApp({ render: () => tooltip({ label: "Visible to everyone" }) }));

    expect(html).toContain('role="tooltip"');
    expect(html).not.toMatch(/ id=|aria-describedby|anchor/);
  });

  it("opens as soon as its trigger gets focus, and closes when focus leaves", async () => {
    const user = setup();
    render({ render: () => [tooltip({ label: "Visible to everyone" }), h("button", "Next")] });

    await user.tab();
    expect(screen.getByRole("button", { name: "Settings" })).toHaveFocus();
    expect(tip()).toHaveAttribute("data-state", "open");

    await user.tab();
    expect(tip()).toHaveAttribute("data-state", "closed");
  });

  it("opens on hover only after the delay, and not when the pointer leaves before it", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));
    const button = screen.getByRole("button");

    await user.hover(button);
    await vi.advanceTimersByTimeAsync(499);
    expect(tip()).toHaveAttribute("data-state", "closed");
    await vi.advanceTimersByTimeAsync(1);
    expect(tip()).toHaveAttribute("data-state", "open");

    await user.unhover(button);
    await vi.advanceTimersByTimeAsync(1000);
    await user.hover(button);
    await vi.advanceTimersByTimeAsync(300);
    await user.unhover(button);
    await vi.advanceTimersByTimeAsync(1000);
    expect(tip()).toHaveAttribute("data-state", "closed");
  });

  it("takes another delay", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone", delay: 1000 }));

    await user.hover(screen.getByRole("button"));
    await vi.advanceTimersByTimeAsync(999);
    expect(tip()).toHaveAttribute("data-state", "closed");
    await vi.advanceTimersByTimeAsync(1);
    expect(tip()).toHaveAttribute("data-state", "open");
  });

  it("skips the delay when the pointer moves straight on to the next trigger", async () => {
    const user = setup();
    render({
      render: () => [tooltip({ label: "Bold", type: "label" }, "Bold"), tooltip({ label: "Italic", type: "label" }, "Italic")],
    });
    const [bold, italic] = screen.getAllByRole("button");
    const [boldTip, italicTip] = tips();

    await user.hover(bold!);
    await vi.advanceTimersByTimeAsync(500);
    expect(boldTip).toHaveAttribute("data-state", "open");

    await user.hover(italic!);
    expect(boldTip).toHaveAttribute("data-state", "closed");
    expect(italicTip).toHaveAttribute("data-state", "open");
  });

  it("skips the delay for a moment after a tooltip closes, and only for a moment", async () => {
    const user = setup();
    render({
      render: () => [
        tooltip({ label: "Bold", type: "label" }, "Bold"),
        tooltip({ label: "Italic", type: "label" }, "Italic"),
        tooltip({ label: "Underline", type: "label" }, "Underline"),
      ],
    });
    const [bold, italic, underline] = screen.getAllByRole("button");
    const [, italicTip, underlineTip] = tips();

    await user.hover(bold!);
    await vi.advanceTimersByTimeAsync(500);
    await user.unhover(bold!);
    // Closed after its grace period, then on to the next trigger within 300ms.
    await vi.advanceTimersByTimeAsync(250);
    await user.hover(italic!);
    expect(italicTip).toHaveAttribute("data-state", "open");

    await user.unhover(italic!);
    await vi.advanceTimersByTimeAsync(1000);
    await user.hover(underline!);
    expect(underlineTip).toHaveAttribute("data-state", "closed");
    await vi.advanceTimersByTimeAsync(500);
    expect(underlineTip).toHaveAttribute("data-state", "open");
  });

  it("lets the pointer move onto the tooltip without closing, and closes once it leaves both", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));
    const button = screen.getByRole("button");

    await user.hover(button);
    await vi.advanceTimersByTimeAsync(500);
    await user.unhover(button);
    await user.hover(tip());
    await vi.advanceTimersByTimeAsync(1000);
    expect(tip()).toHaveAttribute("data-state", "open");

    await user.unhover(tip());
    await vi.advanceTimersByTimeAsync(1000);
    expect(tip()).toHaveAttribute("data-state", "closed");
  });

  it("stays open while its trigger is hovered or focused, and never closes on a timer", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));
    const button = screen.getByRole("button");

    await user.tab();
    await user.hover(button);
    await user.unhover(button);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(tip()).toHaveAttribute("data-state", "open");
  });

  it("stays open while the pointer is on its trigger after focus leaves, and closes once it leaves too", async () => {
    const user = setup();
    render({ render: () => [tooltip({ label: "Visible to everyone" }), h("button", "Next")] });
    const button = screen.getByRole("button", { name: "Settings" });

    await user.tab();
    await user.hover(button);
    await user.tab();
    await vi.advanceTimersByTimeAsync(1000);
    expect(tip()).toHaveAttribute("data-state", "open");

    await user.unhover(button);
    await vi.advanceTimersByTimeAsync(1000);
    expect(tip()).toHaveAttribute("data-state", "closed");
  });

  it("closes with Escape, keeping focus on the trigger", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));

    await user.tab();
    await user.keyboard("{Escape}");
    expect(tip()).toHaveAttribute("data-state", "closed");
    expect(screen.getByRole("button")).toHaveFocus();
  });

  it("closes with Escape after a hover, wherever focus is", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));

    await user.hover(screen.getByRole("button"));
    await vi.advanceTimersByTimeAsync(500);
    await user.keyboard("{Escape}");
    expect(tip()).toHaveAttribute("data-state", "closed");
    expect(document.body).toHaveFocus();
  });

  it("keeps Escape from reaching a dialog around it while it's open, and only then", async () => {
    const user = setup();
    const escapes = vi.fn();
    const onKeydown = (event: KeyboardEvent) => event.key === "Escape" && escapes();
    render({ render: () => h("div", { role: "dialog", "aria-label": "Edit project", onKeydown }, [tooltip({ label: "Visible to everyone" })]) });
    document.addEventListener("keydown", onKeydown);
    // Its default action is cancelled too, which is what keeps a native <dialog> open.
    let escape: KeyboardEvent | undefined;
    const record = (event: KeyboardEvent) => event.key === "Escape" && (escape = event);
    window.addEventListener("keydown", record, true);

    await user.tab();
    await user.keyboard("{Escape}");
    expect(tip()).toHaveAttribute("data-state", "closed");
    expect(escapes).not.toHaveBeenCalled();
    expect(escape?.defaultPrevented).toBe(true);
    window.removeEventListener("keydown", record, true);

    // With no tooltip open, Escape is the dialog's again.
    await user.keyboard("{Escape}");
    expect(escapes).toHaveBeenCalledTimes(2);
    document.removeEventListener("keydown", onKeydown);
  });

  it("opens one at a time", async () => {
    const user = setup();
    render({
      render: () => [tooltip({ label: "Bold", type: "label" }, "Bold"), tooltip({ label: "Italic", type: "label" }, "Italic")],
    });
    const [boldTip, italicTip] = tips();

    // Focus on one, the pointer on the other.
    await user.tab();
    expect(boldTip).toHaveAttribute("data-state", "open");
    await user.hover(screen.getByRole("button", { name: "Italic" }));
    await vi.advanceTimersByTimeAsync(500);
    expect(boldTip).toHaveAttribute("data-state", "closed");
    expect(italicTip).toHaveAttribute("data-state", "open");
  });

  it("never opens on a tap, even though the tap focuses the trigger", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));
    const button = screen.getByRole("button");

    await user.pointer({ keys: "[TouchA]", target: button });
    await vi.advanceTimersByTimeAsync(1000);
    expect(button).toHaveFocus();
    expect(tip()).toHaveAttribute("data-state", "closed");
  });

  it("still opens on keyboard focus after a touch that didn't focus the trigger, like a scroll", async () => {
    const user = setup();
    render(tooltip({ label: "Visible to everyone" }));
    const button = screen.getByRole("button");

    // A touch that turns into a scroll is cancelled, and never focuses anything.
    button.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch", bubbles: true }));
    button.dispatchEvent(new PointerEvent("pointercancel", { pointerType: "touch", bubbles: true }));
    await user.tab();
    expect(button).toHaveFocus();
    expect(tip()).toHaveAttribute("data-state", "open");
  });

  it("passes the trigger props to the element you render, with no wrapper of its own", () => {
    const { container } = render(tooltip({ label: "Visible to everyone" }));

    const button = screen.getByRole("button");
    expect(container.firstElementChild).toBe(button);
    expect(button.nextElementSibling).toBe(tip());
  });

  it("puts classes and attributes on the tooltip", () => {
    render(tooltip({ label: "Visible to everyone", class: "wide", "data-testid": "hint" }));

    expect(tip()).toHaveClass("tooltip", "wide");
    expect(tip()).toHaveAttribute("data-testid", "hint");
    expect(screen.getByRole("button")).not.toHaveClass("wide");
  });
});
