---
title: Accessible Textarea Checklist (WCAG)
description: Every Textarea rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Textarea
---

Here's every rule for the [Textarea](/docs/components/textarea) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Textarea's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Textarea's checklist](/docs/components/textarea#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`textarea/contrast`](/docs/components/textarea/ui#ui-checklist) | Must | The text, the placeholder and the count have a contrast of 4.5:1, and the focus ring has 3:1 against the page | [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (AA), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.3, 1.4.11 (AA) |
| [`textarea/boundary-contrast`](/docs/components/textarea/ui#ui-checklist) | Must | The border has a contrast of 3:1 against the page, so an empty textarea stays visible | [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.11 (AA) |
| [`textarea/focus-visible`](/docs/components/textarea/ui#ui-checklist) | Must | Focus shows an `outline` at least 2px thick around the field, outside its border | [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) (AA), [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) (AAA) | WCAG 2.4.7 (AA), 2.4.13 (AAA) |
| [`textarea/target-size`](/docs/components/textarea/ui#ui-checklist) | Must | The field is at least 24px tall, and at least 44px tall on touch screens | [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (AA), [2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) (AAA) | WCAG 2.5.8 (AA), 2.5.5 (AAA) |
| [`textarea/resizable`](/docs/components/textarea/ui#ui-checklist) | Must | Its height is a minimum, in lines of its own line height plus padding in `rem`, so it grows with its text instead of clipping it | [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) (AA), [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) (AA) | Open Components, beyond WCAG 1.4.4, 1.4.12 (AA) |
| [`textarea/fits-text`](/docs/components/textarea/ui#ui-checklist) | Should | Its `rows` fit the text it expects, and it's never wider than its column | [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) (AA) | Open Components, beyond WCAG 1.4.10 (AA) |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`textarea/native-element`](/docs/components/textarea/ux#ux-checklist) | Must | It's a native `<textarea>`, and never a `contenteditable` element or a `role="textbox"` | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | Open Components, beyond WCAG 2.1.1, 4.1.2 (A) |
| [`textarea/visible-label`](/docs/components/textarea/ux#ux-checklist) | Must | Every textarea has a visible `<label>`, linked with `for`, rather than a placeholder alone | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A), [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A), [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 1.3.1, 3.3.2, 4.1.2 (A) |
| [`textarea/label-in-name`](/docs/components/textarea/ux#ux-checklist) | Must | An `aria-label` or `aria-labelledby` includes the visible label, ideally at the start | [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html) (A) | WCAG 2.5.3 (A) |
| [`textarea/described`](/docs/components/textarea/ux#ux-checklist) | Should | Hints, like what to include, are linked with `aria-describedby`, and a placeholder only ever shows a short example | [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) (A) | WCAG 1.3.1 (A), Open Components |
| [`textarea/keyboard`](/docs/components/textarea/ux#ux-checklist) | Must | `Tab` moves focus to and from it, and the browser's text editing keys work as they do in any textarea | [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (A), [2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html) (A) | WCAG 2.1.1, 2.1.2 (A) |
| [`textarea/limit-in-hint`](/docs/components/textarea/ux#ux-checklist) | Should | A limit is stated in the hint, linked with `aria-describedby`, before people start writing | [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) (A) | WCAG 3.3.2 (A) |
| [`textarea/count`](/docs/components/textarea/ux#ux-checklist) | Should | The count says how many characters are left, or how many too many, describes the textarea, and over the limit sets `aria-invalid="true"` | [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) (A) | WCAG 3.3.1 (A), Open Components |
| [`textarea/announce-count`](/docs/components/textarea/ux#ux-checklist) | Should | The count is announced through one polite live region once people pause near the limit, and never on every keystroke | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA) | WCAG 4.1.3 (AA), Open Components |
| [`textarea/input-purpose`](/docs/components/textarea/ux#ux-checklist) | Must | A textarea that asks for the person's own address has `autocomplete="street-address"` | [1.3.5 Identify Input Purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html) (AA) | WCAG 1.3.5 (AA) |
| [`textarea/error-message`](/docs/components/textarea/ux#ux-checklist) | Must | An invalid textarea has an error message, in text and linked with `aria-describedby`, that says what's wrong and how to fix it | [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (A), [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) (A), [3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html) (AA) | WCAG 1.4.1, 3.3.1 (A), 3.3.3 (AA) |
| [`textarea/invalid-state`](/docs/components/textarea/ux#ux-checklist) | Must | A textarea sets `aria-invalid="true"` while its error message shows, and only looks invalid when it does | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A), Open Components |
| [`textarea/focus-not-obscured`](/docs/components/textarea/ux#ux-checklist) | Must | Sticky headers and footers never cover a focused textarea, for example thanks to `scroll-padding` | [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) (AA), [2.4.12 Focus Not Obscured (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html) (AAA) | WCAG 2.4.11 (AA), 2.4.12 (AAA) |

## AX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`textarea/role-and-name`](/docs/components/textarea/ax#ax-checklist) | Must | It can be found by its role and label alone, with `getByRole("textbox", { name })` | [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) (A) | WCAG 4.1.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Textarea](/docs/components/textarea), where each rule is explained, with the sources it draws on
