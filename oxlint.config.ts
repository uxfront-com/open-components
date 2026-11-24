import vue from "@uxfront/oxlint-config/vue";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [vue],
  // oxlint reads env and ignorePatterns only from the root config, not through extends.
  env: vue.env,
  ignorePatterns: vue.ignorePatterns,
  rules: {
    // Baseline for 0.2.0: the rules it adds that fail here, each fixed in its own commit.
    "curly": "off",
    "@typescript-eslint/array-type": "off",
    "typescript/no-non-null-assertion": "off",
    "quality/no-unknown-returns": "off",
    "unicorn/consistent-function-scoping": "off",
    "unicorn/prefer-string-replace-all": "off",
    "quality/no-known-value-widening": "off",
    "no-console": "off",
    "import/consistent-type-specifier-style": "off",
    "unicorn/prefer-number-properties": "off",
    "quality/no-unsafe-dictionary-type": "off",
    "quality/no-array-filter-map": "off",
    "no-promise-executor-return": "off",
    "quality/no-chained-type-assertions": "off",
    "@nkzw/no-instanceof": "off",
    "quality/no-conditional-empty-object-spread": "off",
    "quality/no-object-parameters": "off",
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
