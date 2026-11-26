import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

// Both headers list the site's pages in the same order: the docs header from
// `docsTheme.headerLinks` in app/app.config.ts, and the homepage's from its own
// links in app/pages/index.vue.
const ORDER = ["Blog", "Changelog", "Documentation"];

describe("header links", () => {
	it("lists the docs header's links in order", async () => {
		vi.stubGlobal("defineAppConfig", <T>(config: T) => config);
		const { default: config } = await import("../app.config");
		vi.unstubAllGlobals();
		expect(config.docsTheme.headerLinks.map((link: { label: string }) => link.label)).toEqual(
			ORDER,
		);
	});

	it("lists the homepage header's links in the same order", () => {
		const page = readFileSync("app/pages/index.vue", "utf8");
		const labels = [...page.matchAll(/class="header-link header-page"[^>]*>([^<]+)</g)].map(
			(match) => match[1],
		);
		expect(labels).toEqual(ORDER);
	});
});
