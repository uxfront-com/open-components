// Runs before `nuxt generate` (`pnpm build`): fetches the repository's full
// history when the checkout is shallow, since the sitemap dates each page by the
// last commit that changed it (server/lib/git.ts), and in a shallow clone every
// page would date from the one commit there is. Says which it found, so a build
// log shows whether the clone was shallow.
import { execFileSync } from "node:child_process";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

if (git("rev-parse", "--is-shallow-repository") === "true") {
  console.log("fetch-history: the clone is shallow, so fetching its full history for the sitemap's dates.");
  try {
    git("fetch", "--unshallow", "--quiet");
  } catch (error) {
    // The site still builds, with every page dated by the latest commit.
    console.warn(`fetch-history: couldn't fetch the history, so the sitemap dates every page by the latest commit.\n${error.message}`);
  }
} else {
  console.log("fetch-history: the clone has its full history.");
}
