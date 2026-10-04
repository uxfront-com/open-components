import names from "#standard/names";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { buildText, call, findComponent, frameworkName, frameworkValue, plural } from "../../../lib/prompts";

export default defineMcpPrompt({
  description:
    "Build a component that meets the Open Components standard, in your framework: from its contract, its reference implementation and its tests if it has shipped, or following the Button's structure if it's planned.",
  inputSchema: {
    component: completable(
      z.string().max(100).describe("The component, like button, or one on the Roadmap, like tabs."),
      (value = "") => names.buildable.filter((name) => name.startsWith(value.trim().toLowerCase().replace(/[\s_]+/g, "-"))),
    ),
    framework: completable(
      z.string().max(100).optional().describe(`Your framework: ${names.frameworks.join(", ")}.`),
      (value = "") => names.frameworks.filter((name) => name.startsWith(value.toLowerCase())),
    ),
  },
  handler: async ({ component: key, framework }) => {
    const standard = await useStandard();
    const component = findComponent(standard, key);
    if (component?.kind === "foundation") {
      throw new McpError(
        ErrorCode.InvalidParams,
        `${component.title} is a foundation every component follows, rather than a component to build. Use the review-component prompt to review your code against it${component.key === "design-tokens" ? ", or adopt-token-paths to move your variables over to it" : ""}.`,
      );
    }
    if (!component) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `${key} isn't a component the standard covers or plans. The ones it does: ${names.buildable.join(", ")}.`,
      );
    }
    const value = framework?.trim() ? frameworkValue(standard, framework) : undefined;
    if (framework?.trim() && !value) {
      throw new McpError(ErrorCode.InvalidParams, `${framework} isn't one of the frameworks: ${names.frameworks.join(", ")}.`);
    }
    const name = value && frameworkName(standard, value);
    const api = value
      ? `${call("get-page", { path: "button", sections: ["Developer Experience (DX)"], framework: value })}: how the Button's API looks in ${name}, which every component's follows.`
      : undefined;

    if (component.status === "planned") {
      const steps = [
        component.group && `${call("get-page", { path: "roadmap", sections: [component.group] })}: what the Roadmap says ${plural(component.title)} are for.`,
        `${call("get-page", { path: "introduction" })}: the three layers every component is held to.`,
        `${call("get-contract", { component: "button" })}: what a contract holds, and the rules a shipped component meets. ${call("get-contract", { component: "design-tokens" })} covers naming its variables.`,
        `${call("get-reference-implementation", { component: "button" })}: how a component and its tests meet those rules.`,
        api,
      ].filter(Boolean);
      return [
        buildText(standard, component, value),
        ["Rather than reading llms-full.txt, use the Open Components MCP server:", ...steps.map((step, i) => `${i + 1}. ${step}`)].join("\n"),
      ].join("\n\n");
    }

    const reference = standard.references.find((candidate) => candidate.component === component.key);
    const steps = [
      `${call("get-contract", { component: component.key })}: its API, its DOM contract, its tokens and every rule, with its scope.`,
      reference &&
        `${call("get-reference-implementation", { component: component.key })}: a tested ${reference.framework === "vue" ? "Vue 3 " : ""}${component.title}, and the tests to port.`,
      `${call("get-page", { path: component.key, sections: ["Developer Experience (DX)"], ...(value && { framework: value }) })}: how its API looks${name ? ` in ${name}` : ""}. Read other sections, like "Every state", when a rule needs its reasoning.`,
    ].filter(Boolean);
    return [
      buildText(standard, component, value),
      [
        "Rather than reading the whole page, use the Open Components MCP server:",
        ...steps.map((step, i) => `${i + 1}. ${step}`),
        `Then check your work against the contract's rules with a component or both scope. ${call("list-rules", { component: component.key, scope: ["component", "both"] })} returns just those, as records, if you'd rather have them on their own.`,
      ].join("\n"),
    ].join("\n\n");
  },
});

