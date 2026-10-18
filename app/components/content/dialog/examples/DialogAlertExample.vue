<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Dialog from "~/reference/dialog/Dialog.vue";

/** `::dialog-alert-example`: a confirmation, as an alert dialog, with its least destructive action first. */
const open = ref(false);
</script>

<template>
  <DialogExample>
    <Button color="error" variant="outline" @click="open = true">Delete project</Button>
    <Dialog
      id="alert-delete-project"
      role="alertdialog"
      size="sm"
      title="Delete project?"
      description="This deletes the project and its 12 files for everyone. You can't undo it."
      :open="open"
      @close="open = false"
    >
      <template #actions>
        <Button variant="outline" @click="open = false">Keep project</Button>
        <Button color="error" @click="open = false">Delete project</Button>
      </template>
    </Dialog>
    <template v-if="$slots.default" #code><slot /></template>
  </DialogExample>
</template>
