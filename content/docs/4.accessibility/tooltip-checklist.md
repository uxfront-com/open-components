---
title: Accessible Tooltip Checklist (WCAG)
description: Every Tooltip rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Tooltip
---

Here's every rule for the [Tooltip](/docs/components/tooltip) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Tooltip's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Tooltip's checklist](/docs/components/tooltip#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`tooltip/contrast`](/docs/components/tooltip/ui#ui-checklist) | Must | Its text has a contrast of 4.5:1 against its fill | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA) | WCAG 1.4.3 (AA) |
| [`tooltip/wraps`](/docs/components/tooltip/ui#ui-checklist) | Should | Long text wraps at a maximum width set in `ch`, and is never cut off or scrolled | [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) (AA), [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) (AA) | WCAG 1.4.4, 1.4.10 (AA) |
| [`tooltip/reduced-motion`](/docs/components/tooltip/ui#ui-checklist) | Must | With `prefers-reduced-motion: reduce`, it fades in without growing or moving | [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA) | WCAG 2.3.3 (AAA), Open Components |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`tooltip/focus-opens`](/docs/components/tooltip/ux#ux-checklist) | Must | Keyboard focus on its trigger opens it at once | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | WCAG 2.1.1 (A) |
| [`tooltip/hoverable`](/docs/components/tooltip/ux#ux-checklist) | Must | The pointer can cross from the trigger onto the tooltip, within a short grace period, without closing it | [1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) (AA) | WCAG 1.4.13 (AA) |
| [`tooltip/persistent`](/docs/components/tooltip/ux#ux-checklist) | Must | It stays open while its trigger has hover or focus, and never hides on a timer | [1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) (AA) | WCAG 1.4.13 (AA) |
| [`tooltip/dismiss-with-escape`](/docs/components/tooltip/ux#ux-checklist) | Must | `Escape` dismisses it without moving focus or the pointer | [1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) (AA) | WCAG 1.4.13 (AA) |
| [`tooltip/focusable-trigger`](/docs/components/tooltip/ux#ux-checklist) | Must | Its trigger is focusable, and a disabled one uses `aria-disabled` rather than `disabled` | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | Open Components, beyond WCAG 2.1.1 (A) |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`tooltip/describes`](/docs/components/tooltip/ax#ax-checklist) | Must | With `type="description"`, it's `role="tooltip"`, and its trigger points to its `id` with `aria-describedby` | None | WAI-ARIA |
| [`tooltip/shows-label`](/docs/components/tooltip/ax#ax-checklist) | Must | With `type="label"`, it's `aria-hidden`, nothing points to it, and the trigger keeps its own name | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A), Open Components |
| [`tooltip/named-trigger`](/docs/components/tooltip/ax#ax-checklist) | Must | Its trigger has an accessible name of its own, like an icon-only Button's hidden label | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |
| [`tooltip/in-the-dom`](/docs/components/tooltip/ax#ax-checklist) | Must | It stays in the DOM while it's closed, so its trigger's description is always there | None | WAI-ARIA |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [Tooltip](/docs/components/tooltip), where each rule is explained, with the sources it draws on
