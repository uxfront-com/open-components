import { adoptTokenPathsText, call } from "../../../lib/prompts";

export default defineMcpPrompt({
  description:
    "Rename your CSS variables to Open Components token paths, like --color--primary, then add the Stylelint rule that keeps them that way.",
  handler: async () => {
    const standard = await useStandard();
    return [
      adoptTokenPathsText(standard),
      [
        `With the Open Components MCP server, ${call("get-contract", { component: "design-tokens" })} returns the convention and its rules,`,
        `and ${call("get-page", { path: "design-tokens", sections: ["Lint"] })} the Stylelint rule.`,
      ].join(" "),
    ].join("\n\n");
  },
});
