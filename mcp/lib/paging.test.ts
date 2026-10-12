// @vitest-environment node
import { describe, expect, it } from "vitest";
import { FRAMEWORKS } from "../../app/data/frameworks";
import { PAGE_SIZE, paginate } from "./paging";
import { buildStandard } from "./standard";
import type { Rule } from "./types";

const { standard } = buildStandard({ root: process.cwd(), site: "https://opencomponents.dev", frameworks: FRAMEWORKS });
const { rules } = standard;
const numbers = Array.from({ length: 120 }, (_, i) => i);

describe("paginate", () => {
  it("returns the first page, with the offset of the next one", () => {
    expect(paginate(numbers)).toEqual({ total: 120, items: numbers.slice(0, PAGE_SIZE), nextOffset: PAGE_SIZE });
  });

  it("returns the next page from the offset it gave", () => {
    expect(paginate(numbers, { offset: 50, limit: 20 })).toEqual({ total: 120, items: numbers.slice(50, 70), nextOffset: 70 });
  });

  it("returns the last page without a next offset", () => {
    expect(paginate(numbers, { offset: 100 })).toEqual({ total: 120, items: numbers.slice(100) });
    expect(paginate(numbers, { offset: 70, limit: 50 })).toEqual({ total: 120, items: numbers.slice(70) });
  });

  it("pages through the rules a filter leaves, counting only those", () => {
    const button = rules.filter((rule) => rule.component === "button");
    const seen = [];
    let offset: number | undefined = 0;
    while (offset !== undefined) {
      const page: ReturnType<typeof paginate<Rule>> = paginate(button, { offset, limit: 10 });
      if ("error" in page) throw new Error(page.error);
      expect(page.total).toBe(button.length);
      seen.push(...page.items);
      offset = page.nextOffset;
    }
    expect(seen).toEqual(button);
  });

  it("gives an empty list an empty first page", () => {
    expect(paginate([])).toEqual({ total: 0, items: [] });
  });

  it("reports an offset past the end as an error, for the tool to throw with createError()", () => {
    expect(paginate(numbers, { offset: 120 })).toEqual({ error: expect.stringContaining("Only 120 match") });
    expect(paginate([], { offset: 1 })).toEqual({ error: expect.stringContaining("nothing from offset 1") });
  });

  it("fits a page of the longest rules well under the 40,000 characters some clients pass on", () => {
    const longest = [...rules].sort((a, b) => JSON.stringify(b).length - JSON.stringify(a).length);
    expect(JSON.stringify(paginate(longest)).length).toBeLessThan(30000);
  });
});
