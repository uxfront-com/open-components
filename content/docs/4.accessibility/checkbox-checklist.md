---
title: Accessible Checkbox Checklist (WCAG)
description: Every Checkbox rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Checkbox
---

Here's every rule for the [Checkbox](/docs/components/checkbox) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Checkbox's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Checkbox's checklist](/docs/components/checkbox#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`checkbox/contrast`](/docs/components/checkbox/ui#ui-checklist) | Must | The label has a contrast of 4.5:1, and the focus ring has 3:1 against the page | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.3, 1.4.11 (AA) |
| [`checkbox/boundary-contrast`](/docs/components/checkbox/ui#ui-checklist) | Must | The box's border and a checked box's fill have 3:1 against the page, and the check and the dash have 3:1 against the fill | [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.11 (AA) |
| [`checkbox/focus-visible`](/docs/components/checkbox/ui#ui-checklist) | Must | Keyboard focus shows an `outline` at least 2px thick around the box, outside its border, on `:focus-visible` | [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) (AA), [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) (AAA) | WCAG 2.4.7 (AA), 2.4.13 (AAA) |
| [`checkbox/target-size`](/docs/components/checkbox/ui#ui-checklist) | Must | The box has a hit area of at least 24 × 24px that toggles it, without counting its label | [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (AA) | Open Components, beyond WCAG 2.5.8 (AA) |
| [`checkbox/distinct-marks`](/docs/components/checkbox/ui#ui-checklist) | Must | Checked shows a check and indeterminate a dash, so the two never rely on colour to tell them apart | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A) | WCAG 1.4.1 (A) |
| [`checkbox/resizable`](/docs/components/checkbox/ui#ui-checklist) | Must | The box, its gap and its hit area are sized in `rem`, and the label wraps beside the box instead of being clipped | [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) (AA), [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) (AA) | Open Components, beyond WCAG 1.4.4, 1.4.12 (AA) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`checkbox/native-element`](/docs/components/checkbox/ux#ux-checklist) | Must | It's a native `<input type="checkbox">`, never an element with `role="checkbox"` | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | Open Components, beyond WCAG 2.1.1, 4.1.2 (A) |
| [`checkbox/label-toggles`](/docs/components/checkbox/ux#ux-checklist) | Must | Its `<label>` wraps the box and its text, so the text names it and a press on the text toggles it, unless it's read-only | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 1.3.1, 4.1.2 (A), HTML |
| [`checkbox/visible-label`](/docs/components/checkbox/ux#ux-checklist) | Must | Every checkbox has visible text, unless its context names it, like a row in a table, in which case it has an `aria-label` | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 1.3.1, 3.3.2, 4.1.2 (A) |
| [`checkbox/label-in-name`](/docs/components/checkbox/ux#ux-checklist) | Must | An `aria-label` or `aria-labelledby` includes the visible text, ideally at the start | [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html) (A) | WCAG 2.5.3 (A) |
| [`checkbox/described`](/docs/components/checkbox/ux#ux-checklist) | Should | Hints sit outside the label and are linked with `aria-describedby` | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A) |
| [`checkbox/decorative-indicator`](/docs/components/checkbox/ux#ux-checklist) | Must | The check and the dash are hidden from assistive technologies with `aria-hidden`, so the name is the label alone | [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 1.1.1, 4.1.2 (A) |
| [`checkbox/keyboard`](/docs/components/checkbox/ux#ux-checklist) | Must | `Tab` reaches the box, `Space` checks or unchecks it unless it's read-only, and `Enter` never toggles it | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | WCAG 2.1.1 (A), APG |
| [`checkbox/indeterminate`](/docs/components/checkbox/ux#ux-checklist) | Must | The mixed state is set as the `<input>`'s `indeterminate` property, so it's announced as mixed, and it clears on the first click | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A), HTML |
| [`checkbox/required`](/docs/components/checkbox/ux#ux-checklist) | Should | A box people have to check has `required`, which lands on the `<input>`, while optional boxes don't | [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A) | HTML, WCAG 3.3.2 (A) |
| [`checkbox/error-message`](/docs/components/checkbox/ux#ux-checklist) | Must | An invalid checkbox has an error message, in text and linked with `aria-describedby`, that says why it needs checking | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A), [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) (A), [3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html) (AA) | WCAG 1.4.1, 3.3.1 (A), 3.3.3 (AA) |
| [`checkbox/invalid-state`](/docs/components/checkbox/ux#ux-checklist) | Must | A checkbox sets `aria-invalid="true"` while its error message shows, and only looks invalid when it does | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A), Open Components |
| [`checkbox/read-only`](/docs/components/checkbox/ux#ux-checklist) | Must | A read-only checkbox sets `aria-readonly="true"`, stays focusable and is sent with its form, while a click, its label or `Space` never change it | None | WAI-ARIA, Open Components |
| [`checkbox/focus-not-obscured`](/docs/components/checkbox/ux#ux-checklist) | Must | Sticky headers and footers never cover a focused checkbox, for example thanks to `scroll-padding` | [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) (AA), [2.4.12 Focus Not Obscured (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html) (AAA) | WCAG 2.4.11 (AA), 2.4.12 (AAA) |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`checkbox/role-and-name`](/docs/components/checkbox/ax#ax-checklist) | Must | It can be found by its role and label alone, with `getByRole("checkbox", { name })`, and reports checked, unchecked or mixed | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [Checkbox](/docs/components/checkbox), where each rule is explained, with the sources it draws on
