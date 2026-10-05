<template>
  <svg class="spinner" viewBox="0 0 16 16" aria-hidden="true">
    <!-- Visual only: whatever shows the spinner tells screen readers what's loading. -->
    <circle data-slot="track" cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="2" opacity="0.25" />
    <path
      data-slot="indicator"
      d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
/* The same layer order as Tailwind CSS. The spinner's styles go in `components`,
   so a class of yours that sets its size wins without any specificity tricks. */
@layer theme, base, components, utilities;

@layer components {
  .spinner {
    /* The size of the text around it, like an icon. Components that place it set their own. */
    --spinner--size: 1em;

    /* Inline, like a letter, even under resets that make every svg a block, like Tailwind's Preflight. */
    display: inline-block;
    flex-shrink: 0;
    width: var(--spinner--size);
    height: var(--spinner--size);
    /* Centred on the text around it, when it sits in a line of text. */
    vertical-align: -0.125em;
    animation: spinner-turn 0.8s linear infinite;
  }
  @keyframes spinner-turn {
    to {
      rotate: 1turn;
    }
  }
  @keyframes spinner-pulse {
    50% {
      opacity: 0.4;
    }
  }

  /* With reduced motion, the spinner pulses instead of turning. */
  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: spinner-pulse 1.6s ease-in-out infinite;
    }
  }
}
</style>
