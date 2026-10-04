// `pnpm dev:mcp`: serves the MCP server (mcp/) in development on the port in
// mcp/port.mjs, which `pnpm dev` proxies /mcp to. It's passed as --port, since
// `nuxt dev` would take a PORT, NUXT_PORT or NITRO_PORT from the environment over
// the one in mcp/nuxt.config.ts, and the proxy would miss it.
import { spawn } from "node:child_process";
import { MCP_DEV_PORT } from "../mcp/port.mjs";

const nuxt = spawn("nuxt", ["dev", "mcp", "--port", String(MCP_DEV_PORT), ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
nuxt.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
// Stops with this script, as when Conductor stops its run script.
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(signal, () => nuxt.kill(signal));
