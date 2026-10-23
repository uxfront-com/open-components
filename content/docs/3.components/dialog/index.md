---
title: Dialog
description: How to build a modal dialog that takes focus and gives it back, that everyone can close, that developers control and that agents can check.
navigation:
  title: Overview
---

Dialogs ask for someone's full attention, like confirming a delete, editing a profile or signing in, while the page waits behind them. So much of what a dialog does happens out of sight, in focus and in the accessibility tree, which is why it's so easy to get wrong. Think of a dialog that keyboard users can tab straight out of into the page behind it, one that a screen reader announces as nothing at all, or one that closes and throws focus back to the top of the page.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/dialog/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a dialog looks, from its parts and how wide it gets to what goes in it, how it shows that it's open and its tokens.
:::

:::card{to="/docs/components/dialog/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a dialog behaves for every person, input and setting, so it's accessible, predictable, clear in every state and adaptive.
:::

:::card{to="/docs/components/dialog/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Dialog, with one consistent, typed API that composes with forms and other components and leaves when to open and close it to you.
:::

:::card{to="/docs/components/dialog/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, open and check a dialog, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/dialog#reference-implementation), which does its part of every rule in the [checklist](/docs/components/dialog#checklist), so feel free to open them as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Dialog with the same API in each, apart from two names in Angular, which [Type-safe](/docs/components/dialog/dx#type-safe) explains. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/dialog/ax#deterministic).

The Dialog is modal: while it's open, nothing else on the page can be used. Showing more next to what opened it, without blocking the page, is what a Popover is for, and it's on our [Roadmap](/docs/getting-started/roadmap).

::dialog-playground
::

| Aspect   | Dialog                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------- |
| Element  | `<dialog>`, opened with `showModal()`                                                                    |
| Role     | `dialog`, or `alertdialog` for a confirmation that needs an answer                                       |
| Name     | Its title, linked with `aria-labelledby`, and its description, if it has one, with `aria-describedby`    |
| Keyboard | `Tab` and `Shift+Tab` stay inside it, and `Escape` asks to close it                                      |
| Focus    | Moves inside when it opens, and back to what opened it when it closes                                    |
| States   | Open and closed, while the rest of the page is inert                                                     |
| Sizes    | `sm`, `md` and `lg`, which set how wide it gets                                                          |
| Pattern  | [WAI-ARIA APG Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) and [Alert Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/) |
| WCAG 2.2 | 1.3.1, 1.4.3, 1.4.10, 2.1.1, 2.1.2, 2.4.3, 2.4.6 and 4.1.2, among others                                 |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A dialog meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Dialog itself, so they're the ones to check when you build or review one. **Usage** rules are met by the screens that use it, like giving every dialog a title, so they're the ones to check when you review a screen. **Both** rules need the two to work together, like focus on an alert dialog's least destructive action: with no controls in its body, the Dialog focuses the first action, as long as you put that one first.

The basis says where a rule comes from. Many of the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and several come from the **APG**'s dialog patterns and from **HTML**. The rest are **Open Components** rules, which are our own, like never closing a dialog without asking you. Where a rule goes further than WCAG asks at level AA, its basis says so: one comes from level **AAA**, reduced motion, and a rule that asks for more than its criterion says **beyond**, like using a native `<dialog>`, where WCAG would let you rebuild one by hand.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/dialog/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/dialog/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/dialog/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/dialog/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves. It uses the Button for its close button, so copy the [Button](/docs/components/button#reference-implementation) and its `tokens.css` into your theme too.

The tests are in `Dialog.test.ts`. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`. jsdom doesn't have `showModal()` or `close()` yet, so the tests stand in for them, at the top of the file.

::code-collapse
:::code-group
```vue [Dialog.vue]
<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from "vue";
import Button from "../button/Button.vue";

/**
 * Why people asked to close the dialog, or `closed` when it's already closed, like when
 * the browser closed it itself.
 */
export type DialogCloseReason = "escape" | "close-button" | "backdrop" | "action" | "closed";

export interface DialogProps {
  /** Shows the dialog, with `showModal()`. It never changes on its own, so set it to false when `close` fires. */
  open?: boolean;
  /** The dialog's ID, which its title's and description's start with, so they're the same on the server and the client. */
  id: string;
  /** The heading that names the dialog, like "Delete project?". */
  title: string;
  /** A sentence or two on what the dialog is about, which screen readers read along with its title. */
  description?: string;
  /** `alertdialog` for a confirmation that needs an answer, which has no close button and ignores the backdrop. */
  role?: "dialog" | "alertdialog";
  /** How wide it gets, at most. */
  size?: "sm" | "md" | "lg";
  /** The close button's label, which screen readers read and voice control users say. */
  closeLabel?: string;
}

const {
  open = false,
  id,
  title,
  description,
  role = "dialog",
  size = "md",
  closeLabel = "Close",
} = defineProps<DialogProps>();

const emit = defineEmits<{
  /**
   * People asked to close the dialog, and why. `value` is the value of the button that
   * submitted a `<form method="dialog">` inside it, and empty for any other reason.
   */
  close: [reason: DialogCloseReason, value: string];
}>();

defineSlots<{
  /** The content, like a message or a form. */
  default?: () => unknown;
  /** The Buttons that answer the dialog, like Cancel and Save, in the order people read them. */
  actions?: () => unknown;
}>();

const dialog = useTemplateRef<HTMLDialogElement>("dialog");

// Whatever had focus before the dialog opened, which gets it back when it closes.
let opener: HTMLElement | null = null;

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

// The control people marked with `data-autofocus`, or else the first one in the body,
// then the first action, which in an alert dialog is the least destructive one, and
// only then the close button, which would make people tab back past it to start.
// `data-autofocus` works the same in every framework, while React focuses an
// `autoFocus` element as it renders, before the dialog opens, rather than marking it.
// Browsers honour `autofocus` in a dialog too, so it counts as well.
function initialFocus(el: HTMLDialogElement) {
  return (
    el.querySelector<HTMLElement>("[data-autofocus], [autofocus]") ??
    el.querySelector('[data-slot="body"]')?.querySelector<HTMLElement>(FOCUSABLE) ??
    el.querySelector('[data-slot="actions"]')?.querySelector<HTMLElement>(FOCUSABLE) ??
    el.querySelector<HTMLElement>('[data-slot="close"]')
  );
}

// showModal() puts the dialog in the top layer, above everything else, and makes the
// rest of the page inert, so focus, clicks and screen readers stay inside it.
function show() {
  const el = dialog.value;
  if (!el || el.open) return;
  opener = document.activeElement as HTMLElement | null;
  el.showModal();
  initialFocus(el)?.focus();
}

function hide() {
  if (dialog.value?.open) dialog.value.close();
  restoreFocus();
}

// Back to whatever opened the dialog, so keyboard and screen reader users carry on where
// they left off. A control that's gone from the page can't take focus, so then it's up
// to the page to move it somewhere that makes sense.
function restoreFocus() {
  opener?.focus();
  opener = null;
}

watch(
  () => open,
  (value) => (value ? show() : hide()),
  { flush: "post" },
);

// Escape is handled on keydown, rather than through the dialog's `cancel`, so a control
// inside that closes on Escape first, like a menu, can stop it with preventDefault().
function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || event.defaultPrevented) return;
  event.preventDefault();
  emit("close", "escape", "");
}

// Other close requests, like the back gesture on Android, ask too, rather than closing it.
// A browser that won't let one be turned down, without a press or a key since the last,
// makes its `cancel` uncancelable and closes the dialog itself, which `onClose` reports.
function onCancel(event: Event) {
  if (!event.cancelable) return;
  event.preventDefault();
  emit("close", "escape", "");
}

// When the browser closed the dialog itself, it can't be turned down, so it says so with
// a reason of its own, `closed`, for `open` to follow, and gives focus back. A `close`
// that arrives once it's open again, like after closing and reopening it in one go, is
// one it already handled.
function onClose() {
  if (dialog.value?.open) return;
  restoreFocus();
  if (open) emit("close", "closed", "");
}

// A <form method="dialog"> would close the dialog itself. It asks instead, with the
// value of the button that submitted it, like `delete`. A button's own `formmethod`
// wins over its form's `method`, as it does when the form is sent.
function onSubmit(event: SubmitEvent) {
  const submitter = event.submitter as HTMLButtonElement | null;
  const method = submitter?.getAttribute("formmethod")?.toLowerCase() ?? (event.target as HTMLFormElement).method;
  if (method !== "dialog" || event.defaultPrevented) return;
  event.preventDefault();
  emit("close", "action", submitter?.value ?? "");
}

// A click on the backdrop lands on the <dialog>, outside its box. Both the press and the
// click have to be there, so selecting text and letting go outside doesn't close it.
let pressedBackdrop = false;

function onBackdrop(event: MouseEvent) {
  const el = dialog.value!;
  const box = el.getBoundingClientRect();
  const { clientX: x, clientY: y } = event;
  return event.target === el && (x < box.left || x > box.right || y < box.top || y > box.bottom);
}

function onMousedown(event: MouseEvent) {
  pressedBackdrop = onBackdrop(event);
}

function onClick(event: MouseEvent) {
  // An alert dialog needs an answer, so a stray click outside it doesn't count as one.
  if (role === "dialog" && pressedBackdrop && onBackdrop(event)) emit("close", "backdrop", "");
  pressedBackdrop = false;
}

onMounted(() => {
  if (open) show();

  if (import.meta.env.DEV && !title.trim()) {
    console.warn("[Dialog] has no title: give it one, since it's what names the dialog.", dialog.value);
  }
});

onBeforeUnmount(hide);
</script>

<template>
  <dialog
    :id="id"
    ref="dialog"
    class="dialog"
    :role="role === 'alertdialog' ? 'alertdialog' : undefined"
    :aria-labelledby="`${id}-title`"
    :aria-describedby="description ? `${id}-description` : undefined"
    :data-size="size"
    @keydown="onKeydown"
    @cancel="onCancel"
    @close="onClose"
    @submit="onSubmit"
    @mousedown="onMousedown"
    @click="onClick"
  >
    <div data-slot="header">
      <h2 :id="`${id}-title`" data-slot="title">{{ title }}</h2>
      <Button
        v-if="role === 'dialog'"
        data-slot="close"
        :label="closeLabel"
        variant="ghost"
        size="sm"
        icon-only
        @click="emit('close', 'close-button', '')"
      >
        <template #leading>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </template>
      </Button>
      <p v-if="description" :id="`${id}-description`" data-slot="description">{{ description }}</p>
    </div>
    <div v-if="$slots.default" data-slot="body">
      <slot />
    </div>
    <div v-if="$slots.actions" data-slot="actions">
      <slot name="actions" />
    </div>
  </dialog>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The dialog's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

/* The panel looks like the Card: the same padding, spacing, radius, border and type.
   Only its background differs, since it has to cover the page. */
@layer components {
  .dialog {
    /* Set per size. */
    --dialog--width: 32rem;
    --dialog--padding: 1.25rem;
    --dialog--gap: 0.75rem;
    --dialog--radius: 0.75rem;
    /* The panel's border is decoration: the backdrop and the title say what it is, so it
       doesn't need 3:1. */
    --dialog--border-color: color-mix(in srgb, currentColor 20%, transparent);
    /* The native dialog's own background, which follows `color-scheme`, so it covers the page. */
    --dialog--background: Canvas;
    /* The page behind it, dimmed, so people can tell it's out of reach until they're done. */
    --dialog--backdrop--background-color: color-mix(in srgb, #000 50%, transparent);

    box-sizing: border-box;
    /* Never wider or taller than the screen, less a margin, so it fits at 320px wide and at 200% zoom. */
    width: min(var(--dialog--width), 100% - 2rem);
    max-width: none;
    max-height: calc(100% - 2rem);
    margin: auto;
    padding: var(--dialog--padding);
    border: 1px solid var(--dialog--border-color);
    border-radius: var(--dialog--radius);
    background-color: var(--dialog--background);
    color: var(--color--neutral-text);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
    /* Long words, like a web address, wrap rather than overflow the panel. */
    overflow-wrap: break-word;
  }
  /* Only while it's open, since a closed dialog stays hidden by the browser's own styles. */
  .dialog[open] {
    display: flex;
    flex-direction: column;
    gap: var(--dialog--gap);
  }
  .dialog::backdrop {
    background-color: var(--dialog--backdrop--background-color);
  }

  /* Sizes */
  .dialog[data-size="sm"] {
    --dialog--width: 24rem;
  }
  .dialog[data-size="lg"] {
    --dialog--width: 48rem;
  }

  /* Parts. They have no borders of their own, like the Card's. The title and the actions
     stay in view, and the body scrolls between them. */
  .dialog > [data-slot="header"] {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 0.25rem 1rem;
  }
  .dialog [data-slot="title"] {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.375;
  }
  .dialog [data-slot="close"] {
    grid-column: 2;
    grid-row: 1;
    /* Centred on the title's first line, and lined up with the edge of the content. */
    margin-block: calc((1.375rem - 2rem) / 2);
    margin-inline-end: -0.5rem;
  }
  .dialog [data-slot="description"] {
    grid-column: 1 / -1;
    margin: 0;
    /* The text colour at 70%, which has 4.5:1 against the panel. */
    color: color-mix(in srgb, currentColor 70%, transparent);
  }
  .dialog > [data-slot="body"] {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    /* Room for the focus rings of the controls at its edges, which it would clip. */
    margin: -0.25rem;
    padding: 0.25rem;
  }
  .dialog > [data-slot="actions"] {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
  /* A <form method="dialog"> around the actions lays them out as if it weren't there. */
  .dialog > [data-slot="actions"] > form {
    display: contents;
  }

  /* The page behind doesn't scroll while a dialog is open, and keeps its scrollbar's
     space, so it doesn't shift sideways. */
  :global(:root:has(.dialog:modal)) {
    overflow: hidden;
    scrollbar-gutter: stable;
  }

  /* It fades and grows in, unless people have asked for less motion. */
  @media (prefers-reduced-motion: no-preference) {
    .dialog[open],
    .dialog[open]::backdrop {
      transition:
        opacity 150ms ease-out,
        scale 150ms ease-out;
    }
    @starting-style {
      .dialog[open] {
        opacity: 0;
        scale: 0.96;
      }
      .dialog[open]::backdrop {
        opacity: 0;
      }
    }
  }

  /* With more contrast, the border is drawn in the text colour at full strength. */
  @media (prefers-contrast: more) {
    .dialog {
      --dialog--border-color: currentColor;
    }
  }
}
</style>
```
```ts [Dialog.test.ts]
import { fireEvent, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";
import { h, nextTick, ref, type VNodeChild } from "vue";
import Dialog, { type DialogProps } from "./Dialog.vue";

// jsdom has <dialog> and its `open`, but not showModal() or close(), so these stand in
// for them. They can't put the dialog in the top layer, make the rest of the page inert
// or keep Tab inside it, which is why the checklist checks those in a browser instead.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event("close"));
  });
});

