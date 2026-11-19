---
title: Accessible Checkbox Group Checklist (WCAG)
description: Every Checkbox Group rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Checkbox Group
---

Here's every rule for the [Checkbox Group](/docs/components/checkbox-group) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Checkbox Group's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Checkbox Group's checklist](/docs/components/checkbox-group#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`checkbox-group/legend-contrast`](/docs/components/checkbox-group/ui#ui-checklist) | Must | The legend has a contrast of 4.5:1 against the page | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA) | WCAG 1.4.3 (AA) |
| [`checkbox-group/resizable`](/docs/components/checkbox-group/ui#ui-checklist) | Must | The legend, the gaps and the indent are sized in `rem`, and the legend and a row of options wrap instead of being clipped or scrolling sideways | [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) (AA), [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) (AA), [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) (AA) | Open Components, beyond WCAG 1.4.4, 1.4.10, 1.4.12 (AA) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`checkbox-group/fieldset`](/docs/components/checkbox-group/ux#ux-checklist) | Must | It's a `<fieldset>` whose first child is the `<legend>` that names it, so it has the `group` role and the legend as its name | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 1.3.1, 4.1.2 (A), HTML |
| [`checkbox-group/legend-question`](/docs/components/checkbox-group/ux#ux-checklist) | Must | Every group has a visible legend that says what its options are for, ideally as the question they answer | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A) | WCAG 1.3.1, 3.3.2 (A) |
| [`checkbox-group/described`](/docs/components/checkbox-group/ux#ux-checklist) | Should | A hint and an error message sit outside the legend and are linked to the `<fieldset>` with `aria-describedby`, the hint's ID first | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A), APG |
| [`checkbox-group/keyboard`](/docs/components/checkbox-group/ux#ux-checklist) | Must | `Tab` reaches each box in turn, select-all box included, `Space` toggles the focused one, and the arrow keys never move focus between them | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | WCAG 2.1.1 (A), APG |
| [`checkbox-group/select-all-state`](/docs/components/checkbox-group/ux#ux-checklist) | Must | The select-all box is checked when every option is, unchecked when none is, and mixed when only some are, worked out from them whenever they change | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A), APG |
| [`checkbox-group/select-all-action`](/docs/components/checkbox-group/ux#ux-checklist) | Must | Checking the select-all box, from unchecked or mixed, checks every option, and unchecking it clears them all, without going back to an earlier selection | None | APG, Open Components |
| [`checkbox-group/at-least-one`](/docs/components/checkbox-group/ux#ux-checklist) | Must | A group people have to pick from says so in its legend or hint, and is checked in code when the form is sent, never with `required` on its boxes | [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A) | HTML, WCAG 3.3.2 (A) |
| [`checkbox-group/error-message`](/docs/components/checkbox-group/ux#ux-checklist) | Must | An invalid group has an error message, in text and linked to the `<fieldset>` with `aria-describedby`, that says what to pick | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A), [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) (A), [3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html) (AA) | WCAG 1.4.1, 3.3.1 (A), 3.3.3 (AA) |
| [`checkbox-group/invalid-state`](/docs/components/checkbox-group/ux#ux-checklist) | Must | The group sets `aria-invalid="true"` while its error message shows, and each of its options looks and reads invalid with it | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A), Open Components |
| [`checkbox-group/focus-on-error`](/docs/components/checkbox-group/ux#ux-checklist) | Should | A failed submit moves focus to the group's first box, once the error is in the page | [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) (A) | Open Components, beyond WCAG 3.3.1 (A) |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`checkbox-group/role-and-name`](/docs/components/checkbox-group/ax#ax-checklist) | Must | It can be found by its legend alone, with `getByRole("group", { name })`, and each option inside it with `getByRole("checkbox", { name })` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [Checkbox Group](/docs/components/checkbox-group), where each rule is explained, with the sources it draws on
