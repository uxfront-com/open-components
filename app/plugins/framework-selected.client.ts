/**
 * Tracks the framework a reader picks in the Framework select above the docs'
 * sidebar as "Framework Selected" in Amplitude: which frameworks the standard's
 * readers build components in. Every `useFramework()` follows the pick through
 * a storage event, this one included. A pick restored from storage isn't
 * tracked, and neither is one made in another tab (the tab picked in has the
 * focus).
 */
export default defineNuxtPlugin(() => {
  const { framework } = useFramework();

  watch(framework, (value) => {
    if (document.hasFocus()) window.amplitude?.track("Framework Selected", { framework: value });
  });
});
