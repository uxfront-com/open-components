---
title: The Field
description: A new component page, on a field that labels, describes and explains the errors of any form control, so screen readers announce what it asks and what's wrong, and that agents can check.
date: 2026-10-29
category: Components
link:
  label: Read the Field page
  to: /docs/components/field
---

A form control is only as good as the label, hint and error message around it, and those are elements of their own, linked by ID, which is where they come apart. The Field page walks you through putting them together, from a label that focuses its control when you click it, to an error that screen readers read with its control and a failed submit that takes people straight to it.

## New

- The Field renders the label, hint and error around any form control, and links them with its `id`, `aria-describedby` and `aria-invalid`, without changing the control.
- It works with the Input, the Textarea, the Checkbox, the Switch, the Checkbox Group and the Radio Group, and puts the label where each one needs it.
- Its IDs come from the `id` or `name` you pass, never from a generator, so the label works in the server's markup before any script runs.
- Its checklist covers how forms use it too, like marking the optional fields in words, checking values when people leave a control and moving focus to the first error on a failed submit.
- It comes with its own contract, live examples and a tested reference implementation.

## Improved

- The Input, the Textarea, the Checkbox, the Switch, the Checkbox Group and the Radio Group now link to the Field, which their pages promised.
