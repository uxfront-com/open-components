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
  },
});
