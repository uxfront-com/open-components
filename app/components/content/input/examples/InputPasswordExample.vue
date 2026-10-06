<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Input from "~/reference/input/Input.vue";

/** `::input-password-example`: a password input with a Show password toggle in its actions. */
const shown = ref(false);
</script>

<template>
  <InputExample>
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <label for="password-example" class="text-sm font-medium">Password</label>
      <Input id="password-example" :type="shown ? 'text' : 'password'" autocomplete="current-password">
        <template #actions>
          <Button
            label="Show password"
            variant="ghost"
            size="xs"
            icon-only
            aria-controls="password-example"
            :aria-pressed="shown"
            @click="shown = !shown"
          >
            <template #leading><UIcon :name="shown ? 'i-lucide-eye-off' : 'i-lucide-eye'" /></template>
          </Button>
        </template>
      </Input>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </InputExample>
</template>
