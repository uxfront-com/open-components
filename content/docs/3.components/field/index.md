---
title: Field
description: How to build a field that labels, describes and explains the errors of any form control, works for everyone, feels familiar to every developer and can be checked by your agents.
navigation:
  title: Overview
---

A field is what turns a form control into a question people can answer. Its label says what to fill in, its hint how, and its error message what went wrong and how to fix it. Each of them is an element of its own, linked to the control by ID, which is why they so often come apart. Think of a label that does nothing when you click it, a hint that screen readers never read because nothing points to it, or an error in red that no one hears about, since its control was never marked invalid.

This page walks you through building one the right way. We'll look at:

::card-group
:::card{to="/docs/components/field/ui" icon="i-lucide-palette" title="User Interface (UI)"}
How a field looks, from its parts and where they go around each kind of control to its sizes, states and tokens.
:::

:::card{to="/docs/components/field/ux" icon="i-lucide-user" title="User Experience (UX)"}
How a field behaves for every person and setting, so its control is named, described and marked required or invalid the way assistive technologies expect.
:::

:::card{to="/docs/components/field/dx" icon="i-lucide-code-xml" title="Developer Experience (DX)"}
How developers use the Field, with one typed API that labels, describes and validates every form control, without changing any of them.
:::

:::card{to="/docs/components/field/ax" icon="i-lucide-bot" title="Agentic Experience (AX)"}
How agents read, fill in and check a field, from its accessibility tree to its contract, its DOM and its tests.
:::
::

## At a glance

