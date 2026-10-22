---
title: Every component, a page per layer
description: The Card, Checkbox, Checkbox Group, Dialog, Input, Radio Group, Spinner, Switch, Textarea and Tooltip pages now each have an Overview and a page for each of their UI, UX, DX and AX layers, like the Button's.
date: 2026-10-22
category: Components
---

The Button's page was the first to get a page per layer, and the other ten components now follow it, so you can read one layer of any component at a time. Each one is an Overview, with the playground where it has one, the facts at a glance, the reference implementation and the sources, and a page for each layer, all under the component's name in the sidebar.

## Improved

- The Card, Checkbox, Checkbox Group, Dialog, Input, Radio Group, Spinner, Switch, Textarea and Tooltip each have a page for their User Interface, User Experience, Developer Experience and Agentic Experience, with the layer's rules and, where it has any, the questions it answers.
- Links between the components' pages now go straight to the section on its new page, and links from before the split, like one to the Input's sizes, still take you to the right section.
- Agents still read each component as one page, as before: `/raw/docs/components/<component>.md`, its contract and the MCP server serve it whole.
