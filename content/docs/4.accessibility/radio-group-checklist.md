---
title: Accessible Radio Group Checklist (WCAG)
description: Every Radio Group rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Radio Group
---

Here's every rule for the [Radio Group](/docs/components/radio-group) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Radio Group's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Radio Group's checklist](/docs/components/radio-group#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`radio-group/contrast`](/docs/components/radio-group/ui#ui-checklist) | Must | The legend, labels, hint and error message have a contrast of 4.5:1, and the focus ring has 3:1 against the page | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.3, 1.4.11 (AA) |
| [`radio-group/indicator-contrast`](/docs/components/radio-group/ui#ui-checklist) | Must | The ring of an unchecked radio and the fill of a checked one have a contrast of 3:1 against the page | [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.11 (AA) |
| [`radio-group/checked-shape`](/docs/components/radio-group/ui#ui-checklist) | Must | A checked radio differs from an unchecked one by its shape, like a dot, and not by its colour alone | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A) | WCAG 1.4.1 (A) |
| [`radio-group/focus-visible`](/docs/components/radio-group/ui#ui-checklist) | Must | Focus shows an `outline` at least 2px thick around the indicator, outside it | [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) (AA), [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) (AAA) | WCAG 2.4.7 (AA), 2.4.13 (AAA) |
| [`radio-group/target-size`](/docs/components/radio-group/ui#ui-checklist) | Must | Each radio's label is part of its target, which is at least 24 × 24px, and each row is at least 44px tall on touch screens | [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (AA), [2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) (AAA) | WCAG 2.5.8 (AA), 2.5.5 (AAA) |
| [`radio-group/resizable`](/docs/components/radio-group/ui#ui-checklist) | Must | Rows are sized with `min-height` in `rem`, so they grow with their text, and long labels wrap beside the indicator | [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) (AA), [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) (AA) | Open Components, beyond WCAG 1.4.4, 1.4.12 (AA) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`radio-group/native-radios`](/docs/components/radio-group/ux#ux-checklist) | Must | Each radio is a native `<input type="radio">`, and never an element with `role="radio"` | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | Open Components, beyond WCAG 2.1.1, 4.1.2 (A) |
| [`radio-group/fieldset-legend`](/docs/components/radio-group/ux#ux-checklist) | Must | The radios sit in a `<fieldset>` that its `<legend>` names | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A) | WCAG 1.3.1, 3.3.2 (A) |
| [`radio-group/labelled-radios`](/docs/components/radio-group/ux#ux-checklist) | Must | Every radio has a visible label, which names it and checks it when pressed | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 1.3.1, 3.3.2, 4.1.2 (A) |
| [`radio-group/described`](/docs/components/radio-group/ux#ux-checklist) | Should | A hint for the whole group is linked to it with `aria-describedby` | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A) |
| [`radio-group/keyboard`](/docs/components/radio-group/ux#ux-checklist) | Must | `Tab` stops once per group, on the checked radio or the first one, the arrow keys move focus and check, wrapping round, and `Space` checks | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | APG, WCAG 2.1.1 (A) |
| [`radio-group/no-change-on-input`](/docs/components/radio-group/ux#ux-checklist) | Must | Checking a radio never submits its form, opens another page or moves focus | [3.2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html) (A) | WCAG 3.2.2 (A) |
| [`radio-group/error-message`](/docs/components/radio-group/ux#ux-checklist) | Must | An invalid group has an error message, in text, that says what to do | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A), [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) (A), [3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html) (AA) | WCAG 1.4.1, 3.3.1 (A), 3.3.3 (AA) |
| [`radio-group/invalid-state`](/docs/components/radio-group/ux#ux-checklist) | Must | While it has an error message, the group has `role="radiogroup"` and `aria-invalid="true"`, is described by the message and only looks invalid then | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A), WAI-ARIA |
| [`radio-group/focus-not-obscured`](/docs/components/radio-group/ux#ux-checklist) | Must | Sticky headers and footers never cover a focused radio, for example thanks to `scroll-padding` | [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) (AA), [2.4.12 Focus Not Obscured (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html) (AAA) | WCAG 2.4.11 (AA), 2.4.12 (AAA) |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`radio-group/role-and-name`](/docs/components/radio-group/ax#ax-checklist) | Must | It can be found by its role and legend alone, with `getByRole("radiogroup", { name })`, and each radio with `getByRole("radio", { name })` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [Radio Group](/docs/components/radio-group), where each rule is explained, with the sources it draws on
