<script setup lang="ts">
import { destinations } from "~/data/select-options";
import Field from "~/reference/field/Field.vue";
import Select from "~/reference/select/Select.vue";

/** `::select-groups-example`: groups with a heading, a separator and a disabled option. */
</script>

<template>
	<SelectExample>
		<div class="w-full max-w-xs">
			<Field id="groups-destination" label="Destination">
				<Select
					name="groups-destination"
					:options="destinations"
					placeholder="Choose a destination"
					:native-on-touch="false"
				/>
			</Field>
		</div>
		<template v-if="$slots.default" #code><slot /></template>
	</SelectExample>
</template>
