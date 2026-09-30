<script setup lang="ts">
import Button from "~/reference/button/Button.vue";

/** `::button-colors-example`: every colour in every variant. */
const variants = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;
const colors = ["primary", "secondary", "neutral", "success", "info", "warning", "error"] as const;
</script>

<template>
  <ButtonExample>
    <!-- A picture of the table that follows, so it's inert and hidden. 42 more
         tab stops would only get in the way. Narrow containers wrap each colour's
         six variants onto two rows. -->
    <div class="@container w-full" inert aria-hidden="true">
      <div class="mx-auto grid w-fit grid-cols-[auto_repeat(3,auto)] items-center gap-x-2 gap-y-2 @xl:grid-cols-[auto_repeat(6,auto)] @xl:gap-x-3">
        <template v-for="color in colors" :key="color">
          <span class="text-muted row-span-2 pe-1 font-mono text-xs @xl:row-span-1">{{ color }}</span>
          <Button v-for="variant in variants" :key="variant" :variant="variant" :color="color" size="sm">
            {{ variant[0]!.toUpperCase() + variant.slice(1) }}
          </Button>
        </template>
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </ButtonExample>
</template>
