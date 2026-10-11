<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Card from "~/reference/card/Card.vue";
import type { CardProps } from "~/reference/card/Card.vue";
import "~/reference/button/tokens.css";

/**
 * Pick an element, a heading level and the parts, and see the reference Card and
 * its code, in the framework picked in the Framework select.
 *
 * ```md
 * ::card-playground
 * ::
 * ```
 */
const as = ref<NonNullable<CardProps["as"]>>("article");
const headingLevel = ref<NonNullable<CardProps["headingLevel"]>>(3);
const link = ref(true);
const media = ref(true);
const eyebrow = ref(true);
const footer = ref(true);

const elements = ["article", "section", "div", "li"];
const levels = [2, 3, 4, 5, 6];

const HEADING = "Analytical Engine";
const HREF = "/projects/analytical-engine";
const BODY = "A general-purpose mechanical computer, first described in 1837.";
const IMAGE = '<img src="/projects/analytical-engine.jpg" alt="" />';

const { current } = useFramework();
const framework = computed(() => current.value?.value ?? "react");

// Highlighted the way the page's own examples for each framework are.
const LANGUAGES: Record<string, string> = {
  react: "tsx",
  vue: "vue",
  svelte: "svelte",
  angular: "angular-html",
  solid: "tsx",
  astro: "astro",
  vanilla: "html",
};

// An element's lines, with one attribute per line once they no longer fit on one.
function element(tag: string, attributes: (string | false | undefined)[], children: string[] = []) {
  const attrs = attributes.filter((attribute) => !!attribute) as string[];
  const line = `<${tag}${attrs.map((attribute) => ` ${attribute}`).join("")}`;
  const open =
    line.length > 88 || attrs.some((attribute) => attribute.includes("\n"))
      ? [`<${tag}`, ...attrs.flatMap((attribute) => attribute.split("\n").map((part) => `  ${part}`)), children.length ? ">" : "/>"]
      : [`${line}${children.length ? ">" : " />"}`];
  if (!children.length) return open;
  return [...open, ...children.map((child) => `  ${child}`), `</${tag}>`];
}

// The Card with only the props that differ from the defaults, and its parts, the
// way you'd write them in each framework, or for Vanilla, the markup from the DOM
// contract.
const code = computed(() => {
  const fw = framework.value;
  const jsx = fw === "react" || fw === "solid";
  const body = `<p>${BODY}</p>`;
  // The footer's Button, which Angular puts on the native element, and Vanilla writes out.
  const button = (attributes: string[] = []) => {
    if (fw === "vanilla") {
      return '<button class="button" type="button" data-variant="outline" data-color="neutral" data-size="sm"><span data-slot="label">Save</span></button>';
    }
    const tag = fw === "angular" ? "button" : "Button";
    return `<${tag} ${[...attributes, 'size="sm"', 'variant="outline"'].join(" ")}>Save</${tag}>`;
  };

  let card: string[];
  if (fw === "vanilla") {
    const title = link.value ? `<a data-slot="link" href="${HREF}">${HEADING}</a>` : HEADING;
    card = element(as.value, ['class="card"'], [
      '<div data-slot="header">',
      `  <h${headingLevel.value} data-slot="heading">${title}</h${headingLevel.value}>`,
      ...(eyebrow.value ? ['  <p data-slot="eyebrow">Project</p>'] : []),
      "</div>",
      ...(media.value ? [`<div data-slot="media">${IMAGE}</div>`] : []),
      `<div data-slot="body">${body}</div>`,
      ...(footer.value ? ['<div data-slot="footer">', `  ${button()}`, "</div>"] : []),
    ]);
  } else if (fw === "angular") {
    // Angular's Card is a component on the element it renders, so `as` is the element you write.
    card = element(
      as.value,
      [
        "appCard",
        `heading="${HEADING}"`,
        headingLevel.value !== 3 && `[headingLevel]="${headingLevel.value}"`,
        // A binding, rather than an attribute that would stay on the element.
        link.value && `[href]="'${HREF}'"`,
      ],
      [
        ...(eyebrow.value ? ["<span eyebrow>Project</span>"] : []),
        ...(media.value ? [IMAGE.replace("<img ", "<img media ")] : []),
        body,
        ...(footer.value ? [button(["appButton", "footer"])] : []),
      ],
    );
  } else {
    const props = [
      as.value !== "article" && `as="${as.value}"`,
      `heading="${HEADING}"`,
      headingLevel.value !== 3 && (fw === "vue" ? `:heading-level="${headingLevel.value}"` : `headingLevel={${headingLevel.value}}`),
      link.value && `href="${HREF}"`,
    ];
    if (jsx) {
      card = element(
        "Card",
        [
          ...props,
          eyebrow.value && 'eyebrow="Project"',
          media.value && `media={${IMAGE}}`,
          footer.value && `footer={${button()}}`,
        ],
        [body],
      );
    } else {
      // How each framework fills a named slot.
      const slot = (name: string, content: string) =>
        fw === "vue"
          ? `<template #${name}>${content}</template>`
          : fw === "svelte"
            ? `{#snippet ${name}()}${content}{/snippet}`
            : content.startsWith("<")
              ? content.replace(/^<(\w+)/, `<$1 slot="${name}"`)
              : `<Fragment slot="${name}">${content}</Fragment>`;
      card = element("Card", props, [
        ...(eyebrow.value ? [slot("eyebrow", "Project")] : []),
        ...(media.value ? [slot("media", IMAGE)] : []),
        body,
        ...(footer.value ? [slot("footer", button())] : []),
      ]);
    }
  }

  return (as.value === "li" ? element("ul", [], card) : card).join("\n");
});
</script>

<template>
  <div class="card-playground not-prose my-5 overflow-hidden rounded-md border border-muted">
    <div class="grid grid-cols-2 gap-3 border-b border-muted p-4 sm:grid-cols-4">
      <UFormField label="Element" size="sm">
        <USelect v-model="as" :items="elements" class="w-full" />
      </UFormField>
      <UFormField label="Heading level" size="sm">
        <USelect v-model="headingLevel" :items="levels" class="w-full" />
      </UFormField>
      <USwitch v-model="link" label="Link" size="sm" class="self-end" />
      <USwitch v-model="media" label="Media" size="sm" class="self-end" />
      <USwitch v-model="eyebrow" label="Eyebrow" size="sm" />
      <USwitch v-model="footer" label="Footer" size="sm" />
    </div>

    <div class="flex min-h-40 items-center justify-center p-6">
      <component :is="as === 'li' ? 'ul' : 'div'" class="m-0 w-full max-w-xs list-none p-0">
        <Card :as="as" heading="Analytical Engine" :heading-level="headingLevel" :href="link ? '#analytical-engine' : undefined">
          <template v-if="eyebrow" #eyebrow>Project</template>
          <template v-if="media" #media><CardExampleArt /></template>
          <p>{{ BODY }}</p>
          <template v-if="footer" #footer><Button size="sm" variant="outline">Save</Button></template>
        </Card>
      </component>
    </div>

    <ProsePre
      :code="code"
      :language="LANGUAGES[framework]"
      :ui="{ root: 'my-0' }"
      class="rounded-none border-0 border-t border-muted"
    >{{ code }}</ProsePre>
  </div>
</template>

<style>
/* The reference tokens use light-dark(), which follows color-scheme: follow the docs' colour mode. */
.card-playground {
  color-scheme: light;
}
.dark .card-playground {
  color-scheme: dark;
}
</style>
