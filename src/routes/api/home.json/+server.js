import db from "$lib/dao/sqlite.js"
import { GetRecentPosts } from '$lib/dao/articles/articles.js'
import { markdownCvt } from "$lib/md_converter.js";

const queryIntro = async () => {
    let profile = await db.prepare(`SELECT profile_bio, profile_img  FROM users WHERE user_id = ?`).get('walker088');
    profile.profile_bio = markdownCvt.render(profile.profile_bio);
    return profile;
};

export async function GET() {
    const profileInfo = await queryIntro();
    const recentPosts = await GetRecentPosts();
    const resp = JSON.stringify({home_data: {profileInfo: profileInfo, recentPosts: recentPosts}});
    if (profileInfo) {
        return new Response(resp);
    }
}