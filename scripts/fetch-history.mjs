// Runs before `nuxt generate` (`pnpm build`): fetches the repository's full
// history when the checkout is shallow, since the sitemap dates each page by the
// last commit that changed it (server/lib/git.ts), and in a shallow clone every
// page would date from the one commit there is. Says which it found, so a build
// log shows whether the clone was shallow.
import { execFileSync } from "node:child_process";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

const shallow = () => git("rev-parse", "--is-shallow-repository") === "true";

if (shallow()) {
  console.log("fetch-history: the clone is shallow, so fetching its full history for the sitemap's dates.");
  let reason = "";
  try {
    git("fetch", "--unshallow", "--quiet");
  } catch (error) {
    reason = `\n${error.message}`;
  }
  // The site still builds, with every page dated by the latest commit.
  if (shallow()) console.warn(`fetch-history: the clone is still shallow, so the sitemap dates every page by the latest commit.${reason}`);
} else {
  console.log("fetch-history: the clone has its full history.");
}
