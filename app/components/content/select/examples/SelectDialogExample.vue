<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Dialog from "~/reference/dialog/Dialog.vue";
import Field from "~/reference/field/Field.vue";
import Select from "~/reference/select/Select.vue";
import { countries } from "~/data/select-options";

/** `::select-dialog-example`: a Select in a Dialog, where `Escape` closes only the panel. */
const open = ref(false);
</script>

<template>
  <SelectExample>
    <Button variant="outline" @click="open = true">Edit address</Button>
    <Dialog id="select-dialog" :open="open" title="Edit address" @close="open = false">
      <Field id="dialog-country" label="Country">
        <Select name="dialog-country" :options="countries" value="fr" :native-on-touch="false" />
      </Field>
    </Dialog>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>
