---
title: The Card
description: Our fourth component page, on a card that groups what people need to know about one thing, that keyboard and screen reader users can move through, and that agents can check.
date: 2026-10-13
category: Components
link:
  label: Read the Card page
  to: /docs/components/card
---

Cards group what people need to know about one thing, like a project or a product, and they're easy to build so that only a mouse can use them. The Card page walks you through building one the right way, from a heading that people can find it by to a link that covers the whole card without swallowing its text.

## New

- A card that takes people somewhere has one link, in its heading, stretched over the card, so the link is named by the heading alone, and its actions, like Save, stay Buttons of their own.
- It has a header, a body, actions and a footer, with no borders between them, so a card reads as one block, and a separator adds a line only where a page needs one.
- Its heading comes first in the DOM, at the level you give it, while its image and eyebrow are shown above it, so people who move from heading to heading land at the start of the card.
- Its checklist covers how pages use it too, like putting cards in a list, describing their images and writing headings that say where the link goes.
- It comes with its own contract, live examples and a tested reference implementation.
