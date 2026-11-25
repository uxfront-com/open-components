// The words a minute an adult reads silently, on average, which the byline's
// reading time divides a post's words by.
const WORDS_PER_MINUTE = 230;

/**
 * A node of a page's parsed body, as Nuxt Content stores it: minimark, where text
 * is a string and an element is `[tag, props, ...children]`, or the tree it
 * expands into, where text is `{ type: "text", value }` and an element has
 * `children`.
 */
type BodyNode =
	| string
	| Array<unknown>
	| { type?: string; value?: unknown; children?: Array<unknown> }
	| null
	| undefined;

/**
 * The words a reader reads in a page's parsed body: every word of its text,
 * code and inline code included, since they're read too, and none of its
 * markdown syntax, which the parser has already taken out.
 */
export function countWords(body: unknown): number {
	return textOf(body as BodyNode)
		.split(/\s+/)
		.filter(Boolean).length;
}

/**
 * The minutes it takes to read a page's parsed body, rounded up, so a post never
 * reads faster than the byline says, and at least 1.
 */
export function readingTime(body: unknown): number {
	return Math.max(1, Math.ceil(countWords(body) / WORDS_PER_MINUTE));
}

// The text below a node, each element's set apart from its neighbours', so the
// last word of a cell and the first of the next don't run together.
function textOf(node: BodyNode): string {
	if (typeof node === "string") {
		return node;
	}
	if (!node || typeof node !== "object") {
		return "";
	}
	// A minimark element: [tag, props, ...children].
	if (Array.isArray(node)) {
		return textOfAll(node.slice(2));
	}
	if (node.type === "text") {
		return typeof node.value === "string" ? node.value : "";
	}
	// The body itself is { type: "minimark", value: [...] }, or a tree's root, with
	// `children`, like every element of the tree.
	if (Array.isArray(node.value)) {
		return textOfAll(node.value);
	}
	return textOfAll(node.children ?? []);
}

function textOfAll(nodes: Array<unknown>): string {
	return nodes.map((node) => textOf(node as BodyNode)).join(" ");
}
