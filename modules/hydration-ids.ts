import { defineNuxtModule } from "@nuxt/kit";

/**
 * Takes `onServerPrefetch` off the list of composables Nuxt removes from the
 * client build, so the browser registers the same hooks the server does.
 */
export function keepServerPrefetch(composables: Record<string, string[]>) {
  for (const [source, names] of Object.entries(composables)) {
    composables[source] = names.filter((name) => name !== "onServerPrefetch");
  }
  return composables;
}

/**
 * Keeps the ids `useId` makes the same on the server and in the browser.
 *
 * Vue builds each id from the async boundaries above the component: every
 * component with an async setup or an `onServerPrefetch` hook starts a new one.
 * Nuxt removes `onServerPrefetch` calls from production client builds, since the
 * browser never runs them, so a component that registers one, like the icons
 * `@nuxt/icon` renders in CSS mode, is a boundary on the server and not in the
 * browser. Every id after the docs header's first icon then changes as the page
 * hydrates, and the Framework select's label and the tabs' panels lose the
 * elements their `aria-labelledby` and `aria-controls` point to. Development
 * builds keep the calls, which is why only the built site shows it.
 *
 * It runs before Nuxt reads the list, when every module is set up.
 */
export default defineNuxtModule({
  meta: { name: "hydration-ids" },
  setup(_, nuxt) {
    keepServerPrefetch(nuxt.options.optimization.treeShake.composables.client);
  },
});
