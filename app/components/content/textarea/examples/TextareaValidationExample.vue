<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Textarea from "~/reference/textarea/Textarea.vue";

/** `::textarea-validation-example`: a message that's checked when people submit, with Enter for new lines. */
const LIMIT = 200;
const message = ref("");
const error = ref("");
const status = ref("");
const messageTextarea = useTemplateRef("message-textarea");

// Returns an error message, or an empty string when the message is fine.
function validateMessage(value: string) {
  if (!value.trim()) return "Enter a message";
  if ([...value].length > LIMIT) return `Message must be ${LIMIT} characters or fewer`;
  return "";
}

function update(value = "") {
  message.value = value;
  // Once an error shows, check again as people type, so it clears as soon as it's fixed.
  if (error.value) error.value = validateMessage(value);
}

async function send() {
  error.value = validateMessage(message.value);
  if (error.value) {
    status.value = "Couldn't send your message. Check what you've written.";
    // Focus once the error is in the page, so screen readers read it with the textarea.
    await nextTick();
    messageTextarea.value?.textarea?.focus();
    return;
  }
  status.value = "Message sent";
}
</script>

<template>
  <TextareaExample>
    <form class="flex w-full max-w-md flex-col gap-1.5" novalidate @submit.prevent="send">
      <label for="validation-message" class="text-sm font-medium">Message</label>
      <p id="validation-message-hint" class="text-muted text-sm">You can enter up to {{ LIMIT }} characters</p>
      <Textarea
        id="validation-message"
        ref="message-textarea"
        :limit="LIMIT"
        required
        :model-value="message"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? 'validation-message-error validation-message-hint' : 'validation-message-hint'"
        @update:model-value="update"
      />
      <p v-if="error" id="validation-message-error" class="text-sm text-(--color--error-text)">{{ error }}</p>
      <div class="mt-2 flex flex-wrap items-center gap-3">
        <Button type="submit" color="primary">Send</Button>
        <!-- Always in the page, so screen readers announce what it says. -->
        <p role="status" class="text-muted text-sm">{{ status }}</p>
      </div>
    </form>
    <template v-if="$slots.default" #code><slot /></template>
  </TextareaExample>
</template>
