<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Tooltip from "~/reference/tooltip/Tooltip.vue";

/** `::tooltip-disabled-example`: a disabled Button that keeps its focus, so its tooltip can say why. */
</script>

<template>
  <TooltipExample>
    <div class="flex flex-col items-center gap-2">
      <Tooltip label="Add a title to publish" v-slot="{ trigger }">
        <Button v-bind="trigger" color="primary" disabled focusable-when-disabled>Publish</Button>
      </Tooltip>
      <!-- The same reason on the page, for people who can't open the tooltip, like on a touch screen. -->
      <p class="text-muted text-sm">A title is required</p>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TooltipExample>
</template>
