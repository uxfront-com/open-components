---
title: The Select
description: Our fourth component page, on a select that people can label, open with any keyboard or finger and fill in with autofill, that works before JavaScript loads, and that agents can check.
date: 2026-10-13
category: Components
link:
  label: Read the Select page
  to: /docs/components/select
---

Selects let people choose one option out of a list, and they're so often rebuilt from scratch that many of them can't be opened with a keyboard. The Select page walks you through building one on the browser's own `<select>`, so phones keep their own picker and forms work before your JavaScript loads.

## New

- The Select has the Input's and the Button's sizes, so they line up in a row, and a placeholder option that a required select won't accept as an answer.
- Browsers that support `appearance: base-select` style its picker with the same tokens, while every other browser, and every phone, keeps its own.
- Its checklist covers how forms use it too, like giving every select a label and an `autocomplete` value, and never acting as soon as an option is chosen, since on Windows the arrow keys choose them.
- It comes with its own contract, live examples and a tested reference implementation.
