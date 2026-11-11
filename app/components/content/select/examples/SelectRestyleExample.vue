<script setup lang="ts">
import Field from "~/reference/field/Field.vue";
import Select from "~/reference/select/Select.vue";
import { countries, destinations } from "~/data/select-options";

/**
 * `::select-restyle-example{part="tag"}`: one of the seven parts the UI page restyles, with a
 * class that sets its variables, and with its slot where it has one. No inline styles.
 */
const { part } = defineProps<{ part: "trigger" | "panel" | "option" | "tag" | "arrow" | "group-label" | "separator" }>();

const grouped = computed(() => part === "group-label" || part === "separator");
const several = computed(() => part === "tag");
const value = ref<string | string[]>(several.value ? ["fr", "es"] : "fr");
</script>

<template>
  <SelectExample>
    <div class="w-full max-w-xs">
      <Field :id="`restyle-${part}`" :label="`Restyled ${part}`">
        <Select
          v-model="value"
          :name="`restyle-${part}`"
          :class="`restyle-${part}`"
          :multiple="several"
          :options="grouped ? destinations : countries"
          :native-on-touch="false"
        >
          <template v-if="part === 'trigger'" #leading>
            <UIcon name="i-lucide-globe" mode="svg" />
          </template>
          <template v-if="part === 'trigger'" #value="{ selected }">Ship to {{ selected[0]?.label }}</template>
          <template v-if="part === 'option'" #option="{ option, selected }">
            {{ option.label }}<span v-if="selected"> (yours)</span>
          </template>
          <template v-if="part === 'tag'" #tag="{ option }">{{ option.value.toUpperCase() }}</template>
          <template v-if="part === 'arrow'" #arrow><UIcon name="i-lucide-chevrons-up-down" mode="svg" /></template>
          <template v-if="part === 'group-label'" #group-label="{ label }">{{ label }} shipping</template>
          <template v-if="part === 'separator'" #separator><span class="restyle-rule" /></template>
        </Select>
      </Field>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>

<style>
/* Each sets the variables of its one part, from outside the component's layer. */
.restyle-trigger {
  --select--radius: 1.25rem;
  --select--border-color: var(--color--primary);
  --select--background: color-mix(in srgb, var(--color--primary) 8%, transparent);
}
.restyle-panel {
  --select--panel--radius: 1rem;
  --select--panel--padding: 0.5rem;
  --select--panel--border-color: var(--color--primary);
}
.restyle-option {
  --select--option--radius: 1rem;
  --select--option--hover--background: color-mix(in srgb, var(--color--primary) 15%, transparent);
  --select--option--selected--background: color-mix(in srgb, var(--color--primary) 15%, transparent);
}
.restyle-tag {
  --select--tag--radius: 1rem;
  --select--tag--background: var(--color--primary);
  --select--tag--color: var(--color--primary-contrast);
}
.restyle-arrow {
  --select--arrow--color: var(--color--primary-text);
  --select--arrow--size: 1.25rem;
}
.restyle-group-label {
  --select--group-label--color: var(--color--primary-text);
  --select--group-label--font-weight: 700;
}
.restyle-separator {
  --select--separator--color: var(--color--primary);
  --select--separator--margin: 0.5rem;
}
.restyle-rule {
  display: block;
  height: 1px;
}
</style>
