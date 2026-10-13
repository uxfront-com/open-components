<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Dialog from "~/reference/dialog/Dialog.vue";
import type { DialogProps } from "~/reference/dialog/Dialog.vue";

/** `::dialog-sizes-example`: a Button that opens a dialog at each size. */
const sizes = ["sm", "md", "lg"] as const satisfies DialogProps["size"][];
const open = ref<DialogProps["size"]>();
</script>

<template>
  <DialogExample>
    <div class="flex flex-wrap justify-center gap-3">
      <template v-for="size in sizes" :key="size">
        <Button variant="outline" @click="open = size">Open {{ size }}</Button>
        <Dialog
          :id="`sizes-${size}`"
          :title="`A ${size} dialog`"
          :size="size"
          :open="open === size"
          @close="open = undefined"
        >
          <p>It gets as wide as its size allows, and never wider than the screen, less a margin.</p>
          <template #actions>
            <Button @click="open = undefined">Done</Button>
          </template>
        </Dialog>
      </template>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </DialogExample>
</template>
