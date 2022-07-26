import db from "$lib/db/sqlite.js"

export async function get() {
    const queryIntroduction = `SELECT profile_bio, profile_img  FROM users WHERE user_id = ?`;
    const queryRecentPosts = `
    SELECT
	    a.post_id,
	    a.post_title,
	    a.post_sub_title,
	    a.post_serie,
	    a.post_img,
	    (SELECT json_group_array(tag_name) FROM articales_tags WHERE post_id = a.post_id ORDER BY tag_name) tags,
	    (SELECT json_group_array(lang_name) FROM articales_langs WHERE post_id = a.post_id ORDER BY lang_name) languages,
	    a.created_time post_time
    FROM articales a
    WHERE a.post_status = 'PT'
    GROUP BY a.post_id
    ORDER BY a.created_time DESC LIMIT 3
    `;
    const profileInfo = await db.prepare(queryIntroduction).get('walker088');
    const recentPosts = await db.prepare(queryRecentPosts).all();
    if (profileInfo) {
        return {
            body: {
                home_data: {
                    profileInfo,
                    recentPosts
                }
            }
        }
    }
}