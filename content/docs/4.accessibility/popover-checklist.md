---
title: Accessible Popover Checklist (WCAG)
description: Every Popover rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Popover
---

Here's every rule for the [Popover](/docs/components/popover) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Popover's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Popover's checklist](/docs/components/popover#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`popover/contrast`](/docs/components/popover/ui#ui-checklist) | Must | The title and the content have a contrast of 4.5:1 against the panel | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA) | WCAG 1.4.3 (AA) |
| [`popover/fits-screen`](/docs/components/popover/ui#ui-checklist) | Must | It's never wider or taller than the screen less 16px on each side, down to 320px wide, and its body scrolls when its content doesn't fit | [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) (AA) | WCAG 1.4.10 (AA) |
| [`popover/resizable`](/docs/components/popover/ui#ui-checklist) | Must | It's sized in `rem`, so it grows with its text, and its title wraps rather than getting cut off | [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) (AA), [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) (AA) | Open Components, beyond WCAG 1.4.4, 1.4.12 (AA) |
| [`popover/reduced-motion`](/docs/components/popover/ui#ui-checklist) | Should | It only animates as it opens when `prefers-reduced-motion` is `no-preference` | [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA) | WCAG 2.3.3 (AAA) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`popover/native-popover`](/docs/components/popover/ux#ux-checklist) | Must | It's an element with `popover="auto"`, which a `popovertarget` button opens before any script loads, and never a scripted overlay | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | Open Components, beyond WCAG 2.1.1 (A) |
| [`popover/non-modal`](/docs/components/popover/ux#ux-checklist) | Must | The page around it keeps working: nothing is inert, nothing is `aria-modal`, and `Tab` can leave it | [2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html) (A) | WAI-ARIA, WCAG 2.1.2 (A) |
| [`popover/named`](/docs/components/popover/ux#ux-checklist) | Must | It's `role="dialog"`, named by its title with `aria-labelledby` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |
| [`popover/visible-title`](/docs/components/popover/ux#ux-checklist) | Must | Every popover has a title that says what it holds, like "Filters" | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html) (AA) | WCAG 1.3.1 (A), 2.4.6 (AA) |
| [`popover/trigger`](/docs/components/popover/ux#ux-checklist) | Must | Its trigger is a button that points at it with `popovertarget`, and sets `aria-haspopup="dialog"` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A), HTML |
| [`popover/trigger-expanded`](/docs/components/popover/ux#ux-checklist) | Must | It keeps `aria-expanded` on its trigger in step with whether it's open, `true` only on the trigger that opened it | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |
| [`popover/after-trigger`](/docs/components/popover/ux#ux-checklist) | Should | It's rendered right after its trigger, so `Tab` and screen readers reach it next | [1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html) (A), [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | WCAG 1.3.2, 2.4.3 (A) |
| [`popover/initial-focus`](/docs/components/popover/ux#ux-checklist) | Must | Opening it moves focus inside, to the control marked with `data-autofocus`, or else the first in its body, then its close button | [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | WCAG 2.4.3 (A) |
| [`popover/return-focus`](/docs/components/popover/ux#ux-checklist) | Must | Closing it while focus is inside moves focus back to its trigger, and a press outside leaves focus where people pressed | [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | WCAG 2.4.3 (A), HTML |
| [`popover/escape`](/docs/components/popover/ux#ux-checklist) | Must | `Escape` closes it, with focus in it, on its trigger or anywhere else on the page | [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) (AA) | HTML, WCAG 2.4.11 (AA) |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`popover/role-and-name`](/docs/components/popover/ax#ax-checklist) | Must | It can be found by its role and title alone, with `getByRole("dialog", { name })` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [Popover](/docs/components/popover), where each rule is explained, with the sources it draws on
