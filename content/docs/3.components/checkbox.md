---
title: Checkbox
description: How to build a checkbox that people can check with a click on its label, that says what it means and when it's mixed, that forms send the way they expect, and that agents can check.
navigation:
  icon: i-lucide-square-check
---

Checkboxes let people say yes or no to one thing, like agreeing to the terms, or asking for a newsletter. The browser has had one built in for as long as there have been forms, but its box is hard to style, so many teams rebuild it, and that's where it goes wrong. Think of a box so small you keep missing it, a label that does nothing when you click it, or a "Select all" that screen readers announce as unchecked when half its options are checked.

This page walks you through building one the right way. We'll look at:
- **User Interface** (UI) - how a checkbox looks
- **User Experience** (UX) - how it behaves for every person and every input
- **Developer Experience** (DX) - how developers work with it
- **Agentic Experience** (AX) - how agents can read and verify it

Every example on this page runs on our [reference implementation](/docs/components/checkbox#reference-implementation), which does its part of every rule in the [checklist](/docs/components/checkbox#checklist), so feel free to check and uncheck them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Checkbox with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/checkbox#deterministic).

The Checkbox is one box with its label. Its hint and error message are elements of their own, which you link to it by ID, like the [Input](/docs/components/input)'s. A list of options that people check any number of is a group, with a `<fieldset>` and a `<legend>`, which the [Checkbox Group](/docs/components/checkbox-group) builds out of Checkboxes.

::checkbox-playground
::

## At a glance

| Aspect   | Checkbox                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------- |
| Element  | `<input type="checkbox">`, inside the `<label>` that names it                                  |
| Role     | `checkbox`                                                                                     |
| Name     | The text inside its `<label>`, or an `aria-label` when there's no text to show                 |
| Keyboard | `Tab` to reach it and `Space` to check or uncheck it, while `Enter` never toggles it           |
| States   | Hover, focus, checked, indeterminate, disabled, read-only and invalid                          |
| Sizes    | `xs`, `sm`, `md`, `lg` and `xl`, with the box scaled to the text                               |
| Pattern  | [WAI-ARIA APG Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), which a native [`<input type="checkbox">`](https://html.spec.whatwg.org/multipage/input.html#checkbox-state-%28type%3Dcheckbox%29) covers |
| WCAG 2.2 | 1.3.1, 1.4.3, 1.4.11, 2.1.1, 2.4.7, 2.5.8, 3.3.1, 3.3.2 and 4.1.2, among others                |

## User Interface (UI)

Let's start with how a checkbox looks: its parts, its sizes and how it shows each of its states.

### Anatomy

::checkbox-anatomy
1. **Container** — The `<label>`, which wraps the box and its label, so a press on either toggles it. It carries the size.
2. **Box** — The `<input type="checkbox">` itself, which holds the state and takes focus.
3. **Indicator** — A check, or a dash while it's indeterminate, drawn over the box and hidden from assistive technologies.
4. **Label** — Optional. The text that says what checking the box means, which names it.
5. **Hit area** — At least 24 × 24px around the box, which a press anywhere in toggles it.
6. **Focus ring** — An outline around the box, drawn outside it so nothing moves.
::

Every checkbox has a container, a box, an indicator and a hit area. The label is optional only for a checkbox that its context already names, like one in each row of a table, which takes an `aria-label` instead (see [Label every checkbox](/docs/components/checkbox#label-every-checkbox)). Any hint and error message sit outside the container, in the page, and point to the box by its `id`. The parts always render in the same order, which you can see in the [DOM contract](/docs/components/checkbox#deterministic).

### Sizes

The `size` prop scales the box, the text and the gap between them together, and `md` is the default. The names are the same as the [Button](/docs/components/button/ui#sizes)'s and the [Input](/docs/components/input#sizes)'s, and so is the text, so a checkbox reads at the same size as the inputs and buttons next to it.

::checkbox-sizes-example
::framework-switcher
#react
```tsx
<Checkbox size="xs">Email me updates</Checkbox>
{/* …sm, md, lg, xl */}
```

#vue
```vue
<Checkbox size="xs">Email me updates</Checkbox>
<!-- …sm, md, lg, xl -->
```

#svelte
```svelte
<Checkbox size="xs">Email me updates</Checkbox>
<!-- …sm, md, lg, xl -->
```

#angular
```angular-html
<label appCheckbox size="xs">
  <input type="checkbox" />
  Email me updates
</label>
<!-- …sm, md, lg, xl -->
```

#solid
```tsx
<Checkbox size="xs">Email me updates</Checkbox>
{/* …sm, md, lg, xl */}
```

#astro
```astro
<Checkbox size="xs">Email me updates</Checkbox>
<!-- …sm, md, lg, xl -->
```

#vanilla
```html
<label class="checkbox" data-size="xs">
  <input data-slot="box" type="checkbox" />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">Email me updates</span>
</label>
<!-- …sm, md, lg, xl -->
```
::
::

| Size | Box  | Text | Gap  | Radius | Hit area |
| ---- | ---- | ---- | ---- | ------ | -------- |
| `xs` | 14px | 12px | 6px  | 4px    | 24px     |
| `sm` | 16px | 14px | 8px  | 4px    | 24px     |
| `md` | 18px | 14px | 8px  | 4px    | 24px     |
| `lg` | 20px | 16px | 8px  | 6px    | 24px     |
| `xl` | 24px | 16px | 10px | 6px    | 24px     |

Sizes are set in `rem`, and the table shows the values we recommend at the default text size of 16px. The box grows with the text, a little larger than its letters, so it lines up with the first line of its label at every size. Whatever its size, the box sits in a hit area of at least 24 × 24px ([WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)), which is part of the `<label>`, so a press anywhere in it toggles the box. Each checkbox is at least as tall as its hit area, so two stacked checkboxes never share one.

### States

Each state has a look of its own, styled from the `<input>` itself. That way, what people see and what assistive technologies report can never drift apart, and a box can't look checked without actually being checked.

::checkbox-states-example
::framework-switcher
#react
```tsx
<Checkbox>Email me updates</Checkbox>
<Checkbox defaultChecked>Email me updates</Checkbox>
<Checkbox indeterminate>Select all</Checkbox>

<Checkbox disabled>Text me updates</Checkbox>
<Checkbox defaultChecked disabled>Email me updates</Checkbox>

<Checkbox readOnly>Text me updates</Checkbox>
<Checkbox defaultChecked readOnly>Email me updates</Checkbox>

<Checkbox required aria-invalid="true" aria-describedby="terms-error">I agree to the terms</Checkbox>
<p id="terms-error">Agree to the terms to create an account</p>
```

#vue
```vue
<Checkbox>Email me updates</Checkbox>
<Checkbox checked>Email me updates</Checkbox>
<Checkbox indeterminate>Select all</Checkbox>

<Checkbox disabled>Text me updates</Checkbox>
<Checkbox checked disabled>Email me updates</Checkbox>

<Checkbox readonly>Text me updates</Checkbox>
<Checkbox checked readonly>Email me updates</Checkbox>

<Checkbox required aria-invalid="true" aria-describedby="terms-error">I agree to the terms</Checkbox>
<p id="terms-error">Agree to the terms to create an account</p>
```

#svelte
```svelte
<Checkbox>Email me updates</Checkbox>
<Checkbox checked>Email me updates</Checkbox>
<Checkbox indeterminate>Select all</Checkbox>

<Checkbox disabled>Text me updates</Checkbox>
<Checkbox checked disabled>Email me updates</Checkbox>

<Checkbox readonly>Text me updates</Checkbox>
<Checkbox checked readonly>Email me updates</Checkbox>

<Checkbox required aria-invalid="true" aria-describedby="terms-error">I agree to the terms</Checkbox>
<p id="terms-error">Agree to the terms to create an account</p>
```

#angular
```angular-html
<label appCheckbox><input type="checkbox" />Email me updates</label>
<label appCheckbox><input type="checkbox" checked />Email me updates</label>
<label appCheckbox><input type="checkbox" [indeterminate]="true" />Select all</label>

<label appCheckbox><input type="checkbox" disabled />Text me updates</label>
<label appCheckbox><input type="checkbox" checked disabled />Email me updates</label>

<label appCheckbox readonly><input type="checkbox" />Text me updates</label>
<label appCheckbox readonly><input type="checkbox" checked />Email me updates</label>

<label appCheckbox>
  <input type="checkbox" required aria-invalid="true" aria-describedby="terms-error" />
  I agree to the terms
</label>
<p id="terms-error">Agree to the terms to create an account</p>
```

#solid
```tsx
<Checkbox>Email me updates</Checkbox>
<Checkbox checked>Email me updates</Checkbox>
<Checkbox indeterminate>Select all</Checkbox>

<Checkbox disabled>Text me updates</Checkbox>
<Checkbox checked disabled>Email me updates</Checkbox>

<Checkbox readOnly>Text me updates</Checkbox>
<Checkbox checked readOnly>Email me updates</Checkbox>

<Checkbox required aria-invalid="true" aria-describedby="terms-error">I agree to the terms</Checkbox>
<p id="terms-error">Agree to the terms to create an account</p>
```

#astro
```astro
<Checkbox>Email me updates</Checkbox>
<Checkbox checked>Email me updates</Checkbox>
<Checkbox id="select-all">Select all</Checkbox>

<Checkbox disabled>Text me updates</Checkbox>
<Checkbox checked disabled>Email me updates</Checkbox>

<Checkbox readonly>Text me updates</Checkbox>
<Checkbox checked readonly>Email me updates</Checkbox>

<Checkbox required aria-invalid="true" aria-describedby="terms-error">I agree to the terms</Checkbox>
<p id="terms-error">Agree to the terms to create an account</p>

<script>
  // HTML has no attribute for it, so it's set as a property.
  document.querySelector<HTMLInputElement>("#select-all")!.indeterminate = true;
  // HTML ignores readonly on a checkbox, so a cancelled click keeps a read-only one as it is.
  document.addEventListener("click", (event) => {
    if ((event.target as Element).matches('.checkbox > [aria-readonly="true"]')) event.preventDefault();
  });
</script>
```

#vanilla
```html
<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">Email me updates</span>
</label>

<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" checked />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">Email me updates</span>
</label>

<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" id="select-all" />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">Select all</span>
</label>

<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" disabled />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">Text me updates</span>
</label>

<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" disabled checked />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">Email me updates</span>
</label>

<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" aria-readonly="true" />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">Text me updates</span>
</label>

<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" checked aria-readonly="true" />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">Email me updates</span>
</label>

<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" required aria-invalid="true" aria-describedby="terms-error" />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">I agree to the terms</span>
</label>
<p id="terms-error">Agree to the terms to create an account</p>

<script type="module">
  // HTML has no attribute for it, so it's set as a property.
  document.querySelector("#select-all").indeterminate = true;
  // HTML ignores readonly on a checkbox, so a cancelled click keeps a read-only one as it is.
  document.addEventListener("click", (event) => {
    if (event.target.matches('.checkbox > [aria-readonly="true"]')) event.preventDefault();
  });
</script>
```
::
::

| State         | Selector                                       | Recommended look                                              |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| Hover         | `:hover`, inside `@media (hover: hover)`       | The border at 80% of the text colour, up from 55%             |
| Focus         | `> input:focus-visible`                        | A 2px outline, 2px from the box, in `--color--focus`          |
| Checked       | `> input:checked`                              | The box filled with `--color--primary`, with a check on top   |
| Indeterminate | `> input:indeterminate`                        | The same fill, with a dash in place of the check              |
| Disabled      | `:has(> input:disabled)`                       | 50% opacity and a `not-allowed` cursor, label included        |
| Read-only     | `> input[aria-readonly="true"]`                | A dashed border, with the check in the text colour, no fill   |
| Invalid       | `> input[aria-invalid="true"]`                 | A 2px border in `--color--error-text`                         |

The checked and indeterminate looks share their fill, and tell themselves apart by their mark, a check or a dash, rather than by colour ([WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)). The read-only look is dashed, like a read-only [Input](/docs/components/input#states)'s, and drops the fill, so a checked box still shows its check without looking like one you can change. The disabled look comes from `:disabled`, which also matches every checkbox inside a `<fieldset disabled>`, so a whole group looks the way it behaves. We recommend leaving `:invalid` out of it, as on the Input, since it matches an unchecked required box before anyone has touched it. The invalid look comes from `aria-invalid` instead, which you set when the error message shows.

None of the states change the checkbox's size or position. The invalid border's second pixel is drawn inside the box, and the focus ring outside it. You'll find how each state behaves under [Every state](/docs/components/checkbox#every-state).

### Tokens

The checkbox reads five [theme tokens](/docs/foundations/design-tokens#theme-tokens), which every component shares:

| Token                       | Used for                                                                    |
| --------------------------- | --------------------------------------------------------------------------- |
| `--color--neutral-text`     | The label, and mixed into the box's border                                  |
| `--color--primary`          | The fill of a checked or indeterminate box                                  |
| `--color--primary-contrast` | The check and the dash, on top of the fill                                  |
| `--color--error-text`       | The border of an invalid box                                                |
| `--color--focus`            | The focus ring, which is the same for every component                       |

The border is the text colour at 55%, and 80% on hover. An unchecked box is nothing but its border, so the border needs 3:1 against the page, and so does the fill of a checked box, while the check needs 3:1 against the fill ([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)). With our reference tokens, from the Tailwind CSS palette, the border comes to 3.5:1, the fill to 6.4:1 and the check to 6.4:1 on white, and 5.0:1, 5.7:1 and 6.4:1 on zinc-900. If you change the tokens, make sure to check the same pairs. You'll find the tokens themselves in the Button's [`tokens.css`](/docs/components/button#reference-implementation), which you can copy into your theme.

If you need to tune a checkbox, you can set its [own variables](/docs/foundations/design-tokens#component-variables), such as `--checkbox--box--radius`, `--checkbox--box--fill` or `--checkbox--indicator--color`, from a class. The Checkbox's styles sit in the `components` cascade layer, so your class wins without any specificity tricks:

::framework-switcher
#react
```tsx [Terms.tsx]
import styles from "./Terms.module.css";

export function Terms() {
  return <Checkbox name="terms" className={styles.square}>I agree to the terms</Checkbox>;
}
```
```css [Terms.module.css]
.square {
  --checkbox--box--radius: 0;
}
```

#vue
```vue
<template>
  <Checkbox name="terms" class="square">I agree to the terms</Checkbox>
</template>

<style scoped>
.square {
  --checkbox--box--radius: 0;
}
</style>
```

#svelte
```svelte
<Checkbox name="terms" class="square">I agree to the terms</Checkbox>

<style>
  /* The class lands on the Checkbox's own element, which this component's scoped styles don't reach. */
  :global(.square) {
    --checkbox--box--radius: 0;
  }
</style>
```

#angular
```angular-ts
@Component({
  selector: "app-terms",
  imports: [Checkbox],
  template: `
    <label appCheckbox class="square">
      <input type="checkbox" name="terms" />
      I agree to the terms
    </label>
  `,
  styles: `
    .square {
      --checkbox--box--radius: 0;
    }
  `,
})
export class Terms {}
```

#solid
```tsx [Terms.tsx]
import styles from "./Terms.module.css";

export function Terms() {
  return <Checkbox name="terms" class={styles.square}>I agree to the terms</Checkbox>;
}
```
```css [Terms.module.css]
.square {
  --checkbox--box--radius: 0;
}
```

#astro
```astro
<Checkbox name="terms" class="square">I agree to the terms</Checkbox>

<style>
  .square {
    --checkbox--box--radius: 0;
  }
</style>
```

#vanilla
```html
<label class="checkbox square" data-size="md">
  <input data-slot="box" type="checkbox" name="terms" />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">I agree to the terms</span>
</label>

<style>
  .square {
    --checkbox--box--radius: 0;
  }
</style>
```
::

## User Experience (UX)

Now let's look at how a checkbox behaves for every person, input and setting. A good checkbox is [accessible](/docs/components/checkbox#accessible), [predictable](/docs/components/checkbox#predictable), designed in [every state](/docs/components/checkbox#every-state) and [adaptive](/docs/components/checkbox#adaptive).

### Accessible

#### Use the native element

A native `<input type="checkbox">` gives you focus, `Space` to toggle it, the `checkbox` role with its checked and mixed states, a label that toggles it, form submission and `<fieldset disabled>`, all for free. A `<div>` with `role="checkbox"` only gives you the role. Everything else is one more thing to rebuild by hand, and it's easy to miss one, like `Space`, which is why so many custom checkboxes only work with a mouse.

::framework-switcher
#react
```tsx
{/* Do: you get the keyboard, the label, the states and form submission for free */}
<label>
  <input type="checkbox" name="terms" />
  I agree to the terms
</label>

{/* Don't: there's no Space, label, form submission or disabled fieldset until you rebuild them */}
<div className="checkbox" role="checkbox" aria-checked={agreed} tabIndex={0} onClick={toggle}>
  I agree to the terms
</div>
```

#vue
```vue
<!-- Do: you get the keyboard, the label, the states and form submission for free -->
<label>
  <input type="checkbox" name="terms" />
  I agree to the terms
</label>

<!-- Don't: there's no Space, label, form submission or disabled fieldset until you rebuild them -->
<div class="checkbox" role="checkbox" :aria-checked="agreed" tabindex="0" @click="toggle">
  I agree to the terms
</div>
```

#svelte
```svelte
<!-- Do: you get the keyboard, the label, the states and form submission for free -->
<label>
  <input type="checkbox" name="terms" />
  I agree to the terms
</label>

<!-- Don't: there's no Space, label, form submission or disabled fieldset until you rebuild them -->
<div class="checkbox" role="checkbox" aria-checked={agreed} tabindex="0" onclick={toggle}>
  I agree to the terms
</div>
```

#angular
```angular-html
<!-- Do: you get the keyboard, the label, the states and form submission for free -->
<label>
  <input type="checkbox" name="terms" />
  I agree to the terms
</label>

<!-- Don't: there's no Space, label, form submission or disabled fieldset until you rebuild them -->
<div class="checkbox" role="checkbox" [attr.aria-checked]="agreed()" tabindex="0" (click)="toggle()">
  I agree to the terms
</div>
```

#solid
```tsx
{/* Do: you get the keyboard, the label, the states and form submission for free */}
<label>
  <input type="checkbox" name="terms" />
  I agree to the terms
</label>

{/* Don't: there's no Space, label, form submission or disabled fieldset until you rebuild them */}
<div class="checkbox" role="checkbox" aria-checked={agreed()} tabIndex={0} onClick={toggle}>
  I agree to the terms
</div>
```

#astro
```astro
<!-- Do: you get the keyboard, the label, the states and form submission for free -->
<label>
  <input type="checkbox" name="terms" />
  I agree to the terms
</label>

<!-- Don't: there's no Space, label, form submission or disabled fieldset until you rebuild them -->
<div class="checkbox" role="checkbox" aria-checked="false" tabindex="0">I agree to the terms</div>
```

#vanilla
```html
<!-- Do: you get the keyboard, the label, the states and form submission for free -->
<label>
  <input type="checkbox" name="terms" />
  I agree to the terms
</label>

<!-- Don't: there's no Space, label, form submission or disabled fieldset until you rebuild them -->
<div class="checkbox" role="checkbox" aria-checked="false" tabindex="0">I agree to the terms</div>
```
::

The Checkbox styles the native box with `appearance: none` and draws its own border, fill and check, so it looks the same in every browser while it keeps everything the browser gives it.

#### Label every checkbox

The label is also the checkbox's accessible name. Screen readers read it along with the state, as in "I agree to the terms, checkbox, not checked", voice control users say it out loud ("click I agree to the terms"), and tests and agents use it to find the box.

::checkbox-label-example
::framework-switcher
#react
```tsx
<Checkbox name="updates" aria-describedby="updates-hint">Email me product updates</Checkbox>
<p id="updates-hint">About once a month. You can stop them at any time.</p>
```

#vue
```vue
<Checkbox name="updates" aria-describedby="updates-hint">Email me product updates</Checkbox>
<p id="updates-hint">About once a month. You can stop them at any time.</p>
```

#svelte
```svelte
<Checkbox name="updates" aria-describedby="updates-hint">Email me product updates</Checkbox>
<p id="updates-hint">About once a month. You can stop them at any time.</p>
```

#angular
```angular-html
<label appCheckbox>
  <input type="checkbox" name="updates" aria-describedby="updates-hint" />
  Email me product updates
</label>
<p id="updates-hint">About once a month. You can stop them at any time.</p>
```

#solid
```tsx
<Checkbox name="updates" aria-describedby="updates-hint">Email me product updates</Checkbox>
<p id="updates-hint">About once a month. You can stop them at any time.</p>
```

#astro
```astro
<Checkbox name="updates" aria-describedby="updates-hint">Email me product updates</Checkbox>
<p id="updates-hint">About once a month. You can stop them at any time.</p>
```

#vanilla
```html
<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" name="updates" aria-describedby="updates-hint" />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">Email me product updates</span>
</label>
<p id="updates-hint">About once a month. You can stop them at any time.</p>
```
::
::

- Every checkbox has a visible label right after its box ([WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html), [3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)). The Checkbox wraps its own `<label>` around the box and the text you give it, so the text names the box without an ID, and a click on the text toggles it, which makes for a much bigger target.
- Keep links and buttons out of the label, like a link to the terms. Their text becomes part of the checkbox's name, and a press meant for the box can land on the link instead. Put the link in the hint, or right before the checkbox.
- A hint, like how often you'll send those emails, goes in the checkbox's description, which screen readers read after its name and state. Keep it outside the Checkbox, so it doesn't become part of the name, and point `aria-describedby` at its `id`.
- A checkbox that its context already names, like the one in each row of a table, is the one checkbox that doesn't need visible text. Give it an `aria-label` that says what it selects, like `aria-label="Select Ada Lovelace"`, rather than one that repeats "Select" in every row.
- If you name a checkbox with `aria-label` or `aria-labelledby` while it has visible text, make sure the name includes that text, ideally at the start ([WCAG 2.5.3](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)).

#### Contrast and size

- The label needs a contrast of at least 4.5:1 with its background ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)). Disabled checkboxes are exempt, but they should still be readable.
- The box's border needs 3:1 against the page, since an unchecked box is nothing but its border, and so does a checked box's fill, while its check or dash needs 3:1 against the fill ([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)). The focus ring needs 3:1 as well.
- The box sits in a hit area of at least 24 × 24px ([WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)). The label adds to that, since a press on it toggles the box too, but we don't count it, because a checkbox without visible text still needs a box that's easy to press. A smaller box meets WCAG through its spacing exception, as long as a 24px circle centred on it doesn't overlap another target, or another small target's circle. That's easy to break in a dense table, so the hit area is the safer bet.

#### Show focus

When a checkbox has focus, its box shows an outline in the same focus colour as every other component ([WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)). Like the Button's, it's at least 2px thick and drawn outside the border, and we recommend 2px for both. It goes around the box rather than the label, so it marks the thing `Space` will toggle, and it shows on `:focus-visible`, so it's there when people reach the box with the keyboard, and not after every click.

You'll also want to keep focused checkboxes clear of sticky headers and footers, which you can do with `scroll-padding` ([WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [2.4.12](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html)).

### Predictable

#### Keyboard

| Key                       | Checkbox                                                         |
| ------------------------- | ---------------------------------------------------------------- |
| `Tab`, `Shift+Tab`        | Moves focus to and from the box                                  |
| `Space`                   | Checks or unchecks it, and clears the indeterminate state, unless it's read-only |
| `Enter`                   | Never toggles it                                                 |

`Space` toggles a checkbox in every browser, which is what the [APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) asks for, and what keyboard users expect. `Enter` never does. Chrome, for example, submits the box's form instead, through its submit button, just as it would from a text input, which HTML calls [implicit submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission). So don't make `Enter` toggle the box, and don't rely on it to submit the form either, since that's up to the browser.

#### Say what checking it means

A checkbox says yes or no to one thing, so its label should say what yes means, as in "Email me product updates". People shouldn't have to work out what an unchecked box means, so try to keep labels positive. "Don't email me" makes people check a box to say no, and screen readers read it as "Don't email me, checkbox, checked", which takes a moment to untangle.

Checking a box also shouldn't do anything on its own. It's a choice that the form sends when people submit it, so they can change their mind until then. For a setting that takes effect the moment you flip it, like Wi-Fi, the [Switch](/docs/components/switch) says so much better. And for a choice of one option out of a few, a Radio Group is the one to use, since checkboxes tell people they can check as many as they like.

### Every state

#### Indeterminate

An indeterminate checkbox is neither checked nor unchecked, which is what a "Select all" box shows when only some of its options are checked. Screen readers announce it as "mixed", or "partially checked", and the box shows a dash in place of its check.

::checkbox-indeterminate-example
::framework-switcher
#react
```tsx
<Checkbox indeterminate>Select all</Checkbox>
```

#vue
```vue
<Checkbox indeterminate>Select all</Checkbox>
```

#svelte
```svelte
<Checkbox indeterminate>Select all</Checkbox>
```

#angular
```angular-html
<label appCheckbox>
  <input type="checkbox" [indeterminate]="true" />
  Select all
</label>
```

#solid
```tsx
<Checkbox indeterminate>Select all</Checkbox>
```

#astro
```astro
<Checkbox id="select-all">Select all</Checkbox>

<script>
  // HTML has no attribute for it, so it's set as a property.
  document.querySelector<HTMLInputElement>("#select-all")!.indeterminate = true;
</script>
```

#vanilla
```html
<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" id="select-all" />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">Select all</span>
</label>

<script type="module">
  // HTML has no attribute for it, so it's set as a property.
  document.querySelector("#select-all").indeterminate = true;
</script>
```
::
::

- Set it as the `indeterminate` property of the `<input>`. HTML has no attribute for it, so an `indeterminate` attribute in your markup does nothing, and the Checkbox sets the property for you, which is also what makes screen readers announce it as mixed.
- It's a look, not a value. Under the dash, the box is still checked or unchecked, and its form sends whichever it is.
- The browser clears it on the first click or `Space`, and checks or unchecks the box as usual, as you can try above. The Checkbox fires an update when it does, so a value you bind to it follows along.
- Work it out from the options it stands for each time they change, rather than keeping it as state of its own, so it can never disagree with them. The [Checkbox Group](/docs/components/checkbox-group#select-all) does that for its select-all box.

#### Disabled

A disabled checkbox can't be focused, toggled or submitted. `disabled` sets the native attribute, so the box leaves the tab order, a press on its label does nothing, screen readers announce it as dimmed or unavailable when they read through the page, and its form leaves it out when it's sent, even when it's checked. A `<fieldset disabled>` does all of that for every checkbox inside it, and the Checkbox looks disabled there too, since its look comes from `:disabled`.

We recommend disabling as little as you can, since a disabled checkbox can't explain why it's disabled, and keyboard users can't even reach it to find out. Explain why next to it, or leave the choice out until it applies.

#### Read-only

A read-only checkbox shows a choice that people can see but not change, like a setting that their organisation manages for them. Unlike a disabled one, it stays in the tab order, so people can reach it and hear its state, and its form still sends it. That makes it the one to use when people need to see the choice and the form needs to send it.

HTML gives you nothing to lean on here, since it ignores `readonly` on a checkbox, and `:read-only` matches every checkbox there is. So `readonly` on the Checkbox sets `aria-readonly="true"` on the box, which tells assistive technologies that it can't be changed, and cancels the click that would toggle it, whether it comes from the box, its label or `Space`. A cancelled click puts back both the checked and the indeterminate state, and fires no `change`, so nothing else on the page has to know.

Where the Checkbox renders on the server alone, a script cancels the click instead, and it's the same script for every read-only box on the page:

::framework-switcher
#react
```tsx
<Checkbox name="updates" defaultChecked readOnly>Email me updates</Checkbox>
```

#vue
```vue
<Checkbox name="updates" checked readonly>Email me updates</Checkbox>
```

#svelte
```svelte
<Checkbox name="updates" checked readonly>Email me updates</Checkbox>
```

#angular
```angular-html
<!-- readonly is the component's, rather than the <input>'s, so it goes on the <label>. -->
<label appCheckbox readonly>
  <input type="checkbox" name="updates" checked />
  Email me updates
</label>
```

#solid
```tsx
<Checkbox name="updates" checked readOnly>Email me updates</Checkbox>
```

#astro
```astro
<Checkbox name="updates" checked readonly>Email me updates</Checkbox>

<script>
  // HTML ignores readonly on a checkbox, so a cancelled click keeps a read-only one as it is.
  document.addEventListener("click", (event) => {
    if ((event.target as Element).matches('.checkbox > [aria-readonly="true"]')) event.preventDefault();
  });
</script>
```

#vanilla
```html
<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" name="updates" checked aria-readonly="true" />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">Email me updates</span>
</label>

<script type="module">
  // HTML ignores readonly on a checkbox, so a cancelled click keeps a read-only one as it is.
  document.addEventListener("click", (event) => {
    if (event.target.matches('.checkbox > [aria-readonly="true"]')) event.preventDefault();
  });
</script>
```
::

We recommend saying why next to it, as for a disabled checkbox, like "Your organisation manages this setting". The dashed border tells people they can't change it, but not why, or who can.

#### Required and invalid

Most checkboxes are optional, since an unchecked box is an answer too. The exception is a box that people have to check to go on, like agreeing to the terms. Give it `required`, which screen readers announce, and when people submit without checking it, show an error message that says why it matters.

::checkbox-validation-example
::framework-switcher
#react
```tsx
import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";

export function CreateAccount() {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const terms = useRef<HTMLInputElement>(null);

  function update(checked: boolean) {
    setAgreed(checked);
    // Checking the box fixes the error, so it clears right away.
    if (checked) setError("");
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agreed) {
      // Focus once the error is in the page, so screen readers read it with the checkbox.
      flushSync(() => {
        setError("Agree to the terms to create an account");
        setStatus("Couldn't create your account. Check the terms.");
      });
      terms.current?.focus();
      return;
    }
    await api.createAccount();
    setStatus("Your account is ready");
  }

  return (
    <form noValidate onSubmit={createAccount}>
      <Checkbox
        ref={terms}
        name="terms"
        required
        checked={agreed}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "terms-error" : undefined}
        onChange={(event) => update(event.target.checked)}
      >
        I agree to the terms
      </Checkbox>
      {error && <p id="terms-error">{error}</p>}
      <Button type="submit" color="primary">Create account</Button>
      <p role="status">{status}</p>
    </form>
  );
}
```

#vue
```vue
<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from "vue";

const agreed = ref(false);
const error = ref("");
const status = ref("");
const terms = useTemplateRef("terms");

function update(checked: boolean) {
  agreed.value = checked;
  // Checking the box fixes the error, so it clears right away.
  if (checked) error.value = "";
}

async function createAccount() {
  if (!agreed.value) {
    error.value = "Agree to the terms to create an account";
    status.value = "Couldn't create your account. Check the terms.";
    // Focus once the error is in the page, so screen readers read it with the checkbox.
    await nextTick();
    terms.value?.input?.focus();
    return;
  }
  await api.createAccount();
  status.value = "Your account is ready";
}
</script>

<template>
  <form novalidate @submit.prevent="createAccount">
    <Checkbox
      ref="terms"
      name="terms"
      required
      :checked="agreed"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? 'terms-error' : undefined"
      @update:checked="update"
    >
      I agree to the terms
    </Checkbox>
    <p v-if="error" id="terms-error">{{ error }}</p>
    <Button type="submit" color="primary">Create account</Button>
    <p role="status">{{ status }}</p>
  </form>
</template>
```

#svelte
```svelte
<script lang="ts">
  import { tick } from "svelte";

  let agreed = $state(false);
  let error = $state("");
  let status = $state("");
  let terms = $state<HTMLInputElement>();

  // Checking the box fixes the error, so it clears right away.
  function update(event: Event) {
    if ((event.currentTarget as HTMLInputElement).checked) error = "";
  }

  async function createAccount(event: SubmitEvent) {
    event.preventDefault();
    if (!agreed) {
      error = "Agree to the terms to create an account";
      status = "Couldn't create your account. Check the terms.";
      // Focus once the error is in the page, so screen readers read it with the checkbox.
      await tick();
      terms?.focus();
      return;
    }
    await api.createAccount();
    status = "Your account is ready";
  }
</script>

<form novalidate onsubmit={createAccount}>
  <Checkbox
    bind:ref={terms}
    bind:checked={agreed}
    name="terms"
    required
    aria-invalid={error ? true : undefined}
    aria-describedby={error ? "terms-error" : undefined}
    onchange={update}
  >
    I agree to the terms
  </Checkbox>
  {#if error}<p id="terms-error">{error}</p>{/if}
  <Button type="submit" color="primary">Create account</Button>
  <p role="status">{status}</p>
</form>
```

#angular
```angular-ts
import { Component, ElementRef, Injector, afterNextRender, inject, signal, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-create-account",
  imports: [FormsModule, Checkbox, Button],
  template: `
    <form novalidate (ngSubmit)="createAccount()">
      <label appCheckbox>
        <input
          #terms
          type="checkbox"
          name="terms"
          required
          [ngModel]="agreed()"
          (ngModelChange)="update($event)"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="error() ? 'terms-error' : null"
        />
        I agree to the terms
      </label>
      @if (error()) {
        <p id="terms-error">{{ error() }}</p>
      }
      <button appButton type="submit" color="primary">Create account</button>
      <p role="status">{{ status() }}</p>
    </form>
  `,
})
export class CreateAccount {
  agreed = signal(false);
  error = signal("");
  status = signal("");
  terms = viewChild.required<ElementRef<HTMLInputElement>>("terms");
  injector = inject(Injector);

  update(checked: boolean) {
    this.agreed.set(checked);
    // Checking the box fixes the error, so it clears right away.
    if (checked) this.error.set("");
  }

  async createAccount() {
    if (!this.agreed()) {
      this.error.set("Agree to the terms to create an account");
      this.status.set("Couldn't create your account. Check the terms.");
      // Focus once the error is in the page, so screen readers read it with the checkbox.
      afterNextRender(() => this.terms().nativeElement.focus(), { injector: this.injector });
      return;
    }
    await api.createAccount();
    this.status.set("Your account is ready");
  }
}
```

#solid
```tsx
import { Show, createSignal } from "solid-js";

export function CreateAccount() {
  const [agreed, setAgreed] = createSignal(false);
  const [error, setError] = createSignal("");
  const [status, setStatus] = createSignal("");
  let terms!: HTMLInputElement;

  function update(checked: boolean) {
    setAgreed(checked);
    // Checking the box fixes the error, so it clears right away.
    if (checked) setError("");
  }

  async function createAccount(event: SubmitEvent) {
    event.preventDefault();
    if (!agreed()) {
      setError("Agree to the terms to create an account");
      setStatus("Couldn't create your account. Check the terms.");
      // Solid updates the page as soon as a signal changes, so the error is already in it.
      terms.focus();
      return;
    }
    await api.createAccount();
    setStatus("Your account is ready");
  }

  return (
    <form novalidate onSubmit={createAccount}>
      <Checkbox
        ref={terms}
        name="terms"
        required
        checked={agreed()}
        aria-invalid={error() ? true : undefined}
        aria-describedby={error() ? "terms-error" : undefined}
        onChange={(event) => update(event.currentTarget.checked)}
      >
        I agree to the terms
      </Checkbox>
      <Show when={error()}>
        <p id="terms-error">{error()}</p>
      </Show>
      <Button type="submit" color="primary">Create account</Button>
      <p role="status">{status()}</p>
    </form>
  );
}
```

#astro
```astro
<form id="create-account" novalidate>
  <Checkbox id="terms" name="terms" required>I agree to the terms</Checkbox>
  <p id="terms-error" hidden></p>
  <Button type="submit" color="primary">Create account</Button>
  <p id="status" role="status"></p>
</form>

<script>
  const form = document.querySelector<HTMLFormElement>("#create-account")!;
  const terms = document.querySelector<HTMLInputElement>("#terms")!;
  const error = document.querySelector<HTMLElement>("#terms-error")!;
  const status = document.querySelector("#status")!;

  // Shows the error message, or hides it, along with the attributes that tie it to the checkbox.
  function check() {
    const message = terms.checked ? "" : "Agree to the terms to create an account";
    error.textContent = message;
    error.hidden = !message;
    if (message) {
      terms.setAttribute("aria-invalid", "true");
      terms.setAttribute("aria-describedby", "terms-error");
    } else {
      terms.removeAttribute("aria-invalid");
      terms.removeAttribute("aria-describedby");
    }
    return message;
  }

  // Checking the box fixes the error, so it clears right away.
  terms.addEventListener("change", () => terms.hasAttribute("aria-invalid") && check());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (check()) {
      status.textContent = "Couldn't create your account. Check the terms.";
      terms.focus();
      return;
    }
    await api.createAccount();
    status.textContent = "Your account is ready";
  });
</script>
```

#vanilla
```html
<form id="create-account" novalidate>
  <label class="checkbox" data-size="md">
    <input data-slot="box" type="checkbox" id="terms" name="terms" required />
    <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
    <span data-slot="label">I agree to the terms</span>
  </label>
  <p id="terms-error" hidden></p>
  <button class="button" type="submit" data-variant="solid" data-color="primary" data-size="md">
    <span data-slot="label">Create account</span>
  </button>
  <p id="status" role="status"></p>
</form>

<script type="module">
  const form = document.querySelector("#create-account");
  const terms = document.querySelector("#terms");
  const error = document.querySelector("#terms-error");
  const status = document.querySelector("#status");

  // Shows the error message, or hides it, along with the attributes that tie it to the checkbox.
  function check() {
    const message = terms.checked ? "" : "Agree to the terms to create an account";
    error.textContent = message;
    error.hidden = !message;
    if (message) {
      terms.setAttribute("aria-invalid", "true");
      terms.setAttribute("aria-describedby", "terms-error");
    } else {
      terms.removeAttribute("aria-invalid");
      terms.removeAttribute("aria-describedby");
    }
    return message;
  }

  // Checking the box fixes the error, so it clears right away.
  terms.addEventListener("change", () => terms.hasAttribute("aria-invalid") && check());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (check()) {
      status.textContent = "Couldn't create your account. Check the terms.";
      terms.focus();
      return;
    }
    await api.createAccount();
    status.textContent = "Your account is ready";
  });
</script>
```
::
::

- Set `aria-invalid="true"` on the box while its error message shows, and point `aria-describedby` at the message. Screen readers then announce the box as invalid, and read the message after its name ([WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)). If it has a hint too, list both IDs, the hint's first.
- Say why the box needs checking, as in "Agree to the terms to create an account", rather than "This field is required" ([WCAG 3.3.3](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)). A red border alone can't say any of that, and it means nothing to people who can't tell red apart ([WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- Check it when people submit, rather than when they move past the box, since leaving a box unchecked is a perfectly good answer until then. Once the error shows, clear it as soon as they check the box.
- When a submit fails, move focus to the first invalid control, once the error is in the page, as on the [Input](/docs/components/input#invalid). The status message says what happened even when the focus doesn't move, like when people pressed `Enter` with the button already focused.
- Put `novalidate` on the form, so that the browser's own error bubbles don't compete with yours. Keep `required` on the box, though, which tells screen readers that it's required.

### Adaptive

#### Pointer, touch and pen

- Hover styles only apply to pointers that can actually hover (`@media (hover: hover)`), otherwise a tap would leave the border looking hovered.
- A press anywhere in the box's 24 × 24px hit area, or on its label, toggles it, unless it's read-only, since both are part of the `<label>`. The box and its check don't stop the press, so it reaches the `<input>` underneath.
- Fingers are less precise than a mouse, so we recommend spacing stacked checkboxes 8px or more apart. That way, a tap that lands between two of them doesn't toggle the wrong one.

#### More contrast

When someone asks for more contrast (`prefers-contrast: more`), as with Increase contrast on macOS and iOS, the box's border is drawn in the text colour at full strength, rather than at 55%. The label, the fill and the check already pass, so they stay as they are.

#### Forced colours

Windows contrast themes replace every colour with the user's own, and drop backgrounds and shadows. The box's border stays, since the system draws it in a colour of its own, and so does focus, which is drawn with `outline`. A checked or indeterminate box is filled with `Highlight`, with its check or dash in `HighlightText`, a read-only box keeps its dashed border, with its check in `CanvasText`, and a disabled one is marked with `GrayText`. The invalid border's second pixel is a shadow, which forced colours drop, so in these themes it's the error message, in text, that tells people something's wrong.

#### Colour scheme

The tokens use `light-dark()`, which follows `color-scheme`, so the Checkbox adapts to your light and dark themes on its own.

#### Text size and spacing

The box, the gap and the hit area are set in `rem`, so the box grows with its text instead of looking tiny next to it, at 200% text size ([WCAG 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)) and with wider line, letter and word spacing ([WCAG 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)). A label that's longer than its column wraps, with the box beside its first line, rather than being clipped.

#### Languages and direction

The Checkbox lays out its box and label in a grid, which follows the reading direction, so the box sits at the start of the line in right-to-left languages too, with no extra work on your part:

::checkbox-languages-example
::framework-switcher
#react
```tsx
<div dir="rtl" lang="ar">
  <Checkbox defaultChecked>أرسل لي التحديثات عبر البريد الإلكتروني</Checkbox>
  <Checkbox>أوافق على الشروط</Checkbox>
</div>
```

#vue
```vue
<div dir="rtl" lang="ar">
  <Checkbox checked>أرسل لي التحديثات عبر البريد الإلكتروني</Checkbox>
  <Checkbox>أوافق على الشروط</Checkbox>
</div>
```

#svelte
```svelte
<div dir="rtl" lang="ar">
  <Checkbox checked>أرسل لي التحديثات عبر البريد الإلكتروني</Checkbox>
  <Checkbox>أوافق على الشروط</Checkbox>
</div>
```

#angular
```angular-html
<div dir="rtl" lang="ar">
  <label appCheckbox><input type="checkbox" checked />أرسل لي التحديثات عبر البريد الإلكتروني</label>
  <label appCheckbox><input type="checkbox" />أوافق على الشروط</label>
</div>
```

#solid
```tsx
<div dir="rtl" lang="ar">
  <Checkbox checked>أرسل لي التحديثات عبر البريد الإلكتروني</Checkbox>
  <Checkbox>أوافق على الشروط</Checkbox>
</div>
```

#astro
```astro
<div dir="rtl" lang="ar">
  <Checkbox checked>أرسل لي التحديثات عبر البريد الإلكتروني</Checkbox>
  <Checkbox>أوافق على الشروط</Checkbox>
</div>
```

#vanilla
```html
<div dir="rtl" lang="ar">
  <label class="checkbox" data-size="md">
    <input data-slot="box" type="checkbox" checked />
    <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
    <span data-slot="label">أرسل لي التحديثات عبر البريد الإلكتروني</span>
  </label>
  <label class="checkbox" data-size="md">
    <input data-slot="box" type="checkbox" />
    <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
    <span data-slot="label">أوافق على الشروط</span>
  </label>
</div>
```
::
::

- The check mark stays as it is in right-to-left layouts, as it does in native checkboxes, since it doesn't point anywhere.
- Remember to translate labels, hints and error messages along with the rest of the page, and to mark any that are in another language with `lang`, so that screen readers pronounce them correctly ([WCAG 3.1.2](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html)).

## Developer Experience (DX)

Next, let's look at how developers use the Checkbox. It has one API, with the same names as every other component, it's typed end to end, and it works with your forms however you build them.

::framework-switcher
#react
```tsx
import { useState } from "react";
import { Checkbox } from "@/components/Checkbox";

export function Updates() {
  const [updates, setUpdates] = useState(false);

  return (
    <Checkbox checked={updates} onChange={(event) => setUpdates(event.target.checked)}>
      Email me product updates
    </Checkbox>
  );
}
```

#vue
```vue
<script setup lang="ts">
import { ref } from "vue";
import Checkbox from "@/components/Checkbox.vue";

const updates = ref(false);
</script>

<template>
  <Checkbox v-model:checked="updates">Email me product updates</Checkbox>
</template>
```

#svelte
```svelte
<script lang="ts">
  import Checkbox from "$lib/components/Checkbox.svelte";

  let updates = $state(false);
</script>

<Checkbox bind:checked={updates}>Email me product updates</Checkbox>
```

#angular
```angular-ts
import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Checkbox } from "./checkbox";

@Component({
  selector: "app-updates",
  imports: [FormsModule, Checkbox],
  template: `
    <label appCheckbox>
      <input type="checkbox" [(ngModel)]="updates" />
      Email me product updates
    </label>
  `,
})
export class Updates {
  updates = signal(false);
}
```

#solid
```tsx
import { createSignal } from "solid-js";
import { Checkbox } from "~/components/Checkbox";

export function Updates() {
  const [updates, setUpdates] = createSignal(false);

  return (
    <Checkbox checked={updates()} onChange={(event) => setUpdates(event.currentTarget.checked)}>
      Email me product updates
    </Checkbox>
  );
}
```

#astro
```astro
---
import Checkbox from "../components/Checkbox.astro";
---

<Checkbox name="updates">Email me product updates</Checkbox>
```

#vanilla
```html
<link rel="stylesheet" href="/styles/checkbox.css" />

<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" name="updates" />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">
    <path data-mark="check" d="M3.5 8.5 6.5 11.5 12.5 4.5" />
    <path data-mark="dash" d="M4 8h8" />
  </svg>
  <span data-slot="label">Email me product updates</span>
</label>
```
::

### Consistent

Once you've learned the [Button](/docs/components/button/dx#consistent)'s and the [Input](/docs/components/input#consistent)'s APIs, you already know most of the Checkbox's. These names mean the same thing everywhere in Open Components:

| Name                   | Kind  | What it means                                                       |
| ---------------------- | ----- | ------------------------------------------------------------------- |
| `size`                 | Prop  | `xs`, `sm`, `md`, `lg` or `xl`, with the same text everywhere       |
| `disabled`             | Prop  | The component can't be used                                         |
| `readonly`             | Prop  | It can be focused, and its form sends it, but it can't be changed   |
| `checked`              | Prop  | Whether it's checked, which you bind the way your framework binds a checkbox's |
| `indeterminate`        | Prop  | Neither checked nor unchecked, as the native property means it      |
| Default slot           | Slot  | The label, as it is for the Button                                  |

We recommend `size="md"` as the default. The Checkbox also leaves a few props out, on purpose:

- There's no `label` prop. The label is the content between its tags, which can hold more than plain text, like a word in bold, and which the `<label>` wraps either way.
- There's no `color` or `variant`. A checked box has no intent of its own, and its one other coloured state, invalid, comes from `aria-invalid`, so its colour and its state can't disagree. To match your brand, set `--checkbox--box--fill` from a class, as under [Tokens](/docs/components/checkbox#tokens).
- There's no `hint` or `error`. Each of them is an element of its own, linked by ID, as on the Input, so the Checkbox fits any layout.
- There's no `options` or array value. A list of options is a group, which the [Checkbox Group](/docs/components/checkbox-group) builds out of Checkboxes, with a `<fieldset>` and a `<legend>`.

### Type-safe

Props, events and slots are typed, so your editor can autocomplete them and your type checker (`tsc`, `vue-tsc`, `svelte-check`, `ngc` or `astro check`) catches mistakes like `size="medium"`, which isn't one of the sizes.

| Prop            | Type                                       | Default   | Description                                                          |
| --------------- | ------------------------------------------ | --------- | -------------------------------------------------------------------- |
| `size`          | `"xs" \| "sm" \| "md" \| "lg" \| "xl"`     | `"md"`    | How big the box and its label are                                    |
| `checked`       | `boolean`                                  | `false`   | Whether it's checked, when you bind it. Without it, the box keeps its own |
| `indeterminate` | `boolean`                                  | `false`   | Shows a dash, and makes screen readers announce it as mixed          |
| `disabled`      | `boolean`                                  | `false`   | Blocks focus, toggling and submission                                |
| `readonly`      | `boolean`                                  | `false`   | Blocks toggling, while it stays focusable and its form sends it      |

| Event    | Payload | Description                                                           |
| -------- | ------- | --------------------------------------------------------------------- |
| `change` | `Event` | Fires when people check or uncheck it, with a click, a tap or `Space` |

It comes straight from the `<input>`, like every other native event, such as `focus` and `blur`, and a binding to `checked` listens to it for you. Read the new state from `event.target.checked`.

| Slot      | Description                                                                |
| --------- | -------------------------------------------------------------------------- |
| Default   | The label, which names the checkbox, and which a press on toggles the box, unless it's read-only |

We also export `CheckboxProps`, which comes in handy for wrappers and data-driven forms:

::framework-switcher
#react
```ts
import type { CheckboxProps } from "@/components/Checkbox";

const preferences: (CheckboxProps & { name: string; label: string })[] = [
  { name: "updates", label: "Email me product updates" },
  { name: "texts", label: "Text me about my orders", disabled: true },
];
```

#vue
```ts
import type { CheckboxProps } from "@/components/Checkbox.vue";

const preferences: (CheckboxProps & { name: string; label: string })[] = [
  { name: "updates", label: "Email me product updates" },
  { name: "texts", label: "Text me about my orders", disabled: true },
];
```

#svelte
```ts
import type { CheckboxProps } from "$lib/components/Checkbox.svelte";

const preferences: (CheckboxProps & { name: string; label: string })[] = [
  { name: "updates", label: "Email me product updates" },
  { name: "texts", label: "Text me about my orders", disabled: true },
];
```

#angular
```ts
import type { CheckboxProps } from "./checkbox";

const preferences: (CheckboxProps & { name: string; label: string })[] = [
  { name: "updates", label: "Email me product updates" },
  { name: "texts", label: "Text me about my orders", disabled: true },
];
```

#solid
```ts
import type { CheckboxProps } from "~/components/Checkbox";

const preferences: (CheckboxProps & { name: string; label: string })[] = [
  { name: "updates", label: "Email me product updates" },
  { name: "texts", label: "Text me about my orders", disabled: true },
];
```

#astro
```ts
import type { ComponentProps } from "astro/types";
import Checkbox from "../components/Checkbox.astro";

type CheckboxProps = ComponentProps<typeof Checkbox>;

const preferences: (CheckboxProps & { name: string; label: string })[] = [
  { name: "updates", label: "Email me product updates" },
  { name: "texts", label: "Text me about my orders", disabled: true },
];
```
::

### Composable

The Checkbox renders a `<label>` around the `<input>`, so it splits what you pass between them. Classes and styles go on the `<label>`, so a class can set its variables. Everything else lands on the `<input>`, including `id`, `name`, `value`, `required`, ARIA attributes and event listeners. A ref to the Checkbox reaches the `<input>` too, since that's what form libraries and `focus()` need.

#### Forms

The `<input>` is a real form control, so the Checkbox works with your forms however you build them. You can bind `checked`, as above, or leave it to the browser and read it from the form when it's sent. A checked box sends its `name` with its `value`, or with `on` when it has no `value`, and an unchecked box sends nothing at all, so check whether its name is there, rather than for a value of `false`. That also means the form works before your JavaScript loads.

::framework-switcher
#react
```tsx
import type { FormEvent } from "react";

export function Preferences() {
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // An unchecked box sends nothing, so it's checked when its name is there.
    api.savePreferences({ updates: data.has("updates") });
  }

  return (
    <form onSubmit={save}>
      <Checkbox name="updates" value="yes" defaultChecked>Email me product updates</Checkbox>
      <Button type="submit" color="primary">Save preferences</Button>
    </form>
  );
}
```

#vue
```vue
<script setup lang="ts">
function save(event: SubmitEvent) {
  const data = new FormData(event.target as HTMLFormElement);
  // An unchecked box sends nothing, so it's checked when its name is there.
  api.savePreferences({ updates: data.has("updates") });
}
</script>

<template>
  <form @submit.prevent="save">
    <Checkbox name="updates" value="yes" checked>Email me product updates</Checkbox>
    <Button type="submit" color="primary">Save preferences</Button>
  </form>
</template>
```

#svelte
```svelte
<script lang="ts">
  function save(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    // An unchecked box sends nothing, so it's checked when its name is there.
    api.savePreferences({ updates: data.has("updates") });
  }
</script>

<form onsubmit={save}>
  <Checkbox name="updates" value="yes" checked>Email me product updates</Checkbox>
  <Button type="submit" color="primary">Save preferences</Button>
</form>
```

#angular
```angular-ts
@Component({
  selector: "app-preferences",
  imports: [Checkbox, Button],
  template: `
    <form (submit)="save($event)">
      <label appCheckbox>
        <input type="checkbox" name="updates" value="yes" checked />
        Email me product updates
      </label>
      <button appButton type="submit" color="primary">Save preferences</button>
    </form>
  `,
})
export class Preferences {
  save(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    // An unchecked box sends nothing, so it's checked when its name is there.
    api.savePreferences({ updates: data.has("updates") });
  }
}
```

#solid
```tsx
export function Preferences() {
  function save(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // An unchecked box sends nothing, so it's checked when its name is there.
    api.savePreferences({ updates: data.has("updates") });
  }

  return (
    <form onSubmit={save}>
      <Checkbox name="updates" value="yes" checked>Email me product updates</Checkbox>
      <Button type="submit" color="primary">Save preferences</Button>
    </form>
  );
}
```

#astro
```astro
<!-- The form posts to the server, so it works before any JavaScript loads. -->
<form method="post" action="/preferences">
  <Checkbox name="updates" value="yes" checked>Email me product updates</Checkbox>
  <Button type="submit" color="primary">Save preferences</Button>
</form>
```

#vanilla
```html
<!-- The form posts to the server, so it works before any JavaScript loads. -->
<form method="post" action="/preferences">
  <label class="checkbox" data-size="md">
    <input data-slot="box" type="checkbox" name="updates" value="yes" checked />
    <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
    <span data-slot="label">Email me product updates</span>
  </label>
  <button class="button" type="submit" data-variant="solid" data-color="primary" data-size="md">
    <span data-slot="label">Save preferences</span>
  </button>
</form>
```
::

Form libraries work the same way. They register the `<input>` itself, through its ref or its attributes and listeners, which is why the Checkbox puts them all on the `<input>`. Keep in mind that a server reading the form sees no field at all for an unchecked box, so treat a missing name as "no".

#### With other components

- The [Checkbox Group](/docs/components/checkbox-group) puts Checkboxes in a `<fieldset>` with a `<legend>`, gives them one `name`, binds each one's `checked` to a list of values, and works out its select-all box's `indeterminate` for you. A `<fieldset disabled>` already disables every Checkbox inside it.
- The Field, on our [Roadmap](/docs/getting-started/roadmap), will render a checkbox's hint and error message, and set its `aria-describedby` and `aria-invalid`, as it will for the [Input](/docs/components/input).
- A [Button](/docs/components/button) that submits the form goes after the checkboxes, and takes the same `size`, so their text lines up.

### Controllable

The Checkbox doesn't keep any state you can't reach. Its checked state is yours to bind, or to leave to the browser, and every other state is a prop or an attribute that you control:

::checkbox-controlled-example
::framework-switcher
#react
```tsx
const [updates, setUpdates] = useState(true);

<Checkbox checked={updates} onChange={(event) => setUpdates(event.target.checked)}>Email me updates</Checkbox>
<p>You'll {updates ? "get" : "miss"} our updates</p>

<Checkbox name="remember">Remember me</Checkbox>
```

#vue
```vue
<script setup lang="ts">
const updates = ref(true);
</script>

<template>
  <Checkbox v-model:checked="updates">Email me updates</Checkbox>
  <p>You'll {{ updates ? "get" : "miss" }} our updates</p>

  <Checkbox name="remember">Remember me</Checkbox>
</template>
```

#svelte
```svelte
<script lang="ts">
  let updates = $state(true);
</script>

<Checkbox bind:checked={updates}>Email me updates</Checkbox>
<p>You'll {updates ? "get" : "miss"} our updates</p>

<Checkbox name="remember">Remember me</Checkbox>
```

#angular
```angular-html
<label appCheckbox><input type="checkbox" [(ngModel)]="updates" />Email me updates</label>
<p>You'll {{ updates() ? "get" : "miss" }} our updates</p>

<label appCheckbox><input type="checkbox" name="remember" />Remember me</label>
```

#solid
```tsx
const [updates, setUpdates] = createSignal(true);

<Checkbox checked={updates()} onChange={(event) => setUpdates(event.currentTarget.checked)}>Email me updates</Checkbox>
<p>You'll {updates() ? "get" : "miss"} our updates</p>

<Checkbox name="remember">Remember me</Checkbox>
```

#astro
```astro
<Checkbox id="updates" checked>Email me updates</Checkbox>
<p id="updates-status">You'll get our updates</p>

<Checkbox name="remember">Remember me</Checkbox>

<script>
  const updates = document.querySelector<HTMLInputElement>("#updates")!;
  updates.addEventListener("change", () => {
    document.querySelector("#updates-status")!.textContent = `You'll ${updates.checked ? "get" : "miss"} our updates`;
  });
</script>
```

#vanilla
```html
<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" id="updates" checked />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">Email me updates</span>
</label>
<p id="updates-status">You'll get our updates</p>

<label class="checkbox" data-size="md">
  <input data-slot="box" type="checkbox" name="remember" />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  <span data-slot="label">Remember me</span>
</label>

<script type="module">
  const updates = document.querySelector("#updates");
  updates.addEventListener("change", () => {
    document.querySelector("#updates-status").textContent = `You'll ${updates.checked ? "get" : "miss"} our updates`;
  });
</script>
```
::
::

| State         | How you control it                                                         |
| ------------- | -------------------------------------------------------------------------- |
| Checked       | `checked`, bound to your state, or left to the browser                     |
| Indeterminate | `indeterminate`, worked out from the options it stands for                 |
| Disabled      | `disabled`, or a `<fieldset disabled>` around it                           |
| Read-only     | `readonly`, which sets `aria-readonly` on the `<input>` and cancels its clicks |
| Required      | `required`, which lands on the `<input>`                                   |
| Invalid       | `aria-invalid`, set while its error message shows (see [Required and invalid](/docs/components/checkbox#required-and-invalid)) |
| Focus         | A ref to its `<input>`, and `focus()`                                      |

When you bind `checked`, the box always shows the state you hold. If a change doesn't make it into your state, like an option people aren't allowed to uncheck, the box goes back to that state as soon as it renders, rather than showing a tick that your state doesn't have. When you don't bind it, the box keeps its own state, and starts out checked if you say so.

## Agentic Experience (AX)

Finally, let's look at how agents read, check and verify a checkbox. They rely on the same accessibility tree as assistive technologies, and on a contract they can check the code against.

### Semantic

Agents that drive a browser, through Playwright or a browser MCP server, read the page through its accessibility tree, which is made of roles, names and states. This is how they see the states example on this page:

```yaml
- checkbox "Email me updates"
- checkbox "Email me updates" [checked]
- checkbox "Select all" [checked=mixed]
- checkbox "Text me updates" [disabled]
- checkbox "Email me updates" [checked] [disabled]
- checkbox "Text me updates"
- checkbox "Email me updates" [checked]
- checkbox "I agree to the terms" [invalid]
```

A `<div>` that only looks like a checkbox has no role and no state, so an agent can't tell whether it's checked, any more than a screen reader user can. With a role, a name and a state, an agent can find the box, check it and confirm that it took:

```ts
const terms = page.getByRole("checkbox", { name: "I agree to the terms" });
await terms.check();
await expect(terms).toBeChecked();
```

### Described

Here's the whole contract in one block, for agents to read before they build or review a checkbox:

```yaml
component: Checkbox
summary: Says yes or no to one thing, like agreeing to the terms. The label it wraps names it.
standard: https://opencomponents.dev/docs/components/checkbox
element: input # type="checkbox", inside the label that names it, which takes class and style
role: checkbox
props:
  size: { type: [xs, sm, md, lg, xl], default: md }
  checked: { type: boolean, default: false } # when it's bound. Without it, the box keeps its own
  indeterminate: { type: boolean, default: false } # set as a property. The first click clears it, and a bound value with it
  disabled: { type: boolean, default: false }
  readonly: { type: boolean, default: false } # sets aria-readonly, since HTML ignores readonly on a checkbox, and cancels the click
slots:
  default: The label, which names the checkbox. A press on it toggles the box, unless it's read-only.
events:
  change: Event, from the <input>. Fires when people check or uncheck it.
states:
  hover: ":hover, in @media (hover: hover)"
  focus: "> input:focus-visible"
  checked: "> input:checked"
  indeterminate: "> input:indeterminate"
  disabled: ":has(> input:disabled), which a <fieldset disabled> sets too"
  read-only: "> input[aria-readonly=true], never :read-only"
  invalid: "> input[aria-invalid=true], never :invalid"
keyboard:
  Tab: Moves focus to the box.
  Space: Checks or unchecks it, and clears the indeterminate state, unless it's read-only.
  Enter: Never toggles it.
parts: [box, indicator, label] # data-slot, in this order. The box is the <input>
tokens:
  theme: ["--color--neutral-text", "--color--primary", "--color--primary-contrast", "--color--error-text", "--color--focus"]
  variables: [--checkbox--box--size, --checkbox--box--radius, --checkbox--box--border-color, --checkbox--box--fill, --checkbox--indicator--color, --checkbox--gap, --checkbox--font-size, --checkbox--hit-area--size]
  layer: components # in Tailwind's order: theme, base, components, utilities
rules: https://opencomponents.dev/docs/components/checkbox#checklist
```

It's also published on its own at [`/raw/docs/components/checkbox.yaml`](/raw/docs/components/checkbox.yaml){external=""}, with every rule from the checklist in place of the `rules` link. It's a fraction of this page's length, so it's the one to give agents that only need the rules, and not the reasoning behind them.

Every rule has a stable ID, like `checkbox/label-toggles`, so you and your agents can cite it in reviews and commits.

### Deterministic

The same props always render the same markup, leaving out anything your framework adds for itself, like comments or scoping attributes. For example, here's a required checkbox with an error:

```html
<Checkbox name="terms" required aria-invalid="true" aria-describedby="terms-error">
  I agree to the terms
</Checkbox>
```

And here's what it renders:

```html
<label class="checkbox" data-size="md">
  <input
    data-slot="box"
    type="checkbox"
    name="terms"
    required
    aria-invalid="true"
    aria-describedby="terms-error"
  />
  <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">
    <path data-mark="check" d="M3.5 8.5 6.5 11.5 12.5 4.5" />
    <path data-mark="dash" d="M4 8h8" />
  </svg>
  <span data-slot="label">I agree to the terms</span>
</label>
```

- The size is mirrored as `data-size`, which is always there. The `<input>`'s `type` is always `checkbox`.
- Parts are marked with `data-slot` and always come in the same order: `box`, `indicator` and `label`. Only the label is optional, and the indicator always holds both marks, which CSS shows one at a time.
- States change properties and attributes, never elements. Indeterminate is a property of the `<input>` with no attribute, so it never shows up in the markup, and the `<input>` is never replaced, so focus and the screen reader's position survive every change.
- There's nothing random or generated, like IDs or timestamps, so the markup is the same on the server, on the client and in every snapshot. The `<label>` wraps the box, so it needs no ID to name it.

### Verifiable

Every rule in the checklist can be checked, and about half of them automatically.

#### Unit tests

Every rule that the checklist checks with a unit test has one in `Checkbox.test.ts`, which you'll find under [Reference implementation](/docs/components/checkbox#reference-implementation). We run them on every change to this page, so the code you see always passes them.

#### In the browser

In the browser, you can run [axe](https://github.com/dequelabs/axe-core) to check labels, contrast and target size, and use the keyboard the way an agent would, to check that `Space` toggles the box and `Enter` doesn't:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the terms checkbox toggles with Space and its label, but not with Enter", async ({ page }) => {
  await page.goto("/sign-up");

  const terms = page.getByRole("checkbox", { name: "I agree to the terms" });
  await terms.focus();
  await page.keyboard.press("Space");
  await expect(terms).toBeChecked();
  await page.getByText("I agree to the terms").click();
  await expect(terms).not.toBeChecked();

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations).toEqual([]);
});
```

Some things still need a human, so try your checkboxes with the keyboard alone, with a screen reader, which should announce each one's name and state, mixed included, and at 200% zoom, with forced colours and more contrast turned on. You can emulate the last two in Chrome DevTools, under Rendering.

#### During development

Our reference implementation also warns you in the console as soon as a checkbox renders without a label or an `aria-label`, which leaves screen reader users with nothing but "checkbox, not checked".

#### Prompts

You can point your agent straight at this page. To build a checkbox, you could use:

::framework-switcher
#react
```
Build a Checkbox component for our React design system that meets the Open Components
Checkbox standard: https://opencomponents.dev/raw/docs/components/checkbox.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#vue
```
Build a Checkbox component for our Vue 3 design system that meets the Open Components
Checkbox standard: https://opencomponents.dev/raw/docs/components/checkbox.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#svelte
```
Build a Checkbox component for our Svelte 5 design system that meets the Open Components
Checkbox standard: https://opencomponents.dev/raw/docs/components/checkbox.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#angular
```
Build a Checkbox component for our Angular design system that meets the Open Components
Checkbox standard: https://opencomponents.dev/raw/docs/components/checkbox.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#solid
```
Build a Checkbox component for our Solid design system that meets the Open Components
Checkbox standard: https://opencomponents.dev/raw/docs/components/checkbox.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#astro
```
Build a Checkbox component for our Astro design system that meets the Open Components
Checkbox standard: https://opencomponents.dev/raw/docs/components/checkbox.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#vanilla
```
Build a Checkbox for our design system in plain HTML, CSS and JavaScript that meets the
Open Components Checkbox standard: https://opencomponents.dev/raw/docs/components/checkbox.md

Follow its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```
::

To review one, the contract is enough:

```
Review our Checkbox against the Open Components Checkbox contract:
https://opencomponents.dev/raw/docs/components/checkbox.yaml

For each rule with a component or both scope, report pass or fail with the rule ID
and the evidence from our code. Then fix the failures.
```

And to review how a screen uses its checkboxes:

```
Review how our sign-up form uses its checkboxes against the Open Components Checkbox
contract: https://opencomponents.dev/raw/docs/components/checkbox.yaml

For each rule with a usage or both scope, report pass or fail with the rule ID and
the evidence from our code. Then fix the failures.
```

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A checkbox meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Checkbox itself, so they're the ones to check when you build or review one. **Usage** rules are met by the forms that use it, like writing a label that says what checking the box means, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like an invalid checkbox: the Checkbox looks invalid from `aria-invalid`, as long as you set it when the error message shows.

The basis says where a rule comes from. About half the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and a few come from **HTML**, **WAI-ARIA** or the **APG**. The rest are **Open Components** rules, which are our own, like keeping a checkbox's label positive. Where a rule goes further than WCAG asks at level AA, its basis says so: a rule that asks for more than its criterion says **beyond**, like the 24 × 24px hit area around every box, where WCAG would also accept a smaller box with enough space around it.

### UI rules

| Rule                         | Level  | Scope     | Requirement | Basis | Check |
| ---------------------------- | ------ | --------- | ----------- | ----- | ---------------------- |
| `checkbox/contrast`          | Must   | Component | The label has a contrast of 4.5:1, and the focus ring has 3:1 against the page | WCAG 1.4.3, 1.4.11 (AA) | axe `color-contrast`, contrast checker |
| `checkbox/boundary-contrast` | Must   | Component | The box's border and a checked box's fill have 3:1 against the page, and the check and the dash have 3:1 against the fill | WCAG 1.4.11 (AA) | Contrast checker |
| `checkbox/focus-visible`     | Must   | Component | Keyboard focus shows an `outline` at least 2px thick around the box, outside its border, on `:focus-visible` | WCAG 2.4.7 (AA), 2.4.13 (AAA) | Keyboard |
| `checkbox/target-size`       | Must   | Component | The box has a hit area of at least 24 × 24px that toggles it, without counting its label | Open Components, beyond WCAG 2.5.8 (AA) | axe `target-size`, emulation |
| `checkbox/distinct-marks`    | Must   | Component | Checked shows a check and indeterminate a dash, so the two never rely on colour to tell them apart | WCAG 1.4.1 (A) | Visual regression test |
| `checkbox/resizable`         | Must   | Component | The box, its gap and its hit area are sized in `rem`, and the label wraps beside the box instead of being clipped | Open Components, beyond WCAG 1.4.4, 1.4.12 (AA) | 200% zoom |
| `checkbox/stable-size`       | Must   | Component | No state changes the checkbox's size or position | Open Components | Visual regression test |
| `checkbox/state-selectors`   | Should | Component | States are styled from the `<input>`, with `:checked`, `:indeterminate`, `[aria-readonly]`, `:disabled` and `[aria-invalid]`, and never from `:invalid` or `:read-only` | Open Components | Review |
| `checkbox/hover-capable`     | Should | Component | Hover styles only apply inside `@media (hover: hover)` | Open Components | Review |
| `checkbox/forced-colors`     | Must   | Component | The box, its check or dash, and its focus, read-only and disabled states stay visible in forced colours mode | Open Components | Emulation |
| `checkbox/more-contrast`     | Should | Component | The box's border is drawn at full strength when `prefers-contrast: more` is set | Open Components | Emulation |

### UX rules

| Rule                          | Level  | Scope     | Requirement | Basis | Check |
| ----------------------------- | ------ | --------- | ----------- | ----- | --------------------------------- |
| `checkbox/native-element`     | Must   | Component | It's a native `<input type="checkbox">`, never an element with `role="checkbox"` | Open Components, beyond WCAG 2.1.1, 4.1.2 (A) | Unit test |
| `checkbox/label-toggles`      | Must   | Component | Its `<label>` wraps the box and its text, so the text names it and a press on the text toggles it, unless it's read-only | WCAG 1.3.1, 4.1.2 (A), HTML | Unit test |
| `checkbox/visible-label`      | Must   | Usage     | Every checkbox has visible text, unless its context names it, like a row in a table, in which case it has an `aria-label` | WCAG 1.3.1, 3.3.2, 4.1.2 (A) | axe `label` |
| `checkbox/label-in-name`      | Must   | Usage     | An `aria-label` or `aria-labelledby` includes the visible text, ideally at the start | WCAG 2.5.3 (A) | axe `label-content-name-mismatch` |
| `checkbox/no-interactive-label` | Should | Usage   | The label holds no links or buttons, which go in the hint or before the checkbox | Open Components | Review |
| `checkbox/positive-label`     | Should | Usage     | The label says what checking the box means, in the positive, like "Email me updates" | Open Components | Review |
| `checkbox/described`          | Should | Usage     | Hints sit outside the label and are linked with `aria-describedby` | WCAG 1.3.1 (A) | Screen reader |
| `checkbox/decorative-indicator` | Must | Component | The check and the dash are hidden from assistive technologies with `aria-hidden`, so the name is the label alone | WCAG 1.1.1, 4.1.2 (A) | Unit test |
| `checkbox/keyboard`           | Must   | Component | `Tab` reaches the box, `Space` checks or unchecks it unless it's read-only, and `Enter` never toggles it | WCAG 2.1.1 (A), APG | Unit test |
| `checkbox/indeterminate`      | Must   | Component | The mixed state is set as the `<input>`'s `indeterminate` property, so it's announced as mixed, and it clears on the first click | WCAG 4.1.2 (A), HTML | Unit test |
| `checkbox/derived-mixed`      | Should | Usage     | `indeterminate` is worked out from the options it stands for whenever they change | Open Components | Review |
| `checkbox/no-immediate-action` | Should | Usage    | Checking a box changes nothing until its form is sent, and a setting that takes effect at once uses a Switch | Open Components | Review |
| `checkbox/required`           | Should | Both      | A box people have to check has `required`, which lands on the `<input>`, while optional boxes don't | HTML, WCAG 3.3.2 (A) | Unit test, review |
| `checkbox/error-message`      | Must   | Usage     | An invalid checkbox has an error message, in text and linked with `aria-describedby`, that says why it needs checking | WCAG 1.4.1, 3.3.1 (A), 3.3.3 (AA) | Screen reader |
| `checkbox/invalid-state`      | Must   | Both      | A checkbox sets `aria-invalid="true"` while its error message shows, and only looks invalid when it does | WCAG 4.1.2 (A), Open Components | Unit test |
| `checkbox/read-only`          | Must   | Component | A read-only checkbox sets `aria-readonly="true"`, stays focusable and is sent with its form, while a click, its label or `Space` never change it | WAI-ARIA, Open Components | Unit test |
| `checkbox/read-only-values`   | Should | Usage     | A choice people need to see but can't change is read-only rather than disabled, and says why next to it | Open Components | Review |
| `checkbox/disabled-inert`     | Must   | Component | A disabled checkbox, or one inside a `<fieldset disabled>`, can't be focused, toggled or submitted, and looks disabled | HTML | Unit test |
| `checkbox/explain-disabled`   | Should | Usage     | A disabled checkbox explains why next to it, or is left out until it applies | Open Components | Review |
| `checkbox/focus-not-obscured` | Must   | Usage     | Sticky headers and footers never cover a focused checkbox, for example thanks to `scroll-padding` | WCAG 2.4.11 (AA), 2.4.12 (AAA) | Keyboard |
| `checkbox/mirrors-in-rtl`     | Should | Component | The box sits at the start of the line in either direction, with logical properties and a grid that follows `dir` | Open Components | Review |

### DX rules

| Rule                          | Level  | Scope     | Requirement | Basis | Check |
| ----------------------------- | ------ | --------- | ----------- | ----- | --------- |
| `checkbox/shared-vocabulary`  | Must   | Component | It uses the shared names: `size`, `disabled`, `readonly`, `checked`, `indeterminate`, the default slot for its label and `change` | Open Components | Review |
| `checkbox/typed`              | Must   | Component | Props, events and slots are typed, with unions rather than `string` | Open Components | Type check |
| `checkbox/control-attributes` | Must   | Component | Attributes, listeners and refs land on the `<input>`, while classes and styles land on the `<label>` | Open Components | Unit test |
| `checkbox/form-control`       | Must   | Component | Its form sends its `name` with its `value` while it's checked, and nothing while it's unchecked, whether `checked` is bound or not | HTML | Unit test |
| `checkbox/controllable`       | Should | Component | `checked` can be bound or left to the browser, a bound box always shows the state you hold, and every other state is a prop or an attribute | Open Components | Unit test |

### AX rules

| Rule                         | Level  | Scope     | Requirement | Basis | Check |
| ---------------------------- | ------ | --------- | ----------- | ----- | --------- |
| `checkbox/role-and-name`     | Must   | Component | It can be found by its role and label alone, with `getByRole("checkbox", { name })`, and reports checked, unchecked or mixed | WCAG 4.1.2 (A) | Unit test |
| `checkbox/deterministic-dom` | Must   | Component | The same props render the same markup, with no generated IDs, and states change properties and attributes, never elements | Open Components | Unit test |
| `checkbox/data-attributes`   | Should | Component | The size is mirrored as `data-size`, and parts are marked with `data-slot` | Open Components | Unit test |
| `checkbox/dev-warnings`      | Should | Component | It warns during development when a checkbox has no label and no `aria-label` | Open Components | Unit test |

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves. It reads the same theme tokens as the Button, so copy [`tokens.css`](/docs/components/button#reference-implementation) from the Button's reference implementation into your theme too.

The tests are in `Checkbox.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [Checkbox.vue]
<script setup lang="ts">
import { nextTick, onMounted, useAttrs, useTemplateRef, watchEffect } from "vue";

export interface CheckboxProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  /** Shows a state people can focus and send with the form, but not change. HTML ignores `readonly` on a checkbox, so it's `aria-readonly`, and a click is cancelled. */
  readonly?: boolean;
}

// Attributes go on the <input> rather than on the root, so they're declared below.
defineOptions({ inheritAttrs: false });

const { size = "md", disabled = false, readonly = false } = defineProps<CheckboxProps>();

/** Whether it's checked, which `v-model:checked` binds. Without it, the checkbox keeps its own, and starts from `checked`. */
const checked = defineModel<boolean>("checked", { default: false });
/**
 * Neither checked nor unchecked, like a select-all box when only some of its options
 * are. The browser clears it as soon as people click, which `v-model:indeterminate`
 * hears about.
 */
const indeterminate = defineModel<boolean>("indeterminate", { default: false });

defineSlots<{
  /** The label, which the <label> wraps along with the box, so it names the checkbox. */
  default?: () => unknown;
}>();

const attrs = useAttrs();
// Classes and styles go on the root, the <label>, so a class can set its variables.
// Everything else goes on the <input>: `id`, `name`, `value`, `required`, ARIA and
// listeners. Attrs aren't reactive, so these run on every render.
const onRoot = (key: string) => key === "class" || key === "style";
const rootAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => onRoot(key)));
const controlAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => !onRoot(key)));

const input = useTemplateRef<HTMLInputElement>("input");

// A cancelled click puts back the checked and indeterminate states, and fires no
// change, whether it came from the box, its label or Space.
function onClick(event: MouseEvent) {
  if (readonly) event.preventDefault();
}

// Bound before your own listeners, so a `change` listener of yours already sees the new state.
async function onChange(event: Event) {
  const box = event.target as HTMLInputElement;
  checked.value = box.checked;
  indeterminate.value = false;
  // A bound state that didn't take the change, like an option people can't uncheck,
  // wins once it has rendered, so the box always shows the state you hold.
  await nextTick();
  box.checked = checked.value;
  box.indeterminate = indeterminate.value;
}

// HTML has no attribute for indeterminate, so it's set on the <input> as a property,
// once it has rendered, which also keeps it out of the server's markup.
watchEffect(
  () => {
    if (input.value) input.value.indeterminate = indeterminate.value;
  },
  { flush: "post" },
);

// A ref to the Checkbox gets you the <input>, through `input`.
defineExpose({ input });

onMounted(() => {
  if (import.meta.env.DEV) {
    const el = input.value;
    const named =
      [...(el?.labels ?? [])].some((label) => label.textContent?.trim()) ||
      el?.hasAttribute("aria-label") ||
      el?.hasAttribute("aria-labelledby");
    if (el && !named) {
      console.warn("[Checkbox] has no accessible name: give it a label, or an aria-label when it has none.", el);
    }
  }
});
</script>

<template>
  <label class="checkbox" v-bind="rootAttrs()" :data-size="size">
    <input
      ref="input"
      data-slot="box"
      type="checkbox"
      :disabled="disabled"
      :aria-readonly="readonly ? 'true' : undefined"
      @click="onClick"
      @change="onChange"
      v-bind="controlAttrs()"
      :checked="checked"
    />
    <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">
      <path data-mark="check" d="M3.5 8.5 6.5 11.5 12.5 4.5" />
      <path data-mark="dash" d="M4 8h8" />
    </svg>
    <span v-if="$slots.default" data-slot="label"><slot /></span>
  </label>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The checkbox's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .checkbox {
    /* Set per size. The box grows with the text. */
    --checkbox--box--size: 1.125rem;
    --checkbox--box--radius: 0.25rem;
    /* The text colour at 55%, which has 3:1 against the page, so people can see the box. */
    --checkbox--box--border-color: color-mix(in srgb, currentColor 55%, transparent);
    --checkbox--box--fill: var(--color--primary);
    --checkbox--indicator--color: var(--color--primary-contrast);
    --checkbox--gap: 0.5rem;
    --checkbox--font-size: 0.875rem;
    /* The hit area around the box, whatever its size (WCAG 2.5.8). */
    --checkbox--hit-area--size: 1.5rem;

    position: relative;
    display: inline-grid;
    /* The box and its check share the first column, and the label takes a second. */
    grid-template-columns: var(--checkbox--box--size);
    column-gap: var(--checkbox--gap);
    align-items: start;
    color: var(--color--neutral-text);
    font-size: var(--checkbox--font-size);
    line-height: 1.25;
    cursor: pointer;
  }

  /* A press anywhere in the hit area toggles the box, since it's part of the <label>.
     Each checkbox is at least as tall as its hit area, so stacked ones never overlap. */
  .checkbox::before {
    content: "";
    position: absolute;
    top: max(0px, (var(--checkbox--box--size) - var(--checkbox--hit-area--size)) / 2);
    inset-inline-start: calc((var(--checkbox--box--size) - var(--checkbox--hit-area--size)) / 2);
    width: var(--checkbox--hit-area--size);
    height: var(--checkbox--hit-area--size);
  }

  /* Sizes */
  .checkbox[data-size="xs"] {
    --checkbox--box--size: 0.875rem;
    --checkbox--gap: 0.375rem;
    --checkbox--font-size: 0.75rem;
  }
  .checkbox[data-size="sm"] {
    --checkbox--box--size: 1rem;
  }
  .checkbox[data-size="lg"] {
    --checkbox--box--size: 1.25rem;
    --checkbox--box--radius: 0.375rem;
    --checkbox--font-size: 1rem;
  }
  .checkbox[data-size="xl"] {
    --checkbox--box--size: 1.5rem;
    --checkbox--box--radius: 0.375rem;
    --checkbox--gap: 0.625rem;
    --checkbox--font-size: 1rem;
  }

  /* Parts. The box and its check are centred in the first line, or in the hit area
     when that's taller, and so is the label's first line, however long it runs. */
  .checkbox > [data-slot="box"],
  .checkbox > [data-slot="indicator"] {
    grid-area: 1 / 1;
    box-sizing: border-box;
    width: var(--checkbox--box--size);
    height: var(--checkbox--box--size);
    margin: max(0px, (var(--checkbox--hit-area--size) - var(--checkbox--box--size)) / 2) 0;
  }
  .checkbox > [data-slot="box"] {
    /* Above the hit area, which is positioned too, so the box still gets its own hover and press. */
    position: relative;
    /* The browser's own box can't be sized or coloured the same way everywhere. */
    appearance: none;
    border: 1px solid var(--checkbox--box--border-color);
    border-radius: var(--checkbox--box--radius);
    background-color: transparent;
    /* Inputs don't inherit the text colour, which the border is mixed from. */
    color: inherit;
    cursor: inherit;
  }
  .checkbox > [data-slot="indicator"] {
    /* Positioned too, so it's drawn over the box, while clicks go through to it. */
    position: relative;
    pointer-events: none;
    color: var(--checkbox--indicator--color);
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .checkbox > [data-slot="indicator"] > [data-mark] {
    display: none;
  }
  .checkbox > [data-slot="label"] {
    grid-row: 1;
    grid-column: 2;
    padding-block: max(0px, (var(--checkbox--hit-area--size) - 1.25 * var(--checkbox--font-size)) / 2);
  }

  /* States. Each one reads the <input>, which is what assistive technologies report,
     so what people see and what they hear can't drift apart. */
  @media (hover: hover) {
    .checkbox:hover:where(:not(:has(> [data-slot="box"]:is(:disabled, [aria-readonly="true"])))) {
      --checkbox--box--border-color: color-mix(in srgb, currentColor 80%, transparent);
    }
  }
  .checkbox > [data-slot="box"]:focus-visible {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  .checkbox > [data-slot="box"]:is(:checked, :indeterminate) {
    --checkbox--box--border-color: var(--checkbox--box--fill);
    background-color: var(--checkbox--box--fill);
  }
  /* The browser clears :indeterminate on the first click, and the dash takes precedence
     over the check, as it does in native checkboxes. */
  .checkbox > [data-slot="box"]:checked:not(:indeterminate) + [data-slot="indicator"] > [data-mark="check"],
  .checkbox > [data-slot="box"]:indeterminate + [data-slot="indicator"] > [data-mark="dash"] {
    display: inline;
  }
  /* Read-only: dashed, like a read-only Input, with the check in the text colour and no
     fill, so it reads as a state you can see but not change. :read-only can't tell it
     apart, since it matches every checkbox. */
  .checkbox:has(> [data-slot="box"][aria-readonly="true"]) {
    cursor: default;
  }
  .checkbox > [data-slot="box"][aria-readonly="true"] {
    /* The container's border colour, which more contrast still strengthens. */
    --checkbox--box--border-color: inherit;
    border-style: dashed;
    background-color: transparent;
  }
  .checkbox > [data-slot="box"][aria-readonly="true"] + [data-slot="indicator"] {
    color: inherit;
  }
  .checkbox > [data-slot="box"][aria-invalid="true"] {
    --checkbox--box--border-color: var(--color--error-text);
    /* A second pixel of border, drawn inside, so the box doesn't grow. */
    box-shadow: inset 0 0 0 1px var(--checkbox--box--border-color);
  }
  /* :disabled matches inside a <fieldset disabled> too, so a whole group looks disabled. */
  .checkbox:has(> [data-slot="box"]:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* With more contrast, the border is drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .checkbox,
    .checkbox:hover {
      --checkbox--box--border-color: currentColor;
    }
  }

  /* Forced colors mode keeps borders but drops backgrounds and shadows, so mark the
     checked box and its states with system colours. */
  @media (forced-colors: active) {
    .checkbox > [data-slot="box"]:is(:checked, :indeterminate) {
      --checkbox--box--border-color: Highlight;
      background-color: Highlight;
    }
    .checkbox > [data-slot="indicator"] {
      color: HighlightText;
    }
    .checkbox > [data-slot="box"][aria-readonly="true"] {
      --checkbox--box--border-color: CanvasText;
      background-color: transparent;
    }
    .checkbox > [data-slot="box"][aria-readonly="true"] + [data-slot="indicator"] {
      color: CanvasText;
    }
    .checkbox > [data-slot="box"]:focus-visible {
      outline-color: Highlight;
    }
    .checkbox:has(> [data-slot="box"]:disabled) {
      color: GrayText;
      opacity: 1;
    }
    .checkbox > [data-slot="box"]:disabled {
      --checkbox--box--border-color: GrayText;
    }
    .checkbox > [data-slot="box"]:disabled:is(:checked, :indeterminate) {
      background-color: GrayText;
    }
    .checkbox > [data-slot="box"]:disabled + [data-slot="indicator"] {
      color: Canvas;
    }
  }
}
</style>
```

```ts [Checkbox.test.ts]
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import Checkbox from "./Checkbox.vue";

const terms = () => "I agree to the terms";

describe("Checkbox", () => {
  it("is a native checkbox, named by the label it wraps, and nothing else", () => {
    render(Checkbox, { slots: { default: terms } });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    expect(checkbox.tagName).toBe("INPUT");
    expect(checkbox).toHaveAttribute("type", "checkbox");
    expect(checkbox.closest("label")).toHaveClass("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("toggles when its label is clicked", async () => {
    const user = userEvent.setup();
    render(Checkbox, { slots: { default: terms } });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    await user.click(screen.getByText("I agree to the terms"));
    expect(checkbox).toBeChecked();
    await user.click(screen.getByText("I agree to the terms"));
    expect(checkbox).not.toBeChecked();
  });

  it("is reached with Tab and toggled with Space, but not with Enter", async () => {
    const user = userEvent.setup();
    render(Checkbox, { slots: { default: terms } });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    await user.tab();
    expect(checkbox).toHaveFocus();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
    await user.keyboard("{Enter}");
    expect(checkbox).toBeChecked();
    await user.keyboard(" ");
    expect(checkbox).not.toBeChecked();
  });

  it("is mixed while indeterminate, set as a property rather than an attribute, and clears on the first click", async () => {
    const user = userEvent.setup();
    const mixed = ref(true);
    render({
      render: () => [
        h(
          Checkbox,
          { indeterminate: mixed.value, "onUpdate:indeterminate": (value: boolean) => (mixed.value = value) },
          () => "Bound",
        ),
        h(Checkbox, { indeterminate: true }, () => "Unbound"),
      ],
    });

    for (const name of ["Bound", "Unbound"]) {
      const checkbox = screen.getByRole<HTMLInputElement>("checkbox", { name });
      expect(checkbox).toBePartiallyChecked();
      expect(checkbox.indeterminate).toBe(true);
      expect(checkbox).not.toHaveAttribute("indeterminate");

      await user.click(checkbox);
      await nextTick();
      expect(checkbox).not.toBePartiallyChecked();
      expect(checkbox).toBeChecked();
    }
    expect(mixed.value).toBe(false);

    // Worked out again from the options it stands for, it follows them after the first render too.
    const bound = screen.getByRole<HTMLInputElement>("checkbox", { name: "Bound" });
    mixed.value = true;
    await nextTick();
    expect(bound.indeterminate).toBe(true);
    expect(bound).toBePartiallyChecked();
    mixed.value = false;
    await nextTick();
    expect(bound.indeterminate).toBe(false);
    expect(bound).not.toBePartiallyChecked();
  });

  it("puts attributes, listeners and refs on the input, and classes on its root", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const instance = ref<ComponentPublicInstance<{ input: HTMLInputElement }>>();
    render({
      render: () =>
        h(Checkbox, { ref: instance, id: "updates", class: "updates", name: "updates", value: "weekly", onChange }, terms),
    });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("id", "updates");
    expect(checkbox).toHaveAttribute("name", "updates");
    expect(checkbox).not.toHaveClass("updates");
    expect(checkbox.closest("label")).toHaveClass("checkbox", "updates");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(instance.value?.input).toBe(checkbox);
  });

  it("is submitted with its form by its name and value while checked, and not at all while unchecked", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () =>
        h("form", [
          h(Checkbox, { name: "updates", value: "weekly" }, () => "Weekly updates"),
          h(Checkbox, { name: "terms" }, terms),
        ]),
    });

    const form = container.querySelector("form")!;
    expect([...new FormData(form)]).toEqual([]);
    await user.click(screen.getByRole("checkbox", { name: "Weekly updates" }));
    await user.click(screen.getByRole("checkbox", { name: "I agree to the terms" }));
    // Without a value, a checked box is sent as "on".
    expect([...new FormData(form)]).toEqual([
      ["updates", "weekly"],
      ["terms", "on"],
    ]);
  });

  it("binds checked with v-model, or keeps its own state without it, starting from checked", async () => {
    const user = userEvent.setup();
    const agreed = ref(false);
    const seen: boolean[] = [];
    render({
      render: () => [
        h(
          Checkbox,
          {
            checked: agreed.value,
            "onUpdate:checked": (value: boolean) => (agreed.value = value),
            onChange: () => seen.push(agreed.value),
          },
          () => "Bound",
        ),
        h(Checkbox, { checked: true }, () => "Unbound"),
      ],
    });

    const bound = screen.getByRole("checkbox", { name: "Bound" });
    await user.click(bound);
    expect(agreed.value).toBe(true);
    // A change listener of yours already sees the new state.
    expect(seen).toEqual([true]);
    agreed.value = false;
    await nextTick();
    expect(bound).not.toBeChecked();

    const unbound = screen.getByRole("checkbox", { name: "Unbound" });
    expect(unbound).toBeChecked();
    await user.click(unbound);
    expect(unbound).not.toBeChecked();
  });

  it("keeps showing the state you hold when a bound change isn't taken", async () => {
    const user = userEvent.setup();
    const onChecked = vi.fn();
    const onIndeterminate = vi.fn();
    render({
      render: () => [
        h(Checkbox, { checked: true, "onUpdate:checked": onChecked }, () => "Email"),
        h(Checkbox, { indeterminate: true, "onUpdate:indeterminate": onIndeterminate }, () => "Select all"),
      ],
    });

    const email = screen.getByRole("checkbox", { name: "Email" });
    await user.click(email);
    expect(onChecked).toHaveBeenCalledWith(false);
    await nextTick();
    expect(email).toBeChecked();

    const all = screen.getByRole("checkbox", { name: "Select all" });
    await user.click(all);
    expect(onIndeterminate).toHaveBeenCalledWith(false);
    await nextTick();
    expect(all).toBePartiallyChecked();
  });

  it("passes required, aria-invalid and its error message to the input", () => {
    render({
      render: () => [
        h(Checkbox, { required: true, "aria-invalid": "true", "aria-describedby": "terms-error" }, terms),
        h("p", { id: "terms-error" }, "Agree to the terms to create an account"),
      ],
    });

    const checkbox = screen.getByRole("checkbox", { name: "I agree to the terms" });
    expect(checkbox).toBeRequired();
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAccessibleDescription("Agree to the terms to create an account");
  });

  it("can't be focused, toggled or submitted while disabled, or inside a disabled fieldset", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () =>
        h("form", [
          h(Checkbox, { name: "terms", checked: true, disabled: true }, terms),
          h("fieldset", { disabled: true }, [h(Checkbox, { name: "updates" }, () => "Weekly updates")]),
        ]),
    });

    const own = screen.getByRole("checkbox", { name: "I agree to the terms" });
    const grouped = screen.getByRole("checkbox", { name: "Weekly updates" });
    await user.tab();
    await user.click(own);
    await user.click(screen.getByText("Weekly updates"));
    expect(own).toBeDisabled();
    expect(grouped).toBeDisabled();
    expect(document.body).toHaveFocus();
    expect(own).toBeChecked();
    expect(grouped).not.toBeChecked();
    expect([...new FormData(container.querySelector("form")!)]).toEqual([]);
  });

  it("can be focused and submitted while read-only, but a click, its label or Space never toggle it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onUpdate = vi.fn();
    const { container } = render({
      render: () =>
        h("form", [
          h(
            Checkbox,
            { name: "updates", checked: true, readonly: true, onChange, "onUpdate:checked": onUpdate },
            () => "Email me updates",
          ),
          h(Checkbox, { name: "all", indeterminate: true, readonly: true }, () => "Select all"),
        ]),
    });

    const updates = screen.getByRole("checkbox", { name: "Email me updates" });
    const all = screen.getByRole("checkbox", { name: "Select all" });
    expect(updates).toHaveAttribute("aria-readonly", "true");
    // HTML ignores readonly on a checkbox, so it's never set.
    expect(updates).not.toHaveAttribute("readonly");

    await user.tab();
    expect(updates).toHaveFocus();
    await user.keyboard(" ");
    await user.click(updates);
    await user.click(screen.getByText("Email me updates"));
    expect(updates).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();

    await user.click(all);
    expect(all).toBePartiallyChecked();
    expect([...new FormData(container.querySelector("form")!)]).toEqual([["updates", "on"]]);
  });

  it("mirrors its size as a data attribute, and hides its indicator from assistive technologies", () => {
    const { container } = render(Checkbox, { props: { size: "lg" }, slots: { default: terms } });

    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
    expect(container.querySelector('[data-slot="indicator"]')).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const options = { slots: { default: terms } };
    const first = render(Checkbox, options).container.innerHTML;
    const { container, rerender } = render(Checkbox, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["box", "indicator", "label"]);

    const input = root.querySelector("input");
    await rerender({ checked: true, indeterminate: true, disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect(root.querySelector("input")).toBe(input);
    expect(parts()).toEqual(["box", "indicator", "label"]);
  });

  it("warns in development when it has no label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Checkbox);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render(Checkbox, { slots: { default: terms } });
    render(Checkbox, { attrs: { "aria-label": "Select Ada Lovelace" } });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
```
:::
::

## FAQ

#### Checkbox or something else?

A Checkbox says yes or no to one thing. For anything else, another component will do a better job:

| When people need to…                                             | Use                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------ |
| Say yes or no to one thing, like agreeing to the terms           | Checkbox                                                     |
| Pick any number of options out of a few                          | [Checkbox Group](/docs/components/checkbox-group)            |
| Flip a setting that takes effect right away, like Wi-Fi          | [Switch](/docs/components/switch)                            |
| Pick one option out of a few                                     | Radio Group                                                  |
| Pick one option, or several, out of many                         | Select, or Combobox                                          |
| Select rows in a table                                           | A Checkbox in each row, with an `aria-label`                 |

The Radio Group, the Select and the Combobox are on our [Roadmap](/docs/getting-started/roadmap), and they'll share the Checkbox's sizes, states and rules for labels and errors.

::accordion
:::accordion-item{label="Why does the Checkbox render its own label, when the Input doesn't?"}
Because a checkbox and its label always sit together, box first, and a press on the text is expected to toggle the box. Wrapping both in one `<label>` does that without an ID, and keeps the text and the box from drifting apart. An input's label, on the other hand, goes above it, below it or beside it depending on the layout, so the Input leaves it out. Hints and error messages stay outside the Checkbox, as they do for the Input, since text inside the `<label>` would become part of the name.
:::

:::accordion-item{label="Can I make a checkbox look like a toggle switch?"}
We'd rather you didn't. A switch tells people that something happens the moment they flip it, while a checkbox tells them they can change their mind until they submit. Pick the component that matches what happens, and the look follows. The [Switch](/docs/components/switch) has the `switch` role, and rules of its own for what it announces.
:::

:::accordion-item{label="Why does an unchecked checkbox send nothing?"}
That's how HTML has always sent forms: a checkbox is either in the data, with its `value`, or it isn't. It's a common source of bugs when the server expects a `false`. Treat a missing name as "no" when you read the form, and if your server can't, send the value from your own state, as you would with a bound `checked`.
:::

:::accordion-item{label="Can I put a link in a checkbox's label?"}
It's best not to. The link's text becomes part of the checkbox's name, so screen readers read it twice, once in the name and once as a link, and on a phone, a tap meant for the box can open the link instead. Put the link in the hint below the checkbox, or in the sentence right before it, like "Read our terms" above "I agree to the terms".
:::

:::accordion-item{label="Does the Checkbox work before JavaScript loads?"}
Yes, as far as HTML can take it. The server renders a real `<input type="checkbox">` inside its `<label>`, so even before the page hydrates, people can check it, a press on the label toggles it, and its form sends it. Only two things have to wait. The indeterminate state is a property that only JavaScript can set, and a read-only box needs a script to cancel its clicks, so until then people can toggle it. If a read-only value matters, check on the server that it hasn't changed, as you would for any value a form sends.
:::
::

## Sources

- [HTML Standard: the checkbox state](https://html.spec.whatwg.org/multipage/input.html#checkbox-state-%28type%3Dcheckbox%29), [the label element](https://html.spec.whatwg.org/multipage/forms.html#the-label-element), [implicit submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission) and [constructing the form data set](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set), for indeterminate, labels, `Enter` and what a form sends
- [WAI-ARIA Authoring Practices Guide: Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), for the keyboard and the mixed state
- [WAI-ARIA 1.2: aria-readonly](https://www.w3.org/TR/wai-aria-1.2/#aria-readonly) and the HTML Standard's [readonly attribute](https://html.spec.whatwg.org/multipage/input.html#the-readonly-attribute), which doesn't apply to checkboxes, for the read-only state
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), for the box, its fill and its check
- [Understanding SC 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), for the hit area and the spacing exception
- [GOV.UK Design System: Checkboxes](https://design-system.service.gov.uk/components/checkboxes/), for positive labels, large hit areas and error messages
- [Primer: Checkbox](https://primer.style/product/components/checkbox/), for the indeterminate state and its look
- [Base UI: Checkbox](https://base-ui.com/react/components/checkbox), for a controlled and an uncontrolled checked state
