<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Input from "~/reference/input/Input.vue";
import Popover from "~/reference/popover/Popover.vue";

/** `::popover-form-example`: a short form in a popover, which closes it once it's sent. */
const open = ref(false);
const name = ref("");
const labels = ref<string[]>([]);

function create() {
  if (name.value.trim()) labels.value.push(name.value.trim());
  name.value = "";
  open.value = false;
}
</script>

<template>
  <PopoverExample>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Button popovertarget="new-label" aria-haspopup="dialog" variant="outline">New label</Button>
      <Popover id="new-label" v-model:open="open" title="New label">
        <form class="flex flex-col gap-3" @submit.prevent="create">
          <div class="flex flex-col gap-1.5">
            <label for="label-name" class="text-sm font-medium">Name</label>
            <Input id="label-name" v-model="name" />
          </div>
          <Button type="submit" color="primary">Create label</Button>
        </form>
      </Popover>
      <span v-for="label in labels" :key="label" class="text-sm text-muted">{{ label }}</span>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </PopoverExample>
</template>
