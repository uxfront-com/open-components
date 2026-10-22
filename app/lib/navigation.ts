import type { ContentNavigationItem } from "@nuxt/content";

// The section whose pages carry no number, so they're listed by name (AGENTS.md,
// "Markdown conventions").
const COMPONENTS = "/docs/components";

/**
 * The docs' navigation with the component pages in name order, which the sidebar,
 * the header's menu (DocsNavigation.vue) and the links to the previous and next
 * pages (UContentSurround.vue) all read, so they list the pages the same way.
 * Nuxt Content orders pages by file path, which puts a page split into a folder,
 * like `checkbox/`, after a page whose name starts with the folder's, like
 * `checkbox-group.md`, since `-` comes before `/`. The other sections, and the
 * parts of a split page, are numbered, so they keep Nuxt Content's order. It
 * returns a new tree, since the one it's given is Docus's.
 */
export function sortNavigation(navigation: ContentNavigationItem[]): ContentNavigationItem[] {
  return navigation.map((item) => {
    if (!item.children) return item;
    const children =
      item.path === COMPONENTS
        ? [...item.children].sort((a, b) => a.title.localeCompare(b.title, "en"))
        : sortNavigation(item.children);
    return { ...item, children };
  });
}

/**
 * The pages before and after `path` in `navigation`, or `null` where there's none,
 * found the way Nuxt Content's queryCollectionItemSurroundings() finds them in its
 * own order: every page in the order the navigation lists them, where a folder
 * with a page of its own, like the Button's Overview, is that page.
 */
export function findSurround(
  navigation: ContentNavigationItem[],
  path: string,
): [ContentNavigationItem | null, ContentNavigationItem | null] {
  const pages = flatten(navigation);
  const index = pages.findIndex((page) => page.path === path);
  if (index === -1) return [null, null];
  return [pages[index - 1] ?? null, pages[index + 1] ?? null];
}

// As Nuxt Content's flattedData(), which its package doesn't export.
function flatten(navigation: ContentNavigationItem[]): ContentNavigationItem[] {
  return navigation.flatMap((item) => {
    const children = item.children ? flatten(item.children) : [];
    if (item.page === false || children.some((child) => child.path === item.path)) return children;
    return [{ ...item, children: undefined }, ...children];
  });
}
