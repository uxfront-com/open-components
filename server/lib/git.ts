import { execFileSync } from "node:child_process";

/**
 * The day each file under `paths` was last changed, like `2026-11-14`, by its
 * last commit (the committer's date, which is when it reached the branch), keyed
 * by its path from the repository's root, like
 * `content/docs/2.foundations/1.design-tokens.md`.
 *
 * The site is static, so this runs when the sitemap is prerendered, from the
 * project root. It needs the repository's history: in a shallow clone every file
 * dates from the one commit there is, which scripts/fetch-history.mjs prevents
 * before `pnpm build`.
 */
export function lastModified(paths: string[]): Map<string, string> {
  const log = execFileSync("git", ["log", "--format=%x00%cs", "--name-only", "--", ...paths], { encoding: "utf8" });
  const dates = new Map<string, string>();
  // Newest commit first, so a file's first appearance is its last change.
  for (const commit of log.split("\0").slice(1)) {
    const [date, ...files] = commit.trim().split("\n");
    for (const file of files) if (file && !dates.has(file)) dates.set(file, date!);
  }
  return dates;
}
