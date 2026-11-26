// What `pnpm check-seo` checks in dist/ after `pnpm build`, reading it the way
// Cloudflare serves it, with @uxfront/site-checks:
//
// - every page in the sitemap, and only those, with the head tags every page
//   needs, unique titles and descriptions, and share images at 1200 × 630;
// - robots.txt, which names the sitemap and every AI crawler;
// - every blog post's BlogPosting, and no other article node;
// - llms.txt, which links every docs page and blog post, each docs page by a
//   title of its own;
// - the markdown copies of the docs pages and blog posts, each headed by its own
//   title;
// - dist/_headers, which keeps other hosts and generated files out of search
//   results, and never the site's own pages, and points each copy at its page.
//
// The parse settings and rule options keep the checks the site ran before it
// moved to the package, so it neither gains nor loses one. The package's README
// says what each setting and option does.
import { defineConfig } from "@uxfront/site-checks";

const SITE = "https://opencomponents.dev";
// Named in robots.txt, each allowed everywhere (AI_CRAWLERS in nuxt.config.ts).
const AI_CRAWLERS = [
	"OAI-SearchBot",
	"ChatGPT-User",
	"PerplexityBot",
	"Claude-SearchBot",
	"Claude-User",
	"GPTBot",
	"ClaudeBot",
	"Google-Extended",
	"CCBot",
];

// Other sites and tools fetch the contract schema from the browser.
const schemaCors = {
	id: "schema-cors",
	check({ site, headersFor, report }) {
		const url = `${site}/schemas/contract.json`;
		if (headersFor(url).find(([name]) => name === "access-control-allow-origin")?.[1] !== "*") {
			report(url, "no Access-Control-Allow-Origin: *");
		}
	},
};

export default defineConfig({
	site: SITE,
	parse: {
		scope: "document",
		titleScope: "document",
		titleTag: "bare",
		trimTitle: "none",
		quotes: "double",
		caseSensitiveTags: true,
		tagEnd: "space",
		metaKey: "name-or-property",
		trimValues: false,
		decode: ["quot", "#39", "#x27", "lt", "gt", "amp"],
		decodeOrder: "one-pass",
		decodeIgnoreCase: false,
		count: "utf-16",
		h1: "anywhere",
		nodes: "block-and-graph",
		typeArrays: false,
		jsonLdType: "exact",
		blankLines: "empty",
		trimSitemap: false,
		mergeDuplicateLocs: false,
		headersParser: "blocks",
	},
	rules: {
		lastmod: { format: "w3c", realDate: "parseable" },
		"lastmod-future": { skewHours: 0 },
		// Every sitemap URL is a page in dist/, and not a copy of the 404 page.
		"sitemap-pages": { paths: "exact", notFoundCopy: true },
		"sitemap-indexable": {
			sources: [
				{ type: "meta", names: ["robots"] },
				{ type: "headers", hosts: "match" },
			],
		},
		// The 404 page and the SPA fallback aren't in the sitemap on purpose, and redirect
		// pages, like /docs, are left out by their meta refresh.
		"sitemap-coverage": {
			exclude: [
				{ type: "files", files: ["404.html", "200.html"] },
				{ type: "meta", names: ["robots"] },
				{ type: "refresh" },
			],
		},
		title: { exactlyOne: true, nonEmpty: false },
		description: { exactlyOne: true },
		canonical: { exactlyOne: true, rel: "exact" },
		lang: { lang: "en" },
		"open-graph": { url: "loc" },
		"og-image-file": { types: ["png"], png: "name" },
		"json-ld-present": true,
		"json-ld-context": true,
		"json-ld-ids": true,
		"json-ld-posting": { scope: ["/blog/*"] },
		"robots-sitemap": { match: "exact" },
		"robots-crawlers": {
			crawlers: ["*", ...AI_CRAWLERS],
			allow: "all",
			case: "exact",
			groupRules: "directives",
		},
		// Lighthouse fails robots.txt on any other directive, and every page loses its SEO 100.
		"robots-directives": true,
		llms: { first: "non-empty" },
		"llms-summary": { position: "second" },
		"llms-links": { scope: ["/docs/*", "/blog/*"], form: "markdown" },
		"llms-docs-section": true,
		"markdown-copy": { scope: ["/docs/*", "/blog/*"] },
		"markdown-heading": { scope: ["/docs/*"], ogTitle: ["/blog/*"] },
		// Other hosts and generated files stay out of search results.
		"headers-noindex": {
			urls: [
				"https://www.opencomponents.dev/",
				"https://www.opencomponents.dev/docs/components/button",
				"https://seo-uxf-710.opencomponents.dev/",
				"https://abc123-seo-uxf-710.opencomponents.dev/docs/getting-started/introduction",
				"https://open-components.account.workers.dev/",
				"https://abc123-open-components.account.workers.dev/docs/getting-started/introduction",
				`${SITE}/llms.txt`,
				`${SITE}/llms-full.txt`,
				`${SITE}/raw/docs/components/button.yaml`,
				`${SITE}/schemas/contract.json`,
			],
		},
		// Cloudflare keeps only the last of two rules with the same pattern.
		"headers-duplicates": true,
		"headers-markdown": { scope: ["/docs/*", "/blog/*"] },
		"not-found": true,
	},
	extraRules: [schemaCors],
});
