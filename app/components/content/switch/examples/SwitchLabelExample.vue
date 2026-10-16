<script setup lang="ts">
import Switch from "~/reference/switch/Switch.vue";

/** `::switch-label-example`: a switch named by its label, and described by its hint. */
</script>

<template>
  <SwitchExample>
    <div class="flex w-full max-w-sm items-start justify-between gap-4">
      <div class="flex flex-col gap-0.5">
        <label for="label-replies" class="text-sm font-medium">Email me about replies</label>
        <p id="label-replies-hint" class="text-muted text-sm">At most one email a day</p>
      </div>
      <Switch id="label-replies" aria-describedby="label-replies-hint" />
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SwitchExample>
</template>
