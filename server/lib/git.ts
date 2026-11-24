import { execFileSync } from "node:child_process";

/**
 * The day each file under `paths` was last changed, like `2026-11-14`, by its
 * last commit (the committer's date, which is when it reached the branch), keyed
 * by its path from the repository's root, like
 * `content/docs/2.foundations/1.design-tokens.md`.
 *
 * The day is the commit's in UTC, not in the committer's time zone. A sitemap
 * reads a bare day as midnight UTC, so a commit made at 00:03 +02:00 on the 21st,
 * dated by its local day, would claim a change two hours before it happened, and
 * `pnpm check-seo` fails a `<lastmod>` in the future.
 *
 * The site is static, so this runs when the sitemap is prerendered, from the
 * project root, or from `cwd`. It needs the repository's history: in a shallow
 * clone every file dates from the one commit there is, which
 * scripts/fetch-history.mjs prevents before `pnpm build`.
 */
export function lastModified(paths: Array<string>, cwd?: string): Map<string, string> {
  // %ct is the committer's time in seconds since the epoch, which has no zone.
  const log = execFileSync("git", ["log", "--format=%x00%ct", "--name-only", "--", ...paths], { cwd, encoding: "utf8" });
  const dates = new Map<string, string>();
  // Newest commit first, so a file's first appearance is its last change.
  for (const commit of log.split("\0").slice(1)) {
    const [seconds, ...files] = commit.trim().split("\n");
    const date = new Date(Number(seconds) * 1000).toISOString().slice(0, 10);
    for (const file of files) if (file && !dates.has(file)) dates.set(file, date);
  }
  return dates;
}
