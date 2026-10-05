import { z } from "zod";

export default defineMcpTool({
  description: `Lists what the Open Components standard covers: the components that have shipped (like Button), the foundations every component follows (like Design Tokens), and the components planned on the Roadmap.

WHEN TO USE: to check whether a component has a standard yet, to get the name the other tools take for it, or to see what's planned.
WHEN NOT TO USE: if you already know the component, call get-contract directly. To find a topic in the docs, use search-docs.

Shipped entries come with their page, their contract and how many rules they have. Planned ones have no page, contract or rules yet: hold them to the three layers and Design Tokens, following the Button's structure, as the build-component prompt does.`,
  annotations: READ_ONLY,
  inputSchema: {
    status: z.enum(["shipped", "planned", "all"]).default("all").describe("Which components to list."),
  },
  inputExamples: [{}, { status: "planned" }],
  outputSchema: {
    total: z.number(),
    components: z.array(
      z.object({
        key: z.string().describe("The name the other tools take, like button."),
        title: z.string(),
        kind: z.enum(["component", "foundation"]),
        status: z.enum(["shipped", "planned"]),
        group: z.string().optional().describe("Its group on the Roadmap."),
        summary: z.string(),
        url: z.string().optional(),
        contractUrl: z.string().optional(),
        rules: z.object({ total: z.number(), must: z.number(), should: z.number() }).optional(),
        reference: z.array(z.string()).optional().describe("The files of its reference implementation."),
      }),
    ),
  },
  handler: async ({ status }) => {
    const standard = await useStandard();
    const components = standard.components.filter((component) => status === "all" || component.status === status);
    return { structuredContent: { total: components.length, components } };
  },
});
