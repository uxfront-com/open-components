/**
 * The content gate for blog posts: every token name a post writes in code follows
 * the pattern the Design Tokens page defines, apart from the names the post shows
 * as wrong, which it lists in `counterExamples`. blog.test.ts runs it on every post
 * in content/blog/, so a post and the page can't drift apart unnoticed.
 *
 * It checks the syntax only. A name like `--button--font--size` matches the
 * pattern but breaks `tokens/groups`, so whether a counter-example is really
 * wrong, and whether a right name keeps the rules beyond the pattern, is for the
 * person reviewing the post.
 *
 * Like contract.ts, it doesn't use Nitro's auto-imports, so Vitest can run it.
 */

import { parse } from "yaml";
import { buildContract } from "./contract";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

/**
 * A name: `--`, then a letter, a digit or a placeholder, then any run of letters,
 * digits, dashes and placeholders. Upper-case letters and extra dashes are part of
 * it, so `--Color--primary` and `--color---primary` are read whole, and fail. A
 * bare `--`, or `-contrast` with one dash, isn't a name.
 */
const NAME = /--(?=[A-Za-z0-9{])(?:[A-Za-z0-9-]|\{[^}]*\})+/g;

// The placeholders the page's own formats use for a single lower-case word, like
// `--{component}--{part}--{name}`, each checked as one.
const WORDS = ["group", "name", "component", "part", "state"];

// Code blocks of shell commands, whose `--flags` aren't token names.
const SHELL = new Set(["bash", "sh", "shell", "zsh", "console"]);

/** What the gate reads from the Design Tokens page's contract. */
export interface TokenRules {
  /** The pattern every token path matches. */
  pattern: RegExp;
  /** The theme's colours, which `{color}` stands for. */
  colors: Array<string>;
  /** The IDs of the page's checklist, like `tokens/groups`. */
  rules: Array<string>;
}

/**
 * Reads the pattern, the theme's colours and the rule IDs from the Design Tokens
 * page's contract, the YAML block under its `### Described`, with its checklist's
 * rules (buildContract in contract.ts), rather than a copy that could drift.
 */
export function tokenRules(page: string): TokenRules {
  const contract = buildContract(page);
  if (!contract) {
    throw new Error("The Design Tokens page has no Described block");
  }
  const { pattern, theme, rules } = parse(contract) as {
    pattern: string;
    theme: { colors: Array<string> };
    rules: Array<{ id: string }>;
  };
  return { pattern: new RegExp(pattern), colors: theme.colors, rules: rules.map(({ id }) => id) };
}

/**
 * Every piece of code in a post's body, after its frontmatter: each code block's
 * lines, apart from shell commands', and each inline code span outside them. The
 * docs write every token in code, so prose, tables' rules (`| --- |`) and the
 * frontmatter's fence are never read.
 */
export function codeOf(source: string): Array<string> {
  const body = source.replace(FRONTMATTER, "");
  const code: Array<string> = [];
  const prose: Array<string> = [];
  // The open code block, if any, with its fence, as scan() in mcp/lib/markdown.ts
  // reads them: it closes on a line of the same character, at least as long, with
  // nothing else on it.
  let block: { char: string; length: number; shell: boolean; lines: Array<string> } | undefined;
  for (const text of body.split("\n")) {
    const marker = text.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (!block) {
      if (!marker) {
        prose.push(text);
      } else {
        const language = marker[2]!.trim().match(/^[\w-]*/)![0].toLowerCase();
        block = { char: marker[1]![0]!, length: marker[1]!.length, shell: SHELL.has(language), lines: [] };
      }
      continue;
    }
    if (marker && marker[1]![0] === block.char && marker[1]!.length >= block.length && !marker[2]!.trim()) {
      if (!block.shell) {
        code.push(block.lines.join("\n"));
      }
      block = undefined;
    } else {
      block.lines.push(text);
    }
  }
  if (block && !block.shell) {
    code.push(block.lines.join("\n"));
  }
  // Inline code: a run of backticks, up to a run of the same length.
  for (const [, , span] of prose.join("\n").matchAll(/(`+)([\s\S]*?[^`])\1(?!`)/g)) {
    code.push(span!);
  }
  return code;
}

/** Every token name in a post's code, once each, in the order they come. */
export function namesOf(source: string): Array<string> {
  return [...new Set(codeOf(source).flatMap((code) => code.match(NAME) ?? []))];
}

/**
 * What's wrong with a post's names, as one message per problem, naming the name.
 * An empty list means the post passes:
 *
 * - every name matches the pattern, once each placeholder is filled in, unless the
 *   post lists it in `counterExamples`;
 * - every counter-example is in the post's code;
 * - every rule ID it names in code, like `tokens/groups`, is in the checklist.
 */
export function checkPost(source: string, tokens: TokenRules): Array<string> {
  const frontmatter = (parse(source.match(FRONTMATTER)?.[1] ?? "") ?? {}) as { counterExamples?: Array<string> };
  const counterExamples = new Set(frontmatter.counterExamples ?? []);
  const names = namesOf(source);
  const errors: Array<string> = [];

  for (const name of names) {
    if (counterExamples.has(name)) {
      continue;
    }
    const unknown = name
      .matchAll(/\{([^}]*)\}/g)
      .map(([, placeholder]) => placeholder!)
      .filter((placeholder) => placeholder !== "color" && !WORDS.includes(placeholder))
      .toArray();
    if (unknown.length) {
      errors.push(`${name}: the Design Tokens page defines no {${unknown.join("}, {")}} placeholder`);
      continue;
    }
    const wrong = expand(name, tokens.colors).filter((filled) => !tokens.pattern.test(filled));
    if (wrong.length) {
      errors.push(`${name}: doesn't match the token path pattern ${tokens.pattern.source}`);
    }
  }

  for (const name of counterExamples) {
    if (!names.includes(name)) {
      errors.push(`${name}: listed in counterExamples, but not in the post's code`);
    }
  }

  const ids = new Set(codeOf(source).flatMap((code) => code.match(/^tokens\/[a-z0-9-]+$/) ?? []));
  for (const id of ids) {
    if (!tokens.rules.includes(id)) {
      errors.push(`${id}: not a rule in the Design Tokens page's checklist`);
    }
  }

  return errors;
}

// A name with every placeholder filled in: once for each theme colour for
// `{color}`, and a single word for the others.
function expand(name: string, colors: Array<string>): Array<string> {
  const words = WORDS.reduce((filled, word) => filled.replaceAll(`{${word}}`, "x"), name);
  return words.includes("{color}") ? colors.map((color) => words.replaceAll("{color}", color)) : [words];
}
