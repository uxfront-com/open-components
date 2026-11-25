<script setup lang="ts">
// Every post, newest first, each a row with its date, title, standfirst, author
// and reading time. The page is prerendered, so search engines, in-page search and
// readers without JavaScript all see them, and the crawler finds each post from it.
const { data: posts } = await useAsyncData("blog", () =>
	queryCollection("blog").order("date", "DESC").all(),
);

const title = "Blog";
const description =
	"Notes from the Open Components team on building UI components that people, developers and agents can all rely on.";

useSeo({ title, description, type: "website" });
defineOgImage("Docs.takumi", { headline: "Open Components", title, description });
</script>

<template>
	<UContainer class="py-12 lg:py-20">
		<div class="mx-auto max-w-xl">
			<h1 class="text-4xl font-semibold tracking-tight text-highlighted sm:text-5xl">
				{{ title }}
			</h1>
			<p class="mt-4 mb-10 text-lg text-muted">{{ description }}</p>

			<ul>
				<li v-for="post in posts" :key="post.path" class="border-t border-default py-8">
					<article>
						<BlogDate :date="post.date" class="text-sm text-muted" />
						<h2 class="mt-2 text-2xl font-semibold tracking-tight text-highlighted">
							<NuxtLink :to="post.path" class="hover:text-primary">{{ post.title }}</NuxtLink>
						</h2>
						<p class="mt-2 text-lg text-toned">{{ post.description }}</p>
						<BlogByline :post="post" listed class="mt-3" />
					</article>
				</li>
			</ul>
		</div>
	</UContainer>
</template>
