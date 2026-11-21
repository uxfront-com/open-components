// @vitest-environment node
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { lastModified } from "./git";

let repo: string;

// Commits `file` at `date`, an ISO 8601 time with the committer's zone, in a
// repository that ignores the machine's Git config.
function commit(file: string, date: string) {
  writeFileSync(join(repo, file), date);
  const env = {
    ...process.env,
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_AUTHOR_DATE: date,
    GIT_COMMITTER_DATE: date,
  };
  const git = (...args: string[]) => execFileSync("git", ["-c", "user.name=Test", "-c", "user.email=test@example.com", ...args], { cwd: repo, env });
  git("add", file);
  git("commit", "--quiet", "--no-gpg-sign", "-m", `change ${file}`);
}

beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), "git-test-"));
  execFileSync("git", ["init", "--quiet"], { cwd: repo, env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" } });
});

afterEach(() => {
  rmSync(repo, { recursive: true, force: true });
});

describe("lastModified", () => {
  it("dates a commit made just after local midnight by its day in UTC", () => {
    // 00:03 on the 21st in UTC+2 is 22:03 on the 20th in UTC.
    commit("page.md", "2026-11-21T00:03:00+02:00");
    const date = lastModified(["."], repo).get("page.md")!;

    expect(date).toBe("2026-11-20");
    // A sitemap reads the day as midnight UTC, which must not be after the commit.
    expect(Date.parse(date)).toBeLessThanOrEqual(Date.parse("2026-11-21T00:03:00+02:00"));
  });

  it("dates a commit made just before local midnight, west of UTC, by its day in UTC", () => {
    // 23:30 on the 20th in UTC-5 is 04:30 on the 21st in UTC.
    commit("page.md", "2026-11-20T23:30:00-05:00");

    expect(lastModified(["."], repo).get("page.md")).toBe("2026-11-21");
  });

  it("dates each file by its last commit", () => {
    commit("a.md", "2026-01-01T12:00:00Z");
    commit("b.md", "2026-02-01T12:00:00Z");
    commit("a.md", "2026-03-01T12:00:00Z");

    expect(Object.fromEntries(lastModified(["."], repo))).toEqual({ "a.md": "2026-03-01", "b.md": "2026-02-01" });
  });

  it("only dates the files under the paths it is given", () => {
    commit("a.md", "2026-01-01T12:00:00Z");
    commit("b.md", "2026-02-01T12:00:00Z");

    expect([...lastModified(["a.md"], repo).keys()]).toEqual(["a.md"]);
  });
});
