<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  INKLINE_PREVIEW_ORIGIN,
  embedTheme,
  inklineEmbedUrl,
  inklineTarget,
  readResizeMessage,
  themeMessage,
  themeOnReady,
} from "~/lib/inkline-embed";
import type { EmbedTheme } from "~/lib/inkline-embed";
import { FRAMEWORKS } from "~/data/frameworks";

/**
 * A live example from Inkline, whose components follow this standard, embedded
 * from its deployed preview above the code that renders it. It shows the
 * example in the framework picked in the Framework select, follows the docs'
 * colour mode and takes the height of its content. The page's markdown inside
 * it, a `::framework-switcher` with the code in every framework, is its default
 * slot, shown under the frame. Nest the switcher with as many colons as the
 * example, since remark-mdc only gives `#react` and the other slots to a
 * nested component written that way:
 *
 * ```md
 * ::inkline-example{example="button/ButtonVariants" title="Button variants"}
 * ::framework-switcher
 * #react
 * ```tsx
 * <Button variant="solid">Solid</Button>
 * ```
 * ::
 * ::
 * ```
 */
const props = withDefaults(
  defineProps<{
    /** The example's component folder and name in Inkline, like `button/ButtonVariants`. */
    example: string;
    /** What the example shows, which names the frame for screen readers, like "Button variants". */
    title: string;
    /** Shows the example's controls beside it, as a playground. */
    controls?: boolean;
    /** The height the frame keeps until the example reports its own, in pixels, so the page jumps less. */
    height?: number;
  }>(),
  { controls: false, height: 72 },
);

const { current } = useFramework();
const colorMode = useColorMode();

const target = computed(() => inklineTarget(current.value?.value, { controls: props.controls }));
// The framework the frame shows, which isn't the reader's pick when Inkline lacks it.
const label = computed(() => FRAMEWORKS.find((option) => option.value === target.value)?.label ?? target.value);
const theme = computed(() => embedTheme(colorMode.value));

const frame = ref<HTMLIFrameElement>();
// The framework and the colour mode are only known once mounted, so the frame
// waits for them, rather than loading the default twice.
const mounted = ref(false);
const reported = ref<number>();
// The mode in the frame's URL, and whether its page has started, which its
// first height report proves. Both start again whenever the URL changes.
const urlTheme = ref<EmbedTheme>("light");
const ready = ref(false);
const src = ref<string>();

function post(value: EmbedTheme) {
  frame.value?.contentWindow?.postMessage(themeMessage(value), INKLINE_PREVIEW_ORIGIN);
}

// A new framework loads a new page, in the mode the docs have then. A new mode
// doesn't: it goes to the page as a message, so the controls keep their values.
watch(
  [target, mounted],
  () => {
    if (!mounted.value) return;
    urlTheme.value = theme.value;
    ready.value = false;
    src.value = inklineEmbedUrl({
      example: props.example,
      target: target.value,
      theme: urlTheme.value,
      controls: props.controls,
    });
  },
  { immediate: true },
);

watch(theme, (value) => {
  if (ready.value) post(value);
});

function onMessage(event: MessageEvent) {
  const height = readResizeMessage(event, frame.value?.contentWindow);
  if (height === undefined) return;
  reported.value = height;
  if (ready.value) return;
  ready.value = true;
  // A lazy frame that loaded after the mode changed missed the message.
  const missed = themeOnReady(urlTheme.value, theme.value);
  if (missed) post(missed);
}

onMounted(() => {
  window.addEventListener("message", onMessage);
  mounted.value = true;
});
onBeforeUnmount(() => window.removeEventListener("message", onMessage));

const frameHeight = computed(() => `${reported.value ?? props.height}px`);
</script>

<template>
  <div class="my-5">
    <div
      class="inkline-example not-prose overflow-hidden rounded-md border border-muted"
      :class="{ 'rounded-b-none border-b-0': $slots.default }"
    >
      <iframe
        v-if="src"
        ref="frame"
        :src="src"
        :title="`${title}, in ${label}`"
        loading="lazy"
        class="block w-full border-0"
      />
      <div v-else class="inkline-example-frame" aria-hidden="true" />
    </div>

    <div
      v-if="$slots.default"
      class="[&>div>pre]:rounded-t-none [&>div]:my-0 [&>p]:my-0 [&>p]:border-x [&>p]:border-muted [&>p]:px-4 [&>p]:py-2"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* The frame's height comes from the example's own reports, which a class can't hold. */
iframe,
.inkline-example-frame {
  height: v-bind(frameHeight);
}
</style>
