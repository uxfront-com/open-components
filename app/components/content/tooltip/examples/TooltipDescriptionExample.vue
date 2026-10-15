<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Tooltip from "~/reference/tooltip/Tooltip.vue";

/** `::tooltip-description-example`: a Button with a name of its own, which its tooltip adds a hint to. */
</script>

<template>
  <TooltipExample>
    <Tooltip label="Archived projects stay in search" v-slot="{ trigger }">
      <Button v-bind="trigger" variant="outline">
        <template #leading><UIcon name="i-lucide-archive" mode="svg" /></template>
        Archive
      </Button>
    </Tooltip>
    <template v-if="$slots.default" #code><slot /></template>
  </TooltipExample>
</template>
