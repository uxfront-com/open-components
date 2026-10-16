---
title: The Checkbox Group
description: A new component page, on a group of checkboxes that its question names, that people can pick any number of options from, with a select-all box that's never out of step, and that agents can check.
date: 2026-10-16T12:00:00Z
category: Components
link:
  label: Read the Checkbox Group page
  to: /docs/components/checkbox-group
---

Checkbox groups let people pick any number of options from a short list, and most of what goes wrong with them is what holds the boxes together. The Checkbox Group page walks you through building one the right way, from a `<fieldset>` that its question names to a select-all box that turns mixed when some options are checked, and checks them all with one press.

## New

- The Checkbox Group is a `<fieldset>` of Checkboxes, named by its `<legend>` and described by its hint and error message, so screen readers announce the question along with its options.
- Its value is a list, sent with one shared `name`, and its options run in a column by default, so they're quick to scan and fit on any screen.
- Its select-all box is worked out from the options every time they change, and checks every option, or clears them all, as the APG asks.
- Its checklist covers how forms use it too, like saying "Pick at least one" when people have to, and checking it in your own code, since HTML's `required` doesn't fit a group.
- It comes with its own contract, live examples and a tested reference implementation, built out of the Checkbox's.
