---
title: The Textarea
description: Our component page on a textarea that people can label, write in at length and fix, that grows or resizes without cutting anything off, and that agents can check.
date: 2026-10-16
category: Components
link:
  label: Read the Textarea page
  to: /docs/components/textarea
---

Textareas are where people write more than a line, and they're often built as an input that's a few lines taller. The Textarea page walks you through building one the right way, from a height that fits what people are about to write to a limit that never cuts off what they paste.

## New

- The Textarea has the Input's sizes, padding and states, so the two line up in a form, and a textarea of one row is exactly as tall as an input.
- Its height starts at `rows` and never goes below it. People resize it on the block axis, or it grows with its text, up to `maxRows`.
- Its count lets people type and paste past a limit, says by how much, and is announced to screen readers once they pause, rather than on every keystroke.
- `Enter` always starts a new line, and its checklist covers how forms use it too, like stating a limit in the hint and never making `Enter` send a message.
- It comes with its own contract, live examples and a tested reference implementation.
