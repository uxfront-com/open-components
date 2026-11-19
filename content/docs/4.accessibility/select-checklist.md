---
title: Accessible Select Checklist (WCAG)
description: Every Select rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Select
---

Here's every rule for the [Select](/docs/components/select) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Select's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Select's checklist](/docs/components/select#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`select/target-size`](/docs/components/select/ui#ui-checklist) | Must | The field, each option and each remove button are at least 24 × 24px, and at least 44px tall on a touch screen | [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (AA) | WCAG 2.5.8 (AA) |
| [`select/focus-visible`](/docs/components/select/ui#ui-checklist) | Must | Focus shows a ring around the field, and the highlighted option an outline of its own | [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) (AA) | WCAG 2.4.7 (AA) |
| [`select/contrast`](/docs/components/select/ui#ui-checklist) | Must | Text has at least 4.5:1 and the field's border at least 3:1 against what's behind them | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.3, 1.4.11 (AA) |
| [`select/not-colour-alone`](/docs/components/select/ui#ui-checklist) | Must | A selected option has a check mark and a heavier weight, not only a colour | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A) | WCAG 1.4.1 (A) |
| [`select/decorative-icons`](/docs/components/select/ui#ui-checklist) | Must | Icons in the panel, the field and the tags are hidden from assistive technologies, so the label alone names each option | [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) (A) | WCAG 1.1.1 (A) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`select/combobox-pattern`](/docs/components/select/ux#ux-checklist) | Must | The control is a `<button role="combobox">` linked to a `listbox` with `aria-expanded`, `aria-controls` and `aria-activedescendant` | None | WAI-ARIA, APG, ARIA in HTML |
| [`select/has-a-name`](/docs/components/select/ux#ux-checklist) | Must | It has a name, from a Field's label or an `aria-label`, and the panel has the same name | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A), [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A) | WCAG 4.1.2 (A), 3.3.2 (A) |
| [`select/reads-its-value`](/docs/components/select/ux#ux-checklist) | Must | The control's text is its value, as a label, a list of labels or a count past three | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |
| [`select/keyboard`](/docs/components/select/ux#ux-checklist) | Must | Every key in the keyboard tables does what they say | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | WCAG 2.1.1 (A), APG |
| [`select/typeahead`](/docs/components/select/ux#ux-checklist) | Must | Letters typed in quick succession search the enabled options, spaces included, and one letter repeated cycles through them | None | APG |
| [`select/focus-stays`](/docs/components/select/ux#ux-checklist) | Must | DOM focus stays on the control, and `aria-activedescendant` follows the highlighted option | [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | APG, WCAG 2.4.3 (A) |
| [`select/tab-commits`](/docs/components/select/ux#ux-checklist) | Should | `Tab` picks the highlighted single option, or keeps what's toggled, and moves on | None | APG |
| [`select/escape`](/docs/components/select/ux#ux-checklist) | Must | `Escape` closes the panel without changing the value and stops there | None | Open Components, APG |
| [`select/remove-tag`](/docs/components/select/ux#ux-checklist) | Must | A value can be removed by pointer and by keyboard, with `Backspace` on the closed control too | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | WCAG 2.1.1 (A) |
| [`select/focus-after-remove`](/docs/components/select/ux#ux-checklist) | Must | Focus goes to the next remove button, or the control when there's none after it | [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | WCAG 2.4.3 (A) |
| [`select/announce-removal`](/docs/components/select/ux#ux-checklist) | Should | A removed value is announced through a polite live region | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA) | WCAG 4.1.3 (AA) |
| [`select/panel-fits`](/docs/components/select/ux#ux-checklist) | Must | The panel flips and shrinks to stay inside the screen, down to 320px wide | [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) (AA) | WCAG 1.4.10 (AA) |
| [`select/reduced-motion`](/docs/components/select/ux#ux-checklist) | Should | The arrow and the panel don't animate for people who asked for less motion | [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA) | WCAG 2.3.3 (AAA) |

## DX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`select/in-a-field`](/docs/components/select/dx#dx-checklist) | Must | In a Field, it takes the label, description, invalid and disabled state in both renderings | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A) |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`select/role-and-name`](/docs/components/select/ax#ax-checklist) | Must | It can be found with `getByRole("combobox", { name })`, in both renderings | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA in HTML](https://www.w3.org/TR/html-aria/)
- [Select](/docs/components/select), where each rule is explained, with the sources it draws on
