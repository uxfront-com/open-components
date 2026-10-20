---
title: Button
description: How to build a button that looks right, works for everyone, feels familiar to every developer and can be checked by your agents.
navigation:
  title: Overview
---

Buttons let people act on what's in front of them, whether that's saving a form, sending a message, opening a dialog or deleting a file. They're the most common interactive component in any interface, and also the one we most often get wrong. Think of a `<div>` that you can't reach with the keyboard, a form that gets sent twice, or a spinner that throws your focus back to the top of the page.

This page walks you through building one the right way. We'll look at:
- [**User Interface**](/docs/components/button/ui) (UI) - how a button looks
- [**User Experience**](/docs/components/button/ux) (UX) - how it behaves for every person and every input
- [**Developer Experience**](/docs/components/button/dx) (DX) - how developers work with it
- [**Agentic Experience**](/docs/components/button/ax) (AX) - how agents can read and verify it

Every example on this page runs on our [reference implementation](/docs/components/button/code), which does its part of every rule in the [checklist](/docs/components/button#checklist), so feel free to try things out as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Button with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/button/ax#deterministic).

::button-playground
::

## At a glance

| Aspect   | Button                                                                                       |
| -------- | -------------------------------------------------------------------------------------------- |
| Element  | `<button type="button">`, or `<a href>` when it takes you somewhere                          |
| Role     | `button`, or `link` when it has an `href`                                                    |
| Name     | Its label, which stays in the page as hidden text when the button is icon-only               |
| Keyboard | `Enter` and `Space` activate it, while links only respond to `Enter`                         |
| States   | Hover, active, focus, disabled, loading, pressed and expanded                                |
| Variants | `solid`, `outline`, `soft`, `subtle`, `ghost` and `link`                                     |
| Colours  | `primary`, `secondary`, `neutral`, `success`, `info`, `warning` and `error`                  |
| Sizes    | `xs`, `sm`, `md`, `lg` and `xl`                                                              |
| Pattern  | [WAI-ARIA APG Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)                      |
| WCAG 2.2 | 1.4.3, 1.4.11, 2.1.1, 2.4.7, 2.5.2, 2.5.3, 2.5.8, 4.1.2 and 4.1.3, among others              |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A button meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Button itself, so they're the ones to check when you build or review one. **Usage** rules are met by the screens that use it, like keeping one primary action per view, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like naming an icon-only button: the Button keeps its label as hidden text, as long as you give it one.

The basis says where a rule comes from. About half the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and a few come from **HTML**, **WAI-ARIA** or the **APG**. The rest are **Open Components** rules, which are our own, like never changing a button's size between states. Where a rule goes further than WCAG asks at level AA, its basis says so: some come from level **AAA**, like the 44 × 44px hit area on touch screens, and a rule that asks for more than its criterion says **beyond**, like the underline on `link` buttons, which WCAG would let you swap for a 3:1 contrast with the text around it.

### UI rules

| Rule                     | Level  | Scope     | Requirement | Basis | Check |
| ------------------------ | ------ | --------- | ----------- | ----- | ---------------------- |
| `button/intent-colors`   | Must   | Both      | Colours describe the action's intent rather than a hue, and never carry that meaning on their own | WCAG 1.4.1 (A), Open Components | Review |
| `button/one-primary`     | Should | Usage     | There's one solid primary button per view or group, and the rest are ranked with `variant` | Open Components | Review |
| `button/contrast`        | Must   | Component | The label has a contrast of 4.5:1 at rest, on hover and when pressed, in every variant, and the focus ring has 3:1 against the page | WCAG 1.4.3, 1.4.11 (AA) | axe `color-contrast` |
| `button/link-underlined` | Must   | Component | The `link` variant is underlined at rest, so it doesn't rely on colour alone to stand out from the text around it | Open Components, beyond WCAG 1.4.1 (A) | Review |
| `button/focus-visible`   | Must   | Component | Keyboard focus shows an `outline` at least 2px thick, offset from the button, on `:focus-visible` | WCAG 2.4.7 (AA), 2.4.13 (AAA) | Keyboard |
| `button/target-size`     | Must   | Component | The button is at least 24 × 24px, unless it's a `link` inside a sentence, with a 44 × 44px hit area on touch screens | WCAG 2.5.8 (AA), 2.5.5 (AAA) | axe `target-size` |
| `button/resizable`       | Must   | Component | The button is sized with `min-height` and padding in `rem`, and its label wraps instead of being clipped or truncated | Open Components, beyond WCAG 1.4.4, 1.4.10, 1.4.12 (AA) | 200% zoom |
| `button/stable-size`     | Must   | Component | No state changes the button's size or position | Open Components | Visual regression test |
| `button/state-selectors` | Should | Component | States are styled from the attributes that expose them | Open Components | Review |
| `button/hover-capable`   | Should | Component | Hover styles only apply inside `@media (hover: hover)` | Open Components | Review |
| `button/forced-colors`   | Must   | Component | The button's boundary, focus, disabled and pressed states stay visible in forced colours mode | Open Components | Emulation |
| `button/more-contrast`   | Should | Component | Borders are drawn at full strength when `prefers-contrast: more` is set | Open Components | Emulation |
| `button/reduced-motion`  | Must   | Component | Nothing turns or slides when `prefers-reduced-motion: reduce` is set | WCAG 2.3.3 (AAA) | Emulation |

### UX rules

| Rule                        | Level  | Scope     | Requirement | Basis | Check |
| --------------------------- | ------ | --------- | ----------- | ----- | --------------------------------- |
| `button/native-element`     | Must   | Component | It's a native `<button>`, or an `<a href>` for navigation, but never a `<div>` or a `<span>` | Open Components, beyond WCAG 2.1.1, 4.1.2 (A) | Unit test |
| `button/links-navigate`     | Must   | Usage     | Navigation always uses a link, so a button never changes the URL | Open Components | Review |
| `button/accessible-name`    | Must   | Both      | Every button has a name, and an icon-only button has a visually hidden label | WCAG 4.1.2 (A), Open Components | axe `button-name`, unit test |
| `button/label-in-name`      | Must   | Usage     | An `aria-label` or `aria-labelledby` includes the visible label, ideally at the start | WCAG 2.5.3 (A) | axe `label-content-name-mismatch` |
| `button/decorative-icons`   | Must   | Component | Icons are hidden from assistive technologies with `aria-hidden`, so they don't add to the button's name | WCAG 1.1.1 (A) | Unit test |
| `button/verb-labels`        | Should | Usage     | Labels start with a verb and name the outcome, and end with `…` when more input follows | Open Components | Review |
| `button/keyboard`           | Must   | Component | `Enter` and `Space` activate a button, while `Enter` follows a link | WCAG 2.1.1 (A), APG | Unit test |
| `button/activate-on-click`  | Must   | Usage     | Actions run on `click`, never on `mousedown`, `pointerdown` or `touchstart` | Open Components, beyond WCAG 2.5.2 (A) | Review |
| `button/no-nesting`         | Must   | Usage     | There's nothing interactive inside a button, and no button inside a link | HTML | axe `nested-interactive` |
| `button/dom-order`          | Must   | Usage     | Buttons come in the same order in the DOM as on screen, without `order` or `row-reverse` | Open Components, beyond WCAG 1.3.2, 2.4.3 (A) | Keyboard |
| `button/disabled-inert`     | Must   | Component | A disabled or loading button does nothing, so there's no event, no submission and no navigation | HTML, WAI-ARIA | Unit test |
| `button/explain-disabled`   | Should | Usage     | An enabled button with validation is preferred over a disabled one, and a disabled one explains why | Open Components | Review |
| `button/keep-focus`         | Must   | Both      | Disabling a button never takes its focus away: loading uses `aria-disabled`, and a button that can be disabled while it has focus, like Next on the last page, stays focusable | Open Components | Unit test, keyboard |
| `button/loading`            | Must   | Component | Loading keeps the button's size and name, blocks repeated activation and is announced | WCAG 4.1.3 (AA), Open Components | Unit test |
| `button/announce-outcome`   | Should | Usage     | The page announces the action's outcome with a status message | Open Components, beyond WCAG 4.1.3 (AA) | Screen reader |
| `button/toggle-pressed`     | Must   | Both      | A toggle button sets `aria-pressed` and keeps its label | WCAG 4.1.2 (A), APG | Unit test |
| `button/popup-expanded`     | Must   | Both      | A button that opens a popup sets `aria-haspopup` and `aria-expanded` | WCAG 4.1.2 (A), APG | Unit test |
| `button/focus-after`        | Should | Usage     | After activation, focus moves as the APG describes, and never falls back to the top of the page | APG | Keyboard |
| `button/focus-not-obscured` | Must   | Usage     | Sticky headers and footers never cover a focused button, for example thanks to `scroll-padding` | WCAG 2.4.11 (AA), 2.4.12 (AAA) | Keyboard |
| `button/destructive`        | Should | Usage     | A destructive action uses `error`, names what it destroys, and can either be undone or asks for confirmation | Open Components, beyond WCAG 3.3.4 (AA) | Review |
| `button/mirrors-in-rtl`     | Should | Both      | It uses logical properties, and icons that point along the reading direction flip in right-to-left layouts | Open Components | Review |

### DX rules

| Rule                       | Level  | Scope     | Requirement | Basis | Check |
| -------------------------- | ------ | --------- | ----------- | ----- | --------- |
| `button/shared-vocabulary` | Must   | Component | It uses the shared names: `variant`, `color`, `size`, `label`, `disabled`, `loading`, `leading`, `trailing` and `click` | Open Components | Review |
| `button/typed`             | Must   | Component | Props, events and slots are typed, with unions rather than `string` | Open Components | Type check |
| `button/explicit-type`     | Must   | Both      | `type` defaults to `"button"`, and submit buttons say `type="submit"` explicitly | Open Components | Unit test |
| `button/root-element`      | Must   | Component | The root element is the button itself, so attributes, listeners and refs land on it | Open Components | Unit test |
| `button/stateless`         | Should | Component | Every state is a prop or an attribute that the parent controls | Open Components | Review |

### AX rules

| Rule                       | Level  | Scope     | Requirement | Basis | Check |
| -------------------------- | ------ | --------- | ----------- | ----- | --------- |
| `button/role-and-name`     | Must   | Component | It can be found by its role and name alone, with `getByRole("button", { name })` | WCAG 4.1.2 (A) | Unit test |
| `button/deterministic-dom` | Must   | Component | The same props render the same markup, and states change attributes, never elements | Open Components | Unit test |
| `button/data-attributes`   | Should | Component | Props are mirrored as `data-*` attributes, and parts are marked with `data-slot` | Open Components | Unit test |
| `button/dev-warnings`      | Should | Component | It warns during development when a button has no accessible name | Open Components | Unit test |

## FAQ


#### Button or link?

Buttons do things, while links go places. If people might want to open it in a new tab, bookmark it or share it, it's a link.

| When you activate it, it…                                   | Use                                  | Renders                                           |
| ----------------------------------------------------------- | ------------------------------------ | ------------------------------------------------- |
| Runs an action on the page, like saving, sending or deleting | Button                              | `<button type="button">`                          |
| Submits a form                                              | Button, with `type="submit"`         | `<button type="submit">`                          |
| Takes you to another page, a section or a file              | Button, with `href`                  | `<a href>`                                        |
| Switches something on or off                                | [Toggle button](/docs/components/button/ux#toggle-buttons) | `<button aria-pressed>`             |
| Opens a menu                                                | [Menu button](/docs/components/button/ux#menu-buttons)     | `<button aria-haspopup="menu" aria-expanded>` |

Links come with plenty of browser features for free, such as opening in a new tab, copying the address or showing up in the history. Screen readers also list them together with the other links on the page, and pressing `Space` scrolls the page instead of following the link. A button that navigates loses all of that, which is why our Button renders a link as soon as you give it an `href`:

::button-link-example
::framework-switcher
#react
```tsx
<Button href="/docs" color="primary" trailing={<ArrowRightIcon />}>
  Read the introduction
</Button>
```

#vue
```vue
<Button href="/docs" color="primary">
  Read the introduction
  <template #trailing><ArrowRightIcon /></template>
</Button>
```

#svelte
```svelte
<Button href="/docs" color="primary">
  Read the introduction
  {#snippet trailing()}<ArrowRightIcon />{/snippet}
</Button>
```

#angular
```angular-html
<a appButton href="/docs" color="primary">
  Read the introduction
  <lucide-icon trailing [img]="ArrowRightIcon" />
</a>
```

#solid
```tsx
<Button href="/docs" color="primary" trailing={<ArrowRightIcon />}>
  Read the introduction
</Button>
```

#astro
```astro
<Button href="/docs" color="primary">
  Read the introduction
  <ArrowRightIcon slot="trailing" />
</Button>
```

#vanilla
```html
<a class="button" href="/docs" data-variant="solid" data-color="primary" data-size="md">
  <span data-slot="label">Read the introduction</span>
  <span data-slot="trailing" aria-hidden="true"><svg class="lucide-arrow-right">…</svg></span>
</a>
```
::
::

::framework-switcher
#react
```tsx
{/* Do: use a link for navigation, even when it looks like a button */}
<Button href="/pricing" color="primary">See pricing</Button>

{/* Don't: this can't be opened in a new tab, and screen readers won't list it as a link */}
<Button color="primary" onClick={() => navigate("/pricing")}>See pricing</Button>
```

#vue
```vue
<!-- Do: use a link for navigation, even when it looks like a button -->
<Button href="/pricing" color="primary">See pricing</Button>

<!-- Don't: this can't be opened in a new tab, and screen readers won't list it as a link -->
<Button color="primary" @click="router.push('/pricing')">See pricing</Button>
```

#svelte
```svelte
<!-- Do: use a link for navigation, even when it looks like a button -->
<Button href="/pricing" color="primary">See pricing</Button>

<!-- Don't: this can't be opened in a new tab, and screen readers won't list it as a link -->
<Button color="primary" onclick={() => goto("/pricing")}>See pricing</Button>
```

#angular
```angular-html
<!-- Do: use a link for navigation, even when it looks like a button -->
<a appButton routerLink="/pricing" color="primary">See pricing</a>

<!-- Don't: this can't be opened in a new tab, and screen readers won't list it as a link -->
<button appButton color="primary" (click)="router.navigate(['/pricing'])">See pricing</button>
```

#solid
```tsx
{/* Do: use a link for navigation, even when it looks like a button */}
<Button href="/pricing" color="primary">See pricing</Button>

{/* Don't: this can't be opened in a new tab, and screen readers won't list it as a link */}
<Button color="primary" onClick={() => navigate("/pricing")}>See pricing</Button>
```

#astro
```astro
<!-- Do: use a link for navigation, even when it looks like a button -->
<Button href="/pricing" color="primary">See pricing</Button>

<!-- Don't: this can't be opened in a new tab, and screen readers won't list it as a link -->
<Button id="pricing" color="primary">See pricing</Button>

<script>
  import { navigate } from "astro:transitions/client";

  document.querySelector("#pricing")?.addEventListener("click", () => navigate("/pricing"));
</script>
```

#vanilla
```html
<!-- Do: use a link for navigation, even when it looks like a button -->
<a class="button" href="/pricing" data-variant="solid" data-color="primary" data-size="md">
  <span data-slot="label">See pricing</span>
</a>

<!-- Don't: this can't be opened in a new tab, and screen readers won't list it as a link -->
<button class="button" type="button" id="pricing" data-variant="solid" data-color="primary" data-size="md">
  <span data-slot="label">See pricing</span>
</button>

<script type="module">
  document.querySelector("#pricing").addEventListener("click", () => location.assign("/pricing"));
</script>
```
::


::accordion
:::accordion-item{label="Should a button have a pointer cursor?"}
Our reference implementation uses `cursor: pointer`, since that's the convention on the web and people read the hand as "this does something". Operating systems use the arrow for their own buttons, though, and some design systems follow them. Either choice is fine, as long as all your buttons agree. What matters more is the cursor over disabled (`not-allowed`) and loading (`progress`) buttons.
:::

:::accordion-item{label="Why not disable the submit button until the form is valid?"}
Because a disabled button can't explain itself. People don't know which field is wrong, keyboard users can't focus it to find out, and screen reader users might not find it at all. It's better to keep it enabled, validate on submit and move focus to the first error, with a message next to each field.
:::

:::accordion-item{label='Can I use <input type="submit">?'}
You can, but its label lives in an attribute, so it can't hold icons or a spinner. A `<button type="submit">` does everything it does, and more.
:::

:::accordion-item{label="Does the Button work before JavaScript loads?"}
Yes, as far as HTML can take it. The server renders a real `<button>` or `<a href>`, so even before the page hydrates, links navigate, submit buttons submit and `disabled` buttons stay disabled. Only the parts that need JavaScript have to wait for it, which are your `click` handlers and the blocking of focusable disabled and loading buttons.
:::

:::accordion-item{label="Why a visually hidden label rather than aria-label?"}
Both give the button a name, but hidden text is ordinary text, so it gets translated along with the rest of the page. It's also a single mechanism for every button, whether it's icon-only or not. We'd only reach for `aria-label` when there's no other choice, and then make sure it includes the visible text.
:::
::

## Sources

- [WAI-ARIA Authoring Practices: Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/), [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) and [Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [HTML Standard: the button element](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element)
- [CSS Color Adjustment: forced colors mode](https://www.w3.org/TR/css-color-adjust-1/)
- [Material Design 3: state layers](https://m3.material.io/foundations/interaction/states/state-layers)
- [React Aria: Button](https://react-spectrum.adobe.com/react-aria/Button.html), for the pending state
- [Primer: Button](https://primer.style/product/components/button/), for the loading state
- [Base UI: Button](https://base-ui.com/react/components/button), for focusable disabled buttons
- [Styleframe: Button](https://www.styleframe.dev/docs/theme/components/button), for the colour and variant vocabulary
