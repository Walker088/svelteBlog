import { error } from '@sveltejs/kit';

export async function load({ fetch }) {
    const res = await fetch("/api/home.json");
    if (res.ok) {
        const { profileInfo, recentPosts } = await res.json().then(data => data.home_data);
        return {
            profileInfo,
            recentPosts,
        };
    }
    throw error(500, "Could not load Home Data");
}
