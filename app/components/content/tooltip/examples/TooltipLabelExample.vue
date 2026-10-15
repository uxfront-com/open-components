<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Tooltip from "~/reference/tooltip/Tooltip.vue";

/** `::tooltip-label-example`: icon-only formatting buttons, whose tooltips show their hidden labels. */
const actions = [
  { label: "Bold", icon: "i-lucide-bold" },
  { label: "Italic", icon: "i-lucide-italic" },
  { label: "Underline", icon: "i-lucide-underline" },
  { label: "Strikethrough", icon: "i-lucide-strikethrough" },
];
</script>

<template>
  <TooltipExample>
    <div class="flex gap-1">
      <Tooltip v-for="action in actions" :key="action.label" :label="action.label" type="label" v-slot="{ trigger }">
        <Button v-bind="trigger" :label="action.label" variant="ghost" icon-only>
          <template #leading><UIcon :name="action.icon" mode="svg" /></template>
        </Button>
      </Tooltip>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TooltipExample>
</template>
