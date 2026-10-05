import type { CheckKind } from "./types";

// The checks the checklists name, as written there (lowercased).
const KINDS: Record<string, CheckKind> = {
  "unit test": "unit-test",
  "type check": "type-check",
  stylelint: "lint",
  "visual regression test": "visual-regression",
  keyboard: "keyboard",
  "screen reader": "screen-reader",
  emulation: "emulation",
  "200% zoom": "zoom",
  "contrast checker": "contrast-checker",
  review: "review",
};

// The values a rule's level, scope and layer can take, as the checklists write
// them (lowercased). Components' rules have a scope, while conventions' don't.
export const LEVELS = ["must", "should"] as const;
export const SCOPES = ["component", "usage", "both"] as const;
export const LAYERS = ["ui", "ux", "dx", "ax"] as const;

export const CHECK_KINDS = ["axe", ...new Set(Object.values(KINDS))] as [CheckKind, ...CheckKind[]];

/** Checks that a tool runs, rather than a person. */
export const AUTOMATED_CHECKS: CheckKind[] = ["unit-test", "axe", "type-check", "lint", "visual-regression"];

/**
 * Reads a rule's Check cell, like "axe `button-name`, unit test", into the kinds
 * of check it names and the axe rules among them. Anything else is `unknown`.
 */
export function parseChecks(check: string): { checks: CheckKind[]; axe: string[]; unknown: string[] } {
  const checks: CheckKind[] = [];
  const axe: string[] = [];
  const unknown: string[] = [];
  for (const part of check.split(/,(?=(?:[^`]*`[^`]*`)*[^`]*$)/)) {
    const value = part.trim().toLowerCase();
    const rule = value.match(/^axe `([^`]+)`$/)?.[1];
    const kind = rule ? "axe" : KINDS[value];
    if (rule) axe.push(rule);
    if (kind && !checks.includes(kind)) checks.push(kind);
    else if (!kind && value) unknown.push(part.trim());
  }
  return { checks, axe, unknown };
}
