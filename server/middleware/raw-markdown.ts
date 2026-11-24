import { readFileSync } from "node:fs";
import { join } from "node:path";
import { queryCollection } from "@nuxt/content/server";
import { readDocsPage } from "../lib/docs";
import { rawPage, rawTitle } from "../lib/raw";

/**
 * Serves `/raw/<path>.md`, the markdown copy of a docs page or a blog post, from
 * its own source file. Nuxt Content's route rebuilds the markdown from the parsed
 * page and writes every table as HTML, unescaped: a `<button>` in a table cell
 * comes out as a tag, and the file doubles in length. Agents read these files (so
 * does "Copy page"), so they get the markdown as written: the title and
 * description, then the page without its frontmatter (see rawPage and rawTitle in
 * server/lib/raw.ts).
 *
 * Runs before Nuxt Content's route, which still answers for anything that isn't
 * a docs page or a post, like the changelog's entries.
 */
export default defineEventHandler(async (event) => {
  const match = event.path.match(/^\/raw(\/.+?)(?:\/index)?\.md$/);
  if (!match?.[1]) {
    return;
  }

  if (match[1].startsWith("/blog/")) {
    const post = await queryCollection(event, "blog").path(match[1]).first();
    if (!post) {
      return;
    }
    const source = readFileSync(join(process.cwd(), "content", `${post.stem}.${post.extension}`), "utf8");
    setHeader(event, "Content-Type", "text/markdown; charset=utf-8");
    return rawPage({ title: post.title, description: post.description }, source);
  }

  const docs = await readDocsPage(event, match[1]);
  if (!docs) {
    return;
  }

  setHeader(event, "Content-Type", "text/markdown; charset=utf-8");
  return rawPage({ title: rawTitle(docs.page), description: docs.page.description }, docs.source);
});
