---
title: Checkbox Group
description: How to build a group of checkboxes that people can pick any number of options from, that's named by its question, that says when they need to pick one, and that agents can check.
navigation:
  icon: i-lucide-list-checks
---

Checkbox groups let people pick any number of options from a short list, like the emails they'd like to get, or the days they're free. Each box on its own is a [Checkbox](/docs/components/checkbox), and what goes wrong is usually what holds them together. Think of boxes that a screen reader announces one by one, without the question they answer, a "Select all" box that stays unchecked when every option is checked, or a form that says "This field is required" until you've checked every single box.

This page walks you through building one the right way. We'll look at:
- **User Interface** (UI) - how a checkbox group looks
- **User Experience** (UX) - how it behaves for every person and every input
- **Developer Experience** (DX) - how developers work with it
- **Agentic Experience** (AX) - how agents can read and verify it

Every example on this page runs on our [reference implementation](/docs/components/checkbox-group#reference-implementation), which does its part of every rule in the [checklist](/docs/components/checkbox-group#checklist), so feel free to check and uncheck them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Checkbox Group with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/checkbox-group#deterministic).

The Checkbox Group is a `<fieldset>` of Checkboxes, so every rule on the [Checkbox](/docs/components/checkbox#checklist) page holds for each of its boxes, and this page covers what a group adds on top. Its hint and error message are elements of their own, which you link to it by ID, like the [Input](/docs/components/input)'s.

::checkbox-group-playground
::

## At a glance

| Aspect      | Checkbox Group                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Element     | `<fieldset>`, with a `<legend>` and a [Checkbox](/docs/components/checkbox) for each option      |
| Role        | `group`, holding a `checkbox` for each option                                                    |
| Name        | The text of its `<legend>`                                                                       |
| Description | Its hint and its error message, linked with `aria-describedby`                                   |
| Value       | A list of the checked options' values, sent with one shared `name`                               |
| Keyboard    | `Tab` reaches each checkbox in turn and `Space` checks or unchecks it, with no arrow keys        |
| States      | Disabled and invalid, along with each checkbox's own, and a select-all box that can be mixed     |
| Sizes       | `xs`, `sm`, `md`, `lg` and `xl`, the same as the Checkbox's                                      |
| Orientation | `vertical`, the default, or `horizontal` for two or three short options                          |
| Pattern     | [WAI-ARIA APG Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), with its [mixed-state example](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/), and the HTML [`<fieldset>`](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element) |
| WCAG 2.2    | 1.3.1, 1.4.10, 2.1.1, 3.3.1, 3.3.2, 3.3.3 and 4.1.2, among others                                |

## User Interface (UI)

Let's start with how a checkbox group looks: its parts, its sizes, its orientation and how it shows each of its states.

### Anatomy

::checkbox-group-anatomy
1. **Group** — The `<fieldset>`, which holds the legend and every checkbox, and carries the size and orientation.
2. **Legend** — The `<legend>`, its first child, which names the group, usually with a question.
3. **Select all** — Optional. A Checkbox that checks or clears every option, and shows whether all, some or none are checked.
4. **Options** — A Checkbox for each option, which all share one `name`.
5. **Hint and error** — Optional. Paragraphs of their own, after the group, which its `<fieldset>` points to by their `id`.
::

Every group has a legend and its options. The select-all box is only there when you ask for one, and its options then sit in from it, so they read as its children. The hint and the error message sit outside the group, in the page, and its `<fieldset>` points to them by their `id`. The parts always render in the same order, which you can see in the [DOM contract](/docs/components/checkbox-group#deterministic).

### Sizes

The `size` prop sets the size of every checkbox in the group, and of its legend, and `md` is the default. The names are the same as the [Checkbox](/docs/components/checkbox#sizes)'s, so a group reads at the same size as the inputs and buttons next to it.

::checkbox-group-sizes-example
::framework-switcher
#react
```tsx
<CheckboxGroup size="xs" name="emails" options={emails}>Which emails would you like?</CheckboxGroup>
{/* …sm, md, lg, xl */}
```

#vue
```vue
<CheckboxGroup size="xs" name="emails" :options="emails">Which emails would you like?</CheckboxGroup>
<!-- …sm, md, lg, xl -->
```

#svelte
```svelte
<CheckboxGroup size="xs" name="emails" options={emails}>Which emails would you like?</CheckboxGroup>
<!-- …sm, md, lg, xl -->
```

#angular
```angular-html
<fieldset appCheckboxGroup size="xs" name="emails" [options]="emails">
  <legend>Which emails would you like?</legend>
</fieldset>
<!-- …sm, md, lg, xl -->
```

#solid
```tsx
<CheckboxGroup size="xs" name="emails" options={emails}>Which emails would you like?</CheckboxGroup>
{/* …sm, md, lg, xl */}
```

#astro
```astro
<CheckboxGroup size="xs" name="emails" options={emails}>Which emails would you like?</CheckboxGroup>
<!-- …sm, md, lg, xl -->
```

#vanilla
```html
<fieldset class="checkbox-group" data-size="xs" data-orientation="vertical">
  <legend data-slot="legend">Which emails would you like?</legend>
  <div data-slot="options">
    <label class="checkbox" data-size="xs">
      <input data-slot="box" type="checkbox" name="emails" value="news" />
      <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
      <span data-slot="label">Product news</span>
    </label>
    <!-- …a Checkbox for each option, at the same size -->
  </div>
</fieldset>
<!-- …sm, md, lg, xl -->
```
::
::

| Size | Legend | Options' text | Indent under select all |
| ---- | ------ | ------------- | ----------------------- |
| `xs` | 12px   | 12px          | 20px                    |
| `sm` | 14px   | 14px          | 24px                    |
| `md` | 14px   | 14px          | 26px                    |
| `lg` | 16px   | 16px          | 28px                    |
| `xl` | 16px   | 16px          | 34px                    |

Sizes are set in `rem`, and the table shows the values we recommend at the default text size of 16px. The legend is the same size as its options' text, in a heavier weight, so it reads as their heading without shouting over the rest of the form. The indent is the select-all box's width plus its gap, so each option's box lines up with the select-all box's label. Each checkbox keeps its 24 × 24px hit area at every size (see the Checkbox's [Sizes](/docs/components/checkbox#sizes)).

### Orientation

Options run in a column by default, one per line, and `orientation="horizontal"` puts them in a row, which wraps onto the next line when it runs out of room.

::checkbox-group-orientation-example
::framework-switcher
#react
```tsx
<CheckboxGroup name="emails" options={emails}>Which emails would you like?</CheckboxGroup>
<CheckboxGroup name="contact" options={contact} orientation="horizontal">How can we reach you?</CheckboxGroup>
```

#vue
```vue
<CheckboxGroup name="emails" :options="emails">Which emails would you like?</CheckboxGroup>
<CheckboxGroup name="contact" :options="contact" orientation="horizontal">How can we reach you?</CheckboxGroup>
```

#svelte
```svelte
<CheckboxGroup name="emails" options={emails}>Which emails would you like?</CheckboxGroup>
<CheckboxGroup name="contact" options={contact} orientation="horizontal">How can we reach you?</CheckboxGroup>
```

#angular
```angular-html
<fieldset appCheckboxGroup name="emails" [options]="emails">
  <legend>Which emails would you like?</legend>
</fieldset>
<fieldset appCheckboxGroup name="contact" [options]="contact" orientation="horizontal">
  <legend>How can we reach you?</legend>
</fieldset>
```

#solid
```tsx
<CheckboxGroup name="emails" options={emails}>Which emails would you like?</CheckboxGroup>
<CheckboxGroup name="contact" options={contact} orientation="horizontal">How can we reach you?</CheckboxGroup>
```

#astro
```astro
<CheckboxGroup name="emails" options={emails}>Which emails would you like?</CheckboxGroup>
<CheckboxGroup name="contact" options={contact} orientation="horizontal">How can we reach you?</CheckboxGroup>
```

#vanilla
```html
<fieldset class="checkbox-group" data-size="md" data-orientation="vertical">
  <legend data-slot="legend">Which emails would you like?</legend>
  <div data-slot="options">…</div>
</fieldset>
<fieldset class="checkbox-group" data-size="md" data-orientation="horizontal">
  <legend data-slot="legend">How can we reach you?</legend>
  <div data-slot="options">…</div>
</fieldset>
```
::
::

We recommend the column for almost every group, which is why it's the default. Every label starts at the same edge, so people can scan down the list without hunting for where the next option begins, and every box sits right next to its own label, so nobody wonders whether a box belongs to the label on its left or on its right. A long label wraps under itself rather than pushing the next option onto another line, and the column still works on a narrow phone and at 200% zoom ([WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)). Keep the row for two or three options with short labels, like "Email", "Phone" and "Post".

### States

Each checkbox shows its own states, as on the [Checkbox](/docs/components/checkbox#states) page. On top of those, the group can be disabled or invalid as a whole, and a select-all box shows whether all, some or none of its options are checked.

::checkbox-group-states-example
::framework-switcher
#react
```tsx
<CheckboxGroup name="emails" options={emails} defaultValue={["news"]}>Which emails would you like?</CheckboxGroup>

<CheckboxGroup name="emails" options={emails} defaultValue={["news"]} selectAll="All emails">
  Which emails would you like?
</CheckboxGroup>

<CheckboxGroup name="emails" options={emails} defaultValue={["news"]} disabled>Which emails would you like?</CheckboxGroup>

<CheckboxGroup name="emails" options={emails} aria-invalid="true" aria-describedby="emails-error">
  Which emails would you like?
</CheckboxGroup>
<p id="emails-error">Pick at least one email to sign up for</p>
```

#vue
```vue
<CheckboxGroup name="emails" :options="emails" :value="['news']">Which emails would you like?</CheckboxGroup>

<CheckboxGroup name="emails" :options="emails" :value="['news']" select-all="All emails">
  Which emails would you like?
</CheckboxGroup>

<CheckboxGroup name="emails" :options="emails" :value="['news']" disabled>Which emails would you like?</CheckboxGroup>

<CheckboxGroup name="emails" :options="emails" aria-invalid="true" aria-describedby="emails-error">
  Which emails would you like?
</CheckboxGroup>
<p id="emails-error">Pick at least one email to sign up for</p>
```

#svelte
```svelte
<CheckboxGroup name="emails" options={emails} value={["news"]}>Which emails would you like?</CheckboxGroup>

<CheckboxGroup name="emails" options={emails} value={["news"]} selectAll="All emails">
  Which emails would you like?
</CheckboxGroup>

<CheckboxGroup name="emails" options={emails} value={["news"]} disabled>Which emails would you like?</CheckboxGroup>

<CheckboxGroup name="emails" options={emails} aria-invalid="true" aria-describedby="emails-error">
  Which emails would you like?
</CheckboxGroup>
<p id="emails-error">Pick at least one email to sign up for</p>
```

#angular
```angular-html
<fieldset appCheckboxGroup name="emails" [options]="emails" [value]="['news']">
  <legend>Which emails would you like?</legend>
</fieldset>

<fieldset appCheckboxGroup name="emails" [options]="emails" [value]="['news']" selectAll="All emails">
  <legend>Which emails would you like?</legend>
</fieldset>

<fieldset appCheckboxGroup name="emails" [options]="emails" [value]="['news']" disabled>
  <legend>Which emails would you like?</legend>
</fieldset>

<fieldset appCheckboxGroup name="emails" [options]="emails" aria-invalid="true" aria-describedby="emails-error">
  <legend>Which emails would you like?</legend>
</fieldset>
<p id="emails-error">Pick at least one email to sign up for</p>
```

#solid
```tsx
<CheckboxGroup name="emails" options={emails} value={["news"]}>Which emails would you like?</CheckboxGroup>

<CheckboxGroup name="emails" options={emails} value={["news"]} selectAll="All emails">
  Which emails would you like?
</CheckboxGroup>

<CheckboxGroup name="emails" options={emails} value={["news"]} disabled>Which emails would you like?</CheckboxGroup>

<CheckboxGroup name="emails" options={emails} aria-invalid="true" aria-describedby="emails-error">
  Which emails would you like?
</CheckboxGroup>
<p id="emails-error">Pick at least one email to sign up for</p>
```

#astro
```astro
<CheckboxGroup name="emails" options={emails} value={["news"]}>Which emails would you like?</CheckboxGroup>

<CheckboxGroup name="emails" options={emails} value={["news"]} selectAll="All emails">
  Which emails would you like?
</CheckboxGroup>

<CheckboxGroup name="emails" options={emails} value={["news"]} disabled>Which emails would you like?</CheckboxGroup>

<CheckboxGroup name="emails" options={emails} aria-invalid="true" aria-describedby="emails-error">
  Which emails would you like?
</CheckboxGroup>
<p id="emails-error">Pick at least one email to sign up for</p>

<!-- A script keeps the select-all box in step, as under Select all. -->
```

#vanilla
```html
<fieldset class="checkbox-group" data-size="md" data-orientation="vertical">
  <legend data-slot="legend">Which emails would you like?</legend>
  <div data-slot="options">
    <label class="checkbox" data-size="md">
      <input data-slot="box" type="checkbox" name="emails" value="news" checked />
      <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
      <span data-slot="label">Product news</span>
    </label>
    <!-- …tips, events -->
  </div>
</fieldset>

<fieldset class="checkbox-group" data-size="md" data-orientation="vertical">
  <legend data-slot="legend">Which emails would you like?</legend>
  <div data-slot="select-all">
    <label class="checkbox" data-size="md">
      <input data-slot="box" type="checkbox" />
      <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
      <span data-slot="label">All emails</span>
    </label>
  </div>
  <div data-slot="options">…</div>
</fieldset>

<fieldset class="checkbox-group" data-size="md" data-orientation="vertical" disabled>
  <legend data-slot="legend">Which emails would you like?</legend>
  <div data-slot="options">…</div>
</fieldset>

<fieldset
  class="checkbox-group"
  data-size="md"
  data-orientation="vertical"
  aria-invalid="true"
  aria-describedby="emails-error"
>
  <legend data-slot="legend">Which emails would you like?</legend>
  <div data-slot="options">
    <label class="checkbox" data-size="md">
      <input data-slot="box" type="checkbox" name="emails" value="news" aria-invalid="true" />
      <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
      <span data-slot="label">Product news</span>
    </label>
    <!-- …tips, events, each with aria-invalid -->
  </div>
</fieldset>
<p id="emails-error">Pick at least one email to sign up for</p>

<!-- A script keeps the select-all box in step, as under Select all. -->
```
::
::

| State      | Selector                                            | Recommended look                                                     |
| ---------- | --------------------------------------------------- | -------------------------------------------------------------------- |
| Disabled   | `:disabled`, which a `<fieldset disabled>` matches  | The legend at 50% opacity, and every checkbox looks disabled         |
| Invalid    | `[aria-invalid="true"]`, which each option gets too | Each option's box with the Checkbox's invalid border                 |
| Select all | Its `<input>`'s `:checked` and `:indeterminate`     | The Checkbox's check, or its dash while only some options are checked |

The group draws no state of its own on the boxes. A disabled `<fieldset>` disables every checkbox inside it, and each one looks disabled from `:disabled`, as it would on its own. An invalid group passes `aria-invalid` on to its options, so each box shows the Checkbox's invalid border, and the error message says what's wrong in words, since a red border alone can't ([WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)). None of the states change the group's size or position. You'll find how each state behaves under [Every state](/docs/components/checkbox-group#every-state).

### Tokens

The group itself reads one [theme token](/docs/foundations/design-tokens#theme-tokens), and each of its checkboxes reads the Checkbox's [own five](/docs/components/checkbox#tokens):

| Token                   | Used for                                              |
| ----------------------- | ----------------------------------------------------- |
| `--color--neutral-text` | The legend, which needs 4.5:1 against the page, like any text |

The legend is drawn in the same colour as the checkboxes' labels, so it has the same contrast as they do: 4.5:1 or more against the page with our reference tokens ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)). You'll find the tokens themselves in the Button's [`tokens.css`](/docs/components/button#reference-implementation), which you can copy into your theme.

If you need to tune a group, you can set its [own variables](/docs/foundations/design-tokens#component-variables), such as `--checkbox-group--row-gap` or `--checkbox-group--legend--font-size`, from a class. Each box sets the [Checkbox's variables](/docs/components/checkbox#tokens) on itself, so a value on the group doesn't reach them. Set those from the same class with a descendant selector, like `.brand .checkbox`, written so that your framework's style scoping lets it through to the boxes, which the group renders: `:global()` in CSS Modules, Svelte and Astro, `:deep()` in Vue and `::ng-deep` in Angular, as below. The Checkbox Group's styles sit in the `components` cascade layer, so your class wins without any specificity tricks:

::framework-switcher
#react
```tsx [Emails.tsx]
import styles from "./Emails.module.css";

export function Emails() {
  return (
    <CheckboxGroup name="emails" options={emails} className={styles.brand}>
      Which emails would you like?
    </CheckboxGroup>
  );
}
```
```css [Emails.module.css]
.brand {
  --checkbox-group--row-gap: 0.75rem;
}
/* The boxes' own class isn't this module's, so it stays global. */
.brand :global(.checkbox) {
  --checkbox--box--radius: 0;
}
```

#vue
```vue
<template>
  <CheckboxGroup name="emails" :options="emails" class="brand">Which emails would you like?</CheckboxGroup>
</template>

<style scoped>
.brand {
  --checkbox-group--row-gap: 0.75rem;
}
/* The boxes are the CheckboxGroup's, which this component's scoped styles only reach with :deep(). */
.brand :deep(.checkbox) {
  --checkbox--box--radius: 0;
}
</style>
```

#svelte
```svelte
<CheckboxGroup name="emails" options={emails} class="brand">Which emails would you like?</CheckboxGroup>

<style>
  /* The class lands on the CheckboxGroup's own element, which this component's scoped styles don't reach. */
  :global(.brand) {
    --checkbox-group--row-gap: 0.75rem;
  }
  :global(.brand .checkbox) {
    --checkbox--box--radius: 0;
  }
</style>
```

#angular
```angular-ts
@Component({
  selector: "app-emails",
  imports: [CheckboxGroup],
  template: `
    <fieldset appCheckboxGroup name="emails" [options]="emails" class="brand">
      <legend>Which emails would you like?</legend>
    </fieldset>
  `,
  styles: `
    .brand {
      --checkbox-group--row-gap: 0.75rem;
    }
    /* The boxes are in the CheckboxGroup's view, which this component's styles only reach with ::ng-deep. */
    .brand ::ng-deep .checkbox {
      --checkbox--box--radius: 0;
    }
  `,
})
export class Emails {
  emails = emails;
}
```

#solid
```tsx [Emails.tsx]
import styles from "./Emails.module.css";

export function Emails() {
  return (
    <CheckboxGroup name="emails" options={emails} class={styles.brand}>
      Which emails would you like?
    </CheckboxGroup>
  );
}
```
```css [Emails.module.css]
.brand {
  --checkbox-group--row-gap: 0.75rem;
}
/* The boxes' own class isn't this module's, so it stays global. */
.brand :global(.checkbox) {
  --checkbox--box--radius: 0;
}
```

#astro
```astro
<CheckboxGroup name="emails" options={emails} class="brand">Which emails would you like?</CheckboxGroup>

<style>
  .brand {
    --checkbox-group--row-gap: 0.75rem;
  }
  /* The boxes are the CheckboxGroup's, which this component's scoped styles only reach with :global(). */
  .brand :global(.checkbox) {
    --checkbox--box--radius: 0;
  }
</style>
```

#vanilla
```html
<fieldset class="checkbox-group brand" data-size="md" data-orientation="vertical">
  <legend data-slot="legend">Which emails would you like?</legend>
  <div data-slot="options">…</div>
</fieldset>

<style>
  .brand {
    --checkbox-group--row-gap: 0.75rem;
  }
  .brand .checkbox {
    --checkbox--box--radius: 0;
  }
</style>
```
::

## User Experience (UX)

Now let's look at how a checkbox group behaves for every person, input and setting. A good checkbox group is [accessible](/docs/components/checkbox-group#accessible), [predictable](/docs/components/checkbox-group#predictable), designed in [every state](/docs/components/checkbox-group#every-state) and [adaptive](/docs/components/checkbox-group#adaptive).

### Accessible

#### Use a fieldset and a legend

A `<fieldset>` gives you the `group` role and `disabled` for every control inside it, and a `<legend>` as its first child gives the group its name, all for free. Screen readers announce the legend as people move into the group, so they hear "Which emails would you like?" before "Product news, checkbox, not checked", rather than a list of boxes with no question. A `<div>` with a paragraph above it only looks like a group, and a `<div role="group">` still needs `aria-labelledby` to be named, and can't disable anything.

::framework-switcher
#react
```tsx
{/* Do: the legend names the group, and screen readers announce it with each box */}
<fieldset>
  <legend>Which emails would you like?</legend>
  <label><input type="checkbox" name="emails" value="news" /> Product news</label>
  <label><input type="checkbox" name="emails" value="tips" /> Tips and guides</label>
</fieldset>

{/* Don't: the question is just a paragraph, so the boxes are announced without it */}
<div>
  <p>Which emails would you like?</p>
  <label><input type="checkbox" name="news" /> Product news</label>
  <label><input type="checkbox" name="tips" /> Tips and guides</label>
</div>
```

#vue
```vue
<!-- Do: the legend names the group, and screen readers announce it with each box -->
<fieldset>
  <legend>Which emails would you like?</legend>
  <label><input type="checkbox" name="emails" value="news" /> Product news</label>
  <label><input type="checkbox" name="emails" value="tips" /> Tips and guides</label>
</fieldset>

<!-- Don't: the question is just a paragraph, so the boxes are announced without it -->
<div>
  <p>Which emails would you like?</p>
  <label><input type="checkbox" name="news" /> Product news</label>
  <label><input type="checkbox" name="tips" /> Tips and guides</label>
</div>
```

#svelte
```svelte
<!-- Do: the legend names the group, and screen readers announce it with each box -->
<fieldset>
  <legend>Which emails would you like?</legend>
  <label><input type="checkbox" name="emails" value="news" /> Product news</label>
  <label><input type="checkbox" name="emails" value="tips" /> Tips and guides</label>
</fieldset>

<!-- Don't: the question is just a paragraph, so the boxes are announced without it -->
<div>
  <p>Which emails would you like?</p>
  <label><input type="checkbox" name="news" /> Product news</label>
  <label><input type="checkbox" name="tips" /> Tips and guides</label>
</div>
```

#angular
```angular-html
<!-- Do: the legend names the group, and screen readers announce it with each box -->
<fieldset>
  <legend>Which emails would you like?</legend>
  <label><input type="checkbox" name="emails" value="news" /> Product news</label>
  <label><input type="checkbox" name="emails" value="tips" /> Tips and guides</label>
</fieldset>

<!-- Don't: the question is just a paragraph, so the boxes are announced without it -->
<div>
  <p>Which emails would you like?</p>
  <label><input type="checkbox" name="news" /> Product news</label>
  <label><input type="checkbox" name="tips" /> Tips and guides</label>
</div>
```

#solid
```tsx
{/* Do: the legend names the group, and screen readers announce it with each box */}
<fieldset>
  <legend>Which emails would you like?</legend>
  <label><input type="checkbox" name="emails" value="news" /> Product news</label>
  <label><input type="checkbox" name="emails" value="tips" /> Tips and guides</label>
</fieldset>

{/* Don't: the question is just a paragraph, so the boxes are announced without it */}
<div>
  <p>Which emails would you like?</p>
  <label><input type="checkbox" name="news" /> Product news</label>
  <label><input type="checkbox" name="tips" /> Tips and guides</label>
</div>
```

#astro
```astro
<!-- Do: the legend names the group, and screen readers announce it with each box -->
<fieldset>
  <legend>Which emails would you like?</legend>
  <label><input type="checkbox" name="emails" value="news" /> Product news</label>
  <label><input type="checkbox" name="emails" value="tips" /> Tips and guides</label>
</fieldset>

<!-- Don't: the question is just a paragraph, so the boxes are announced without it -->
<div>
  <p>Which emails would you like?</p>
  <label><input type="checkbox" name="news" /> Product news</label>
  <label><input type="checkbox" name="tips" /> Tips and guides</label>
</div>
```

#vanilla
```html
<!-- Do: the legend names the group, and screen readers announce it with each box -->
<fieldset>
  <legend>Which emails would you like?</legend>
  <label><input type="checkbox" name="emails" value="news" /> Product news</label>
  <label><input type="checkbox" name="emails" value="tips" /> Tips and guides</label>
</fieldset>

<!-- Don't: the question is just a paragraph, so the boxes are announced without it -->
<div>
  <p>Which emails would you like?</p>
  <label><input type="checkbox" name="news" /> Product news</label>
  <label><input type="checkbox" name="tips" /> Tips and guides</label>
</div>
```
::

The legend has to be the `<fieldset>`'s first child, which the [HTML Standard](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element) asks for, and which is what names the group. The Checkbox Group renders its legend there for you, and resets the fieldset's border and padding, so it lines up with the rest of your form, without the browser's frame around it.

#### Name and describe the group

The legend says what the options are for, and it's best written as the question they answer, like "Which emails would you like?". It's the group's accessible name, so screen readers read it as people move into the group, voice control users can say it, and tests and agents use it to find the group.

::checkbox-group-hint-example
::framework-switcher
#react
```tsx
<CheckboxGroup name="emails" options={emails} aria-describedby="emails-hint">Which emails would you like?</CheckboxGroup>
<p id="emails-hint">Pick as many as you like. You can stop them at any time.</p>
```

#vue
```vue
<CheckboxGroup name="emails" :options="emails" aria-describedby="emails-hint">Which emails would you like?</CheckboxGroup>
<p id="emails-hint">Pick as many as you like. You can stop them at any time.</p>
```

#svelte
```svelte
<CheckboxGroup name="emails" options={emails} aria-describedby="emails-hint">Which emails would you like?</CheckboxGroup>
<p id="emails-hint">Pick as many as you like. You can stop them at any time.</p>
```

#angular
```angular-html
<fieldset appCheckboxGroup name="emails" [options]="emails" aria-describedby="emails-hint">
  <legend>Which emails would you like?</legend>
</fieldset>
<p id="emails-hint">Pick as many as you like. You can stop them at any time.</p>
```

#solid
```tsx
<CheckboxGroup name="emails" options={emails} aria-describedby="emails-hint">Which emails would you like?</CheckboxGroup>
<p id="emails-hint">Pick as many as you like. You can stop them at any time.</p>
```

#astro
```astro
<CheckboxGroup name="emails" options={emails} aria-describedby="emails-hint">Which emails would you like?</CheckboxGroup>
<p id="emails-hint">Pick as many as you like. You can stop them at any time.</p>
```

#vanilla
```html
<fieldset class="checkbox-group" data-size="md" data-orientation="vertical" aria-describedby="emails-hint">
  <legend data-slot="legend">Which emails would you like?</legend>
  <div data-slot="options">…</div>
</fieldset>
<p id="emails-hint">Pick as many as you like. You can stop them at any time.</p>
```
::
::

- Every group has a visible legend ([WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html), [3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)). Keep it short, since screen readers can repeat it for each box, and put anything longer in the hint.
- A hint, like "Pick as many as you like", goes in the group's description. Keep it out of the legend, so it doesn't become part of the name, and point `aria-describedby` on the group at its `id`, which is what the [APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) asks for a group's descriptive text.
- An error message goes in the description too, after the hint, so the group's `aria-describedby` lists both IDs, the hint's first (see [Pick at least one](/docs/components/checkbox-group#pick-at-least-one)).
- Each option is a Checkbox, so its label follows the Checkbox's rules, from [`checkbox/visible-label`](/docs/components/checkbox#ux-rules) to [`checkbox/positive-label`](/docs/components/checkbox#ux-rules). The options take a value and a label and nothing else, so a hint about one option goes in the group's hint, naming the option it's about.

#### Contrast and size

- The legend needs a contrast of at least 4.5:1 with its background ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)). A disabled group is exempt, but it should still be readable.
- Each box, its focus ring and its hit area follow the Checkbox's [Contrast and size](/docs/components/checkbox#contrast-and-size).
- Stacked options sit 8px apart, so a tap that lands between two of them doesn't toggle the wrong one, and every option keeps its own 24 × 24px hit area ([WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).

### Predictable

#### Keyboard

| Key                       | Checkbox Group                                                        |
| ------------------------- | --------------------------------------------------------------------- |
| `Tab`, `Shift+Tab`        | Moves focus to the next or previous checkbox, select-all box included |
| `Space`                   | Checks or unchecks the focused checkbox                               |
| Arrow keys                | Don't move focus between checkboxes                                   |

Every checkbox in a group is a stop of its own in the tab order, which is what the APG's [mixed-state example](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/) does, and what native checkboxes do. That's different from a Radio Group, where `Tab` reaches the group once and the arrow keys move between its options, because only one of them can be checked. In a checkbox group, people check each box on its own, so each one gets its own stop, and you don't need any roving focus to build one.

#### Select all

A select-all box lets people check or clear every option at once, which saves a lot of clicks in a long list. It's a Checkbox above the options that shows what they add up to: checked when every option is, unchecked when none is, and mixed, with a dash, when only some are. Screen readers announce it as "mixed", or "partially checked", so people know what it stands for before they press it.

::checkbox-group-select-all-example
::framework-switcher
#react
```tsx
const [picked, setPicked] = useState(["news"]);

<CheckboxGroup name="emails" options={emails} value={picked} onValueChange={setPicked} selectAll="All emails">
  Which emails would you like?
</CheckboxGroup>
<p>You'll get {picked.length} of {emails.length}</p>
```

#vue
```vue
<script setup lang="ts">
const picked = ref(["news"]);
</script>

<template>
  <CheckboxGroup v-model:value="picked" name="emails" :options="emails" select-all="All emails">
    Which emails would you like?
  </CheckboxGroup>
  <p>You'll get {{ picked.length }} of {{ emails.length }}</p>
</template>
```

#svelte
```svelte
<script lang="ts">
  let picked = $state(["news"]);
</script>

<CheckboxGroup bind:value={picked} name="emails" options={emails} selectAll="All emails">
  Which emails would you like?
</CheckboxGroup>
<p>You'll get {picked.length} of {emails.length}</p>
```

#angular
```angular-html
<fieldset appCheckboxGroup name="emails" [options]="emails" [(value)]="picked" selectAll="All emails">
  <legend>Which emails would you like?</legend>
</fieldset>
<p>You'll get {{ picked().length }} of {{ emails.length }}</p>
```

#solid
```tsx
const [picked, setPicked] = createSignal(["news"]);

<CheckboxGroup name="emails" options={emails} value={picked()} onValueChange={setPicked} selectAll="All emails">
  Which emails would you like?
</CheckboxGroup>
<p>You'll get {picked().length} of {emails.length}</p>
```

#astro
```astro
<CheckboxGroup name="emails" options={emails} value={["news"]} selectAll="All emails">
  Which emails would you like?
</CheckboxGroup>

<script>
  // Keeps each select-all box in step with its options, and checks or clears them all from it.
  for (const group of document.querySelectorAll(".checkbox-group")) {
    const all = group.querySelector<HTMLInputElement>('[data-slot="select-all"] input');
    if (!all) continue;
    const options = [...group.querySelectorAll<HTMLInputElement>('[data-slot="options"] input')];
    const update = () => {
      const checked = options.filter((option) => option.checked).length;
      all.checked = checked === options.length;
      all.indeterminate = checked > 0 && checked < options.length;
    };
    group.addEventListener("change", (event) => {
      if (event.target === all) for (const option of options) option.checked = all.checked;
      update();
    });
    update();
  }
</script>
```

#vanilla
```html
<fieldset class="checkbox-group" data-size="md" data-orientation="vertical">
  <legend data-slot="legend">Which emails would you like?</legend>
  <div data-slot="select-all">
    <label class="checkbox" data-size="md">
      <input data-slot="box" type="checkbox" />
      <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
      <span data-slot="label">All emails</span>
    </label>
  </div>
  <div data-slot="options">
    <label class="checkbox" data-size="md">
      <input data-slot="box" type="checkbox" name="emails" value="news" checked />
      <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
      <span data-slot="label">Product news</span>
    </label>
    <!-- …tips, events -->
  </div>
</fieldset>

<script type="module">
  // Keeps each select-all box in step with its options, and checks or clears them all from it.
  for (const group of document.querySelectorAll(".checkbox-group")) {
    const all = group.querySelector('[data-slot="select-all"] input');
    if (!all) continue;
    const options = [...group.querySelectorAll('[data-slot="options"] input')];
    const update = () => {
      const checked = options.filter((option) => option.checked).length;
      all.checked = checked === options.length;
      all.indeterminate = checked > 0 && checked < options.length;
    };
    group.addEventListener("change", (event) => {
      if (event.target === all) for (const option of options) option.checked = all.checked;
      update();
    });
    update();
  }
</script>
```
::
::

- Checking it, from unchecked or from mixed, checks every option, and unchecking it clears them all, which is what the [APG](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) asks for. Try it above: check one option, and the box turns mixed, then press it, and every option is checked.
- It doesn't go back to the options people had picked before, the way the APG's own example does as a third step. The APG leaves that up to you, and we leave it out, since a box that does something different on every third press is hard to predict, and it's never clear which earlier selection it'll bring back.
- Its state is worked out from the options every time they change, never kept on its own, so it can't disagree with them, as [`checkbox/derived-mixed`](/docs/components/checkbox#ux-rules) asks.
- It has no `name`, so its form never sends it. It stands for the options, and they're what the form sends.
- Label it with what it selects, like "All emails", rather than "Select all" on its own, so it still makes sense out of context. It's best kept for longer lists, or for lists that people often want all of, since in a group of two or three it's one more box to read.

#### Keep options in a column

People read a checkbox group from top to bottom, one option per line, and that's how the Checkbox Group lays them out unless you ask for a row (see [Orientation](/docs/components/checkbox-group#orientation)). A column keeps each box next to its own label, lets long labels wrap under themselves, and still fits on a phone, which a row of more than a few options doesn't.

Order the options in a way people can predict, like from most to least common, or alphabetically for a long list, and keep the same order every time the group shows up, so people who've used it before find each option where they left it.

### Every state

#### Disabled

`disabled` on the Checkbox Group sets `disabled` on its `<fieldset>`, which disables every checkbox inside it, select-all box included. None of them can be focused, toggled or sent with the form, and each one looks disabled on its own, since the Checkbox's look comes from `:disabled`, which matches inside a `<fieldset disabled>` too (see [`checkbox/disabled-inert`](/docs/components/checkbox#ux-rules)). The legend fades with them, so the whole group reads as one that's out of use.

As with a single checkbox, we recommend disabling as little as you can, since keyboard users can't reach a disabled group to find out why it's disabled ([`checkbox/explain-disabled`](/docs/components/checkbox#ux-rules)). Explain why next to it, or leave the group out until it applies.

#### Pick at least one

Most checkbox groups are optional, since checking nothing is an answer too. Sometimes people have to pick at least one, though, like choosing which emails to sign up for on a page that's only there to sign up. That's a rule about the group, and HTML has no way to say it. `required` on a checkbox means that box has to be checked, so putting it on every box asks people to check them all, and putting it on one box asks for that one in particular. So say it in the hint, check it in your own code when people submit, and report it on the group.

::checkbox-group-validation-example
::framework-switcher
#react
```tsx
import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";

export function SignUp() {
  const [picked, setPicked] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const group = useRef<HTMLFieldSetElement>(null);

  function update(value: string[]) {
    setPicked(value);
    // Picking one fixes the error, so it clears right away.
    if (value.length) setError("");
  }

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!picked.length) {
      // Focus the first box once the error is in the page, so screen readers read it with the group.
      flushSync(() => {
        setError("Pick at least one email to sign up for");
        setStatus("Couldn't sign you up. Pick at least one email.");
      });
      group.current?.querySelector("input")?.focus();
      return;
    }
    await api.signUp(picked);
    setStatus("You're signed up");
  }

  return (
    <form noValidate onSubmit={signUp}>
      <CheckboxGroup
        ref={group}
        name="emails"
        options={emails}
        value={picked}
        onValueChange={update}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "emails-hint emails-error" : "emails-hint"}
      >
        Which emails would you like?
      </CheckboxGroup>
      <p id="emails-hint">Pick at least one.</p>
      {error && <p id="emails-error">{error}</p>}
      <Button type="submit" color="primary">Sign up</Button>
      <p role="status">{status}</p>
    </form>
  );
}
```

#vue
```vue
<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from "vue";

const picked = ref<string[]>([]);
const error = ref("");
const status = ref("");
const group = useTemplateRef("group");

function update(value: string[]) {
  picked.value = value;
  // Picking one fixes the error, so it clears right away.
  if (value.length) error.value = "";
}

async function signUp() {
  if (!picked.value.length) {
    error.value = "Pick at least one email to sign up for";
    status.value = "Couldn't sign you up. Pick at least one email.";
    // Focus the first box once the error is in the page, so screen readers read it with the group.
    await nextTick();
    group.value?.fieldset?.querySelector("input")?.focus();
    return;
  }
  await api.signUp(picked.value);
  status.value = "You're signed up";
}
</script>

<template>
  <form novalidate @submit.prevent="signUp">
    <CheckboxGroup
      ref="group"
      name="emails"
      :options="emails"
      :value="picked"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? 'emails-hint emails-error' : 'emails-hint'"
      @update:value="update"
    >
      Which emails would you like?
    </CheckboxGroup>
    <p id="emails-hint">Pick at least one.</p>
    <p v-if="error" id="emails-error">{{ error }}</p>
    <Button type="submit" color="primary">Sign up</Button>
    <p role="status">{{ status }}</p>
  </form>
</template>
```

#svelte
```svelte
<script lang="ts">
  import { tick } from "svelte";

  let picked = $state<string[]>([]);
  let error = $state("");
  let status = $state("");
  let group = $state<HTMLFieldSetElement>();

  // Picking one fixes the error, so it clears right away.
  $effect(() => {
    if (picked.length) error = "";
  });

  async function signUp(event: SubmitEvent) {
    event.preventDefault();
    if (!picked.length) {
      error = "Pick at least one email to sign up for";
      status = "Couldn't sign you up. Pick at least one email.";
      // Focus the first box once the error is in the page, so screen readers read it with the group.
      await tick();
      group?.querySelector("input")?.focus();
      return;
    }
    await api.signUp(picked);
    status = "You're signed up";
  }
</script>

<form novalidate onsubmit={signUp}>
  <CheckboxGroup
    bind:ref={group}
    bind:value={picked}
    name="emails"
    options={emails}
    aria-invalid={error ? true : undefined}
    aria-describedby={error ? "emails-hint emails-error" : "emails-hint"}
  >
    Which emails would you like?
  </CheckboxGroup>
  <p id="emails-hint">Pick at least one.</p>
  {#if error}<p id="emails-error">{error}</p>{/if}
  <Button type="submit" color="primary">Sign up</Button>
  <p role="status">{status}</p>
</form>
```

#angular
```angular-ts
import { Component, ElementRef, Injector, afterNextRender, inject, signal, viewChild } from "@angular/core";

@Component({
  selector: "app-sign-up",
  imports: [CheckboxGroup, Button],
  template: `
    <form novalidate (submit)="signUp($event)">
      <fieldset
        #group
        appCheckboxGroup
        name="emails"
        [options]="emails"
        [value]="picked()"
        (valueChange)="update($event)"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="error() ? 'emails-hint emails-error' : 'emails-hint'"
      >
        <legend>Which emails would you like?</legend>
      </fieldset>
      <p id="emails-hint">Pick at least one.</p>
      @if (error()) {
        <p id="emails-error">{{ error() }}</p>
      }
      <button appButton type="submit" color="primary">Sign up</button>
      <p role="status">{{ status() }}</p>
    </form>
  `,
})
export class SignUp {
  emails = emails;
  picked = signal<string[]>([]);
  error = signal("");
  status = signal("");
  // On a component's element, a template variable is the component, so read its element instead.
  group = viewChild.required("group", { read: ElementRef<HTMLFieldSetElement> });
  injector = inject(Injector);

  update(value: string[]) {
    this.picked.set(value);
    // Picking one fixes the error, so it clears right away.
    if (value.length) this.error.set("");
  }

  async signUp(event: SubmitEvent) {
    event.preventDefault();
    if (!this.picked().length) {
      this.error.set("Pick at least one email to sign up for");
      this.status.set("Couldn't sign you up. Pick at least one email.");
      // Focus the first box once the error is in the page, so screen readers read it with the group.
      afterNextRender(() => this.group().nativeElement.querySelector("input")?.focus(), { injector: this.injector });
      return;
    }
    await api.signUp(this.picked());
    this.status.set("You're signed up");
  }
}
```

#solid
```tsx
import { Show, createSignal } from "solid-js";

export function SignUp() {
  const [picked, setPicked] = createSignal<string[]>([]);
  const [error, setError] = createSignal("");
  const [status, setStatus] = createSignal("");
  let group!: HTMLFieldSetElement;

  function update(value: string[]) {
    setPicked(value);
    // Picking one fixes the error, so it clears right away.
    if (value.length) setError("");
  }

  async function signUp(event: SubmitEvent) {
    event.preventDefault();
    if (!picked().length) {
      setError("Pick at least one email to sign up for");
      setStatus("Couldn't sign you up. Pick at least one email.");
      // Solid updates the page as soon as a signal changes, so the error is already in it.
      group.querySelector("input")?.focus();
      return;
    }
    await api.signUp(picked());
    setStatus("You're signed up");
  }

  return (
    <form novalidate onSubmit={signUp}>
      <CheckboxGroup
        ref={group}
        name="emails"
        options={emails}
        value={picked()}
        onValueChange={update}
        aria-invalid={error() ? true : undefined}
        aria-describedby={error() ? "emails-hint emails-error" : "emails-hint"}
      >
        Which emails would you like?
      </CheckboxGroup>
      <p id="emails-hint">Pick at least one.</p>
      <Show when={error()}>
        <p id="emails-error">{error()}</p>
      </Show>
      <Button type="submit" color="primary">Sign up</Button>
      <p role="status">{status()}</p>
    </form>
  );
}
```

#astro
```astro
<form id="sign-up" novalidate>
  <CheckboxGroup id="emails" name="emails" options={emails} aria-describedby="emails-hint">
    Which emails would you like?
  </CheckboxGroup>
  <p id="emails-hint">Pick at least one.</p>
  <p id="emails-error" hidden></p>
  <Button type="submit" color="primary">Sign up</Button>
  <p id="status" role="status"></p>
</form>

<script>
  const form = document.querySelector<HTMLFormElement>("#sign-up")!;
  const group = document.querySelector<HTMLFieldSetElement>("#emails")!;
  const boxes = [...group.querySelectorAll<HTMLInputElement>('[data-slot="options"] input')];
  const error = document.querySelector<HTMLElement>("#emails-error")!;
  const status = document.querySelector("#status")!;

  // Shows the error message, or hides it, along with the attributes that tie it to the group.
  function check() {
    const message = boxes.some((box) => box.checked) ? "" : "Pick at least one email to sign up for";
    error.textContent = message;
    error.hidden = !message;
    group.setAttribute("aria-describedby", message ? "emails-hint emails-error" : "emails-hint");
    for (const element of [group, ...boxes]) {
      if (message) element.setAttribute("aria-invalid", "true");
      else element.removeAttribute("aria-invalid");
    }
    return message;
  }

  // Picking one fixes the error, so it clears right away.
  group.addEventListener("change", () => group.hasAttribute("aria-invalid") && check());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (check()) {
      status.textContent = "Couldn't sign you up. Pick at least one email.";
      boxes[0]!.focus();
      return;
    }
    await api.signUp(new FormData(form).getAll("emails"));
    status.textContent = "You're signed up";
  });
</script>
```

#vanilla
```html
<form id="sign-up" novalidate>
  <fieldset
    id="emails"
    class="checkbox-group"
    data-size="md"
    data-orientation="vertical"
    aria-describedby="emails-hint"
  >
    <legend data-slot="legend">Which emails would you like?</legend>
    <div data-slot="options">
      <label class="checkbox" data-size="md">
        <input data-slot="box" type="checkbox" name="emails" value="news" />
        <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
        <span data-slot="label">Product news</span>
      </label>
      <!-- …tips, events -->
    </div>
  </fieldset>
  <p id="emails-hint">Pick at least one.</p>
  <p id="emails-error" hidden></p>
  <button class="button" type="submit" data-variant="solid" data-color="primary" data-size="md">
    <span data-slot="label">Sign up</span>
  </button>
  <p id="status" role="status"></p>
</form>

<script type="module">
  const form = document.querySelector("#sign-up");
  const group = document.querySelector("#emails");
  const boxes = [...group.querySelectorAll('[data-slot="options"] input')];
  const error = document.querySelector("#emails-error");
  const status = document.querySelector("#status");

  // Shows the error message, or hides it, along with the attributes that tie it to the group.
  function check() {
    const message = boxes.some((box) => box.checked) ? "" : "Pick at least one email to sign up for";
    error.textContent = message;
    error.hidden = !message;
    group.setAttribute("aria-describedby", message ? "emails-hint emails-error" : "emails-hint");
    for (const element of [group, ...boxes]) {
      if (message) element.setAttribute("aria-invalid", "true");
      else element.removeAttribute("aria-invalid");
    }
    return message;
  }

  // Picking one fixes the error, so it clears right away.
  group.addEventListener("change", () => group.hasAttribute("aria-invalid") && check());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (check()) {
      status.textContent = "Couldn't sign you up. Pick at least one email.";
      boxes[0].focus();
      return;
    }
    await api.signUp(new FormData(form).getAll("emails"));
    status.textContent = "You're signed up";
  });
</script>
```
::
::

- Say that people need to pick one before they try, in the hint or in the legend, like "Pick at least one" ([WCAG 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)). There's no `required` to announce it for you.
- Check it when people submit, rather than as they move through the boxes, since every box is unchecked until they've picked one. Once the error shows, clear it as soon as they check a box.
- Set `aria-invalid="true"` on the group while its error message shows, and add the message to the group's `aria-describedby`, after the hint ([WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)). The Checkbox Group passes `aria-invalid` on to each option, so every box shows the invalid border and is announced as invalid as people reach it, since not every screen reader reads a group's description when focus moves into it.
- Say what to pick, as in "Pick at least one email to sign up for", rather than "This field is required" ([WCAG 3.3.3](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)).
- When a submit fails, move focus to the group's first checkbox, once the error is in the page, as on the [Checkbox](/docs/components/checkbox#required-and-invalid). The status message says what happened even when the focus doesn't move.
- Put `novalidate` on the form, as on the Checkbox and the Input, so the browser's own error bubbles don't compete with yours. The same goes for a group with a limit, like at most three options: check it in your code and report it on the group.

### Adaptive

#### Pointer, touch and pen

- Each option toggles from anywhere in its box's hit area or on its label, as described in the Checkbox's [Pointer, touch and pen](/docs/components/checkbox#pointer-touch-and-pen). A press on the legend does nothing, since it names the group rather than one of its boxes.
- Stacked options sit 8px apart, and options in a row 24px apart, so a tap that lands between two doesn't toggle the wrong one.

#### More contrast

When someone asks for more contrast (`prefers-contrast: more`), each box's border is drawn at full strength, as on the [Checkbox](/docs/components/checkbox#more-contrast). The legend already passes, so it stays as it is.

#### Forced colours

Windows contrast themes replace every colour with the user's own. Each box keeps its own forced-colours look, as on the [Checkbox](/docs/components/checkbox#forced-colours), and a disabled group's legend is drawn in `GrayText`, the system's colour for disabled text, like its boxes.

#### Colour scheme

The tokens use `light-dark()`, which follows `color-scheme`, so the Checkbox Group adapts to your light and dark themes on its own.

#### Text size and spacing

The legend, the gaps and the indent are set in `rem`, so the whole group grows with its text at 200% text size ([WCAG 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)) and with wider line, letter and word spacing ([WCAG 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)). A long legend wraps rather than being clipped, and a row of options wraps onto the next line rather than scrolling sideways at 320px wide ([WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)).

#### Languages and direction

The Checkbox Group indents its options with `padding-inline-start`, and each Checkbox lays out its box and label in a grid that follows the reading direction, so the whole group mirrors in right-to-left languages, with no extra work on your part:

::checkbox-group-languages-example
::framework-switcher
#react
```tsx
<div dir="rtl" lang="ar">
  <CheckboxGroup name="emails" options={emails} defaultValue={["news"]} selectAll="كل الرسائل">
    ما الرسائل التي تريدها؟
  </CheckboxGroup>
</div>
```

#vue
```vue
<div dir="rtl" lang="ar">
  <CheckboxGroup name="emails" :options="emails" :value="['news']" select-all="كل الرسائل">
    ما الرسائل التي تريدها؟
  </CheckboxGroup>
</div>
```

#svelte
```svelte
<div dir="rtl" lang="ar">
  <CheckboxGroup name="emails" options={emails} value={["news"]} selectAll="كل الرسائل">
    ما الرسائل التي تريدها؟
  </CheckboxGroup>
</div>
```

#angular
```angular-html
<div dir="rtl" lang="ar">
  <fieldset appCheckboxGroup name="emails" [options]="emails" [value]="['news']" selectAll="كل الرسائل">
    <legend>ما الرسائل التي تريدها؟</legend>
  </fieldset>
</div>
```

#solid
```tsx
<div dir="rtl" lang="ar">
  <CheckboxGroup name="emails" options={emails} value={["news"]} selectAll="كل الرسائل">
    ما الرسائل التي تريدها؟
  </CheckboxGroup>
</div>
```

#astro
```astro
<div dir="rtl" lang="ar">
  <CheckboxGroup name="emails" options={emails} value={["news"]} selectAll="كل الرسائل">
    ما الرسائل التي تريدها؟
  </CheckboxGroup>
</div>
```

#vanilla
```html
<div dir="rtl" lang="ar">
  <fieldset class="checkbox-group" data-size="md" data-orientation="vertical">
    <legend data-slot="legend">ما الرسائل التي تريدها؟</legend>
    <div data-slot="select-all">
      <label class="checkbox" data-size="md">
        <input data-slot="box" type="checkbox" />
        <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
        <span data-slot="label">كل الرسائل</span>
      </label>
    </div>
    <div data-slot="options">…</div>
  </fieldset>
</div>
```
::
::

- The options sit in from the select-all box on the right in a right-to-left layout, since the indent is on the start side.
- Remember to translate the legend, the options, the hint and the error message along with the rest of the page, and to mark any that are in another language with `lang`, so that screen readers pronounce them correctly ([WCAG 3.1.2](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html)).

## Developer Experience (DX)

Next, let's look at how developers use the Checkbox Group. It has one API, with the same names as the Checkbox and every other component, it's typed end to end, and it works with your forms however you build them.

::framework-switcher
#react
```tsx
import { useState } from "react";
import { CheckboxGroup } from "@/components/CheckboxGroup";

const emails = [
  { value: "news", label: "Product news" },
  { value: "tips", label: "Tips and guides" },
  { value: "events", label: "Events near you" },
];

export function Emails() {
  const [picked, setPicked] = useState<string[]>([]);

  return (
    <CheckboxGroup name="emails" options={emails} value={picked} onValueChange={setPicked}>
      Which emails would you like?
    </CheckboxGroup>
  );
}
```

#vue
```vue
<script setup lang="ts">
import { ref } from "vue";
import CheckboxGroup from "@/components/CheckboxGroup.vue";

const emails = [
  { value: "news", label: "Product news" },
  { value: "tips", label: "Tips and guides" },
  { value: "events", label: "Events near you" },
];
const picked = ref<string[]>([]);
</script>

<template>
  <CheckboxGroup v-model:value="picked" name="emails" :options="emails">Which emails would you like?</CheckboxGroup>
</template>
```

#svelte
```svelte
<script lang="ts">
  import CheckboxGroup from "$lib/components/CheckboxGroup.svelte";

  const emails = [
    { value: "news", label: "Product news" },
    { value: "tips", label: "Tips and guides" },
    { value: "events", label: "Events near you" },
  ];
  let picked = $state<string[]>([]);
</script>

<CheckboxGroup bind:value={picked} name="emails" options={emails}>Which emails would you like?</CheckboxGroup>
```

#angular
```angular-ts
import { Component, signal } from "@angular/core";
import { CheckboxGroup } from "./checkbox-group";

@Component({
  selector: "app-emails",
  imports: [CheckboxGroup],
  template: `
    <fieldset appCheckboxGroup name="emails" [options]="emails" [(value)]="picked">
      <legend>Which emails would you like?</legend>
    </fieldset>
  `,
})
export class Emails {
  emails = [
    { value: "news", label: "Product news" },
    { value: "tips", label: "Tips and guides" },
    { value: "events", label: "Events near you" },
  ];
  picked = signal<string[]>([]);
}
```

#solid
```tsx
import { createSignal } from "solid-js";
import { CheckboxGroup } from "~/components/CheckboxGroup";

const emails = [
  { value: "news", label: "Product news" },
  { value: "tips", label: "Tips and guides" },
  { value: "events", label: "Events near you" },
];

export function Emails() {
  const [picked, setPicked] = createSignal<string[]>([]);

  return (
    <CheckboxGroup name="emails" options={emails} value={picked()} onValueChange={setPicked}>
      Which emails would you like?
    </CheckboxGroup>
  );
}
```

#astro
```astro
---
import CheckboxGroup from "../components/CheckboxGroup.astro";

const emails = [
  { value: "news", label: "Product news" },
  { value: "tips", label: "Tips and guides" },
  { value: "events", label: "Events near you" },
];
---

<CheckboxGroup name="emails" options={emails}>Which emails would you like?</CheckboxGroup>
```

#vanilla
```html
<link rel="stylesheet" href="/styles/checkbox.css" />
<link rel="stylesheet" href="/styles/checkbox-group.css" />

<fieldset class="checkbox-group" data-size="md" data-orientation="vertical">
  <legend data-slot="legend">Which emails would you like?</legend>
  <div data-slot="options">
    <label class="checkbox" data-size="md">
      <input data-slot="box" type="checkbox" name="emails" value="news" />
      <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">
        <path data-mark="check" d="M3.5 8.5 6.5 11.5 12.5 4.5" />
        <path data-mark="dash" d="M4 8h8" />
      </svg>
      <span data-slot="label">Product news</span>
    </label>
    <!-- …a Checkbox for each option -->
  </div>
</fieldset>
```
::

### Consistent

Once you've learned the [Checkbox](/docs/components/checkbox#consistent)'s API, you already know most of the Checkbox Group's. These names mean the same thing everywhere in Open Components:

| Name           | Kind | What it means                                                                         |
| -------------- | ---- | ------------------------------------------------------------------------------------- |
| `size`         | Prop | `xs`, `sm`, `md`, `lg` or `xl`, with the same text everywhere                         |
| `disabled`     | Prop | The component can't be used, and here, nothing inside it either                       |
| `name`         | Prop | The name its form sends it under, which every one of its boxes shares                 |
| `value`        | Prop | The checked options' values, which you bind the way your framework binds a form control's |
| `options`      | Prop | What people can pick from, each with a `value` and a `label`                          |
| `orientation`  | Prop | `vertical` or `horizontal`, the way its options run                                   |
| `selectAll`    | Prop | The label of a box that checks or clears every option                                 |
| Default slot   | Slot | The legend, which names it, as the label names a Checkbox                             |

We recommend `size="md"` and `orientation="vertical"` as the defaults. The Checkbox Group also leaves a few things out, on purpose:

- There are no Checkboxes between its tags. The options are a prop, so the group can render a Checkbox for each one, give them all its `name`, bind each one to its value and work out the select-all box for you, and a list of options from your data drops straight in.
- There's no `required`. HTML has no way to require one of a group of checkboxes, so the group leaves it to your code, as under [Pick at least one](/docs/components/checkbox-group#pick-at-least-one).
- There's no `hint` or `error`. Each of them is an element of its own, linked by ID, as on the Checkbox and the Input, so the group fits any layout.
- There's no `color` or `variant`, since its boxes have none either.

### Type-safe

Props, events and slots are typed, so your editor can autocomplete them and your type checker (`tsc`, `vue-tsc`, `svelte-check`, `ngc` or `astro check`) catches mistakes like `orientation="row"`, which isn't one of the orientations, or a value that isn't a list.

| Prop          | Type                                       | Default      | Description                                                         |
| ------------- | ------------------------------------------ | ------------ | ------------------------------------------------------------------- |
| `options`     | `CheckboxGroupOption[]`                    |              | One Checkbox for each, in this order                                |
| `name`        | `string`                                   |              | The name every box shares, which its form sends                     |
| `value`       | `string[]`                                 | `[]`         | The checked options' values, when you bind it. Without it, the group keeps its own |
| `size`        | `"xs" \| "sm" \| "md" \| "lg" \| "xl"`     | `"md"`       | How big its boxes, their labels and its legend are                  |
| `orientation` | `"vertical" \| "horizontal"`               | `"vertical"` | Whether its options run in a column or in a row                     |
| `disabled`    | `boolean`                                  | `false`      | Disables every box in it, with `<fieldset disabled>`                |
| `selectAll`   | `string`                                   |              | The label of a select-all box above the options. Without it, there's none |

| Option field | Type     | Description                                                       |
| ------------ | -------- | ----------------------------------------------------------------- |
| `value`      | `string` | What the form sends while it's checked, and what the value lists  |
| `label`      | `string` | The text that names its Checkbox                                  |

| Event    | Payload | Description                                                                    |
| -------- | ------- | ------------------------------------------------------------------------------ |
| `change` | `Event` | Fires when people check or uncheck any of its boxes, select-all box included   |

It comes from the box that changed, and bubbles up to the `<fieldset>`, so one listener hears every box, and `event.target` is the one that changed. A binding to `value` follows the group for you, with the new list of values.

| Slot      | Description                                     |
| --------- | ----------------------------------------------- |
| Default   | The legend, which names the group               |

We also export `CheckboxGroupProps` and `CheckboxGroupOption`, which come in handy for wrappers and options from your data:

::framework-switcher
#react
```ts
import type { CheckboxGroupOption } from "@/components/CheckboxGroup";

const emails: CheckboxGroupOption[] = topics.map((topic) => ({ value: topic.id, label: topic.title }));
```

#vue
```ts
import type { CheckboxGroupOption } from "@/components/CheckboxGroup.vue";

const emails: CheckboxGroupOption[] = topics.map((topic) => ({ value: topic.id, label: topic.title }));
```

#svelte
```ts
import type { CheckboxGroupOption } from "$lib/components/CheckboxGroup.svelte";

const emails: CheckboxGroupOption[] = topics.map((topic) => ({ value: topic.id, label: topic.title }));
```

#angular
```ts
import type { CheckboxGroupOption } from "./checkbox-group";

const emails: CheckboxGroupOption[] = topics.map((topic) => ({ value: topic.id, label: topic.title }));
```

#solid
```ts
import type { CheckboxGroupOption } from "~/components/CheckboxGroup";

const emails: CheckboxGroupOption[] = topics.map((topic) => ({ value: topic.id, label: topic.title }));
```

#astro
```ts
import type { ComponentProps } from "astro/types";
import CheckboxGroup from "../components/CheckboxGroup.astro";

type CheckboxGroupOption = ComponentProps<typeof CheckboxGroup>["options"][number];

const emails: CheckboxGroupOption[] = topics.map((topic) => ({ value: topic.id, label: topic.title }));
```
::

### Composable

The Checkbox Group renders a `<fieldset>`, and everything you pass it that isn't a prop lands there, including `id`, `class`, ARIA attributes and event listeners. A ref to the Checkbox Group reaches the `<fieldset>` too, which is what you need to focus its first box when a submit fails.

#### Forms

Every box shares the group's `name`, and each checked box sends it with its own `value`, so the form sends one field with a value for each checked option, in the options' order, and nothing at all while none is checked. Read it with `getAll()`, since `get()` only returns the first value. That also means the form works before your JavaScript loads.

::framework-switcher
#react
```tsx
import type { FormEvent } from "react";

export function Preferences() {
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // One name, with a value for each checked option, so read them all.
    api.savePreferences({ emails: data.getAll("emails") });
  }

  return (
    <form onSubmit={save}>
      <CheckboxGroup name="emails" options={emails} defaultValue={["news"]}>Which emails would you like?</CheckboxGroup>
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
  // One name, with a value for each checked option, so read them all.
  api.savePreferences({ emails: data.getAll("emails") });
}
</script>

<template>
  <form @submit.prevent="save">
    <CheckboxGroup name="emails" :options="emails" :value="['news']">Which emails would you like?</CheckboxGroup>
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
    // One name, with a value for each checked option, so read them all.
    api.savePreferences({ emails: data.getAll("emails") });
  }
</script>

<form onsubmit={save}>
  <CheckboxGroup name="emails" options={emails} value={["news"]}>Which emails would you like?</CheckboxGroup>
  <Button type="submit" color="primary">Save preferences</Button>
</form>
```

#angular
```angular-ts
@Component({
  selector: "app-preferences",
  imports: [CheckboxGroup, Button],
  template: `
    <form (submit)="save($event)">
      <fieldset appCheckboxGroup name="emails" [options]="emails" [value]="['news']">
        <legend>Which emails would you like?</legend>
      </fieldset>
      <button appButton type="submit" color="primary">Save preferences</button>
    </form>
  `,
})
export class Preferences {
  emails = emails;

  save(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    // One name, with a value for each checked option, so read them all.
    api.savePreferences({ emails: data.getAll("emails") });
  }
}
```

#solid
```tsx
export function Preferences() {
  function save(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // One name, with a value for each checked option, so read them all.
    api.savePreferences({ emails: data.getAll("emails") });
  }

  return (
    <form onSubmit={save}>
      <CheckboxGroup name="emails" options={emails} value={["news"]}>Which emails would you like?</CheckboxGroup>
      <Button type="submit" color="primary">Save preferences</Button>
    </form>
  );
}
```

#astro
```astro
<!-- The form posts to the server, so it works before any JavaScript loads. -->
<form method="post" action="/preferences">
  <CheckboxGroup name="emails" options={emails} value={["news"]}>Which emails would you like?</CheckboxGroup>
  <Button type="submit" color="primary">Save preferences</Button>
</form>
```

#vanilla
```html
<!-- The form posts to the server, so it works before any JavaScript loads. -->
<form method="post" action="/preferences">
  <fieldset class="checkbox-group" data-size="md" data-orientation="vertical">
    <legend data-slot="legend">Which emails would you like?</legend>
    <div data-slot="options">
      <label class="checkbox" data-size="md">
        <input data-slot="box" type="checkbox" name="emails" value="news" checked />
        <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
        <span data-slot="label">Product news</span>
      </label>
      <!-- …tips, events -->
    </div>
  </fieldset>
  <button class="button" type="submit" data-variant="solid" data-color="primary" data-size="md">
    <span data-slot="label">Save preferences</span>
  </button>
</form>
```
::

Keep in mind that a server reading the form sees `emails=news&emails=tips`, the same name once for each checked option, and no field at all when none is checked. Some frameworks keep only the last value of a repeated name unless you ask for all of them, like PHP, which needs the name to end in `[]`, so check how yours reads it.

#### With other components

- Each option is a [Checkbox](/docs/components/checkbox), which sets its own variables on itself. To restyle every box in a group, set them from a class on the group with a descendant selector, like `.brand .checkbox { --checkbox--box--fill: … }`, that gets past your framework's style scoping, as under [Tokens](/docs/components/checkbox-group#tokens). A value on the group itself doesn't reach them.
- The Field, on our Roadmap, will render a group's hint and error message, and set its `aria-describedby` and `aria-invalid`, as it will for the Checkbox and the [Input](/docs/components/input).
- A [Button](/docs/components/button) that submits the form goes after the group, and takes the same `size`, so their text lines up.

### Controllable

The Checkbox Group doesn't keep any state you can't reach. Its value is yours to bind, or to leave to the group, and every other state is a prop or an attribute that you control:

::checkbox-group-controlled-example
::framework-switcher
#react
```tsx
const [picked, setPicked] = useState(["news"]);

<CheckboxGroup name="emails" options={emails} value={picked} onValueChange={setPicked}>Which emails would you like?</CheckboxGroup>
<p>You picked: {picked.join(", ") || "nothing yet"}</p>

<CheckboxGroup name="contact" options={contact} defaultValue={["email"]}>How can we reach you?</CheckboxGroup>
```

#vue
```vue
<script setup lang="ts">
const picked = ref(["news"]);
</script>

<template>
  <CheckboxGroup v-model:value="picked" name="emails" :options="emails">Which emails would you like?</CheckboxGroup>
  <p>You picked: {{ picked.join(", ") || "nothing yet" }}</p>

  <CheckboxGroup name="contact" :options="contact" :value="['email']">How can we reach you?</CheckboxGroup>
</template>
```

#svelte
```svelte
<script lang="ts">
  let picked = $state(["news"]);
</script>

<CheckboxGroup bind:value={picked} name="emails" options={emails}>Which emails would you like?</CheckboxGroup>
<p>You picked: {picked.join(", ") || "nothing yet"}</p>

<CheckboxGroup name="contact" options={contact} value={["email"]}>How can we reach you?</CheckboxGroup>
```

#angular
```angular-html
<fieldset appCheckboxGroup name="emails" [options]="emails" [(value)]="picked">
  <legend>Which emails would you like?</legend>
</fieldset>
<p>You picked: {{ picked().join(", ") || "nothing yet" }}</p>

<fieldset appCheckboxGroup name="contact" [options]="contact" [value]="['email']">
  <legend>How can we reach you?</legend>
</fieldset>
```

#solid
```tsx
const [picked, setPicked] = createSignal(["news"]);

<CheckboxGroup name="emails" options={emails} value={picked()} onValueChange={setPicked}>Which emails would you like?</CheckboxGroup>
<p>You picked: {picked().join(", ") || "nothing yet"}</p>

<CheckboxGroup name="contact" options={contact} value={["email"]}>How can we reach you?</CheckboxGroup>
```

#astro
```astro
<CheckboxGroup id="emails" name="emails" options={emails} value={["news"]}>Which emails would you like?</CheckboxGroup>
<p id="emails-status">You picked: news</p>

<CheckboxGroup name="contact" options={contact} value={["email"]}>How can we reach you?</CheckboxGroup>

<script>
  const group = document.querySelector("#emails")!;
  group.addEventListener("change", () => {
    const picked = [...group.querySelectorAll<HTMLInputElement>("input:checked")].map((box) => box.value);
    document.querySelector("#emails-status")!.textContent = `You picked: ${picked.join(", ") || "nothing yet"}`;
  });
</script>
```

#vanilla
```html
<fieldset id="emails" class="checkbox-group" data-size="md" data-orientation="vertical">
  <legend data-slot="legend">Which emails would you like?</legend>
  <div data-slot="options">…</div>
</fieldset>
<p id="emails-status">You picked: news</p>

<fieldset class="checkbox-group" data-size="md" data-orientation="vertical">
  <legend data-slot="legend">How can we reach you?</legend>
  <div data-slot="options">…</div>
</fieldset>

<script type="module">
  const group = document.querySelector("#emails");
  group.addEventListener("change", () => {
    const picked = [...group.querySelectorAll("input:checked")].map((box) => box.value);
    document.querySelector("#emails-status").textContent = `You picked: ${picked.join(", ") || "nothing yet"}`;
  });
</script>
```
::
::

| State      | How you control it                                                                 |
| ---------- | ---------------------------------------------------------------------------------- |
| Value      | `value`, bound to your state, or left to the group                                 |
| Select all | `selectAll`, with its checked and mixed states worked out from the value           |
| Disabled   | `disabled`, or a `<fieldset disabled>` around it                                   |
| Invalid    | `aria-invalid`, set while its error message shows (see [Pick at least one](/docs/components/checkbox-group#pick-at-least-one)) |
| Focus      | A ref to its `<fieldset>`, and `focus()` on its first box                          |

When you bind `value`, the boxes always show the list you hold. If a change doesn't make it into your state, like an option people aren't allowed to drop, the box goes back as soon as it renders, and so does the select-all box. When you don't bind it, the group keeps its own value, and starts out from the one you give it.

## Agentic Experience (AX)

Finally, let's look at how agents read, check and verify a checkbox group. They rely on the same accessibility tree as assistive technologies, and on a contract they can check the code against.

### Semantic

Agents that drive a browser, through Playwright or a browser MCP server, read the page through its accessibility tree, which is made of roles, names and states. This is how they see the select-all example on this page:

```yaml
- group "Which emails would you like?":
  - checkbox "All emails" [checked=mixed]
  - checkbox "Product news" [checked]
  - checkbox "Tips and guides"
  - checkbox "Events near you"
```

A heading or a paragraph above some boxes is only text, so an agent can't tell which boxes belong to which question, any more than a screen reader user can. With a named group, an agent can find the question, pick from it and confirm what it picked:

```ts
const emails = page.getByRole("group", { name: "Which emails would you like?" });
await emails.getByRole("checkbox", { name: "All emails" }).check();
for (const box of await emails.getByRole("checkbox").all()) await expect(box).toBeChecked();
```

### Described

Here's the whole contract in one block, for agents to read before they build or review a checkbox group:

```yaml
component: CheckboxGroup
summary: Lets people pick any number of options from a short list. Its legend names it, and each option is a Checkbox.
standard: https://opencomponents.dev/docs/components/checkbox-group
element: fieldset # its first child is the legend that names it. It takes every attribute that isn't a prop
role: group
props:
  options: { type: "{ value: string, label: string }[]" } # a Checkbox for each, in this order
  name: { type: string } # shared by every box, so the form sends one field with a value per checked option
  value: { type: "string[]", default: [] } # the checked options' values, in their order, when it's bound. Without it, the group keeps its own
  size: { type: [xs, sm, md, lg, xl], default: md }
  orientation: { type: [vertical, horizontal], default: vertical }
  disabled: { type: boolean, default: false } # sets disabled on the fieldset
  selectAll: { type: string } # the label of a box above the options that checks or clears them all
slots:
  default: The legend, which names the group.
events:
  change: Event, from the box that changed, which bubbles up to the fieldset.
states:
  disabled: ":disabled, from <fieldset disabled>, which every box inside it matches too"
  invalid: "[aria-invalid=true], which each option gets too, never :invalid"
  select-all: "> [data-slot=select-all] input:checked when every option is, :indeterminate when only some are"
keyboard:
  Tab: Moves focus to the next box, select-all box included. There's no roving focus.
  Space: Checks or unchecks the focused box. On the select-all box, it checks every option, or clears them all.
parts: [legend, select-all, options] # data-slot, in this order. Only select-all is optional
tokens:
  theme: ["--color--neutral-text"] # and the Checkbox's, through its boxes
  variables: [--checkbox-group--legend--font-size, --checkbox-group--legend--margin-bottom, --checkbox-group--indent, --checkbox-group--row-gap, --checkbox-group--column-gap]
  layer: components # in Tailwind's order: theme, base, components, utilities
rules: https://opencomponents.dev/docs/components/checkbox-group#checklist
```

It's also published on its own at [`/raw/docs/components/checkbox-group.yaml`](/raw/docs/components/checkbox-group.yaml){external=""}, with every rule from the checklist in place of the `rules` link. Its boxes follow the [Checkbox](/docs/components/checkbox#described)'s contract too, so give agents both.

Every rule has a stable ID, like `checkbox-group/select-all-state`, so you and your agents can cite it in reviews and commits.

### Deterministic

The same props always render the same markup, leaving out anything your framework adds for itself, like comments or scoping attributes. For example, here's a group with a select-all box and two options, "Product news" (`news`) and "Tips and guides" (`tips`), described by its hint:

```html
<CheckboxGroup name="emails" selectAll="All emails" aria-describedby="emails-hint">
  Which emails would you like?
</CheckboxGroup>
```

And here's what it renders:

```html
<fieldset class="checkbox-group" aria-describedby="emails-hint" data-size="md" data-orientation="vertical">
  <legend data-slot="legend">Which emails would you like?</legend>
  <div data-slot="select-all">
    <label class="checkbox" data-size="md">
      <input data-slot="box" type="checkbox" />
      <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">
        <path data-mark="check" d="M3.5 8.5 6.5 11.5 12.5 4.5" />
        <path data-mark="dash" d="M4 8h8" />
      </svg>
      <span data-slot="label">All emails</span>
    </label>
  </div>
  <div data-slot="options">
    <label class="checkbox" data-size="md">
      <input data-slot="box" type="checkbox" name="emails" value="news" />
      <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
      <span data-slot="label">Product news</span>
    </label>
    <label class="checkbox" data-size="md">
      <input data-slot="box" type="checkbox" name="emails" value="tips" />
      <svg data-slot="indicator" viewBox="0 0 16 16" aria-hidden="true">…</svg>
      <span data-slot="label">Tips and guides</span>
    </label>
  </div>
</fieldset>
```

- The size and the orientation are mirrored as `data-size` and `data-orientation`, which are always there, and every box takes the group's `data-size`.
- Parts are marked with `data-slot` and always come in the same order: `legend`, `select-all` and `options`. Only the select-all box is optional, and each box inside follows the [Checkbox](/docs/components/checkbox#deterministic)'s DOM contract.
- States change properties and attributes, never elements. The select-all box's mixed state is a property of its `<input>`, so it never shows up in the markup, and no box is ever replaced as people check and uncheck them, so focus and the screen reader's position survive every change.
- There's nothing random or generated, like IDs or timestamps, so the markup is the same on the server, on the client and in every snapshot. The legend names the `<fieldset>` without an ID. The select-all box has no `aria-controls`, which the APG's example gives it. We leave it out on purpose, since it would need an ID on every option, and the `<fieldset>` already ties the box to the options inside it.

### Verifiable

Every rule in the checklist can be checked, and about two thirds of them automatically.

#### Unit tests

Every rule that the checklist checks with a unit test has one in `CheckboxGroup.test.ts`, which you'll find under [Reference implementation](/docs/components/checkbox-group#reference-implementation). We run them on every change to this page, so the code you see always passes them.

#### In the browser

In the browser, you can run [axe](https://github.com/dequelabs/axe-core) to check labels and contrast, and use the keyboard and the select-all box the way an agent would:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the emails group is named, reached one box at a time, and its select-all box checks them all", async ({ page }) => {
  await page.goto("/preferences");

  const emails = page.getByRole("group", { name: "Which emails would you like?" });
  const all = emails.getByRole("checkbox", { name: "All emails" });
  await all.focus();
  await page.keyboard.press("Tab");
  await expect(emails.getByRole("checkbox", { name: "Product news" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(all).toBeChecked({ indeterminate: true });
  await all.check();
  for (const box of await emails.getByRole("checkbox").all()) await expect(box).toBeChecked();

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations).toEqual([]);
});
```

Some things still need a human, so try your groups with the keyboard alone, with a screen reader, which should announce the legend as you move into the group and the select-all box as mixed, and at 200% zoom, with forced colours and more contrast turned on. You can emulate the last two in Chrome DevTools, under Rendering.

#### During development

Our reference implementation also warns you in the console as soon as a group renders without a legend, which leaves screen reader users with a list of boxes and no question.

#### Prompts

You can point your agent straight at this page. To build a checkbox group, you could use:

::framework-switcher
#react
```
Build a Checkbox Group component for our React design system that meets the Open Components
Checkbox Group standard: https://opencomponents.dev/raw/docs/components/checkbox-group.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#vue
```
Build a Checkbox Group component for our Vue 3 design system that meets the Open Components
Checkbox Group standard: https://opencomponents.dev/raw/docs/components/checkbox-group.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#svelte
```
Build a Checkbox Group component for our Svelte 5 design system that meets the Open Components
Checkbox Group standard: https://opencomponents.dev/raw/docs/components/checkbox-group.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#angular
```
Build a Checkbox Group component for our Angular design system that meets the Open Components
Checkbox Group standard: https://opencomponents.dev/raw/docs/components/checkbox-group.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#solid
```
Build a Checkbox Group component for our Solid design system that meets the Open Components
Checkbox Group standard: https://opencomponents.dev/raw/docs/components/checkbox-group.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#astro
```
Build a Checkbox Group component for our Astro design system that meets the Open Components
Checkbox Group standard: https://opencomponents.dev/raw/docs/components/checkbox-group.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```

#vanilla
```
Build a Checkbox Group for our design system in plain HTML, CSS and JavaScript that meets the
Open Components Checkbox Group standard: https://opencomponents.dev/raw/docs/components/checkbox-group.md

Follow its DOM contract and its tokens. Port its tests and make them pass.
Then check your work against every rule in its checklist with a Component or Both
scope, and cite the rule ID for any rule you can't meet.
```
::

To review one, the contract is enough:

```
Review our Checkbox Group against the Open Components Checkbox Group contract:
https://opencomponents.dev/raw/docs/components/checkbox-group.yaml

For each rule with a component or both scope, report pass or fail with the rule ID
and the evidence from our code. Then fix the failures.
```

And to review how a screen uses its checkbox groups:

```
Review how our preferences page uses its checkbox groups against the Open Components
Checkbox Group contract: https://opencomponents.dev/raw/docs/components/checkbox-group.yaml

For each rule with a usage or both scope, report pass or fail with the rule ID and
the evidence from our code. Then fix the failures.
```

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A checkbox group meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it. Each of its boxes is a Checkbox, so the [Checkbox's checklist](/docs/components/checkbox#checklist) applies to every one of them as well, and the rules below only cover what the group adds.

The scope says who meets a rule. **Component** rules are met by the Checkbox Group itself, so they're the ones to check when you build or review one. **Usage** rules are met by the forms that use it, like writing a legend that asks the question, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like an invalid group: the Checkbox Group marks its boxes invalid from `aria-invalid`, as long as you set it when the error message shows.

The basis says where a rule comes from. Many rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and a few come from **HTML** or the **APG**. The rest are **Open Components** rules, which are our own, like stacking options in a column. Where a rule goes further than WCAG asks at level AA, its basis says so with **beyond**.

### UI rules

| Rule                                | Level  | Scope     | Requirement | Basis | Check |
| ----------------------------------- | ------ | --------- | ----------- | ----- | ----- |
| `checkbox-group/legend-contrast`    | Must   | Component | The legend has a contrast of 4.5:1 against the page | WCAG 1.4.3 (AA) | axe `color-contrast`, contrast checker |
| `checkbox-group/vertical-by-default` | Should | Component | Options run in a column unless it's set to a row, and a row wraps rather than overflowing | Open Components | Visual regression test |
| `checkbox-group/option-spacing`     | Should | Component | Options sit at least 8px apart in a column and 24px apart in a row | Open Components | Visual regression test |
| `checkbox-group/select-all-indent`  | Should | Component | Options under a select-all box sit in from it by its box and gap, so their boxes line up with its label | Open Components | Visual regression test |
| `checkbox-group/resizable`          | Must   | Component | The legend, the gaps and the indent are sized in `rem`, and the legend and a row of options wrap instead of being clipped or scrolling sideways | Open Components, beyond WCAG 1.4.4, 1.4.10, 1.4.12 (AA) | 200% zoom |
| `checkbox-group/disabled-look`      | Must   | Component | A disabled group shows its legend as disabled along with its boxes, in `GrayText` in forced colours mode | Open Components | Visual regression test, emulation |
| `checkbox-group/stable-size`        | Must   | Component | No state changes the group's size or position | Open Components | Visual regression test |

### UX rules

| Rule                                 | Level  | Scope     | Requirement | Basis | Check |
| ------------------------------------ | ------ | --------- | ----------- | ----- | ----- |
| `checkbox-group/fieldset`            | Must   | Component | It's a `<fieldset>` whose first child is the `<legend>` that names it, so it has the `group` role and the legend as its name | WCAG 1.3.1, 4.1.2 (A), HTML | Unit test |
| `checkbox-group/legend-question`     | Must   | Usage     | Every group has a visible legend that says what its options are for, ideally as the question they answer | WCAG 1.3.1, 3.3.2 (A) | Review |
| `checkbox-group/described`           | Should | Both      | A hint and an error message sit outside the legend and are linked to the `<fieldset>` with `aria-describedby`, the hint's ID first | WCAG 1.3.1 (A), APG | Unit test, screen reader |
| `checkbox-group/keyboard`            | Must   | Component | `Tab` reaches each box in turn, select-all box included, `Space` toggles the focused one, and the arrow keys never move focus between them | WCAG 2.1.1 (A), APG | Unit test |
| `checkbox-group/select-all-state`    | Must   | Component | The select-all box is checked when every option is, unchecked when none is, and mixed when only some are, worked out from them whenever they change | WCAG 4.1.2 (A), APG | Unit test |
| `checkbox-group/select-all-action`   | Must   | Component | Checking the select-all box, from unchecked or mixed, checks every option, and unchecking it clears them all, without going back to an earlier selection | APG, Open Components | Unit test |
| `checkbox-group/select-all-label`    | Should | Usage     | A select-all box says what it selects, like "All emails", and only comes with lists that are long or often picked in full | Open Components | Review |
| `checkbox-group/vertical`            | Should | Usage     | Options run in a column, and only two or three short ones run in a row | Open Components | Review |
| `checkbox-group/predictable-order`   | Should | Usage     | Options come in an order people can predict, like most to least common or alphabetical, and keep it every time | Open Components | Review |
| `checkbox-group/at-least-one`        | Must   | Usage     | A group people have to pick from says so in its legend or hint, and is checked in code when the form is sent, never with `required` on its boxes | HTML, WCAG 3.3.2 (A) | Review |
| `checkbox-group/error-message`       | Must   | Usage     | An invalid group has an error message, in text and linked to the `<fieldset>` with `aria-describedby`, that says what to pick | WCAG 1.4.1, 3.3.1 (A), 3.3.3 (AA) | Screen reader |
| `checkbox-group/invalid-state`       | Must   | Both      | The group sets `aria-invalid="true"` while its error message shows, and each of its options looks and reads invalid with it | WCAG 4.1.2 (A), Open Components | Unit test |
| `checkbox-group/focus-on-error`      | Should | Usage     | A failed submit moves focus to the group's first box, once the error is in the page | Open Components, beyond WCAG 3.3.1 (A) | Keyboard |
| `checkbox-group/disabled-inert`      | Must   | Component | A disabled group sets `disabled` on its `<fieldset>`, so no box in it, select-all box included, can be focused, toggled or sent | HTML | Unit test |
| `checkbox-group/mirrors-in-rtl`      | Should | Component | The indent and a row of options follow `dir`, with logical properties | Open Components | Review |

### DX rules

| Rule                                 | Level  | Scope     | Requirement | Basis | Check |
| ------------------------------------ | ------ | --------- | ----------- | ----- | ----- |
| `checkbox-group/shared-vocabulary`   | Must   | Component | It uses the shared names: `size`, `disabled`, `name`, `value`, `options`, `orientation`, `selectAll`, the default slot for its legend and `change` | Open Components | Review |
| `checkbox-group/typed`               | Must   | Component | Props, events and slots are typed, with unions rather than `string`, and the value is a list of strings | Open Components | Type check |
| `checkbox-group/composes-checkbox`   | Must   | Component | Each option and the select-all box is a Checkbox, so every Checkbox rule holds for each of them | Open Components | Review |
| `checkbox-group/form-control`        | Must   | Component | Every option shares one `name`, and its form sends a value for each checked option, in the options' order, and nothing for the select-all box | HTML | Unit test |
| `checkbox-group/controllable`        | Should | Component | `value` is a list that can be bound or left to the group, and a bound group always shows the value you hold | Open Components | Unit test |
| `checkbox-group/fieldset-attributes` | Must   | Component | Attributes, listeners and refs land on the `<fieldset>`, and each box's `change` bubbles up to it | Open Components | Unit test |

### AX rules

| Rule                                 | Level  | Scope     | Requirement | Basis | Check |
| ------------------------------------ | ------ | --------- | ----------- | ----- | ----- |
| `checkbox-group/role-and-name`       | Must   | Component | It can be found by its legend alone, with `getByRole("group", { name })`, and each option inside it with `getByRole("checkbox", { name })` | WCAG 4.1.2 (A) | Unit test |
| `checkbox-group/deterministic-dom`   | Must   | Component | The same props render the same markup, with no generated IDs, and states change properties and attributes, never elements | Open Components | Unit test |
| `checkbox-group/data-attributes`     | Should | Component | The size and the orientation are mirrored as `data-size` and `data-orientation`, and parts are marked with `data-slot` | Open Components | Unit test |
| `checkbox-group/dev-warnings`        | Should | Component | It warns during development when a group has no legend | Open Components | Unit test |

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves. It's built out of the [Checkbox](/docs/components/checkbox#reference-implementation), which it imports from `../checkbox/Checkbox.vue`, so copy `Checkbox.vue` too. Both read the same theme tokens as the Button, so copy [`tokens.css`](/docs/components/button#reference-implementation) from the Button's reference implementation into your theme as well.

The tests are in `CheckboxGroup.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [CheckboxGroup.vue]
<script setup lang="ts">
import { computed, onMounted, useAttrs, useTemplateRef } from "vue";
import Checkbox from "../checkbox/Checkbox.vue";

export interface CheckboxGroupOption {
  /** What the form sends for it while it's checked, and what the group's value lists. */
  value: string;
  /** The text that names its checkbox. */
  label: string;
}

export interface CheckboxGroupProps {
  /** One checkbox per option, in this order. */
  options: CheckboxGroupOption[];
  /** The name every checkbox shares, so the form sends the group as one field with a value per checked option. */
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** A column by default, which is quicker to scan. A row only suits two or three short options. */
  orientation?: "vertical" | "horizontal";
  /** Disables every checkbox in it, with `<fieldset disabled>`. */
  disabled?: boolean;
  /** The label of a box above the options that checks or clears them all, and shows whether all, some or none are checked. */
  selectAll?: string;
}

// Attributes go on the <fieldset> through `attrs`, which also tells the options below when the group is invalid.
defineOptions({ inheritAttrs: false });

const { options, name, size = "md", orientation = "vertical", disabled = false, selectAll } = defineProps<CheckboxGroupProps>();

/** The checked options' values, in the options' order, which `v-model:value` binds. Without it, the group keeps its own, and starts from `value`. */
const value = defineModel<string[]>("value", { default: () => [] });

defineSlots<{
  /** The legend, which names the group. */
  default?: () => unknown;
}>();

const attrs = useAttrs();
// While the group is invalid, so is each of its options, so they look and read
// invalid too. The error message stays on the group, where it's described.
const invalid = () => attrs["aria-invalid"] === true || attrs["aria-invalid"] === "true";

const all = computed(() => options.length > 0 && options.every((option) => value.value.includes(option.value)));
// Worked out from the options every time they change, so it can't disagree with them.
const some = computed(() => !all.value && options.some((option) => value.value.includes(option.value)));

function toggle(option: CheckboxGroupOption, checked: boolean) {
  value.value = options
    .map(({ value }) => value)
    .filter((candidate) => (candidate === option.value ? checked : value.value.includes(candidate)));
}

// Checking the box, from unchecked or mixed, checks every option, and unchecking it
// clears them all, as the APG asks. It never goes back to an earlier selection, so a
// press always does what the box shows it will.
function toggleAll(checked: boolean) {
  value.value = checked ? options.map(({ value }) => value) : [];
}

const fieldset = useTemplateRef<HTMLFieldSetElement>("fieldset");

// A ref to the CheckboxGroup gets you the <fieldset>, through `fieldset`.
defineExpose({ fieldset });

onMounted(() => {
  if (import.meta.env.DEV) {
    const el = fieldset.value;
    const named =
      el?.querySelector(":scope > legend")?.textContent?.trim() ||
      el?.hasAttribute("aria-label") ||
      el?.hasAttribute("aria-labelledby");
    if (el && !named) {
      console.warn("[CheckboxGroup] has no accessible name: give it a legend that says what its options are for.", el);
    }
  }
});
</script>

<template>
  <fieldset
    ref="fieldset"
    class="checkbox-group"
    v-bind="attrs"
    :data-size="size"
    :data-orientation="orientation"
    :disabled="disabled"
  >
    <!-- The fieldset's first child, which names it. -->
    <legend data-slot="legend"><slot /></legend>
    <div v-if="selectAll" data-slot="select-all">
      <!-- No name, so the form never sends it: it stands for the options, which it does send.
           Its mixed state is bound, and its own update ignored, so it always shows what they add up to. -->
      <Checkbox
        :size="size"
        :checked="all"
        :indeterminate="some"
        @update:checked="toggleAll"
        @update:indeterminate="() => {}"
      >
        {{ selectAll }}
      </Checkbox>
    </div>
    <div data-slot="options">
      <Checkbox
        v-for="option in options"
        :key="option.value"
        :size="size"
        :name="name"
        :value="option.value"
        :checked="value.includes(option.value)"
        :aria-invalid="invalid() ? 'true' : undefined"
        @update:checked="(checked: boolean) => toggle(option, checked)"
      >
        {{ option.label }}
      </Checkbox>
    </div>
  </fieldset>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The group's styles go in `components`, so
   they win over the resets in `base`, and give way to utilities and to any style
   outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .checkbox-group {
    /* Set per size, along with the Checkbox's own. */
    --checkbox-group--legend--font-size: 0.875rem;
    /* How far the options sit in from a select-all box: its box and gap, so their boxes line up with its label. */
    --checkbox-group--indent: 1.625rem;
    /* 8px between stacked checkboxes, so a tap between two never toggles the wrong one. */
    --checkbox-group--row-gap: 0.5rem;
    --checkbox-group--column-gap: 1.5rem;
    --checkbox-group--legend--margin-bottom: 0.5rem;

    display: flex;
    flex-direction: column;
    gap: var(--checkbox-group--row-gap);
    min-inline-size: 0;
    margin: 0;
    padding: 0;
    border: 0;
    color: var(--color--neutral-text);
  }

  /* Sizes */
  .checkbox-group[data-size="xs"] {
    --checkbox-group--legend--font-size: 0.75rem;
    --checkbox-group--indent: 1.25rem;
  }
  .checkbox-group[data-size="sm"] {
    --checkbox-group--indent: 1.5rem;
  }
  .checkbox-group[data-size="lg"] {
    --checkbox-group--legend--font-size: 1rem;
    --checkbox-group--indent: 1.75rem;
  }
  .checkbox-group[data-size="xl"] {
    --checkbox-group--legend--font-size: 1rem;
    --checkbox-group--indent: 2.125rem;
  }

  /* Parts */
  .checkbox-group > [data-slot="legend"] {
    /* A rendered legend sits outside the flex box the fieldset lays its content out in, so it gets a margin rather than the gap. */
    margin-bottom: var(--checkbox-group--legend--margin-bottom);
    padding: 0;
    font-size: var(--checkbox-group--legend--font-size);
    font-weight: 600;
    line-height: 1.25;
  }
  .checkbox-group > [data-slot="options"] {
    display: flex;
    flex-direction: column;
    gap: var(--checkbox-group--row-gap) var(--checkbox-group--column-gap);
  }
  .checkbox-group > [data-slot="select-all"] + [data-slot="options"] {
    padding-inline-start: var(--checkbox-group--indent);
  }
  /* A row wraps when it runs out of room, rather than overflowing. */
  .checkbox-group[data-orientation="horizontal"] > [data-slot="options"] {
    flex-direction: row;
    flex-wrap: wrap;
  }

  /* States. :disabled matches a <fieldset disabled>, and every Checkbox inside it
     looks disabled on its own, since its look comes from :disabled too. */
  .checkbox-group:disabled > [data-slot="legend"] {
    opacity: 0.5;
  }

  @media (forced-colors: active) {
    .checkbox-group:disabled > [data-slot="legend"] {
      color: GrayText;
      opacity: 1;
    }
  }
}
</style>
```

```ts [CheckboxGroup.test.ts]
import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import CheckboxGroup from "./CheckboxGroup.vue";

const options = [
  { value: "cheese", label: "Cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
];
const toppings = () => "Toppings";

describe("CheckboxGroup", () => {
  it("is a fieldset, named by its legend, with a native checkbox for each option", () => {
    render(CheckboxGroup, { props: { name: "toppings", options }, slots: { default: toppings } });

    const group = screen.getByRole("group", { name: "Toppings" });
    expect(group).toHaveAccessibleName("Toppings");
    expect(group.tagName).toBe("FIELDSET");
    expect(group.firstElementChild?.tagName).toBe("LEGEND");
    for (const { value, label } of options) {
      const checkbox = screen.getByRole("checkbox", { name: label });
      expect(checkbox.tagName).toBe("INPUT");
      // Only an invalid group marks its options invalid.
      expect(checkbox).not.toHaveAttribute("aria-invalid");
      expect(checkbox).toHaveAttribute("name", "toppings");
      expect(checkbox).toHaveAttribute("value", value);
      expect(group).toContainElement(checkbox);
    }
  });

  it("is described by its hint and its error, through aria-describedby on the fieldset", () => {
    render({
      render: () => [
        h(
          CheckboxGroup,
          { name: "toppings", options, "aria-invalid": "true", "aria-describedby": "toppings-hint toppings-error" },
          toppings,
        ),
        h("p", { id: "toppings-hint" }, "Pick as many as you like."),
        h("p", { id: "toppings-error" }, "Pick at least one topping"),
      ],
    });

    const group = screen.getByRole("group", { name: "Toppings" });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Pick as many as you like. Pick at least one topping");
    // The boxes look and read invalid along with the group, while the message stays on the group.
    for (const { label } of options) {
      expect(screen.getByRole("checkbox", { name: label })).toHaveAttribute("aria-invalid", "true");
    }
  });

  it("is submitted with its form as one name, with a value for each checked option", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () => h("form", [h(CheckboxGroup, { name: "toppings", options, selectAll: "All toppings" }, toppings)]),
    });

    const form = container.querySelector("form")!;
    expect([...new FormData(form)]).toEqual([]);
    await user.click(screen.getByRole("checkbox", { name: "Olives" }));
    await user.click(screen.getByRole("checkbox", { name: "Cheese" }));
    // In the options' order, and without the select-all box, which has no name.
    expect(new FormData(form).getAll("toppings")).toEqual(["cheese", "olives"]);
    expect([...new FormData(form)]).toHaveLength(2);
  });

  it("binds its value as a list with v-model, or keeps its own without it, starting from value", async () => {
    const user = userEvent.setup();
    const picked = ref<string[]>(["mushrooms"]);
    render({
      render: () => [
        h(
          CheckboxGroup,
          { name: "bound", options, value: picked.value, "onUpdate:value": (value: string[]) => (picked.value = value) },
          () => "Bound",
        ),
        h(CheckboxGroup, { name: "unbound", options: [{ value: "yes", label: "Unbound option" }], value: ["yes"] }, () => "Unbound"),
      ],
    });

    const bound = within(screen.getByRole("group", { name: "Bound" }));
    const cheese = bound.getByRole("checkbox", { name: "Cheese" });
    const mushrooms = bound.getByRole("checkbox", { name: "Mushrooms" });
    expect(mushrooms).toBeChecked();
    await user.click(cheese);
    expect(picked.value).toEqual(["cheese", "mushrooms"]);
    picked.value = ["olives"];
    await nextTick();
    expect(cheese).not.toBeChecked();
    expect(mushrooms).not.toBeChecked();

    const unbound = screen.getByRole("checkbox", { name: "Unbound option" });
    expect(unbound).toBeChecked();
    await user.click(unbound);
    expect(unbound).not.toBeChecked();
  });

  it("keeps showing the value you hold when a bound change isn't taken", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(CheckboxGroup, {
      props: { name: "toppings", options, selectAll: "All toppings", value: ["cheese"], "onUpdate:value": onUpdate },
      slots: { default: toppings },
    });

    const cheese = screen.getByRole("checkbox", { name: "Cheese" });
    await user.click(cheese);
    expect(onUpdate).toHaveBeenCalledWith([]);
    await nextTick();
    expect(cheese).toBeChecked();

    const all = screen.getByRole("checkbox", { name: "All toppings" });
    await user.click(all);
    expect(onUpdate).toHaveBeenLastCalledWith(["cheese", "mushrooms", "olives"]);
    await nextTick();
    expect(all).toBePartiallyChecked();
    expect(screen.getByRole("checkbox", { name: "Olives" })).not.toBeChecked();
  });

  it("is reached with Tab one checkbox at a time, each toggled with Space, with no arrow keys", async () => {
    const user = userEvent.setup();
    render(CheckboxGroup, { props: { name: "toppings", options, selectAll: "All toppings" }, slots: { default: toppings } });

    for (const name of ["All toppings", "Cheese", "Mushrooms", "Olives"]) {
      await user.tab();
      expect(screen.getByRole("checkbox", { name })).toHaveFocus();
    }
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("checkbox", { name: "Olives" })).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("checkbox", { name: "Olives" })).toBeChecked();
    await user.tab({ shift: true });
    expect(screen.getByRole("checkbox", { name: "Mushrooms" })).toHaveFocus();
  });

  it("shows its select-all box checked, unchecked or mixed from its options, and checks or clears them all from it", async () => {
    const user = userEvent.setup();
    const picked = ref<string[]>([]);
    render({
      render: () =>
        h(
          CheckboxGroup,
          {
            name: "toppings",
            options,
            selectAll: "All toppings",
            value: picked.value,
            "onUpdate:value": (value: string[]) => (picked.value = value),
          },
          toppings,
        ),
    });

    const all = screen.getByRole<HTMLInputElement>("checkbox", { name: "All toppings" });
    expect(all).not.toBeChecked();
    expect(all).not.toBePartiallyChecked();

    await user.click(screen.getByRole("checkbox", { name: "Cheese" }));
    await nextTick();
    expect(all).toBePartiallyChecked();

    // From mixed, it checks every option, rather than going back to an earlier selection.
    await user.click(all);
    await nextTick();
    expect(picked.value).toEqual(["cheese", "mushrooms", "olives"]);
    expect(all).toBeChecked();
    expect(all).not.toBePartiallyChecked();

    // From checked, it clears them all.
    await user.click(all);
    await nextTick();
    expect(picked.value).toEqual([]);
    expect(all).not.toBeChecked();

    // From unchecked, it checks them all again.
    await user.click(all);
    await nextTick();
    expect(picked.value).toEqual(["cheese", "mushrooms", "olives"]);

    // And it follows the options, whichever way they change.
    picked.value = ["olives"];
    await nextTick();
    expect(all).toBePartiallyChecked();
    await user.click(screen.getByRole("checkbox", { name: "Olives" }));
    await nextTick();
    expect(all).not.toBeChecked();
    expect(all).not.toBePartiallyChecked();
  });

  it("can't be focused, changed or submitted while disabled, select-all box included", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () =>
        h("form", [
          h(
            CheckboxGroup,
            { name: "toppings", options, selectAll: "All toppings", value: ["cheese"], disabled: true },
            toppings,
          ),
        ]),
    });

    const group = screen.getByRole("group", { name: "Toppings" });
    expect(group).toBeDisabled();
    await user.tab();
    await user.click(screen.getByRole("checkbox", { name: "All toppings" }));
    await user.click(screen.getByText("Mushrooms"));
    expect(document.body).toHaveFocus();
    for (const checkbox of screen.getAllByRole("checkbox")) expect(checkbox).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Mushrooms" })).not.toBeChecked();
    expect([...new FormData(container.querySelector("form")!)]).toEqual([]);
  });

  it("puts attributes, listeners and refs on the fieldset", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const instance = ref<ComponentPublicInstance<{ fieldset: HTMLFieldSetElement }>>();
    render({
      render: () => h(CheckboxGroup, { ref: instance, id: "toppings", class: "toppings", name: "toppings", options, onChange }, toppings),
    });

    const group = screen.getByRole("group", { name: "Toppings" });
    expect(group).toHaveAttribute("id", "toppings");
    expect(group).toHaveClass("checkbox-group", "toppings");
    // Each checkbox's change bubbles up to the fieldset.
    await user.click(screen.getByRole("checkbox", { name: "Cheese" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(instance.value?.fieldset).toBe(group);
  });

  it("is vertical by default, and mirrors its size and orientation as data attributes, with its size on every checkbox", () => {
    const { container } = render(CheckboxGroup, { props: { name: "toppings", options }, slots: { default: toppings } });
    expect(container.firstElementChild).toHaveAttribute("data-orientation", "vertical");
    expect(container.firstElementChild).toHaveAttribute("data-size", "md");

    const { container: row } = render(CheckboxGroup, {
      props: { name: "toppings", options, size: "lg", orientation: "horizontal", selectAll: "All toppings" },
      slots: { default: toppings },
    });
    const root = row.firstElementChild!;
    expect(root).toHaveAttribute("data-orientation", "horizontal");
    expect(root).toHaveAttribute("data-size", "lg");
    for (const checkbox of root.querySelectorAll(".checkbox")) expect(checkbox).toHaveAttribute("data-size", "lg");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const props = { name: "toppings", options, selectAll: "All toppings" };
    const first = render(CheckboxGroup, { props, slots: { default: toppings } }).container.innerHTML;
    const { container, rerender } = render(CheckboxGroup, { props, slots: { default: toppings } });
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["legend", "select-all", "options"]);

    const inputs = [...root.querySelectorAll("input")];
    await rerender({ ...props, value: ["cheese"], disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect([...root.querySelectorAll("input")]).toEqual(inputs);
    expect(parts()).toEqual(["legend", "select-all", "options"]);
  });

  it("warns in development when it has no legend", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(CheckboxGroup, { props: { name: "toppings", options } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render(CheckboxGroup, { props: { name: "toppings", options }, slots: { default: toppings } });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
```
:::
::

## FAQ

#### Checkbox Group or something else?

A Checkbox Group lets people pick any number of options from a short list. For anything else, another component will do a better job:

| When people need to…                                       | Use                                                      |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| Pick any number of options out of a few                    | Checkbox Group                                           |
| Say yes or no to one thing, like agreeing to the terms     | [Checkbox](/docs/components/checkbox)                    |
| Pick one option out of a few                               | Radio Group                                              |
| Pick one option, or several, out of many                   | Select, or Combobox                                      |
| Flip settings that take effect right away, like alerts     | A [Switch](/docs/components/switch) for each             |
| Select rows in a table                                     | A Checkbox in each row, with an `aria-label`             |

The Radio Group, the Select and the Combobox are on our [Roadmap](/docs/getting-started/roadmap).

::accordion
:::accordion-item{label="Why can't I make a group required?"}
Because HTML has no way to say it. `required` on a checkbox means that one box has to be checked, so a form with `required` on every box asks for all of them, and the browser's message names one box rather than the group. A radio group is different, since one `required` radio makes the whole group required. So for a checkbox group, say "Pick at least one" in the hint, check the value when people submit, and show the error on the group, as under [Pick at least one](/docs/components/checkbox-group#pick-at-least-one).
:::

:::accordion-item{label="Why doesn't the Checkbox Group use roving focus, like a radio group?"}
Because people check each box on its own. In a radio group, checking one option unchecks the others, so the group is one choice and one tab stop, and the arrow keys move the choice. In a checkbox group, each box is a choice of its own, so each one is a tab stop, and `Space` toggles the one that has focus, which is how native checkboxes have always worked.
:::

:::accordion-item{label="Why doesn't the select-all box bring back my last selection?"}
Because a box should do what it shows. The APG allows a select-all box that cycles from mixed to all, to none and back to the options people had picked, but then the same press does something different each time, and nothing on screen says which. Ours checks every option from unchecked or mixed, and clears them all from checked, which is what the APG asks every select-all box to do.
:::

:::accordion-item{label="Why are the options a prop, rather than Checkboxes inside it?"}
So the group can do the work that's easy to get wrong. It gives every box the same `name`, binds each one to the value, keeps them in order and works out the select-all box from them, none of which you'd want to repeat on every box. A list of options also comes straight from your data, like a list of topics from your server.
:::

:::accordion-item{label="Does the Checkbox Group work before JavaScript loads?"}
Yes, as far as HTML can take it. The server renders a real `<fieldset>`, its legend and a real checkbox for each option, so even before the page hydrates, people can check them and the form sends them. Only the select-all box has to wait: its mixed state is a property that only JavaScript can set, and checking every option from it takes a script, so until then it's a box that does nothing on its own.
:::
::

## Sources

- [HTML Standard: the fieldset element](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element), [the legend element](https://html.spec.whatwg.org/multipage/form-elements.html#the-legend-element), [the checkbox state](https://html.spec.whatwg.org/multipage/input.html#checkbox-state-%28type%3Dcheckbox%29) and [constructing the form data set](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set), for the group's name, `disabled`, what `required` means on a checkbox and what the form sends
- [WAI-ARIA Authoring Practices Guide: Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), for the select-all box's states and what checking and unchecking it does, and for describing a group with `aria-describedby`
- [APG: Checkbox (Mixed-State) Example](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/), for the `<fieldset>` and `<legend>` around the options, and `Tab` between them
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 1.3.1: Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html), for grouping related controls under a name
- [Understanding SC 3.3.2: Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html), for saying when people have to pick one
- [GOV.UK Design System: Checkboxes](https://design-system.service.gov.uk/components/checkboxes/), for legends written as questions, hints like "Select all that apply", the order of the options and options given as data
- [React Aria: CheckboxGroup](https://react-spectrum.adobe.com/react-aria/CheckboxGroup.html), for the value as a list and a vertical or horizontal orientation
