import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

// Runs the reference implementations' tests, app/reference/<component>/*.test.ts,
// which the component pages show along with the code they test, the server's,
// like server/lib/contract.test.ts, which validates the contracts against their schema,
// and the MCP server's (mcp/).
export default defineConfig({
  plugins: [vue()],
  test: {
    include: ["app/reference/**/*.test.ts", "server/**/*.test.ts", "mcp/**/*.test.ts"],
    environment: "jsdom",
    // Testing Library unmounts what each test rendered from the global afterEach.
    globals: true,
    setupFiles: ["@testing-library/jest-dom/vitest"],
  },
});
