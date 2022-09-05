import { error } from '@sveltejs/kit';


export async function load({ fetch, parent, data }) {
	await parent();
	const res = await fetch("/api/cv.json");
	if (res.ok) {
		const cv_path = await res.text();
		return {
			cv_path: cv_path,
			user: data.user
		};
	}
	throw error(500, "Could not load");
}
