<script setup lang="ts">
import Button from "~/reference/button/Button.vue";

/** `::button-loading-example`: a Button that loads while it saves. */

// A save that takes two seconds, then reports its outcome.
const saving = ref(false);
const status = ref("");
async function save() {
  saving.value = true;
  status.value = "";
  await new Promise((resolve) => setTimeout(resolve, 2000));
  saving.value = false;
  status.value = "Changes saved";
}
</script>

<template>
  <ButtonExample>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Button color="primary" :loading="saving" loading-label="Saving" @click="save">Save changes</Button>
      <!-- The page announces the outcome: a status message that's always in the page. -->
      <p role="status" class="text-muted min-w-28 text-sm">{{ status }}</p>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ButtonExample>
</template>
