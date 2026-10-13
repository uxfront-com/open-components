---
title: The Checkbox
description: Our fourth component page, on a checkbox that people can check with a click on its label, that says what it means and when it's mixed, that forms send the way they expect, and that agents can check.
date: 2026-10-13T12:00:00Z
category: Components
link:
  label: Read the Checkbox page
  to: /docs/components/checkbox
---

Checkboxes let people say yes or no to one thing, and the browser has had one built in for as long as there have been forms, which is why rebuilding it so often goes wrong. The Checkbox page walks you through building one the right way, from a label that toggles the box to a "Select all" that screen readers announce as mixed.

## New

- The Checkbox wraps its own label around the box, so the text names it and a press on the text toggles it, and the box sits in a hit area of at least 24 × 24px at every size.
- It takes the Button's and the Input's sizes, and shows checked, indeterminate, disabled and invalid with a look of their own, each read from the `<input>`, so what people see always matches what screen readers announce.
- Its checklist covers how forms use it too, like keeping labels positive, saying why a required box needs checking, and remembering that an unchecked box sends nothing.
- It comes with its own contract, live examples and a tested reference implementation, ready for the Checkbox Group that's next on our Roadmap.
