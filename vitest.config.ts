import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

// Runs the reference implementations' tests, app/reference/<component>/*.test.ts,
// which the component pages show along with the code they test.
export default defineConfig({
  plugins: [vue()],
  test: {
    include: ["app/reference/**/*.test.ts"],
    environment: "jsdom",
    // Testing Library unmounts what each test rendered from the global afterEach.
    globals: true,
    setupFiles: ["@testing-library/jest-dom/vitest"],
  },
});
