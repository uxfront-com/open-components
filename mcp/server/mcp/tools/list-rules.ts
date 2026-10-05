import names from "#standard/names";
import { z } from "zod";
import { CHECK_KINDS, LAYERS, LEVELS, SCOPES } from "../../../lib/rules";
import { suggest } from "../../../lib/suggest";

export default defineMcpTool({
  description: `Lists checklist rules as records, filtered by component, ID, scope, layer, level or check. Each rule has a stable ID to cite in reviews and commits, its level (must or should), its scope, its requirement, how to check it (like a unit test, a review or axe's button-name rule) and a link to it.

WHEN TO USE: to review code rule by rule, to get only the rules that apply to a task, to look rules up by ID, or to find the ones a tool can check. Pass scope ["component", "both"] to build or review a component, and ["usage", "both"] to review a screen that uses it.
WHEN NOT TO USE: for a component's API, DOM contract and tokens, use get-contract, which has every rule too.

A component meets the standard when it meets every must rule. Each should rule is expected unless there's a good reason not to follow it.`,
  annotations: READ_ONLY,
  inputSchema: {
    component: z.enum(names.contracts).optional().describe("The component or foundation, like button or design-tokens."),
    ids: z.array(z.string().max(100)).max(100).optional().describe('The IDs of the rules to look up, like ["button/keep-focus"].'),
    scope: z
      .array(z.enum(SCOPES))
      .optional()
      .describe(
        "Who meets the rule: component (the component itself), usage (the code that uses it) or both. Rules without a scope, like the Design Tokens', match any scope.",
      ),
    layer: z.array(z.enum(LAYERS)).optional().describe("ui (how it looks), ux (user experience), dx (developer experience) or ax (agentic experience)."),
    level: z.array(z.enum(LEVELS)).optional(),
    check: z.array(z.enum(CHECK_KINDS)).optional().describe("How the rule is checked."),
    automated: z
      .boolean()
      .optional()
      .describe(
        "true for the rules tools check all of (unit tests, axe, a type check, a linter or a visual regression test), false for the ones a person checks, at least in part.",
      ),
  },
  inputExamples: [
    { component: "button", scope: ["component", "both"] },
    { component: "button", scope: ["usage", "both"], level: ["must"] },
    { ids: ["button/keep-focus"] },
    { check: ["axe"] },
  ],
  outputSchema: {
    total: z.number(),
    rules: z.array(
      z.object({
        id: z.string(),
        component: z.string(),
        layer: z.enum(LAYERS).optional(),
        level: z.enum(LEVELS),
        scope: z.enum(SCOPES).optional(),
        requirement: z.string(),
        check: z.string(),
        checks: z.array(z.enum(CHECK_KINDS)),
        axe: z.array(z.string()).describe("The axe rules that check it."),
        automated: z.boolean().describe("Whether tools check all of it."),
        url: z.string(),
      }),
    ),
    unknown: z
      .array(z.object({ id: z.string(), suggestions: z.array(z.string()) }))
      .optional()
      .describe("The IDs asked for that no rule has, with the ones that might have been meant."),
  },
  handler: async ({ component, automated, ...lists }) => {
    const { rules } = await useStandard();
    // An empty list filters nothing, as with get-page's sections: some clients
    // send every optional field.
    const some = <T>(list?: T[]) => (list?.length ? list : undefined);
    const [ids, scope, layer, level, check] = [some(lists.ids), some(lists.scope), some(lists.layer), some(lists.level), some(lists.check)];

    // Suggestions for the first few IDs no rule has, which is all a typo needs.
    const unknown = [...new Set(ids?.filter((id) => !rules.some((rule) => rule.id === id)))].map((id, i) => ({
      id,
      suggestions: i < 5 ? suggest(id, rules.map((rule) => rule.id)) : [],
    }));
    if (unknown.length && unknown.length === new Set(ids).size) {
      const described = unknown.map(({ id, suggestions }) => (suggestions.length ? `${id} (did you mean ${suggestions.join(" or ")}?)` : id));
      throw createError({
        statusCode: 404,
        message: `No rule has the ID ${described.join(", ")}. IDs look like button/keep-focus or tokens/token-paths, and list-rules without ids lists them all.`,
      });
    }

    const found = rules.filter(
      (rule) =>
        (!component || rule.component === component) &&
        (!ids || ids.includes(rule.id)) &&
        (!scope || !rule.scope || scope.includes(rule.scope)) &&
        (!layer || (rule.layer && layer.includes(rule.layer))) &&
        (!level || level.includes(rule.level)) &&
        (!check || rule.checks.some((kind) => check.includes(kind))) &&
        (automated === undefined || rule.automated === automated),
    );
    return { structuredContent: { total: found.length, rules: found, ...(unknown.length ? { unknown } : {}) } };
  },
});
