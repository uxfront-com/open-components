<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Field from "~/reference/field/Field.vue";
import Select from "~/reference/select/Select.vue";
import { countries } from "~/data/select-options";

/** `::select-form-example`: a form that submits one Select under its name, and resets it. */
const sent = ref<string>();

function send(event: Event) {
  sent.value = new FormData(event.target as HTMLFormElement).getAll("form-countries").join(", ") || "Nothing";
}
</script>

<template>
  <SelectExample>
    <form class="flex w-full max-w-xs flex-col gap-3" @submit.prevent="send" @reset="sent = undefined">
      <Field id="form-countries" label="Countries" required>
        <Select name="form-countries" multiple :options="countries" :value="['fr']" :native-on-touch="false" />
      </Field>
      <div class="flex gap-2">
        <Button type="submit" color="primary">Send</Button>
        <Button type="reset" variant="outline">Reset</Button>
      </div>
      <p class="text-sm" role="status">{{ sent ? `Sent: ${sent}` : "" }}</p>
    </form>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>
