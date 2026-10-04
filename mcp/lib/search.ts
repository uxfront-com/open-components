import { renderFrameworks } from "./frameworks";
import { scan } from "./markdown";
import type { Standard } from "./types";

export interface SearchResult {
  type: "section" | "rule";
  /** The heading, or the rule's ID. */
  title: string;
  /** Where it is, like "Button › User Experience (UX) › Predictable". */
  trail: string;
  /** The page it's on, for get-page. */
  path: string;
  /** The section, for get-page's `sections`. */
  anchor?: string;
  url: string;
  excerpt: string;
  rule?: { id: string; level: string; scope?: string };
}

interface Document {
  result: SearchResult;
  component: string;
  /** How often each term appears, counting the title's terms three times. */
  terms: Map<string, number>;
  /** How much a match counts for: less in a list of sources than in the prose. */
  weight: number;
  length: number;
  text: string;
}

// Words that say nothing about what a section covers.
const STOPWORDS = new Set(
  "a an and are as at be by can do does for from how i if in into is it its of on or our should so that the their them then there these this to use used using we what when where which who why will with without you your".split(
    " ",
  ),
);

/**
 * A text's terms: lowercased words, without stopwords, and without a plural's
 * `s`. A contraction stays one word, so `don't` is `dont` rather than `don` and `t`.
 */
