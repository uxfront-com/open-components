---
title: Where each rule comes from
description: Every rule now says where it comes from, so you can tell what WCAG asks for from where we go further, and the Button's keep-focus rule is one every button can meet.
date: 2026-10-04
category: Components
link:
  label: Read the Button's checklist
  to: /docs/components/button#checklist
---

Most of our rules rest on WCAG, but some go further, and some are our own. Every checklist now has a Basis column that tells them apart, so you know when a rule is something WCAG asks for at level AA, and when it's a call we've made.

## New

- Every rule in the Button and Design Tokens checklists names its basis: the WCAG 2.2 success criteria behind it and their level, HTML, WAI-ARIA or the APG, or Open Components for our own rules.
- Contracts include each rule's basis too, so your agents can tell the rules apart as well.

## Improved

- `button/focus-visible` asks for an outline at least 2px thick, rather than exactly 2px, and the Button page says what we recommend for the details you can change and still meet the standard, like the ring's offset or the opacity of the state layers.

## Fixed

- `button/keep-focus` now covers a button that can be disabled while it has focus, like Next on the last page, which stays focusable. Before, it said a focused button is never natively disabled, which no Button could promise on its own.
- `button/focus-not-obscured` now cites WCAG 2.4.12 as well as 2.4.11, since it asks that a focused button isn't covered at all.
