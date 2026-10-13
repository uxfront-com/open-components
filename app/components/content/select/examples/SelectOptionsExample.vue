<script setup lang="ts">
import Select from "~/reference/select/Select.vue";

/** `::select-options-example`: options in groups, with the one people start on marked `selected`. */
</script>

<template>
  <SelectExample>
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <label for="options-time-zone" class="text-sm font-medium">Time zone</label>
      <Select id="options-time-zone" name="time-zone">
        <optgroup label="Europe">
          <option value="Europe/Lisbon">Lisbon</option>
          <option value="Europe/London" selected>London</option>
          <option value="Europe/Paris">Paris</option>
        </optgroup>
        <optgroup label="Americas">
          <option value="America/New_York">New York</option>
          <option value="America/Sao_Paulo">São Paulo</option>
          <option value="America/Toronto">Toronto</option>
        </optgroup>
      </Select>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SelectExample>
</template>
