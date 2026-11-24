import vue from "@uxfront/oxlint-config/vue";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [vue],
  // oxlint reads env and ignorePatterns only from the root config, not through extends.
  env: vue.env,
  ignorePatterns: vue.ignorePatterns,
  rules: {
    // Baseline for 0.2.0: the rules it adds that fail here, each fixed in its own commit.
    "typescript/no-non-null-assertion": "off",
    "quality/no-unknown-returns": "off",
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
      // The reference implementations are browser code, where `instanceof` is how you tell
      // an element's kind, like an HTMLInputElement among a form's controls, and narrow it.
      files: ["app/reference/**"],
      rules: {
        "@nkzw/no-instanceof": "off",
        // A reference component warns in the console when it's used in a way that breaks a
        // rule, like a Button with no accessible name, and its tests check those warnings.
        "no-console": "off",
      },
    },
    {
      // Tests pass a component any attributes, the way a page can, which Vue's h() takes
      // as Record<string, unknown> too, and read parsed JSON before checking what it holds.
      files: ["**/*.test.ts"],
      rules: {
        "quality/no-unsafe-dictionary-type": "off",
        // A test's helpers sit in the describe block that uses them, next to the tests
        // they serve, and a test runs once, so there's nothing to save by moving them out.
        "unicorn/consistent-function-scoping": "off",
      },
    },
    {
      // Command-line scripts, whose output is their report.
      files: ["scripts/**"],
      rules: {
        "no-console": "off",
      },
    },
    {
      // It renders the sidebar in place of Nuxt UI's UContentNavigation and keeps its code
      // in step with the original (AGENTS.md, "Things that change together"), whose theme
      // line spreads `appConfig.ui?.contentNavigation || {}`.
      files: ["app/components/docs/DocsNavigation.vue"],
      rules: {
        "unicorn/no-useless-fallback-in-spread": "off",
        // tv() loses the theme's types once the app config is spread into it, so its
        // result is cast through unknown to the slot functions DocsNavigationList.vue takes.
        "quality/no-chained-type-assertions": "off",
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
