import { defineCollection, defineContentConfig, z } from "@nuxt/content";

// Nuxt Content merges this with the collections Docus defines (`docs`, for
// content/docs/), so this only adds the changelog: one entry per file in
// content/changelog/, listed at /changelog and served at /changelog/<file name>.
export default defineContentConfig({
  collections: {
    changelog: defineCollection({
      type: "page",
      source: "changelog/*.md",
      schema: z.object({
        // The day it was published, as in 2026-09-30. Entries are listed newest first.
        date: z.string(),
        // The badge beside the date: the docs section it's in, like Components.
        category: z.string(),
        // Where to read more, usually the page it adds or changes.
        link: z.object({ label: z.string(), to: z.string() }).optional(),
      }),
    }),
  },
});
