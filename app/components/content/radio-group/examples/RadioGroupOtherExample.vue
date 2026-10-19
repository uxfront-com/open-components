<script setup lang="ts">
import Input from "~/reference/input/Input.vue";
import Radio from "~/reference/radio-group/Radio.vue";
import RadioGroup from "~/reference/radio-group/RadioGroup.vue";

/** `::radio-group-other-example`: an Other option, lined up with the Input that says what it is. */
const source = ref<string>();
</script>

<template>
  <RadioGroupExample>
    <div class="flex w-full max-w-sm flex-col">
      <RadioGroup v-model="source" name="other-source" legend="How did you hear about us?">
        <Radio value="friend">From a friend</Radio>
        <Radio value="search">From a search engine</Radio>
        <div class="flex w-full items-center gap-3">
          <Radio value="other">Other</Radio>
          <Input aria-label="Other, how you heard about us" name="other-source-detail" class="flex-1" @update:model-value="source = 'other'" />
        </div>
      </RadioGroup>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </RadioGroupExample>
</template>
