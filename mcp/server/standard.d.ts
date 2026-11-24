// The names the tools' input schemas and the prompts' completions list, and the
// site's origin, bundled when the server is built (see modules/standard.ts), since
// they're needed as the definitions load. Each list is in the standard's order.
declare module "#standard/names" {
  const names: {
    /** The site's origin. */
    site: string;
    /** Every docs page. */
    pages: [string, ...Array<string>];
    /** Every component on the Roadmap, and every page with a contract. */
    components: [string, ...Array<string>];
    /** The components among them, shipped or planned, rather than foundations like Design Tokens. */
    buildable: [string, ...Array<string>];
    /** The components and foundations with a contract. */
    contracts: [string, ...Array<string>];
    /** The components with rules that the code using them meets. */
    usage: [string, ...Array<string>];
    /** The components with a reference implementation. */
    references: [string, ...Array<string>];
    frameworks: [string, ...Array<string>];
    /** Their names, in the same order, like React. */
    frameworkLabels: [string, ...Array<string>];
  };
  export default names;
}
