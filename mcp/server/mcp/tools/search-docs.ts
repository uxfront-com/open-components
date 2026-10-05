import names from "#standard/names";
import { z } from "zod";

export default defineMcpTool({
  description: `Searches the whole standard, every section of every page and every checklist rule, and returns the best matches: where each one is, a short excerpt, and for rules, their ID, level and scope.

WHEN TO USE: to find where a topic is covered when you don't know the page or the section, like "focus after delete", "spinner", "aria-pressed" or "dark mode". Then read a section with get-page, or rules with list-rules.
WHEN NOT TO USE: to list a component's rules, use list-rules. To see which components there are, use list-components.

Search for a few specific words rather than a whole question.`,
  annotations: READ_ONLY,
  inputSchema: {
    query: z.string().min(2).max(200).describe('A few words, like "focus after delete" or "aria-pressed".'),
    component: z.enum(names.pages).optional().describe("Only search this page and its rules, like button or design-tokens."),
    type: z.enum(["section", "rule"]).optional().describe("Only search sections, or only rules."),
    limit: z.number().int().min(1).max(20).default(8).describe("How many results to return, at most."),
  },
  inputExamples: [{ query: "focus after delete" }, { query: "spinner", component: "button" }, { query: "dark mode", type: "section" }],
  outputSchema: {
    query: z.string(),
    total: z.number().describe("How many sections and rules match, of which the best come first."),
    results: z.array(
      z.object({
        type: z.enum(["section", "rule"]),
        title: z.string().describe("The section's heading, or the rule's ID."),
        trail: z.string().describe("Where it is, page first."),
        path: z.string().describe("The page, for get-page."),
        anchor: z
          .string()
          .optional()
          .describe("The section, for get-page's sections. A rule's is its checklist table: the sections that explain it are results of their own."),
        url: z.string(),
        excerpt: z.string(),
        rule: z.object({ id: z.string(), level: z.string(), scope: z.string().optional() }).optional(),
      }),
    ),
  },
  handler: async ({ query, component, type, limit }) => {
    const search = await useSearch();
    return { structuredContent: { query, ...search(query, { component, type, limit }) } };
  },
});
