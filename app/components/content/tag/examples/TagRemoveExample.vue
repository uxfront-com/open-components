<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import { announce, prepareAnnouncer } from "~/reference/button/announce";
import Tag from "~/reference/tag/Tag.vue";

/**
 * `::tag-remove-example`: a filter's tags, which the example removes when their buttons are
 * pressed. The Tag only fires `remove`, so the example moves focus, as the page says whatever
 * removes a tag should: to the next tag's remove button, or the previous one, or Reset, and
 * announces what went, through the Button's live region.
 */
const ALL = ["Open", "Bug", "Assigned to me"];
const filters = ref([...ALL]);
const list = useTemplateRef<HTMLElement>("list");
const reset = useTemplateRef<{ $el: HTMLElement }>("reset");

onMounted(prepareAnnouncer);

async function remove(filter: string) {
  const index = filters.value.indexOf(filter);
  filters.value = filters.value.filter((candidate) => candidate !== filter);
  await nextTick();
  const buttons = list.value?.querySelectorAll<HTMLElement>("[data-slot='remove']") ?? [];
  (buttons[index] ?? buttons[index - 1] ?? reset.value?.$el)?.focus();
  announce(`${filter} removed`);
}
</script>

<template>
  <TagExample>
    <div class="flex flex-wrap items-center justify-center gap-2">
      <ul ref="list" class="flex flex-wrap items-center gap-2" aria-label="Filters">
        <li v-for="filter in filters" :key="filter" class="list-none">
          <Tag :label="filter" removable @remove="remove(filter)" />
        </li>
      </ul>
      <Button ref="reset" size="xs" variant="ghost" @click="filters = [...ALL]">Reset</Button>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TagExample>
</template>
