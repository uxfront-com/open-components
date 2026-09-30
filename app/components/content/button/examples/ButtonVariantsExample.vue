<script setup lang="ts">
import Button from "~/reference/button/Button.vue";

/** `::button-variants-example`: the six variants, side by side. */
const variants = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;
</script>

<template>
  <ButtonExample>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Button v-for="variant in variants" :key="variant" :variant="variant" color="primary">
        {{ variant[0]!.toUpperCase() + variant.slice(1) }}
      </Button>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ButtonExample>
</template>
