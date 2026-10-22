---
title: Card
description: How to build a card that groups what people need to know about one thing, that keyboard and screen reader users can move through, and that agents can check.
navigation:
  title: Overview
---

Cards group what people need to know about one thing, like a project, a product or a person, so they can scan a page of them and pick one. They look like a box with a picture in it, which is why they're so often built with only a mouse in mind. Think of a card wrapped in a link, which a screen reader reads out from its first word to its last as the link's name, a `<div>` with a click handler, which keyboard users can't reach at all, or a Save button nested inside that link, which HTML doesn't allow.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/card/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a card looks, from its parts and what goes in each of them to how cards sit together, its states and its tokens.
:::

:::card{to="/docs/components/card/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a card behaves for every person, input and setting, so it's accessible, predictable, clear in every state and adaptive.
:::

:::card{to="/docs/components/card/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Card, with one consistent, typed API that composes with links, routers and other components, and needs no script.
:::

:::card{to="/docs/components/card/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, build and check a card, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/card#reference-implementation), which does its part of every rule in the [checklist](/docs/components/card#checklist), so feel free to tab through them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Card with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/card/ax#deterministic).

A card is a container rather than a control, so most of what it does comes from the elements in it: a heading, a link when the whole card takes you somewhere, and [Buttons](/docs/components/button) for anything else people can do with it.

::card-playground
::

| Aspect   | Card                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------- |
| Element  | `<article>`, or a `<section>`, `<div>` or `<li>` with `as`                                          |
| Role     | `article`, or `listitem` as an `<li>`                                                               |
| Name     | Its heading, which also names its link when the card is one                                         |
| Keyboard | `Tab` to its link, then to its actions, and `Enter` to follow the link                              |
| States   | Hover and focus, when it's a link                                                                   |
| Parts    | Media, a header with the heading and an eyebrow, body, actions and footer, of which only the header and its heading are always there |
| Pattern  | None in the APG, since an [`<article>`](https://html.spec.whatwg.org/multipage/sections.html#the-article-element) and a link cover it |
| WCAG 2.2 | 1.1.1, 1.3.1, 1.3.2, 1.4.3, 1.4.11, 2.1.1, 2.4.4, 2.4.6, 2.4.7 and 4.1.2, among others              |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A card meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Card itself, so they're the ones to check when you build or review one. **Usage** rules are met by the pages that use it, like describing its images, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like its heading: the Card renders one at the level you give it, as long as you give it a heading that says what the card is about.

The basis says where a rule comes from. About half the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and one comes from **HTML**. The rest are **Open Components** rules, which are our own, like putting the heading first in the DOM. Where a rule goes further than WCAG asks at level AA, its basis says so: some come from level **AAA**, like keeping cards still for people who ask for less motion, and a rule that asks for more than its criterion says **beyond**, like the stretched link, where WCAG would let a card be a link in other ways.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/card/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/card/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/card/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/card/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves. It reads the same theme tokens as the Button, so copy [`tokens.css`](/docs/components/button#reference-implementation) from the Button's reference implementation into your theme too, and its examples put [Buttons](/docs/components/button#reference-implementation) in `actions`.

The tests are in `Card.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [Card.vue]
<script setup lang="ts">
export interface CardProps {
  /** The element it renders: `li` in a list of cards, or `section` or `div` for a card that isn't self-contained. */
  as?: "article" | "section" | "div" | "li";
  /** The heading, when it's plain text. The `heading` slot takes precedence. It isn't `title`, which is an HTML attribute that shows a tooltip. */
  heading?: string;
  /** The heading's level, which fits the page's outline: 3 under a section's `<h2>`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Links the card through its heading, and stretches the link over the whole card. */
  href?: string;
}

const { as = "article", heading, headingLevel = 3, href } = defineProps<CardProps>();

defineSlots<{
  /** The body, like a sentence or two and some details. */
  default?: () => unknown;
  /** The heading, when it's more than plain text, or your router's link. A link here stretches over the card too. */
  heading?: () => unknown;
  /** A short line shown above the heading, like a category, which comes after it in the DOM. */
  eyebrow?: () => unknown;
  /** An image, shown at the top, which comes after the heading in the DOM. */
  media?: () => unknown;
  /** Buttons that act on the card, like Save, which sit above the stretched link and stay reachable with Tab. */
  actions?: () => unknown;
  /** A last line of details about the card, like who made it or when. */
  footer?: () => unknown;
}>();
</script>

<template>
  <!-- The heading comes first in the DOM, so heading navigation lands at the start of
       the card. The media and the eyebrow come after it, and CSS shows them above it. -->
  <component :is="as" class="card">
    <div data-slot="header">
      <component :is="`h${headingLevel}`" data-slot="heading">
        <a v-if="href" data-slot="link" :href="href">
          <slot name="heading">{{ heading }}</slot>
        </a>
        <slot v-else name="heading">{{ heading }}</slot>
      </component>
      <p v-if="$slots.eyebrow" data-slot="eyebrow">
        <slot name="eyebrow" />
      </p>
    </div>
    <div v-if="$slots.media" data-slot="media">
      <slot name="media" />
    </div>
    <div v-if="$slots.default" data-slot="body">
      <slot />
    </div>
    <div v-if="$slots.actions" data-slot="actions">
      <slot name="actions" />
    </div>
    <div v-if="$slots.footer" data-slot="footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The card's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .card {
    --card--padding: 1.25rem;
    --card--gap: 0.75rem;
    --card--radius: 0.75rem;
    /* The card's border is decoration: its heading says what it is, so it doesn't need 3:1. */
    --card--border-color: color-mix(in srgb, currentColor 20%, transparent);
    --card--background: transparent;
    --card--media--aspect-ratio: 16 / 9;

    /* The containing block of the stretched link. */
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--card--gap);
    box-sizing: border-box;
    /* In a grid or a flex row, it can get narrower than its content, rather than overflow. */
    min-width: 0;
    margin: 0;
    padding: var(--card--padding);
    border: 1px solid var(--card--border-color);
    border-radius: var(--card--radius);
    background-color: var(--card--background);
    color: var(--color--neutral-text);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
    /* A list item's marker, when it's an `li`. */
    list-style: none;
    /* Long words, like a web address, wrap rather than overflow the card. */
    overflow-wrap: break-word;
  }

  /* Parts. They have no borders of their own: a line between two of them is a separator's
     job, which a page adds where it needs one. No height is fixed anywhere, so the card
     grows with its text. */
  .card > [data-slot="header"] {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  /* The body takes the spare height, so actions and footers line up across a row of
     cards of one height. A card without a body gives it to its header instead. */
  .card > [data-slot="body"],
  .card:not(:has(> [data-slot="body"])) > [data-slot="header"] {
    flex-grow: 1;
  }
  .card > [data-slot="header"] > [data-slot="heading"] {
    margin: 0;
    color: inherit;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.375;
  }
  /* Shown above the heading, while screen readers read it after the heading. */
  .card > [data-slot="header"] > [data-slot="eyebrow"] {
    order: -1;
    margin: 0;
    /* The text colour at 70%, which has 4.5:1 against the page. */
    color: color-mix(in srgb, currentColor 70%, transparent);
    font-size: 0.75rem;
    font-weight: 500;
  }
  /* The media fills the top of the card, edge to edge, while it comes after the
     heading in the DOM. Its aspect ratio holds its space while the image loads. */
  .card > [data-slot="media"] {
    order: -1;
    margin-block-start: calc(-1 * var(--card--padding));
    margin-inline: calc(-1 * var(--card--padding));
    overflow: hidden;
    border-start-start-radius: calc(var(--card--radius) - 1px);
    border-start-end-radius: calc(var(--card--radius) - 1px);
    background-color: color-mix(in srgb, currentColor 8%, transparent);
    aspect-ratio: var(--card--media--aspect-ratio);
  }
  .card > [data-slot="media"] > :slotted(:is(img, picture, video, svg)) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .card > [data-slot="actions"] {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
  .card > [data-slot="footer"] {
    /* The text colour at 70%, which has 4.5:1 against the page. */
    color: color-mix(in srgb, currentColor 70%, transparent);
    font-size: 0.75rem;
  }

  /* A link in the heading, the Card's own or one in the `heading` slot, stretches over
     the card with a pseudo-element, so pressing anywhere on the card follows it,
     while the link's name stays the heading alone. */
  .card > [data-slot="header"] > [data-slot="heading"] :deep(a[href]) {
    color: inherit;
    text-decoration: none;
    outline: none;
  }
  .card > [data-slot="header"] > [data-slot="heading"] :deep(a[href])::after {
    content: "";
    position: absolute;
    /* Over the border too, so the focus ring sits where it would around the card. */
    inset: -1px;
    border-radius: var(--card--radius);
  }
  /* Everything else people can press sits above the stretched link, so it does what
     it says rather than follow the link. */
  .card > [data-slot="header"] > [data-slot="eyebrow"] :deep(a[href]),
  .card > :is([data-slot="body"], [data-slot="actions"], [data-slot="footer"]) :deep(:is(a[href], button, input, select, textarea, summary, [tabindex])) {
    position: relative;
    z-index: 1;
  }

  /* States. The card only has any when it's a link. Focus is drawn around the whole
     card, by the link's pseudo-element, while an action shows its own focus ring. */
  .card > [data-slot="header"] > [data-slot="heading"] :deep(a[href]:focus-visible)::after {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  @media (hover: hover) {
    /* Only while the pointer is over the link, so not over an action. */
    .card:has(> [data-slot="header"] > [data-slot="heading"] a[href]:hover) {
      --card--border-color: color-mix(in srgb, currentColor 45%, transparent);
    }
    .card > [data-slot="header"] > [data-slot="heading"] :deep(a[href]:hover) {
      text-decoration-line: underline;
      text-underline-offset: 0.2em;
    }
  }

  /* With more contrast, the border is drawn in the text colour at full strength, on
     hover too, so this repeats the hover rule's selector, which it comes after. */
  @media (prefers-contrast: more) {
    .card,
    .card:has(> [data-slot="header"] > [data-slot="heading"] a[href]:hover) {
      --card--border-color: currentColor;
    }
  }

  /* Forced colors mode keeps the border in a system colour, and the focus ring in Highlight. */
  @media (forced-colors: active) {
    .card > [data-slot="header"] > [data-slot="heading"] :deep(a[href]:focus-visible)::after {
      outline-color: Highlight;
    }
  }
}
</style>
```

```ts [Card.test.ts]
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
    // Testing Library may listen on the root of whatever it renders, so the card's click
    // listeners are compared with those on a plain <article> rendered the same way.
    const listen = vi.spyOn(Element.prototype, "addEventListener");
    const clicks = (root: Element) =>
      listen.mock.calls.filter(([type], i) => type === "click" && listen.mock.contexts[i] === root).length;
    const plain = render({ render: () => h("article") }).container.firstElementChild!;
    const { container } = render(Card, {
      props: { heading: "Analytical Engine", href: "/projects/analytical-engine" },
      slots: { eyebrow: () => "Project", default: () => "A mechanical computer." },
    });
    expect(clicks(container.firstElementChild!)).toBe(clicks(plain));
    listen.mockRestore();

    const link = screen.getByRole("link", { name: "Analytical Engine" });
    expect(link).toHaveAttribute("href", "/projects/analytical-engine");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(link).toHaveTextContent(/^Analytical Engine$/);
    expect(screen.getByRole("heading", { name: "Analytical Engine" })).toContainElement(link);

    const card = container.firstElementChild!;
    expect(card.tagName).toBe("ARTICLE");
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
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
```
:::
::

## Sources

- [HTML Standard: the article element](https://html.spec.whatwg.org/multipage/sections.html#the-article-element), [the section element](https://html.spec.whatwg.org/multipage/sections.html#the-section-element) and [the a element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element), for what a card is, and why nothing interactive goes in a link
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), for boundaries that text already identifies
- [Understanding SC 2.4.4: Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html), for links named by their heading
- [Heydon Pickering, Inclusive Components: Cards](https://inclusive-components.design/cards/), for the stretched link and the heading that comes first
- [Adrian Roselli: Block Links, Cards, Clickable Regions, Rows, Etc.](https://adrianroselli.com/2020/02/block-links-cards-clickable-regions-etc.html), for what goes wrong when the whole card is a link
- [Bootstrap: Stretched link](https://getbootstrap.com/docs/5.3/helpers/stretched-link/), for the pseudo-element that covers the card
- [WebAIM: Screen Reader User Survey](https://webaim.org/projects/screenreadersurvey10/), for how people find their way around a page by its headings
- [Scott O'Hara: "Fixing" Lists](https://www.scottohara.me/blog/2019/01/12/lists-and-safari.html), for lists that lose their role in Safari
- [WAI-ARIA Authoring Practices: Feed](https://www.w3.org/WAI/ARIA/apg/patterns/feed/), for lists of cards that load as people scroll
