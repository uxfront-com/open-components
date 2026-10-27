<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Checkbox from "~/reference/checkbox/Checkbox.vue";
import Popover from "~/reference/popover/Popover.vue";

/** `::popover-filters-example`: the Button page's Filters button, which opens a Popover with `popovertarget`. */
</script>

<template>
  <PopoverExample>
    <Button popovertarget="filters" aria-haspopup="dialog" variant="outline">Filters</Button>
    <Popover id="filters" title="Filters">
      <div class="flex flex-col gap-2">
        <Checkbox checked>Open issues only</Checkbox>
        <Checkbox>Assigned to me</Checkbox>
        <Checkbox>Has a pull request</Checkbox>
      </div>
    </Popover>
    <template v-if="$slots.default" #code><slot /></template>
  </PopoverExample>
</template>
