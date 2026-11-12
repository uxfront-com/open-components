---
title: The Tag
description: A new component page, on a tag that labels what something is about, that people can remove or follow as a link, with a keyboard and a screen reader.
date: 2026-11-12
category: Components
link:
  label: Read the Tag page
  to: /docs/components/tag
---

Tags label what something is about, like a post's topics or an issue's labels, and people can remove them or follow them to a page about them. The Tag page walks you through building one that takes its look from the Select's tags, with a remove button every screen reader and voice control user can name.

## New

- A plain tag is text, with no role and no place in the tab order. A link tag holds a real `<a href>`, or your router's link, and a removable one adds a native `<button>` named after it, like "Remove Bug".
- It fires `remove` and keeps no state of its own, so the page that owns the tags removes them, moves focus and announces what went.
- It draws the line between a tag, which says what something is about, and a badge, which marks a status or a count, and leaves selectable tags to toggle Buttons and the Checkbox Group.
- It comes with five sizes that match the Select's tags, its own contract, live examples and a tested reference implementation.

## Improved

- The Roadmap and the Select now link to the Tag.
