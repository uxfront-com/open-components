<script setup lang="ts">
import type { UxNavItem } from "@uxfront/ui";

/**
 * `UxHeader` with a byline: the OpenComponents wordmark links back to the
 * top, and "by UXFront" links to uxfront.com. `UxHeader` has a single brand
 * link, and a link can't hold another.
 */
const { nav = [], navLabel = "Sections" } = defineProps<{
  nav?: UxNavItem[];
  navLabel?: string;
  /** A GitHub URL, linked at the end of the header. */
  github?: string;
}>();

const { state } = useExperience();
</script>

<template>
  <header class="oc-header">
    <div class="oc-header__brand">
      <a class="oc-header__home" href="#top" aria-label="Open Components, back to top">
        <span><strong>Open</strong>Components</span>
      </a>
      <a class="oc-header__byline" href="https://uxfront.com">
        by
        <span class="oc-header__logo">
          <UxFrontMark />
          <span><strong>UX</strong>Front</span>
        </span>
      </a>
    </div>
    <nav v-if="nav.length" class="oc-header__nav" :aria-label="navLabel">
      <ul>
        <li v-for="item in nav" :key="item.href">
          <a
            :href="item.href"
            :aria-current="
              state.activeId && item.href === `#${state.activeId}` ? 'location' : undefined
            "
          >
            <span v-if="item.index" class="oc-header__index">{{ item.index }}</span>
            {{ item.label }}
          </a>
        </li>
      </ul>
    </nav>
    <a v-if="github" class="oc-header__github" :href="github">
      <UxGithubIcon />
      <span>GitHub</span>
    </a>
  </header>
</template>

<style scoped>
.oc-header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 1.1rem var(--ux-gutter);
  background: linear-gradient(180deg, rgb(5 5 7 / 0.85), rgb(5 5 7 / 0));
}

.oc-header a {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  color: var(--ux-fg);
  text-decoration: none;
}

.oc-header__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.oc-header__home {
  font-size: 1.0625rem;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.oc-header a.oc-header__byline {
  gap: 0.35rem;
  font-size: 0.8125rem;
  color: var(--ux-fg-3);
  transition: color 0.3s var(--ux-ease-out);
}

.oc-header__logo {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--ux-fg-2);
  transition: color 0.3s var(--ux-ease-out);
}

.oc-header__logo svg {
  width: 0.875rem;
  height: 0.875rem;
}

.oc-header a.oc-header__byline:hover,
.oc-header__byline:hover .oc-header__logo {
  color: var(--ux-fg);
}

.oc-header__nav ul {
  display: flex;
  gap: clamp(1rem, 2.4vw, 2.5rem);
  margin: 0;
  padding: 0;
  list-style: none;
}

.oc-header__nav a {
  position: relative;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--ux-fg-2);
  transition: color 0.3s var(--ux-ease-out);
}

.oc-header__nav a::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.55rem;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.5s var(--ux-ease-out);
}

.oc-header__nav a:hover,
.oc-header__nav a[aria-current] {
  color: var(--ux-fg);
}

.oc-header__nav a:hover::after,
.oc-header__nav a[aria-current]::after {
  transform: scaleX(1);
  transform-origin: left;
}

.oc-header__index {
  font-family: var(--font-ux-mono);
  font-size: 0.75rem;
  color: var(--ux-fg-3);
}

.oc-header__github {
  gap: 0.5rem;
  font-size: 0.875rem;
}

.oc-header__github svg {
  width: 1.125rem;
  height: 1.125rem;
}

@media (max-width: 960px) {
  .oc-header__nav {
    display: none;
  }
}

/* Where the copy scrolls under the header (stacked and landscape-phone
   layouts, see UxChapter), a solid band keeps it off the logo. */
@media (max-width: 1099px), (max-aspect-ratio: 5/4) {
  .oc-header {
    padding-bottom: 1.6rem;
    background: linear-gradient(180deg, rgb(5 5 7 / 0.96), rgb(5 5 7 / 0.9) 58%, rgb(5 5 7 / 0));
  }
}
</style>
