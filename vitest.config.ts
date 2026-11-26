import { fileURLToPath } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

// Runs the reference implementations' tests, app/reference/<component>/*.test.ts,
// which the component pages show along with the code they test, the app's helpers,
// like app/lib/navigation.test.ts, the server's,
// like server/lib/contract.test.ts, which validates the contracts against their schema,
// the MCP server's (mcp/), the agent plugin's (plugins/open-components.test.ts),
// the local Nuxt modules' (modules/) and the content components',
// like app/components/content/InklineExample.test.ts, which resolve `~/` as Nuxt does.
export default defineConfig({
	plugins: [vue()],
	resolve: { alias: { "~": fileURLToPath(new URL("./app", import.meta.url)) } },
	test: {
		include: [
			"app/reference/**/*.test.ts",
			"app/lib/**/*.test.ts",
			"server/**/*.test.ts",
			"mcp/**/*.test.ts",
			"plugins/*.test.ts",
			"modules/*.test.ts",
			"app/components/**/*.test.ts",
		],
		environment: "jsdom",
		// Testing Library unmounts what each test rendered from the global afterEach.
		globals: true,
		setupFiles: ["@testing-library/jest-dom/vitest"],
	},
});
