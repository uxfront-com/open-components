// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { checkPost, namesOf, tokenRules } from "./blog";

// The content gate (blog.ts): it reads the pattern, the theme's colours and the
// rule IDs from the Design Tokens page itself, never from a copy.
const tokens = tokenRules(readFileSync("content/docs/2.foundations/1.design-tokens.md", "utf8"));
const BLOG = "content/blog";

// A post with the frontmatter the blog collection takes, and the body given.
const post = (body: string, counterExamples: Array<string> = []) =>
	[
		"---",
		"title: A post",
		"description: A post about tokens.",
		"date: 2026-11-18",
		"author:",
		"  name: Alex Grozav",
		...(counterExamples.length
			? ["counterExamples:", ...counterExamples.map((name) => `  - ${name}`)]
			: []),
		"---",
		"",
		body,
	].join("\n");

describe("the content gate", () => {
	it("reads the pattern, the colours and the rules from the Design Tokens page", () => {
		expect(tokens.pattern.test("--color--primary-contrast")).toBe(true);
		expect(tokens.colors).toContain("primary");
		expect(tokens.rules).toContain("tokens/groups");
	});

	it("passes placeholders, a bare --, single dashes and a table", () => {
		const source = post(
			[
				"A theme colour's label is `--color--{color}-contrast`, and a part's token `--{component}--{part}--{name}`.",
				"Groups are split by `--`, and words by `-`, like `-contrast`.",
				"",
				"| Token | Path |",
				"| --- | --- |",
				"| `--button--icon--size` | button › icon › size |",
				"",
				"```css",
				".button { color: var(--color--primary-contrast); }",
				"```",
			].join("\n"),
		);
		expect(checkPost(source, tokens)).toEqual([]);
	});

	it("reads names in code only, never in prose or the frontmatter", () => {
		expect(namesOf(post("Not code: --color-primary. Code: `--color--primary`."))).toEqual([
			"--color--primary",
		]);
	});

	it("skips the flags in shell commands", () => {
		expect(checkPost(post("```bash\npnpm install --frozen-lockfile\n```"), tokens)).toEqual([]);
	});

	it.each([
		"--color-primary",
		"--Color--primary",
		"--color---primary",
		"--button-height",
		"--primary",
	])("fails on %s, naming it", (name) => {
		const errors = checkPost(post(`Like \`${name}\`.`), tokens);
		expect(errors).toHaveLength(1);
		expect(errors[0]).toMatch(new RegExp(`^${name}: `));
	});

	it("fails on a name in a code block", () => {
		expect(checkPost(post("```css\n.button { --button-height: 2.5rem; }\n```"), tokens)).toEqual([
			expect.stringMatching(/^--button-height: /),
		]);
	});

	it("fails on a placeholder the page doesn't define", () => {
		expect(checkPost(post("Like `--color--{colour}`."), tokens)).toEqual([
			expect.stringMatching(/^--color--\{colour\}: .*\{colour\}/),
		]);
	});

	it("passes a counter-example the post lists, even one that matches the pattern", () => {
		const source = post("Not `--color-primary`, and not `--color--primary--contrast`.", [
			"--color-primary",
			"--color--primary--contrast",
		]);
		expect(checkPost(source, tokens)).toEqual([]);
	});

	it("fails on a counter-example the post doesn't show", () => {
		expect(checkPost(post("Like `--color--primary`.", ["--button-height"]), tokens)).toEqual([
			expect.stringMatching(/^--button-height: listed in counterExamples/),
		]);
	});

	it("fails on a rule ID the Design Tokens page's checklist doesn't have", () => {
		expect(checkPost(post("It breaks `tokens/groups`."), tokens)).toEqual([]);
		expect(checkPost(post("It breaks `tokens/group-names`."), tokens)).toEqual([
			expect.stringMatching(/^tokens\/group-names: /),
		]);
	});
});

describe("every blog post", () => {
	const files = readdirSync(BLOG).filter((file) => file.endsWith(".md"));

	it("has at least one post to check", () => {
		expect(files.length).toBeGreaterThan(0);
	});

	it.each(files)("%s names its tokens as the Design Tokens page defines", (file) => {
		expect(checkPost(readFileSync(join(BLOG, file), "utf8"), tokens)).toEqual([]);
	});
});
