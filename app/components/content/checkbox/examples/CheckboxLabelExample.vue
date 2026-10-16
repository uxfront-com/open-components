<script setup lang="ts">
import Checkbox from "~/reference/checkbox/Checkbox.vue";

/** `::checkbox-label-example`: a checkbox named by the label it wraps, and described by its hint. */
</script>

<template>
  <CheckboxExample>
    <div class="flex w-full max-w-sm flex-col gap-1">
      <Checkbox name="updates" aria-describedby="label-updates-hint">Email me product updates</Checkbox>
      <p id="label-updates-hint" class="text-muted ps-6.5 text-sm">About once a month. You can stop them at any time.</p>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxExample>
</template>
