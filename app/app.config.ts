import { FRAMEWORKS } from "./data/frameworks";
import { GITHUB_URL } from "./data/site";

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
      // lead with a large icon that lifts and tilts while you hover the card or
      // focus its link, and stays still for people who ask for less motion. A
      // hovered card's tint takes the muted description below 4.5:1 in light
      // mode, so it darkens on hover.
      card: {
        slots: {
          description: "group-hover:text-toned",
          icon: [
            "size-12 mb-4 transition-transform duration-300 ease-out",
            "motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:-rotate-6",
            "motion-safe:group-has-[>a:focus-visible]:-translate-y-1 motion-safe:group-has-[>a:focus-visible]:-rotate-6",
          ],
        },
      },
    },
  },
});
