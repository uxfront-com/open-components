---
title: Accessible Tag Checklist (WCAG)
description: Every Tag rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Tag
---

Here's every rule for the [Tag](/docs/components/tag) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Tag's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Tag's checklist](/docs/components/tag#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`tag/target-size`](/docs/components/tag/ui#ui-checklist) | Must | The remove button and a link label each take a press over at least 24 × 24px, and at least 44px tall on a touch screen | [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (AA), [2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) (AAA) | WCAG 2.5.8 (AA), 2.5.5 (AAA) |
| [`tag/contrast`](/docs/components/tag/ui#ui-checklist) | Must | The label has at least 4.5:1 against the tag's background, and the focus ring at least 3:1 against what's behind it | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.3, 1.4.11 (AA) |
| [`tag/focus-visible`](/docs/components/tag/ui#ui-checklist) | Must | The link and the remove button show an outline at least 2px thick on `:focus-visible` | [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) (AA) | WCAG 2.4.7 (AA) |
| [`tag/resizable`](/docs/components/tag/ui#ui-checklist) | Must | The tag is sized with a `min-height` in `rem`, so it grows with its text | [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) (AA) | Open Components, beyond WCAG 1.4.4 (AA) |
| [`tag/decorative-icons`](/docs/components/tag/ui#ui-checklist) | Must | The leading icon and the remove button's icon are hidden from assistive technologies | [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) (A) | WCAG 1.1.1 (A) |
| [`tag/link-distinct`](/docs/components/tag/ui#ui-checklist) | Should | A link tag looks different from a plain one by more than its colour, like a border | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A) | Open Components, beyond WCAG 1.4.1 (A) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`tag/plain-text`](/docs/components/tag/ux#ux-checklist) | Must | A tag without a link or a remove button has no role and isn't focusable | None | WAI-ARIA |
| [`tag/remove-button`](/docs/components/tag/ux#ux-checklist) | Must | Removal is a native `<button type="button">`, which `Enter` and `Space` press | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A) | HTML, WCAG 2.1.1 (A) |
| [`tag/remove-name`](/docs/components/tag/ux#ux-checklist) | Must | The remove button's name includes the tag's text, like "Remove Bug" | [2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html) (AA), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 2.4.6 (AA), 4.1.2 (A) |
| [`tag/disabled`](/docs/components/tag/ux#ux-checklist) | Must | `disabled` drops the remove button, and a link loses its `href` and takes `aria-disabled="true"` | None | HTML, WAI-ARIA |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`tag/role-and-name`](/docs/components/tag/ax#ax-checklist) | Must | It can be found by its parts' roles and names, with `getByRole("button", { name: "Remove Bug" })` and, as a link, `getByRole("link", { name: "Bug" })` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [Tag](/docs/components/tag), where each rule is explained, with the sources it draws on
