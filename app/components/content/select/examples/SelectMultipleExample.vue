<script setup lang="ts">
import { countries } from "~/data/select-options";
import Field from "~/reference/field/Field.vue";
import Select from "~/reference/select/Select.vue";

/** `::select-multiple-example`: several values, each a tag with a remove button. */
const value = ref<string | Array<string>>(["fr", "es"]);
</script>

<template>
	<SelectExample>
		<div class="w-full max-w-xs">
			<Field id="multiple-countries" label="Countries">
				<Select
					v-model="value"
					name="multiple-countries"
					multiple
					:options="countries"
					placeholder="Choose countries"
					:native-on-touch="false"
				/>
			</Field>
		</div>
		<template v-if="$slots.default" #code><slot /></template>
	</SelectExample>
</template>
