import { GITHUB_URL } from "./data/site";

export default defineAppConfig({
  // The docs' GitHub, "Edit this page" and "Report an issue" links. Docus reads
  // them from the git remote otherwise, which not every checkout has.
  github: {
    url: GITHUB_URL,
    branch: "main",
  },
  docsTheme: {
    // The frameworks the docs' examples come in, in the order the framework
    // switcher (`::framework-switcher` in content) and the sidebar select show
    // them. The first is the default. `value` names each framework's slot.
    frameworks: [
      { value: "react", label: "React", icon: "i-simple-icons-react" },
      { value: "vue", label: "Vue", icon: "i-simple-icons-vuedotjs" },
      { value: "svelte", label: "Svelte", icon: "i-simple-icons-svelte" },
      { value: "angular", label: "Angular", icon: "i-simple-icons-angular" },
      { value: "solid", label: "Solid", icon: "i-simple-icons-solid" },
      { value: "astro", label: "Astro", icon: "i-simple-icons-astro" },
      { value: "vanilla", label: "Vanilla", icon: "i-simple-icons-javascript" },
    ],
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
