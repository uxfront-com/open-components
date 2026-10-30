import { FRAMEWORKS } from "./data/frameworks";
import { CHANGELOG_URL, GITHUB_URL } from "./data/site";

export default defineAppConfig({
  // The docs' GitHub, "Edit this page" and "Report an issue" links. Docus reads
  // them from the git remote otherwise, which not every checkout has.
  github: {
    url: GITHUB_URL,
    branch: "main",
  },
  docsTheme: {
    // The frameworks the docs' examples come in (see app/data/frameworks.ts).
    frameworks: FRAMEWORKS,
    // The docs header's site name, set and signed "by UXFront" the way the
    // homepage header does.
    wordmark: { bold: "Open", regular: "Components" },
    byline: true,
    // The docs header's links, beside its buttons from 768px up and at the top of
    // its menu below that, each highlighted on its page and the pages below it.
    headerLinks: [
      // The introduction, rather than /docs, which only redirects to it.
      { label: "Documentation", to: "/docs/getting-started/introduction", activeFor: "/docs" },
      { label: "Changelog", to: CHANGELOG_URL, activeFor: CHANGELOG_URL },
    ],
  },
  ui: {
    colors: {
      // The periwinkle of the homepage's glow (see app/app.css for its shades).
      primary: "indigo",
      neutral: "zinc",
    },
    prose: {
      // Tabs in the docs, like the MCP Server page's clients, scroll sideways on
      // small screens rather than cut their labels short, as code groups do. The
      // underline under the active tab moves up a pixel, onto the list's border,
      // where scrolling doesn't clip it.
      tabs: {
        slots: {
          list: "overflow-x-auto",
          trigger: "shrink-0",
          indicator: "bottom-0",
        },
      },
      // Link cards, like the ones the Button's Overview has for its layers' pages,
      // lead with a large icon. A hovered card's tint takes the muted description
      // below 4.5:1 in light mode, so it darkens on hover.
      card: {
        slots: {
          description: "group-hover:text-toned",
          icon: "size-12 mb-4",
        },
      },
    },
  },
});
