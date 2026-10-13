<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Tooltip from "~/reference/tooltip/Tooltip.vue";
import type { TooltipProps } from "~/reference/tooltip/Tooltip.vue";

/** `::tooltip-placement-example`: a tooltip with an arrow on each side of its trigger. */
const placements = [
  { placement: "top", name: "Top", label: "Opens above the button" },
  { placement: "bottom", name: "Bottom", label: "Opens below the button" },
  { placement: "start", name: "Start", label: "Opens before the button" },
  { placement: "end", name: "End", label: "Opens after the button" },
] as const satisfies { placement: TooltipProps["placement"]; name: string; label: string }[];
</script>

<template>
  <TooltipExample>
    <div class="flex flex-wrap justify-center gap-3 py-8">
      <Tooltip
        v-for="{ placement, name, label } in placements"
        :key="placement"
        :label="label"
        :placement="placement"
        arrow
        v-slot="{ trigger }"
      >
        <Button v-bind="trigger" variant="outline">{{ name }}</Button>
      </Tooltip>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TooltipExample>
</template>
