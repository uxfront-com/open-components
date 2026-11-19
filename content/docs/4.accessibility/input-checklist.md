---
title: Accessible Input Checklist (WCAG)
description: Every Input rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Input
---

Here's every rule for the [Input](/docs/components/input) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Input's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Input's checklist](/docs/components/input#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`input/contrast`](/docs/components/input/ui#ui-checklist) | Must | The value, the placeholder, prefixes and suffixes have a contrast of 4.5:1, and the focus ring has 3:1 against the page | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.3, 1.4.11 (AA) |
| [`input/boundary-contrast`](/docs/components/input/ui#ui-checklist) | Must | The border has a contrast of 3:1 against the page, so an empty input stays visible | [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.11 (AA) |
| [`input/focus-visible`](/docs/components/input/ui#ui-checklist) | Must | Focus shows an `outline` at least 2px thick around the whole field, outside its border | [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) (AA), [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) (AAA) | WCAG 2.4.7 (AA), 2.4.13 (AAA) |
| [`input/target-size`](/docs/components/input/ui#ui-checklist) | Must | The field is at least 24px tall, with a hit area at least 44px tall on touch screens | [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (AA), [2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) (AAA) | WCAG 2.5.8 (AA), 2.5.5 (AAA) |
| [`input/resizable`](/docs/components/input/ui#ui-checklist) | Must | The field is sized with `min-height` and padding in `rem`, so it grows with its text instead of clipping it | [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) (AA), [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) (AA) | Open Components, beyond WCAG 1.4.4, 1.4.12 (AA) |
| [`input/fits-value`](/docs/components/input/ui#ui-checklist) | Should | Its width fits the value it expects, like a short one for a postcode, and never outgrows the screen | [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) (AA) | Open Components, beyond WCAG 1.4.10 (AA) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`input/native-element`](/docs/components/input/ux#ux-checklist) | Must | It's a native `<input>`, and never a `contenteditable` element | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | Open Components, beyond WCAG 2.1.1, 4.1.2 (A) |
| [`input/visible-label`](/docs/components/input/ux#ux-checklist) | Must | Every input has a visible `<label>`, linked with `for`, rather than a placeholder alone, unless it's a search next to its Search button, named with `aria-label` | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 1.3.1, 3.3.2, 4.1.2 (A) |
| [`input/label-in-name`](/docs/components/input/ux#ux-checklist) | Must | An `aria-label` or `aria-labelledby` includes the visible label, ideally at the start | [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html) (A) | WCAG 2.5.3 (A) |
| [`input/described`](/docs/components/input/ux#ux-checklist) | Should | Hints, like the format it expects, are linked with `aria-describedby`, and a placeholder only ever shows an example | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A), Open Components |
| [`input/decorative-slots`](/docs/components/input/ux#ux-checklist) | Must | `leading` and `trailing` are hidden from assistive technologies with `aria-hidden`, while `actions` stay reachable | [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) (A) | WCAG 1.1.1 (A) |
| [`input/units-in-label`](/docs/components/input/ux#ux-checklist) | Must | A prefix or a suffix, like a currency or a unit, is in the label or the hint as well | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A) |
| [`input/input-purpose`](/docs/components/input/ux#ux-checklist) | Must | An input that asks about the person filling it in has the matching `autocomplete`, like `email` or `tel` | [1.3.5 Identify Input Purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html) (AA) | WCAG 1.3.5 (AA) |
| [`input/keyboard`](/docs/components/input/ux#ux-checklist) | Must | `Tab` reaches the input and then its actions, and the browser's text editing keys work as they do in any text field | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | WCAG 2.1.1 (A) |
| [`input/allow-paste`](/docs/components/input/ux#ux-checklist) | Must | Pasting, autofill and password managers are never blocked | [3.3.8 Accessible Authentication (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html) (AA) | WCAG 3.3.8 (AA) |
| [`input/error-message`](/docs/components/input/ux#ux-checklist) | Must | An invalid input has an error message, in text and linked with `aria-describedby`, that says what's wrong and how to fix it | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A), [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) (A), [3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html) (AA) | WCAG 1.4.1, 3.3.1 (A), 3.3.3 (AA) |
| [`input/invalid-state`](/docs/components/input/ux#ux-checklist) | Must | An input sets `aria-invalid="true"` while its error message shows, and only looks invalid when it does | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A), Open Components |
| [`input/action-buttons`](/docs/components/input/ux#ux-checklist) | Must | Buttons in `actions` are named Buttons that `Tab` reaches after the input, and one that goes away moves focus back to the input | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A), [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 2.1.1, 2.4.3, 4.1.2 (A) |
| [`input/focus-not-obscured`](/docs/components/input/ux#ux-checklist) | Must | Sticky headers and footers never cover a focused input, for example thanks to `scroll-padding` | [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) (AA), [2.4.12 Focus Not Obscured (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html) (AAA) | WCAG 2.4.11 (AA), 2.4.12 (AAA) |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`input/role-and-name`](/docs/components/input/ax#ax-checklist) | Must | It can be found by its role and label alone, with `getByRole("textbox", { name })`, or with `getByLabel` for a password | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Input](/docs/components/input), where each rule is explained, with the sources it draws on
