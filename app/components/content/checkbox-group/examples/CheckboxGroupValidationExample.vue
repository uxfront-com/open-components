<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import CheckboxGroup from "~/reference/checkbox-group/CheckboxGroup.vue";

/** `::checkbox-group-validation-example`: a group people have to pick at least one option from, which says so when they don't. */
const emails = [
  { value: "news", label: "Product news" },
  { value: "tips", label: "Tips and guides" },
  { value: "events", label: "Events near you" },
];
const picked = ref<string[]>([]);
const error = ref("");
const status = ref("");
const group = useTemplateRef("group");

function update(value: string[]) {
  picked.value = value;
  // Picking one fixes the error, so it clears right away.
  if (value.length) error.value = "";
}

async function signUp() {
  if (!picked.value.length) {
    error.value = "Pick at least one email to sign up for";
    status.value = "Couldn't sign you up. Pick at least one email.";
    // Focus the first box once the error is in the page, so screen readers read it with the group.
    await nextTick();
    group.value?.fieldset?.querySelector("input")?.focus();
    return;
  }
  status.value = "You're signed up";
}
</script>

<template>
  <CheckboxGroupExample>
    <form class="flex w-full max-w-sm flex-col gap-1" novalidate @submit.prevent="signUp">
      <CheckboxGroup
        ref="group"
        name="emails"
        :options="emails"
        :value="picked"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? 'validation-emails-hint validation-emails-error' : 'validation-emails-hint'"
        @update:value="update"
      >
        Which emails would you like?
      </CheckboxGroup>
      <p id="validation-emails-hint" class="text-muted text-sm">Pick at least one.</p>
      <p v-if="error" id="validation-emails-error" class="text-sm text-(--color--error-text)">{{ error }}</p>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <Button type="submit" color="primary">Sign up</Button>
        <!-- Always in the page, so screen readers announce what it says. -->
        <p role="status" class="text-muted text-sm">{{ status }}</p>
      </div>
    </form>
    <template v-if="$slots.default" #code><slot /></template>
  </CheckboxGroupExample>
</template>
