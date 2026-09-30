<script setup lang="ts">
import Button from "~/reference/button/Button.vue";

/** `::button-destructive-example`: a dialog that confirms a deletion. */
</script>

<template>
  <ButtonExample>
    <div class="flex w-full max-w-md flex-col gap-4 rounded-lg border border-default p-5">
      <div>
        <p class="text-highlighted font-semibold">Delete “Marketing site”?</p>
        <p class="text-muted text-sm">Its 24 pages and their history will be deleted for good.</p>
      </div>
      <div class="flex flex-wrap justify-end gap-2">
        <Button variant="outline">Keep project</Button>
        <Button color="error">Delete project</Button>
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ButtonExample>
</template>
