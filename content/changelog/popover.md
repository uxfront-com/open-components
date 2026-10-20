---
title: The Popover
description: A new component page, on a popover that shows more next to what opened it, leaves the rest of the page working, opens and closes the way people expect and that agents can check.
date: 2026-10-21
category: Components
link:
  label: Read the Popover page
  to: /docs/components/popover
---

Popovers show more next to the button that opened them, like a set of filters or a hint with a link, without blocking the page. The Popover page walks you through building one on the `popover` attribute, from the Button with `popovertarget` that opens it, before any script loads, to the `Escape` that closes it without closing the Dialog behind it.

## New

- The Popover is a non-modal `role="dialog"`, named by its title, which the browser puts in the top layer and closes on `Escape` and on a press outside.
- Focus moves in when it opens and goes back to its trigger when it closes, and `close` says why it closed, like `escape` or `outside`.
- `Escape` closes only the layer on top, so a Tooltip inside a Popover, and a Popover inside a Dialog, each close on their own.
- It opens beside its trigger, with the Tooltip's `placement` names, flips when there's no room and fits a phone's screen.
- It comes with its own contract, live examples and a tested reference implementation.

## Improved

- The Dialog, the Tooltip and the Button now link to the Popover, and the Button's Filters example sets `aria-haspopup="dialog"`.
