import type { LAYERS, LEVELS, SCOPES } from "./rules";

/**
 * The standard as the MCP server serves it, read from content/docs/ and
 * app/reference/ when the server is built (see standard.ts).
 */
export interface Standard {
  /** The site's origin, which every URL below starts with. */
  site: string;
  /** The frameworks the docs' examples come in, in the order the docs show them. */
  frameworks: Framework[];
  pages: Page[];
  /** What the standard covers: the pages with a contract, and the components on the Roadmap. */
  components: Component[];
  /** Every rule, from every page's checklist, in page order. */
  rules: Rule[];
  references: Reference[];
  /** public/schemas/contract.json, the schema every contract follows. */
  schema: string;
}

export interface Framework {
  /** The framework's slot in `::framework-switcher`, like `react`. */
  value: string;
  label: string;
}

export interface Page {
  /** The last part of its path, like `button`, which the tools take as its name. */
  key: string;
  /** Its path on the site, like `/docs/components/button`. */
  path: string;
  title: string;
  description: string;
  /** What `/raw/<path>.md` serves. */
  raw: string;
  /**
   * The page for agents (see agent-markdown.ts): without its MDC components, with
   * absolute links, and with each `::framework-switcher` marked, so a reader can
   * keep one framework's examples (see frameworks.ts).
   */
  markdown: string;
  headings: Heading[];
  /** The frameworks its examples come in. */
  frameworks: string[];
  contract?: Contract;
}

export interface Heading {
  level: number;
  text: string;
  /** Its id on the page, like `ux-rules`. */
  anchor: string;
  /** The headings it sits under, outermost first. */
  trail: string[];
  /** The lines of `markdown` it covers, sub-sections included: from `start` up to, but not including, `end`. */
  start: number;
  end: number;
  /** Its length in tokens, roughly: with every framework's examples, and with one framework's. */
  tokens: number;
  tokensOneFramework: number;
}

export interface Contract {
  /** `component` for a component's contract, `convention` for one like the token paths. */
  kind: "component" | "convention";
  /** What it names, like `Button` or `token-paths`. */
  name: string;
  /** What `/raw/<path>.yaml` serves. */
  yaml: string;
  url: string;
  summary?: string;
}

export type CheckKind =
  | "unit-test"
  | "axe"
  | "type-check"
  | "lint"
  | "visual-regression"
  | "keyboard"
  | "aria-snapshot"
  | "screen-reader"
  | "emulation"
  | "zoom"
  | "contrast-checker"
  | "review";

export interface Rule {
  /** Its stable ID, like `button/keep-focus`. */
  id: string;
  /** The page it's on, like `button` or `design-tokens`, which isn't always the ID's prefix (`tokens/`). */
  component: string;
  layer?: (typeof LAYERS)[number];
  level: (typeof LEVELS)[number];
  /** Who meets it: the component, the code that uses it, or both. Conventions have no scope. */
  scope?: (typeof SCOPES)[number];
  requirement: string;
  /** How to check it, as the checklist says, like "axe `button-name`, unit test". */
  check: string;
  checks: CheckKind[];
  /** The axe rules that check it, like `button-name`. */
  axe: string[];
  /** Whether tools check all of it: unit tests, axe, a type check, a linter or a visual regression test. */
  automated: boolean;
  /** Its checklist table on the page. */
  url: string;
}

export interface Component {
  /** Its name in the tools, like `button` or `radio-group`. */
  key: string;
  title: string;
  /** `foundation` for the rules every component follows, like Design Tokens. */
  kind: "component" | "foundation";
  status: "shipped" | "planned";
  /** Its group on the Roadmap, like `Actions and forms`. */
  group?: string;
  summary: string;
  url?: string;
  contractUrl?: string;
  rules?: { total: number; must: number; should: number };
  /** The files of its reference implementation. */
  reference?: string[];
}

export interface Reference {
  component: string;
  framework: string;
  /** What the page says about it, before the code. */
  notes: string;
  /** In the order the page shows them. */
  files: { name: string; lang: string; content: string }[];
  url: string;
}
