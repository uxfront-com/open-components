/**
 * The port `pnpm dev:mcp` serves the MCP server on, which the docs' page menu
 * links to in development (`mcpUrl` in nuxt.config.ts at the root): MCP_DEV_PORT
 * when it's set, or else the one after the port Conductor gives the workspace,
 * which reserves ten for each, so workspaces running side by side never share
 * one. 3100 otherwise.
 *
 * It's plain JavaScript, so scripts/dev-mcp.mjs can read it too: it passes the
 * port to `nuxt dev` as --port, which wins over a PORT in the environment.
 */
const conductor = Number(process.env.CONDUCTOR_PORT);

export const MCP_DEV_PORT =
  Number(process.env.MCP_DEV_PORT) || (Number.isInteger(conductor) && conductor > 0 ? conductor + 1 : 3100);
