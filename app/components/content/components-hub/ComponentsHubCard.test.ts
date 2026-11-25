import { readdirSync, readFileSync } from "node:fs";

import { render, screen, within } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";

import ComponentsHubCard from "./ComponentsHubCard.vue";
import ComponentsHubPreview from "./ComponentsHubPreview.vue";

// Nuxt registers these. NuxtLink renders a link like this one.
const global = {
	components: {
		ComponentsHubPreview,
		NuxtLink: defineComponent({
			props: { to: { type: String, required: true } },
			setup:
				(props, { slots }) =>
				() =>
					h("a", { href: props.to }, slots.default?.()),
		}),
	},
};

// A card's markdown as the docs render it: the prose components only pass the
// content on, so plain elements stand in for them.
const prose = (tag: string) =>
	defineComponent({
		inheritAttrs: false,
		setup:
			(_, { attrs, slots }) =>
			() =>
				h(tag, attrs, slots.default?.()),
	});
const [ProseP, ProseA, ProseUl, ProseLi] = [prose("p"), prose("a"), prose("ul"), prose("li")];
const button = () => [
	h(ProseP, null, {
		default: () => [h(ProseA, { href: "/docs/components/button" }, { default: () => ["Button"] })],
	}),
	h(ProseP, null, { default: () => ["The Button lets people act on what's in front of them."] }),
	h(ProseUl, null, {
		default: () =>
			["UI", "UX", "DX", "AX"].map((layer) =>
				h(ProseLi, null, {
					default: () => [
						h(
							ProseA,
							{ href: `/docs/components/button/${layer.toLowerCase()}` },
							{ default: () => [layer] },
						),
					],
				}),
			),
	}),
];

const renderCard = () =>
	render(
		defineComponent(
			() => () => h("ul", [h(ComponentsHubCard, { preview: "button" }, { default: button })]),
		),
		{ global },
	);

describe("ComponentsHubCard", () => {
	it("has a heading that links to the component's Overview", () => {
		renderCard();
		const heading = screen.getByRole("heading", { level: 3, name: "Button" });
		expect(within(heading).getByRole("link", { name: "Button" })).toHaveAttribute(
			"href",
			"/docs/components/button",
		);
	});

	it("says what the component is for", () => {
		renderCard();
		expect(
			screen.getByText("The Button lets people act on what's in front of them."),
		).toBeInTheDocument();
	});

	it("links each layer, named by its label and then its component, after the heading", () => {
		renderCard();
		const links = screen.getAllByRole("link");
		expect(links.map((link) => link.textContent?.replaceAll(/\s+/g, " ").trim())).toEqual([
			"Button",
			"UI of the Button",
			"UX of the Button",
			"DX of the Button",
			"AX of the Button",
		]);
		for (const layer of ["ui", "ux", "dx", "ax"]) {
			const link = screen.getByRole("link", { name: `${layer.toUpperCase()} of the Button` });
			expect(link).toHaveAttribute("href", `/docs/components/button/${layer}`);
		}
	});

	it("puts no link inside another", () => {
		const { container } = renderCard();
		expect(container.querySelectorAll("a a")).toHaveLength(0);
	});

	it("hides its preview from assistive technologies", () => {
		const { container } = renderCard();
		const preview = container.querySelector("svg")!.parentElement!;
		expect(preview).toHaveAttribute("aria-hidden", "true");
		expect(preview).toHaveAttribute("inert");
	});

	it("is one item of the group's list", () => {
		renderCard();
		expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("data-slot", "component-card");
	});
});

// Every component in content/docs/3.components/ has a card on the hub, and its card
// draws it.
const DIR = "content/docs/3.components";
const hub = readFileSync(`${DIR}/index.md`, "utf8");
const components = readdirSync(DIR, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map(({ name }) => name);

describe("ComponentsHubPreview", () => {
	it.each(components)("draws the %s, whose card on the hub names its preview", (name) => {
		expect(hub).toContain(`:::components-hub-card{preview="${name}"}`);
		const { container } = render(ComponentsHubPreview, { props: { name } });
		expect(
			container.querySelector(`svg[data-preview="${name}"] > g`)?.children.length,
		).toBeGreaterThan(0);
	});

	it("draws nothing for a component it doesn't know", () => {
		const { container } = render(ComponentsHubPreview, { props: { name: "carousel" } });
		expect(container.querySelector("svg > g")).toBeNull();
	});
});
