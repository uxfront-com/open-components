import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import TagGroup, { type TagGroupItem, type TagGroupProps } from "./TagGroup.vue";

const LABELS: TagGroupItem[] = [
  { value: "bug", label: "Bug" },
  { value: "docs", label: "Docs" },
  { value: "feature", label: "Feature" },
];

const announcements = () => document.querySelector('[role="status"]')?.textContent ?? "";

// A page that owns its tags: it drops a tag when the group fires remove, unless it keeps it,
// and renders a Reset button after the group, which some tests pass as fallbackFocus.
function renderOwned(props: Partial<TagGroupProps> & { keep?: string[]; withFallback?: boolean } = {}) {
  const { keep = [], withFallback = false, ...rest } = props;
  const tags = ref<TagGroupItem[]>(props.tags ?? LABELS.map((tag) => ({ ...tag })));
  const reset = ref<HTMLElement | null>(null);
  const onRemove = vi.fn((tag: TagGroupItem) => {
    if (!keep.includes(tag.value)) tags.value = tags.value.filter((other) => other.value !== tag.value);
  });
  const Page = defineComponent({
    setup: () => () => [
      h(TagGroup, {
        label: "Labels",
        removable: true,
        ...rest,
        tags: tags.value,
        fallbackFocus: withFallback ? () => reset.value : undefined,
        onRemove,
      }),
      h("button", { ref: reset, type: "button" }, "Reset"),
    ],
  });
  return { ...render(Page), tags, onRemove };
}

