<script setup lang="ts">
import { destinations, nations } from "~/data/select-options";
import Combobox from "~/reference/combobox/Combobox.vue";
import Field from "~/reference/field/Field.vue";
import Select from "~/reference/select/Select.vue";

/**
 * `::combobox-restyle-example`: one class on a Combobox and on a Select, which restyles the
 * field, the panel, the options and the tags of both, since they read the same variables.
 *
 * `::combobox-restyle-example{part="tag"}`: one of the eight parts the UI page restyles, with
 * a class that sets its variables, and with its slot where it has one. No inline styles.
 */
const { part } = defineProps<{
	part?: "field" | "panel" | "option" | "tag" | "toggle" | "group-label" | "separator" | "empty";
}>();

const country = ref<string | Array<string>>("fr");
const countries = ref<string | Array<string>>(["fr", "es"]);

const grouped = computed(() => part === "group-label" || part === "separator");
const several = computed(() => part === "tag");
const value = ref<string | Array<string>>(
	several.value ? ["fr", "es"] : part === "empty" ? "" : "fr",
);
</script>

<template>
	<ComboboxExample>
		<div v-if="part" class="w-full max-w-xs">
			<Field :id="`restyle-${part}`" :label="`Restyled ${part}`">
				<Combobox
					v-model="value"
					:name="`restyle-${part}`"
					:class="`restyle-${part}`"
					:multiple="several"
					:options="grouped ? destinations : nations"
					placeholder="Type a country"
					:empty-label="part === 'empty' ? 'No countries match' : undefined"
				>
					<template v-if="part === 'field'" #leading>
						<UIcon name="i-lucide-globe" mode="svg" />
					</template>
					<template v-if="part === 'option'" #option="{ option, selected }">
						{{ option.label }}<span v-if="selected"> (yours)</span>
					</template>
					<template v-if="part === 'tag'" #tag="{ option }">{{
						option.value.toUpperCase()
					}}</template>
					<template v-if="part === 'toggle'" #arrow
						><UIcon name="i-lucide-chevrons-up-down" mode="svg"
					/></template>
					<template v-if="part === 'group-label'" #group-label="{ label }"
						>{{ label }} shipping</template
					>
					<template v-if="part === 'separator'" #separator><span class="restyle-rule" /></template>
				</Combobox>
			</Field>
		</div>
		<div v-else class="grid w-full max-w-xl gap-4 sm:grid-cols-2">
			<Field id="restyle-combobox" label="Combobox">
				<Combobox
					v-model="countries"
					name="restyle-combobox"
					class="brand-field"
					multiple
					:options="nations"
					placeholder="Type a country"
				/>
			</Field>
			<Field id="restyle-select" label="Select">
				<Select
					v-model="country"
					name="restyle-select"
					class="brand-field"
					:options="nations"
					:native-on-touch="false"
				/>
			</Field>
		</div>
		<template v-if="$slots.default" #code><slot /></template>
	</ComboboxExample>
</template>

<style>
/* One class, from outside the components' layer, for both components. */
.brand-field {
	--select--radius: 1.25rem;
	--select--border-color: var(--color--primary);
	--select--panel--radius: 1rem;
	--select--panel--border-color: var(--color--primary);
	--select--option--radius: 1rem;
	--select--option--selected--background: color-mix(
		in srgb,
		var(--color--primary) 15%,
		transparent
	);
	--select--tag--radius: 1rem;
	--select--tag--background: var(--color--primary);
	--select--tag--color: var(--color--primary-contrast);
}

/* Each sets the variables of its one part, from outside the component's layer. The Select's
   example sets the same ones, since the two components share them. */
.restyle-field {
	--select--radius: 1.25rem;
	--select--border-color: var(--color--primary);
	--select--background: color-mix(in srgb, var(--color--primary) 8%, transparent);
}
.restyle-panel {
	--select--panel--radius: 1rem;
	--select--panel--padding: 0.5rem;
	--select--panel--border-color: var(--color--primary);
}
.restyle-option {
	--select--option--radius: 1rem;
	--select--option--hover--background: color-mix(in srgb, var(--color--primary) 15%, transparent);
	--select--option--selected--background: color-mix(
		in srgb,
		var(--color--primary) 15%,
		transparent
	);
}
.restyle-tag {
	--select--tag--radius: 1rem;
	--select--tag--background: var(--color--primary);
	--select--tag--color: var(--color--primary-contrast);
}
.restyle-toggle {
	--select--arrow--color: var(--color--primary-text);
	--select--arrow--size: 1.25rem;
}
.restyle-group-label {
	--select--group-label--color: var(--color--primary-text);
	--select--group-label--font-weight: 700;
}
.restyle-separator {
	--select--separator--color: var(--color--primary);
	--select--separator--margin: 0.5rem;
}
.restyle-empty {
	--combobox--empty--padding-block: 0.75rem;
	--combobox--empty--color: var(--color--primary-text);
}
.restyle-rule {
	display: block;
	height: 1px;
}
</style>
