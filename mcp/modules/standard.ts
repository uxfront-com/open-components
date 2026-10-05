import { mkdirSync, watch, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { defineNuxtModule, useLogger } from "@nuxt/kit";
import { FRAMEWORKS } from "../../app/data/frameworks";
import { buildStandard } from "../lib/standard";

const SITE_URL = "https://opencomponents.dev";

/**
 * Bundles the standard into the server: reads it from the repository when the
 * server is built (lib/standard.ts), and writes it to .nuxt/standard/standard.json,
 * which Nitro bundles as a server asset (see `useStandard()` in server/utils/standard.ts).
 *
 * A server asset is bundled as it is, while Nitro rewrites code it inlines: in a
 * virtual module, the docs' `import.meta.env.DEV` or `typeof window` would change.
 * Only the names the tools' input schemas and the prompts' completions list, like
 * the components', go in a virtual module, `#standard/names`, since they're
 * needed as the definitions load.
 */
export default defineNuxtModule({
  meta: { name: "open-components-standard" },
  setup(_options, nuxt) {
    // `nuxt prepare mcp` (pnpm install's postinstall) only writes types.
    if (nuxt.options._prepare) return;
    const logger = useLogger("standard");
    const root = resolve(nuxt.options.rootDir, "..");
    const { standard, problems } = buildStandard({ root, site: SITE_URL, frameworks: FRAMEWORKS });
    for (const problem of problems) logger.warn(problem);

    // Written once Nuxt has emptied .nuxt/, which it does after modules run.
    const dir = join(nuxt.options.buildDir, "standard");
    nuxt.hook("build:before", () => {
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "standard.json"), JSON.stringify(standard));
    });
    nuxt.options.nitro.serverAssets ??= [];
    nuxt.options.nitro.serverAssets.push({ baseName: "standard", dir });

    const shipped = standard.components.filter((component) => component.status === "shipped");
    const names = {
      site: standard.site,
      pages: standard.pages.map((page) => page.key),
      components: standard.components.map((component) => component.key),
      buildable: standard.components.filter((component) => component.kind === "component").map((component) => component.key),
      contracts: shipped.map((component) => component.key),
      usage: shipped
        .filter((component) => standard.rules.some((rule) => rule.component === component.key && rule.scope !== "component" && rule.scope))
        .map((component) => component.key),
      references: standard.references.map((reference) => reference.component),
      frameworks: standard.frameworks.map((framework) => framework.value),
      frameworkLabels: standard.frameworks.map((framework) => framework.label),
    };
    nuxt.options.nitro.virtual ??= {};
    nuxt.options.nitro.virtual["#standard/names"] = () => `export default ${JSON.stringify(names)}`;

    // `nuxt dev mcp` restarts when the standard changes, since Nuxt only watches
    // the files inside mcp/.
    if (nuxt.options.dev) {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const watchers = ["content/docs", "app/reference", "public/schemas"].map((dir) =>
        watch(join(root, dir), { recursive: true }, () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => nuxt.callHook("restart"), 100);
        }),
      );
      nuxt.hook("close", () => watchers.forEach((watcher) => watcher.close()));
    }
  },
});
