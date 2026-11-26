/**
 * Turns away the toolkit's install badge, /mcp/badge.svg, which writes its
 * `color`, `textColor` and `borderColor` query parameters into the SVG unescaped,
 * so a crafted link would run script on mcp.opencomponents.dev. It's a
 * middleware, which runs before every route, since the toolkit's route would win
 * over one of ours.
 */
export default defineEventHandler((event) => {
	// However the path is written: the router also matches it with a trailing slash.
	// split() always gives at least one part, so the fallback never applies.
	const raw = event.path.split("?")[0] ?? event.path;
	let path = raw;
	try {
		path = decodeURIComponent(raw);
	} catch {
		// A malformed escape, like `%E0`, leaves the path as it was written.
	}
	if (path.replaceAll(/\/+/g, "/").replace(/\/$/, "").toLowerCase() === "/mcp/badge.svg") {
		throw createError({ statusCode: 404, statusMessage: "Not Found" });
	}
});
