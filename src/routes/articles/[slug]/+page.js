import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
    const { slug } = params;
    const res = await fetch(`/api/articles/${slug}`);
    if (res.ok) {
		const article = await res.json();
        return {
            article,
        };
    }
    throw error(400, "Post not found");
}
