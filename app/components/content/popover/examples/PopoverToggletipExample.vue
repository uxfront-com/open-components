<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Popover from "~/reference/popover/Popover.vue";

/** `::popover-toggletip-example`: a toggletip, an icon-only Button that shows a hint with a link when it's pressed. */
</script>

<template>
  <PopoverExample>
    <div class="flex items-center gap-1 text-sm">
      <span>Billing cycle</span>
      <Button popovertarget="billing-cycle" aria-haspopup="dialog" label="About billing cycles" variant="ghost" size="sm" icon-only>
        <template #leading><UIcon name="i-lucide-info" mode="svg" /></template>
      </Button>
      <Popover id="billing-cycle" title="Billing cycles">
        <p>
          You're billed on the day you signed up, every month.
          <a href="/docs/components/popover/ui#toggletips" class="underline">How billing works</a>
        </p>
      </Popover>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </PopoverExample>
</template>
