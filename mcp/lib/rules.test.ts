// @vitest-environment node
import { describe, expect, it } from "vitest";
import { AUTOMATED_CHECKS, CHECK_KINDS, parseChecks } from "./rules";
import type { CheckKind } from "./types";

describe("parseChecks", () => {
  // Every Check the checklists use today. One the server doesn't know shows up
  // as a problem when it's built (see standard.test.ts).
  it.each<[string, CheckKind[], string[]]>([
    ["Review", ["review"], []],
    ["axe `color-contrast`", ["axe"], ["color-contrast"]],
    ["axe `target-size`", ["axe"], ["target-size"]],
    ["Keyboard", ["keyboard"], []],
    ["200% zoom", ["zoom"], []],
    ["Visual regression test", ["visual-regression"], []],
    ["Emulation", ["emulation"], []],
    ["Unit test", ["unit-test"], []],
    ["axe `button-name`, unit test", ["axe", "unit-test"], ["button-name"]],
    ["Screen reader", ["screen-reader"], []],
    ["Type check", ["type-check"], []],
    ["Stylelint", ["lint"], []],
    ["Contrast checker", ["contrast-checker"], []],
  ])("reads %j", (check, checks, axe) => {
    expect(parseChecks(check)).toEqual({ checks, axe, unknown: [] });
  });

  it("reads several axe rules, and names each kind once", () => {
    expect(parseChecks("axe `button-name`, axe `nested-interactive`, Unit test, unit test")).toEqual({
      checks: ["axe", "unit-test"],
      axe: ["button-name", "nested-interactive"],
      unknown: [],
    });
  });

  // An axe rule's name is in backticks, so a comma in them doesn't split the check.
  it("only splits on commas outside backticks", () => {
    expect(parseChecks("axe `a,b`, Review")).toEqual({ checks: ["axe", "review"], axe: ["a,b"], unknown: [] });
  });

  it.each([
    ["Vibes", ["Vibes"]],
    ["Unit test, Lighthouse", ["Lighthouse"]],
    // An axe check names its rule.
    ["axe", ["axe"]],
  ])("reports what it doesn't know in %j", (check, unknown) => {
    expect(parseChecks(check).unknown).toEqual(unknown);
  });

  it("reads an empty check as no checks", () => {
    expect(parseChecks("")).toEqual({ checks: [], axe: [], unknown: [] });
  });
});

describe("CHECK_KINDS", () => {
  it("lists every kind once, the automated ones included", () => {
    expect(new Set(CHECK_KINDS).size).toBe(CHECK_KINDS.length);
    expect(CHECK_KINDS).toEqual(expect.arrayContaining(AUTOMATED_CHECKS));
  });
});
