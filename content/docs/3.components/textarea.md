---
title: Textarea
description: How to build a textarea that people can label, write in at length and fix, that grows or resizes without cutting anything off, and that agents can check.
navigation:
  icon: i-lucide-text
---

Textareas are where people write more than a line, like a comment, a message, a description or a delivery note. They look like an input that's a few lines taller, which is why they're so often built as one and inherit all of its problems, along with a few of their own. Think of a box too small to see what you've written, a limit that silently cuts off the end of what you pasted, or an `Enter` key that sends a message you were still writing.

This page walks you through building one the right way. We'll look at:
- **User Interface** (UI) - how a textarea looks
- **User Experience** (UX) - how it behaves for every person and every input
- **Developer Experience** (DX) - how developers work with it
- **Agentic Experience** (AX) - how agents can read and verify it

Every example on this page runs on our [reference implementation](/docs/components/textarea#reference-implementation), which does its part of every rule in the [checklist](/docs/components/textarea#checklist), so feel free to write in them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Textarea with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/textarea#deterministic).

The Textarea is the box you write in, like the [Input](/docs/components/input) is for a single line. Its label, hint and error message are elements of their own, which you link to it by ID, and a Field component, which is on our [Roadmap](/docs/getting-started/roadmap), will put them together for you. Until then, the examples do it with a plain `<label>`, and the rules hold either way.

::textarea-playground
::

## At a glance

| Aspect   | Textarea                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------- |
| Element  | `<textarea>`, inside a `<div>` that holds its count                                               |
| Role     | `textbox`, with `aria-multiline` implied, so screen readers can tell it from an input            |
| Name     | Its `<label>`, linked with `for`, and never its placeholder                                       |
| Keyboard | The browser's own text editing, with `Enter` for a new line, which never submits its form         |
| States   | Hover, focus, disabled, read-only and invalid                                                     |
| Height   | At least `rows` lines, resized by people on the block axis, or growing with its text up to `maxRows` |
| Count    | Optional, against a `limit`, which people can type and paste past                                 |
| Sizes    | `xs`, `sm`, `md`, `lg` and `xl`, with the same padding and text as the Input                      |
| Pattern  | None in the APG, since a native [`<textarea>`](https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element) covers it |
| WCAG 2.2 | 1.3.1, 1.4.3, 1.4.4, 1.4.10, 1.4.11, 2.4.7, 2.5.8, 3.3.1, 3.3.2, 4.1.2 and 4.1.3, among others    |

## User Interface (UI)

Let's start with how a textarea looks: its parts, its sizes, how tall it is, how it counts what people write and how it shows each of its states.

### Anatomy

::textarea-anatomy
1. **Container** — The root `<div>`, which carries the size and holds the count below the field.
2. **Control** — The `<textarea>` itself, which draws the field, holds the text and takes focus. Its label names it.
3. **Resize handle** — The browser's own, in the corner, which people drag to make the field taller or shorter.
4. **Count** — Optional. How many characters are left, or how many too many, which describes the control.
5. **Focus ring** — An outline around the field, drawn outside it so nothing moves.
::

Every textarea has a container and a control. Unlike the Input, the control draws the field itself, since its resize handle and its scrollbar belong to it. The label, any hint and any error message sit outside it, in the page, and point to the control by its `id` (see [Label every textarea](/docs/components/textarea#label-every-textarea)). The parts always render in the same order, which you can see in the [DOM contract](/docs/components/textarea#deterministic).

### Sizes

The `size` prop scales the text, padding and corner radius together, and `md` is the default. They're the same as the [Input](/docs/components/input#sizes)'s, so a textarea and an input of the same size line up in a form, and a textarea of one row is exactly as tall as an input.

::textarea-sizes-example
::framework-switcher
#react
```tsx
<label htmlFor="subject-xs">Subject</label>
<Input id="subject-xs" size="xs" />
<label htmlFor="message-xs">Message</label>
<Textarea id="message-xs" size="xs" rows={1} />
{/* …sm, md, lg, xl */}
```

#vue
```vue
<label for="subject-xs">Subject</label>
<Input id="subject-xs" size="xs" />
<label for="message-xs">Message</label>
<Textarea id="message-xs" size="xs" :rows="1" />
<!-- …sm, md, lg, xl -->
```

#svelte
```svelte
<label for="subject-xs">Subject</label>
<Input id="subject-xs" size="xs" />
<label for="message-xs">Message</label>
<Textarea id="message-xs" size="xs" rows={1} />
<!-- …sm, md, lg, xl -->
```

#angular
```angular-html
<label for="subject-xs">Subject</label>
<div appInput size="xs"><input id="subject-xs" /></div>
<label for="message-xs">Message</label>
<div appTextarea size="xs"><textarea id="message-xs" rows="1"></textarea></div>
<!-- …sm, md, lg, xl -->
```

#solid
```tsx
<label for="subject-xs">Subject</label>
<Input id="subject-xs" size="xs" />
<label for="message-xs">Message</label>
<Textarea id="message-xs" size="xs" rows={1} />
{/* …sm, md, lg, xl */}
```

#astro
```astro
<label for="subject-xs">Subject</label>
<Input id="subject-xs" size="xs" />
<label for="message-xs">Message</label>
<Textarea id="message-xs" size="xs" rows={1} />
<!-- …sm, md, lg, xl -->
```

#vanilla
```html
<label for="subject-xs">Subject</label>
<div class="input" data-size="xs">
  <input data-slot="control" type="text" id="subject-xs" />
</div>
<label for="message-xs">Message</label>
<div class="textarea" data-size="xs" data-rows="1">
  <textarea data-slot="control" rows="1" id="message-xs"></textarea>
</div>
<!-- …sm, md, lg, xl -->
```
::
::

| Size | One row | Text | Line height | Padding | Radius |
| ---- | ------- | ---- | ----------- | ------- | ------ |
| `xs` | 24px    | 12px | 18px        | 8px     | 6px    |
| `sm` | 32px    | 14px | 21px        | 10px    | 6px    |
| `md` | 36px    | 14px | 21px        | 12px    | 8px    |
| `lg` | 40px    | 16px | 24px        | 14px    | 8px    |
| `xl` | 48px    | 16px | 24px        | 16px    | 12px   |

Sizes are set in `rem`, and the table shows the values we recommend at the default text size of 16px. The line height is 1.5 times the text, a little more than the Input's, since people read what they've written back over several lines. The padding above and below the text is whatever's left of one row's height, so every size meets the 24 × 24px minimum from [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). On touch screens, the text grows to at least 16px, since Safari on iOS zooms in on a textarea with smaller text as soon as it gets focus, and the field is at least 44px tall, whatever its rows.

### Height

A textarea's height says how much people are expected to write, just like an input's width. `rows` sets how many lines it shows, and it's never shorter than that, so it's the first thing to pick. From there, the height can go one of two ways. Either people resize it, by dragging the handle in its corner, or it grows with its text, with `autoGrow`, up to `maxRows`.

::textarea-height-example
::framework-switcher
#react
```tsx
<label htmlFor="address">Street address</label>
<Textarea id="address" rows={3} autoComplete="street-address" />

<label htmlFor="comment">Comment</label>
<Textarea id="comment" rows={2} autoGrow maxRows={6} />
```

#vue
```vue
<label for="address">Street address</label>
<Textarea id="address" :rows="3" autocomplete="street-address" />

<label for="comment">Comment</label>
<Textarea id="comment" :rows="2" auto-grow :max-rows="6" />
```

#svelte
```svelte
<label for="address">Street address</label>
<Textarea id="address" rows={3} autocomplete="street-address" />

<label for="comment">Comment</label>
<Textarea id="comment" rows={2} autoGrow maxRows={6} />
```

#angular
```angular-html
<label for="address">Street address</label>
<div appTextarea>
  <textarea id="address" rows="3" autocomplete="street-address"></textarea>
</div>

<label for="comment">Comment</label>
<div appTextarea autoGrow [maxRows]="6">
  <textarea id="comment" rows="2"></textarea>
</div>
```

#solid
```tsx
<label for="address">Street address</label>
<Textarea id="address" rows={3} autocomplete="street-address" />

<label for="comment">Comment</label>
<Textarea id="comment" rows={2} autoGrow maxRows={6} />
```

#astro
```astro
<label for="address">Street address</label>
<Textarea id="address" rows={3} autocomplete="street-address" />

<label for="comment">Comment</label>
<Textarea id="comment" rows={2} autoGrow maxRows={6} />
```

#vanilla
```html
<label for="address">Street address</label>
<div class="textarea" data-size="md" data-rows="3">
  <textarea data-slot="control" rows="3" id="address" autocomplete="street-address"></textarea>
</div>

<label for="comment">Comment</label>
<div class="textarea" data-size="md" data-rows="2" data-auto-grow data-max-rows="6">
  <textarea data-slot="control" rows="2" id="comment"></textarea>
</div>
```
::
::

- Pick `rows` for the text you expect, so people can see all of it as they write. Three rows suit a short note, while a message or a description might need five or more. A box that's too small makes people scroll inside it to check what they wrote, which is hard for everyone and harder still at 200% zoom.
- A resizable textarea only resizes on the block axis, taller or shorter, since a textarea that gets wider than its column breaks the layout around it ([WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)). It never gets shorter than its `rows`.
- An auto-growing textarea has no handle, since there's nothing left for people to resize. It grows with [`field-sizing: content`](https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing) where the browser supports it, and elsewhere the Textarea sets its height from a script as people type.
- Give an auto-growing textarea a `maxRows`, so that a long text doesn't push the rest of the form, and its submit button, off the screen. Past it, the text scrolls inside the field.
- We recommend letting it fill the width of its column, since lines that run the whole width of a wide screen are hard to read back, and a narrow textarea wraps them short. Set its width from a class if the column is wider than 80 characters, which is as wide as a block of text should get ([WCAG 1.4.8](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)).

### Character count

When there's a limit on how much people can write, like a bio for a profile or a message to a support team, `limit` shows a count under the field. It says how many characters are left, and once people go over, how many too many. We recommend saying what the limit is in the hint too, so people know it before they start.

::textarea-count-example
::framework-switcher
#react
```tsx
<label htmlFor="bio">Bio</label>
<p id="bio-hint">You can enter up to 160 characters</p>
<Textarea id="bio" limit={160} aria-describedby="bio-hint" />
```

#vue
```vue
<label for="bio">Bio</label>
<p id="bio-hint">You can enter up to 160 characters</p>
<Textarea id="bio" :limit="160" aria-describedby="bio-hint" />
```

#svelte
```svelte
<label for="bio">Bio</label>
<p id="bio-hint">You can enter up to 160 characters</p>
<Textarea id="bio" limit={160} aria-describedby="bio-hint" />
```

#angular
```angular-html
<label for="bio">Bio</label>
<p id="bio-hint">You can enter up to 160 characters</p>
<div appTextarea [limit]="160">
  <textarea id="bio" aria-describedby="bio-hint"></textarea>
</div>
```

#solid
```tsx
<label for="bio">Bio</label>
<p id="bio-hint">You can enter up to 160 characters</p>
<Textarea id="bio" limit={160} aria-describedby="bio-hint" />
```

#astro
```astro
<label for="bio">Bio</label>
<p id="bio-hint">You can enter up to 160 characters</p>
<Textarea id="bio" limit={160} aria-describedby="bio-hint" />
```

#vanilla
```html
<!-- The script under Developer Experience (DX) updates the count as people type. -->
<label for="bio">Bio</label>
<p id="bio-hint">You can enter up to 160 characters</p>
<div class="textarea" data-size="md" data-rows="3" data-limit="160">
  <textarea data-slot="control" rows="3" id="bio" aria-describedby="bio-hint bio-count"></textarea>
  <span data-slot="count" id="bio-count">160 characters left</span>
</div>
```
::
::

- The count never stops people typing or pasting, unlike `maxlength`. Over the limit, it turns red, says by how much, and marks the textarea invalid, so people can decide what to cut (see [Don't cut people off](/docs/components/textarea#dont-cut-people-off)).
- The count describes the textarea, after any hint, so screen readers read it when the textarea gets focus. As people near the limit, it's also announced once they pause typing, rather than on every keystroke.
- The count is named after the textarea's `id`, as in `bio-count`, so give every textarea with a limit an `id`, which its label needs anyway.
- The count's text is in English. To write it in the page's language, pass `countLabel`, which gets the number of characters left, and a negative number over the limit.

### States

Each state has a look of its own, styled from the attribute on the `<textarea>` that exposes it. That way, what people see and what assistive technologies report can never drift apart, and a textarea can't look invalid without actually being invalid.

::textarea-states-example
::framework-switcher
#react
```tsx
<label htmlFor="message">Message</label>
<Textarea id="message" rows={2} defaultValue="Could we move our call to Friday?" />

<label htmlFor="notes">Notes</label>
<Textarea id="notes" rows={2} defaultValue="Call back after 3pm" disabled />

<label htmlFor="terms">Terms</label>
<Textarea id="terms" rows={2} defaultValue="Payment is due within 30 days." readOnly />

<label htmlFor="reason">Reason for return</label>
<Textarea id="reason" rows={2} aria-invalid="true" aria-describedby="reason-error" />
<p id="reason-error">Enter a reason for returning the item</p>
```

#vue
```vue
<label for="message">Message</label>
<Textarea id="message" :rows="2" value="Could we move our call to Friday?" />

<label for="notes">Notes</label>
<Textarea id="notes" :rows="2" value="Call back after 3pm" disabled />

<label for="terms">Terms</label>
<Textarea id="terms" :rows="2" value="Payment is due within 30 days." readonly />

<label for="reason">Reason for return</label>
<Textarea id="reason" :rows="2" aria-invalid="true" aria-describedby="reason-error" />
<p id="reason-error">Enter a reason for returning the item</p>
```

#svelte
```svelte
<label for="message">Message</label>
<Textarea id="message" rows={2} value="Could we move our call to Friday?" />

<label for="notes">Notes</label>
<Textarea id="notes" rows={2} value="Call back after 3pm" disabled />

<label for="terms">Terms</label>
<Textarea id="terms" rows={2} value="Payment is due within 30 days." readonly />

<label for="reason">Reason for return</label>
<Textarea id="reason" rows={2} aria-invalid="true" aria-describedby="reason-error" />
<p id="reason-error">Enter a reason for returning the item</p>
```

#angular
```angular-html
<label for="message">Message</label>
<div appTextarea><textarea id="message" rows="2">Could we move our call to Friday?</textarea></div>

<label for="notes">Notes</label>
<div appTextarea><textarea id="notes" rows="2" disabled>Call back after 3pm</textarea></div>

<label for="terms">Terms</label>
<div appTextarea><textarea id="terms" rows="2" readonly>Payment is due within 30 days.</textarea></div>

<label for="reason">Reason for return</label>
<div appTextarea>
  <textarea id="reason" rows="2" aria-invalid="true" aria-describedby="reason-error"></textarea>
</div>
<p id="reason-error">Enter a reason for returning the item</p>
```

#solid
```tsx
<label for="message">Message</label>
<Textarea id="message" rows={2} value="Could we move our call to Friday?" />

<label for="notes">Notes</label>
<Textarea id="notes" rows={2} value="Call back after 3pm" disabled />

<label for="terms">Terms</label>
<Textarea id="terms" rows={2} value="Payment is due within 30 days." readOnly />

<label for="reason">Reason for return</label>
<Textarea id="reason" rows={2} aria-invalid="true" aria-describedby="reason-error" />
<p id="reason-error">Enter a reason for returning the item</p>
```

#astro
```astro
<label for="message">Message</label>
<Textarea id="message" rows={2} value="Could we move our call to Friday?" />

<label for="notes">Notes</label>
<Textarea id="notes" rows={2} value="Call back after 3pm" disabled />

<label for="terms">Terms</label>
<Textarea id="terms" rows={2} value="Payment is due within 30 days." readonly />

<label for="reason">Reason for return</label>
<Textarea id="reason" rows={2} aria-invalid="true" aria-describedby="reason-error" />
<p id="reason-error">Enter a reason for returning the item</p>
```

#vanilla
```html
<label for="message">Message</label>
<div class="textarea" data-size="md" data-rows="2">
  <textarea data-slot="control" rows="2" id="message">Could we move our call to Friday?</textarea>
</div>

<label for="notes">Notes</label>
<div class="textarea" data-size="md" data-rows="2">
  <textarea data-slot="control" rows="2" disabled id="notes">Call back after 3pm</textarea>
</div>

<label for="terms">Terms</label>
<div class="textarea" data-size="md" data-rows="2">
  <textarea data-slot="control" rows="2" id="terms" readonly>Payment is due within 30 days.</textarea>
</div>

<label for="reason">Reason for return</label>
<div class="textarea" data-size="md" data-rows="2">
  <textarea data-slot="control" rows="2" id="reason" aria-invalid="true" aria-describedby="reason-error"></textarea>
</div>
<p id="reason-error">Enter a reason for returning the item</p>
```
::
::

| State     | Selector                                       | Recommended look                                         |
| --------- | ---------------------------------------------- | -------------------------------------------------------- |
| Hover     | `:hover`, inside `@media (hover: hover)`       | The border at 80% of the text colour, up from 55%        |
| Focus     | `:focus-visible`                               | A 2px outline, 2px from the edge, in `--color--focus`    |
| Disabled  | `:disabled`                                    | 50% opacity, for the count too, a `not-allowed` cursor and no resize handle |
| Read-only | `[readonly]`                                   | A dashed border, with the text at full contrast, and the default cursor |
| Invalid   | `[aria-invalid="true"]`                        | A 2px border in `--color--error-text`                    |

The `<textarea>` draws the field, so it reads each state from its own attributes, and the root only dims the count along with it while it's disabled. We recommend leaving `:invalid` and `:user-invalid` out of it. The browser decides them from its own checks, like `required`, so `:invalid` matches an empty required textarea before anyone has written in it, and neither of them knows what your error message says. The invalid look comes from `aria-invalid` instead, which you set when the error message shows, and which the Textarea sets itself over its limit.

None of the states change the textarea's size or position. The invalid border's second pixel is drawn inside the field, and the focus ring outside it. You'll find how each state behaves under [Every state](/docs/components/textarea#every-state).

### Tokens

The textarea reads three [theme tokens](/docs/foundations/design-tokens#theme-tokens), which every component shares:

| Token                   | Used for                                                                    |
| ----------------------- | --------------------------------------------------------------------------- |
| `--color--neutral-text` | The text, and mixed into the border, the placeholder and the count          |
| `--color--error-text`   | The border of an invalid textarea, and the count over its limit             |
| `--color--focus`        | The focus ring, which is the same for every component                       |

There's no `color` prop, so the textarea doesn't read any of the other colours. Everything else is mixed from the text colour, as on the Input: 55% for the border, which needs 3:1 against the page, 80% for the border on hover, and 70% for the placeholder and the count, which need 4.5:1. With our reference tokens, from the Tailwind CSS palette, the border comes to 3.5:1 and the placeholder to 5.6:1 on white, and 5.0:1 and 7.4:1 on zinc-900. If you change the tokens, make sure to check the same pairs. You'll find the tokens themselves in the Button's [`tokens.css`](/docs/components/button#reference-implementation), which you can copy into your theme.

The Textarea's own variables are set on its root:

| Variable                     | What it sets                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `--textarea--height`         | The height of one row, the same as the Input's, which sets the padding       |
| `--textarea--padding`        | The padding before and after the text                                        |
| `--textarea--padding-block`  | The padding above and below the text, from the height of one row             |
| `--textarea--font-size`      | The text, and the count                                                      |
| `--textarea--radius`         | The corners                                                                  |
| `--textarea--border-color`   | The border, which hover, invalid and more contrast change                    |
| `--textarea--min-height`     | The height of `rows` lines, which resizing and growing never go below        |
| `--textarea--max-height`     | The height of `maxRows` lines, which growing stops at                        |
| `--textarea--count--color`   | The count, until it's over the limit                                         |
| `--textarea--rows`, `--textarea--max-rows` | `rows` and `maxRows`, which the Textarea sets itself, so set the props rather than these |

If you need to tune a textarea, you can set any of the others from a class, like `--textarea--radius` or `--textarea--min-height`. The Textarea's styles sit in the `components` cascade layer, so your class wins without any specificity tricks:

::framework-switcher
#react
```tsx [Feedback.tsx]
import styles from "./Feedback.module.css";

export function Feedback() {
  return (
    <>
      <label htmlFor="feedback">Feedback</label>
      <Textarea id="feedback" className={styles.soft} />
    </>
  );
}
```
```css [Feedback.module.css]
.soft {
  --textarea--radius: 1rem;
}
```

#vue
```vue
<template>
  <label for="feedback">Feedback</label>
  <Textarea id="feedback" class="soft" />
</template>

<style scoped>
.soft {
  --textarea--radius: 1rem;
}
</style>
```

#svelte
```svelte
<label for="feedback">Feedback</label>
<Textarea id="feedback" class="soft" />

<style>
  /* The class lands on the Textarea's own element, which this component's scoped styles don't reach. */
  :global(.soft) {
    --textarea--radius: 1rem;
  }
</style>
```

#angular
```angular-ts
@Component({
  selector: "app-feedback",
  imports: [Textarea],
  template: `
    <label for="feedback">Feedback</label>
    <div appTextarea class="soft">
      <textarea id="feedback"></textarea>
    </div>
  `,
  styles: `
    .soft {
      --textarea--radius: 1rem;
    }
  `,
})
export class Feedback {}
```

#solid
```tsx [Feedback.tsx]
import styles from "./Feedback.module.css";

export function Feedback() {
  return (
    <>
      <label for="feedback">Feedback</label>
      <Textarea id="feedback" class={styles.soft} />
    </>
  );
}
```
```css [Feedback.module.css]
.soft {
  --textarea--radius: 1rem;
}
```

#astro
```astro
<label for="feedback">Feedback</label>
<Textarea id="feedback" class="soft" />

<style>
  .soft {
    --textarea--radius: 1rem;
  }
</style>
```

#vanilla
```html
<label for="feedback">Feedback</label>
<div class="textarea soft" data-size="md" data-rows="3">
  <textarea data-slot="control" rows="3" id="feedback"></textarea>
</div>

<style>
  .soft {
    --textarea--radius: 1rem;
  }
</style>
```
::


## User Experience (UX)

Now let's look at how a textarea behaves for every person, input and setting. A good textarea is [accessible](/docs/components/textarea#accessible), [predictable](/docs/components/textarea#predictable), designed in [every state](/docs/components/textarea#every-state) and [adaptive](/docs/components/textarea#adaptive).

### Accessible

#### Use the native element

A native `<textarea>` gives you focus, text editing, new lines, selection, copy and paste, undo, spellcheck, autofill, scrolling, resizing and form submission, all for free. A `contenteditable` element with `role="textbox"` only gives you the editing and a role. It isn't submitted with its form, autofill skips it, pasting brings in the formatting of wherever the text came from, and screen readers and voice control handle it less reliably than a native field, so every one of those is one more thing to rebuild by hand.

::framework-switcher
#react
```tsx
{/* Do: you get editing, new lines, autofill and form submission for free */}
<label htmlFor="message">Message</label>
<textarea id="message" name="message" rows={4} />

{/* Don't: there's no form submission or autofill, and pasting brings in formatting */}
<div className="textarea" role="textbox" aria-multiline="true" contentEditable onInput={update} />
```

#vue
```vue
<!-- Do: you get editing, new lines, autofill and form submission for free -->
<label for="message">Message</label>
<textarea id="message" name="message" rows="4"></textarea>

<!-- Don't: there's no form submission or autofill, and pasting brings in formatting -->
<div class="textarea" role="textbox" aria-multiline="true" contenteditable @input="update"></div>
```

#svelte
```svelte
<!-- Do: you get editing, new lines, autofill and form submission for free -->
<label for="message">Message</label>
<textarea id="message" name="message" rows="4"></textarea>

<!-- Don't: there's no form submission or autofill, and pasting brings in formatting -->
<div class="textarea" role="textbox" aria-multiline="true" contenteditable oninput={update}></div>
```

#angular
```angular-html
<!-- Do: you get editing, new lines, autofill and form submission for free -->
<label for="message">Message</label>
<textarea id="message" name="message" rows="4"></textarea>

<!-- Don't: there's no form submission or autofill, and pasting brings in formatting -->
<div class="textarea" role="textbox" aria-multiline="true" contenteditable (input)="update()"></div>
```

#solid
```tsx
{/* Do: you get editing, new lines, autofill and form submission for free */}
<label for="message">Message</label>
<textarea id="message" name="message" rows={4} />

{/* Don't: there's no form submission or autofill, and pasting brings in formatting */}
<div class="textarea" role="textbox" aria-multiline="true" contentEditable onInput={update} />
```

#astro
```astro
<!-- Do: you get editing, new lines, autofill and form submission for free -->
<label for="message">Message</label>
<textarea id="message" name="message" rows="4"></textarea>

<!-- Don't: there's no form submission or autofill, and pasting brings in formatting -->
<div class="textarea" role="textbox" aria-multiline="true" contenteditable></div>
```

#vanilla
```html
<!-- Do: you get editing, new lines, autofill and form submission for free -->
<label for="message">Message</label>
<textarea id="message" name="message" rows="4"></textarea>

<!-- Don't: there's no form submission or autofill, and pasting brings in formatting -->
<div class="textarea" role="textbox" aria-multiline="true" contenteditable></div>
```
::

If people need formatting, like bold text and lists, that's a rich text editor, which is a different component with a lot more to it. For plain text, keep to the `<textarea>`.

#### Label every textarea

The label is also the textarea's accessible name. Screen readers read it when the textarea gets focus, voice control users say it out loud ("click Message"), and tests and agents use it to find the textarea.

::textarea-label-example
::framework-switcher
#react
```tsx
<label htmlFor="details">What went wrong?</label>
<p id="details-hint">Include what you were doing, and any error message you saw</p>
<Textarea id="details" rows={4} aria-describedby="details-hint" />
```

#vue
```vue
<label for="details">What went wrong?</label>
<p id="details-hint">Include what you were doing, and any error message you saw</p>
<Textarea id="details" :rows="4" aria-describedby="details-hint" />
```

#svelte
```svelte
<label for="details">What went wrong?</label>
<p id="details-hint">Include what you were doing, and any error message you saw</p>
<Textarea id="details" rows={4} aria-describedby="details-hint" />
```

#angular
```angular-html
<label for="details">What went wrong?</label>
<p id="details-hint">Include what you were doing, and any error message you saw</p>
<div appTextarea>
  <textarea id="details" rows="4" aria-describedby="details-hint"></textarea>
</div>
```

#solid
```tsx
<label for="details">What went wrong?</label>
<p id="details-hint">Include what you were doing, and any error message you saw</p>
<Textarea id="details" rows={4} aria-describedby="details-hint" />
```

#astro
```astro
<label for="details">What went wrong?</label>
<p id="details-hint">Include what you were doing, and any error message you saw</p>
<Textarea id="details" rows={4} aria-describedby="details-hint" />
```

#vanilla
```html
<label for="details">What went wrong?</label>
<p id="details-hint">Include what you were doing, and any error message you saw</p>
<div class="textarea" data-size="md" data-rows="4">
  <textarea data-slot="control" rows="4" id="details" aria-describedby="details-hint"></textarea>
</div>
```
::
::

- Every textarea has a visible `<label>`, linked to it with `for` and the textarea's `id` ([WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html), [3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)). Clicking the label focuses the textarea too.
- A hint, like what to include or how long it can be, goes in the textarea's description, which screen readers read after its name. You can do that with `aria-describedby`, pointing at the hint's `id`. The Textarea adds its count after it.
- If you name a textarea with `aria-label` or `aria-labelledby`, make sure the name includes the visible label, ideally at the start ([WCAG 2.5.3](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)).
- The Textarea doesn't make up IDs of its own (see [Deterministic](/docs/components/textarea#deterministic)), so give it an `id` for its label to point at, and one to each hint and error message that points back at it.

A placeholder isn't a label. It disappears as soon as people start writing, so they can't check what they were asked for, it's lighter than the text around it, so it's harder to read, and it isn't a reliable name for assistive technologies. In a textarea, a long placeholder also looks like text that's already been written. If you use one at all, keep it to a short example, and put anything people need to know in the hint.

#### Contrast and size

- The text needs a contrast of at least 4.5:1 with its background, and so do the placeholder and the count, since people need to read them too ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)). Disabled textareas are exempt, but they should still be readable.
- The border needs 3:1 against the page ([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)). An empty textarea is nothing but its border, so it's how people see that there's something to fill in. The focus ring needs 3:1 as well.
- Every textarea is at least 24px tall ([WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)), and on touch screens at least 44px ([WCAG 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)), however few rows it has.

#### Show focus

When a textarea has focus, it shows an outline in the same focus colour as every other component ([WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)). Like the Button's and the Input's, it's at least 2px thick and drawn outside the border, and we recommend 2px for both. Browsers match `:focus-visible` on a textarea however it got focus, since people are about to write either way, so the ring shows after a click too.

You'll also want to keep focused textareas clear of sticky headers and footers, which you can do with `scroll-padding` ([WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [2.4.12](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html)). On phones, the on-screen keyboard covers the bottom of the page too, and an auto-growing textarea gets taller as people write, so check that the line they're writing on stays in view above it.

### Predictable

#### Leave typing to the browser

The Textarea leaves text editing to the browser, so moving the caret, selecting, copying, cutting, pasting, undoing and spellchecking all work just as they do everywhere else. We recommend never taking any of them over, and never blocking paste. People write longer text somewhere else and paste it in, like a cover letter or a bug report, and blocking paste makes them type it all again by hand.

#### Keyboard

| Key                       | Textarea                                                       |
| ------------------------- | -------------------------------------------------------------- |
| `Tab`, `Shift+Tab`        | Move focus to and from the textarea                            |
| Arrows, `Home` and `End`  | Move the caret, line by line and within a line                 |
| `Enter`                   | Starts a new line, and never submits its form                  |

`Enter` starts a new line in a textarea, which HTML leaves out of [implicit submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission), so a form with a textarea needs a submit button that people can reach with `Tab`. We recommend never making `Enter` send the form, even in a chat. People press it for a new line out of habit, and a message sent half-written can't be taken back. If you'd like a shortcut to send, use one that can't be pressed by accident, like `Ctrl+Enter` or `Cmd+Enter`, and say what it is next to the submit button.

`Tab` moves focus out of a textarea rather than typing a tab, as it should, so keyboard users never get stuck in it ([WCAG 2.1.2](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)). If your textarea is for code, where people expect `Tab` to indent, make sure `Escape` then `Tab` still moves focus on, and say so in the hint.

#### Don't cut people off

`maxlength` stops people typing past a limit, but it also silently cuts off what they paste, and they may never notice that the end is missing. The Textarea's `limit` counts instead. People can type and paste past it, the count says by how much, and the textarea is marked invalid until they've cut it back, so they decide what to keep. Check the limit on the server too, since the count only helps people stay within it.

The count is a status message, so screen reader users hear it without leaving the textarea ([WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)). It would talk over them if it were announced on every keystroke, though, so the Textarea waits until people pause for a second, and only announces it once they've used 80% of the limit, or gone over. It goes through the same polite live region as the Button's loading announcement, one for the whole page, which you can read about under the Button's [Loading](/docs/components/button/ux#loading).

#### Help people fill it in

- If a textarea asks for the person's own address, give it `autocomplete="street-address"`, which the HTML standard keeps for a multi-line address ([WCAG 1.3.5](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html)). Browsers then fill it in for them, which helps everyone, and most of all people who find typing hard.
- Leave spellcheck on for prose, as browsers already do for a textarea. Turn it off with `spellcheck="false"` only for text that isn't words, like code or a list of IDs.
- Keep what people have written if something goes wrong, like a failed submit or a page they leave by accident. Losing a long message is far worse than losing a single field.

### Every state

#### Disabled

A disabled textarea can't be focused, edited or submitted. `disabled` sets the native attribute, so the textarea leaves the tab order, screen readers announce it as dimmed or unavailable when they read through the page, and its form leaves its text out when it's sent. It can't be resized either, since nobody can write in it, so there's nothing to make room for. If people need to read or copy the text, and the form needs to send it, the textarea should be [read-only](/docs/components/textarea#read-only) instead.

We recommend disabling as little as you can, since a disabled textarea can't explain why it's disabled, and keyboard users can't even reach it to find out. Never disable one while it has focus, either, like while its form is being sent. Disabling a focused textarea takes its focus away, and keyboard and screen reader users lose their place. Make it read-only while the form is sent instead.

#### Read-only

A read-only textarea shows text that people can't change, like the terms of an agreement or a message they've already sent. It stays in the tab order, so people can focus it, scroll it, select the text and copy it, screen readers announce it as read-only, and its form still sends it. `readonly` is a native attribute, so it lands on the `<textarea>` like any other. We recommend a dashed border, which tells it apart from a textarea you can write in, while the text keeps its full contrast. If the text never changes, a paragraph might be a better fit.

#### Invalid

An invalid textarea has text that needs fixing, and an error message that says how. The Textarea shows the state, and the page decides when to show it, since only the page knows what makes the text right. The one exception is its limit: over it, the Textarea marks itself invalid, and its count says by how much.

::textarea-validation-example
::framework-switcher
#react
```tsx
import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";

const LIMIT = 200;

export function Contact() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);

  function update(value: string) {
    setMessage(value);
    // Once an error shows, check again as people type, so it clears as soon as it's fixed.
    if (error) setError(validateMessage(value, LIMIT));
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = validateMessage(message, LIMIT);
    if (text) {
      // Focus once the error is in the page, so screen readers read it with the textarea.
      flushSync(() => {
        setError(text);
        setStatus("Couldn't send your message. Check what you've written.");
      });
      textarea.current?.focus();
      return;
    }
    await api.send(message);
    setStatus("Message sent");
  }

  return (
    <form noValidate onSubmit={send}>
      <label htmlFor="message">Message</label>
      <p id="message-hint">You can enter up to {LIMIT} characters</p>
      <Textarea
        ref={textarea}
        id="message"
        limit={LIMIT}
        required
        value={message}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "message-error message-hint" : "message-hint"}
        onChange={(event) => update(event.target.value)}
      />
      {error && <p id="message-error">{error}</p>}
      <Button type="submit" color="primary">Send</Button>
      <p role="status">{status}</p>
    </form>
  );
}
```

#vue
```vue
<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from "vue";

const LIMIT = 200;
const message = ref("");
const error = ref("");
const status = ref("");
const messageTextarea = useTemplateRef("message-textarea");

function update(value = "") {
  message.value = value;
  // Once an error shows, check again as people type, so it clears as soon as it's fixed.
  if (error.value) error.value = validateMessage(value, LIMIT);
}

async function send() {
  error.value = validateMessage(message.value, LIMIT);
  if (error.value) {
    status.value = "Couldn't send your message. Check what you've written.";
    // Focus once the error is in the page, so screen readers read it with the textarea.
    await nextTick();
    messageTextarea.value?.textarea?.focus();
    return;
  }
  await api.send(message.value);
  status.value = "Message sent";
}
</script>

<template>
  <form novalidate @submit.prevent="send">
    <label for="message">Message</label>
    <p id="message-hint">You can enter up to {{ LIMIT }} characters</p>
    <Textarea
      id="message"
      ref="message-textarea"
      :limit="LIMIT"
      required
      :model-value="message"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? 'message-error message-hint' : 'message-hint'"
      @update:model-value="update"
    />
    <p v-if="error" id="message-error">{{ error }}</p>
    <Button type="submit" color="primary">Send</Button>
    <p role="status">{{ status }}</p>
  </form>
</template>
```

#svelte
```svelte
<script lang="ts">
  import { tick } from "svelte";

  const LIMIT = 200;
  let message = $state("");
  let error = $state("");
  let status = $state("");
  let textarea = $state<HTMLTextAreaElement>();

  // Once an error shows, check again as people type, so it clears as soon as it's fixed.
  function update(event: Event) {
    if (error) error = validateMessage((event.currentTarget as HTMLTextAreaElement).value, LIMIT);
  }

  async function send(event: SubmitEvent) {
    event.preventDefault();
    error = validateMessage(message, LIMIT);
    if (error) {
      status = "Couldn't send your message. Check what you've written.";
      // Focus once the error is in the page, so screen readers read it with the textarea.
      await tick();
      textarea?.focus();
      return;
    }
    await api.send(message);
    status = "Message sent";
  }
</script>

<form novalidate onsubmit={send}>
  <label for="message">Message</label>
  <p id="message-hint">You can enter up to {LIMIT} characters</p>
  <Textarea
    bind:ref={textarea}
    bind:value={message}
    id="message"
    limit={LIMIT}
    required
    aria-invalid={error ? true : undefined}
    aria-describedby={error ? "message-error message-hint" : "message-hint"}
    oninput={update}
  />
  {#if error}<p id="message-error">{error}</p>{/if}
  <Button type="submit" color="primary">Send</Button>
  <p role="status">{status}</p>
</form>
```

#angular
```angular-ts
import { Component, ElementRef, Injector, afterNextRender, inject, signal, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";

const LIMIT = 200;

@Component({
  selector: "app-contact",
  imports: [FormsModule, Textarea, Button],
  template: `
    <form novalidate (ngSubmit)="send()">
      <label for="message">Message</label>
      <p id="message-hint">You can enter up to {{ limit }} characters</p>
      <div appTextarea [limit]="limit">
        <textarea
          #message
          id="message"
          name="message"
          required
          [ngModel]="value()"
          (ngModelChange)="update($event)"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="error() ? 'message-error message-hint' : 'message-hint'"
        ></textarea>
      </div>
      @if (error()) {
        <p id="message-error">{{ error() }}</p>
      }
      <button appButton type="submit" color="primary">Send</button>
      <p role="status">{{ status() }}</p>
    </form>
  `,
})
export class Contact {
  limit = LIMIT;
  value = signal("");
  error = signal("");
  status = signal("");
  message = viewChild.required<ElementRef<HTMLTextAreaElement>>("message");
  injector = inject(Injector);

  update(value: string) {
    this.value.set(value);
    // Once an error shows, check again as people type, so it clears as soon as it's fixed.
    if (this.error()) this.error.set(validateMessage(value, LIMIT));
  }

  async send() {
    this.error.set(validateMessage(this.value(), LIMIT));
    if (this.error()) {
      this.status.set("Couldn't send your message. Check what you've written.");
      // Focus once the error is in the page, so screen readers read it with the textarea.
      afterNextRender(() => this.message().nativeElement.focus(), { injector: this.injector });
      return;
    }
    await api.send(this.value());
    this.status.set("Message sent");
  }
}
```

#solid
```tsx
import { Show, createSignal } from "solid-js";

const LIMIT = 200;

export function Contact() {
  const [message, setMessage] = createSignal("");
  const [error, setError] = createSignal("");
  const [status, setStatus] = createSignal("");
  let textarea!: HTMLTextAreaElement;

  function update(value: string) {
    setMessage(value);
    // Once an error shows, check again as people type, so it clears as soon as it's fixed.
    if (error()) setError(validateMessage(value, LIMIT));
  }

  async function send(event: SubmitEvent) {
    event.preventDefault();
    setError(validateMessage(message(), LIMIT));
    if (error()) {
      setStatus("Couldn't send your message. Check what you've written.");
      // Solid updates the page as soon as a signal changes, so the error is already in it.
      textarea.focus();
      return;
    }
    await api.send(message());
    setStatus("Message sent");
  }

  return (
    <form novalidate onSubmit={send}>
      <label for="message">Message</label>
      <p id="message-hint">You can enter up to {LIMIT} characters</p>
      <Textarea
        ref={textarea}
        id="message"
        limit={LIMIT}
        required
        value={message()}
        aria-invalid={error() ? true : undefined}
        aria-describedby={error() ? "message-error message-hint" : "message-hint"}
        onInput={(event) => update(event.currentTarget.value)}
      />
      <Show when={error()}>
        <p id="message-error">{error()}</p>
      </Show>
      <Button type="submit" color="primary">Send</Button>
      <p role="status">{status()}</p>
    </form>
  );
}
```

#astro
```astro
<form id="contact" novalidate>
  <label for="message">Message</label>
  <p id="message-hint">You can enter up to 200 characters</p>
  <Textarea id="message" name="message" limit={200} required aria-describedby="message-hint" />
  <p id="message-error" hidden></p>
  <Button type="submit" color="primary">Send</Button>
  <p id="status" role="status"></p>
</form>

<script>
  const form = document.querySelector<HTMLFormElement>("#contact")!;
  const message = document.querySelector<HTMLTextAreaElement>("#message")!;
  const error = document.querySelector<HTMLElement>("#message-error")!;
  const status = document.querySelector("#status")!;
  // The Textarea adds its count to the description, so keep it when the error comes and goes.
  const description = message.getAttribute("aria-describedby")!;

  // Shows the error message, or hides it, along with the attributes that tie it to the textarea.
  function check() {
    const text = validateMessage(message.value, 200);
    error.textContent = text;
    error.hidden = !text;
    message.setAttribute("aria-describedby", text ? `message-error ${description}` : description);
    if (text) message.setAttribute("aria-invalid", "true");
    else message.removeAttribute("aria-invalid");
    return text;
  }

  // Once an error shows, check again as people type, so it clears as soon as it's fixed.
  message.addEventListener("input", () => !error.hidden && check());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (check()) {
      status.textContent = "Couldn't send your message. Check what you've written.";
      message.focus();
      return;
    }
    await api.send(message.value);
    status.textContent = "Message sent";
  });
</script>
```

#vanilla
```html
<form id="contact" novalidate>
  <label for="message">Message</label>
  <p id="message-hint">You can enter up to 200 characters</p>
  <div class="textarea" data-size="md" data-rows="3" data-limit="200">
    <textarea data-slot="control" rows="3" id="message" name="message" required aria-describedby="message-hint message-count"></textarea>
    <span data-slot="count" id="message-count">200 characters left</span>
  </div>
  <p id="message-error" hidden></p>
  <button class="button" type="submit" data-variant="solid" data-color="primary" data-size="md">
    <span data-slot="label">Send</span>
  </button>
  <p id="status" role="status"></p>
</form>

<script type="module">
  const form = document.querySelector("#contact");
  const message = document.querySelector("#message");
  const error = document.querySelector("#message-error");
  const status = document.querySelector("#status");

  // Shows the error message, or hides it, along with the attributes that tie it to the textarea.
  // Over the limit, the count's own script keeps aria-invalid set.
  function check() {
    const text = validateMessage(message.value, 200);
    error.textContent = text;
    error.hidden = !text;
    const description = "message-hint message-count";
    message.setAttribute("aria-describedby", text ? `message-error ${description}` : description);
    if (text) message.setAttribute("aria-invalid", "true");
    else message.removeAttribute("aria-invalid");
    return text;
  }

  // Once an error shows, check again as people type, so it clears as soon as it's fixed.
  message.addEventListener("input", () => !error.hidden && check());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (check()) {
      status.textContent = "Couldn't send your message. Check what you've written.";
      message.focus();
      return;
    }
    await api.send(message.value);
    status.textContent = "Message sent";
  });
</script>
```
::
::

`validateMessage` stands in for your own check, which returns an error message, like "Enter a message", or "Message must be 200 characters or fewer" over the limit, and an empty string when the message is fine. Try pressing `Enter` in the example: it starts a new line, and only Send sends the form.

- Set `aria-invalid="true"` on the textarea while its error message shows, and point `aria-describedby` at the message, before the hint. Screen readers then announce the textarea as invalid, and read the message right after its name ([WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)).
- Say what's wrong and how to fix it, as in "Message must be 200 characters or fewer", rather than "Invalid input" ([WCAG 3.3.3](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)). A red border alone can't say any of that, and it means nothing to people who can't tell red apart ([WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- Check the text when people submit, or when they leave the textarea, and not while they're still writing it. Once an error shows, check again as they type, and clear it as soon as the text is right. The count is the exception, since it's how people keep within the limit as they write.
- When a submit fails, move focus to the first invalid field, once the error is in the page, so keyboard and screen reader users land right on it and hear its error. As on the Input, a status message says what happened, since moving focus to a field that already has it doesn't announce anything.
- Put `novalidate` on the form, so that the browser's own error bubbles don't compete with yours, and keep `required` on the textarea, which tells screen readers that it's required.

### Adaptive

#### Pointer, touch and pen

- Hover styles only apply to pointers that can actually hover (`@media (hover: hover)`), otherwise a tap would leave the border looking hovered.
- On touch screens, the textarea is at least 44px tall, whatever its rows, and its text is at least 16px, whatever its size. Safari on iOS zooms in on a textarea with smaller text as soon as it gets focus, and people then have to zoom back out to see the rest of the form.
- The resize handle is small, and hard to drag with a finger, so on touch screens we recommend giving the textarea enough rows, or `autoGrow`, rather than relying on it.

#### More contrast

When someone asks for more contrast (`prefers-contrast: more`), as with Increase contrast on macOS and iOS, the border is drawn in the text colour at full strength, rather than at 55%. The text, the placeholder and the count already pass 4.5:1, so they stay as they are.

#### Forced colours

Windows contrast themes replace every colour with the user's own, and drop backgrounds and shadows. The Textarea's border stays, since the system draws it in a colour of its own, focus is drawn with `outline`, and a disabled textarea is marked with `GrayText`. A read-only textarea's border stays dashed. The invalid border's second pixel is a shadow, and the count's red is a colour, which forced colours drop, so in these themes it's the words, in the error message and the count, that tell people something's wrong.

#### Colour scheme

The tokens use `light-dark()`, which follows `color-scheme`, so the Textarea adapts to your light and dark themes on its own. Setting `color-scheme` on your themes also lets the browser match the parts of the textarea it draws itself, like its scrollbar and its resize handle.

#### Text size and spacing

Heights are minimums, in lines and `rem`, so the field grows with its text instead of clipping it, at 200% text size ([WCAG 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)) and with wider line, letter and word spacing ([WCAG 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)). Each row is one line of text at the textarea's own line height, with the `lh` unit, so a textarea of three rows still shows three lines when people widen the line spacing. The text wraps within the width of the field, so it never scrolls sideways.

#### Languages and direction

The Textarea uses logical properties, and resizes on the block axis rather than the vertical one, so it works the same in right-to-left languages and in vertical writing. What people write needs a little help, though:

::textarea-languages-example
::framework-switcher
#react
```tsx
<div dir="rtl" lang="ar">
  <label htmlFor="message">الرسالة</label>
  <Textarea id="message" dir="auto" rows={3} />
</div>
```

#vue
```vue
<div dir="rtl" lang="ar">
  <label for="message">الرسالة</label>
  <Textarea id="message" dir="auto" :rows="3" />
</div>
```

#svelte
```svelte
<div dir="rtl" lang="ar">
  <label for="message">الرسالة</label>
  <Textarea id="message" dir="auto" rows={3} />
</div>
```

#angular
```angular-html
<div dir="rtl" lang="ar">
  <label for="message">الرسالة</label>
  <div appTextarea><textarea id="message" dir="auto" rows="3"></textarea></div>
</div>
```

#solid
```tsx
<div dir="rtl" lang="ar">
  <label for="message">الرسالة</label>
  <Textarea id="message" dir="auto" rows={3} />
</div>
```

#astro
```astro
<div dir="rtl" lang="ar">
  <label for="message">الرسالة</label>
  <Textarea id="message" dir="auto" rows={3} />
</div>
```

#vanilla
```html
<div dir="rtl" lang="ar">
  <label for="message">الرسالة</label>
  <div class="textarea" data-size="md" data-rows="3">
    <textarea data-slot="control" rows="3" id="message" dir="auto"></textarea>
  </div>
</div>
```
::
::

- People can write in either direction, so give a textarea `dir="auto"`, which lands on the `<textarea>`, and lets it follow whatever they write, while the page around it keeps its own direction.
- Translate the count along with labels, hints and error messages, with `countLabel`, and mark any text that's in another language with `lang`, so that screen readers pronounce it correctly ([WCAG 3.1.2](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html)).

## Developer Experience (DX)

Next, let's look at how developers use the Textarea. It has the Input's API, with the same names as every other component, it's typed end to end, and it works with your forms however you build them.

::framework-switcher
#react
```tsx
import { useState } from "react";
import { Textarea } from "@/components/Textarea";

export function Profile() {
  const [bio, setBio] = useState("");

  return (
    <>
      <label htmlFor="bio">Bio</label>
      <p id="bio-hint">You can enter up to 160 characters</p>
      <Textarea
        id="bio"
        limit={160}
        aria-describedby="bio-hint"
        value={bio}
        onChange={(event) => setBio(event.target.value)}
      />
    </>
  );
}
```

#vue
```vue
<script setup lang="ts">
import { ref } from "vue";
import Textarea from "@/components/Textarea.vue";

const bio = ref("");
</script>

<template>
  <label for="bio">Bio</label>
  <p id="bio-hint">You can enter up to 160 characters</p>
  <Textarea id="bio" v-model="bio" :limit="160" aria-describedby="bio-hint" />
</template>
```

#svelte
```svelte
<script lang="ts">
  import Textarea from "$lib/components/Textarea.svelte";

  let bio = $state("");
</script>

<label for="bio">Bio</label>
<p id="bio-hint">You can enter up to 160 characters</p>
<Textarea id="bio" bind:value={bio} limit={160} aria-describedby="bio-hint" />
```

#angular
```angular-ts
import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Textarea } from "./textarea";

@Component({
  selector: "app-profile",
  imports: [FormsModule, Textarea],
  template: `
    <label for="bio">Bio</label>
    <p id="bio-hint">You can enter up to 160 characters</p>
    <div appTextarea [limit]="160">
      <textarea id="bio" aria-describedby="bio-hint" [(ngModel)]="bio"></textarea>
    </div>
  `,
})
export class Profile {
  bio = signal("");
}
```

#solid
```tsx
import { createSignal } from "solid-js";
import { Textarea } from "~/components/Textarea";

export function Profile() {
  const [bio, setBio] = createSignal("");

  return (
    <>
      <label for="bio">Bio</label>
      <p id="bio-hint">You can enter up to 160 characters</p>
      <Textarea
        id="bio"
        limit={160}
        aria-describedby="bio-hint"
        value={bio()}
        onInput={(event) => setBio(event.currentTarget.value)}
      />
    </>
  );
}
```

#astro
```astro
---
import Textarea from "../components/Textarea.astro";
---

<label for="bio">Bio</label>
<p id="bio-hint">You can enter up to 160 characters</p>
<Textarea id="bio" name="bio" limit={160} aria-describedby="bio-hint" />
```

#vanilla
```html
<link rel="stylesheet" href="/styles/textarea.css" />

<label for="bio">Bio</label>
<p id="bio-hint">You can enter up to 160 characters</p>
<div class="textarea" data-size="md" data-rows="3" data-limit="160">
  <textarea data-slot="control" rows="3" id="bio" name="bio" aria-describedby="bio-hint bio-count"></textarea>
  <span data-slot="count" id="bio-count">160 characters left</span>
</div>

<script type="module">
  import { announce, prepareAnnouncer } from "./announce.js";

  const countLabel = (remaining) => {
    const count = Math.abs(remaining);
    const characters = count === 1 ? "character" : "characters";
    return remaining < 0 ? `${count} ${characters} too many` : `${count} ${characters} left`;
  };
  const growsItself = CSS.supports("field-sizing", "content");

  for (const field of document.querySelectorAll(".textarea")) {
    const textarea = field.querySelector('[data-slot="control"]');
    const count = field.querySelector('[data-slot="count"]');
    const limit = Number(field.dataset.limit);
    let timer;
    let announced = "";
    // Browsers without typed attr() can't read data-rows and data-max-rows, so the
    // rows become the variables that set the heights, through the CSSOM, which a
    // strict Content Security Policy allows.
    field.style.setProperty("--textarea--rows", field.dataset.rows);
    if (field.dataset.maxRows) field.style.setProperty("--textarea--max-rows", field.dataset.maxRows);
    // Screen readers only announce changes to a live region that's already in the page.
    if (count) prepareAnnouncer();

    function update() {
      // Browsers without field-sizing get the height of the text, which max-height caps.
      if (field.hasAttribute("data-auto-grow") && !growsItself) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight + textarea.offsetHeight - textarea.clientHeight}px`;
      }
      if (!count) return;

      // Code points rather than UTF-16 code units, which is how many databases count a limit.
      const remaining = limit - [...textarea.value].length;
      const over = remaining < 0;
      // Only when it crosses the limit, so an error message the page set stays put.
      if (over !== count.hasAttribute("data-over-limit")) {
        if (over) textarea.setAttribute("aria-invalid", "true");
        else textarea.removeAttribute("aria-invalid");
      }
      count.toggleAttribute("data-over-limit", over);
      count.textContent = countLabel(remaining);
    }

    textarea.addEventListener("input", () => {
      update();
      if (!count) return;
      // Announced once people pause near the limit, rather than on every keystroke.
      clearTimeout(timer);
      timer = setTimeout(() => {
        const near = limit - [...textarea.value].length <= limit * 0.2;
        if (!near || count.textContent === announced) return;
        announced = count.textContent;
        announce(announced);
      }, 1000);
    });
    // A form reset puts the first value back without an input event, after the reset
    // event and, for a click on a reset button, after the microtasks that follow it too.
    textarea.form?.addEventListener("reset", () => setTimeout(update));
  }
</script>
```
::

### Consistent

Once you've learned the [Input](/docs/components/input#consistent)'s API, you already know most of the Textarea's. These names mean the same thing everywhere in Open Components:

| Name       | Kind  | What it means                                                           |
| ---------- | ----- | ----------------------------------------------------------------------- |
| `size`     | Prop  | `xs`, `sm`, `md`, `lg` or `xl`, with the same text and padding everywhere |
| `disabled` | Prop  | The component can't be used                                             |
| `value`    | Prop  | The value, which you bind the way your framework binds a form control's |

The rest are the Textarea's own: `rows`, the native attribute, `autoGrow` and `maxRows` for its height, and `limit` and `countLabel` for its count. We recommend `size="md"` and `rows="3"` as the defaults. The Textarea also leaves a few props out, on purpose:

- There's no `variant` or `color`, for the same reasons as the Input: the fields in a form are all equally important, a field without a border would be invisible when it's empty, and its one coloured state, invalid, comes from `aria-invalid`.
- There's no `label`, `hint` or `error`. Each of them is an element of its own, linked by ID, which the Field on our Roadmap will render.
- There's no `maxlength` either. `limit` takes its place, since it counts without cutting anything off. The native attribute still lands on the `<textarea>` if you pass it, but we recommend against it (see [Don't cut people off](/docs/components/textarea#dont-cut-people-off)).
- There's no `resize`. A textarea people resize on the block axis, or one that grows on its own, covers what people need, and turning resizing off without growing leaves them stuck with whatever height you picked. The one exception is a disabled textarea, which has no resize handle, since nobody can write in it then.
- There are no `leading`, `trailing` or `actions` slots. A textarea holds plain text over several lines, so an icon or a button inside it would sit in the way of what people write. Put buttons, like Send, after it in the form.

### Type-safe

Props and events are typed, so your editor can autocomplete them and your type checker (`tsc`, `vue-tsc`, `svelte-check`, `ngc` or `astro check`) catches mistakes like `rows="three"` or `size="medium"`.

| Prop         | Type                                       | Default   | Description                                                                 |
| ------------ | ------------------------------------------ | --------- | --------------------------------------------------------------------------- |
| `size`       | `"xs" \| "sm" \| "md" \| "lg" \| "xl"`     | `"md"`    | How big its text and padding are                                            |
| `rows`       | `number`                                   | `3`       | How many lines it shows, and is never shorter than                          |
| `autoGrow`   | `boolean`                                  | `false`   | Grows with its text instead of scrolling, and can't be resized              |
| `maxRows`    | `number`                                   |           | How many lines it grows to with `autoGrow`, before it scrolls               |
| `limit`      | `number`                                   |           | The most characters it takes, which shows a count and never cuts people off |
| `countLabel` | `(remaining: number) => string`            |           | The count's text, for the characters left, which are negative over the limit |
| `disabled`   | `boolean`                                  | `false`   | Blocks focus, editing and submission                                        |
| `value`      | `string`                                   |           | The value, when you bind it. Without it, the textarea keeps its own         |

| Event    | Payload | Description                                                              |
| -------- | ------- | ------------------------------------------------------------------------ |
| `input`  | `Event` | Fires as people type                                                     |
| `change` | `Event` | Fires when people commit a change, like when they leave the textarea     |

Both come straight from the `<textarea>`, like every other native event, such as `focus` and `blur`, and a binding to `value` listens to them for you. The Textarea has no slots.

We also export `TextareaProps`, which comes in handy for wrappers and data-driven forms:

::framework-switcher
#react
```ts
import type { TextareaProps } from "@/components/Textarea";

const fields: (TextareaProps & { name: string; label: string })[] = [
  { name: "bio", label: "Bio", limit: 160 },
  { name: "address", label: "Street address", rows: 3 },
];
```

#vue
```ts
import type { TextareaProps } from "@/components/Textarea.vue";

const fields: (TextareaProps & { name: string; label: string })[] = [
  { name: "bio", label: "Bio", limit: 160 },
  { name: "address", label: "Street address", rows: 3 },
];
```

#svelte
```ts
import type { TextareaProps } from "$lib/components/Textarea.svelte";

const fields: (TextareaProps & { name: string; label: string })[] = [
  { name: "bio", label: "Bio", limit: 160 },
  { name: "address", label: "Street address", rows: 3 },
];
```

#angular
```ts
import type { TextareaProps } from "./textarea";

const fields: (TextareaProps & { name: string; label: string })[] = [
  { name: "bio", label: "Bio", limit: 160 },
  { name: "address", label: "Street address", rows: 3 },
];
```

#solid
```ts
import type { TextareaProps } from "~/components/Textarea";

const fields: (TextareaProps & { name: string; label: string })[] = [
  { name: "bio", label: "Bio", limit: 160 },
  { name: "address", label: "Street address", rows: 3 },
];
```

#astro
```ts
import type { ComponentProps } from "astro/types";
import Textarea from "../components/Textarea.astro";

type TextareaProps = ComponentProps<typeof Textarea>;

const fields: (TextareaProps & { name: string; label: string })[] = [
  { name: "bio", label: "Bio", limit: 160 },
  { name: "address", label: "Street address", rows: 3 },
];
```
::

### Composable

The Textarea renders two elements, so it splits what you pass between them, just like the Input. Classes and styles go on the root, so a class can set its variables and its width. Everything else lands on the `<textarea>`, including `id`, `name`, `placeholder`, `required`, `readonly`, `autocomplete`, `spellcheck`, `dir`, ARIA attributes and event listeners. A ref to the Textarea reaches the `<textarea>` too, since that's what form libraries and `focus()` need.

#### Forms

The `<textarea>` is a real form control, so the Textarea works with your forms however you build them. You can bind its value, as above, or leave it to the browser and read it from the form when it's sent, by its `name`. That also means the form works before your JavaScript loads.

::framework-switcher
#react
```tsx
import type { FormEvent } from "react";

export function Support() {
  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    api.send(data.get("subject"), data.get("message"));
  }

  return (
    <form onSubmit={send}>
      <label htmlFor="subject">Subject</label>
      <Input id="subject" name="subject" />
      <label htmlFor="message">Message</label>
      <Textarea id="message" name="message" rows={5} />
      <Button type="submit" color="primary">Send</Button>
    </form>
  );
}
```

#vue
```vue
<script setup lang="ts">
function send(event: SubmitEvent) {
  const data = new FormData(event.target as HTMLFormElement);
  api.send(data.get("subject"), data.get("message"));
}
</script>

<template>
  <form @submit.prevent="send">
    <label for="subject">Subject</label>
    <Input id="subject" name="subject" />
    <label for="message">Message</label>
    <Textarea id="message" name="message" :rows="5" />
    <Button type="submit" color="primary">Send</Button>
  </form>
</template>
```

#svelte
```svelte
<script lang="ts">
  function send(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    api.send(data.get("subject"), data.get("message"));
  }
</script>

<form onsubmit={send}>
  <label for="subject">Subject</label>
  <Input id="subject" name="subject" />
  <label for="message">Message</label>
  <Textarea id="message" name="message" rows={5} />
  <Button type="submit" color="primary">Send</Button>
</form>
```

#angular
```angular-ts
@Component({
  selector: "app-support",
  imports: [Input, Textarea, Button],
  template: `
    <form (submit)="send($event)">
      <label for="subject">Subject</label>
      <div appInput><input id="subject" name="subject" /></div>
      <label for="message">Message</label>
      <div appTextarea><textarea id="message" name="message" rows="5"></textarea></div>
      <button appButton type="submit" color="primary">Send</button>
    </form>
  `,
})
export class Support {
  send(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    api.send(data.get("subject"), data.get("message"));
  }
}
```

#solid
```tsx
export function Support() {
  function send(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    api.send(data.get("subject"), data.get("message"));
  }

  return (
    <form onSubmit={send}>
      <label for="subject">Subject</label>
      <Input id="subject" name="subject" />
      <label for="message">Message</label>
      <Textarea id="message" name="message" rows={5} />
      <Button type="submit" color="primary">Send</Button>
    </form>
  );
}
```

#astro
```astro
<!-- The form posts to the server, so it works before any JavaScript loads. -->
<form method="post" action="/support">
  <label for="subject">Subject</label>
  <Input id="subject" name="subject" />
  <label for="message">Message</label>
  <Textarea id="message" name="message" rows={5} />
  <Button type="submit" color="primary">Send</Button>
</form>
```

#vanilla
```html
<!-- The form posts to the server, so it works before any JavaScript loads. -->
<form method="post" action="/support">
  <label for="subject">Subject</label>
  <div class="input" data-size="md">
    <input data-slot="control" type="text" id="subject" name="subject" />
  </div>
  <label for="message">Message</label>
  <div class="textarea" data-size="md" data-rows="5">
    <textarea data-slot="control" rows="5" id="message" name="message"></textarea>
  </div>
  <button class="button" type="submit" data-variant="solid" data-color="primary" data-size="md">
    <span data-slot="label">Send</span>
  </button>
</form>
```
::

Form libraries work the same way. They register the `<textarea>` itself, through its ref or its attributes and listeners, which is why the Textarea puts them all on the `<textarea>`.

#### With other components

- The [Input](/docs/components/input) takes a single line, and the Textarea several, with the same sizes, padding, border and states, so the two sit side by side in a form.
- The Field, on our [Roadmap](/docs/getting-started/roadmap), will render the label, hint and error message around a Textarea, give it an `id`, and set its `aria-describedby` and `aria-invalid` for you, keeping the count after them.
- A [Button](/docs/components/button) after the textarea sends the form. It's `type="submit"`, since `Enter` in a textarea starts a new line rather than submitting.
- The count announces itself through the same `announce` as the Button's loading state, so the whole page shares one live region.

### Controllable

The Textarea doesn't keep any state you can't reach. The value is yours to bind, or to leave to the browser, and every other state is a prop or an attribute that you control:

| State      | How you control it                                                                    |
| ---------- | ------------------------------------------------------------------------------------- |
| Value      | `value`, bound to your state, or left to the browser                                   |
| Height     | `rows`, `autoGrow` and `maxRows`                                                       |
| Disabled   | `disabled`                                                                             |
| Read-only  | `readonly`, which lands on the `<textarea>`                                            |
| Invalid    | `aria-invalid`, set while its error message shows, or by the Textarea over its `limit` |
| Focus      | A ref to its `<textarea>`, and `focus()`                                               |

## Agentic Experience (AX)

Finally, let's look at how agents read, fill in and check a textarea. They rely on the same accessibility tree as assistive technologies, and on a contract they can check the code against.

### Semantic

Agents that drive a browser, through Playwright or a browser MCP server, read the page through its accessibility tree, which is made of roles, names, values and states. This is how they see the states example on this page:

```yaml
- textbox "Message": Could we move our call to Friday?
- textbox "Notes" [disabled]: Call back after 3pm
- textbox "Terms": Payment is due within 30 days.
- textbox "Reason for return" [invalid]
```

A textarea without a label is a textbox with no name, so an agent can't tell a message from a delivery note, any more than a screen reader user can. With a role and a name, an agent can find the textarea and fill it in, new lines and all:

```ts
await page.getByRole("textbox", { name: "Message" }).fill("Dear Ada,\nThank you for your note.");
```

A textarea and an input share the `textbox` role. Screen readers tell them apart by `aria-multiline`, which a `<textarea>` has without you setting it, and NVDA, for one, says "multi line" when it gets focus.

### Described

Here's the whole contract in one block, for agents to read before they build or review a textarea:

```yaml
component: Textarea
summary: Takes text over several lines, like a comment, a message or a description. Its label names it.
standard: https://opencomponents.dev/docs/components/textarea
element: textarea # inside a div, which holds the count and takes class and style
role: textbox # multi-line, which the <textarea> implies
props:
  size: { type: [xs, sm, md, lg, xl], default: md }
  rows: { type: number, default: 3 } # the lines it shows, and is never shorter than
  autoGrow: { type: boolean, default: false } # grows with its text, and can't be resized
  maxRows: { type: number } # with autoGrow. Without it, it keeps growing
  limit: { type: number } # shows a count, and never cuts people off
  countLabel: { type: "(remaining: number) => string" } # negative over the limit
  disabled: { type: boolean, default: false }
  value: { type: string } # when it's bound. Without it, the textarea keeps its own
events:
  input: Event, from the <textarea>. Fires as people type.
  change: Event, from the <textarea>. Fires when people commit a change, like when they leave it.
states:
  hover: ":hover, in @media (hover: hover)"
  focus: ":focus-visible"
  disabled: ":disabled"
  read-only: "[readonly]"
  invalid: "[aria-invalid=true], never :invalid. Set by the Textarea over its limit too"
  over-limit: "[data-slot=count][data-over-limit]"
keyboard:
  Tab: Moves focus to and from the textarea.
  Enter: Starts a new line. Never submits its form.
parts: [control, count] # data-slot, in this order. The control is the <textarea>
tokens:
  theme: ["--color--neutral-text", "--color--error-text", "--color--focus"]
  variables: [--textarea--height, --textarea--padding, --textarea--padding-block, --textarea--font-size, --textarea--radius, --textarea--border-color, --textarea--min-height, --textarea--max-height, --textarea--count--color, --textarea--rows, --textarea--max-rows]
  layer: components # in Tailwind's order: theme, base, components, utilities
rules: https://opencomponents.dev/docs/components/textarea#checklist
```

It's also published on its own at [`/raw/docs/components/textarea.yaml`](/raw/docs/components/textarea.yaml){external=""}, with every rule from the checklist in place of the `rules` link. It's a fraction of this page's length, so it's the one to give agents that only need the rules, and not the reasoning behind them.

Every rule has a stable ID, like `textarea/no-truncation`, so you and your agents can cite it in reviews and commits.

### Deterministic

The same props always render the same markup, leaving out anything your framework adds for itself, like comments or scoping attributes. For example, here's a bio with a limit:

```html
<Textarea id="bio" limit="160" aria-describedby="bio-hint" />
```

And here's what it renders on the server, before anyone has written anything:

```html
<div class="textarea" data-size="md" data-rows="3" data-limit="160">
  <textarea
    data-slot="control"
    rows="3"
    id="bio"
    aria-describedby="bio-hint bio-count"
  ></textarea>
  <span data-slot="count" id="bio-count">160 characters left</span>
</div>
```

- The size and the rows are mirrored as `data-size` and `data-rows`, which are always there, and `autoGrow`, `maxRows` and `limit` as `data-auto-grow`, `data-max-rows` and `data-limit`, when they're set. `rows` is also set on the `<textarea>`.
- The styles turn `data-rows` and `data-max-rows` into the minimum and maximum heights, with typed `attr()`, so they hold as soon as the page loads, before any script runs. Browsers that can't read a number from an attribute yet get them once the script runs, which sets them as `--textarea--rows` and `--textarea--max-rows` on the root through the CSSOM. Until then, the `rows` attribute sets the height, except on an auto-growing textarea in a browser with `field-sizing`, which ignores `rows`, so it starts at the height of its text, with no maximum. A strict Content Security Policy allows that, unlike a `style` attribute, so your markup never needs one.
- Parts are marked with `data-slot` and always come in the same order: `control`, then `count`. Only the control is always there.
- States change attributes and text, never elements. The `<textarea>` is never replaced, so focus, the caret, what people have written and the screen reader's position all survive every state change, going over the limit included.
- There's nothing random or generated, like IDs or timestamps, so the server renders the same markup every time, and so does every snapshot. The count's `id` is the textarea's, with `-count` on the end.
- Browsers also differ in how an auto-growing textarea grows. Those without `field-sizing` get its height from a script, as a `height` in the `<textarea>`'s `style`.

### Verifiable

Every rule in the checklist can be checked, and about half of them automatically.

#### Unit tests

Every rule that the checklist checks with a unit test has one in `Textarea.test.ts`, which you'll find under [Reference implementation](/docs/components/textarea#reference-implementation). We run them on every change to this page, so the code you see always passes them.

#### In the browser

Unit tests run without a layout, so they can't check a textarea's height. In the browser, you can check how it grows and how far it resizes with visual regression tests, run [axe](https://github.com/dequelabs/axe-core) to check labels and contrast, and fill in the form the way an agent would, to check what happens past the limit:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the contact form keeps a long message, and says it's too long", async ({ page }) => {
  await page.goto("/contact");

  const message = page.getByRole("textbox", { name: "Message" });
  await message.fill("a".repeat(210));
  await message.press("Enter");

  await expect(message).toHaveValue(`${"a".repeat(210)}\n`);
  await expect(message).toHaveAttribute("aria-invalid", "true");
  await expect(message).toHaveAccessibleDescription(/11 characters too many/);
  await expect(page).toHaveURL("/contact");

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations).toEqual([]);
});
```

Some things still need a human, so try your forms with the keyboard alone, with a screen reader, on a phone, where you can check the keyboard, zoom and the resize handle, and at 200% zoom, with forced colours and more contrast turned on. You can emulate the last two in Chrome DevTools, under Rendering.

#### During development

Our reference implementation also warns you in the console as soon as a textarea renders without a label, or with a `limit` but no `id` for its count to point back at.

#### Prompts

You can point your agent straight at this page. To build a textarea, you could use:

::framework-switcher
#react
```
Build a Textarea component for our React design system that meets the Open Components
Textarea standard: https://opencomponents.dev/raw/docs/components/textarea.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass. Then
check your work against every rule in its checklist with a Component or Both scope, and
cite the rule ID for any rule you can't meet.
```

#vue
```
Build a Textarea component for our Vue 3 design system that meets the Open Components
Textarea standard: https://opencomponents.dev/raw/docs/components/textarea.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass. Then
check your work against every rule in its checklist with a Component or Both scope, and
cite the rule ID for any rule you can't meet.
```

#svelte
```
Build a Textarea component for our Svelte 5 design system that meets the Open Components
Textarea standard: https://opencomponents.dev/raw/docs/components/textarea.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass. Then
check your work against every rule in its checklist with a Component or Both scope, and
cite the rule ID for any rule you can't meet.
```

#angular
```
Build a Textarea component for our Angular design system that meets the Open Components
Textarea standard: https://opencomponents.dev/raw/docs/components/textarea.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass. Then
check your work against every rule in its checklist with a Component or Both scope, and
cite the rule ID for any rule you can't meet.
```

#solid
```
Build a Textarea component for our Solid design system that meets the Open Components
Textarea standard: https://opencomponents.dev/raw/docs/components/textarea.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass. Then
check your work against every rule in its checklist with a Component or Both scope, and
cite the rule ID for any rule you can't meet.
```

#astro
```
Build a Textarea component for our Astro design system that meets the Open Components
Textarea standard: https://opencomponents.dev/raw/docs/components/textarea.md

Follow its API, its DOM contract and its tokens. Port its tests and make them pass. Then
check your work against every rule in its checklist with a Component or Both scope, and
cite the rule ID for any rule you can't meet.
```

#vanilla
```
Build a Textarea for our design system in plain HTML, CSS and JavaScript that meets the
Open Components Textarea standard:
https://opencomponents.dev/raw/docs/components/textarea.md

Follow its DOM contract and its tokens. Port its tests and make them pass. Then check
your work against every rule in its checklist with a Component or Both scope, and cite
the rule ID for any rule you can't meet.
```
::

To review one, the contract is enough:

```
Review our Textarea against the Open Components Textarea contract:
https://opencomponents.dev/raw/docs/components/textarea.yaml

For each rule with a component or both scope, report pass or fail with the rule ID and
the evidence from our code. Then fix the failures.
```

And to review how a screen uses its textareas:

```
Review how our contact form uses its textareas against the Open Components Textarea
contract: https://opencomponents.dev/raw/docs/components/textarea.yaml

For each rule with a usage or both scope, report pass or fail with the rule ID and the
evidence from our code. Then fix the failures.
```

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A textarea meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Textarea itself, so they're the ones to check when you build or review one. **Usage** rules are met by the forms that use it, like giving every textarea a label, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like `Enter`, which the Textarea leaves to the browser, as long as the page doesn't make it send the form.

The basis says where a rule comes from. About half the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and a few come from **HTML**. The rest are **Open Components** rules, which are our own, like counting past a limit rather than cutting people off. Where a rule goes further than WCAG asks at level AA, its basis says so: some come from level **AAA**, like the 44px height on touch screens, and a rule that asks for more than its criterion says **beyond**, like using a native `<textarea>`, where WCAG would let you rebuild one by hand.

Unit tests run without a layout, so the rules about height, resizing and growing are checked in the browser, at 200% zoom or with visual regression tests.

### UI rules

| Rule                         | Level  | Scope     | Requirement | Basis | Check |
| ---------------------------- | ------ | --------- | ----------- | ----- | ---------------------- |
| `textarea/contrast`          | Must   | Component | The text, the placeholder and the count have a contrast of 4.5:1, and the focus ring has 3:1 against the page | WCAG 1.4.3, 1.4.11 (AA) | axe `color-contrast`, contrast checker |
| `textarea/boundary-contrast` | Must   | Component | The border has a contrast of 3:1 against the page, so an empty textarea stays visible | WCAG 1.4.11 (AA) | Contrast checker |
| `textarea/focus-visible`     | Must   | Component | Focus shows an `outline` at least 2px thick around the field, outside its border | WCAG 2.4.7 (AA), 2.4.13 (AAA) | Keyboard |
| `textarea/target-size`       | Must   | Component | The field is at least 24px tall, and at least 44px tall on touch screens | WCAG 2.5.8 (AA), 2.5.5 (AAA) | Emulation |
| `textarea/no-zoom-on-focus`  | Should | Component | On touch screens, the text is at least 16px, so Safari on iOS doesn't zoom in when the textarea gets focus | Open Components | Emulation |
| `textarea/min-rows`          | Must   | Component | It's never shorter than its `rows`, whether people resize it or it grows on its own | Open Components | Visual regression test |
| `textarea/resizable`         | Must   | Component | Its height is a minimum, in lines of its own line height plus padding in `rem`, so it grows with its text instead of clipping it | Open Components, beyond WCAG 1.4.4, 1.4.12 (AA) | 200% zoom |
| `textarea/block-resize`      | Should | Component | People resize it on the block axis only, and resizing is only turned off when it grows on its own or is disabled | Open Components | Visual regression test |
| `textarea/auto-grow`         | Should | Component | With `autoGrow`, it grows with its text up to `maxRows`, then scrolls, with `field-sizing: content` or a script where that's not supported | Open Components | Visual regression test, 200% zoom |
| `textarea/stable-size`       | Must   | Component | No state changes the field's size or position | Open Components | Visual regression test |
| `textarea/state-selectors`   | Should | Component | States are styled from the attributes on the `<textarea>` that expose them, and never from `:invalid` or `:user-invalid` | Open Components | Review |
| `textarea/hover-capable`     | Should | Component | Hover styles only apply inside `@media (hover: hover)` | Open Components | Review |
| `textarea/forced-colors`     | Must   | Component | The border, and the focus, disabled and read-only states, stay visible in forced colours mode | Open Components | Emulation |
| `textarea/more-contrast`     | Should | Component | The border is drawn at full strength when `prefers-contrast: more` is set | Open Components | Emulation |
| `textarea/fits-text`         | Should | Usage     | Its `rows` fit the text it expects, and it's never wider than its column | Open Components, beyond WCAG 1.4.10 (AA) | Review |

### UX rules

| Rule                           | Level  | Scope     | Requirement | Basis | Check |
| ------------------------------ | ------ | --------- | ----------- | ----- | --------------------------------- |
| `textarea/native-element`      | Must   | Component | It's a native `<textarea>`, and never a `contenteditable` element or a `role="textbox"` | Open Components, beyond WCAG 2.1.1, 4.1.2 (A) | Unit test |
| `textarea/visible-label`       | Must   | Usage     | Every textarea has a visible `<label>`, linked with `for`, rather than a placeholder alone | WCAG 1.3.1, 3.3.2, 4.1.2 (A) | axe `label` |
| `textarea/label-in-name`       | Must   | Usage     | An `aria-label` or `aria-labelledby` includes the visible label, ideally at the start | WCAG 2.5.3 (A) | axe `label-content-name-mismatch` |
| `textarea/described`           | Should | Usage     | Hints, like what to include, are linked with `aria-describedby`, and a placeholder only ever shows a short example | WCAG 1.3.1 (A), Open Components | Screen reader |
| `textarea/keyboard`            | Must   | Component | `Tab` moves focus to and from it, and the browser's text editing keys work as they do in any textarea | WCAG 2.1.1, 2.1.2 (A) | Unit test |
| `textarea/enter-new-line`      | Must   | Both      | `Enter` starts a new line and never submits the form, which has a submit button | HTML | Unit test |
| `textarea/allow-paste`         | Must   | Both      | Pasting and autofill are never blocked | Open Components | Unit test, review |
| `textarea/no-truncation`       | Must   | Both      | A limit is counted rather than enforced with `maxlength`, so people can type and paste past it | Open Components | Unit test |
| `textarea/limit-in-hint`       | Should | Usage     | A limit is stated in the hint, linked with `aria-describedby`, before people start writing | WCAG 3.3.2 (A) | Screen reader |
| `textarea/count`               | Should | Component | The count says how many characters are left, or how many too many, describes the textarea, and over the limit sets `aria-invalid="true"` | WCAG 3.3.1 (A), Open Components | Unit test |
| `textarea/announce-count`      | Should | Component | The count is announced through one polite live region once people pause near the limit, and never on every keystroke | WCAG 4.1.3 (AA), Open Components | Unit test, screen reader |
| `textarea/input-purpose`       | Must   | Usage     | A textarea that asks for the person's own address has `autocomplete="street-address"` | WCAG 1.3.5 (AA) | axe `autocomplete-valid`, review |
| `textarea/error-message`       | Must   | Usage     | An invalid textarea has an error message, in text and linked with `aria-describedby`, that says what's wrong and how to fix it | WCAG 1.4.1, 3.3.1 (A), 3.3.3 (AA) | Screen reader |
| `textarea/invalid-state`       | Must   | Both      | A textarea sets `aria-invalid="true"` while its error message shows, and only looks invalid when it does | WCAG 4.1.2 (A), Open Components | Unit test |
| `textarea/validate-late`       | Should | Usage     | Errors show when people submit or leave the textarea, never while they're first writing, and clear as soon as the text is fixed | Open Components | Review |
| `textarea/focus-first-error`   | Should | Usage     | When a submit fails, focus moves to the first invalid field, or to a summary of the errors, once the error messages are in the page | Open Components | Keyboard, screen reader |
| `textarea/disabled-inert`      | Must   | Component | A disabled textarea can't be focused, edited or submitted | HTML | Unit test |
| `textarea/read-only-values`    | Should | Usage     | Text people need to read but can't change is read-only rather than disabled, so they can focus it, scroll it and copy it, and its form sends it | Open Components | Review |
| `textarea/keep-focus`          | Must   | Usage     | A textarea is never disabled while it has focus, so while its form is sent, it's read-only instead | Open Components | Keyboard |
| `textarea/focus-not-obscured`  | Must   | Usage     | Sticky headers and footers never cover a focused textarea, for example thanks to `scroll-padding` | WCAG 2.4.11 (AA), 2.4.12 (AAA) | Keyboard |
| `textarea/mirrors-in-rtl`      | Should | Both      | It uses logical properties, and a textarea for free text has `dir="auto"` | Open Components | Review |

### DX rules

| Rule                          | Level  | Scope     | Requirement | Basis | Check |
| ----------------------------- | ------ | --------- | ----------- | ----- | --------- |
| `textarea/shared-vocabulary`  | Must   | Component | It uses the shared names `size`, `disabled` and `value`, with the Input's sizes | Open Components | Review |
| `textarea/typed`              | Must   | Component | Props and events are typed, with unions rather than `string`, and `rows`, `maxRows` and `limit` take numbers | Open Components | Type check |
| `textarea/control-attributes` | Must   | Component | Attributes, listeners and refs land on the `<textarea>`, while classes and styles land on the root | Open Components | Unit test |
| `textarea/form-control`       | Must   | Component | Its form sends its text under its `name`, whether the value is bound or not | HTML | Unit test |
| `textarea/controllable`       | Should | Component | Its value can be bound or left to the browser, and every other state is a prop or an attribute | Open Components | Unit test |

### AX rules

| Rule                         | Level  | Scope     | Requirement | Basis | Check |
| ---------------------------- | ------ | --------- | ----------- | ----- | --------- |
| `textarea/role-and-name`     | Must   | Component | It can be found by its role and label alone, with `getByRole("textbox", { name })` | WCAG 4.1.2 (A) | Unit test |
| `textarea/deterministic-dom` | Must   | Component | The same props render the same markup, with no generated IDs, and states change attributes, never elements | Open Components | Unit test |
| `textarea/data-attributes`   | Should | Component | The size, `rows`, `autoGrow`, `maxRows` and `limit` are mirrored as `data-size`, `data-rows`, `data-auto-grow`, `data-max-rows` and `data-limit`, with `data-max-rows` only alongside `autoGrow`, and parts are marked with `data-slot` | Open Components | Unit test |
| `textarea/dev-warnings`      | Should | Component | It warns during development when a textarea has no label, or a limit without an `id` | Open Components | Unit test |

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves. It announces its count with the Button's [`announce.ts`](/docs/components/button#reference-implementation), which every component that announces something shares, so you only need one copy of it, and it reads the same theme tokens, so copy the Button's `tokens.css` into your theme too.

The tests are in `Textarea.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [Textarea.vue]
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useAttrs, useTemplateRef, watch, type TextareaHTMLAttributes } from "vue";
import { announce, prepareAnnouncer } from "../button/announce";

export interface TextareaProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** How many lines it shows. It's never shorter, even when people resize it. */
  rows?: number;
  /** Grows with its text, up to `maxRows`, rather than scrolling. People can't resize it then. */
  autoGrow?: boolean;
  /** How many lines it grows to with `autoGrow`, before it scrolls. Without it, it keeps growing. */
  maxRows?: number;
  /** The most characters it takes. It shows a count, and lets people go over, so nothing they paste gets cut off. */
  limit?: number;
  /** The count's text, for a number of characters left, which is negative over the limit. */
  countLabel?: (remaining: number) => string;
  disabled?: boolean;
}

// Attributes go on the <textarea> rather than on the root, so they're declared below.
defineOptions({ inheritAttrs: false });

const {
  size = "md",
  rows = 3,
  autoGrow = false,
  maxRows,
  limit,
  countLabel = (remaining: number) => {
    const count = Math.abs(remaining);
    const characters = count === 1 ? "character" : "characters";
    return remaining < 0 ? `${count} ${characters} too many` : `${count} ${characters} left`;
  },
  disabled = false,
} = defineProps<TextareaProps>();

/** The value, which `v-model` binds. Without it, the textarea keeps its own, and its form submits it. */
const model = defineModel<string>();

const attrs = useAttrs();
// Classes and styles go on the root, so a class can set its variables. Everything
// else goes on the <textarea>: `id`, `name`, `placeholder`, ARIA and listeners.
// Attrs aren't reactive, so these run on every render.
const onRoot = (key: string) => key === "class" || key === "style";
const rootAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => onRoot(key)));
const controlAttrs = () => Object.fromEntries(Object.entries(attrs).filter(([key]) => !onRoot(key)));

const root = useTemplateRef<HTMLElement>("root");
const textarea = useTemplateRef<HTMLTextAreaElement>("textarea");

// What people have typed, so the count works without `v-model` too.
const typed = ref(typeof attrs.value === "string" ? attrs.value : "");
const value = computed(() => model.value ?? typed.value);

// Code points rather than UTF-16 code units, which is how many databases count a
// length limit, like PostgreSQL's varchar(n). An emoji made of several, like a
// family, counts as several.
const remaining = computed(() => (limit === undefined ? 0 : limit - [...value.value].length));
const over = computed(() => remaining.value < 0);
const countText = computed(() => countLabel(remaining.value));
// The count is named after the textarea, so it needs its `id` to describe it.
const countId = computed(() => (limit !== undefined && attrs.id ? `${attrs.id}-count` : undefined));
// Over the limit, it's invalid, whatever the page says.
const invalid = () => (over.value ? "true" : (attrs["aria-invalid"] as TextareaHTMLAttributes["aria-invalid"]));
const describedBy = () => [attrs["aria-describedby"], countId.value].filter(Boolean).join(" ") || undefined;

// `rows` and `maxRows` as variables, in lines, which the styles turn into a minimum
// and a maximum height. Browsers with typed attr() read them from `data-rows` and
// `data-max-rows` before any script runs. The others can't read a number from an
// attribute yet, so they're also set through the CSSOM, which a strict Content
// Security Policy allows, unlike a style attribute. They run after every render,
// since a change to your own `style` replaces the root's.
function setRows() {
  const el = root.value;
  if (!el) return;
  el.style.setProperty("--textarea--rows", String(rows));
  if (autoGrow && maxRows !== undefined) el.style.setProperty("--textarea--max-rows", String(maxRows));
  else el.style.removeProperty("--textarea--max-rows");
}
onMounted(setRows);
onUpdated(setRows);

// Browsers with `field-sizing: content` grow the textarea themselves. In the
// others, it's set to the height of its text, which max-height caps.
function grow() {
  const el = textarea.value;
  if (!autoGrow || !el || (typeof CSS !== "undefined" && CSS.supports?.("field-sizing", "content"))) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
}
watch(value, () => nextTick(grow));

// Screen readers hear the count once people pause near the limit, rather than on
// every keystroke, which would talk over what they're typing.
const NEAR_LIMIT = 0.8;
const PAUSE = 1000;
let timer: ReturnType<typeof setTimeout> | undefined;
let announced = "";
function announceCount() {
  if (limit === undefined) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    const near = limit - remaining.value >= limit * NEAR_LIMIT;
    if (!near || countText.value === announced) return;
    announced = countText.value;
    announce(countText.value);
  }, PAUSE);
}

// The template shows the model, or the `value` attribute while there's none, so a
// textarea without `v-model`, like a read-only one, can still start with a value.
function onInput(event: Event) {
  const text = (event.target as HTMLTextAreaElement).value;
  typed.value = text;
  model.value = text;
  announceCount();
}

// A form reset puts back the textarea's first value without an input event, so
// the count reads it again once the reset is done. That's after the event and,
// for a click on a reset button, after the microtasks that follow it too.
let form: HTMLFormElement | null = null;
function onReset() {
  setTimeout(() => {
    const text = textarea.value?.value ?? "";
    typed.value = text;
    if (model.value !== undefined) model.value = text;
  });
}

// A ref to the Textarea gets you the <textarea>, through `textarea`.
defineExpose({ textarea });

onMounted(() => {
  // The live region has to be in the page before anything is announced.
  if (limit !== undefined) prepareAnnouncer();
  grow();
  form = textarea.value?.form ?? null;
  form?.addEventListener("reset", onReset);

  if (import.meta.env.DEV) {
    const el = textarea.value;
    const named = el?.labels?.length || el?.hasAttribute("aria-label") || el?.hasAttribute("aria-labelledby");
    if (el && !named) {
      console.warn("[Textarea] has no accessible name: give it a <label for>.", el);
    }
    if (el && limit !== undefined && !el.id) {
      console.warn("[Textarea] has a limit but no id: give it one, so its count can describe it.", el);
    }
  }
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  form?.removeEventListener("reset", onReset);
});
</script>

<template>
  <div
    ref="root"
    class="textarea"
    v-bind="rootAttrs()"
    :data-size="size"
    :data-rows="rows"
    :data-auto-grow="autoGrow ? '' : undefined"
    :data-max-rows="autoGrow ? maxRows : undefined"
    :data-limit="limit"
  >
    <textarea
      ref="textarea"
      data-slot="control"
      :rows="rows"
      :disabled="disabled"
      v-bind="controlAttrs()"
      :value="model ?? ($attrs.value as string | undefined)"
      :aria-invalid="invalid()"
      :aria-describedby="describedBy()"
      @input="onInput"
    />
    <span v-if="limit !== undefined" data-slot="count" :id="countId" :data-over-limit="over ? '' : undefined">
      {{ countText }}
    </span>
  </div>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The textarea's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .textarea {
    /* Set per size. The Input's values, so a textarea of one row is as tall as an
       input, and the two line up in a form. */
    --textarea--height: 2.25rem;
    --textarea--padding: 0.75rem;
    --textarea--font-size: 0.875rem;
    --textarea--radius: 0.5rem;
    /* The text colour at 55%, which has 3:1 against the page, so people can see where to type. */
    --textarea--border-color: color-mix(in srgb, currentColor 55%, transparent);
    /* The text colour at 70%, which has 4.5:1 against the page, like the placeholder. */
    --textarea--count--color: color-mix(in srgb, currentColor 70%, transparent);
    /* What's left of one row's height once its line of text is in, above and below it.
       `lh` is the textarea's line height, so it follows larger text and wider lines. */
    --textarea--padding-block: max(0.125rem, (var(--textarea--height) - 1lh) / 2 - 1px);
    /* `rows` lines, with their padding and border. Resizing and growing stop there.
       The rows come from `data-rows`, in browsers with typed attr(), so it holds before
       the script runs. In the others, it has no value until then, and the `rows`
       attribute sets the height, except with auto-grow, whose field-sizing ignores
       `rows`, so it starts at the height of its text, with no maximum. */
    --textarea--min-height: calc(
      var(--textarea--rows, attr(data-rows type(<number>))) * 1lh + 2 * var(--textarea--padding-block) + 2px
    );
    /* Only set with `maxRows`. Without it, max-height has no value, which is none. */
    --textarea--max-height: calc(
      var(--textarea--max-rows, attr(data-max-rows type(<number>))) * 1lh + 2 * var(--textarea--padding-block) + 2px
    );

    display: flex;
    flex-direction: column;
    /* In a flex row, it can get narrower than a <textarea> is on its own, rather than overflow. */
    min-width: 0;
    color: var(--color--neutral-text);
    font-family: inherit;
    font-size: var(--textarea--font-size);
  }

  /* Sizes */
  .textarea[data-size="xs"] {
    --textarea--height: 1.5rem;
    --textarea--padding: 0.5rem;
    --textarea--font-size: 0.75rem;
    --textarea--radius: 0.375rem;
  }
  .textarea[data-size="sm"] {
    --textarea--height: 2rem;
    --textarea--padding: 0.625rem;
    --textarea--radius: 0.375rem;
  }
  .textarea[data-size="lg"] {
    --textarea--height: 2.5rem;
    --textarea--padding: 0.875rem;
    --textarea--font-size: 1rem;
  }
  .textarea[data-size="xl"] {
    --textarea--height: 3rem;
    --textarea--padding: 1rem;
    --textarea--font-size: 1rem;
    --textarea--radius: 0.75rem;
  }

  /* Parts. The control draws the field itself, since its resize handle and its
     scrollbar belong to it. */
  .textarea > [data-slot="control"] {
    display: block;
    box-sizing: border-box;
    width: 100%;
    /* min-height rather than height, so it's never shorter than its rows, and grows with larger text. */
    min-height: var(--textarea--min-height);
    max-height: var(--textarea--max-height);
    margin: 0;
    padding: var(--textarea--padding-block) var(--textarea--padding);
    border: 1px solid var(--textarea--border-color);
    border-radius: var(--textarea--radius);
    background-color: transparent;
    color: inherit;
    font: inherit;
    /* Taller than the Input's, since people read their text back over several lines. */
    line-height: 1.5;
    letter-spacing: inherit;
    /* Only taller or shorter, so it never outgrows its column. `block` follows the
       writing mode, and `vertical` is for browsers that don't know it. */
    resize: vertical;
    resize: block;
  }
  .textarea > [data-slot="control"]::placeholder {
    /* The text colour at 70%, which has 4.5:1 against the page. Firefox lowers its opacity on its own. */
    color: color-mix(in srgb, currentColor 70%, transparent);
    opacity: 1;
  }
  /* It grows with its text, so there's nothing for people to resize. Browsers without
     field-sizing get their height from the script instead. */
  .textarea[data-auto-grow] > [data-slot="control"] {
    resize: none;
    field-sizing: content;
  }
  .textarea > [data-slot="count"] {
    margin-block-start: 0.375rem;
    color: var(--textarea--count--color);
    line-height: 1.25;
    text-align: end;
    /* So the count doesn't jiggle as its digits change. */
    font-variant-numeric: tabular-nums;
  }
  .textarea > [data-slot="count"][data-over-limit] {
    color: var(--color--error-text);
  }

  /* States. Each one reads the attribute on the <textarea> that exposes it, so what
     people see and what assistive technologies report can't drift apart. :invalid
     isn't one of them: it matches a required textarea before anyone has typed in it.
     The variables are set on the root, as every other one is, so a class of yours
     still sets them in every state. Hover is in :where(), so invalid always wins. */
  @media (hover: hover) {
    .textarea:where(:has(> [data-slot="control"]:hover:not(:disabled, [readonly]))) {
      --textarea--border-color: color-mix(in srgb, currentColor 80%, transparent);
    }
  }
  .textarea > [data-slot="control"]:focus-visible {
    outline: 2px solid var(--color--focus);
    outline-offset: 2px;
  }
  .textarea > [data-slot="control"][readonly] {
    /* Dashed, so it reads as something you can't change, while the text keeps its contrast. */
    border-style: dashed;
    cursor: default;
  }
  .textarea:has(> [data-slot="control"][aria-invalid="true"]) {
    --textarea--border-color: var(--color--error-text);
  }
  .textarea > [data-slot="control"][aria-invalid="true"] {
    /* A second pixel of border, drawn inside, so the field doesn't grow. */
    box-shadow: inset 0 0 0 1px var(--textarea--border-color);
  }
  .textarea:has(> [data-slot="control"]:disabled) {
    opacity: 0.5;
  }
  .textarea > [data-slot="control"]:disabled {
    cursor: not-allowed;
    /* Nobody can write in it, so there's nothing to make room for. */
    resize: none;
  }

  /* On touch screens, the text is at least 16px, or Safari on iOS zooms in when the
     textarea gets focus, and the field is at least 44px tall, whatever its rows. */
  @media (any-pointer: coarse) {
    .textarea {
      font-size: max(var(--textarea--font-size), 1rem);
    }
    .textarea > [data-slot="control"] {
      min-height: max(var(--textarea--min-height), 2.75rem);
    }
  }

  /* With more contrast, the border is drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .textarea {
      --textarea--border-color: currentColor;
    }
  }

  /* Forced colors mode keeps borders but drops shadows, so mark states with system colours. */
  @media (forced-colors: active) {
    .textarea > [data-slot="control"]:focus-visible {
      outline-color: Highlight;
    }
    .textarea:has(> [data-slot="control"]:disabled) {
      color: GrayText;
      opacity: 1;
    }
    .textarea > [data-slot="control"]:disabled {
      border-color: GrayText;
    }
  }
}
</style>
```
```ts [Textarea.test.ts]
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h, nextTick, ref, type ComponentPublicInstance } from "vue";
import Textarea from "./Textarea.vue";

const label = (id: string, text: string) => h("label", { for: id }, text);

describe("Textarea", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is a native textarea, found by its role and its label", () => {
    render({ render: () => [label("message", "Message"), h(Textarea, { id: "message" })] });

    const textarea = screen.getByRole("textbox", { name: "Message" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).not.toHaveAttribute("contenteditable");
    expect(textarea).not.toHaveAttribute("role");
  });

  it("puts attributes, listeners and refs on the textarea, and classes and styles on its root", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const instance = ref<ComponentPublicInstance<{ textarea: HTMLTextAreaElement }>>();
    render({
      render: () => [
        label("address", "Street address"),
        h(Textarea, {
          ref: instance,
          id: "address",
          class: "address",
          style: "max-width: 320px",
          name: "address",
          autocomplete: "street-address",
          onFocus,
        }),
      ],
    });

    const textarea = screen.getByRole("textbox", { name: "Street address" });
    await user.tab();
    expect(textarea).toHaveAttribute("name", "address");
    expect(textarea).toHaveAttribute("autocomplete", "street-address");
    expect(textarea).not.toHaveClass("address");
    expect(textarea.parentElement).toHaveClass("textarea", "address");
    expect(textarea.parentElement).toHaveStyle({ maxWidth: "320px" });
    expect(textarea).not.toHaveStyle({ maxWidth: "320px" });
    expect(onFocus).toHaveBeenCalled();
    expect(instance.value?.textarea).toBe(textarea);
  });

  it("binds its value with v-model, or keeps its own without it", async () => {
    const user = userEvent.setup();
    const message = ref("Hello");
    render({
      render: () => [
        h(Textarea, {
          "aria-label": "Bound",
          modelValue: message.value,
          "onUpdate:modelValue": (value: string | undefined) => (message.value = value ?? ""),
        }),
        h(Textarea, { "aria-label": "Unbound" }),
      ],
    });

    const bound = screen.getByRole("textbox", { name: "Bound" });
    await user.type(bound, ", Ada");
    expect(message.value).toBe("Hello, Ada");
    message.value = "";
    await nextTick();
    expect(bound).toHaveValue("");

    const unbound = screen.getByRole("textbox", { name: "Unbound" });
    await user.type(unbound, "Ada");
    expect(unbound).toHaveValue("Ada");
  });

  it("is submitted with its form, by its name, whether its value is bound or not", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    const subject = ref("");
    render({
      render: () =>
        h("form", { onSubmit }, [
          label("subject", "Subject"),
          h(Textarea, {
            id: "subject",
            name: "subject",
            modelValue: subject.value,
            "onUpdate:modelValue": (value: string | undefined) => (subject.value = value ?? ""),
          }),
          label("message", "Message"),
          h(Textarea, { id: "message", name: "message" }),
          h("button", { type: "submit" }, "Send"),
        ]),
    });

    await user.type(screen.getByRole("textbox", { name: "Subject" }), "Hi");
    await user.type(screen.getByRole("textbox", { name: "Message" }), "Hello");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const data = new FormData(onSubmit.mock.calls[0]![0].target as HTMLFormElement);
    expect(data.get("subject")).toBe("Hi");
    expect(data.get("message")).toBe("Hello");
  });

  it("inserts a new line on Enter, and never submits its form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render({
      render: () =>
        h("form", { onSubmit }, [
          label("message", "Message"),
          h(Textarea, { id: "message", name: "message" }),
          h("button", { type: "submit" }, "Send"),
        ]),
    });

    const textarea = screen.getByRole("textbox", { name: "Message" });
    await user.type(textarea, "Dear Ada,{Enter}Thank you");
    expect(textarea).toHaveValue("Dear Ada,\nThank you");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps the browser's text editing keys, and lets people paste", async () => {
    const user = userEvent.setup();
    render({
      render: () => [label("message", "Message"), h(Textarea, { id: "message" }), h("button", { type: "button" }, "Send")],
    });

    const textarea = screen.getByRole("textbox", { name: "Message" });
    await user.tab();
    expect(textarea).toHaveFocus();
    await user.keyboard("Lovelace{Home}Ada ");
    expect(textarea).toHaveValue("Ada Lovelace");

    // Tab moves focus on, rather than typing a tab.
    await user.tab();
    expect(screen.getByRole("button", { name: "Send" })).toHaveFocus();
    expect(textarea).toHaveValue("Ada Lovelace");
    await user.tab({ shift: true });
    expect(textarea).toHaveFocus();

    await user.clear(textarea);
    await user.paste("Ada Lovelace");
    expect(textarea).toHaveValue("Ada Lovelace");
  });

  it("lets people type and paste past its limit, and counts what's left or how many too many", async () => {
    const user = userEvent.setup();
    const { container } = render({
      render: () => [label("bio", "Bio"), h(Textarea, { id: "bio", limit: 10 })],
    });

    const textarea = screen.getByRole("textbox", { name: "Bio" });
    const count = container.querySelector('[data-slot="count"]');
    expect(textarea).not.toHaveAttribute("maxlength");
    expect(count).toHaveTextContent("10 characters left");

    await user.type(textarea, "Ada Lovel");
    expect(count).toHaveTextContent("1 character left");

    await user.paste("ace, mathematician");
    expect(textarea).toHaveValue("Ada Lovelace, mathematician");
    expect(count).toHaveTextContent("17 characters too many");
  });

  it("describes the textarea with its count, and marks it invalid over the limit", async () => {
    const user = userEvent.setup();
    render({
      render: () => [
        label("bio", "Bio"),
        h("p", { id: "bio-hint" }, "You can enter up to 10 characters"),
        h(Textarea, { id: "bio", limit: 10, "aria-describedby": "bio-hint" }),
      ],
    });

    const textarea = screen.getByRole("textbox", { name: "Bio" });
    expect(textarea).toHaveAccessibleDescription("You can enter up to 10 characters 10 characters left");
    expect(textarea).not.toHaveAttribute("aria-invalid");

    await user.type(textarea, "Ada Lovelace");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("You can enter up to 10 characters 2 characters too many");

    await user.type(textarea, "{Backspace}{Backspace}");
    expect(textarea).not.toHaveAttribute("aria-invalid");
  });

  it("announces the count once people pause near the limit, not on every keystroke", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render({ render: () => [label("bio", "Bio"), h(Textarea, { id: "bio", limit: 10 })] });

    // The page shares one live region, so clear what other tests announced.
    const status = screen.getByRole("status");
    status.replaceChildren();
    const textarea = screen.getByRole("textbox", { name: "Bio" });

    // Far from the limit, nothing is announced.
    await user.type(textarea, "Ada");
    vi.advanceTimersByTime(1000);
    expect(status).toHaveTextContent("");

    // Near it, the count is announced once people pause, and only once.
    await user.type(textarea, " Love");
    expect(status).toHaveTextContent("");
    vi.advanceTimersByTime(1000);
    expect(status).toHaveTextContent("2 characters left");
    expect(status.children).toHaveLength(1);

    // A count that's back where it was isn't announced again.
    await user.type(textarea, "l{Backspace}");
    vi.advanceTimersByTime(1000);
    expect(status.children).toHaveLength(1);

    await user.type(textarea, "lace");
    vi.advanceTimersByTime(1000);
    expect(status).toHaveTextContent("2 characters too many");
    expect(status.children).toHaveLength(2);
  });

  it("waits for people to pause near the limit, however slowly they type", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render({ render: () => [label("motto", "Motto"), h(Textarea, { id: "motto", limit: 10 })] });

    // The page shares one live region, so clear what other tests announced.
    const status = screen.getByRole("status");
    status.replaceChildren();
    const textarea = screen.getByRole("textbox", { name: "Motto" });

    // A key every 600ms is slow, but shorter than a pause, so nothing is announced until the last one.
    await user.type(textarea, "Ada Lov");
    for (const key of "ela") {
      vi.advanceTimersByTime(600);
      await user.type(textarea, key);
    }
    expect(status.children).toHaveLength(0);

    vi.advanceTimersByTime(1000);
    expect(status.children).toHaveLength(1);
    expect(status).toHaveTextContent("0 characters left");
  });

  it("counts again when its form is reset, whether its value is bound or not", async () => {
    const user = userEvent.setup();
    const bio = ref("");
    const { container } = render({
      render: () =>
        h("form", [
          label("bio", "Bio"),
          h(Textarea, { id: "bio", name: "bio", limit: 10 }),
          label("motto", "Motto"),
          h(Textarea, {
            id: "motto",
            name: "motto",
            limit: 10,
            modelValue: bio.value,
            "onUpdate:modelValue": (value: string | undefined) => (bio.value = value ?? ""),
          }),
        ]),
    });

    const unbound = screen.getByRole("textbox", { name: "Bio" });
    const bound = screen.getByRole("textbox", { name: "Motto" });
    await user.type(unbound, "Ada Lovelace");
    await user.type(bound, "Ada Lovelace");
    expect(unbound).toHaveAttribute("aria-invalid", "true");
    expect(bound).toHaveAttribute("aria-invalid", "true");

    // The reset event fires before the values are put back, so the count catches up after it.
    unbound.closest("form")!.reset();
    await vi.waitFor(() => {
      for (const count of container.querySelectorAll('[data-slot="count"]')) {
        expect(count).toHaveTextContent("10 characters left");
      }
      expect(unbound).not.toHaveAttribute("aria-invalid");
      expect(bound).not.toHaveAttribute("aria-invalid");
    });
    expect(bio.value).toBe("");
    expect(bound).toHaveValue("");
  });

  it("counts again after a reset button, which puts the text back only after the browser's microtasks", async () => {
    const user = userEvent.setup();
    render({ render: () => h("form", [label("bio", "Bio"), h(Textarea, { id: "bio", name: "bio", limit: 10 })]) });

    const textarea = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Bio" });
    await user.type(textarea, "Ada Lovelace");
    expect(textarea).toHaveAttribute("aria-invalid", "true");

    // A click on a reset button fires `reset`, runs microtasks, and only then puts the
    // text back. jsdom runs them last, so this plays the browser's order step by step.
    textarea.form!.dispatchEvent(new Event("reset", { cancelable: true }));
    await Promise.resolve();
    textarea.value = textarea.defaultValue;

    await vi.waitFor(() => {
      expect(screen.getByText("10 characters left")).toBeInTheDocument();
      expect(textarea).not.toHaveAttribute("aria-invalid");
    });
  });

  it("can't be focused or edited while disabled, and its form leaves it out", async () => {
    const user = userEvent.setup();
    render({
      render: () =>
        h("form", [label("notes", "Notes"), h(Textarea, { id: "notes", name: "notes", value: "Call back", disabled: true })]),
    });

    const textarea = screen.getByRole("textbox", { name: "Notes" });
    await user.tab();
    await user.type(textarea, " tomorrow");
    expect(textarea).toBeDisabled();
    expect(textarea).not.toHaveFocus();
    expect(textarea).toHaveValue("Call back");
    expect(new FormData(textarea.closest("form")!).has("notes")).toBe(false);
  });

  it("passes aria-invalid and its error message to the textarea", () => {
    render({
      render: () => [
        label("message", "Message"),
        h(Textarea, { id: "message", "aria-invalid": "true", "aria-describedby": "message-error" }),
        h("p", { id: "message-error" }, "Enter a message"),
      ],
    });

    const textarea = screen.getByRole("textbox", { name: "Message" });
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("Enter a message");
  });

  it("mirrors its size, rows, auto-grow, maximum and limit as data attributes, and passes its rows to the textarea", async () => {
    const { container, rerender } = render(Textarea, {
      attrs: { id: "message", "aria-label": "Message" },
      props: { size: "lg", rows: 2, autoGrow: true, maxRows: 6, limit: 500 },
    });

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveAttribute("data-auto-grow", "");
    expect(root).toHaveAttribute("data-limit", "500");
    expect(root).toHaveAttribute("data-rows", "2");
    expect(root).toHaveAttribute("data-max-rows", "6");
    expect(root.style.getPropertyValue("--textarea--rows")).toBe("2");
    expect(root.style.getPropertyValue("--textarea--max-rows")).toBe("6");
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveAttribute("rows", "2");

    // New rows reach the styles, and a maximum only counts while it grows.
    await rerender({ size: "lg", rows: 4, autoGrow: false, maxRows: 6, limit: 500 });
    expect(root).toHaveAttribute("data-rows", "4");
    expect(root.style.getPropertyValue("--textarea--rows")).toBe("4");
    expect(root).not.toHaveAttribute("data-max-rows");
    expect(root.style.getPropertyValue("--textarea--max-rows")).toBe("");
  });

  it("renders the same markup every time, with its parts in a fixed order, across states", async () => {
    const options = { attrs: { id: "bio", "aria-label": "Bio" }, props: { limit: 200 } };
    const first = render(Textarea, options).container.innerHTML;
    const { container, rerender } = render(Textarea, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const parts = () => [...root.children].map((part) => part.getAttribute("data-slot"));
    expect(parts()).toEqual(["control", "count"]);

    const textarea = root.querySelector("textarea");
    await rerender({ limit: 200, disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect(root.querySelector("textarea")).toBe(textarea);
    expect(parts()).toEqual(["control", "count"]);
  });

  it("warns in development when it has no label, or a limit without an id", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Textarea);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no accessible name"), expect.anything());

    warn.mockClear();
    render(Textarea, { attrs: { "aria-label": "Bio" }, props: { limit: 200 } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no id"), expect.anything());

    warn.mockClear();
    render({ render: () => [label("bio", "Bio"), h(Textarea, { id: "bio", limit: 200 })] });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
```
:::
::

## FAQ

#### Textarea or something else?

A Textarea takes plain text over several lines. For anything else, another component will do a better job:

| When people need to…                                         | Use                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| Type a single line of text, like a name or a subject         | [Input](/docs/components/input)                              |
| Write several lines of plain text, like a message or a note  | Textarea                                                     |
| Write a short answer that might run long, like a title       | Textarea, with `rows="1"` and `autoGrow`                     |
| Format what they write, with bold text, lists or links       | A rich text editor                                           |
| Write code, with indenting and highlighting                  | A code editor                                                |

::accordion
:::accordion-item{label="Why does the count let people go over the limit?"}
Because cutting text off is worse than letting it run long. With `maxlength`, pasting a long text keeps the start and silently drops the end, so people may send something unfinished without knowing. Letting them go over, and saying by how much, lets them choose what to cut, which is also how GOV.UK's character count works.
:::

:::accordion-item{label="Why does my server count more characters than the Textarea?"}
Because forms send every new line as two characters, a carriage return and a line feed, while the Textarea, like the browser, counts it as one. A 200-character message with three new lines reaches your server as 203 characters. Count the same way on both ends, for example by turning the pairs back into single new lines before you check the length.
:::

:::accordion-item{label="Should Enter send a message in a chat?"}
We'd rather it didn't. People press `Enter` for a new line out of habit, everywhere else, and a message sent half-written can't be taken back. If your users expect it, like in a chat they use all day, let them choose it in a setting, keep `Shift+Enter` for a new line, and keep a Send button that people can reach with `Tab`.
:::

:::accordion-item{label="Why not turn resizing off?"}
Because people know how much they're about to write, and you don't. Resizing lets them make room for a long message, so they can read it back without scrolling. The Textarea only turns it off when it grows on its own, since there's nothing left to resize, and when it's disabled, since nobody can write in it then.
:::

:::accordion-item{label="Does the Textarea work before JavaScript loads?"}
Yes, as far as HTML can take it. The server renders a real `<textarea>`, so even before the page hydrates, people can write in it, resize it and send its form. Only the parts that need JavaScript have to wait for it, which are your bound value, the count and auto-growing in browsers without `field-sizing`. In browsers without typed `attr()`, the minimum height of `rows` and the maximum of `maxRows` wait for it too. Until then, the `rows` attribute sets the height, except on an auto-growing textarea in a browser with `field-sizing`, which starts at the height of its text.
:::
::

## Sources

- [HTML Standard: the textarea element](https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element), [implicit submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission) and [autofill](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill), for `rows`, `maxlength`, new lines and `street-address`
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 4.1.3: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), for announcing the count
- [Understanding SC 1.4.8: Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html), for keeping lines to 80 characters
- [CSS Box Sizing Module Level 4: field-sizing](https://drafts.csswg.org/css-sizing-4/#field-sizing), for growing with the text
- [CSS Basic User Interface Module Level 4: resize](https://drafts.csswg.org/css-ui/#resize), for resizing on the block axis
- [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/), for labels, instructions and validation
- [GOV.UK Design System: Textarea](https://design-system.service.gov.uk/components/textarea/) and [Character count](https://design-system.service.gov.uk/components/character-count/), for heights, letting people go over the limit and announcing the count when they pause
- [MDN: field-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing), for how `field-sizing: content` sizes a textarea
- [Base UI: Field](https://base-ui.com/react/components/field), for keeping the control apart from its label
- [Styleframe: Textarea](https://www.styleframe.dev/docs/theme/components/textarea), for not resizing a disabled textarea
