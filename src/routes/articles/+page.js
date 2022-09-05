import { error } from '@sveltejs/kit';

export async function load({ fetch }) {
    const res = await fetch("/api/articles");
    if (res.ok) {
		const articles = await res.json();
		const tags = [...new Set(articles.reduce((acc, crr) => [...acc, ...JSON.parse(crr.tags)], []))];
		const series = [...new Set(articles.map(a => a.post_serie))];
        return {
            articles,
			tags,
			series,
        };
    }
    throw error(500, "Could not load");
}
