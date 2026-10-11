<script setup lang="ts">
import Checkbox from "~/reference/checkbox/Checkbox.vue";

/** `::checkbox-controlled-example`: a checkbox bound to state, beside one that keeps its own. */
const updates = ref(true);
</script>

<template>
  <CheckboxExample>
    <div class="flex w-full max-w-sm flex-col gap-3">
      <div class="flex flex-col gap-1">
        <Checkbox v-model:checked="updates">Email me updates</Checkbox>
        <p class="text-muted ps-6.5 text-sm">You'll {{ updates ? "get" : "miss" }} our updates</p>
      </div>
      <Checkbox name="remember">Remember me</Checkbox>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxExample>
</template>
