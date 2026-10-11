<script setup lang="ts">
import Switch from "~/reference/switch/Switch.vue";

/** `::switch-saving-example`: a setting that applies as soon as it's flipped, and says when it's saved. */
const on = ref(false);
const status = ref("");
const error = ref("");

// Stands in for the request that saves the setting.
const api = { save: (_settings: { darkMode: boolean }) => new Promise((resolve) => setTimeout(resolve, 600)) };

async function change(value: boolean) {
  // The switch moves at once, and the status says when the change is saved.
  on.value = value;
  error.value = "";
  status.value = "Saving…";
  try {
    await api.save({ darkMode: value });
    status.value = value ? "Dark mode is on" : "Dark mode is off";
  } catch {
    // Back to how it was, with a message that says what happened.
    on.value = !value;
    status.value = "";
    error.value = "Couldn't change dark mode. Try again.";
  }
}
</script>

<template>
  <SwitchExample>
    <div class="flex w-full max-w-xs flex-col gap-1.5">
      <div class="flex items-center justify-between gap-4">
        <label for="saving-dark-mode" class="text-sm font-medium">Dark mode</label>
        <Switch
          id="saving-dark-mode"
          :checked="on"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="error ? 'saving-dark-mode-error' : undefined"
          @update:checked="change"
        />
      </div>
      <p v-if="error" id="saving-dark-mode-error" class="text-sm text-(--color--error-text)">{{ error }}</p>
      <p role="status" class="text-muted min-h-5 text-sm">{{ status }}</p>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SwitchExample>
</template>
