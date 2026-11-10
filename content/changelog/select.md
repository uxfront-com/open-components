---
title: The Select
description: A new component page, on a select that picks one option or several from a list, looks like your brand, works with every form and hands phones their own picker.
date: 2026-11-09
category: Components
link:
  label: Read the Select page
  to: /docs/components/select
---

Selects let people pick one option, or several, out of a list that's too long to lay out on the page. The Select page walks you through building one you can restyle part by part, on the APG's select-only combobox, without giving up what a native `<select>` does for free.

## New

- The Select is a `<button role="combobox">` with a `listbox` panel, so the Field names it with the same `<label for>` it gives an Input, and it follows the APG's keyboard model, typing to search included.
- It picks one value or several, with removable chips you can reach by keyboard, shows an icon beside each option where you give one, and its seven parts each restyle through tokens and slots.
- A native `<select>` is always in the page, so it submits under its `name`, validates and resets with its form, and the `nativeOnTouch` prop shows it where the primary pointer is coarse, with no layout shift or hydration mismatch.
- It comes with its own contract, live examples and a tested reference implementation.

## Improved

- The Roadmap, the Field, the Input, the Checkbox, the Checkbox Group, the Radio Group and the Popover now link to the Select.
