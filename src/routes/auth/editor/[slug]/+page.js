import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
    const { slug } = params;
    const res = await fetch(`/api/auth/articles?post_id=${slug}`);
    if (res.ok) {
		let res_data = await res.json().then(data => data);
        return {
            tags: res_data.tags,
            langs: res_data.langs,
            series: res_data.series,
            article: res_data.article,
        };
    }
    throw error(404, "Post not found");
}
