import { GITHUB_URL } from "./data/site";

export default defineAppConfig({
  // The docs' GitHub, "Edit this page" and "Report an issue" links. Docus reads
  // them from the git remote otherwise, which not every checkout has.
  github: {
    url: GITHUB_URL,
    branch: "main",
  },
  docus: {
    shortcuts: {
      // Docus toggles the color mode on a bare `d`. On `pnpm dev`, Nuxt Studio's editor
      // lives in a shadow root, so the shortcut can't tell you're typing there and
      // swallows every "d". The header's button still toggles it.
      toggleColorMode: import.meta.dev ? "" : "d",
    },
  },
  ui: {
    colors: {
      // The periwinkle of the homepage's glow (see app/app.css for its shades).
      primary: "indigo",
      neutral: "zinc",
    },
  },
});
