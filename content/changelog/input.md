---
title: The Input
description: Our third component page, on a text input that people can label, fill in and fix, that works with every keyboard, autofill and password manager, and that agents can check.
date: 2026-10-05
category: Components
link:
  label: Read the Input page
  to: /docs/components/input
---

Inputs are where people tell you things, and they look so simple that they're often built in a hurry. The Input page walks you through building one the right way, from a label that doesn't disappear as people type to an error message that says how to fix what's wrong.

## New

- The Input has the Button's sizes, so the two line up in a row, and slots for icons, prefixes and suffixes, and for buttons like Show password.
- Its border has 3:1 against the page, so people can always see where to type, and its invalid look comes from `aria-invalid`, so it always matches what screen readers announce.
- Its checklist covers how forms use it too, like giving every input a label and an `autocomplete` value, checking values when people leave an input rather than while they type, and never blocking paste.
- It comes with its own contract, live examples and a tested reference implementation.
