<script setup lang="ts">
import Switch from "~/reference/switch/Switch.vue";

/** `::switch-languages-example`: right-to-left settings, where on is on the left. */
</script>

<template>
  <SwitchExample>
    <div dir="rtl" lang="ar" class="flex w-full max-w-xs flex-col gap-3">
      <div class="flex items-center justify-between gap-4">
        <label for="languages-wifi" class="text-sm font-medium">واي فاي</label>
        <Switch id="languages-wifi" checked />
      </div>
      <div class="flex items-center justify-between gap-4">
        <label for="languages-bluetooth" class="text-sm font-medium">بلوتوث</label>
        <Switch id="languages-bluetooth" />
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SwitchExample>
</template>
