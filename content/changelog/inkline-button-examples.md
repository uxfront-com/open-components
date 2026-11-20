---
title: The Button's examples run on Inkline
description: The Button page's examples now show Inkline's Button, a real component built to follow this standard, in the framework you pick.
date: 2026-11-20
category: Components
link:
  label: Read the Button page
  to: /docs/components/button
---

Until now, every example on the Button page ran on our Vue reference implementation, whatever framework you picked for the code under it. They now run on the Button from [Inkline](https://inkline.io), a UI library built to follow this standard, so you see the component in the same framework as its code.

## Improved

- Each example on the Button's UI and UX pages shows Inkline's Button in the framework you pick in the Framework select, or in React when you pick Vanilla, which Inkline doesn't have.
- The playground on the Button's Overview is Inkline's, with its controls under the Button. It shows React when you pick Astro, since Astro's static build can't redraw a Button whose controls change.
- The examples follow the site's light or dark mode and grow with what they show.
