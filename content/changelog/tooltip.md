---
title: The Tooltip
description: Our fourth component page, on a tooltip that shows a short hint on hover and keyboard focus, that people can reach, read and dismiss, and that agents can check.
date: 2026-10-13T15:00:00Z
category: Components
link:
  label: Read the Tooltip page
  to: /docs/components/tooltip
---

Tooltips are small and everywhere, which is why they so often only work for a mouse. The Tooltip page walks you through building one that opens for the keyboard too, stays open while people read it and closes with `Escape`. The other overlays on our Roadmap, like the Popover and the Dialog, will follow its rules for the top layer and `Escape`.

## New

- A tooltip either shows an icon-only button's own label, hidden from screen readers so they don't hear it twice, or describes its trigger with `aria-describedby`.
- It opens in the top layer and finds its place with CSS anchor positioning, flipping when there's no room, with a short script for browsers that don't have it yet. An optional arrow points at its trigger from whichever side it opens on.
- Its checklist covers WCAG's rules for content on hover or focus, and the rules for the screens that use it, like never putting anything people need only in a tooltip, since a tap never opens one.
- It comes with its own contract, live examples and a tested reference implementation.
