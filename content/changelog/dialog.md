---
title: The Dialog
description: Our fourth component page, on a modal dialog that takes focus and gives it back, that everyone can close, that developers control and that agents can check.
date: 2026-10-13
category: Components
link:
  label: Read the Dialog page
  to: /docs/components/dialog
---

Dialogs ask for someone's full attention, and most of what they do happens out of sight, in focus and in the accessibility tree, which is why they're so often broken for keyboard and screen reader users. The Dialog page walks you through building one the right way, from moving focus in when it opens to giving it back to the button that opened it when it closes.

## New

- The Dialog is a native `<dialog>`, opened with `showModal()`, so the page behind it is inert and `Tab` never wanders off into it.
- It's named by its title and described by its description, and alert dialogs, for confirmations, have no close button and ignore a stray click outside.
- It asks, rather than closing itself. `Escape`, the close button, the backdrop and a `<form method="dialog">` each fire `close` with the reason, so you can keep it open when people would lose what they've typed, and when a browser closes it anyway, `close` fires with `closed`, so your code can follow.
- It comes with its own contract, live examples and a tested reference implementation.
