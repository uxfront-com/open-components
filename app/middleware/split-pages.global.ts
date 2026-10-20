/**
 * A page split into parts, like the Button's, used to be one page, so links to its
 * sections from before the split, like the Button's `#loading`, land on its
 * Overview. Browsers never send the #anchor, and the site is static, so it's here,
 * in the browser, that they go on to the part that has the section, in place of the
 * Overview in the history. The map comes from the content (see splitAnchors in
 * server/lib/raw.ts, and appConfig in nuxt.config.ts).
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server || !to.hash) return;
  const pages: Record<string, Record<string, string> | undefined> = useAppConfig().splitAnchors ?? {};
  // The router has already decoded the hash.
  const target = pages[to.path]?.[to.hash.slice(1)];
  if (target) return navigateTo(target, { replace: true });
});
