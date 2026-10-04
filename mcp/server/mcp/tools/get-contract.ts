import names from "#standard/names";
import { z } from "zod";

export default defineMcpTool({
  description: `Returns the contract of a component or a foundation, as YAML: its API (props, slots and events), its DOM contract (element, role, states, keyboard and parts), its tokens, and every rule in its checklist, each with a stable ID (like button/keep-focus), a level (must or should), a scope (component, usage or both) and how to check it. It holds every requirement in a fraction of the page's length, and it's the same file as https://opencomponents.dev/raw/docs/<path>.yaml.

WHEN TO USE: first, before you build, review or explain a component or its tokens.
WHEN NOT TO USE: for some of the rules only (by scope, layer, level or check), use list-rules. For the reasoning or the examples behind a rule, use get-page with its sections.`,
  annotations: READ_ONLY,
  inputSchema: {
    component: z.enum(names.contracts).describe("The component or foundation, like button or design-tokens."),
  },
  inputExamples: [{ component: "button" }, { component: "design-tokens" }],
  handler: async ({ component }) => {
    const standard = await useStandard();
    const page = standard.pages.find((candidate) => candidate.key === component);
    if (!page?.contract) {
      throw createError({ statusCode: 404, message: `There's no contract for ${component}. list-components lists the ones there are.` });
    }
    return page.contract.yaml;
  },
});
