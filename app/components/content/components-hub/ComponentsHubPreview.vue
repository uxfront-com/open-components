<script setup lang="ts">
/**
 * A drawing of a component, for its card on the components hub. They're simple
 * shapes rather than the live reference components, since a Dialog, a Popover or
 * a Tooltip can't sit open inside a card, and 17 live components would load their
 * code on the hub just for a picture.
 *
 * Every shape takes its colour from a class below, which reads the docs' colour
 * tokens, so the drawings follow light and dark mode, and system colours with
 * forced colours. The card hides the drawing from assistive technologies, since
 * its name and sentence already say what the component is.
 */
defineProps<{
	/** The component to draw, named as its folder in content/docs/3.components/. */
	name: string;
}>();

// Three rows of options, in a Checkbox Group, a Radio Group or a list.
const rows = [36, 60, 84];

// The Tag Group's tags, in two rows: where each starts, how wide it is, and its row.
const tags = [
	{ x: 44, width: 64, y: 30 },
	{ x: 114, width: 82, y: 30 },
	{ x: 44, width: 82, y: 66 },
	{ x: 132, width: 64, y: 66 },
];
</script>

<template>
	<svg class="hub-preview" viewBox="0 0 240 120" focusable="false" :data-preview="name">
		<!-- Button: a primary button beside a secondary one. -->
		<g v-if="name === 'button'">
			<rect class="accent" x="52" y="44" width="72" height="32" rx="8" />
			<rect class="on-accent" x="68" y="57" width="40" height="6" rx="3" />
			<rect class="paper" x="132" y="44" width="56" height="32" rx="8" />
			<rect class="text" x="146" y="57" width="28" height="6" rx="3" />
		</g>

		<!-- Field: a label, its control and a hint. -->
		<g v-else-if="name === 'field'">
			<rect class="text" x="60" y="26" width="48" height="6" rx="3" />
			<rect class="paper" x="60" y="40" width="120" height="30" rx="6" />
			<rect class="line" x="70" y="52" width="56" height="6" rx="3" />
			<rect class="line" x="60" y="80" width="88" height="5" rx="2.5" />
		</g>

		<!-- Input: a focused input with a caret after its text. -->
		<g v-else-if="name === 'input'">
			<rect class="ring" x="36" y="40" width="168" height="40" rx="9" />
			<rect class="paper" x="40" y="44" width="160" height="32" rx="6" />
			<rect class="text" x="52" y="57" width="60" height="6" rx="3" />
			<rect class="accent" x="116" y="52" width="1.5" height="16" />
		</g>

		<!-- Textarea: lines of text and a resize grip. -->
		<g v-else-if="name === 'textarea'">
			<rect class="paper" x="50" y="22" width="140" height="76" rx="6" />
			<rect class="text" x="62" y="36" width="104" height="5" rx="2.5" />
			<rect class="text" x="62" y="48" width="112" height="5" rx="2.5" />
			<rect class="text" x="62" y="60" width="72" height="5" rx="2.5" />
			<path class="stroke" d="M176 92 L184 84 M180 92 L184 88" />
		</g>

		<!-- Checkbox: checked, with its label. -->
		<g v-else-if="name === 'checkbox'">
			<rect class="accent" x="76" y="48" width="24" height="24" rx="5" />
			<path class="check" d="M82 60 l5 5 l8 -9" />
			<rect class="text" x="110" y="57" width="56" height="6" rx="3" />
		</g>

		<!-- Checkbox Group: three options, two of them checked. -->
		<g v-else-if="name === 'checkbox-group'">
			<g v-for="(y, index) in rows" :key="y">
				<rect
					:class="index === 1 ? 'paper' : 'accent'"
					x="78"
					:y="y - 9"
					width="18"
					height="18"
					rx="4"
				/>
				<path v-if="index !== 1" class="check" :d="`M82 ${y} l3.5 3.5 l6 -7`" />
				<rect class="text" x="106" :y="y - 3" :width="[64, 48, 56][index]" height="6" rx="3" />
			</g>
		</g>

		<!-- Radio Group: three options, the middle one picked. -->
		<g v-else-if="name === 'radio-group'">
			<g v-for="(y, index) in rows" :key="y">
				<circle :class="index === 1 ? 'paper-accent' : 'paper'" cx="87" :cy="y" r="9" />
				<circle v-if="index === 1" class="accent" cx="87" :cy="y" r="4.5" />
				<rect class="text" x="106" :y="y - 3" :width="[56, 64, 48][index]" height="6" rx="3" />
			</g>
		</g>

		<!-- Switch: on, with its label. -->
		<g v-else-if="name === 'switch'">
			<rect class="accent" x="71" y="46" width="48" height="28" rx="14" />
			<circle class="on-accent" cx="105" cy="60" r="10" />
			<rect class="text" x="129" y="57" width="40" height="6" rx="3" />
		</g>

		<!-- Select: its trigger, and the list open below it, with an option highlighted. -->
		<g v-else-if="name === 'select'">
			<rect class="paper" x="64" y="14" width="112" height="28" rx="6" />
			<rect class="text" x="74" y="25" width="48" height="6" rx="3" />
			<path class="stroke" d="M156 25 l5 5 l5 -5" />
			<rect class="paper" x="64" y="48" width="112" height="60" rx="6" />
			<rect class="tint" x="68" y="70" width="104" height="18" rx="4" />
			<rect class="line" x="78" y="57" width="56" height="5" rx="2.5" />
			<rect class="text" x="78" y="76.5" width="64" height="5" rx="2.5" />
			<rect class="line" x="78" y="95" width="44" height="5" rx="2.5" />
		</g>

		<!-- Combobox: a focused input, and the suggestions its text matches. -->
		<g v-else-if="name === 'combobox'">
			<rect class="ring" x="60" y="10" width="120" height="36" rx="9" />
			<rect class="paper" x="64" y="14" width="112" height="28" rx="6" />
			<rect class="text" x="74" y="25" width="28" height="6" rx="3" />
			<rect class="accent" x="105" y="20" width="1.5" height="16" />
			<rect class="paper" x="64" y="52" width="112" height="44" rx="6" />
			<rect class="tint" x="68" y="56" width="104" height="18" rx="4" />
			<rect class="accent" x="78" y="62.5" width="24" height="5" rx="2.5" />
			<rect class="text" x="102" y="62.5" width="36" height="5" rx="2.5" />
			<rect class="accent" x="78" y="81" width="24" height="5" rx="2.5" />
			<rect class="line" x="102" y="81" width="24" height="5" rx="2.5" />
		</g>

		<!-- Tag: a label with its remove button. -->
		<g v-else-if="name === 'tag'">
			<rect class="tint-accent" x="72" y="46" width="96" height="28" rx="14" />
			<rect class="accent" x="86" y="57" width="44" height="6" rx="3" />
			<path class="stroke-accent" d="M146 56 l8 8 M154 56 l-8 8" />
		</g>

		<!-- Tag Group: tags wrapping onto a second row. -->
		<g v-else-if="name === 'tag-group'">
			<g v-for="tag in tags" :key="`${tag.x},${tag.y}`">
				<rect class="tint-accent" :x="tag.x" :y="tag.y" :width="tag.width" height="24" rx="12" />
				<rect
					class="accent"
					:x="tag.x + 11"
					:y="tag.y + 9.5"
					:width="tag.width - 36"
					height="5"
					rx="2.5"
				/>
				<path
					class="stroke-accent"
					:d="`M${tag.x + tag.width - 17} ${tag.y + 9} l6 6 m0 -6 l-6 6`"
				/>
			</g>
		</g>

		<!-- Dialog: a modal over a dimmed page, with its title, text and actions. -->
		<g v-else-if="name === 'dialog'">
			<rect class="line" x="20" y="16" width="80" height="6" rx="3" />
			<rect class="line" x="20" y="32" width="200" height="5" rx="2.5" />
			<rect class="line" x="20" y="44" width="180" height="5" rx="2.5" />
			<rect class="line" x="20" y="56" width="196" height="5" rx="2.5" />
			<rect class="line" x="20" y="68" width="150" height="5" rx="2.5" />
			<rect class="backdrop" width="240" height="120" />
			<rect class="paper" x="60" y="20" width="120" height="80" rx="8" />
			<rect class="text" x="72" y="32" width="56" height="7" rx="3.5" />
			<path class="stroke" d="M162 32 l7 7 m0 -7 l-7 7" />
			<rect class="line" x="72" y="47" width="92" height="5" rx="2.5" />
			<rect class="line" x="72" y="57" width="76" height="5" rx="2.5" />
			<rect class="paper" x="98" y="76" width="34" height="14" rx="4" />
			<rect class="accent" x="136" y="76" width="34" height="14" rx="4" />
		</g>

		<!-- Popover: a panel open above the button that opened it, pointing at it. -->
		<g v-else-if="name === 'popover'">
			<rect class="paper" x="52" y="14" width="136" height="48" rx="8" />
			<path class="paper" d="M68 61.5 L76 69.5 L84 61.5" />
			<rect class="cover" x="68.5" y="59" width="15" height="3.5" />
			<rect class="text" x="64" y="26" width="60" height="6" rx="3" />
			<rect class="line" x="64" y="39" width="108" height="5" rx="2.5" />
			<rect class="line" x="64" y="49" width="84" height="5" rx="2.5" />
			<rect class="paper" x="52" y="76" width="48" height="26" rx="6" />
			<rect class="text" x="62" y="86.5" width="28" height="5" rx="2.5" />
		</g>

		<!-- Tooltip: a short hint above an icon-only button. -->
		<g v-else-if="name === 'tooltip'">
			<rect class="inverted" x="76" y="24" width="88" height="28" rx="6" />
			<path class="inverted" d="M113 51.5 L120 58.5 L127 51.5 Z" />
			<rect class="on-inverted" x="88" y="35.5" width="64" height="5" rx="2.5" />
			<rect class="paper" x="104" y="66" width="32" height="32" rx="8" />
			<circle class="stroke" cx="120" cy="82" r="6" />
		</g>

		<!-- Spinner: a track, and the arc that turns around it. -->
		<g v-else-if="name === 'spinner'">
			<circle class="track" cx="120" cy="60" r="22" />
			<path class="arc" d="M120 38 A22 22 0 0 1 142 60" />
		</g>

		<!-- Card: a container with media, a title and text. -->
		<g v-else-if="name === 'card'">
			<rect class="paper" x="72" y="14" width="96" height="92" rx="8" />
			<rect class="tint-accent" x="80" y="22" width="80" height="36" rx="4" />
			<rect class="text" x="80" y="68" width="56" height="6" rx="3" />
			<rect class="line" x="80" y="81" width="80" height="5" rx="2.5" />
			<rect class="line" x="80" y="92" width="64" height="5" rx="2.5" />
		</g>
	</svg>
