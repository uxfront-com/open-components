---
title: Accessible Dialog Checklist (WCAG)
description: Every Dialog rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Dialog
---

Here's every rule for the [Dialog](/docs/components/dialog) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Dialog's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Dialog's checklist](/docs/components/dialog#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`dialog/contrast`](/docs/components/dialog/ui#ui-checklist) | Must | The title, the description and the content have a contrast of 4.5:1 against the panel | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA) | WCAG 1.4.3 (AA) |
| [`dialog/fits-screen`](/docs/components/dialog/ui#ui-checklist) | Must | It's never wider or taller than the screen, less a margin, down to 320px wide | [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) (AA) | WCAG 1.4.10 (AA) |
| [`dialog/resizable`](/docs/components/dialog/ui#ui-checklist) | Must | It's sized in `rem`, so it grows with its text, and its title wraps rather than getting cut off | [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) (AA), [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) (AA) | Open Components, beyond WCAG 1.4.4, 1.4.12 (AA) |
| [`dialog/reduced-motion`](/docs/components/dialog/ui#ui-checklist) | Should | It only animates as it opens when `prefers-reduced-motion` is `no-preference` | [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA) | WCAG 2.3.3 (AAA) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`dialog/native-element`](/docs/components/dialog/ux#ux-checklist) | Must | It's a native `<dialog>`, opened with `showModal()`, and never a `<div>` with `role="dialog"` | [2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | Open Components, beyond WCAG 2.1.2, 4.1.2 (A) |
| [`dialog/modal`](/docs/components/dialog/ux#ux-checklist) | Must | While it's open, it's in the top layer and the rest of the page is inert, so nothing behind it can be focused, clicked or read | None | APG |
| [`dialog/contain-focus`](/docs/components/dialog/ux#ux-checklist) | Must | `Tab` and `Shift+Tab` never move focus to the page behind an open dialog | [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | WCAG 2.4.3 (A), APG |
| [`dialog/named`](/docs/components/dialog/ux#ux-checklist) | Must | It's named by its title, with `aria-labelledby` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |
| [`dialog/visible-title`](/docs/components/dialog/ux#ux-checklist) | Must | Every dialog has a visible title that says what it's for, like "Delete project?" | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html) (AA) | WCAG 1.3.1 (A), 2.4.6 (AA) |
| [`dialog/described`](/docs/components/dialog/ux#ux-checklist) | Should | A short description is linked with `aria-describedby`, while longer content, like a form, isn't | None | APG |
| [`dialog/initial-focus`](/docs/components/dialog/ux#ux-checklist) | Must | Opening it moves focus inside, to the control marked with `data-autofocus`, or else the first in its body, then its first action | [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | WCAG 2.4.3 (A), APG |
| [`dialog/safe-focus`](/docs/components/dialog/ux#ux-checklist) | Must | An alert dialog's initial focus is on its least destructive action | None | APG |
| [`dialog/return-focus`](/docs/components/dialog/ux#ux-checklist) | Must | Closing it moves focus back to the control that opened it, or to a logical place when that control is gone | [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | WCAG 2.4.3 (A), APG |
| [`dialog/escape`](/docs/components/dialog/ux#ux-checklist) | Must | `Escape` asks to close every dialog, alert dialogs included, unless a control inside handles it first | None | APG |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`dialog/role-and-name`](/docs/components/dialog/ax#ax-checklist) | Must | It can be found by its role and title alone, with `getByRole("dialog", { name })`, or `"alertdialog"` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [Dialog](/docs/components/dialog), where each rule is explained, with the sources it draws on
