<script setup lang="ts">
// Replaces @uxfront/layer-docs's, which sits flush with the sidebar. The
// Framework label above it lines up with the navigation's categories, so the
// select sits like one of their pages: indented behind the same guide line, at
// the same width, with the same icon size, so its icon and label line up with
// theirs. The wrappers mirror the navigation's child list and its items. The
// classes go to the outer one, so a margin stays outside the guide line, and
// the other attributes, like DocsAsideLeftTop's aria-labelledby, to the select.
defineOptions({ inheritAttrs: false });

const { framework, frameworks, current } = useFramework();
</script>

<template>
  <div :class="$attrs.class" class="ms-2.5 -me-2.5 border-s border-default">
    <div class="ps-1.5 -ms-px">
      <USelect
        v-bind="{ ...$attrs, class: undefined }"
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
  </div>
</template>
