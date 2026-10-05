// @vitest-environment node
import { describe, expect, it } from "vitest";
import { FRAMEWORKS } from "../../app/data/frameworks";
import { buildStandard } from "./standard";
import { suggest } from "./suggest";

const { standard } = buildStandard({ root: process.cwd(), site: "https://opencomponents.dev", frameworks: FRAMEWORKS });
const IDS = standard.rules.map((rule) => rule.id);

describe("suggest", () => {
  it.each([
    // An ID without its component.
    ["keep-focus", "button/keep-focus"],
    // A rule that shares a word with it, before one a typo away.
    ["button/type", "button/explicit-type"],
    ["button/keep-focused", "button/keep-focus"],
    ["button/native", "button/native-element"],
    ["tokens/token-path", "tokens/token-paths"],
    // A prefix no rule has, like the page's name rather than the rules' prefix.
    ["design-tokens/token-paths", "tokens/token-paths"],
    // A typo.
    ["button/lodaing", "button/loading"],
    ["BUTTON/KEEP-FOCUS", "button/keep-focus"],
  ])("suggests %s → %s first", (id, expected) => {
    expect(suggest(id, IDS)[0]).toBe(expected);
  });

  it("suggests the rules about what the ID names", () => {
    expect(suggest("button/disabled", IDS)).toEqual(expect.arrayContaining(["button/disabled-inert", "button/explain-disabled"]));
  });

  it("only suggests rules of the component the ID names", () => {
    expect(suggest("tokens/keep-focus", IDS)).toEqual([]);
    expect(suggest("button/token-paths", IDS)).not.toContain("tokens/token-paths");
  });

  it.each([["foo"], ["x".repeat(100)], ["keyboard/arrow-keys"]])("suggests nothing for %s, which is nowhere near any", (id) => {
    expect(suggest(id, IDS)).toEqual([]);
  });

  it("suggests three at most", () => {
    expect(suggest("button/focus", IDS).length).toBeLessThanOrEqual(3);
  });

  // list-rules takes up to 100 IDs of up to 100 characters, and a Worker gets
  // 10 ms of CPU per request on the Free plan.
  it("stays fast on long IDs that are nowhere near the rules", () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) suggest(`button/${"x".repeat(93)}`, IDS);
    expect(performance.now() - start).toBeLessThan(10);
  });
});
