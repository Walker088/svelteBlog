import db from "$lib/db/sqlite.js"
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken'
import sharp from "sharp";

import * as fs from 'fs/promises';

export async function get( {request} ) {
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    if (!cookies.jwt) {
        return {status: 401, body: { error: "There is no jwt cookie"} };
    }
    try {
		jwt.verify(cookies.jwt, import.meta.env.VITE_JWT_SECRET);
	} catch(err) {
		return {status: 401, body: { error: err} };
	}

    const query = `
    SELECT
	    (SELECT json_group_array (tag_name) FROM tags ORDER BY tag_name) tags,
	    (SELECT json_group_array (lang_name) FROM langs ORDER BY lang_name) langs,
	    (SELECT json_group_array (serie_name) FROM series ORDER BY serie_name) series;
    `;
    const resp = await db.prepare(query).get();
    const {tags, series, langs} = resp;
    return {
        body: {
            tags,
            langs,
            series
        }
    }
};

export async function post(event) {
    const { request, locals } = event;
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    if (!cookies.jwt) {
        return {status: 401, body: { error: "There is no jwt cookie"} };
    }
    try {
		jwt.verify(cookies.jwt, import.meta.env.VITE_JWT_SECRET);
	} catch(err) {
		return {status: 401, body: { error: err} };
	}
    const genPostId = async () => {
        const resp = await db.prepare("SELECT COUNT(a.post_id) + 1 AS last_post_id FROM articales a").get();
        return `P${resp.last_post_id.toString().padStart(8, "0")}`;
    };

    try {
        // Save article to db
        let newArticle = await request.formData().then(d => Object.fromEntries(d));
        newArticle.post_id = await genPostId();
        newArticle.post_tags = newArticle.post_tags.split(",");
        newArticle.post_langs = newArticle.post_langs.split(",");
        newArticle.post_img = `/post_imgs/${newArticle.post_id}/${newArticle.post_img_name}`;
        newArticle.created_user = locals.user.user_id;
        const insertPostQuery = `
        INSERT INTO articales (
            post_id,
            post_title,
            post_sub_title,
            post_serie,
            post_img,
            post_status,
            post_content,
            created_time,
            created_user
        )
        VALUES (@post_id, @post_title, @post_sub_title, @post_serie, @post_img, @post_status, @post_content, DATETIME('now'), @created_user)
        `;
        const insertPostStmt = db.prepare(insertPostQuery);
        const insertTagsStmt = db.prepare(`INSERT INTO articales_tags (post_id, tag_name) VALUES (@post_id, @tag_name);`);
        const insertLangsStmt = db.prepare(`INSERT INTO articales_langs (post_id, lang_name) VALUES (@post_id, @lang_name);`);
        const insertPostTx = db.transaction((post) => {
            insertPostStmt.run(post);
            for (const tag of post.post_tags) insertTagsStmt.run({post_id: post.post_id, tag_name: tag});
            for (const lang of post.post_langs) insertLangsStmt.run({post_id: post.post_id, lang_name: lang});
        });
        insertPostTx(newArticle);

        // Save image
        const imgArrayBuffer = await newArticle.image.arrayBuffer();
        fs.mkdir(`./static/post_imgs/${newArticle.post_id}`, { recursive: true });
        await sharp(Buffer.from(imgArrayBuffer))
			.resize({ width: 315, height: 110 })
			.webp()
			.toFile(`./static/post_imgs/${newArticle.post_id}/${newArticle.post_img_name}`);
        return {
            body: {status: "success", message: `Successfully inserted ${newArticle}`, post_id: newArticle.post_id}
        }
    } catch (err) {
        return {status: 400, body: { error: err } };
    }
}

export async function put(event) {
    const { request, locals } = event;
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    if (!cookies.jwt) {
        return {status: 401, body: { error: "There is no jwt cookie"} };
    }
    try {
		jwt.verify(cookies.jwt, import.meta.env.VITE_JWT_SECRET);
	} catch(err) {
		return {status: 401, body: { error: err} };
	}

    const updatedArticle = await request.json();
    const updateQuery = `
    UPDATE articales 
    SET post_serie = ?, post_img = ?, post_status = ?, post_content = ?, updated_time = DATETIME('now'), created_user = ?
    WHERE post_id = ?
    `;
    await db.prepare(updateQuery).run(updatedArticle);
}
