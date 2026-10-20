import { join } from "node:path";
import type { H3Event } from "h3";
import { readPage } from "./raw";

// The fields read below. Nitro's types don't see the collections Docus defines.
interface DocsPage {
  stem: string;
  extension: string;
  title: string;
  description: string;
}

/**
 * Finds the docs page served at `path`, like `/docs/components/button`, and reads
 * its source file. The site is static: this runs on `pnpm dev` and when the pages
 * are prerendered, both from the project root. A split page's Overview, like
 * `/docs/components/button`, reads as the whole page, with its parts joined back
 * in (see joinPage in raw.ts), while each part reads as itself.
 *
 * It's in server/lib rather than server/utils, which Nitro auto-imports: the app's
 * tsconfig type-checks those too, and sees Nuxt Content's client queryCollection().
 */
export async function readDocsPage(event: H3Event, path: string) {
  const page = (await queryCollection(event, "docs" as never)
    .path(path)
    .first()) as DocsPage | null;
  if (!page) return;

  const source = readPage(join(process.cwd(), "content"), `${page.stem}.${page.extension}`);
  return { page, source };
}
