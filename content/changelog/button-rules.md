---
title: Clearer rules for the Button
description: The Button page now tells what the standard requires apart from how our reference implementation does it, and says where each rule comes from.
date: 2026-10-04
category: Components
link:
  label: Read the Button's checklist
  to: /docs/components/button#checklist
---

A standard is only useful if you can tell what it asks of you. The Button page used to mix its rules with the details of our reference implementation, like the focus ring's 2px offset, so it wasn't always clear which ones you had to follow. Now the checklist is what the standard requires, and every rule says where it comes from.

## Improved

- Every rule has a basis: the WCAG 2.2 success criteria behind it and their level, the HTML standard, WAI-ARIA or the APG, or Open Components when it's our own call. WCAG 2.2 AA is the baseline, and the few rules that go further say so.
- The page says which props the standard requires, like `variant` and `disabled`, and which are just how our Button meets its rules, like `focusableWhenDisabled`.
- Any outline at least 2px thick that's drawn outside the button now meets the focus rule, whatever its offset.
- The Menu buttons section and the FAQ tell a menu apart from a select, and the page links to the Roadmap for the components that come next.

## Fixed

- `button/keep-focus` now also covers a button that's disabled while it has focus, like Next on the last page, which has to stay focusable. Before, the rule said a focused button is never natively disabled, which no button could promise on its own.
- `button/focus-not-obscured` now cites WCAG 2.4.12 (AAA), which matches what it asks for, as well as 2.4.11 (AA).
