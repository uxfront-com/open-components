import base from "@uxfront/oxfmt-config";
import { defineConfig } from "oxfmt";

export default defineConfig({
  ...base,
  ignorePatterns: [
    ...(base.ignorePatterns ?? []),
    // The docs are MDC, where formatting moves the content of nested blocks and rewrites
    // the example code on the pages, and the plugin's skills ship live from `main`.
    "**/*.md",
    // The component pages show these files byte for byte: `pnpm check-reference` fails
    // when a page and its file differ.
    "app/reference/**",
    // Vendored schemas, never edited by hand.
    "plugins/schemas/**",
  ],
});
