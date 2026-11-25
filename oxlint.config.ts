import vue from "@uxfront/oxlint-config/vue";
import { defineConfig } from "oxlint";

export default defineConfig({
	extends: [vue],
	// oxlint reads env and ignorePatterns only from the root config, not through extends.
	env: vue.env,
	ignorePatterns: vue.ignorePatterns,
	rules: {
		// Destructuring a key beside a rest element is how the code copies an object without
		// that key, like `({ component, ...contract }) => contract`, so the key is unused on
		// purpose. Setting an option drops oxlint's defaults, so the `^_` patterns restate them.
		"no-unused-vars": [
			"error",
			{
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_",
				destructuredArrayIgnorePattern: "^_",
				ignoreRestSiblings: true,
			},
		],
	},
	overrides: [
		{
			files: ["app/reference/**"],
			rules: {
				// A slot's content is whatever the page passes, and the component only renders it
				// without reading it, so defineSlots gives each slot an `unknown` return type.
				"quality/no-unknown-returns": "off",
				// A reference component warns in the console when it's used in a way that breaks a
				// rule, like a Button with no accessible name, and its tests check those warnings.
				"no-console": "off",
			},
		},
		{
			files: [
				"app/reference/combobox/Combobox.vue",
				"app/reference/popover/Popover.vue",
				"app/reference/popover/Popover.test.ts",
			],
			rules: {
				// Browser code, where `instanceof` is how you tell an element's kind, like an
				// HTMLInputElement among a form's controls, and narrow it.
				"@nkzw/no-instanceof": "off",
			},
		},
		{
			files: ["**/*.test.ts"],
			rules: {
				// Tests pass a component any attributes, the way a page can, which Vue's h() takes
				// as Record<string, unknown> too, and read parsed JSON before checking what it holds.
				"quality/no-unsafe-dictionary-type": "off",
				// A test's helpers sit in the describe block that uses them, next to the tests
				// they serve, and a test runs once, so there's nothing to save by moving them out.
				"unicorn/consistent-function-scoping": "off",
			},
		},
		{
			files: ["server/lib/contract.test.ts"],
			rules: {
				// These tests break a contract one way at a time, for the schema to reject, so what
				// each change returns is deliberately not a Contract.
				"quality/no-unknown-returns": "off",
			},
		},
		{
			files: ["scripts/**"],
			rules: {
				// Command-line scripts, whose output is their report.
				"no-console": "off",
			},
		},
		{
			files: ["app/components/docs/DocsNavigation.vue"],
			rules: {
				// It renders the sidebar in place of Nuxt UI's UContentNavigation and keeps its code
				// in step with the original (AGENTS.md, "Things that change together"), whose theme
				// line spreads `appConfig.ui?.contentNavigation || {}`.
				"unicorn/no-useless-fallback-in-spread": "off",
				// tv() loses the theme's types once the app config is spread into it, so its
				// result is cast through unknown to the slot functions DocsNavigationList.vue takes.
				"quality/no-chained-type-assertions": "off",
			},
		},
		{
			files: ["app/reference/combobox/Combobox.vue"],
			rules: {
				// ACCENTS matches combining marks on their own, after NFD has split them off their
				// letters, so the class holds combining marks on purpose, written as escapes.
				"no-misleading-character-class": "off",
			},
		},
	],
});
