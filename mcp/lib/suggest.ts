/**
 * The rule IDs an agent may have meant by one that doesn't exist, best first and
 * at most three, from the rules of the component it names, if any rule has its
 * prefix:
 *
 * 1. the rule of that name, for an ID without its component, like `keep-focus`;
 * 2. the rules that share whole words with it, most first, like
 *    `button/explicit-type` for `button/type`;
 * 3. the rules a typo or two away, like `button/loading` for `button/lodaing`;
 * 4. the rules with a word it starts, like `button/native-element` for `button/native`.
 */
export function suggest(id: string, ids: string[]): string[] {
  const wanted = id.trim().toLowerCase();
  // A prefix no rule has, like `design-tokens/` for `tokens/`, names no component.
  const prefix = wanted.includes("/") ? wanted.slice(0, wanted.indexOf("/")) : undefined;
  const component = prefix && ids.some((option) => option.startsWith(`${prefix}/`)) ? prefix : undefined;
  const name = wanted.slice(wanted.indexOf("/") + 1);
  const words = name.split(/[^a-z0-9]+/).filter((word) => word.length >= 3);
  const limit = Math.max(2, Math.floor(name.length / 4));

  const ranked = ids.flatMap((option) => {
    if (component && !option.startsWith(`${component}/`)) return [];
    const rule = option.slice(option.indexOf("/") + 1);
    const parts = rule.split("-");
    if (rule === name) return [{ option, rank: [0, 0] }];
    const shared = words.filter((word) => parts.includes(word)).length;
    if (shared) return [{ option, rank: [1, -shared] }];
    // Two names are at least as far apart as their lengths, which rules most
    // out before comparing them.
    const apart = Math.abs(rule.length - name.length) <= limit ? distance(name, rule) : Infinity;
    if (apart <= limit) return [{ option, rank: [2, apart] }];
    if (parts.some((part) => words.some((word) => part.startsWith(word)))) return [{ option, rank: [3, 0] }];
    return [];
  });
  return ranked
    .sort((a, b) => a.rank[0]! - b.rank[0]! || a.rank[1]! - b.rank[1]!)
    .slice(0, 3)
    .map(({ option }) => option);
}

// Levenshtein distance, one row at a time.
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length]!;
}
