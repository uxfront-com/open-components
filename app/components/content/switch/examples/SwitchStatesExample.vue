<script setup lang="ts">
import Switch from "~/reference/switch/Switch.vue";

/** `::switch-states-example`: each state, labelled and captioned. */
</script>

<template>
  <SwitchExample>
    <div class="grid w-full max-w-xl gap-x-6 gap-y-5 sm:grid-cols-2">
      <figure class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between gap-4">
          <label for="states-wifi" class="text-sm font-medium">Wi-Fi</label>
          <Switch id="states-wifi" />
        </div>
        <figcaption class="text-muted text-xs">Off (try hovering, clicking or tabbing to it)</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between gap-4">
          <label for="states-bluetooth" class="text-sm font-medium">Bluetooth</label>
          <Switch id="states-bluetooth" checked />
        </div>
        <figcaption class="text-muted text-xs">On</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between gap-4">
          <label for="states-sync" class="text-sm font-medium">Sync</label>
          <Switch id="states-sync" checked disabled />
        </div>
        <figcaption class="text-muted text-xs">Disabled</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between gap-4">
          <label for="states-sso" class="text-sm font-medium">Single sign-on</label>
          <Switch id="states-sso" checked readonly />
        </div>
        <figcaption class="text-muted text-xs">Read-only (try flipping it)</figcaption>
      </figure>
      <figure class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between gap-4">
          <label for="states-alerts" class="text-sm font-medium">Price alerts</label>
          <Switch id="states-alerts" aria-invalid="true" aria-describedby="states-alerts-error" />
        </div>
        <p id="states-alerts-error" class="text-sm text-(--color--error-text)">
          Couldn't turn on price alerts. Try again.
        </p>
        <figcaption class="text-muted text-xs">Invalid</figcaption>
      </figure>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </SwitchExample>
</template>
