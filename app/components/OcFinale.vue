<script setup lang="ts">
/**
 * The closing section: the UXFront mark, a title, a call to action and a
 * link. Same stage, pinning and type scale as `UxFinale`, which has no slot
 * for a mark or a button.
 */
const { id = "build" } = defineProps<{
  id?: string;
  href: string;
  linkLabel: string;
}>();

defineSlots<{
  title(): unknown;
  lead?(): unknown;
  /** The page's footer, pinned to the bottom of the screen. Links in it are styled. */
  footer?(): unknown;
}>();
</script>

<template>
  <section :id="id" class="oc-finale" data-stage :aria-labelledby="`${id}-title`">
    <div class="oc-finale__pin">
      <div class="oc-finale__body" data-reveal>
        <UxFrontMark class="oc-finale__mark" />
        <h2 :id="`${id}-title`" class="oc-finale__title"><slot name="title" /></h2>
        <p v-if="$slots.lead" class="oc-finale__lead"><slot name="lead" /></p>
        <!-- Wrapped: the link's own transitions would override the reveal's. -->
        <div class="oc-finale__action">
          <UxPillLink :href="href" :label="linkLabel" />
        </div>
      </div>
      <footer v-if="$slots.footer" class="oc-finale__footer ux-mono"><slot name="footer" /></footer>
    </div>
  </section>
</template>

<style scoped>
.oc-finale {
  position: relative;
  height: 200vh;
}

.oc-finale__pin {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  height: 100svh;
  padding: 6rem var(--ux-gutter) 4rem;
  text-align: center;
}

.oc-finale__body {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(100%, 64rem);
}

.oc-finale__body::before {
  content: "";
  position: absolute;
  inset: -15% -10%;
  z-index: -1;
  background: radial-gradient(closest-side, rgb(5 5 7 / 0.7), rgb(5 5 7 / 0));
}

.oc-finale__mark {
  width: clamp(4.5rem, 2.5rem + 6vw, 8.5rem);
  height: auto;
  margin-bottom: clamp(1.75rem, 1rem + 2vw, 3rem);
  color: var(--ux-fg);
  filter: drop-shadow(0 0 1.5rem rgb(255 255 255 / 0.25));
}

.oc-finale__title {
  font-size: clamp(2.75rem, 1rem + 6vw, 7.5rem);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.055em;
  text-wrap: balance;
}

.oc-finale__lead {
  max-width: 32rem;
  margin-top: 1.75rem;
  font-size: clamp(1.0625rem, 0.95rem + 0.4vw, 1.25rem);
  line-height: 1.45;
  color: var(--ux-fg-2);
}

.oc-finale__action {
  margin-top: 2.5rem;
}

.oc-finale__footer {
  position: absolute;
  left: var(--ux-gutter);
  right: var(--ux-gutter);
  bottom: 4.25rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--ux-fg-3);
}

.oc-finale__footer :slotted(a) {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  color: var(--ux-fg-2);
  text-decoration: none;
}

.oc-finale__footer :slotted(a:hover) {
  color: var(--ux-fg);
}

/* The finale no longer fits one pinned screen: it flows, footer last. */
@media (max-width: 1099px), (max-aspect-ratio: 5/4), (max-height: 700px) {
  .oc-finale {
    height: auto;
  }

  .oc-finale__pin {
    position: relative;
    height: auto;
    min-height: 100vh;
    min-height: 100svh;
    padding: 7rem var(--ux-gutter) 5.5rem;
  }

  .oc-finale__footer {
    position: static;
    width: 100%;
    margin-top: 3rem;
  }
}
</style>
