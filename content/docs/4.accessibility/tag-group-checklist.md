---
title: Accessible Tag Group Checklist (WCAG)
description: Every Tag Group rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Tag Group
---

Here's every rule for the [Tag Group](/docs/components/tag-group) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Tag Group's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Tag Group's checklist](/docs/components/tag-group#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`tag-group/wrap`](/docs/components/tag-group/ui#ui-checklist) | Must | Tags wrap onto as many rows as they need, with no horizontal scroll at 320px wide | [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) (AA) | WCAG 1.4.10 (AA) |
| [`tag-group/row-gap`](/docs/components/tag-group/ui#ui-checklist) | Must | Rows sit at least 24px minus the tag's height apart, and 44px minus it on a touch screen, so no tag's hit area covers a tag on the next row | [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (AA), [2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) (AAA) | WCAG 2.5.8 (AA), 2.5.5 (AAA) |
| [`tag-group/contrast`](/docs/components/tag-group/ui#ui-checklist) | Must | The empty state's text has at least 4.5:1 against what's behind it, and its focus ring at least 3:1 | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.3, 1.4.11 (AA) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`tag-group/list`](/docs/components/tag-group/ux#ux-checklist) | Must | The tags are a `<ul>` with one `<li>` per tag, which keeps its list role where its bullets are removed | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A) |
| [`tag-group/name`](/docs/components/tag-group/ux#ux-checklist) | Must | The list has a name, from `label` or from a visible heading through `aria-labelledby` | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | Open Components, beyond WCAG 1.3.1 (A) |
| [`tag-group/tab-stops`](/docs/components/tag-group/ux#ux-checklist) | Must | Each link and remove button is a stop in the tab order, in order, with no roving focus and no arrow keys | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | WCAG 2.1.1 (A) |
| [`tag-group/focus-after-remove`](/docs/components/tag-group/ux#ux-checklist) | Must | Once a removed tag has gone, focus that was on it moves to the next tag's remove button, then `fallbackFocus`, then the previous tag's remove button, then the empty state, or the list when tags are left that can't be removed | [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (A) | WCAG 2.4.3 (A) |
| [`tag-group/announce-removal`](/docs/components/tag-group/ux#ux-checklist) | Should | Once a tag whose remove button was pressed has gone, a polite live region announces it, like "Bug removed" | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA) | WCAG 4.1.3 (AA) |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`tag-group/role-and-name`](/docs/components/tag-group/ax#ax-checklist) | Must | It can be found by its role and name, with `getByRole("list", { name: "Labels" })`, and each tag by its parts', like `getByRole("button", { name: "Remove Bug" })` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Tag Group](/docs/components/tag-group), where each rule is explained, with the sources it draws on
