---
title: Accessible Field Checklist (WCAG)
description: Every Field rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Field
---

Here's every rule for the [Field](/docs/components/field) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Field's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Field's checklist](/docs/components/field#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`field/text-contrast`](/docs/components/field/ui#ui-checklist) | Must | The label, the hint and the error have a contrast of 4.5:1 against the page | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA) | WCAG 1.4.3 (AA) |
| [`field/error-in-text`](/docs/components/field/ui#ui-checklist) | Must | An error is a message in text, never a colour alone | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A) | WCAG 1.4.1 (A) |
| [`field/resizable`](/docs/components/field/ui#ui-checklist) | Must | Its text and spacing are set in `rem`, so they grow with the text size rather than clip | [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) (AA), [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) (AA) | Open Components, beyond WCAG 1.4.4, 1.4.12 (AA) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`field/visible-label`](/docs/components/field/ux#ux-checklist) | Must | Every text control and switch in a Field has a visible label that says what to fill in | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A), [2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html) (AA) | WCAG 1.3.1, 3.3.2, 4.1.2 (A), 2.4.6 (AA) |
| [`field/label-for`](/docs/components/field/ux#ux-checklist) | Must | The label's `for` is the control's `id`, so a click on it focuses or toggles the control | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A) |
| [`field/one-name`](/docs/components/field/ux#ux-checklist) | Must | A Checkbox, a Checkbox Group and a Radio Group get no label from the Field, so each keeps its own name | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |
| [`field/group-legend`](/docs/components/field/ux#ux-checklist) | Must | A Checkbox Group and a Radio Group are named by a legend that asks the question their options answer | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A) |
| [`field/described`](/docs/components/field/ux#ux-checklist) | Must | The control's `aria-describedby` lists the hint, then the error, then the control's own | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A) |
| [`field/error-message`](/docs/components/field/ux#ux-checklist) | Must | An error says what's wrong and how to fix it, in text | [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) (A), [3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html) (AA) | WCAG 3.3.1 (A), 3.3.3 (AA) |
| [`field/invalid-state`](/docs/components/field/ux#ux-checklist) | Must | The Field sets `aria-invalid="true"` on the control while it has an error, and never sets it otherwise | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |
| [`field/required-in-words`](/docs/components/field/ux#ux-checklist) | Should | Required or optional fields are marked in words, on whichever there are fewer of, like "(optional)" in the label | [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A) | Open Components, beyond WCAG 3.3.2 (A) |
| [`field/status-message`](/docs/components/field/ux#ux-checklist) | Should | A failed submit says what happened in a status message that screen readers announce | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA) | WCAG 4.1.3 (AA) |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`field/role-and-name`](/docs/components/field/ax#ax-checklist) | Must | Its control can be found by its role and the Field's label, or by its own label or legend, with `getByRole` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Field](/docs/components/field), where each rule is explained, with the sources it draws on
