import names from "#standard/names";
import { z } from "zod";

export default defineMcpTool({
  description: `Returns a shipped component's reference implementation: a Vue 3 component that meets every rule in its checklist, the tests that prove it, the helpers it shares with other components and its theme tokens. The live examples on the site run on this code.

WHEN TO USE: to build a component that meets the standard, in Vue or by porting it and its tests to another framework, or to see how a rule is met in code.
WHEN NOT TO USE: for the requirements, use get-contract. For how the component is used in another framework, use get-page with that framework.`,
  annotations: READ_ONLY,
  inputSchema: {
    component: z.enum(names.references).describe("A component with a reference implementation, like button."),
    files: z
      .array(z.string().max(100))
      .max(20)
      .optional()
      .describe('Only these files, like ["Button.vue"] or ["Button.test.ts"]. Leave it out for every file.'),
  },
  inputExamples: [{ component: "button" }, { component: "button", files: ["Button.test.ts"] }],
  handler: async ({ component, files }) => {
    const standard = await useStandard();
    const reference = standard.references.find((candidate) => candidate.component === component);
    if (!reference) {
      throw createError({ statusCode: 404, message: `${component} has no reference implementation yet.` });
    }
    const all = reference.files.map((file) => file.name);
    // File names in any case, and an empty list for every file, as with get-page's sections.
    const wanted = files?.length ? files.map((name) => name.toLowerCase()) : undefined;
    const missing = files?.filter((name) => !all.some((file) => file.toLowerCase() === name.toLowerCase())) ?? [];
    if (missing.length) {
      throw createError({
        statusCode: 404,
        message: `The ${component} reference implementation has no ${missing.join(" or ")}. Its files are ${all.join(", ")}.`,
      });
    }

    const page = standard.pages.find((candidate) => candidate.key === component)!;
    const shown = reference.files.filter((file) => !wanted || wanted.includes(file.name.toLowerCase()));
    return [
      `# ${page.title}: reference implementation (${reference.framework === "vue" ? "Vue 3" : reference.framework})`,
      "",
      `Source: ${reference.url}`,
      `Files: ${all.join(", ")}${wanted ? ` (showing ${shown.map((file) => file.name).join(", ")})` : ""}`,
      "",
      reference.notes,
      ...shown.flatMap((file) => {
        // A fence longer than any run of backticks in the file.
        const fence = "`".repeat(Math.max(3, ...(file.content.match(/`+/g) ?? []).map((run) => run.length + 1)));
        return ["", `## ${file.name}`, "", `${fence}${file.lang}`, file.content.trimEnd(), fence];
      }),
      "",
    ].join("\n");
  },
});
