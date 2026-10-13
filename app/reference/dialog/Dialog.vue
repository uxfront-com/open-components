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
function onCancel(event: Event) {
  event.preventDefault();
  emit("close", "escape", "");
}

// A browser that won't let a close request be cancelled again, without a press or a key
// in between, closes the dialog itself. That can't be turned down, so it says so with a
// reason of its own, `closed`, for `open` to follow, and gives focus back.
function onClose() {
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

@layer components {
  .dialog {
    /* Set per size. */
    --dialog--width: 32rem;
    --dialog--padding: 1.5rem;
    --dialog--gap: 1rem;
    --dialog--radius: 0.75rem;
    /* The text colour at 20%, which sets the panel apart where the backdrop barely shows, like on a dark page. */
    --dialog--border-color: color-mix(in srgb, currentColor 20%, transparent);
    /* The page behind it, dimmed, so people can tell it's out of reach until they're done. */
    --dialog--backdrop--background-color: color-mix(in srgb, #000 50%, transparent);

    box-sizing: border-box;
    /* Never wider or taller than the screen, less a margin, so it fits at 320px wide and at 200% zoom. */
    width: min(var(--dialog--width), 100% - 2rem);
    max-width: none;
    max-height: calc(100% - 2rem);
    margin: auto;
    padding: var(--dialog--padding) 0;
    border: 1px solid var(--dialog--border-color);
    border-radius: var(--dialog--radius);
    /* The native dialog's own colours, which follow `color-scheme`, so it needs no theme tokens. */
    background-color: Canvas;
    color: CanvasText;
    box-shadow: 0 1.5rem 3rem -0.75rem color-mix(in srgb, #000 35%, transparent);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
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

  /* Parts. The title and the actions stay in view, and the body scrolls between them. */
  .dialog > [data-slot] {
    padding-inline: var(--dialog--padding);
  }
  .dialog > [data-slot="header"] {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 0.25rem 1rem;
  }
  .dialog [data-slot="title"] {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.75rem;
    overflow-wrap: anywhere;
  }
  .dialog [data-slot="close"] {
    grid-column: 2;
    grid-row: 1;
    /* Lined up with the title's first line, and with the edge of the content. */
    margin-inline-end: -0.5rem;
  }
  .dialog [data-slot="description"] {
    grid-column: 1 / -1;
    margin: 0;
    /* The text colour at 80%, which keeps well above 4.5:1 against the panel. */
    color: color-mix(in srgb, currentColor 80%, transparent);
  }
  .dialog > [data-slot="body"] {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    /* Room for the focus rings of the controls at its edges, which it would clip. */
    margin-block: -0.25rem;
    padding-block: 0.25rem;
  }
  .dialog > [data-slot="actions"] {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.75rem;
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
