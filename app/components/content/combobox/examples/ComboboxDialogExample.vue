<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Combobox from "~/reference/combobox/Combobox.vue";
import Dialog from "~/reference/dialog/Dialog.vue";
import Field from "~/reference/field/Field.vue";
import { nations } from "~/data/select-options";

/** `::combobox-dialog-example`: a Combobox in a Dialog, where `Escape` closes the panel, then clears the text, before it closes the Dialog. */
const open = ref(false);
</script>

<template>
  <ComboboxExample>
    <Button variant="outline" @click="open = true">Edit address</Button>
    <Dialog id="combobox-dialog" :open="open" title="Edit address" @close="open = false">
      <Field id="dialog-country" label="Country">
        <Combobox name="dialog-country" :options="nations" value="fr" />
      </Field>
    </Dialog>
    <template v-if="$slots.default" #code><slot /></template>
  </ComboboxExample>
</template>
