---
title: The Radio Group
description: A new component page, on a radio group that asks one clear question, lets people pick one answer with a pointer or the arrow keys, says what's wrong when they skip it, and that agents can check.
date: 2026-10-18T12:00:00Z
category: Components
link:
  label: Read the Radio Group page
  to: /docs/components/radio-group
---

Radio groups let people pick one answer out of a few, and they're easy to get subtly wrong, like a question screen readers never read, or a red border that only sighted people notice. The Radio Group page walks you through building one the right way, from the legend that asks the question to the error message that says what to do.

## New

- The Radio Group is built on native radios in a `<fieldset>`, named by its `<legend>`, so the browser handles the keyboard: one `Tab` stop per group, and arrow keys that move, check and wrap round.
- Its radios have the Input's heights, so a radio lines up with an input beside it, and their labels are part of what people press, so every radio is at least 24 × 24px.
- Its radios stack, one per line, apart from two short options, like "Yes" and "No", which can sit side by side with `orientation="horizontal"`.
- Its invalid look comes from `aria-invalid` on the group, which takes the `radiogroup` role so screen readers can announce it, and its error message sits above the radios, where people read it before they choose again.
- It comes with its own contract, live examples and a tested reference implementation.