</template>

<style scoped>
.hub-preview {
	display: block;
	width: 100%;
	height: 100%;
}

/* The docs' colour tokens, so the drawings follow light and dark mode. */
.paper {
	fill: var(--ui-bg);
	stroke: var(--ui-border-accented);
	stroke-width: 1.5;
}
.paper-accent {
	fill: var(--ui-bg);
	stroke: var(--ui-primary);
	stroke-width: 1.5;
}
.cover {
	fill: var(--ui-bg);
}
.text {
	fill: var(--ui-text-dimmed);
}
.line {
	fill: var(--ui-border-accented);
}
.accent {
	fill: var(--ui-primary);
}
.on-accent {
	fill: var(--ui-bg);
}
.tint {
	fill: color-mix(in srgb, var(--ui-primary) 14%, var(--ui-bg));
}
.tint-accent {
	fill: color-mix(in srgb, var(--ui-primary) 14%, var(--ui-bg));
	stroke: color-mix(in srgb, var(--ui-primary) 40%, var(--ui-bg));
	stroke-width: 1;
}
.inverted {
	fill: var(--ui-bg-inverted);
}
.on-inverted {
	fill: var(--ui-bg-accented);
}
.backdrop {
	fill: var(--ui-bg-inverted);
	fill-opacity: 0.14;
}
.ring {
	fill: none;
	stroke: var(--ui-primary);
	stroke-width: 2;
}
.stroke,
.stroke-accent,
.check,
.track,
.arc {
	fill: none;
	stroke-linecap: round;
	stroke-linejoin: round;
}
.stroke {
	stroke: var(--ui-text-dimmed);
	stroke-width: 2;
}
.stroke-accent {
	stroke: var(--ui-primary);
	stroke-width: 2;
}
.check {
	stroke: var(--ui-bg);
	stroke-width: 2.5;
}
.track {
	stroke: var(--ui-border-accented);
	stroke-width: 5;
}
.arc {
	stroke: var(--ui-primary);
	stroke-width: 5;
}

/* With forced colours, the browser leaves SVG fills alone, so a drawing could vanish
   into the background. The shapes take the system's colours instead: outlines and
   text in CanvasText, and what's picked or on in Highlight. */
@media (forced-colors: active) {
	.hub-preview {
		forced-color-adjust: none;
	}
	.paper,
	.paper-accent,
	.cover,
	.tint,
	.tint-accent,
	.on-inverted {
		fill: Canvas;
	}
	.paper,
	.tint-accent {
		stroke: CanvasText;
	}
	.text,
	.line,
	.inverted {
		fill: CanvasText;
	}
	.accent {
		fill: Highlight;
	}
	.on-accent {
		fill: HighlightText;
	}
	.check {
		stroke: HighlightText;
	}
	/* The highlighted option keeps its place with an outline, since its tint is gone. */
	.tint {
		stroke: Highlight;
		stroke-width: 2;
	}
	.paper-accent,
	.ring,
	.stroke-accent,
	.arc {
		stroke: Highlight;
	}
	.stroke,
	.track {
		stroke: CanvasText;
	}
	.backdrop {
		fill: none;
	}
}
</style>
