---
title: The Tag Group
description: A new component page, on a group of tags that screen readers name and count, that wraps without crowding touch targets, and that keeps keyboard users in place as tags are removed.
date: 2026-11-14
category: Components
link:
  label: Read the Tag Group page
  to: /docs/components/tag-group
---

Tags rarely come alone: an issue has its labels, a post its topics and a search its filters. The Tag Group page walks you through laying them out as a named list of Tags, and through what happens when one is removed, so keyboard and screen reader users never lose their place.

## New

- A tag group is a `<ul>` named like "Labels", with an `<li>` and the shipped Tag per tag, so screen readers say what the tags are and how many there are.
- Every link and remove button keeps its own stop in the tab order, with no arrow keys, and the page explains why we chose that over React Aria's grid.
- Once a tag has gone, focus moves to the next remove button, then to an element you name, then to the previous one, and the group announces "Bug removed". With no tags left, it shows an empty state that focus can land on.
- Rows sit far enough apart that a tag's hit area never covers the tag below it, on touch screens too.
- It comes with five sizes, its own contract, live examples and a tested reference implementation.

## Improved

- The Tag's UX, DX and AX pages now link to the Tag Group where they said it would come next, and the Roadmap ticks it.
