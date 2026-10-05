import { dirname, join } from "node:path";
import { defineNuxtModule, resolvePath } from "@nuxt/kit";

/**
 * Serves MCP requests with the MCP SDK's web-standard transport on Cloudflare
 * Workers too.
 *
 * Under a Cloudflare preset, the toolkit hands each request to `createMcpHandler`
 * from the `agents` package, which pins its own copy of the MCP SDK, checks the
 * server against it with `instanceof`, answers in server-sent events, and more
 * than doubles the Worker's size. The toolkit's other transport is the SDK's
 * WebStandardStreamableHTTPServerTransport: stateless, with JSON responses, and
 * built on fetch's Request and Response, which Workers have.
 *
 * It replaces the module the toolkit picks the transport in. If an upgrade moves
 * it, the build fails ("Cannot resolve agents/mcp") rather than the Worker.
 */
export default defineNuxtModule({
  meta: { name: "mcp-web-transport" },
  setup(_options, nuxt) {
    nuxt.hook("modules:done", async () => {
      const toolkit = dirname(await resolvePath("@nuxtjs/mcp-toolkit"));
      const transport = join(toolkit, "runtime/server/mcp/providers/node.js");
      nuxt.options.nitro.virtual ??= {};
      nuxt.options.nitro.virtual["#nuxt-mcp-toolkit/transport.mjs"] = () =>
        `export { default } from ${JSON.stringify(transport)}`;
    });
  },
});