export function terms(text: string): string[] {
  return text
    .toLowerCase()
    .replaceAll("’", "'")
    .replace(/'s\b/g, "")
    .replaceAll("'", "")
    .split(/[^a-z0-9]+/)
    .filter((term) => term && !STOPWORDS.has(term))
    .map((term) => (term.length > 3 && term.endsWith("s") && !term.endsWith("ss") ? term.slice(0, -1) : term));
}

/**
 * Searches every section of every page and every rule, ranked with BM25 over
 * their words, where a term also matches the words it starts (`focus` finds
 * `focused`), and results that match more of the query's terms come first.
 */
export function createSearch(standard: Standard) {
  const documents: Document[] = [];
  // `text` is what an excerpt quotes, and `more` is searched without being quoted.
  const add = (component: string, result: SearchResult, title: string, text: string, more = "", weight = 1) => {
    const counts = new Map<string, number>();
    for (const term of terms(title)) counts.set(term, (counts.get(term) ?? 0) + 3);
    for (const term of terms(`${text} ${more}`)) counts.set(term, (counts.get(term) ?? 0) + 1);
    const length = [...counts.values()].reduce((a, b) => a + b, 0);
    documents.push({ result, component, terms: counts, weight, length, text });
  };

  for (const page of standard.pages) {
    const lines = page.markdown.split("\n");
    // The page's introduction, then each section's own text, up to its first
    // sub-heading. The checklist's tables are left to the rules below, whether
    // they're under a heading of their own, like the Button's "### UX rules", or
    // right under "## Checklist", like the Design Tokens'.
    const sections = [
      { start: -1, end: page.headings[0]?.start ?? lines.length, heading: undefined },
      ...page.headings.map((heading, i) => ({ start: heading.start, end: page.headings[i + 1]?.start ?? lines.length, heading })),
    ].filter(({ heading }) => !heading?.trail.includes("Checklist"));
    for (const { start, end, heading } of sections) {
      const own = lines.slice(start + 1, end).filter((line) => heading?.text !== "Checklist" || !line.startsWith("|"));
      const text = prose(own.join("\n"), standard);
      if (!text) continue;
      const result: SearchResult = {
        type: "section",
        title: heading?.text ?? page.title,
        trail: [page.title, ...(heading?.trail ?? [])].join(" › "),
        path: page.path,
        ...(heading && { anchor: heading.anchor }),
        url: `${standard.site}${page.path}${heading ? `#${heading.anchor}` : ""}`,
        excerpt: "",
      };
      // A page's Sources only list the titles of what it draws on.
      const weight = heading?.text === "Sources" ? 0.3 : 1;
      add(page.key, result, heading?.text ?? `${page.title} ${page.description}`, text, "", weight);
    }
  }
  for (const rule of standard.rules) {
    const page = standard.pages.find((candidate) => candidate.key === rule.component)!;
    add(rule.component, {
      type: "rule",
      title: rule.id,
      trail: [page.title, "Checklist", ...(rule.layer ? [`${rule.layer.toUpperCase()} rules`] : [])].join(" › "),
      path: page.path,
      anchor: rule.url.split("#")[1],
      url: rule.url,
      excerpt: "",
      rule: { id: rule.id, level: rule.level, ...(rule.scope && { scope: rule.scope }) },
    }, rule.id.split("/").pop()!, rule.requirement, rule.check);
  }
  const average = documents.reduce((sum, document) => sum + document.length, 0) / documents.length;

  return (query: string, options: { component?: string; type?: "section" | "rule"; limit: number }) => {
    const wanted = [...new Set(terms(query))];
    const pool = documents.filter(
      (document) =>
        (!options.component || document.component === options.component) &&
        (!options.type || document.result.type === options.type),
    );
    // How often a document has a term, counting words it starts at less than an exact match.
    const frequency = (document: Document, term: string) => {
      let total = 0;
      for (const [word, count] of document.terms) {
        if (word === term) total += count;
        else if (term.length >= 3 && word.startsWith(term)) total += count * 0.7;
      }
      return total;
    };

    // How rare each term is across the standard, so a rare term counts for more.
    const idf = new Map(
      wanted.map((term) => {
        const df = documents.filter((document) => frequency(document, term)).length;
        return [term, Math.log(1 + (documents.length - df + 0.5) / (df + 0.5))];
      }),
    );

    const scored = pool.flatMap((document) => {
      let score = 0;
      let matched = 0;
      for (const term of wanted) {
        const tf = frequency(document, term);
        if (!tf) continue;
        score += (idf.get(term)! * tf * 2.2) / (tf + 1.2 * (0.25 + (0.75 * document.length) / average));
        matched++;
      }
      return matched ? [{ document, score: score * document.weight * (matched / wanted.length) ** 2 }] : [];
    });
    scored.sort((a, b) => b.score - a.score);
    return {
      total: scored.length,
      results: scored.slice(0, options.limit).map(({ document }) => ({
        ...document.result,
        excerpt: excerpt(document.text, wanted),
      })),
    };
  };
}

// A section's text without its code blocks, its tables' borders or the framework
// markers, for searching and excerpts. Inline code stays as it's written, since
// it's mostly markup like `<button>` that the excerpt has to quote.
function prose(markdown: string, standard: Standard): string {
  return scan(renderFrameworks(markdown, standard.frameworks, standard.frameworks[0]?.value))
    .filter(({ text, code }) => !code && !/^\s*\|?\s*:?-{3,}/.test(text))
    .map(({ text }) =>
      text
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .split(/(`[^`]*`)/)
        .map((part, i) => (i % 2 ? part.replaceAll("\\|", "|") : part.replace(/(?<!\\)\||[*_]{1,2}|^\s*(#{1,6}|>)\s/g, " ")))
        .join("")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .join(" ");
}

// About 200 characters around the first of the query's terms in a text.
function excerpt(text: string, wanted: string[]): string {
  const lower = text.toLowerCase();
  const at = Math.min(...wanted.map((term) => lower.indexOf(term)).filter((index) => index >= 0), Infinity);
  if (text.length <= 220) return text;
  const start = at === Infinity ? 0 : Math.max(0, text.lastIndexOf(" ", Math.max(0, at - 60)) + 1);
  const end = text.indexOf(" ", Math.min(text.length, start + 200));
  return `${start > 0 ? "…" : ""}${text.slice(start, end === -1 ? undefined : end)}${end === -1 ? "" : "…"}`;
}
