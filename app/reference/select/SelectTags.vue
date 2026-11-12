<script setup lang="ts">
import { nextTick, useTemplateRef } from "vue";
import type { SelectOption } from "./listbox";

// The picked values of a Select or a Combobox with `multiple`, each a tag with a button
// that removes it. Beside the control, since a <button> can't hold other buttons, and
// after it, so Tab reaches the remove buttons after the control.

const { selected, removable = true } = defineProps<{
  selected: SelectOption[];
  /** Off while the control is disabled or read-only, which leaves the tags without their buttons. */
  removable?: boolean;
  removeLabel: (label: string) => string;
}>();

const emit = defineEmits<{ remove: [option: SelectOption] }>();

defineSlots<{
  tag?: (props: { option: SelectOption }) => unknown;
  icon?: (props: { option: SelectOption }) => unknown;
}>();

const element = useTemplateRef<HTMLElement>("element");

/**
 * Once a tag is removed, the remove button now in its place takes focus, so keyboard users
 * never fall back to the top of the page. It's false when there's none, so the caller can
 * focus its control instead.
 */
async function focusAt(index: number) {
  await nextTick();
  const next = element.value?.querySelectorAll<HTMLElement>('[data-slot="tag-remove"]')[index];
  next?.focus();
  return !!next;
}

defineExpose({ focusAt });
</script>

<template>
  <div v-if="selected.length" ref="element" data-slot="tags">
    <span v-for="option in selected" :key="option.value" data-slot="tag">
      <span v-if="$slots.icon" data-slot="icon" aria-hidden="true"><slot name="icon" :option="option" /></span>
      <span data-slot="tag-label"><slot name="tag" :option="option">{{ option.label }}</slot></span>
      <button v-if="removable" data-slot="tag-remove" type="button" :aria-label="removeLabel(option.label)" @click="emit('remove', option)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  </div>
</template>
