/**
 * How many rules list-rules returns at once, at most and by default. The
 * longest rule is about 450 characters as JSON, so a page of them is about
 * 22,500: well under the 40,000 characters some MCP clients pass on whole, like
 * Gemini CLI, with room for rules to grow.
 */
export const PAGE_SIZE = 50;

/**
 * One page of a list, from `offset`, and the offset of the next page when
 * there is one. An offset past the end is an error, since it means the agent
 * lost its place, while an empty list still has an empty first page.
 */
export function paginate<T>(
  items: T[],
  { offset = 0, limit = PAGE_SIZE }: { offset?: number; limit?: number } = {},
): { total: number; items: T[]; nextOffset?: number } | { error: string } {
  if (offset > 0 && offset >= items.length) {
    return { error: `Only ${items.length} match, so there's nothing from offset ${offset}. Start at 0 and follow nextOffset.` };
  }
  const end = offset + limit;
  return { total: items.length, items: items.slice(offset, end), ...(end < items.length ? { nextOffset: end } : {}) };
}
