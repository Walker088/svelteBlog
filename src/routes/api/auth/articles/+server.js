import { error } from '@sveltejs/kit';

import db from "$lib/dao/sqlite.js"
import * as cookie from "cookie";
import jwt from "jsonwebtoken"
import sharp from "sharp";

import * as fs from "fs/promises";

const IMG_WIDTH_SM = 315;
const IMG_HEIGHT_SM = 110;
const IMG_WIDTH_LG = 1890;
const IMG_HEIGHT_LG = 660;

const getArticleById = async (post_id) => {
    const articale = await db.prepare(
        `SELECT
            a.post_id,
            a.post_title,
            a.post_sub_title,
            a.post_serie,
            a.post_img,
            (SELECT json_group_array(tag_name) FROM articales_tags WHERE post_id = a.post_id ORDER BY tag_name) post_tags,
            (SELECT json_group_array(lang_name) FROM articales_langs WHERE post_id = a.post_id ORDER BY lang_name) post_langs,
            COALESCE(a.updated_time, a.created_time) post_time,
            a.post_content,
            a.post_status
        FROM articales a
        WHERE a.post_id = ?
        ORDER BY a.created_time DESC`).get(post_id);
    if (articale) {
        articale.post_tags = JSON.parse(articale.post_tags);
        articale.post_langs = JSON.parse(articale.post_langs);
    }
    return articale;
};

export async function GET( {request, url} ) {
    //const post_id = query.get("post_id");
    const post_id = new URL(url).searchParams.get("post_id");
    if (!post_id) {
        throw error(400, "Please provide the post_id");
    }
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    if (!cookies.jwt) {
        throw error(401, "There is no jwt cookie");
    }
    try {
		jwt.verify(cookies.jwt, import.meta.env.VITE_JWT_ACCESS_SECRET);
	} catch(err) {
        throw error(401, err.message);
	}

    const metaInfoQuery = `
    SELECT
	    (SELECT json_group_array (tag_name) FROM tags ORDER BY tag_name) tags,
	    (SELECT json_group_array (lang_name) FROM langs ORDER BY lang_name) langs,
	    (SELECT json_group_array (serie_name) FROM series ORDER BY serie_name) series;
    `;
    const metaInfoResp = await db.prepare(metaInfoQuery).get();
    const tags = JSON.parse(metaInfoResp.tags);
    const langs = JSON.parse(metaInfoResp.langs);
    const series = JSON.parse(metaInfoResp.series);
    const article = await getArticleById(post_id);
    return new Response(JSON.stringify({tags, langs, series, article}));
};

export async function POST(event) {
    const { request, locals } = event;
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    if (!cookies.jwt) {
        throw error(401, "There is no jwt cookie");
    }
    try {
		jwt.verify(cookies.jwt, import.meta.env.VITE_JWT_ACCESS_SECRET);
	} catch(err) {
        throw error(401, err.message);
	}
    const isPostTitleExists = async (title) => {
        const query = "SELECT COUNT(a.post_id) AS ext FROM articales a WHERE UPPER(REPLACE(a.post_title, ' ', '')) = UPPER(REPLACE(?, ' ', ''))";
        const resp = await db.prepare(query).get(title);
        return resp.ext > 0;
    };
    const genNewPostId = async () => {
        const resp = await db.prepare("SELECT COUNT(a.post_id) + 1 AS last_post_id FROM articales a").get();
        return `P${resp.last_post_id.toString().padStart(8, "0")}`;
    };

    try {
        // Save article to db
        let newArticle = await request.formData().then(d => Object.fromEntries(d));
        if (await isPostTitleExists(newArticle.post_title)) {
            throw error(400, "Duplicated Post Title");
        };
        newArticle.post_id = await genNewPostId();
        newArticle.post_tags = newArticle.post_tags.split(",");
        newArticle.post_langs = newArticle.post_langs.split(",");
        newArticle.post_img = `/post_imgs/${newArticle.post_id}/${newArticle.post_img_name}`;
        newArticle.created_user = locals.user.user_id;
        const insertPostStmt = db.prepare(`
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
        `);
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
		    	.resize({ width: IMG_WIDTH_SM, height: IMG_HEIGHT_SM, fit: "contain" })
		    	.webp({quality: 100, lossless: true})
		    	.toFile(`static/post_imgs/${newArticle.post_id}/${newArticle.post_img_name}.sm.webp`);
        await sharp(Buffer.from(imgArrayBuffer))
		    	.resize({ width: IMG_WIDTH_LG, height: IMG_HEIGHT_LG, fit: "contain" })
		    	.webp({quality: 100, lossless: true})
		    	.toFile(`static/post_imgs/${newArticle.post_id}/${newArticle.post_img_name}.lg.webp`);
        return new Response(JSON.stringify({status: "success", message: `Successfully inserted ${newArticle}`, post_id: newArticle.post_id}));
    } catch (err) {
        throw error(400, err.message);
    }
}

