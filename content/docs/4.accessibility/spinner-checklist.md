---
title: Accessible Spinner Checklist (WCAG)
description: Every Spinner rule that WCAG 2.2, WAI-ARIA or the APG backs, in one checklist, with the success criteria behind each rule and their level.
navigation:
  title: Spinner
---

Here's every rule for the [Spinner](/docs/components/spinner) that WCAG 2.2, WAI-ARIA or the APG backs, in one list you can work through when you build or review one. Each row names the WCAG 2.2 success criteria behind its rule, with their level, and links to the rule's table on its layer's page, where we explain why it's there. A rule that rests on WAI-ARIA or the APG alone says "None".

We build this list from the Spinner's checklists, so it always matches them. It leaves out the rules that rest only on HTML and the ones that are our own, so you'll find every rule in the [Spinner's checklist](/docs/components/spinner#checklist).

## UI rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`spinner/contrast`](/docs/components/spinner/ui#ui-checklist) | Must | The indicator has a contrast of 3:1 against what's behind it | [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (AA) | WCAG 1.4.11 (AA) |
| [`spinner/reduced-motion`](/docs/components/spinner/ui#ui-checklist) | Must | It doesn't turn when `prefers-reduced-motion: reduce` is set, but still shows that something's happening, like with a pulse | [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA) | WCAG 2.3.3 (AAA), Open Components |

## UX rules

| Rule | Level | Requirement | WCAG 2.2 | Basis |
| ---- | ----- | ----------- | -------- | ----- |
| [`spinner/decorative`](/docs/components/spinner/ux#ux-checklist) | Must | It's hidden from assistive technologies with `aria-hidden`, and has no role or name of its own | [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) (A) | WCAG 1.1.1 (A) |
| [`spinner/say-what-loads`](/docs/components/spinner/ux#ux-checklist) | Must | Whatever shows it says what's loading, in a status message that's already in the page or with a label it announces, like the Button's `loadingLabel` | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA) | WCAG 4.1.3 (AA) |
| [`spinner/announce-outcome`](/docs/components/spinner/ux#ux-checklist) | Should | When the wait ends, the page says how it went, in the same status message, or in an alert for an error that needs attention straight away | [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA) | Open Components, beyond WCAG 4.1.3 (AA) |
| [`spinner/remove-when-done`](/docs/components/spinner/ux#ux-checklist) | Must | It's taken out as soon as the wait ends or fails, so it never turns with nothing to wait for | [2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) (A) | Open Components, beyond WCAG 2.2.2 (A) |

## Sources

- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), for each success criterion's number, short name and level
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), which each criterion links to
- [Spinner](/docs/components/spinner), where each rule is explained, with the sources it draws on