beforeEach(() => {
  vi.mocked(HTMLDialogElement.prototype.showModal).mockClear();
});

// jsdom lays nothing out, so every box is 0 × 0 at 0, 0. This gives the dialog a real
// one, at 100, 100 and 400 × 300, so a press can land on the panel or on the backdrop.
function layOut(dialog: HTMLElement) {
  dialog.getBoundingClientRect = () => new DOMRect(100, 100, 400, 300);
}

async function press(target: Element, clientX: number, clientY: number) {
  await fireEvent.mouseDown(target, { clientX, clientY });
  await fireEvent.click(target, { clientX, clientY });
}

const field = (id: string, text: string) => [h("label", { for: id }, text), h("input", { id })];
const button = (text: string, attrs = {}) => h("button", { type: "button", ...attrs }, text);

// A page with a button that opens the dialog, which closes when `close` fires, the way
// you'd use it, unless `closes` is false.
function page(props: Partial<DialogProps> & Record<string, unknown> = {}, slots: Record<string, () => VNodeChild> = {}, { closes = true } = {}) {
  const open = ref(false);
  const onClose = vi.fn(() => {
    if (closes) open.value = false;
  });
  const result = render({
    render: () => [
      button("Edit profile", { onClick: () => (open.value = true) }),
      h(Dialog, { id: "edit-profile", title: "Edit profile", ...props, open: open.value, onClose }, slots),
    ],
  });
  return { ...result, open, onClose };
}

