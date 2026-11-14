<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import TagGroup from "~/reference/tag-group/TagGroup.vue";
import type { TagGroupItem } from "~/reference/tag-group/TagGroup.vue";

/**
 * `::tag-group-remove-example`: a search's filters, which the example drops when their
 * buttons are pressed. The group moves focus to the next remove button, or to Reset, which
 * it's given as fallbackFocus, and announces what went.
 */
const ALL: TagGroupItem[] = [
  { value: "open", label: "Open" },
  { value: "bug", label: "Bug" },
  { value: "assigned", label: "Assigned to me" },
  { value: "this-week", label: "This week" },
];
const filters = ref([...ALL]);
const reset = useTemplateRef<{ $el: HTMLElement }>("reset");

function remove(filter: TagGroupItem) {
  filters.value = filters.value.filter((other) => other.value !== filter.value);
}
</script>

<template>
  <TagGroupExample>
    <div class="flex flex-wrap items-center justify-center gap-2">
      <TagGroup
        label="Filters"
        :tags="filters"
        removable
        empty-label="No filters"
        :fallback-focus="() => reset?.$el"
        @remove="remove"
      />
      <Button ref="reset" size="xs" variant="ghost" @click="filters = [...ALL]">Reset</Button>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TagGroupExample>
</template>
