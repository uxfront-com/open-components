import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, ref } from "vue";
import Card from "./Card.vue";

const image = () => h("img", { src: "engine.png", alt: "" });
const button = (name: string, onClick?: () => void) => h("button", { type: "button", onClick }, name);

describe("Card", () => {
  it("is an article, found by its heading", () => {
    render(Card, { props: { heading: "Analytical Engine" }, slots: { default: () => "A mechanical computer." } });

    const card = screen.getByRole("article");
    expect(within(card).getByRole("heading", { name: "Analytical Engine" })).toBeInTheDocument();
    expect(card).toHaveTextContent("A mechanical computer.");
  });

  it("renders a section, a div or a list item with as", () => {
    const { container } = render({
      render: () => [
        h(Card, { as: "section", heading: "Section" }),
        h(Card, { as: "div", heading: "Div" }),
        h("ul", [h(Card, { as: "li", heading: "List item" })]),
      ],
    });

    expect(container.querySelector("section.card")).toBeInTheDocument();
    expect(container.querySelector("div.card")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveClass("card");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("has a heading at the level it's given, and level 3 by default", () => {
    render({
      render: () => [h(Card, { heading: "Default" }), h(Card, { heading: "Second", headingLevel: 2 })],
    });

    expect(screen.getByRole("heading", { name: "Default" })).toHaveProperty("tagName", "H3");
    expect(screen.getByRole("heading", { name: "Second", level: 2 })).toBeInTheDocument();
  });

  it("puts its heading first, before its eyebrow and media, whatever the order on screen", () => {
    const { container } = render(Card, {
      props: { heading: "Analytical Engine" },
      slots: { eyebrow: () => "Project", media: image, default: () => "A mechanical computer." },
    });

    const text = [...container.querySelectorAll("[data-slot='heading'], [data-slot='eyebrow'], img")];
    expect(text.map((element) => element.getAttribute("data-slot") ?? element.tagName)).toEqual(["heading", "eyebrow", "IMG"]);
  });

  it("links through its heading alone, without wrapping the card in a link or listening for clicks on it", () => {
    const { container } = render(Card, {
      props: { heading: "Analytical Engine", href: "/projects/analytical-engine" },
      slots: { eyebrow: () => "Project", default: () => "A mechanical computer." },
    });

    const link = screen.getByRole("link", { name: "Analytical Engine" });
    expect(link).toHaveAttribute("href", "/projects/analytical-engine");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(link).toHaveTextContent(/^Analytical Engine$/);
    expect(screen.getByRole("heading", { name: "Analytical Engine" })).toContainElement(link);

    const card = container.firstElementChild!;
    expect(card.tagName).toBe("ARTICLE");
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
    expect(card).not.toHaveAttribute("onclick");
  });

  it("stretches a link from the heading slot, like a router's, as it does its own", () => {
    render(Card, {
      slots: { heading: () => h("a", { href: "/projects/analytical-engine" }, "Analytical Engine") },
    });

    const link = screen.getByRole("link", { name: "Analytical Engine" });
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Analytical Engine" })).toContainElement(link);
  });

  it("reaches its link, then its actions, with Tab, and follows the link on Enter", async () => {
    const user = userEvent.setup();
    // jsdom doesn't navigate, so this stands in for the browser following the link.
    const onNavigate = vi.fn((event: Event) => event.preventDefault());
    document.addEventListener("click", onNavigate);
    render(Card, {
      props: { heading: "Analytical Engine", href: "/projects/analytical-engine" },
      slots: { actions: () => [button("Share"), button("Save")] },
    });

    await user.tab();
    expect(screen.getByRole("link", { name: "Analytical Engine" })).toHaveFocus();
    await user.keyboard("{Enter}");
    document.removeEventListener("click", onNavigate);
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate.mock.calls[0]![0].target).toBe(screen.getByRole("link"));

    await user.tab();
    expect(screen.getByRole("button", { name: "Share" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  });

  it("keeps its actions out of the link, so pressing one runs it rather than following the link", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(Card, {
      props: { heading: "Analytical Engine", href: "/projects/analytical-engine" },
      slots: { actions: () => button("Save", onSave) },
    });

    const save = screen.getByRole("button", { name: "Save" });
    expect(screen.getByRole("link")).not.toContainElement(save);
    await user.click(save);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("puts attributes, listeners and refs on its root", async () => {
    const user = userEvent.setup();
    const onFocusin = vi.fn();
    const card = ref<{ $el: HTMLElement }>();
    render({
      render: () =>
        h(
          Card,
          { ref: card, id: "engine", class: "featured", "aria-labelledby": "engine-heading", href: "/projects/analytical-engine", onFocusin },
          { heading: () => h("span", { id: "engine-heading" }, "Analytical Engine") },
        ),
    });

    const root = screen.getByRole("article", { name: "Analytical Engine" });
    expect(root).toHaveAttribute("id", "engine");
    expect(root).toHaveClass("card", "featured");
    await user.tab();
    expect(onFocusin).toHaveBeenCalled();
    expect(card.value?.$el).toBe(root);
  });

  it("renders the same markup every time, with its parts in a fixed order", () => {
    const options = {
      props: { heading: "Analytical Engine", href: "/projects/analytical-engine" },
      slots: {
        eyebrow: () => "Project",
        media: image,
        default: () => "A mechanical computer.",
        actions: () => button("Save"),
        footer: () => "By Charles Babbage",
      },
    };
    const first = render(Card, options).container.innerHTML;
    const { container } = render(Card, options);
    expect(container.innerHTML).toBe(first);

    const parts = [...container.querySelectorAll("[data-slot]")].map((part) => part.getAttribute("data-slot"));
    expect(parts).toEqual(["header", "heading", "link", "eyebrow", "media", "body", "actions", "footer"]);
    expect(container.innerHTML).not.toMatch(/\bid=/);
  });

  it("only renders the parts it's given", () => {
    const { container } = render(Card, { props: { heading: "Analytical Engine" } });

    const parts = [...container.querySelectorAll("[data-slot]")].map((part) => part.getAttribute("data-slot"));
    expect(parts).toEqual(["header", "heading"]);
  });
});