describe("TagGroup", () => {
  it("is a list named by its label, with an item per tag, each holding a Tag", () => {
    render(TagGroup, { props: { tags: LABELS, label: "Labels" } });

    const list = screen.getByRole("list", { name: "Labels" });
    expect(list.tagName).toBe("UL");
    // Safari drops the role of a list without bullets, unless it's set.
    expect(list).toHaveAttribute("role", "list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items.map((item) => item.tagName)).toEqual(["LI", "LI", "LI"]);
    expect(items.map((item) => item.firstElementChild?.className)).toEqual(["tag", "tag", "tag"]);
    expect(items.map((item) => item.textContent)).toEqual(["Bug", "Docs", "Feature"]);
  });

  it("takes its name from a visible heading through aria-labelledby, and its description through aria-describedby", () => {
    const { container } = render({
      render: () => [
        h("h2", { id: "labels-heading" }, "Labels"),
        h("p", { id: "labels-hint" }, "Remove a label to stop tracking it."),
        h(TagGroup, { tags: LABELS, "aria-labelledby": "labels-heading", "aria-describedby": "labels-hint" }),
      ],
    });

    const list = screen.getByRole("list", { name: "Labels" });
    expect(list).toHaveAttribute("aria-labelledby", "labels-heading");
    expect(list).toHaveAccessibleDescription("Remove a label to stop tracking it.");
    expect(container.querySelector(".tag-group")).not.toHaveAttribute("aria-labelledby");
  });

  it("warns in development when the list has no name, and only then", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render({
      render: () => [h(TagGroup, { tags: LABELS, label: "Labels" }), h(TagGroup, { tags: LABELS, "aria-labelledby": "heading" })],
    });
    expect(warn).not.toHaveBeenCalled();

    render(TagGroup, { props: { tags: LABELS } });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("has no name"), expect.anything());
    warn.mockRestore();
  });

  it("puts each link and remove button in the tab order, and the arrow keys move nothing", async () => {
    const user = userEvent.setup();
    render(TagGroup, {
      props: {
        label: "Labels",
        removable: true,
        tags: [
          { value: "bug", label: "Bug", href: "/labels/bug" },
          { value: "docs", label: "Docs" },
        ],
      },
    });

    await user.tab();
    expect(screen.getByRole("link", { name: "Bug" })).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowDown}");
    expect(screen.getByRole("link", { name: "Bug" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Remove Bug" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Remove Docs" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}{ArrowUp}{Home}{End}");
    expect(screen.getByRole("button", { name: "Remove Docs" })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
    expect(screen.getByRole("list")).not.toHaveAttribute("tabindex");
  });

  describe("after a removal", () => {
    it("moves focus to the next tag's remove button", async () => {
      const user = userEvent.setup();
      renderOwned();

      await user.click(screen.getByRole("button", { name: "Remove Bug" }));
      expect(screen.queryByText("Bug")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Remove Docs" })).toHaveFocus();
    });

    it("skips a next tag that has no remove button, to the one after it", async () => {
      const user = userEvent.setup();
      renderOwned({
        tags: [
          { value: "bug", label: "Bug" },
          { value: "docs", label: "Docs", readonly: true },
          { value: "feature", label: "Feature" },
        ],
      });

      await user.click(screen.getByRole("button", { name: "Remove Bug" }));
      expect(screen.getByRole("button", { name: "Remove Feature" })).toHaveFocus();
    });

    it("moves focus to fallbackFocus when no tag follows", async () => {
      const user = userEvent.setup();
      renderOwned({ withFallback: true });

      await user.click(screen.getByRole("button", { name: "Remove Feature" }));
      expect(screen.getByRole("button", { name: "Reset" })).toHaveFocus();
    });

    it("moves focus to the previous tag's remove button when no tag follows and there's no fallbackFocus", async () => {
      const user = userEvent.setup();
      renderOwned();

      await user.click(screen.getByRole("button", { name: "Remove Feature" }));
      expect(screen.getByRole("button", { name: "Remove Docs" })).toHaveFocus();
    });

    it("moves focus to the empty state once the last tag has gone", async () => {
      const user = userEvent.setup();
      renderOwned({ tags: [{ value: "bug", label: "Bug" }] });

      await user.click(screen.getByRole("button", { name: "Remove Bug" }));
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.getByText("No tags")).toHaveFocus();
    });

    it("moves focus to the list when the tags left have no remove button, until it leaves", async () => {
      const user = userEvent.setup();
      renderOwned({
        tags: [
          { value: "bug", label: "Bug", readonly: true },
          { value: "docs", label: "Docs" },
        ],
      });

      await user.click(screen.getByRole("button", { name: "Remove Docs" }));
      const list = screen.getByRole("list", { name: "Labels" });
      expect(list).toHaveFocus();
      expect(list).toHaveAttribute("tabindex", "-1");
      await user.tab();
      expect(list).not.toHaveAttribute("tabindex");
    });

    it("works with the keyboard as it does with a pointer", async () => {
      const user = userEvent.setup();
      renderOwned();

      await user.tab();
      expect(screen.getByRole("button", { name: "Remove Bug" })).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(screen.getByRole("button", { name: "Remove Docs" })).toHaveFocus();
      await user.keyboard(" ");
      expect(screen.getByRole("button", { name: "Remove Feature" })).toHaveFocus();
    });

    it("announces the tag that went through the shared live region, once it's gone", async () => {
      const user = userEvent.setup();
      renderOwned();

      await user.click(screen.getByRole("button", { name: "Remove Docs" }));
      expect(announcements()).toContain("Docs removed");
    });

    it("names the announcement with removedLabel, for other languages", async () => {
      const user = userEvent.setup();
      renderOwned({ removeLabel: (label) => `${label} entfernen`, removedLabel: (label) => `${label} entfernt` });

      await user.click(screen.getByRole("button", { name: "Feature entfernen" }));
      expect(announcements()).toContain("Feature entfernt");
    });

    it("moves focus even when the press didn't focus the button, like a click in Safari", async () => {
      renderOwned();

      screen.getByRole("button", { name: "Remove Bug" }).click();
      await nextTick();
      await nextTick();
      expect(screen.getByRole("button", { name: "Remove Docs" })).toHaveFocus();
    });
  });

  it("fires remove with the tag, and keeps a tag the app keeps, without moving focus or announcing it", async () => {
    const user = userEvent.setup();
    const { onRemove } = renderOwned({ keep: ["bug"] });
    const before = announcements();

    const remove = screen.getByRole("button", { name: "Remove Bug" });
    await user.click(remove);
    expect(onRemove).toHaveBeenCalledWith({ value: "bug", label: "Bug" });
    expect(screen.getByText("Bug")).toBeInTheDocument();
    expect(remove).toHaveFocus();
    expect(announcements()).toBe(before);
  });

  it("leaves focus where the app put it, like a dialog that asked first, and still announces the tag once it's gone", async () => {
    const user = userEvent.setup();
    const { tags } = renderOwned({ keep: ["bug"] });
    const reset = screen.getByRole("button", { name: "Reset" });

    await user.click(screen.getByRole("button", { name: "Remove Bug" }));
    // The app asks first, somewhere else, then drops the tag.
    reset.focus();
    tags.value = tags.value.filter((tag) => tag.value !== "bug");
    await nextTick();
    await nextTick();
    expect(reset).toHaveFocus();
    expect(announcements()).toContain("Bug removed");
  });

  it("leaves focus where it is, and announces nothing, when the app takes a tag away for another reason", async () => {
    const user = userEvent.setup();
    const { tags } = renderOwned();
    const reset = screen.getByRole("button", { name: "Reset" });
    await user.click(reset);
    const before = announcements();

    tags.value = tags.value.slice(1);
    await nextTick();
    await nextTick();
    expect(reset).toHaveFocus();
    expect(announcements()).toBe(before);
  });

  it("shows its empty state with no tags, from emptyLabel or the empty slot, focusable but not a tab stop", async () => {
    const user = userEvent.setup();
    const { container } = render(TagGroup, { props: { tags: [], label: "Labels", emptyLabel: "No labels yet" } });

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    const empty = screen.getByText("No labels yet");
    expect(empty).toHaveAttribute("data-slot", "empty");
    expect(empty).toHaveAttribute("tabindex", "-1");
    await user.tab();
    expect(document.body).toHaveFocus();

    const slotted = render(TagGroup, { props: { tags: [], label: "Labels" }, slots: { empty: () => h("em", "Nothing here") } }).container;
    expect(slotted.querySelector("[data-slot='empty'] > em")).toHaveTextContent("Nothing here");
    expect(container.querySelector("[data-slot='empty']")).toHaveTextContent("No labels yet");
    expect(render(TagGroup, { props: { tags: [], label: "Labels" } }).getByText("No tags")).toBeInTheDocument();
  });

  it("passes size, disabled and readonly to every Tag, and each tag's href, disabled and readonly to its own", () => {
    const { container } = render(TagGroup, {
      props: {
        label: "Labels",
        size: "sm",
        removable: true,
        tags: [
          { value: "bug", label: "Bug", href: "/labels/bug" },
          { value: "docs", label: "Docs", disabled: true },
          { value: "feature", label: "Feature", readonly: true },
          { value: "triage", label: "Triage" },
        ],
      },
    });

    const tags = [...container.querySelectorAll("[data-slot='item'] > span")];
    expect(tags.map((tag) => tag.getAttribute("data-size"))).toEqual(["sm", "sm", "sm", "sm"]);
    expect(screen.getByRole("link", { name: "Bug" })).toHaveAttribute("href", "/labels/bug");
    expect(tags[1]).toHaveAttribute("data-disabled", "");
    expect(tags[2]).toHaveAttribute("data-readonly", "");
    expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toEqual(["Remove Bug", "Remove Triage"]);

    const all = render(TagGroup, { props: { label: "Others", tags: LABELS, removable: true, disabled: true } }).container;
    expect([...all.querySelectorAll("[data-slot='item'] > span")].every((tag) => tag.hasAttribute("data-disabled"))).toBe(true);
    const readonly = render(TagGroup, { props: { label: "More", tags: LABELS, removable: true, readonly: true } }).container;
    expect([...readonly.querySelectorAll("[data-slot='item'] > span")].every((tag) => tag.hasAttribute("data-readonly"))).toBe(true);
    expect(readonly.querySelector("button")).not.toBeInTheDocument();
  });

  it("has no selection and no grid: no aria-selected, aria-pressed, grid or row", () => {
    const { container } = render(TagGroup, {
      props: { label: "Labels", removable: true, tags: [{ value: "bug", label: "Bug", href: "/labels/bug" }, ...LABELS.slice(1)] },
    });

    expect(container.querySelector("[aria-selected], [aria-pressed], [role='grid'], [role='row'], [role='gridcell']")).toBeNull();
    expect(container.querySelector("[tabindex]")).toBeNull();
  });

  it("passes its tag and leading slots to each Tag, and keeps each remove button's name", () => {
    const { container } = render(TagGroup, {
      props: { label: "Labels", tags: LABELS.slice(0, 2), removable: true },
      slots: {
        tag: ({ tag }: { tag: TagGroupItem }) => h("strong", tag.label),
        leading: ({ tag }: { tag: TagGroupItem }) => h("svg", { "data-icon": tag.value }),
      },
    });

    expect([...container.querySelectorAll("[data-slot='label'] > strong")].map((label) => label.textContent)).toEqual(["Bug", "Docs"]);
    expect([...container.querySelectorAll("[data-slot='leading'] > svg")].map((icon) => icon.getAttribute("data-icon"))).toEqual(["bug", "docs"]);
    expect(screen.getByRole("button", { name: "Remove Docs" })).toBeInTheDocument();
  });

  it("renders the group itself as its root, so attributes, listeners and refs land on it, and names its list", async () => {
    const user = userEvent.setup();
    const onFocusin = vi.fn();
    const group = ref<{ $el: HTMLElement }>();
    const { container } = render({
      render: () =>
        h(TagGroup, { ref: group, id: "labels", class: "issue-labels", label: "Labels", tags: LABELS, removable: true, onFocusin }),
    });

    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("id", "labels");
    expect(root).toHaveClass("tag-group", "issue-labels");
    expect(root).not.toHaveAttribute("aria-label");
    expect(screen.getByRole("list")).toHaveAccessibleName("Labels");
    await user.tab();
    expect(onFocusin).toHaveBeenCalled();
    expect(group.value?.$el).toBe(root);
  });

  it("mirrors its size as a data attribute, and marks its parts with data-slot", () => {
    const { container, rerender } = render(TagGroup, { props: { label: "Labels", tags: LABELS, size: "lg" } });

    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root.firstElementChild).toHaveAttribute("data-slot", "list");
    expect([...root.querySelectorAll("[data-slot='item']")]).toHaveLength(3);
    return rerender({ tags: [] }).then(() => {
      expect(root.firstElementChild).toHaveAttribute("data-slot", "empty");
    });
  });

  it("renders the same markup every time, with no generated IDs", () => {
    const options = { props: { label: "Labels", tags: LABELS, removable: true } };
    const first = render(TagGroup, options).container.innerHTML;
    const { container } = render(TagGroup, options);
    expect(container.innerHTML).toBe(first);
    expect(container.innerHTML).not.toMatch(/\bid=/);
  });
});
