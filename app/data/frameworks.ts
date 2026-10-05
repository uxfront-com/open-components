// The frameworks the docs' examples come in, in the order the framework switcher
// (`::framework-switcher` in content) and the sidebar select show them. The first
// is the default. `value` names each framework's slot. The MCP server (mcp/)
// reads them too, to give agents one framework's examples.
export const FRAMEWORKS = [
  { value: "react", label: "React", icon: "i-simple-icons-react" },
  { value: "vue", label: "Vue", icon: "i-simple-icons-vuedotjs" },
  { value: "svelte", label: "Svelte", icon: "i-simple-icons-svelte" },
  { value: "angular", label: "Angular", icon: "i-simple-icons-angular" },
  { value: "solid", label: "Solid", icon: "i-simple-icons-solid" },
  { value: "astro", label: "Astro", icon: "i-simple-icons-astro" },
  { value: "vanilla", label: "Vanilla", icon: "i-simple-icons-javascript" },
];
