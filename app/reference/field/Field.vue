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
 * - `text`: an Input, a Textarea, or a native <input>, <textarea> or <select>. The label
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
    /** One control: an Input, a Textarea, a Checkbox, a Switch, a Checkbox Group, a Radio Group, or a native text control. */
    default?: () => VNode[];
  }>,
  setup(props, { slots }) {
    onMounted(() => {
      if (!import.meta.env.DEV) return;
      const found = controls(slots.default?.());
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
      const control = controls(slots.default?.())[0];
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
     disabled while the control isn't. */
  .field:has(:disabled) > [data-slot="label"] {
    opacity: 0.5;
  }

  @media (forced-colors: active) {
    .field:has(:disabled) > [data-slot="label"] {
      color: GrayText;
      opacity: 1;
    }
  }
}
</style>
