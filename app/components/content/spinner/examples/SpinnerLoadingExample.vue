<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Spinner from "~/reference/spinner/Spinner.vue";

/** `::spinner-loading-example`: a Spinner in a status message, which says what's loading. */

// A check that takes two seconds, then reports its outcome.
const checking = ref(false);
const status = ref("");
async function check() {
  checking.value = true;
  status.value = "Checking for updates";
  await new Promise((resolve) => setTimeout(resolve, 2000));
  checking.value = false;
  status.value = "You're up to date";
}
</script>

<template>
  <SpinnerExample>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Button variant="outline" :disabled="checking" focusable-when-disabled @click="check">
        Check for updates
      </Button>
      <!-- Always in the page, and wide enough for every message, so nothing moves. -->
      <p role="status" class="text-muted min-w-44 text-sm">
        <Spinner v-if="checking" />
        {{ status }}
      </p>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SpinnerExample>
</template>
