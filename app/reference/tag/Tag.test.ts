import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, ref } from "vue";
import Tag from "./Tag.vue";

const icon = () => h("svg", { viewBox: "0 0 24 24" }, [h("circle", { cx: 12, cy: 12, r: 4 })]);

describe("Tag", () => {
  it("is plain text, with no role and no place in the tab order", async () => {
    const user = userEvent.setup();
    const { container } = render(Tag, { props: { label: "Bug" } });

    const tag = container.firstElementChild!;
    expect(tag.tagName).toBe("SPAN");
    expect(tag).not.toHaveAttribute("role");
    expect(tag).not.toHaveAttribute("tabindex");
    expect(tag).toHaveTextContent(/^Bug$/);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("makes its label a link with href, found by its text", () => {
    const { container } = render(Tag, { props: { label: "Bug", href: "/labels/bug" } });

    const link = screen.getByRole("link", { name: "Bug" });
    expect(link).toHaveAttribute("href", "/labels/bug");
    expect(link).not.toHaveAttribute("aria-disabled");
    expect(container.querySelector("[data-slot='label']")).toContainElement(link);
  });

  it("puts what its default slot holds inside its own link", () => {
    render(Tag, { props: { label: "Bug", href: "/labels/bug" }, slots: { default: () => h("strong", "Bug") } });

    expect(screen.getByRole("link", { name: "Bug" }).querySelector("strong")).toHaveTextContent("Bug");
  });

  it("takes a link in its default slot, like a router's, which keeps its own attributes", () => {
    const { container } = render(Tag, {
      props: { label: "Bug", removable: true },
      slots: { default: () => h("a", { href: "/labels/bug", target: "_blank", rel: "noopener" }, "Bug") },
    });

    const link = screen.getByRole("link", { name: "Bug" });
    expect(container.querySelector("[data-slot='label']")).toContainElement(link);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    // The remove button stays the link's sibling.
    expect(link).not.toContainElement(screen.getByRole("button", { name: "Remove Bug" }));
  });

  it("has a native remove button, named after the tag, that Enter, Space and a click press", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(Tag, { props: { label: "Bug", removable: true, onRemove } });

    const remove = screen.getByRole("button", { name: "Remove Bug" });
    expect(remove.tagName).toBe("BUTTON");
    expect(remove).toHaveAttribute("type", "button");
    await user.tab();
    expect(remove).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    await user.click(remove);
    expect(onRemove).toHaveBeenCalledTimes(3);
    expect(onRemove.mock.calls[0]![0]).toBeInstanceOf(MouseEvent);
  });

  it("names its remove button with removeLabel, for other languages", () => {
    render(Tag, { props: { label: "Bug", removable: true, removeLabel: (label: string) => `${label} entfernen` } });

    expect(screen.getByRole("button", { name: "Bug entfernen" })).toBeInTheDocument();
  });

  it("keeps the link and the remove button apart, and reaches each with Tab", async () => {
    const user = userEvent.setup();
    render(Tag, { props: { label: "Bug", href: "/labels/bug", removable: true } });

    const link = screen.getByRole("link", { name: "Bug" });
    const remove = screen.getByRole("button", { name: "Remove Bug" });
    expect(link).not.toContainElement(remove);
    expect(remove).not.toContainElement(link);
    await user.tab();
    expect(link).toHaveFocus();
    await user.tab();
    expect(remove).toHaveFocus();
  });

  it("drops its remove button and turns its link off while disabled", async () => {
    const user = userEvent.setup();
    const { container } = render(Tag, { props: { label: "Bug", href: "/labels/bug", removable: true, disabled: true } });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Bug" });
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(container.firstElementChild).toHaveAttribute("data-disabled", "");
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("drops its remove button while read-only, and keeps its link", () => {
    const { container } = render(Tag, { props: { label: "Bug", href: "/labels/bug", removable: true, readonly: true } });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Bug" });
    expect(link).toHaveAttribute("href", "/labels/bug");
    expect(link).not.toHaveAttribute("aria-disabled");
    expect(container.firstElementChild).toHaveAttribute("data-readonly", "");
  });

  it("fires remove and stays, so its parent decides whether it goes", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const { container } = render(Tag, { props: { label: "Bug", removable: true, onRemove } });

    await user.click(screen.getByRole("button", { name: "Remove Bug" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(container).toHaveTextContent("Bug");
    expect(screen.getByRole("button", { name: "Remove Bug" })).toBeInTheDocument();
  });

  it("hides its icons from assistive technologies, so the text alone names it", () => {
    const { container } = render(Tag, {
      props: { label: "Bug", href: "/labels/bug", removable: true },
      slots: { leading: icon },
    });

    expect(container.querySelector("[data-slot='leading']")).toHaveAttribute("aria-hidden", "true");
    expect(within(screen.getByRole("button", { name: "Remove Bug" })).getByText((_, element) => element?.tagName === "svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getByRole("link")).toHaveAccessibleName("Bug");
  });

  it("keeps the whole of a long label in the DOM, which CSS cuts off on screen", () => {
    const label = "Needs a decision from the design systems team before the next release";
    const { container } = render(Tag, { props: { label } });

    expect(container.querySelector("[data-slot='label']")).toHaveTextContent(label);
  });

  it("takes the Input's five sizes, md by default", () => {
    const { container } = render({
      render: () => (["xs", "sm", undefined, "lg", "xl"] as const).map((size) => h(Tag, { label: "Bug", size })),
    });

    const sizes = [...container.querySelectorAll(".tag")].map((tag) => tag.getAttribute("data-size"));
    expect(sizes).toEqual(["xs", "sm", "md", "lg", "xl"]);
  });

  it("renders the tag itself, so attributes, listeners and refs land on it", async () => {
    const user = userEvent.setup();
    const onFocusin = vi.fn();
    const tag = ref<{ $el: HTMLElement }>();
    const { container } = render({
      render: () => h(Tag, { ref: tag, id: "bug", class: "label-bug", lang: "en", label: "Bug", href: "/labels/bug", onFocusin }),
    });

    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("id", "bug");
    expect(root).toHaveClass("tag", "label-bug");
    expect(root).toHaveAttribute("lang", "en");
    await user.tab();
    expect(onFocusin).toHaveBeenCalled();
    expect(tag.value?.$el).toBe(root);
  });

  it("takes its label, its icon and its remove button's icon through slots, and keeps the button's name", () => {
    const { container } = render(Tag, {
      props: { label: "Bug", removable: true },
      slots: { default: () => h("strong", "Bug"), leading: icon, remove: () => h("span", "×") },
    });

    expect(container.querySelector("[data-slot='label'] > strong")).toHaveTextContent("Bug");
    expect(container.querySelector("[data-slot='leading'] > svg")).toBeInTheDocument();
    const remove = screen.getByRole("button", { name: "Remove Bug" });
    expect(remove).toHaveTextContent("×");
  });

  it("mirrors its props as data attributes, and marks its parts with data-slot", () => {
    const { container } = render(Tag, {
      props: { label: "Bug", size: "lg", removable: true, readonly: false },
      slots: { leading: icon },
    });

    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).not.toHaveAttribute("data-disabled");
    expect(root).not.toHaveAttribute("data-readonly");
    const parts = [...container.querySelectorAll("[data-slot]")].map((part) => part.getAttribute("data-slot"));
    expect(parts).toEqual(["leading", "label", "remove"]);
  });

  it("renders the same markup every time, and only adds the link and the remove button when asked", async () => {
    const options = { props: { label: "Bug", href: "/labels/bug", removable: true }, slots: { leading: icon } };
    const first = render(Tag, options).container.innerHTML;
    const { container, rerender } = render(Tag, options);
    expect(container.innerHTML).toBe(first);
    expect(container.innerHTML).not.toMatch(/\bid=/);

    // Read-only takes the remove button away, and every other state changes attributes.
    const label = container.querySelector("[data-slot='label']");
    await rerender({ label: "Bug", href: "/labels/bug", removable: true, readonly: true, size: "sm" });
    expect(container.querySelector("[data-slot='label']")).toBe(label);
    expect(container.querySelector("[data-slot='remove']")).not.toBeInTheDocument();

    const plain = render(Tag, { props: { label: "Bug" } }).container;
    expect([...plain.querySelectorAll("[data-slot]")].map((part) => part.getAttribute("data-slot"))).toEqual(["label"]);
    expect(plain.querySelector("a")).not.toBeInTheDocument();
  });

  it("warns in development when it's removable without a label, and only then", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render({
      render: () => [
        h(Tag, { label: "Bug", removable: true }),
        h(Tag, { href: "/labels/bug" }, { default: () => "Bug" }),
      ],
    });
    expect(warn).not.toHaveBeenCalled();

    render(Tag, { props: { removable: true }, slots: { default: () => "Bug" } });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("removable without a label"), expect.anything());
    warn.mockRestore();
  });
});
