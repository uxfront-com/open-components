/**
 * The security headers every response from the site carries: `routeRules` in
 * nuxt.config.ts writes them to dist/_headers for the static assets, and the MCP
 * server (mcp/nuxt.config.ts) sets them on its own responses, which _headers
 * doesn't reach.
 */
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Cross-Origin-Opener-Policy": "same-origin",
};
