<script setup lang="ts">
import Radio from "~/reference/radio-group/Radio.vue";
import RadioGroup from "~/reference/radio-group/RadioGroup.vue";

/** `::radio-group-states-example`: each state, captioned. */
</script>

<template>
  <RadioGroupExample>
    <div class="grid w-full max-w-xl gap-x-6 gap-y-5 sm:grid-cols-2">
      <figure class="flex flex-col gap-1.5">
        <RadioGroup name="states-delivery" legend="Delivery" model-value="standard">
          <Radio value="standard">Standard</Radio>
          <Radio value="express">Express</Radio>
        </RadioGroup>
        <figcaption class="text-muted text-xs">At rest, with one checked (try hovering, clicking or tabbing to it)</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <RadioGroup name="states-pickup" legend="Delivery" model-value="standard">
          <Radio value="standard">Standard</Radio>
          <Radio value="pickup" disabled>Collect from a store</Radio>
        </RadioGroup>
        <figcaption class="text-muted text-xs">One radio disabled</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <RadioGroup name="states-plan" legend="Plan" model-value="team" disabled>
          <Radio value="personal">Personal</Radio>
          <Radio value="team">Team</Radio>
        </RadioGroup>
        <figcaption class="text-muted text-xs">Group disabled</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <RadioGroup name="states-contact" legend="How should we contact you?" error="Choose how we should contact you">
          <Radio value="email">Email</Radio>
          <Radio value="phone">Phone</Radio>
        </RadioGroup>
        <figcaption class="text-muted text-xs">Invalid</figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </RadioGroupExample>
</template>
