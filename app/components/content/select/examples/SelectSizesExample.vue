<script setup lang="ts">
import Select from "~/reference/select/Select.vue";
import { countries } from "~/data/select-options";

/** `::select-sizes-example`: the Input's five sizes, each with the same height as an Input. */
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <SelectExample>
    <div class="flex w-full max-w-xs flex-col gap-3">
      <Select
        v-for="size in sizes"
        :id="`size-${size}`"
        :key="size"
        :name="`size-${size}`"
        :aria-label="`Country, size ${size}`"
        :size="size"
        :options="countries"
        value="fr"
        :native-on-touch="false"
      />
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>
