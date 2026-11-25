// How the docs embed an example from Inkline's deployed preview, which renders
// it in each of Inkline's frameworks. The embed's URL and its two messages are
// Unframework's contract (its preview docs, "Embed an example"). The only link
// to Inkline is this origin, so moving the preview to another domain changes
// this one line.
export const INKLINE_PREVIEW_ORIGIN = "https://inkline-preview.blue-water-0397.workers.dev";

// The `type` both of the embed's messages carry.
const MESSAGE_TYPE = "unframework:embed";

/** The colour modes the embed takes. It shows an error for any other value. */
export type EmbedTheme = "light" | "dark";

// The docs' frameworks Inkline renders in, each with a target of the same name.
// Inkline has no Vanilla target, and a Qwik one the docs don't offer.
const TARGETS = new Set(["react", "vue", "svelte", "angular", "solid", "astro"]);

// The docs' default framework, the first in app/data/frameworks.ts, which
// stands in for a framework Inkline doesn't render in.
const DEFAULT_TARGET = "react";

/**
 * An example's id in Inkline's preview, from its component folder and its name,
 * as `button/ButtonVariants` gives `src/components/button/examples/ButtonVariants`.
 */
export function inklineExampleId(example: string): string {
	const [component, name, ...rest] = example.split("/");
	if (!component || !name || rest.length) {
		throw new Error(
			`An Inkline example is "<component>/<Name>", like "button/ButtonVariants", not ${JSON.stringify(example)}.`,
		);
	}
	return `src/components/${component}/examples/${name}`;
}

/**
 * The target an embed shows for the reader's framework, so the example renders
 * in the framework of the code under it. Vanilla, which Inkline doesn't have,
 * takes the default. An example with controls never takes Astro, since Astro's
 * static build renders only an example's first props, so a changed control
 * would show a message in place of the component.
 */
export function inklineTarget(framework: string | undefined, { controls = false } = {}): string {
	if (!framework || !TARGETS.has(framework)) {
		return DEFAULT_TARGET;
	}
	if (controls && framework === "astro") {
		return DEFAULT_TARGET;
	}
	return framework;
}

/** The embed's mode for the site's colour mode: `dark` stays dark, and anything else is light. */
export function embedTheme(mode: string | undefined): EmbedTheme {
	return mode === "dark" ? "dark" : "light";
}

/**
 * The embed's URL. It always carries the mode, since an embed without one
 * ignores the messages that change it, and always asks for its height.
 */
export function inklineEmbedUrl({
	example,
	target,
	theme,
	controls = false,
}: {
	example: string;
	target: string;
	theme: EmbedTheme;
	controls?: boolean;
}): string {
	const url = new URL("/embed.html", INKLINE_PREVIEW_ORIGIN);
	url.searchParams.set("example", inklineExampleId(example));
	url.searchParams.set("target", target);
	if (controls) {
		url.searchParams.set("controls", "true");
	}
	url.searchParams.set("theme", theme);
	url.searchParams.set("resize", "true");
	return url.href;
}

/** The message that changes an embed's mode in place, with no reload. */
export function themeMessage(theme: EmbedTheme) {
	return { type: MESSAGE_TYPE, kind: "theme", theme } as const;
}

/**
 * The height an embed reports, or `undefined` for any other message. Only a
 * message from the preview's origin and from this embed's own window counts,
 * so another frame, or another page, can't resize it.
 */
export function readResizeMessage(
	event: { origin: string; source: unknown; data: unknown },
	frame: unknown,
): number | undefined {
	if (event.origin !== INKLINE_PREVIEW_ORIGIN || !frame || event.source !== frame) {
		return undefined;
	}
	const data = event.data as { type?: unknown; kind?: unknown; height?: unknown } | null;
	if (typeof data !== "object" || data === null) {
		return undefined;
	}
	if (data.type !== MESSAGE_TYPE || data.kind !== "resize") {
		return undefined;
	}
	const { height } = data;
	return typeof height === "number" && Number.isFinite(height) && height > 0 ? height : undefined;
}

/**
 * The mode to send an embed when it becomes ready, meaning its first height
 * report after each load, or `undefined` when its URL already has it. A lazy
 * embed below the fold has no page yet when the mode changes, so the message
 * is lost, and it loads in the mode its URL had.
 */
export function themeOnReady(urlTheme: EmbedTheme, current: EmbedTheme): EmbedTheme | undefined {
	return urlTheme === current ? undefined : current;
}
