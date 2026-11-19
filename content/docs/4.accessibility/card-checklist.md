---
title: Accessible Card Checklist (WCAG)
description: Every Card rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Card
---

Here's every rule for the [Card](/docs/components/card) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Card's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Card's checklist](/docs/components/card#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`card/contrast`](/docs/components/card/ui#ui-checklist) | Must | The text, the eyebrow and the footer included, has a contrast of 4.5:1 against the card, and the focus ring has 3:1 against the page | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.3, 1.4.11 (AA) |
| [`card/focus-visible`](/docs/components/card/ui#ui-checklist) | Must | When its link has keyboard focus, an `outline` at least 2px thick shows around the whole card, outside its border | [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) (AA), [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) (AAA) | WCAG 2.4.7 (AA), 2.4.13 (AAA) |
| [`card/resizable`](/docs/components/card/ui#ui-checklist) | Must | Nothing in the card has a fixed height, so it grows with its text, and long words wrap instead of overflowing it | [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) (AA), [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) (AA) | Open Components, beyond WCAG 1.4.4, 1.4.12 (AA) |
| [`card/reduced-motion`](/docs/components/card/ui#ui-checklist) | Must | Nothing moves on hover or focus when `prefers-reduced-motion: reduce` is set | [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA) | WCAG 2.3.3 (AAA) |
| [`card/reflow`](/docs/components/card/ui#ui-checklist) | Must | Cards in a grid get narrower rather than overflow, so the page never scrolls sideways at 320px wide | [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) (AA) | WCAG 1.4.10 (AA) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`card/semantic-element`](/docs/components/card/ux#ux-checklist) | Must | It's an `<article>` by default, or a `<section>`, `<div>` or `<li>` with `as`, and never a link or a button | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | Open Components, beyond WCAG 1.3.1 (A) |
| [`card/list-of-cards`](/docs/components/card/ux#ux-checklist) | Should | A set of cards is a list, with each card an `<li>` | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A) |
| [`card/heading`](/docs/components/card/ux#ux-checklist) | Must | Every card has a heading that says what it's about, at the level that fits the page's outline | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html) (AA) | WCAG 1.3.1 (A), 2.4.6 (AA) |
| [`card/stretched-link`](/docs/components/card/ux#ux-checklist) | Must | A card that's a link has one link, in its heading, stretched over the card with a pseudo-element, and never a wrapping `<a>`, `role="link"` or a click handler on the card | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | Open Components, beyond WCAG 2.1.1, 4.1.2 (A) |
| [`card/link-name`](/docs/components/card/ux#ux-checklist) | Must | The link is named by the heading alone | [2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html) (A) | WCAG 2.4.4 (A) |
| [`card/link-purpose`](/docs/components/card/ux#ux-checklist) | Should | Headings say where the link goes, differ from card to card, and there's no separate "Read more" link | [2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html) (A), [2.4.9 Link Purpose (Link Only)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-link-only.html) (AAA) | WCAG 2.4.4 (A), 2.4.9 (AAA) |
| [`card/keyboard`](/docs/components/card/ux#ux-checklist) | Must | `Tab` reaches the card's link once and then its actions, and `Enter` follows the link | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A), [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | WCAG 2.1.1, 2.4.3 (A) |
| [`card/media-alt`](/docs/components/card/ux#ux-checklist) | Must | An image that only illustrates the heading has `alt=""`, and one that shows more has alt text that says what | [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) (A) | WCAG 1.1.1 (A) |
| [`card/static-media`](/docs/components/card/ux#ux-checklist) | Must | The media holds nothing people can focus, since it's shown above the heading but comes after it in the DOM | [1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html) (A), [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | WCAG 1.3.2, 2.4.3 (A) |
| [`card/dom-order`](/docs/components/card/ux#ux-checklist) | Must | Cards come in the same order in the DOM as on screen, without `order`, `row-reverse` or a `dense` grid | [1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html) (A), [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | Open Components, beyond WCAG 1.3.2, 2.4.3 (A) |
| [`card/focus-not-obscured`](/docs/components/card/ux#ux-checklist) | Must | Sticky headers and footers never cover a focused card, for example thanks to `scroll-padding` | [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) (AA), [2.4.12 Focus Not Obscured (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html) (AAA) | WCAG 2.4.11 (AA), 2.4.12 (AAA) |
| [`card/announce-results`](/docs/components/card/ux#ux-checklist) | Should | Cards that load after something people did, like a search, are announced with a status message | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA) | WCAG 4.1.3 (AA) |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`card/role-and-name`](/docs/components/card/ax#ax-checklist) | Must | It can be found by its heading, with `getByRole("heading", { name })`, and a card that's a link by `getByRole("link", { name })` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Card](/docs/components/card), where each rule is explained, with the sources it draws on
