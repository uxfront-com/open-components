import names from "#standard/names";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Variables } from "@modelcontextprotocol/sdk/shared/uriTemplate.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";

// Each contract, at the URL the site publishes it at, which clients can also
// fetch themselves.
export default defineMcpResource({
  title: "Contracts",
  description:
    "The contract of each component and foundation, as YAML: its API, its DOM contract, its tokens and every rule in its checklist. The same files as https://opencomponents.dev/raw/docs/<path>.yaml.",
  uri: new ResourceTemplate(`${names.site}/raw/docs/{+path}.yaml`, {
    list: async () => {
      const standard = await useStandard();
      return {
        resources: standard.pages.flatMap((page) =>
          page.contract
            ? [
                {
                  uri: page.contract.url,
                  name: page.key,
                  title: `The ${page.title} contract`,
                  description: page.contract.summary ?? page.description,
                  mimeType: "application/yaml",
                },
              ]
            : [],
        ),
      };
    },
  }),
  metadata: { mimeType: "application/yaml", annotations: { audience: ["assistant"], priority: 0.9 } },
  // An unknown URI is a bad argument, as the SDK reports for one no template matches.
  handler: async (uri: URL, { path }: Variables) => {
    const standard = await useStandard();
    const page = standard.pages.find((candidate) => candidate.path === `/docs/${path}`);
    if (!page?.contract) throw new McpError(ErrorCode.InvalidParams, `There's no contract at ${uri.href}`, { uri: uri.href });
    return { contents: [{ uri: uri.href, mimeType: "application/yaml", text: page.contract.yaml }] };
  },
});
