<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Dialog from "~/reference/dialog/Dialog.vue";
import Input from "~/reference/input/Input.vue";

/** `::dialog-content-example`: a dialog with a title, a description, a form in its body and two actions. */
const open = ref(false);
</script>

<template>
  <DialogExample>
    <Button variant="outline" @click="open = true">Edit profile</Button>
    <Dialog
      id="content-profile"
      title="Edit profile"
      description="Your name and email address, as other people see them."
      :open="open"
      @close="open = false"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label for="content-name" class="text-sm font-medium">Full name</label>
          <Input id="content-name" autocomplete="name" value="Ada Lovelace" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="content-email" class="text-sm font-medium">Email address</label>
          <Input id="content-email" type="email" autocomplete="email" value="ada@example.com" />
        </div>
      </div>
      <template #actions>
        <Button variant="outline" @click="open = false">Cancel</Button>
        <Button color="primary" @click="open = false">Save changes</Button>
      </template>
    </Dialog>
    <template v-if="$slots.default" #code><slot /></template>
  </DialogExample>
</template>
