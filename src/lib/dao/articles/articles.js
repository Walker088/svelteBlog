import db from "$lib/dao/sqlite.js";
import { markdownCvt } from "$lib/md_converter.js";
import { parse } from 'node-html-parser';

export async function GetPublishedPosts() {
    const query = `
    SELECT
	    a.post_id,
        LOWER(REPLACE(a.post_title, ' ', '-')) post_title_id,
	    a.post_title,
	    a.post_sub_title,
        a.post_content,
	    a.post_serie,
	    a.post_img,
	    (SELECT json_group_array(tag_name) FROM articales_tags WHERE post_id = a.post_id ORDER BY tag_name) tags,
	    (SELECT json_group_array(lang_name) FROM articales_langs WHERE post_id = a.post_id ORDER BY lang_name) languages,
	    COALESCE(a.updated_time, a.created_time) post_time 
    FROM articales a
    WHERE a.post_status = 'PT' 
    ORDER BY COALESCE(a.updated_time, a.created_time) DESC
    `;
    const posts = await db.prepare(query).all().map(p => {
        const rendered = markdownCvt.render(p.post_content);
        const parsed = parse(rendered);
        const post_preview = parsed.querySelector('p').structuredText;
        const { ['post_content']: post_content, ...rest } = p;
        return {...rest, post_preview};
    });
    return posts;
}

export async function GetRecentPosts() {
    return await db.prepare(`
    SELECT
	    a.post_id,
        LOWER(REPLACE(a.post_title, ' ', '-')) post_title_id,
	    a.post_title,
	    a.post_sub_title,
        a.post_content,
	    a.post_serie,
	    a.post_img,
	    (SELECT json_group_array(tag_name) FROM articales_tags WHERE post_id = a.post_id ORDER BY tag_name) tags,
	    (SELECT json_group_array(lang_name) FROM articales_langs WHERE post_id = a.post_id ORDER BY lang_name) languages,
	    COALESCE(a.updated_time, a.created_time) post_time
    FROM articales a
    WHERE a.post_status = 'PT'
    ORDER BY COALESCE(a.updated_time, a.created_time) DESC LIMIT 3
    `).all().map(p => {
        const rendered = markdownCvt.render(p.post_content);
        const parsed = parse(rendered);
        const post_preview = parsed.querySelector('p').structuredText;
        const { ['post_content']: post_content, ...rest } = p;
        return {...rest, post_preview};
    });
}

export async function GetPostByTitle (post_title) {
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
    WHERE UPPER(REPLACE(a.post_title, ' ', '')) = ? AND a.post_status = 'PT'`).get(post_title);
    if(post) post.post_content = markdownCvt.render(post.post_content);
    return post;
};
