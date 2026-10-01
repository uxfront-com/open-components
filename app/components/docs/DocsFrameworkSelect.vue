<script setup lang="ts">
// Replaces @uxfront/layer-docs's, which sits flush with the sidebar while the
// navigation below it is inset: its list bleeds out by its items' padding, so
// their icons and labels line up with the sidebar's edge. The select bleeds out
// the same way and takes their icon size, so its icon and label line up too.
// A button doesn't stretch to fill its parent, so a wrapper bleeds out instead,
// and the attributes, like DocsAsideLeftTop's aria-labelledby, go to the select.
defineOptions({ inheritAttrs: false });

const { framework, frameworks, current } = useFramework();
</script>

<template>
  <div class="-mx-2.5">
    <USelect
      v-bind="$attrs"
      :model-value="current?.value"
      :items="frameworks"
      variant="ghost"
      color="neutral"
      :icon="current?.icon"
      :ui="{ leadingIcon: 'size-4 mx-0.5' }"
      class="w-full"
      @update:model-value="framework = $event"
    />
  </div>
</template>
