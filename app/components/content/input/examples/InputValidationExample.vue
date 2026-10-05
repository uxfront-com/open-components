<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Input from "~/reference/input/Input.vue";

/** `::input-validation-example`: an email input that's checked when people leave it or submit. */
const email = ref("");
const error = ref("");
const status = ref("");
const emailInput = useTemplateRef("email-input");

// Returns an error message, or an empty string when the address looks right.
function validateEmail(value: string) {
  if (!value) return "Enter your email address";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Enter an email address in the correct format, like name@example.com";
  }
  return "";
}

// Only checks what people have typed, so tabbing past the input doesn't flag it.
function leave() {
  if (email.value) error.value = validateEmail(email.value);
}

function update(value = "") {
  email.value = value;
  // Once an error shows, check again as people type, so it clears as soon as it's fixed.
  if (error.value) error.value = validateEmail(value);
}

async function subscribe() {
  error.value = validateEmail(email.value);
  if (error.value) {
    status.value = "Couldn't subscribe. Check your email address.";
    // Focus once the error is in the page, so screen readers read it with the input.
    await nextTick();
    emailInput.value?.input?.focus();
    return;
  }
  status.value = "You're subscribed";
}
</script>

<template>
  <InputExample>
    <form class="flex w-full max-w-sm flex-col gap-1.5" novalidate @submit.prevent="subscribe">
      <label for="validation-email" class="text-sm font-medium">Email address</label>
      <Input
        id="validation-email"
        ref="email-input"
        type="email"
        autocomplete="email"
        required
        :model-value="email"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? 'validation-email-error' : undefined"
        @update:model-value="update"
        @blur="leave"
      />
      <p v-if="error" id="validation-email-error" class="text-sm text-(--color--error-text)">{{ error }}</p>
      <div class="mt-2 flex flex-wrap items-center gap-3">
        <Button type="submit" color="primary">Subscribe</Button>
        <!-- Always in the page, so screen readers announce what it says. -->
        <p role="status" class="text-muted text-sm">{{ status }}</p>
      </div>
    </form>
    <template v-if="$slots.default" #code><slot /></template>
  </InputExample>
</template>
