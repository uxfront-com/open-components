<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Combobox from "~/reference/combobox/Combobox.vue";
import Field from "~/reference/field/Field.vue";
import { nations } from "~/data/select-options";

/** `::combobox-form-example`: a form that submits a Combobox under its name, and resets it. */
const sent = ref<string>();

function send(event: Event) {
  sent.value = new FormData(event.target as HTMLFormElement).getAll("form-country").join(", ") || "Nothing";
}
</script>

<template>
  <ComboboxExample>
    <form class="flex w-full max-w-xs flex-col gap-3" @submit.prevent="send" @reset="sent = undefined">
      <Field id="form-country" label="Country" required>
        <Combobox name="form-country" :options="nations" value="fr" />
      </Field>
      <div class="flex gap-2">
        <Button type="submit" color="primary">Send</Button>
        <Button type="reset" variant="outline">Reset</Button>
      </div>
      <p class="text-sm" role="status">{{ sent ? `Sent: ${sent}` : "" }}</p>
    </form>
    <template v-if="$slots.default" #code><slot /></template>
  </ComboboxExample>
</template>
