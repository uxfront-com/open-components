import names from "#standard/names";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Variables } from "@modelcontextprotocol/sdk/shared/uriTemplate.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";

// Each docs page as markdown, at the URL the site publishes it at, which clients
// can also fetch themselves.
export default defineMcpResource({
  title: "Pages",
  description:
    "Every docs page as markdown, whole: the same files as https://opencomponents.dev/raw/docs/<path>.md. Component pages are long, so agents read them a section at a time, with get-page.",
  uri: new ResourceTemplate(`${names.site}/raw/docs/{+path}.md`, {
    list: async () => {
      const standard = await useStandard();
      return {
        resources: standard.pages.map((page) => ({
          uri: `${standard.site}/raw${page.path}.md`,
          name: page.key,
          title: page.title,
          description: page.description,
          mimeType: "text/markdown",
        })),
      };
    },
  }),
  metadata: { mimeType: "text/markdown", annotations: { audience: ["user", "assistant"] } },
  // An unknown URI is a bad argument, as the SDK reports for one no template matches.
  handler: async (uri: URL, { path }: Variables) => {
    const standard = await useStandard();
    const page = standard.pages.find((candidate) => candidate.path === `/docs/${path}`);
    if (!page) throw new McpError(ErrorCode.InvalidParams, `There's no page at ${uri.href}`, { uri: uri.href });
    return { contents: [{ uri: uri.href, mimeType: "text/markdown", text: page.raw }] };
  },
});
