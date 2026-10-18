<script setup lang="ts">
import Textarea from "~/reference/textarea/Textarea.vue";

/** `::textarea-states-example`: each state, labelled and captioned. */
</script>

<template>
  <TextareaExample>
    <div class="grid w-full max-w-xl gap-x-6 gap-y-5 sm:grid-cols-2">
      <figure class="flex flex-col gap-1.5">
        <label for="states-message" class="text-sm font-medium">Message</label>
        <Textarea id="states-message" :rows="2" value="Could we move our call to Friday?" />
        <figcaption class="text-muted text-xs">At rest (try hovering, clicking or tabbing to it)</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <label for="states-notes" class="text-sm font-medium">Notes</label>
        <Textarea id="states-notes" :rows="2" value="Call back after 3pm" disabled />
        <figcaption class="text-muted text-xs">Disabled</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <label for="states-terms" class="text-sm font-medium">Terms</label>
        <Textarea id="states-terms" :rows="2" value="Payment is due within 30 days." readonly />
        <figcaption class="text-muted text-xs">Read-only</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <label for="states-reason" class="text-sm font-medium">Reason for return</label>
        <Textarea id="states-reason" :rows="2" aria-invalid="true" aria-describedby="states-reason-error" />
        <p id="states-reason-error" class="text-sm text-(--color--error-text)">Enter a reason for returning the item</p>
        <figcaption class="text-muted text-xs">Invalid</figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TextareaExample>
</template>
