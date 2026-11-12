---
title: The Combobox
description: A new component page, on a combobox that filters a list of suggestions as people type, picks one or several, keeps typed text only where you allow it and fits the room a phone's keyboard leaves.
date: 2026-11-12
category: Components
link:
  label: Read the Combobox page
  to: /docs/components/combobox
---

Comboboxes let people type to narrow a long list, like countries, and pick from what's left. The Combobox page walks you through building one on the APG's editable combobox with list autocomplete, which never picks an option people didn't choose, with the Select's panel, options, tags and tokens, so one class restyles both.

## New

- The Combobox is an `<input role="combobox">` with `aria-autocomplete="list"` and the Select's `listbox` panel, which filters on any part of a label, ignoring case and accents, and announces the count once typing pauses.
- It picks one value or several, as tags, and keeps text that isn't an option only with `allowCustomValue`, or adds it as a new option with `creatable`, and the page says what each one submits.
- A hidden `<select>` submits, validates and resets with its form, for picked and typed values alike, and the panel fits the room the on-screen keyboard leaves.
- It comes with its own contract, live examples and a tested reference implementation.

## Improved

- `tokens/component-scope` now says that parts a component shares with another component read that component's variables, so the Combobox reads the Select's for its panel, options and tags. Its ID is the same.
- Contracts can list those variables under a new `tokens.shared` field, apart from their own `variables`.
- The Select's panel, options, tags and styles are now in files of their own, which the Select page shows, so you can copy them for both components. The Select itself hasn't changed.
- The Roadmap, the Field, the Input, the Select, the Checkbox, the Checkbox Group and the Popover now link to the Combobox.
