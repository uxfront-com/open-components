<script setup lang="ts">
/**
 * Replaces Docus's mobile menu toggle (docus/app/components/IconMenuToggle.vue),
 * which its header (docus/app/components/app/AppHeader.vue) renders in place of
 * Nuxt UI's, to name it. Docus's is an icon-only button with no name, so screen
 * readers announce just "button". This one says what it does, "Open menu" or
 * "Close menu", in Nuxt UI's words for its own toggle.
 *
 * Docus springs the three lines into a cross with motion-v, which isn't the
 * app's to import, so they turn with a CSS transition here, and don't move for
 * readers who ask for reduced motion. Keep the rest in step with Docus's.
 */
import { useLocale } from "#ui/composables/useLocale";

defineProps<{
  open: boolean;
}>();

const { t } = useLocale();
</script>

<template>
  <UButton
    size="sm"
    variant="ghost"
    color="neutral"
    class="-me-1.5"
    square
    :aria-label="open ? t('header.close') : t('header.open')"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="menu-toggle size-5"
      :class="{ 'menu-toggle--open': open }"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  </UButton>
</template>

<style scoped>
.menu-toggle line {
  transform-box: fill-box;
  transform-origin: center;
  transition:
    transform 0.2s ease-out,
    opacity 0.2s ease-out;
}

/* The top and bottom lines meet in the middle and cross, and the middle one fades. */
.menu-toggle--open line:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.menu-toggle--open line:nth-child(2) {
  opacity: 0;
}

.menu-toggle--open line:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

@media (prefers-reduced-motion: reduce) {
  .menu-toggle line {
    transition: none;
  }
}
</style>
