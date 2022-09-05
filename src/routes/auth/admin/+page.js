import { error } from '@sveltejs/kit';

export async function load({ fetch, parent }) {
	await parent();
	const res = await fetch("/api/auth/profile");
	if (res.ok) {
		let res_data = await res.json();
        return {
            profile: res_data.profile,
			articles: res_data.articles,
			//tags: res_data.tags,
			//series: res_data.series,
			//langs: res_data.langs
        };
    }
    throw error(400, "Profile Info not found");
}