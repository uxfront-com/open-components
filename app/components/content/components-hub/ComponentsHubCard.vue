<script setup lang="ts">
import { type VNode, useSlots } from "vue";
import { layout } from "./card";

/**
 * A component's card on the components hub: a drawing of it, its name as a link
 * to its Overview, what it's for, and a footer with a link to each layer's page.
 *
 * Every link stays in the page's markdown, which is what agents read through
 * /raw/docs/components.md, llms-full.txt and the MCP server, and they only keep a
 * component's content, not its props. So the card reads its name, sentence and
 * layers from its default slot, and only the drawing comes from a prop:
 *
 * ```md
 * :::components-hub-card{preview="button"}
 * [Button](/docs/components/button)
 *
 * The Button lets people act on what's in front of them.
 *
 * - [UI](/docs/components/button/ui)
 * - [UX](/docs/components/button/ux)
 * - [DX](/docs/components/button/dx)
 * - [AX](/docs/components/button/ax)
 * :::
 * ```
 */
defineProps<{
  /** The component the drawing shows, named as its folder in content/docs/3.components/. */
  preview: string;
}>();

const slots = useSlots();

// Renders what the markdown had inside the sentence's paragraph, like inline code.
const Nodes = (props: { nodes: VNode[] }) => props.nodes;
</script>

<template>
  <li v-for="card in [layout(slots.default?.() ?? [])]" :key="card.name.href" data-slot="component-card" class="hub-card">
    <div class="hub-card-body">
      <!-- A picture of the component, which its name and sentence already describe,
           so it's hidden from assistive technologies and has nothing to focus. -->
      <div class="hub-card-preview" inert aria-hidden="true">
        <ComponentsHubPreview :name="preview" />
      </div>
      <!-- A heading, so screen reader users can go from card to card by heading. Its
           link covers the preview and the sentence too, but not the footer, so no
           link sits inside another. -->
      <h3 class="hub-card-name">
        <NuxtLink :to="card.name.href">{{ card.name.label }}</NuxtLink>
      </h3>
      <p v-if="card.sentence.length" class="hub-card-sentence"><Nodes :nodes="card.sentence" /></p>
    </div>
    <ul class="hub-card-layers" role="list">
      <li v-for="layer in card.layers" :key="layer.href">
        <!-- 17 links named "UI" can't be told apart out of context, like in a screen
             reader's list of links, so each names its component too. The name starts
             with the visible label, so voice control users can say "click UI". -->
        <NuxtLink :to="layer.href">
          {{ layer.label }} <span class="sr-only">of the {{ card.name.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </li>
</template>

<style scoped>
.hub-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg);
}

/* The name's link is stretched over this part of the card, with its ::after. */
.hub-card-body {
  position: relative;
  flex: 1;
  padding-bottom: 1rem;
}

/* The same shape on every card, so they line up. */
.hub-card-preview {
  aspect-ratio: 2 / 1;
  border-bottom: 1px solid var(--ui-border);
  background: var(--ui-bg-muted);
}

.hub-card-name {
  margin: 0.875rem 1rem 0;
  color: var(--ui-text-highlighted);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5rem;
}
.hub-card-name a {
  outline: none;
}
.hub-card-name a::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: calc(var(--ui-radius) * 2) calc(var(--ui-radius) * 2) 0 0;
}
/* The ring goes around everything the link covers, inside the card's edge, which
   would clip it. */
.hub-card-name a:focus-visible::after {
  outline: 2px solid var(--ui-primary);
  outline-offset: -2px;
}

.hub-card-sentence {
  margin: 0.25rem 1rem 0;
  color: var(--ui-text-muted);
  font-size: 0.875rem;
  line-height: 1.375rem;
}

/* Four equal cells, split by lines, each a whole cell to click. */
.hub-card-layers {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--ui-border);
  list-style: none;
}
.hub-card-layers li + li {
  border-left: 1px solid var(--ui-border);
}
/* Far more than the 24 × 24px WCAG 2.5.8 asks for, at 2.75rem high and at least a
   quarter of a 13rem card wide. */
.hub-card-layers a {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  color: var(--ui-text-toned);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}
.hub-card-layers a:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: -2px;
}

/* Only pointers that can hover get hover styles, or a tap would leave them on. */
@media (hover: hover) {
  .hub-card-body:hover .hub-card-preview {
    background: var(--ui-bg-elevated);
  }
  .hub-card-body:hover .hub-card-name a {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  .hub-card-layers a:hover {
    background: var(--ui-bg-elevated);
    color: var(--ui-text-highlighted);
  }
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .hub-card-preview,
  .hub-card-layers a {
    transition: background-color 0.15s, color 0.15s;
  }
}
</style>
