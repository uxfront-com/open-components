<script setup lang="ts">
import Radio from "~/reference/radio-group/Radio.vue";
import RadioGroup from "~/reference/radio-group/RadioGroup.vue";

/** `::radio-group-orientation-example`: two short options, side by side. */
</script>

<template>
  <RadioGroupExample>
    <div class="flex w-full max-w-sm flex-col">
      <RadioGroup
        name="orientation-contact"
        legend="Can we call you about your order?"
        hint="We only call if something's wrong with it"
        orientation="horizontal"
      >
        <Radio value="yes">Yes</Radio>
        <Radio value="no">No</Radio>
      </RadioGroup>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </RadioGroupExample>
</template>
