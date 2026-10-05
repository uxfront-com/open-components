import names from "#standard/names";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { call, codeToReview, findComponent, reviewUsageText } from "../../../lib/prompts";

export default defineMcpPrompt({
  description:
    "Review how a screen uses a component, against the rules of its contract that the code using it meets, like keeping one primary button per view.",
  inputSchema: {
    component: completable(
      z.string().max(100).describe("The component, like button."),
      (value = "") => names.usage.filter((name) => name.startsWith(value.trim().toLowerCase().replace(/[\s_]+/g, "-"))),
    ),
    // Clients like VS Code can pass a whole file, or the selection, as an argument.
    screen: z
      .string()
      .max(200000)
      .optional()
      .describe('The screen to review, like "our checkout page", or its code. Defaults to "our app".'),
  },
  handler: async ({ component: key, screen }) => {
    const standard = await useStandard();
    const component = findComponent(standard, key);
    if (!component || !names.usage.includes(component.key)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `${key} has no rules for the code that uses it. The components that do: ${names.usage.join(", ")}.`,
      );
    }
    // A name, like "our checkout page", goes in the sentence, and code, like a
    // selection, below it.
    const value = screen?.trim() ?? "";
    const named = value && !value.includes("\n") && value.length <= 300 && !/[<>{};=]/.test(value);
    return [
      reviewUsageText(standard, component, named ? value : "our app"),
      ...(value && !named ? [codeToReview(value)] : []),
      `With the Open Components MCP server, ${call("list-rules", { component: component.key, scope: ["usage", "both"] })} returns the rules to report on, as records.`,
    ].join("\n\n");
  },
});
