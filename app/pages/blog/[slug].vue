<script setup lang="ts">
// One post, from content/blog/<slug>.md. /blog links to each one, and the
// prerender crawler follows those links.
const route = useRoute();
const path = `/blog/${route.params.slug}`;

const { data: post } = await useAsyncData(path, () => queryCollection("blog").path(path).first());

if (!post.value) {
	throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

const { siteUrl } = useRuntimeConfig().public;
const url = `${siteUrl}${path}`;
const { title, description, date, author } = post.value;

// The tags Docus's useSeo() sets, set here instead: it writes an Article node for
// every page whose type is `article`, and a post describes itself once, as the
// BlogPosting below. defineOgImage() adds og:image and the twitter:* tags.
useSeoMeta({
	title,
	description,
	ogTitle: title,
	ogDescription: description,
	ogType: "article",
	ogUrl: url,
	articlePublishedTime: date,
	articleAuthor: [author.name],
});

const ogImages = defineOgImage("Docs.takumi", { headline: "Blog", title, description });
// defineOgImage() returns the image's path when the page renders on the server,
// and nothing once it hydrates in the browser, so the state keeps the server's.
const ogImage = useState(`og-image:${path}`, () => ogImages[0]);

useHead({
	link: [{ rel: "canonical", href: url }],
	script: [
		{
			type: "application/ld+json",
			innerHTML: JSON.stringify({
				"@context": "https://schema.org",
				"@type": "BlogPosting",
				headline: title,
				description,
				datePublished: date,
				author: { "@type": "Person", name: author.name, ...(author.url && { url: author.url }) },
				...(ogImage.value && { image: new URL(ogImage.value, siteUrl).href }),
				url,
				mainEntityOfPage: { "@type": "WebPage", "@id": url },
				// The Organization the homepage describes, by its @id, rather than a copy
				// of it that could drift.
				publisher: { "@id": `${siteUrl}/#organization` },
			}),
		},
	],
});
</script>

<template>
	<UContainer v-if="post" class="py-12 lg:py-20">
		<article class="mx-auto max-w-xl">
			<NuxtLink
				to="/blog"
				class="mb-10 inline-flex items-center gap-1 text-sm text-muted hover:text-default"
			>
				<UIcon name="i-lucide-arrow-left" class="size-4" />
				Back to the blog
			</NuxtLink>

			<header class="border-b border-default pb-8">
				<h1
					class="text-[2rem]/tight font-semibold tracking-tight text-pretty text-highlighted sm:text-5xl/tight"
				>
					{{ post.title }}
				</h1>
				<p class="mt-4 text-xl/relaxed text-pretty text-toned">{{ post.description }}</p>
				<BlogByline :post="post" class="mt-6" />
			</header>

			<!-- Body text a step up from the docs', at 1.125rem and a line height of
           1.7, in a column of about 32em, some 65 to 75 characters a line. -->
			<ContentRenderer
				:value="post"
				class="mt-8 text-lg [&_li]:leading-[1.7] [&_p]:leading-[1.7]"
			/>
		</article>
	</UContainer>
</template>
