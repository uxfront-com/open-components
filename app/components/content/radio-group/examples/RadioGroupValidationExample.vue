<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Radio from "~/reference/radio-group/Radio.vue";
import RadioGroup from "~/reference/radio-group/RadioGroup.vue";

/** `::radio-group-validation-example`: a required group that's checked when people submit. */
const delivery = ref<string>();
const error = ref("");
const status = ref("");
const first = useTemplateRef("first-radio");

function update(value?: string) {
  delivery.value = value;
  // An answer fixes the error, so it clears as soon as there is one.
  error.value = "";
}

async function order() {
  if (!delivery.value) {
    error.value = "Choose how you'd like your order delivered";
    status.value = "Couldn't place your order. Check the delivery options.";
    // Focus once the error is in the page, so screen readers read it with the group.
    await nextTick();
    first.value?.input?.focus();
    return;
  }
  status.value = "Order placed";
}
</script>

<template>
  <RadioGroupExample>
    <form class="flex w-full max-w-sm flex-col gap-3" novalidate @submit.prevent="order">
      <RadioGroup
        name="validation-delivery"
        legend="How would you like it delivered?"
        required
        :error="error"
        :model-value="delivery"
        @update:model-value="update"
      >
        <Radio ref="first-radio" value="standard">Standard</Radio>
        <Radio value="express">Express</Radio>
      </RadioGroup>
      <div class="flex flex-wrap items-center gap-3">
        <Button type="submit" color="primary">Place order</Button>
        <!-- Always in the page, so screen readers announce what it says. -->
        <p role="status" class="text-muted text-sm">{{ status }}</p>
      </div>
    </form>
    <template v-if="$slots.default" #code><slot /></template>
  </RadioGroupExample>
</template>
