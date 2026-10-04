---
title: Clearer rules for the Button
description: The Button page now tells you which details it requires and which are up to you, and where each of its rules comes from.
date: 2026-10-04
category: Components
link:
  label: Read the Button's checklist
  to: /docs/components/button#checklist
---

It wasn't always clear which details on the Button page you had to follow, like the focus ring's 2px offset, and which were simply how our reference implementation does it. Now the checklist is what your button needs to meet, anything else is up to you, and every rule says where it comes from.

## Improved

- Every rule has a basis, like the WCAG 2.2 success criteria behind it, so you can tell what WCAG asks for at level AA from where we go further.
- The page tells a menu apart from a select, and points to the Roadmap for the components that will build on the Button.

## Fixed

- `button/keep-focus` now covers a button that's disabled while it has focus, like Next on the last page, which no Button could promise on its own before.
- `button/focus-visible` takes any offset, as long as the ring is at least 2px thick and outside the button, and `button/focus-not-obscured` now cites WCAG 2.4.12, which matches what it asks for.
