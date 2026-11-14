<script setup lang="ts">
import { useTemplateRef } from "vue";
import type { Section, SelectOption } from "./listbox";

// The panel the Select and the Combobox both open: a listbox of options, groups and
// separators, with the check mark beside each picked option and the highlight on the
// active one. The component that opens it keeps focus and the keyboard model, and this
// draws what they decide, so the two components can't look or read differently.

const {
  sections,
  active,
  popover = "auto",
} = defineProps<{
  id?: string;
  sections: Section[];
  /** The highlighted option, which `aria-activedescendant` on the control points at. */
  active?: SelectOption;
  isPicked: (option: SelectOption) => boolean;
  optionId: (option: SelectOption) => string | undefined;
  groupId: (section: number) => string | undefined;
  multiple?: boolean;
  /** The control's name, given by the label that names it, or its own `aria-label`. */
  label?: string;
  labelledby?: string;
  anchorName?: string;
  /**
   * `auto` lets the browser close the panel on a press outside it. A text field takes
   * `manual`, since a press in its text, outside the panel, mustn't close it.
   */
  popover?: "auto" | "manual";
  /** A last option that adds what people typed, which the Combobox's `creatable` turns on. */
  create?: SelectOption & { id?: string; active?: boolean };
  /** Shown while no option matches what people typed. It isn't an option, so it's hidden from assistive technologies, which hear it as a status message instead. */
  empty?: string;
}>();

const emit = defineEmits<{
  pick: [option: SelectOption];
  create: [];
  beforetoggle: [event: Event];
}>();

defineSlots<{
  option?: (props: { option: SelectOption; selected: boolean; active: boolean }) => unknown;
  "group-label"?: (props: { label: string }) => unknown;
  separator?: () => unknown;
  icon?: (props: { option: SelectOption }) => unknown;
}>();

const element = useTemplateRef<HTMLElement>("element");
defineExpose({ element });

const hasOptions = () => sections.some((section) => section.options.length);
</script>

<template>
  <!-- A child of the root, so a class on the root reaches its tokens. A popover puts it in
       the top layer. A press on it doesn't move focus, which stays on the control for the
       keyboard model to run. -->
  <div
    :id="id"
    ref="element"
    data-slot="panel"
    :popover="popover"
    role="listbox"
    :aria-multiselectable="multiple ? 'true' : undefined"
    :aria-labelledby="labelledby"
    :aria-label="labelledby ? undefined : label"
    :style="anchorName && { 'position-anchor': anchorName }"
    @beforetoggle="emit('beforetoggle', $event)"
    @mousedown.prevent
  >
    <template v-for="(section, s) in sections" :key="s">
      <!-- role="none", since a listbox doesn't allow a separator child. -->
      <div v-if="section.separator" role="none" data-slot="separator">
        <slot name="separator" />
      </div>
      <div
        v-else
        :role="section.label === undefined ? 'none' : 'group'"
        :data-slot="section.label === undefined ? undefined : 'group'"
        :aria-labelledby="section.label === undefined ? undefined : groupId(s)"
      >
        <div v-if="section.label !== undefined" :id="groupId(s)" role="presentation" data-slot="group-label">
          <slot name="group-label" :label="section.label">{{ section.label }}</slot>
        </div>
        <div
          v-for="option in section.options"
          :id="optionId(option)"
          :key="option.value"
          data-slot="option"
          role="option"
          :aria-selected="isPicked(option) ? 'true' : 'false'"
          :aria-disabled="option.disabled ? 'true' : undefined"
          :data-active="active === option ? 'true' : undefined"
          @click="emit('pick', option)"
        >
          <span v-if="$slots.icon" data-slot="icon" aria-hidden="true"><slot name="icon" :option="option" /></span>
          <span data-slot="option-label">
            <slot name="option" :option="option" :selected="isPicked(option)" :active="active === option">{{ option.label }}</slot>
          </span>
          <svg data-slot="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
      </div>
    </template>
    <!-- After every match, so the arrow keys reach it last, and an option like the others,
         so a screen reader reads it as one. -->
    <div
      v-if="create"
      :id="create.id"
      data-slot="option"
      data-create=""
      role="option"
      aria-selected="false"
      :data-active="create.active ? 'true' : undefined"
      @click="emit('create')"
    >
      <span data-slot="option-label">{{ create.label }}</span>
    </div>
    <div v-else-if="empty !== undefined && !hasOptions()" data-slot="empty" aria-hidden="true">{{ empty }}</div>
  </div>
</template>