export async function PUT(event) {
    const { request, locals } = event;
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    if (!cookies.jwt) {
        throw error(401, "There is no jwt cookie");
    }
    try {
		jwt.verify(cookies.jwt, import.meta.env.VITE_JWT_ACCESS_SECRET);
	} catch(err) {
        throw error(401, err.message);
	}
    const isPostTitleExists = async (title, post_id) => {
        const query = "SELECT COUNT(a.post_id) AS ext FROM articales a WHERE UPPER(REPLACE(a.post_title, ' ', '')) = UPPER(REPLACE(@post_title, ' ', '')) AND a.post_id <> @post_id";
        const resp = await db.prepare(query).get({post_title: title, post_id: post_id});
        return resp.ext > 0;
    };

    try {
        const newArticle = await request.formData().then(d => Object.fromEntries(d));
        let articleInfo = JSON.parse(newArticle.article);
        if (await isPostTitleExists(articleInfo.post_title, articleInfo.post_id)) {
            throw error(400, "Duplicated Post Title");
        };
        articleInfo.update_user = locals.user.user_id;
        const updateArticleStmt = db.prepare(`
            UPDATE 
                articales 
            SET 
                post_title = @post_title,
                post_sub_title = @post_sub_title,
                post_serie = @post_serie,
                post_img = @post_img, 
                post_status = @post_status, 
                post_content = @post_content, 
                updated_time = DATETIME('now'), 
                updated_user = @update_user
            WHERE post_id = @post_id
        `);
        const dropOrgTagsStmt = db.prepare(`DELETE FROM articales_tags WHERE post_id = @post_id;`);
        const dropOrgLangsStmt = db.prepare(`DELETE FROM articales_langs WHERE post_id = @post_id; `);
        const insertTagsStmt = db.prepare(`INSERT INTO articales_tags (post_id, tag_name) VALUES (@post_id, @tag_name);`);
        const insertLangsStmt = db.prepare(`INSERT INTO articales_langs (post_id, lang_name) VALUES (@post_id, @lang_name);`);
        const updatePostTx = db.transaction((post) => {
            updateArticleStmt.run(post);
            dropOrgTagsStmt.run({post_id: post.post_id});
            dropOrgLangsStmt.run({post_id: post.post_id});
            for (const tag of post.post_tags) insertTagsStmt.run({post_id: post.post_id, tag_name: tag});
            for (const lang of post.post_langs) insertLangsStmt.run({post_id: post.post_id, lang_name: lang});
        });
        updatePostTx(articleInfo);
        if (newArticle.image) {
            const imgArrayBuffer = await newArticle.image.arrayBuffer();
            await fs.rm(`static/post_imgs/${articleInfo.post_id}`, {recursive: true, force: true});
            await fs.mkdir(`static/post_imgs/${articleInfo.post_id}`, { recursive: true });
            await sharp(Buffer.from(imgArrayBuffer))
		    	.resize({ width: 315, height: 110, fit: "contain" })
		    	.webp({quality: 100, lossless: true})
		    	.toFile(`static/${articleInfo.post_img}.sm.webp`);
            await sharp(Buffer.from(imgArrayBuffer))
		    	.resize({ width: 945, height: 330, fit: "contain" })
		    	.webp({quality: 100, lossless: true})
		    	.toFile(`static/${articleInfo.post_img}.lg.webp`);
        }
        return new Response(JSON.stringify({status: "success", message: `Successfully inserted ${newArticle}`, article: await getArticleById(articleInfo.post_id)}));
    } catch (err) {
        console.error(err.stack);
        throw error(400, err.message);
    }
}
