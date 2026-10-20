<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Checkbox from "~/reference/checkbox/Checkbox.vue";
import Dialog from "~/reference/dialog/Dialog.vue";
import Popover from "~/reference/popover/Popover.vue";
import Tooltip from "~/reference/tooltip/Tooltip.vue";

/**
 * `::popover-dialog-example`: a Popover inside a Dialog, with a Tooltip inside the Popover,
 * where each `Escape` closes only the layer on top.
 */
const open = ref(false);
</script>

<template>
  <PopoverExample>
    <Button @click="open = true">Share project</Button>
    <Dialog id="share-project" title="Share project" :open="open" @close="open = false">
      <p class="mb-3">Anyone with the link can view it.</p>
      <Button popovertarget="share-permissions" aria-haspopup="dialog" variant="outline">Permissions</Button>
      <Popover id="share-permissions" title="Who can edit">
        <div class="flex flex-col gap-2">
          <Checkbox checked>Owners</Checkbox>
          <Checkbox>Members</Checkbox>
          <Tooltip label="Guests can only comment" v-slot="{ trigger }">
            <Checkbox v-bind="trigger">Guests</Checkbox>
          </Tooltip>
        </div>
      </Popover>
      <template #actions>
        <Button @click="open = false">Done</Button>
      </template>
    </Dialog>
    <template v-if="$slots.default" #code><slot /></template>
  </PopoverExample>
</template>
