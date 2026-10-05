import { setResponseHeaders } from "h3";

// The server is public and read-only, and takes no credentials, so any client can
// call it, browser-based ones on other origins included (`security.allowedOrigins`
// in nuxt.config.ts). The toolkit doesn't send CORS headers, and its transport
// answers a preflight's OPTIONS with a 405, so this middleware does both.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID, X-MCP-Tools",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
  "Access-Control-Max-Age": "86400",
};

export default defineMcpHandler({
  middleware: (event) => {
    if (event.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    setResponseHeaders(event, CORS);
  },
});
