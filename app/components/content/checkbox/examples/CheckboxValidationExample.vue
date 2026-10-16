<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Checkbox from "~/reference/checkbox/Checkbox.vue";

/** `::checkbox-validation-example`: a box people have to check, which says why when they don't. */
const agreed = ref(false);
const error = ref("");
const status = ref("");
const terms = useTemplateRef("terms");

function update(value: boolean) {
  agreed.value = value;
  // Checking the box fixes the error, so it clears right away.
  if (value) error.value = "";
}

async function createAccount() {
  if (!agreed.value) {
    error.value = "Agree to the terms to create an account";
    status.value = "Couldn't create your account. Check the terms.";
    // Focus once the error is in the page, so screen readers read it with the checkbox.
    await nextTick();
    terms.value?.input?.focus();
    return;
  }
  status.value = "Your account is ready";
}
</script>

<template>
  <CheckboxExample>
    <form class="flex w-full max-w-sm flex-col gap-1" novalidate @submit.prevent="createAccount">
      <Checkbox
        ref="terms"
        name="terms"
        required
        :checked="agreed"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? 'validation-terms-error' : undefined"
        @update:checked="update"
      >
        I agree to the terms
      </Checkbox>
      <p v-if="error" id="validation-terms-error" class="ps-6.5 text-sm text-(--color--error-text)">{{ error }}</p>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <Button type="submit" color="primary">Create account</Button>
        <!-- Always in the page, so screen readers announce what it says. -->
        <p role="status" class="text-muted text-sm">{{ status }}</p>
      </div>
    </form>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxExample>
</template>
