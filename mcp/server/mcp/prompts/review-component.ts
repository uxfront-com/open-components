import names from "#standard/names";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { call, codeToReview, findComponent, reviewText } from "../../../lib/prompts";

export default defineMcpPrompt({
  description:
    "Review a component against its Open Components contract, or your styles against a foundation like Design Tokens: pass or fail for every rule, with its ID and the evidence, then fix the failures.",
  inputSchema: {
    component: completable(
      z.string().max(100).describe("The component or foundation, like button or design-tokens."),
      (value = "") => names.contracts.filter((name) => name.startsWith(value.trim().toLowerCase().replace(/[\s_]+/g, "-"))),
    ),
    // Clients like VS Code can pass a whole file, or the selection, as an argument.
    code: z.string().max(200000).optional().describe("The code to review, or the files or folder it's in, like src/components/Button.tsx."),
  },
  handler: async ({ component: key, code }) => {
    const standard = await useStandard();
    const component = findComponent(standard, key);
    if (component?.status !== "shipped") {
      throw new McpError(
        ErrorCode.InvalidParams,
        `${key} has no contract to review against. The ones there are: ${names.contracts.join(", ")}.`,
      );
    }
    const convention = component.kind === "foundation";
    return [
      reviewText(standard, component),
      ...(code?.trim() ? [codeToReview(code)] : []),
      [
        `With the Open Components MCP server, ${call("get-contract", { component: component.key })} returns the contract, with the ${convention ? "convention" : "API, states, parts and tokens"} its rules refer to,`,
        `and ${call("list-rules", { component: component.key, ...(!convention && { scope: ["component", "both"] }) })} just the rules to report on, as records.`,
        `For a rule you're unsure of, ${call("search-docs", { query: "<its requirement>", component: component.key, type: "section" })} finds the section that explains it, which get-page reads.`,
      ].join(" "),
    ].join("\n\n");
  },
});
