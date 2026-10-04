/**
 * Turns away the toolkit's install badge, /mcp/badge.svg, which writes its
 * `color`, `textColor` and `borderColor` query parameters into the SVG unescaped,
 * so a crafted link would run script on the site. wrangler.jsonc already keeps
 * the path off the Worker, and this keeps it off the server too, should the
 * Worker ever get it. It's a middleware, which runs before every route, since
 * the toolkit's route would win over one of ours.
 */
export default defineEventHandler((event) => {
  // However the path is written: the router also matches it with a trailing slash.
  const raw = event.path.split("?")[0]!;
  let path = raw;
  try {
    path = decodeURIComponent(raw);
  } catch {}
  if (path.replace(/\/+/g, "/").replace(/\/$/, "").toLowerCase() === "/mcp/badge.svg") {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }
});