Every example on this page runs on our [reference implementation](/docs/components/field#reference-implementation), which does its part of every rule in the [checklist](/docs/components/field#checklist), so feel free to fill them in as you read. The code under each example comes in React, Vue, Svelte, Angular, Solid, Astro and Vanilla, written for a Field with the same API in each. Pick yours from the Framework select above the sidebar. Vanilla is plain HTML and JavaScript, so it writes out the markup from the [DOM contract](/docs/components/field/ax#deterministic).

The Field holds one control: an [Input](/docs/components/input), a [Textarea](/docs/components/textarea), a [Checkbox](/docs/components/checkbox), a [Switch](/docs/components/switch), a [Checkbox Group](/docs/components/checkbox-group) or a [Radio Group](/docs/components/radio-group). It renders the label, hint and error message around it, gives it its `id`, and sets its `aria-describedby`, `aria-invalid`, `required` and `disabled` for you. The controls themselves don't change, so everything their own pages say still holds inside a Field.

::field-playground
::

| Aspect      | Field                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| Element     | A `<div>` around the control, with a `<label>` and a `<p>` each for the hint and the error, except around a Radio Group, which renders its own |
| Role        | None of its own, so the control keeps its role, like `textbox`, `checkbox`, `switch`, `group` or `radiogroup` |
| Name        | Its `<label>`, linked with `for`, or a Checkbox's own label, or a group's legend                       |
| Description | The hint, then the error, through the control's `aria-describedby`                                     |
| States      | Required, disabled and invalid, which it sets on the control                                            |
| Controls    | Input, Textarea, Checkbox, Switch, Checkbox Group, Radio Group and native text controls                |
| Sizes       | `xs`, `sm`, `md`, `lg` and `xl`, which it passes on to the control, unless it's a native one              |
| Pattern     | None in the APG, since a native [`<label>`](https://html.spec.whatwg.org/multipage/forms.html#the-label-element) and `aria-describedby` cover it |
| WCAG 2.2    | 1.3.1, 1.4.1, 1.4.3, 2.4.6, 3.3.1, 3.3.2, 3.3.3, 4.1.2 and 4.1.3, among others                          |

## Checklist

Here's every rule in one place, along with where it comes from and how to check it. A field meets the standard when it meets every **must**, and each **should** is expected unless you have a good reason not to follow it.

The scope says who meets a rule. **Component** rules are met by the Field itself, so they're the ones to check when you build or review one. **Usage** rules are met by the forms that use it, like writing an error message that says how to fix what's wrong, so they're the ones to check when you review a screen. **Both** rules need the two to work together.

The basis says where a rule comes from. Many of the rules rest on **WCAG** 2.2, which we follow at level AA, and name the success criteria behind them, and a few come from **HTML**. The rest are **Open Components** rules, which are our own, like building every ID from what you pass rather than generating it. Where a rule asks for more than its criterion, its basis says **beyond**, like marking required and optional fields in words.

You'll find the rules for each layer on its page:

- [User Interface (UI) Checklist](/docs/components/field/ui#ui-checklist)
- [User Experience (UX) Checklist](/docs/components/field/ux#ux-checklist)
- [Developer Experience (DX) Checklist](/docs/components/field/dx#dx-checklist)
- [Agentic Experience (AX) Checklist](/docs/components/field/ax#ax-checklist)

## Reference implementation

Our Vue 3 reference implementation does its part of every rule on this page, and powers every example on it. Feel free to copy it into your design system and change how it looks, but try to keep how it behaves. It reads the same theme tokens as the Button, so copy [`tokens.css`](/docs/components/button#reference-implementation) from the Button's reference implementation into your theme too.

The Field tells the controls apart by their component, so it imports the reference Checkbox, Switch, Checkbox Group and Radio Group. Point those imports at your own. Any other control is laid out as a text control, with its label above it, so add a control of yours that names itself, like a toggle button group, to `kindOf()`.

The tests are in `Field.test.ts`, and mount the real controls too. To run them, you'll need [Vitest](https://vitest.dev), set to `environment: "jsdom"` and `globals: true`, along with `@testing-library/vue`, `@testing-library/user-event` and `@testing-library/jest-dom`.

::code-collapse
:::code-group
```vue [Field.vue]
<script lang="ts">
import { Comment, Fragment, Text, cloneVNode, defineComponent, h, isVNode, onMounted, type PropType, type SlotsType, type VNode } from "vue";
import Checkbox from "../checkbox/Checkbox.vue";
import CheckboxGroup from "../checkbox-group/CheckboxGroup.vue";
import RadioGroup from "../radio-group/RadioGroup.vue";
import Switch from "../switch/Switch.vue";

export interface FieldProps {
  /** The control's `id`, which its label, hint and error point at. Without it, the control's own `id`, then its `name`. */
  id?: string;
  /** Names a text control or a Switch, as its <label>. A Checkbox, a Checkbox Group and a Radio Group name themselves, so they don't take one. */
  label?: string;
  /** Help people need before they fill it in, like the format you expect. Screen readers read it after the control's name. */
  hint?: string;
  /** What's wrong and how to fix it. While it's set, the control is invalid, and screen readers say so. */
  error?: string;
  /** Sets the control's native `required`, which screen readers announce. A Checkbox Group never gets it, since HTML can't require one of a group of checkboxes. */
  required?: boolean;
  /** Disables the control, which leaves it out of its form. */
  disabled?: boolean;
  /** The text size, which also goes to a component control, but never a native one. Without it, the control's own. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * What the Field renders around a control depends on what it is, which it reads from
 * the control's component, so none of the controls needs to know about the Field:
 *
 * - `text`: an Input, a Textarea or a native <input>, <textarea> or <select>. The label
 *   above it, the hint between them, the error after it.
 * - `checkbox`: a Checkbox, which its own <label> names. The hint and error after it.
 * - `switch`: a Switch. The label before it on the same row, the hint and error under it.
 * - `checkbox-group`: a Checkbox Group, which its <legend> names. The hint and error after it.
 * - `radio-group`: a Radio Group, which renders its own legend, hint and error, so the
 *   Field renders nothing and hands it the props instead.
 */
export type FieldControl = "text" | "checkbox" | "switch" | "checkbox-group" | "radio-group";

/** The one control in the default slot, leaving out comments and blank text. */
function controls(nodes: VNode[] = []): VNode[] {
  return nodes.flatMap((node) => {
    if (node.type === Fragment && Array.isArray(node.children)) return controls(node.children.filter(isVNode));
    if (node.type === Comment || (node.type === Text && !String(node.children).trim())) return [];
    return [node];
  });
}

function kindOf(control: VNode): FieldControl {
  if (control.type === Checkbox) return "checkbox";
  if (control.type === Switch) return "switch";
  if (control.type === CheckboxGroup) return "checkbox-group";
  if (control.type === RadioGroup) return "radio-group";
  return "text";
}

// A native checkbox or radio isn't a text control, and a label above it would read wrong.
const nativeToggle = (control: VNode) =>
  control.type === "input" && ["checkbox", "radio"].includes(String(control.props?.type));

export default defineComponent({
  name: "Field",
  props: {
    id: String,
    label: String,
    hint: String,
    error: String,
    required: Boolean,
    disabled: Boolean,
    size: String as PropType<FieldProps["size"]>,
  },
  slots: Object as SlotsType<{
    /** One control: an Input, a Textarea, a Checkbox, a Switch, a Checkbox Group, a Radio Group or a native text control. */
    default?: () => VNode[];
  }>,
  setup(props, { slots }) {
    // What the last render found in the slot, which the development checks read once it
    // has mounted, since calling the slot outside a render wouldn't track what it reads.
    let found: VNode[] = [];

    onMounted(() => {
      if (!import.meta.env.DEV) return;
      const control = found[0];
      if (found.length !== 1 || !control) {
        console.warn(`[Field] needs exactly one control, and has ${found.length}: give each control a Field of its own.`);
        return;
      }
      const kind = kindOf(control);
      if (nativeToggle(control)) {
        console.warn("[Field] has a native checkbox or radio: use a Checkbox, or a Radio Group, which name themselves.");
      }
      const named = { checkbox: "Checkbox", "checkbox-group": "Checkbox Group", "radio-group": "Radio Group" } as const;
      if (props.label && kind in named) {
        console.warn(`[Field] has a label, but a ${named[kind as keyof typeof named]} names itself: put the text in its label or legend instead.`);
      }
      if (kind !== "radio-group" && !(props.id ?? control.props?.id ?? control.props?.name)) {
        console.warn("[Field] has no id: give it one, or give its control an id or a name, so its label, hint and error can point at it.");
      }
    });

    return () => {
      found = controls(slots.default?.());
      const control = found[0];
      if (!control) return null;
      const kind = kindOf(control);
      const own = control.props ?? {};
      const size = props.size ?? own.size ?? "md";

      // A Radio Group builds its legend, hint and error, and their IDs from its name, so
      // it gets the Field's props, which win over its own, and the Field renders nothing.
      if (kind === "radio-group") {
        return cloneVNode(control, {
          ...(props.hint && { hint: props.hint }),
          ...(props.error && { error: props.error }),
          ...(props.required && { required: true }),
          ...(props.disabled && { disabled: true }),
          ...(props.size && { size: props.size }),
        });
      }

      // IDs come from what you pass, rather than being made up, so the markup is the
      // same on the server, on the client and in every snapshot, and the label works
      // before any script runs.
      const id: string | undefined = props.id ?? own.id ?? own.name;
      const hintId = props.hint && id ? `${id}-hint` : undefined;
      const errorId = props.error && id ? `${id}-error` : undefined;
      // The hint, then the error, so the error is read after what it's about, then
      // anything the control adds itself, like a Textarea's count.
      const describedBy = [hintId, errorId, own["aria-describedby"]].filter(Boolean).join(" ") || undefined;

      const wired = cloneVNode(control, {
        id,
        "aria-describedby": describedBy,
        ...(props.error && { "aria-invalid": "true" }),
        // HTML has no way to require one of a group of checkboxes, so a Checkbox Group
        // never gets it: say so in the hint, and check it on submit.
        ...(props.required && kind !== "checkbox-group" && { required: true }),
        ...(props.disabled && { disabled: true }),
        // A native control's `size` is a number of characters or rows, so only components get it.
        ...(props.size && typeof control.type !== "string" && { size: props.size }),
      });

      // A Checkbox and a Checkbox Group name themselves, so they get no label.
      const label =
        props.label && (kind === "text" || kind === "switch")
          ? h("label", { "data-slot": "label", for: id }, props.label)
          : null;
      const hint = props.hint ? h("p", { "data-slot": "hint", id: hintId }, props.hint) : null;
      // Rendered only while there's an error, so screen readers never read an empty one.
      // It isn't a live region: people hear it when they reach the control.
      const error = props.error ? h("p", { "data-slot": "error", id: errorId }, props.error) : null;

      return h("div", { class: "field", "data-size": size, "data-control": kind }, [
        label,
        // People read the hint before they type, so it sits between a text control and its label.
        kind === "text" ? hint : null,
        wired,
        kind === "text" ? null : hint,
        error,
      ]);
    };
  },
});
</script>

<style scoped>
/* The same layer order as Tailwind CSS. The field's styles go in `components`,
   so they win over the resets in `base`, and give way to utilities and to any
   style outside a layer, like a class of yours that sets its variables. */
@layer theme, base, components, utilities;

@layer components {
  .field {
    /* Set per size. The gap and the text sizes are the Radio Group's, so a field and a
       group sit well together in a form. */
    --field--gap: 0.25rem;
    --field--font-size: 0.875rem;
    /* The space between a Switch and its label, on the same row. */
    --field--column-gap: 1rem;
    /* How far a Checkbox's hint and error sit in, so they line up with its label. */
    --field--indent: 1.625rem;

    display: flex;
    flex-direction: column;
    gap: var(--field--gap);
    /* In a flex row, it can get narrower than its control is on its own, rather than overflow. */
    min-width: 0;
    color: var(--color--neutral-text);
    font-family: inherit;
    font-size: var(--field--font-size);
    line-height: 1.25;
  }

  /* Sizes */
  .field[data-size="xs"] {
    --field--font-size: 0.75rem;
    --field--indent: 1.25rem;
  }
  .field[data-size="sm"] {
    --field--indent: 1.5rem;
  }
  .field[data-size="lg"] {
    --field--font-size: 1rem;
    --field--indent: 1.75rem;
  }
  .field[data-size="xl"] {
    --field--font-size: 1rem;
    --field--indent: 2.125rem;
  }

  /* Parts */
  .field > [data-slot="label"] {
    /* The Radio Group's legend weight, so labels and legends look alike. */
    font-weight: 500;
  }
  .field > [data-slot="hint"],
  .field > [data-slot="error"] {
    margin: 0;
  }
  .field > [data-slot="hint"] {
    /* The text colour at 70%, which has 4.5:1 against the page, like the Radio Group's hint. */
    color: color-mix(in srgb, currentColor 70%, transparent);
  }
  .field > [data-slot="error"] {
    color: var(--color--error-text);
  }

  /* A Checkbox's hint and error line up with its label, rather than its box. */
  .field[data-control="checkbox"] > [data-slot="hint"],
  .field[data-control="checkbox"] > [data-slot="error"] {
    padding-inline-start: var(--field--indent);
  }

  /* A Switch sits after its label on the same row, with the hint and error under both.
     Logical, so it mirrors in right-to-left layouts. */
  .field[data-control="switch"] {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    column-gap: var(--field--column-gap);
    row-gap: var(--field--gap);
  }
  .field[data-control="switch"] > [data-slot="hint"],
  .field[data-control="switch"] > [data-slot="error"] {
    grid-column: 1 / -1;
  }

  /* States. Each one reads the control's own attribute, so the label can't look
     disabled while the control isn't. Only the control counts, whether it's native or
     a component's control part, and not a button in an Input's actions. */
  .field:has(> :disabled, > * > [data-slot="control"]:disabled) > [data-slot="label"] {
    opacity: 0.5;
  }

  @media (forced-colors: active) {
    .field:has(> :disabled, > * > [data-slot="control"]:disabled) > [data-slot="label"] {
      color: GrayText;
      opacity: 1;
    }
  }
}
</style>
```

```ts [Field.test.ts]
import { render, screen, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import Checkbox from "../checkbox/Checkbox.vue";
import CheckboxGroup from "../checkbox-group/CheckboxGroup.vue";
import Input from "../input/Input.vue";
import Radio from "../radio-group/Radio.vue";
import RadioGroup from "../radio-group/RadioGroup.vue";
import Switch from "../switch/Switch.vue";
import Textarea from "../textarea/Textarea.vue";
import Field from "./Field.vue";

const parts = (root: Element) => [...root.children].map((part) => part.getAttribute("data-slot") ?? part.className);

// Each element with its attributes, which the server and the client write in different orders.
const markup = (root: Element) =>
  [...root.querySelectorAll("*")].map((element) =>
    [element.tagName, ...[...element.attributes].map(({ name, value }) => `${name}="${value}"`).sort()].join(" "),
  );

const options = [
  { value: "email", label: "Email" },
  { value: "sms", label: "Text message" },
];
const radios = () => ["Standard", "Express"].map((label) => h(Radio, { value: label.toLowerCase() }, () => label));

describe("Field", () => {
  it("names a text control with its label, and describes it with its hint", () => {
    render(Field, {
      props: { id: "phone", label: "Phone number", hint: "Include the country code" },
      slots: { default: () => h(Input, { type: "tel" }) },
    });

    const input = screen.getByRole("textbox", { name: "Phone number" });
    expect(input).toHaveAttribute("id", "phone");
    expect(input).toHaveAccessibleDescription("Include the country code");
    expect(input).toHaveAttribute("aria-describedby", "phone-hint");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("puts the label, the hint, the control and the error in that order around a text control", () => {
    const { container } = render(Field, {
      props: { id: "email", label: "Email address", hint: "We'll only use it for receipts", error: "Enter an email address" },
      slots: { default: () => h(Input, { type: "email" }) },
    });

    expect(parts(container.firstElementChild!)).toEqual(["label", "hint", "input", "error"]);
  });

  it("takes the control's id from its own id, else the control's id, else its name, and builds the hint's and error's from it", () => {
    const ids = (props: Record<string, string>, control: Record<string, string>) => {
      const { unmount } = render(Field, {
        props: { label: "Name", hint: "As on your card", error: "Enter your name", ...props },
        slots: { default: () => h(Input, control) },
      });
      const input = screen.getByRole("textbox", { name: "Name" });
      const result = [input.id, input.getAttribute("aria-describedby")];
      unmount();
      return result;
    };

    expect(ids({ id: "field" }, { id: "own", name: "full-name" })).toEqual(["field", "field-hint field-error"]);
    expect(ids({}, { id: "own", name: "full-name" })).toEqual(["own", "own-hint own-error"]);
    expect(ids({}, { name: "full-name" })).toEqual(["full-name", "full-name-hint full-name-error"]);
  });

  it("describes the control with its hint, then its error, which makes it invalid, only while it has one", async () => {
    const { rerender } = render(Field, {
      props: { id: "email", label: "Email address", hint: "We'll only use it for receipts" },
      slots: { default: () => h(Input, { type: "email" }) },
    });
    const input = screen.getByRole("textbox", { name: "Email address" });

    await rerender({ error: "Enter an email address in the correct format, like name@example.com" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-hint email-error");
    expect(input).toHaveAccessibleDescription(
      "We'll only use it for receipts Enter an email address in the correct format, like name@example.com",
    );
    // Read when people reach the control, rather than announced as it appears.
    expect(screen.getByText(/correct format/)).not.toHaveAttribute("aria-live");
    expect(screen.queryByRole("alert")).toBeNull();

    await rerender({ error: undefined });
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toHaveAttribute("aria-describedby", "email-hint");
    expect(screen.queryByText(/correct format/)).toBeNull();
  });

  it("keeps a description of the control's own after its hint and error", () => {
    render(Field, {
      props: { id: "email", label: "Email address", error: "Enter an email address" },
      slots: { default: () => h(Input, { "aria-describedby": "email-privacy" }) },
    });

    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveAttribute("aria-describedby", "email-error email-privacy");
  });

  it("keeps an aria-invalid set on the control while it has no error of its own", async () => {
    const { rerender } = render(Field, {
      props: { id: "code", label: "Discount code" },
      slots: { default: () => h(Input, { "aria-invalid": "true" }) },
    });
    const input = screen.getByRole("textbox", { name: "Discount code" });
    expect(input).toHaveAttribute("aria-invalid", "true");

    await rerender({ error: "Enter a code that hasn't expired" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a code that hasn't expired");
  });

  it("puts a Textarea's count after the hint and the error, and lets it stay invalid over its limit without one", async () => {
    const { rerender } = render(Field, {
      props: { id: "bio", label: "Bio", hint: "A sentence or two", error: "Tell us a little about yourself" },
      slots: { default: () => h(Textarea, { limit: 5, value: "Too long" }) },
    });

    const textarea = screen.getByRole("textbox", { name: "Bio" });
    expect(textarea).toHaveAttribute("aria-describedby", "bio-hint bio-error bio-count");

    await rerender({ error: undefined });
    expect(textarea).toHaveAttribute("aria-describedby", "bio-hint bio-count");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("sets the control's native required and disabled", async () => {
    const user = userEvent.setup();
    render(Field, {
      props: { id: "name", label: "Full name", required: true, disabled: true },
      slots: { default: () => h(Input) },
    });

    const input = screen.getByRole("textbox", { name: "Full name" });
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
    await user.tab();
    expect(input).not.toHaveFocus();
  });

  it("focuses the control when its label is pressed", async () => {
    const user = userEvent.setup();
    render(Field, { props: { id: "name", label: "Full name" }, slots: { default: () => h(Input) } });

    await user.click(screen.getByText("Full name"));
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveFocus();
  });

  it("labels a native select, textarea or text input as a text control", () => {
    render(Field, {
      props: { id: "country", label: "Country", hint: "Where you live", size: "lg" },
      slots: { default: () => h("select", [h("option", "Ireland"), h("option", "Portugal")]) },
    });

    const select = screen.getByRole("combobox", { name: "Country" });
    expect(select).toHaveAccessibleDescription("Where you live");
    expect(select).not.toHaveAttribute("size");
    expect(select.closest(".field")).toHaveAttribute("data-control", "text");
  });

  it("gives a Checkbox no second label, even with a label of its own, and describes it with the hint and error after it", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(Field, {
      props: {
        id: "terms",
        label: "Terms",
        hint: "You can read them before you sign up",
        error: "Agree to the terms to continue",
        required: true,
      },
      slots: { default: () => h(Checkbox, () => "I agree to the terms") },
    });

    const box = screen.getByRole("checkbox", { name: "I agree to the terms" });
    expect(box).toHaveAttribute("id", "terms");
    expect(box).toBeRequired();
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAccessibleDescription("You can read them before you sign up Agree to the terms to continue");
    expect(container.querySelectorAll("label")).toHaveLength(1);
    expect(parts(container.firstElementChild!)).toEqual(["checkbox", "hint", "error"]);
    expect(container.firstElementChild).toHaveAttribute("data-control", "checkbox");
    warn.mockRestore();
  });

  it("puts a Switch after its label, which names it, with the hint and error under them", async () => {
    const user = userEvent.setup();
    const { container } = render(Field, {
      props: { id: "alerts", label: "Price alerts", hint: "We'll email you when it drops", error: "Couldn't turn on price alerts" },
      slots: { default: () => h(Switch) },
    });

    const toggle = screen.getByRole("switch", { name: "Price alerts" });
    expect(toggle).toHaveAttribute("aria-invalid", "true");
    expect(toggle).toHaveAccessibleDescription("We'll email you when it drops Couldn't turn on price alerts");
    expect(parts(container.firstElementChild!)).toEqual(["label", "switch", "hint", "error"]);
    await user.click(screen.getByText("Price alerts"));
    expect(toggle).toBeChecked();
  });

  it("renders a Checkbox Group's hint and error after its fieldset, linked to it, with no label, and never makes it required", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(Field, {
      props: { id: "contact", label: "Contact", hint: "Pick at least one", error: "Choose how we can contact you", required: true },
      slots: { default: () => h(CheckboxGroup, { options, name: "contact" }, () => "How can we contact you?") },
    });

    const group = screen.getByRole("group", { name: "How can we contact you?" });
    expect(group).toHaveAttribute("id", "contact");
    expect(group).toHaveAttribute("aria-describedby", "contact-hint contact-error");
    expect(group).toHaveAccessibleDescription("Pick at least one Choose how we can contact you");
    expect(group).not.toHaveAttribute("required");
    for (const box of within(group).getAllByRole("checkbox")) {
      expect(box).not.toBeRequired();
      expect(box).toHaveAttribute("aria-invalid", "true");
    }
    expect(container.querySelector(".field > label")).toBeNull();
    expect(screen.queryByText("Contact")).toBeNull();
    expect(parts(container.firstElementChild!)).toEqual(["checkbox-group", "hint", "error"]);
    warn.mockRestore();
  });

  it("disables a Checkbox, a Switch and a Checkbox Group, so none of them can be focused", async () => {
    const user = userEvent.setup();
    render({
      render: () => [
        h(Field, { id: "terms", disabled: true }, () => h(Checkbox, () => "I agree to the terms")),
        h(Field, { id: "alerts", label: "Price alerts", disabled: true }, () => h(Switch)),
        h(Field, { id: "contact", disabled: true }, () => h(CheckboxGroup, { options, name: "contact" }, () => "How can we contact you?")),
      ],
    });

    expect(screen.getByRole("checkbox", { name: "I agree to the terms" })).toBeDisabled();
    expect(screen.getByRole("switch", { name: "Price alerts" })).toBeDisabled();
    expect(screen.getByRole("group", { name: "How can we contact you?" })).toBeDisabled();
    for (const box of within(screen.getByRole("group")).getAllByRole("checkbox")) expect(box).toBeDisabled();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("hands a Radio Group its hint, error, required and disabled, and renders nothing of its own", () => {
    const { container } = render(Field, {
      props: { hint: "Express arrives the next working day", error: "Choose a delivery option", required: true, disabled: true },
      slots: { default: () => h(RadioGroup, { name: "delivery", legend: "Delivery" }, radios) },
    });

    const group = screen.getByRole("radiogroup", { name: "Delivery" });
    expect(container.firstElementChild).toBe(group);
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Express arrives the next working day Choose a delivery option");
    // Rendered once each, by the Radio Group, in its own order.
    expect(screen.getAllByText("Express arrives the next working day")).toHaveLength(1);
    expect(screen.getAllByText("Choose a delivery option")).toHaveLength(1);
    for (const radio of within(group).getAllByRole("radio")) {
      expect(radio).toBeRequired();
      expect(radio).toBeDisabled();
    }
  });

  it("wins over a Radio Group's own hint and error", () => {
    render(Field, {
      props: { hint: "From the Field", error: "Also from the Field" },
      slots: { default: () => h(RadioGroup, { name: "delivery", legend: "Delivery", hint: "From the group", error: "Also from the group" }, radios) },
    });

    expect(screen.getByRole("radiogroup", { name: "Delivery" })).toHaveAccessibleDescription("From the Field Also from the Field");
    expect(screen.queryByText("From the group")).toBeNull();
    expect(screen.queryByText("Also from the group")).toBeNull();
  });

  it("mirrors its size as a data attribute, passes it to the control, and takes the control's without one", () => {
    const { container, unmount } = render(Field, {
      props: { id: "name", label: "Full name", size: "lg" },
      slots: { default: () => h(Input) },
    });
    expect(container.firstElementChild).toHaveAttribute("data-size", "lg");
    expect(container.querySelector(".input")).toHaveAttribute("data-size", "lg");
    unmount();

    const other = render(Field, { props: { id: "name", label: "Full name" }, slots: { default: () => h(Input, { size: "sm" }) } });
    expect(other.container.firstElementChild).toHaveAttribute("data-size", "sm");
  });

  it("renders the same markup on the server as on the client, with no generated IDs", async () => {
    const field = () =>
      h(Field, { id: "email", label: "Email address", hint: "We'll only use it for receipts", error: "Enter an email address" }, () =>
        h(Input, { type: "email" }),
      );
    const server = document.createElement("div");
    server.innerHTML = await renderToString(createSSRApp({ render: field }));
    const { container } = render({ render: field });

    expect(markup(server)).toEqual(markup(container));
    expect(server.textContent).toBe(container.textContent);
    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id);
    expect(ids).toEqual(["email-hint", "email", "email-error"]);
  });

  it("renders the same markup every time, and keeps the control across states", async () => {
    const options = {
      props: { id: "email", label: "Email address", hint: "We'll only use it for receipts" },
      slots: { default: () => h(Input, { type: "email" }) },
    };
    const first = render(Field, options).container.innerHTML;
    const { container, rerender } = render(Field, options);
    expect(container.innerHTML).toBe(first);

    const root = container.firstElementChild!;
    const input = root.querySelector("input");
    await rerender({ error: "Enter an email address", disabled: true });
    expect(container.firstElementChild).toBe(root);
    expect(root.querySelector("input")).toBe(input);
    expect(parts(root)).toEqual(["label", "hint", "input", "error"]);
  });

  it("warns in development when it has no id, a label a control doesn't take, a native checkbox, or more than one control", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const warns = (props: Record<string, unknown>, ...children: ReturnType<typeof h>[]) => {
      warn.mockClear();
      render(Field, { props, slots: { default: () => children } });
      return warn.mock.calls.filter(([message]) => String(message).startsWith("[Field]")).map(([message]) => String(message));
    };

    expect(warns({ label: "Full name" }, h(Input))).toEqual([expect.stringContaining("no id")]);
    expect(warns({ id: "terms", label: "Terms" }, h(Checkbox, () => "I agree"))).toEqual([expect.stringContaining("a Checkbox names itself")]);
    expect(warns({ id: "contact", label: "Contact" }, h(CheckboxGroup, { options }, () => "Contact"))).toEqual([
      expect.stringContaining("a Checkbox Group names itself"),
    ]);
    expect(warns({ label: "Delivery" }, h(RadioGroup, { name: "delivery", legend: "Delivery" }, radios))).toEqual([
      expect.stringContaining("a Radio Group names itself"),
    ]);
    expect(warns({ id: "terms" }, h("input", { type: "checkbox" }))).toEqual([expect.stringContaining("native checkbox or radio")]);
    expect(warns({ id: "name", label: "Name" }, h(Input), h(Input))).toEqual([expect.stringContaining("exactly one control")]);
    expect(warns({ id: "name", label: "Full name" }, h(Input))).toEqual([]);
    warn.mockRestore();
  });
});
```
:::
::

## Sources

- [HTML Standard: the id attribute](https://html.spec.whatwg.org/multipage/dom.html#the-id-attribute), [the label element](https://html.spec.whatwg.org/multipage/forms.html#the-label-element), [disabled form controls](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#enabling-and-disabling-form-controls:-the-disabled-attribute), [constructing the entry list](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-form-data-set), [the fieldset element](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element) and [the constraint validation API](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api), for unique IDs, linking labels, what the browser's checks and a form's data leave out of a disabled control, naming groups, `required`, `novalidate` and `validity`
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/), for [`aria-describedby`](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby) and [`aria-invalid`](https://www.w3.org/TR/wai-aria-1.2/#aria-invalid) with the roles it applies to, rather than [`aria-errormessage`](https://www.w3.org/TR/wai-aria-1.2/#aria-errormessage)
- [W3C Internationalization: How to use Unicode controls for bidi text](https://www.w3.org/International/questions/qa-bidi-unicode-controls), for isolating left-to-right text inside a plain string
- [Accessible Name and Description Computation 1.2](https://www.w3.org/TR/accname-1.2/), for how a description is joined from the elements `aria-describedby` points at, in order
- [HTML Accessibility API Mappings](https://www.w3.org/TR/html-aam-1.0/), for how a `<label>` names its control, a `<legend>` its `<fieldset>` and how `required` is announced
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), and its Understanding pages for [3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) and [4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/), for labels, where they go for checkboxes, instructions and validation
- [GOV.UK Design System: Error message](https://design-system.service.gov.uk/components/error-message/), [Error summary](https://design-system.service.gov.uk/components/error-summary/), [Question pages](https://design-system.service.gov.uk/patterns/question-pages/) and [Checkboxes](https://design-system.service.gov.uk/components/checkboxes/), for "(optional)" in the label, hints for groups and where the error goes, where we differ
- [Adrian Roselli: Exposing Field Errors](https://adrianroselli.com/2023/04/exposing-field-errors.html), for how screen readers read `aria-describedby`, `aria-errormessage` and live regions on a field
- [Material Design 3: Switch](https://m3.material.io/components/switch/guidelines), for a switch's label on the same row as the switch, and [Text fields](https://m3.material.io/components/text-fields/guidelines), for supporting text below a single control
- [React: useId](https://react.dev/reference/react/useId), for why a generated ID only matches between the server and the browser when both render the same tree
- [Base UI: Field](https://base-ui.com/react/components/field), for one component that puts a label, a description and an error around any control
