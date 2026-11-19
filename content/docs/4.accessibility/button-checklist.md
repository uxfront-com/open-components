---
title: Accessible Button Checklist (WCAG)
description: Every Button rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Button
---

Here's every rule for the [Button](/docs/components/button) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Button's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Button's checklist](/docs/components/button#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`button/intent-colors`](/docs/components/button/ui#ui-checklist) | Must | Colours describe the action's intent rather than a hue, and never carry that meaning on their own | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A) | WCAG 1.4.1 (A), Open Components |
| [`button/contrast`](/docs/components/button/ui#ui-checklist) | Must | The label has a contrast of 4.5:1 at rest, on hover and when pressed, in every variant, and the focus ring has 3:1 against the page | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.3, 1.4.11 (AA) |
| [`button/link-underlined`](/docs/components/button/ui#ui-checklist) | Must | The `link` variant is underlined at rest, so it doesn't rely on colour alone to stand out from the text around it | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A) | Open Components, beyond WCAG 1.4.1 (A) |
| [`button/focus-visible`](/docs/components/button/ui#ui-checklist) | Must | Keyboard focus shows an `outline` at least 2px thick, offset from the button, on `:focus-visible` | [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) (AA), [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) (AAA) | WCAG 2.4.7 (AA), 2.4.13 (AAA) |
| [`button/target-size`](/docs/components/button/ui#ui-checklist) | Must | The button is at least 24 × 24px, unless it's a `link` inside a sentence, with a 44 × 44px hit area on touch screens | [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (AA), [2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) (AAA) | WCAG 2.5.8 (AA), 2.5.5 (AAA) |
| [`button/resizable`](/docs/components/button/ui#ui-checklist) | Must | The button is sized with `min-height` and padding in `rem`, and its label wraps instead of being clipped or truncated | [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) (AA), [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) (AA), [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) (AA) | Open Components, beyond WCAG 1.4.4, 1.4.10, 1.4.12 (AA) |
| [`button/reduced-motion`](/docs/components/button/ui#ui-checklist) | Must | Nothing turns or slides when `prefers-reduced-motion: reduce` is set | [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA) | WCAG 2.3.3 (AAA) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`button/native-element`](/docs/components/button/ux#ux-checklist) | Must | It's a native `<button>`, or an `<a href>` for navigation, but never a `<div>` or a `<span>` | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | Open Components, beyond WCAG 2.1.1, 4.1.2 (A) |
| [`button/accessible-name`](/docs/components/button/ux#ux-checklist) | Must | Every button has a name, and an icon-only button has a visually hidden label | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A), Open Components |
| [`button/label-in-name`](/docs/components/button/ux#ux-checklist) | Must | An `aria-label` or `aria-labelledby` includes the visible label, ideally at the start | [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html) (A) | WCAG 2.5.3 (A) |
| [`button/decorative-icons`](/docs/components/button/ux#ux-checklist) | Must | Icons are hidden from assistive technologies with `aria-hidden`, so they don't add to the button's name | [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) (A) | WCAG 1.1.1 (A) |
| [`button/keyboard`](/docs/components/button/ux#ux-checklist) | Must | `Enter` and `Space` activate a button, while `Enter` follows a link | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | WCAG 2.1.1 (A), APG |
| [`button/activate-on-click`](/docs/components/button/ux#ux-checklist) | Must | Actions run on `click`, never on `mousedown`, `pointerdown` or `touchstart` | [2.5.2 Pointer Cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html) (A) | Open Components, beyond WCAG 2.5.2 (A) |
| [`button/dom-order`](/docs/components/button/ux#ux-checklist) | Must | Buttons come in the same order in the DOM as on screen, without `order` or `row-reverse` | [1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html) (A), [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | Open Components, beyond WCAG 1.3.2, 2.4.3 (A) |
| [`button/disabled-inert`](/docs/components/button/ux#ux-checklist) | Must | A disabled or loading button does nothing, so there's no event, no submission and no navigation | None | HTML, WAI-ARIA |
| [`button/loading`](/docs/components/button/ux#ux-checklist) | Must | Loading keeps the button's size and name, blocks repeated activation and is announced | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA) | WCAG 4.1.3 (AA), Open Components |
| [`button/announce-outcome`](/docs/components/button/ux#ux-checklist) | Should | The page announces the action's outcome with a status message | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA) | Open Components, beyond WCAG 4.1.3 (AA) |
| [`button/toggle-pressed`](/docs/components/button/ux#ux-checklist) | Must | A toggle button sets `aria-pressed` and keeps its label | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A), APG |
| [`button/popup-expanded`](/docs/components/button/ux#ux-checklist) | Must | A button that opens a popup sets `aria-haspopup` and `aria-expanded` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A), APG |
| [`button/focus-after`](/docs/components/button/ux#ux-checklist) | Should | After activation, focus moves as the APG describes, and never falls back to the top of the page | None | APG |
| [`button/focus-not-obscured`](/docs/components/button/ux#ux-checklist) | Must | Sticky headers and footers never cover a focused button, for example thanks to `scroll-padding` | [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) (AA), [2.4.12 Focus Not Obscured (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html) (AAA) | WCAG 2.4.11 (AA), 2.4.12 (AAA) |
| [`button/destructive`](/docs/components/button/ux#ux-checklist) | Should | A destructive action uses `error`, names what it destroys, and can either be undone or asks for confirmation | [3.3.4 Error Prevention (Legal, Financial, Data)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html) (AA) | Open Components, beyond WCAG 3.3.4 (AA) |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`button/role-and-name`](/docs/components/button/ax#ax-checklist) | Must | It can be found by its role and name alone, with `getByRole("button", { name })` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [Button](/docs/components/button), where each rule is explained, with the sources it draws on
