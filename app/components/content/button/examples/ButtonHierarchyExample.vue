<script setup lang="ts">
import Button from "~/reference/button/Button.vue";

/** `::button-hierarchy-example`: a dialog's actions, ranked by variant. */
</script>

<template>
  <ButtonExample>
    <div class="flex w-full max-w-md flex-col gap-4 rounded-lg border border-default p-5">
      <div>
        <p class="text-highlighted font-semibold">Publish this post?</p>
        <p class="text-muted text-sm">It goes live for all subscribers right away.</p>
      </div>
      <div class="flex flex-wrap justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button variant="outline">Schedule…</Button>
        <Button color="primary">Publish post</Button>
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ButtonExample>
</template>
