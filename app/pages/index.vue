<script setup lang="ts">
import type { FormationOptions } from "@uxfront/scene";
import { corridor, plates } from "@uxfront/scene/formations";

import { DOCS_URL, GITHUB_URL } from "~/data/site";
import { hold, share, spotlight } from "~/lib/formations";

useUxHead({
  title: "Open Components - The standard for perfect UI components",
  description:
    "Guidelines for building UI components with a perfect user experience, developer experience and agentic experience, whether humans or AI agents write them.",
  siteName: "Open Components",
  sameAs: [GITHUB_URL],
});

const layers = [
  { id: "ux", index: "01", code: "UX", title: "User experience" },
  { id: "dx", index: "02", code: "DX", title: "Developer experience" },
  { id: "ax", index: "03", code: "AX", title: "Agentic experience" },
];

// A close-up of one plate, held apart: plate 0 (UX) on top, 2 (AX) at the bottom.
const closeUp = (plate: number, shift: [number, number]): FormationOptions["views"] => {
  const y = 0.95 * (1 - plate);
  return {
    desktop: { eye: [3.6, y + 3.2, 4.8], target: [0, y, 0], span: [2.3, 1.5], shift },
    mobile: { eye: [3.4, y + 3, 4.5], target: [0, y, 0], span: [1.95, 1.25] },
  };
};

// The hero shows the stack drawn apart, then each chapter closes in on one plate.
// Framed with room on the right for the UX, DX and AX callouts.
const hero = hold(
  plates({
    key: "hero",
    label: "Open Components",
    views: {
      desktop: { span: [2.7, 2.1], shift: [0.26, 0.04] },
      mobile: { span: [2.9, 2.1], shift: [-0.14, 0.5] },
    },
  }),
  1,
);
const layer = (plate: number, shift: [number, number]) => {
  const { id, title } = layers[plate]!;
  const formation = plates({ key: id, label: title, views: closeUp(plate, shift) });
  return share(spotlight(hold(formation, 1), plate), hero);
};
const scene = [
  hero,
  layer(0, [0.36, 0.02]),
  layer(1, [-0.42, 0.02]),
  layer(2, [0.2, 0.28]),
  corridor({ label: "Build on it" }),
];

const nav = layers.map((layer) => ({
  href: `#${layer.id}`,
  label: layer.code,
  index: layer.index,
}));

const ux = [
  { title: "Accessible", text: "Keyboard, pointer, touch and screen readers, following WAI-ARIA." },
  { title: "Predictable", text: "The same interaction works the same way in every component." },
  { title: "Every state", text: "Hover, focus, active, disabled, loading and error, all designed." },
  {
    title: "Adaptive",
    text: "Respects motion, contrast, colour scheme and text size preferences.",
  },
];

const dx = [
  { title: "Consistent", text: "Sizes, colours, states and events share their names everywhere." },
  { title: "Type-safe", text: "Every prop, event and slot is typed and documented." },
  { title: "Composable", text: "Small parts build larger ones, with no hidden coupling." },
  { title: "Controllable", text: "Controlled or uncontrolled, with every state within reach." },
];

const ax = [
  { title: "Semantic", text: "Roles, names and states agents can read straight from the markup." },
  { title: "Described", text: "Anatomy, props and states, published as machine-readable specs." },
  { title: "Deterministic", text: "The same input always renders the same structure." },
  { title: "Verifiable", text: "Rules agents can check their work against before shipping." },
];
</script>

<template>
  <UxSite :scene="scene" skip-to="#ux" skip-label="Skip to the standard">
    <template #anchors>
      <UxAnchor
        v-for="(layer, i) in layers"
        :key="layer.code"
        :anchor="`hero:${i}`"
        variant="callout"
        :label="layer.code"
        :detail="layer.title"
      />
    </template>
    <template #header>
      <UxHeader brand="Open Components" :nav="nav" nav-label="The standard" :github="GITHUB_URL">
        <template #mark />
        <template #brand><strong>Open</strong>Components</template>
        <template #byline>
          by
          <a href="https://uxfront.com">
            <UxFrontMark />
            <span><strong>UX</strong>Front</span>
          </a>
        </template>
        <template #actions>
          <NuxtLink :to="DOCS_URL">Documentation</NuxtLink>
        </template>
      </UxHeader>
    </template>

    <UxHero
      kicker="Open Components - The UXFront component standard"
      title="The standard for perfect UI components"
      :index="nav"
      index-label="The standard"
      scroll-href="#ux"
    >
      <template #lines>
        <UxHeroLine>The <strong>standard</strong></UxHeroLine>
        <UxHeroLine>for perfect UI</UxHeroLine>
        <UxHeroLine>components</UxHeroLine>
      </template>
      <template #lead>
        Guidelines for building UI components with a perfect user experience, developer experience
        and agentic experience, whether humans or AI agents write them.
      </template>
    </UxHero>


    <UxChapter id="ux" index="01" role="UX" title="User experience" :steps="4">
      <template #lead>
        Components behave the way people expect them to, with any input, on any device and for
        every ability.
      </template>
      <UxTraits :items="ux" />
    </UxChapter>

    <UxChapter id="dx" index="02" role="DX" title="Developer experience" :steps="4" align="end">
      <template #lead>
        One clear API, learned once and used everywhere. Knowing one component means knowing them
        all.
      </template>
      <UxTraits :items="dx" />
    </UxChapter>

    <UxChapter id="ax" index="03" role="AX" title="Agentic experience" :steps="4" valign="end">
      <template #lead>
        Components that AI agents can read, reason about and build with, so their output meets the
        same bar as yours.
      </template>
      <UxTraits :items="ax" />
    </UxChapter>

    <UxFinale>
      <template #mark><UxFrontMark /></template>
      <template #title>Build to the <strong>standard</strong>.</template>
      <template #lead>
        Learn the guidelines once, then hold every component to the same high standards, whether you or your agents
        write it.
      </template>
      <template #actions>
        <UxPillLink :href="DOCS_URL" label="Read the documentation" />
      </template>
      <template #footer>
        <span>© 2026 UXFront</span>
        <a :href="GITHUB_URL">GitHub</a>
      </template>
    </UxFinale>
  </UxSite>
</template>

