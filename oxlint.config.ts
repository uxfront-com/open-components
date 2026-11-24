import vue from "@uxfront/oxlint-config/vue";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [vue],
  rules: {
    // Destructuring a key beside a rest element is how the code copies an object without
    // that key, like `({ component, ...contract }) => contract`, so the key is unused on
    // purpose. Setting an option drops oxlint's defaults, so the `^_` patterns restate them.
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
  },
  overrides: [
    {
      // It renders the sidebar in place of Nuxt UI's UContentNavigation and keeps its code
      // in step with the original (AGENTS.md, "Things that change together"), whose theme
      // line spreads `appConfig.ui?.contentNavigation || {}`.
      files: ["app/components/docs/DocsNavigation.vue"],
      rules: {
        "unicorn/no-useless-fallback-in-spread": "off",
      },
    },
    {
      // ACCENTS matches combining marks on their own, after NFD has split them off their
      // letters, so the class holds combining marks on purpose, written as escapes.
      files: ["app/reference/combobox/Combobox.vue"],
      rules: {
        "no-misleading-character-class": "off",
      },
    },
  ],
});
