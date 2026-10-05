import type { Component, Standard } from "./types";

/**
 * The prompts the MCP server offers, written the way the pages write theirs: the
 * Button's "#### Prompts" and the Design Tokens' "### Prompts". prompts.test.ts
 * checks that, for the components the pages show them for, these say exactly
 * what the pages say. The prompts in server/mcp/prompts/ then tell agents which
 * tools to call (with `call` below), since they don't need to read the whole page.
 */

/** A component by any name someone might give a prompt: its key, like `radio-group`, or its title, like "Radio Group". */
export function findComponent(standard: Standard, name: string): Component | undefined {
  const wanted = name.trim().toLowerCase();
  return standard.components.find(
    (component) => component.key === wanted.replace(/[\s_]+/g, "-") || component.title.toLowerCase() === wanted,
  );
}

/** "a Button", but "an Avatar". */
function article(title: string): string {
  return `${/^[aeiou]/i.test(title) ? "an" : "a"} ${title}`;
}

/** A component's or a convention's name in a sentence, like "buttons" or "radio groups". */
export function plural(title: string): string {
  const name = title.toLowerCase();
  if (name.endsWith("s")) return name;
  if (/(x|ch|sh)$/.test(name)) return `${name}es`;
  if (/[^aeiou]y$/.test(name)) return `${name.slice(0, -1)}ies`;
  return `${name}s`;
}

// The frameworks whose examples are written for one major version, which the
// pages' prompts name, as in "our Vue 3 design system".
const VERSIONS: Record<string, string> = { vue: "Vue 3", svelte: "Svelte 5" };

const raw = (standard: Standard, path: string, extension: "md" | "yaml") => `${standard.site}/raw${path}.${extension}`;

/** A framework as the prompts name it, like "Vue 3", from its value or its name. */
export function frameworkName(standard: Standard, framework: string): string | undefined {
  return VERSIONS[framework] ?? standard.frameworks.find((candidate) => candidate.value === framework)?.label;
}

/**
 * A framework's value, like `vue`, from what someone might pass a prompt: its
 * value or its name, in any case, with or without the version the prompts
 * name it with, as in "Vue 3".
 */
export function frameworkValue(standard: Standard, input: string): string | undefined {
  const wanted = input.trim().toLowerCase().replace(/\s*\d+$/, "");
  return standard.frameworks.find((framework) => framework.value === wanted || framework.label.toLowerCase() === wanted)?.value;
}

/** Building a component: a shipped one from its page, a planned one from the Button's structure, as the Roadmap says. */
export function buildText(standard: Standard, component: Component, framework?: string): string {
  const label = framework && frameworkName(standard, framework);
  const page = standard.pages.find((candidate) => candidate.key === component.key);
  if (component.status === "planned" || !page) {
    const what =
      framework === "vanilla"
        ? `Build ${article(component.title)} for our design system in plain HTML, CSS and JavaScript`
        : `Build ${article(component.title)} component for our ${label ? `${label} ` : ""}design system`;
    return [
      `${what} that meets the Open Components standard: ${standard.site}/llms-full.txt`,
      `There's no ${component.title} page yet, so follow the Button page's structure. Work through the UI, UX, DX and AX of ${plural(component.title)}, following the WAI-ARIA pattern for ${plural(component.title)} if there is one, then write a checklist with a stable ID for every rule, like ${component.key}/<rule>, and a test for each one.`,
    ].join("\n\n");
  }
  const scope = `Then check your work against every rule in its checklist with a Component or Both scope, and cite the rule ID for any rule you can't meet.`;
  if (framework === "vanilla") {
    return [
      `Build ${article(component.title)} for our design system in plain HTML, CSS and JavaScript that meets the Open Components ${component.title} standard: ${raw(standard, page.path, "md")}`,
      `Follow its DOM contract and its tokens. Port its tests and make them pass. ${scope}`,
    ].join("\n\n");
  }
  return [
    `Build ${article(component.title)} component for our ${label ? `${label} ` : ""}design system that meets the Open Components ${component.title} standard: ${raw(standard, page.path, "md")}`,
    `Follow its API, its DOM contract and its tokens. Port its tests and make them pass. ${scope}`,
  ].join("\n\n");
}

/** Reviewing a component against its contract, or code against a convention like the token paths. */
export function reviewText(standard: Standard, component: Component): string {
  const page = standard.pages.find((candidate) => candidate.key === component.key)!;
  if (page.contract?.kind === "convention") {
    const what = component.key === "design-tokens" ? "our theme and component styles" : "our code";
    const standardName = component.key === "design-tokens" ? "tokens" : component.title;
    return [
      `Review ${what} against the Open Components ${standardName} standard: ${raw(standard, page.path, "md")}`,
      `For each rule in its checklist, report pass or fail with the rule ID and the evidence from our code. Then fix the failures.`,
    ].join("\n\n");
  }
  return [
    `Review our ${component.title} against the Open Components ${component.title} contract: ${raw(standard, page.path, "yaml")}`,
    `For each rule with a component or both scope, report pass or fail with the rule ID and the evidence from our code. Then fix the failures.`,
  ].join("\n\n");
}

/** Reviewing how a screen uses a component, against the rules the screen meets. */
export function reviewUsageText(standard: Standard, component: Component, screen: string): string {
  const page = standard.pages.find((candidate) => candidate.key === component.key)!;
  return [
    `Review how ${screen} uses its ${plural(component.title)} against the Open Components ${component.title} contract: ${raw(standard, page.path, "yaml")}`,
    `For each rule with a usage or both scope, report pass or fail with the rule ID and the evidence from our code. Then fix the failures.`,
  ].join("\n\n");
}

/** Moving a codebase's CSS variables over to token paths, as the Design Tokens page puts it. */
export function adoptTokenPathsText(standard: Standard): string {
  const page = standard.pages.find((candidate) => candidate.key === "design-tokens")!;
  return [
    `Rename our CSS variables to follow the Open Components token paths: ${raw(standard, page.path, "md")}`,
    `List our token groups first, then rename every variable along with every var() that reads it, keeping the values as they are. Then add the Stylelint rule from the page, and fix anything it reports.`,
  ].join("\n\n");
}

/**
 * What a prompt's argument names for review: a path stays in the sentence, while
 * code, like the file or selection a client passes in, goes in a code block.
 */
export function codeToReview(value: string): string {
  const code = value.trim();
  if (!code.includes("\n") && code.length <= 300) return `The code to review: ${code}`;
  // A fence longer than any run of backticks in the code.
  const fence = "`".repeat(Math.max(3, ...(code.match(/`+/g) ?? []).map((run) => run.length + 1)));
  return `The code to review:\n\n${fence}\n${code}\n${fence}`;
}

/** A tool call, the way the prompts suggest one. */
export function call(tool: string, args: Record<string, unknown>): string {
  return `${tool} ${JSON.stringify(args)}`;
}
