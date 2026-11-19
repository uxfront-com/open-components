---
title: Accessible Switch Checklist (WCAG)
description: Every Switch rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Switch
---

Here's every rule for the [Switch](/docs/components/switch) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Switch's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Switch's checklist](/docs/components/switch#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`switch/contrast`](/docs/components/switch/ui#ui-checklist) | Must | The track and the thumb have a contrast of 3:1 against what's next to them, on and off, and so does the focus ring | [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.11 (AA) |
| [`switch/more-than-colour`](/docs/components/switch/ui#ui-checklist) | Must | On and off differ by more than colour: the thumb moves to the other end, and the track fills | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A) | WCAG 1.4.1 (A) |
| [`switch/focus-visible`](/docs/components/switch/ui#ui-checklist) | Must | Focus shows an `outline` at least 2px thick around the track, outside it | [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) (AA), [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) (AAA) | WCAG 2.4.7 (AA), 2.4.13 (AAA) |
| [`switch/target-size`](/docs/components/switch/ui#ui-checklist) | Must | The hit area is at least 24 × 24px, and at least 44 × 44px on touch screens | [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (AA), [2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) (AAA) | WCAG 2.5.8 (AA), 2.5.5 (AAA) |
| [`switch/resizable`](/docs/components/switch/ui#ui-checklist) | Must | The track and the thumb are sized in `rem`, so they grow with the text | [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) (AA) | Open Components, beyond WCAG 1.4.4 (AA) |
| [`switch/reduced-motion`](/docs/components/switch/ui#ui-checklist) | Must | The thumb doesn't slide when `prefers-reduced-motion: reduce` is set | [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA) | WCAG 2.3.3 (AAA) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`switch/native-element`](/docs/components/switch/ux#ux-checklist) | Must | It's a native `<input type="checkbox">` with `role="switch"`, and never a `<div>` | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | APG, Open Components, beyond WCAG 2.1.1, 4.1.2 (A) |
| [`switch/checked-state`](/docs/components/switch/ux#ux-checklist) | Must | Its state is the checkbox's own `checked`, announced as on or off, with no pressed or mixed state | None | WAI-ARIA, APG |
| [`switch/visible-label`](/docs/components/switch/ux#ux-checklist) | Must | Every switch has a visible `<label>`, linked with `for` | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 1.3.1, 3.3.2, 4.1.2 (A) |
| [`switch/label-in-name`](/docs/components/switch/ux#ux-checklist) | Must | An `aria-label` or `aria-labelledby` includes the visible label, ideally at the start | [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html) (A) | WCAG 2.5.3 (A) |
| [`switch/stable-label`](/docs/components/switch/ux#ux-checklist) | Must | The label names the setting and stays the same whether the switch is on or off | None | APG |
| [`switch/described`](/docs/components/switch/ux#ux-checklist) | Should | Hints, like what the setting changes, are linked with `aria-describedby` | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A) |
| [`switch/keyboard`](/docs/components/switch/ux#ux-checklist) | Must | `Tab` reaches the switch, and `Space` and a click on its label flip it | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | WCAG 2.1.1 (A), APG |
| [`switch/announce-saved`](/docs/components/switch/ux#ux-checklist) | Should | While its change is saved, it keeps its new state and stays enabled, and a status message says when it's saved | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA) | WCAG 4.1.3 (AA), Open Components |
| [`switch/no-context-change`](/docs/components/switch/ux#ux-checklist) | Must | Flipping it never moves focus, opens a page or submits a form, unless its hint says so first | [3.2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html) (A) | WCAG 3.2.2 (A) |
| [`switch/error-message`](/docs/components/switch/ux#ux-checklist) | Must | An invalid switch has an error message, in text and linked with `aria-describedby`, that says what happened and what to do | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A), [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) (A) | WCAG 1.4.1, 3.3.1 (A) |
| [`switch/invalid-state`](/docs/components/switch/ux#ux-checklist) | Must | A switch sets `aria-invalid="true"` while its error message shows, and only looks invalid when it does | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A), Open Components |
| [`switch/read-only`](/docs/components/switch/ux#ux-checklist) | Must | A read-only switch can be focused and is sent with its form, but doesn't flip, and sets `aria-readonly="true"` | None | WAI-ARIA |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`switch/role-and-name`](/docs/components/switch/ax#ax-checklist) | Must | It can be found by its role, its label and its state alone, with `getByRole("switch", { name, checked })` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [Switch](/docs/components/switch), where each rule is explained, with the sources it draws on
