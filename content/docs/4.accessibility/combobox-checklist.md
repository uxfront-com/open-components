---
title: Accessible Combobox Checklist (WCAG)
description: Every Combobox rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Combobox
---

Here's every rule for the [Combobox](/docs/components/combobox) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Combobox's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Combobox's checklist](/docs/components/combobox#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`combobox/visible-focus`](/docs/components/combobox/ui#ui-checklist) | Must | The field shows a focus ring while its text has focus, and the highlighted option an outline at least 2px thick | [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) (AA) | WCAG 2.4.7 (AA) |
| [`combobox/selected-not-colour`](/docs/components/combobox/ui#ui-checklist) | Must | A picked option shows a check mark as well as its weight, and its tag, with `multiple` | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A) | WCAG 1.4.1 (A) |
| [`combobox/contrast`](/docs/components/combobox/ui#ui-checklist) | Must | The text, the placeholder and "No results" have 4.5:1, and the border, the chevron and the focus ring 3:1, in light and dark mode | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.3, 1.4.11 (AA) |
| [`combobox/target-size`](/docs/components/combobox/ui#ui-checklist) | Must | The toggle and each remove button are at least 24 × 24px to press, and 44px tall where a pointer is coarse, like the options | [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (AA) | Open Components, beyond WCAG 2.5.8 (AA) |
| [`combobox/reflow`](/docs/components/combobox/ui#ui-checklist) | Must | The field and the panel fit a 320px-wide screen without scrolling sideways, and long labels wrap | [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) (AA) | WCAG 1.4.10 (AA) |
| [`combobox/reduced-motion`](/docs/components/combobox/ui#ui-checklist) | Should | The chevron and the panel don't animate when people ask for less motion | [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA) | WCAG 2.3.3 (AAA) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`combobox/editable-pattern`](/docs/components/combobox/ux#ux-checklist) | Must | The text field has the `combobox` role, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls`, which points at a `listbox` | None | APG |
| [`combobox/focus-in-text`](/docs/components/combobox/ux#ux-checklist) | Must | Focus stays in the text field, and `aria-activedescendant` points at the highlighted option while the panel is open | None | APG |
| [`combobox/name`](/docs/components/combobox/ux#ux-checklist) | Must | It has a visible label, from a Field or a `<label for>` | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A) | WCAG 1.3.1, 3.3.2 (A) |
| [`combobox/keyboard`](/docs/components/combobox/ux#ux-checklist) | Must | Every key in the contract does what it says, and nothing needs a pointer | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | WCAG 2.1.1 (A) |
| [`combobox/typing-edits`](/docs/components/combobox/ux#ux-checklist) | Must | Letters, `Space`, `Home`, `End` and the side arrows edit the text, and never move the highlight | None | APG |
| [`combobox/escape`](/docs/components/combobox/ux#ux-checklist) | Must | `Escape` closes the panel, then clears the text, and goes no further, so a Dialog around it stays open | None | APG |
| [`combobox/no-results`](/docs/components/combobox/ux#ux-checklist) | Must | With no match, the panel says so, in text that isn't an option, and screen readers hear it | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA) | WCAG 4.1.3 (AA) |
| [`combobox/result-count`](/docs/components/combobox/ux#ux-checklist) | Should | The number of matches is announced once typing pauses, never on every key | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA) | WCAG 4.1.3 (AA) |
| [`combobox/removable-tags`](/docs/components/combobox/ux#ux-checklist) | Must | With `multiple`, each tag has a named button that removes it, focus moves on to the next one, and `Backspace` in empty text removes the last | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 2.1.1, 4.1.2 (A) |
| [`combobox/announce-removal`](/docs/components/combobox/ux#ux-checklist) | Should | Removing a value is announced | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA) | WCAG 4.1.3 (AA) |
| [`combobox/autocomplete`](/docs/components/combobox/ux#ux-checklist) | Should | `autocomplete` names the field's purpose where it asks people about themselves, and stays `off` elsewhere | [1.3.5 Identify Input Purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html) (AA) | WCAG 1.3.5 (AA) |

## DX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`combobox/in-a-field`](/docs/components/combobox/dx#dx-checklist) | Must | In a Field, it takes the label, description, invalid and disabled state | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A) |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`combobox/role-and-name`](/docs/components/combobox/ax#ax-checklist) | Must | It can be found with `getByRole("combobox", { name })`, and its options with `getByRole("option", { name })` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [Combobox](/docs/components/combobox), where each rule is explained, with the sources it draws on
