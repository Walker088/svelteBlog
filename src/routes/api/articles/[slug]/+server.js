import { error } from '@sveltejs/kit';

import db from "$lib/db/sqlite.js"
import { markdownCvt } from "$lib/md_converter.js";

const queryPostByTitle = async (post_title) => {
    let post = await db.prepare(`
    SELECT
        a.post_id,
        a.post_title,
        a.post_sub_title,
        a.post_serie,
        a.post_img,
        (SELECT json_group_array(tag_name) FROM articales_tags WHERE post_id = a.post_id ORDER BY tag_name) tags,
        (SELECT json_group_array(lang_name) FROM articales_langs WHERE post_id = a.post_id ORDER BY lang_name) languages,
        COALESCE(a.updated_time, a.created_time) post_time,
        a.post_content 
    FROM articales a
    WHERE UPPER(REPLACE(a.post_title, ' ', '')) = ? AND a.post_status = 'PT'
    ORDER BY a.created_time DESC`).get(post_title);
    if(post) post.post_content = markdownCvt.render(post.post_content);
    return post;
};

export async function GET({ params }) {
    const { slug } = params;
    const post_title = slug.replaceAll("-", "").toUpperCase();
    
    const article = await queryPostByTitle(post_title);
    if (!article) throw error(404, "Article not found");
    return new Response(JSON.stringify(article));
}


