import { queryCollection } from "@nuxt/content/server";
import type { H3Event } from "h3";

// The fields read below. Nitro's types don't see the collections Docus defines.
interface DocsPage {
  path: string;
  seo?: { title?: string };
}

interface Llms {
  sections: { links?: { title: string; href: string }[] }[];
}

// nuxt-llms (which Docus installs) calls this hook as it writes llms.txt. Its own
// declaration isn't in this app's types, since the app doesn't depend on it.
declare module "nitropack/types" {
  interface NitroRuntimeHooks {
    "llms:generate": (event: H3Event, llms: Llms) => void | Promise<void>;
  }
}

/**
 * Titles llms.txt's links to docs pages by their `seo.title` where they have
 * one. Nuxt Content lists every docs page by its `title`, so the 68 layer pages
 * came out as four links, "User Interface (UI)" to "Agentic Experience (AX)",
 * over and over. Their `seo.title` names the component too, like
 * "Button: User Experience (UX)", as their Markdown copies do (rawPage in
 * server/lib/raw.ts).
 *
 * Nitro runs the app's own plugins after the modules', so Nuxt Content has
 * added its links by the time this runs.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("llms:generate", async (event, llms) => {
    const pages = (await queryCollection(event, "docs" as never).all()) as DocsPage[];
    const titles = new Map(pages.flatMap((page) => (page.seo?.title ? [[page.path, page.seo.title]] : [])));
    for (const link of llms.sections.flatMap((section) => section.links ?? [])) {
      const path = link.href.match(/^https?:\/\/[^/]+\/raw(\/docs\/.+)\.md$/)?.[1];
      const title = path && titles.get(path);
      if (title) link.title = title;
    }
  });
});
