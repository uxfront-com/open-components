import { GITHUB_URL } from "./data/site";

export default defineAppConfig({
  // The docs' GitHub, "Edit this page" and "Report an issue" links. Docus reads
  // them from the git remote otherwise, which not every checkout has.
  github: {
    url: GITHUB_URL,
    branch: "main",
  },
  ui: {
    colors: {
      // The periwinkle of the homepage's glow (see app/app.css for its shades).
      primary: "indigo",
      neutral: "zinc",
    },
  },
});
