---
title: The Spinner
description: Our second component page, on a spinner that shows something is busy without getting in the way of screen readers, reduced motion or the layout around it.
date: 2026-10-05
category: Components
link:
  label: Read the Spinner page
  to: /docs/components/spinner
---

A spinner is one of the simplest components there is, and still easy to get wrong. The Spinner page walks you through showing that something is busy, and making sure everyone hears what's loading and how it went, since the spinner itself stays silent.

## New

- The Spinner takes its size and colour from the text around it, stays hidden from screen readers and stops turning when someone prefers reduced motion.
- Its checklist covers how screens use it too, like showing one spinner per wait, saying what's loading in a status message and leaving focus where it was.
- It walks you through every state of the wait it shows, from busy to done or failed, and what to say when it's taking longer than expected.
- It comes with its own contract, live examples, a tested reference implementation and a browser test that checks what screen readers and agents find while the page waits.

## Improved

- The Button shows the Spinner while it's loading, so changing your spinner once changes it everywhere.
