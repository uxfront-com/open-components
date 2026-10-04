import names from "#standard/names";
import { z } from "zod";
import { tokens } from "../../../lib/markdown";
import { count, findPage, findSections, outline, PAGE_LIMIT, pageText, REPLY_LIMIT, sectionText } from "../../../lib/pages";

// "React, Vue, … and Vanilla", without a comma before the "and", as the docs write lists.
const FRAMEWORKS = `${names.frameworkLabels.slice(0, -1).join(", ")} and ${names.frameworkLabels.at(-1)}`;

export default defineMcpTool({
  description: `Reads a docs page as markdown, whole or just the sections you name. Component pages explain why each rule exists, with examples in ${FRAMEWORKS}: pass a framework to keep only its examples.

WHEN TO USE: for the reasoning, an example or the details behind a rule (like the sections ["Loading"] of the button's page), or for a page without a contract, like the introduction or the roadmap.
WHEN NOT TO USE: for the requirements alone, use get-contract or list-rules, which are much shorter. To find which page or section covers a topic, use search-docs.

A page longer than about ${PAGE_LIMIT.toLocaleString("en")} tokens, like the button's, returns its outline instead: every heading with its anchor and length, so you can ask for the sections you need. So do sections that are too long to return together.`,
  annotations: READ_ONLY,
  inputSchema: {
    path: z
      .string()
      .max(300)
      .describe(
        `The page: its name (${names.pages.join(", ")}), or its path, like /docs/components/button. A URL's #anchor, like the ones search-docs returns, reads that section.`,
      ),
    sections: z
      .array(z.string().max(200))
      .max(20)
      .optional()
      .describe(
        'The sections to read, by heading or anchor, like ["Loading"] or ["#ux-rules"]. Each comes with its sub-sections. Name a parent to tell apart headings that repeat, as in "Every state > Loading".',
      ),
    framework: z.enum(names.frameworks).optional().describe("Your framework, to keep only its examples."),
  },
  inputExamples: [
    { path: "button", sections: ["Loading"], framework: "react" },
    { path: "/docs/components/button", sections: ["Developer Experience (DX)"], framework: "svelte" },
    { path: "design-tokens" },
    { path: "introduction" },
  ],
  handler: async ({ path, sections, framework }) => {
    const standard = await useStandard();
    const page = findPage(standard, path);
    if (!page) {
      throw createError({
        statusCode: 404,
        message: `There's no page at ${path}. The pages are ${standard.pages.map((candidate) => `${candidate.key} (${candidate.path})`).join(", ")}.`,
      });
    }

    // Only pages with examples say whose they show.
    const label = framework && page.frameworks.length && standard.frameworks.find((candidate) => candidate.value === framework)?.label;
    const header = (anchor?: string) =>
      `# ${page.title}\n\n> ${page.description}\n\nSource: ${standard.site}${page.path}${anchor ? `#${anchor}` : ""}${label ? ` (${label} examples)` : ""}\n\n`;

    // A link to a section, like https://opencomponents.dev/docs/components/button#loading,
    // reads that section, as long as the page has it.
    const fragment = path.match(/#([^?#]+)$/)?.[1];
    const wanted = sections?.length ? sections : fragment && page.headings.some((heading) => heading.anchor === fragment) ? [fragment] : [];

    if (wanted.length) {
      const { found, missing } = findSections(page, wanted);
      if (missing.length) {
        throw createError({
          statusCode: 404,
          message: `The ${page.title} page has no section named ${missing.map((name) => `"${name}"`).join(", ")}. Its sections are:\n${outline(page)}`,
        });
      }
      const text = `${header(found.length === 1 ? found[0]!.anchor : undefined)}${found.map((heading) => sectionText(standard, page, heading, framework)).join("\n\n")}\n`;
      if (text.length <= REPLY_LIMIT) return text;
      const inside = page.headings.filter((heading) => found.some((section) => section.start <= heading.start && heading.end <= section.end));
      return `${header()}These sections are about ${count(tokens(text))} tokens, too long to return together. Ask for fewer of them, or for the ones inside them${framework ? "" : ", in one framework"}:\n\n${outline(page, inside)}\n`;
    }

    const text = `${header()}${pageText(standard, page, framework)}\n`;
    if (tokens(text) <= PAGE_LIMIT && text.length <= REPLY_LIMIT) return text;

    const whole = tokens(pageText(standard, page));
    const single = tokens(pageText(standard, page, framework ?? standard.frameworks[0]?.value));
    const example = JSON.stringify({
      path: page.key,
      sections: [page.headings.find((heading) => heading.level > 2)?.text ?? page.headings[0]?.text],
      framework: framework ?? standard.frameworks[0]?.value,
    });
    const contract = page.contract
      ? ` Its requirements alone are in get-contract {"component":"${page.key}"}, in about ${count(tokens(page.contract.yaml))} tokens.`
      : "";
    return `${header()}This page is about ${count(whole)} tokens, or ${count(single)} with one framework's examples, which is too long to return whole. Ask for the sections you need, as in get-page ${example}.${contract}\n\n${outline(page)}\n`;
  },
});
