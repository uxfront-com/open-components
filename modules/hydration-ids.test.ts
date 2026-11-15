// @vitest-environment node
import { createSSRApp, defineComponent, h, onServerPrefetch, useId } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import { keepServerPrefetch } from "./hydration-ids";

// A component that registers a server prefetch hook, like @nuxt/icon's icons in
// CSS mode, before an async one that names an element with useId, like the docs
// layout (an async component) and the Framework select inside it.
const app = (withPrefetch: boolean) => {
  const Icon = defineComponent({
    setup() {
      if (withPrefetch) onServerPrefetch(() => {});
      return () => h("span");
    },
  });
  const Labelled = defineComponent({
    setup() {
      const id = useId();
      return () => h("label", { id });
    },
  });
  const Layout = defineComponent({
    async setup() {
      return () => h(Labelled);
    },
  });
  return createSSRApp({ render: () => [h(Icon), h(Layout)] });
};

describe("hydration-ids", () => {
  it("gives the browser the same ids as the server once onServerPrefetch stays in the client build", async () => {
    const composables = keepServerPrefetch({
      vue: ["onRenderTracked", "onRenderTriggered", "onServerPrefetch"],
      "#app": ["definePageMeta"],
    });
    const server = await renderToString(app(true));
    // The client build keeps the hook only when it's no longer on the list Nuxt removes.
    const client = await renderToString(app(!composables.vue!.includes("onServerPrefetch")));
    expect(client).toBe(server);
  });

  it("leaves the other composables Nuxt removes from the client build", () => {
    expect(
      keepServerPrefetch({
        vue: ["onRenderTracked", "onRenderTriggered", "onServerPrefetch"],
        "#app": ["definePageMeta"],
      }),
    ).toEqual({ vue: ["onRenderTracked", "onRenderTriggered"], "#app": ["definePageMeta"] });
  });
});
