<script setup lang="ts">
import Input from "~/reference/input/Input.vue";

/** `::input-slots-example`: a leading icon, and a prefix and a suffix that the label repeats. */
</script>

<template>
  <InputExample>
    <div class="grid w-full max-w-md gap-5">
      <Input type="search" aria-label="Search">
        <template #leading><UIcon name="i-lucide-search" mode="svg" /></template>
      </Input>
      <div class="flex flex-col gap-1.5">
        <label for="slots-price" class="text-sm font-medium">Price, in US dollars</label>
        <Input id="slots-price" inputmode="decimal" value="1,250.00">
          <template #leading>$</template>
          <template #trailing>USD</template>
        </Input>
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </InputExample>
</template>
