<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Popover from "~/reference/popover/Popover.vue";
import type { PopoverProps } from "~/reference/popover/Popover.vue";

/** `::popover-placement-example`: a popover on each side of its trigger. */
const placements = [
  { placement: "top", name: "Top", text: "It opens above the button." },
  { placement: "bottom", name: "Bottom", text: "It opens below the button." },
  { placement: "start", name: "Start", text: "It opens before the button." },
  { placement: "end", name: "End", text: "It opens after the button." },
] as const satisfies { placement: PopoverProps["placement"]; name: string; text: string }[];
</script>

<template>
  <PopoverExample>
    <div class="flex flex-wrap justify-center gap-3 py-8">
      <template v-for="{ placement, name, text } in placements" :key="placement">
        <Button :popovertarget="`placement-${placement}`" aria-haspopup="dialog" variant="outline">{{ name }}</Button>
        <Popover :id="`placement-${placement}`" :title="name" :placement="placement">
          <p>{{ text }}</p>
        </Popover>
      </template>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </PopoverExample>
</template>