async function openFrom(user: ReturnType<typeof userEvent.setup>, name = "Edit profile") {
  await user.click(screen.getByRole("button", { name }));
}

describe("Dialog", () => {
  it("is a native dialog, opened with showModal() and found by its role and its title", async () => {
    const user = userEvent.setup();
    page({}, { default: () => field("name", "Full name") });

    await openFrom(user);
    const dialog = screen.getByRole("dialog", { name: "Edit profile" });
    expect(dialog.tagName).toBe("DIALOG");
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
    expect(vi.mocked(HTMLDialogElement.prototype.showModal).mock.contexts[0]).toBe(dialog);
    expect(dialog).toHaveAttribute("aria-labelledby", "edit-profile-title");
    expect(screen.getByRole("heading", { level: 2, name: "Edit profile" })).toHaveAttribute("id", "edit-profile-title");
  });

  it("names its close button Close, or its closeLabel", async () => {
    const user = userEvent.setup();
    const { onClose } = page({ closeLabel: "Fermer" }, {}, { closes: false });
    await openFrom(user);

    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalledWith("close-button", "");
  });

  it("is an alertdialog with role alertdialog, without a close button", async () => {
    const user = userEvent.setup();
    page(
      { id: "delete-project", title: "Delete project?", role: "alertdialog" },
      { actions: () => [button("Keep project"), button("Delete project")] },
    );

    await openFrom(user);
    expect(screen.getByRole("alertdialog", { name: "Delete project?" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("is described by its description, and not by the rest of its content", async () => {
    const user = userEvent.setup();
    const { unmount } = page(
      { description: "Your name and email address, as other people see them." },
      { default: () => field("name", "Full name") },
    );

    await openFrom(user);
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      "Your name and email address, as other people see them.",
    );

    unmount();
    page({ id: "rename", title: "Rename file" }, { default: () => field("file", "File name") });
    await openFrom(user);
    expect(screen.getByRole("dialog", { name: "Rename file" })).not.toHaveAttribute("aria-describedby");
  });

  it("isn't found while it's closed", () => {
    page();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("moves focus to the control marked with data-autofocus, or else the first in its body", async () => {
    const user = userEvent.setup();
    const { unmount } = page({}, { default: () => [...field("name", "Full name"), ...field("email", "Email address")] });
    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveFocus();
    unmount();

    page(
      {},
      {
        default: () => [
          ...field("name", "Full name"),
          h("label", { for: "email" }, "Email address"),
          h("input", { id: "email", "data-autofocus": "" }),
        ],
      },
    );
    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveFocus();
  });

  it("counts a control marked with autofocus too", async () => {
    const user = userEvent.setup();
    page(
      {},
      {
        default: () => [
          ...field("name", "Full name"),
          h("label", { for: "email" }, "Email address"),
          h("input", { id: "email", autofocus: true }),
        ],
      },
    );

    await openFrom(user);
    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveFocus();
  });

  it("moves focus to the first action without controls in its body, never the close button", async () => {
    const user = userEvent.setup();
    page({}, { default: () => h("p", "Your changes are saved."), actions: () => button("Done") });

    await openFrom(user);
    expect(screen.getByRole("button", { name: "Done" })).toHaveFocus();
  });

  it("moves focus to the least destructive action in an alert dialog, when it comes first", async () => {
    const user = userEvent.setup();
    page(
      { id: "delete-project", title: "Delete project?", role: "alertdialog" },
      { actions: () => [button("Keep project"), button("Delete project")] },
    );

    await openFrom(user);
    expect(screen.getByRole("button", { name: "Keep project" })).toHaveFocus();
  });

  it("gives focus back to the control that opened it when it closes", async () => {
    const user = userEvent.setup();
    page({}, { default: () => field("name", "Full name") });

    await openFrom(user);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit profile" })).toHaveFocus();
  });

  it("asks to close on Escape, the close button and the backdrop, and stays open until it's closed", async () => {
    const user = userEvent.setup();
    const { onClose } = page({}, { default: () => field("name", "Full name") }, { closes: false });
    await openFrom(user);
    const dialog = screen.getByRole("dialog", { name: "Edit profile" });

    layOut(dialog);

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Close" }));
    await press(dialog, 20, 20);

    expect(onClose.mock.calls).toEqual([
      ["escape", ""],
      ["close-button", ""],
      ["backdrop", ""],
    ]);
    expect(dialog).toHaveAttribute("open");
  });

  it("closes an alert dialog on Escape too, but not on the backdrop", async () => {
    const user = userEvent.setup();
    const { onClose } = page(
      { id: "delete-project", title: "Delete project?", role: "alertdialog" },
      { actions: () => button("Keep project") },
      { closes: false },
    );
    await openFrom(user);
    const dialog = screen.getByRole("alertdialog");
    layOut(dialog);

    await press(dialog, 20, 20);
    await user.keyboard("{Escape}");
    expect(onClose.mock.calls).toEqual([["escape", ""]]);
  });

  it("ignores a press that starts inside it and ends on the backdrop, and Escape a control inside handles", async () => {
    const user = userEvent.setup();
    const { onClose } = page(
      {},
      {
        default: () => [
          h("label", { for: "menu" }, "Search"),
          h("input", { id: "menu", onKeydown: (event: KeyboardEvent) => event.preventDefault() }),
        ],
      },
      { closes: false },
    );
    await openFrom(user);
    const dialog = screen.getByRole("dialog");
    layOut(dialog);

    await fireEvent.mouseDown(screen.getByRole("heading", { name: "Edit profile" }), { clientX: 200, clientY: 120 });
    await fireEvent.click(dialog, { clientX: 20, clientY: 20 });
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("ignores a press on its own padding, inside its box", async () => {
    const user = userEvent.setup();
    const { onClose } = page({}, { default: () => field("name", "Full name") }, { closes: false });
    await openFrom(user);
    const dialog = screen.getByRole("dialog");
    layOut(dialog);

    // The press lands on the <dialog> itself, as on the backdrop, but inside its box.
    await press(dialog, 300, 390);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("asks to close on other close requests, like the back gesture on Android, rather than closing", async () => {
    const user = userEvent.setup();
    const { onClose } = page({}, { default: () => field("name", "Full name") }, { closes: false });
    await openFrom(user);
    const dialog = screen.getByRole("dialog");

    const cancel = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose.mock.calls).toEqual([["escape", ""]]);
  });

  it("stops Escape from closing it, so it only asks once", async () => {
    const user = userEvent.setup();
    page({}, { default: () => field("name", "Full name") }, { closes: false });
    await openFrom(user);

    // A cancelled keydown is what keeps a real browser from closing it too.
    const keydown = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    screen.getByRole("textbox", { name: "Full name" }).dispatchEvent(keydown);
    expect(keydown.defaultPrevented).toBe(true);
  });

  // A page that keeps the dialog open, like for unsaved changes, unless it's already closed.
  function keepsOpen() {
    const open = ref(false);
    const onClose = vi.fn((reason: string) => {
      if (reason === "closed") open.value = false;
    });
    render({
      render: () => [
        button("Edit profile", { onClick: () => (open.value = true) }),
        h(Dialog, { id: "edit-profile", title: "Edit profile", open: open.value, onClose }, () =>
          field("name", "Full name"),
        ),
      ],
    });
    return { open, onClose };
  }

  it("says it's closed, and gives focus back, when the browser closes it anyway", async () => {
    const user = userEvent.setup();
    const { open, onClose } = keepsOpen();
    await openFrom(user);
    const dialog = screen.getByRole("dialog") as HTMLDialogElement;

    await user.keyboard("{Escape}");
    expect(dialog.open).toBe(true);
    onClose.mockClear();

    // A close request the browser no longer lets the page turn down: an uncancelable
    // `cancel`, then the browser closes it.
    dialog.dispatchEvent(new Event("cancel", { cancelable: false }));
    dialog.close();
    expect(onClose.mock.calls).toEqual([["closed", ""]]);
    await nextTick();
    expect(open.value).toBe(false);
    expect(dialog.open).toBe(open.value);
    expect(screen.getByRole("button", { name: "Edit profile" })).toHaveFocus();

    // It opens again, since `open` followed it.
    await openFrom(user);
    expect(dialog.open).toBe(true);
  });

  it("ignores a close that arrives once it's open again", async () => {
    const user = userEvent.setup();
    const { onClose } = keepsOpen();
    await openFrom(user);
    const dialog = screen.getByRole("dialog") as HTMLDialogElement;

    // Like the `close` a browser fires after closing and reopening it in one go.
    dialog.dispatchEvent(new Event("close"));
    expect(onClose).not.toHaveBeenCalled();
    expect(dialog.open).toBe(true);
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it("doesn't fire close when you close it", async () => {
    const user = userEvent.setup();
    const { open, onClose } = page({}, { default: () => field("name", "Full name") });
    await openFrom(user);

    open.value = false;
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Edit profile" })).toHaveFocus();
  });

  it("asks to close with the button's value when a form with method dialog is sent", async () => {
    const user = userEvent.setup();
    const { onClose } = page(
      { id: "delete-project", title: "Delete project?", role: "alertdialog" },
      {
        actions: () =>
          h("form", { method: "dialog" }, [
            h("button", { value: "keep" }, "Keep project"),
            h("button", { value: "delete" }, "Delete project"),
          ]),
      },
      { closes: false },
    );
    await openFrom(user);

    await user.click(screen.getByRole("button", { name: "Delete project" }));
    expect(onClose).toHaveBeenCalledWith("action", "delete");
    expect(screen.getByRole("alertdialog")).toHaveAttribute("open");
  });

  it("leaves any other form alone, unless its button has formmethod dialog", async () => {
    const user = userEvent.setup();
    // The page sends the form itself, from a listener further up, once the dialog has
    // seen the submit, and leaves the Cancel button to the dialog.
    const onSubmit = vi.fn((event: SubmitEvent) => {
      if (event.submitter?.getAttribute("formmethod") !== "dialog") event.preventDefault();
    });
    document.addEventListener("submit", onSubmit);
    onTestFinished(() => document.removeEventListener("submit", onSubmit));
    const { onClose } = page(
      {},
      {
        default: () =>
          h("form", { method: "post" }, [
            ...field("name", "Full name"),
            h("button", { value: "save" }, "Save changes"),
            h("button", { value: "cancel", formmethod: "dialog" }, "Cancel"),
          ]),
      },
      { closes: false },
    );
    await openFrom(user);

    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose.mock.calls).toEqual([["action", "cancel"]]);
  });

  it("opens and closes with its open prop alone", async () => {
    const open = ref(true);
    render({ render: () => h(Dialog, { id: "edit-profile", title: "Edit profile", open: open.value }) });

    const dialog = screen.getByRole("dialog", { name: "Edit profile" });
    open.value = false;
    await vi.waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    open.value = true;
    await vi.waitFor(() => expect(dialog).toHaveAttribute("open"));
  });

  it("puts attributes, classes and listeners on the dialog", async () => {
    const user = userEvent.setup();
    const onKeyup = vi.fn();
    page({ class: "wide", "data-testid": "profile", onKeyup }, { default: () => field("name", "Full name") });

    await openFrom(user);
    const dialog = screen.getByRole("dialog");
    await user.keyboard("a");
    expect(dialog).toHaveClass("dialog", "wide");
    expect(dialog).toHaveAttribute("data-testid", "profile");
    expect(onKeyup).toHaveBeenCalled();
  });

  it("mirrors its size as a data attribute, and marks its parts", () => {
    const { container } = render(Dialog, {
      props: { id: "edit-profile", title: "Edit profile", description: "As other people see them.", size: "lg" },
      slots: { default: () => "Content", actions: () => button("Save") },
    });

    const dialog = container.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("data-size", "lg");
    const fallback = render(Dialog, { props: { id: "rename", title: "Rename file" } });
    expect(fallback.container.querySelector("dialog")).toHaveAttribute("data-size", "md");
    // The close button is a Button, with parts of its own.
    const parts = [...dialog.querySelectorAll("[data-slot]")]
      .filter((part) => !part.parentElement?.closest('[data-slot="close"]'))
      .map((part) => part.getAttribute("data-slot"));
    expect(parts).toEqual(["header", "title", "close", "description", "body", "actions"]);
  });

  it("renders the same markup every time, with IDs from its own, and keeps its elements as it opens", async () => {
    const options = {
      props: { id: "edit-profile", title: "Edit profile", description: "As other people see them." },
      slots: { default: () => "Content", actions: () => button("Save") },
    };
    const first = render(Dialog, options).container.innerHTML;
    const { container, rerender } = render(Dialog, options);
    expect(container.innerHTML).toBe(first);
    expect(first).not.toMatch(/id="(?!edit-profile)/);

    const dialog = container.querySelector("dialog")!;
    const title = dialog.querySelector('[data-slot="title"]');
    await rerender({ open: true });
    expect(container.querySelector("dialog")).toBe(dialog);
    expect(dialog.querySelector('[data-slot="title"]')).toBe(title);
  });

  it("warns in development when it has no title", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Dialog, { props: { id: "untitled", title: "" } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no title"), expect.anything());

    warn.mockClear();
    render(Dialog, { props: { id: "edit-profile", title: "Edit profile" } });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
```
:::
::

## Sources

- [HTML Standard: the dialog element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element), its focusing steps and [close requests](https://html.spec.whatwg.org/multipage/interaction.html#close-requests-and-close-watchers)
- [WAI-ARIA Authoring Practices: Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) and [Alert Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/), for focus, `Escape` and when to describe a dialog
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding SC 2.4.3: Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), for moving focus into a dialog and back out
- [Understanding SC 2.1.2: No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)
- [Understanding SC 2.3.3: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), for opening without motion
- [MDN: `<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), for `showModal()`, `returnValue` and `<form method="dialog">`
- [Primer: Dialog](https://primer.style/product/components/dialog/), for sizes, the header and the footer
- [Base UI: Dialog](https://base-ui.com/react/components/dialog) and [Alert Dialog](https://base-ui.com/react/components/alert-dialog), for a controlled `open` and the reasons a dialog closes
