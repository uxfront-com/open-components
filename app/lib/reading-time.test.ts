// @vitest-environment node
import { describe, expect, it } from "vitest";

import { countWords, readingTime } from "./reading-time";

// A paragraph of `count` words, as Nuxt Content's minimark stores it.
const paragraph = (count: number) => [
	"p",
	{},
	Array.from({ length: count }, () => "word").join(" "),
];
const minimark = (...value: Array<unknown>) => ({ type: "minimark", value });

describe("countWords", () => {
	it("counts the words of every element, code and inline code included", () => {
		const body = minimark(
			["h2", { id: "start" }, "Start with the group"],
			["p", {}, "Name it ", ["code", {}, "--color--primary"], " first."],
			["pre", { language: "css" }, ["code", {}, ".button { color: red; }"]],
		);
		expect(countWords(body)).toBe(4 + 4 + 5);
	});

	it("keeps the words of neighbouring elements apart", () => {
		const body = minimark(["table", {}, ["tr", {}, ["td", {}, "one"], ["td", {}, "two"]]]);
		expect(countWords(body)).toBe(2);
	});

	it("reads the expanded tree as well as minimark", () => {
		const body = {
			type: "root",
			children: [{ type: "element", children: [{ type: "text", value: "three short words" }] }],
		};
		expect(countWords(body)).toBe(3);
	});

	it("counts nothing in an empty or missing body", () => {
		expect(countWords(minimark())).toBe(0);
		expect(countWords(undefined)).toBe(0);
	});
});

describe("readingTime", () => {
	it("reads 230 words a minute, rounded up", () => {
		expect(readingTime(minimark(paragraph(230)))).toBe(1);
		expect(readingTime(minimark(paragraph(231)))).toBe(2);
		expect(readingTime(minimark(paragraph(1380)))).toBe(6);
	});

	it("is never less than a minute, even for an empty post", () => {
		expect(readingTime(minimark())).toBe(1);
	});
});
