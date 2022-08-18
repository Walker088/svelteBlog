import db from "$lib/db/sqlite.js"
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import dayjs from 'dayjs';

import * as fs from "fs/promises";

const updateProfile = async (profile) => {
    await db.prepare(`
    UPDATE users 
    SET 
    	profile_bio = @profile_bio,
    	profile_img = @profile_img,
    	cv_path = @cv_path,
    	updated_time = DATETIME('now'),
    	updated_user = @user_id
    WHERE user_id = @user_id
    `).run(profile);
};
const getProfile = async (user_id) => {
    return await db.prepare(`
    SELECT 
	    user_id,
	    profile_bio,
	    profile_img,
	    cv_path
    FROM users WHERE user_id = ?
    `).get(user_id);
};
const getArticles = async (user_id) => {
    const articales = await db.prepare(`
    SELECT
	    a.post_id,
	    a.post_title,
	    a.post_sub_title,
	    a.post_serie,
	    (SELECT group_concat(tag_name) FROM articales_tags WHERE post_id = a.post_id ORDER BY tag_name) post_tags,
	    (SELECT group_concat(lang_name) FROM articales_langs WHERE post_id = a.post_id ORDER BY lang_name) post_langs,
	    a.post_status,
        CASE 
	    	WHEN a.post_status = 'DR' THEN 'DRAFT'
	    	WHEN a.post_status = 'PT' THEN 'PUBLISHED'
	    	WHEN a.post_status = 'DL' THEN 'DELETED'
	    	ELSE 'UNDEFINED'
	    END post_status_text,
	    COALESCE(a.updated_time, a.created_time) post_last_updated_time 
    FROM articales a
    WHERE a.created_user = ?
    ORDER BY COALESCE(a.updated_time, a.created_time) DESC
    `).all(user_id);
    return articales;
};
const getMetaData = async () => {
    const metaInfoResp = await db.prepare(`
    SELECT
	    (SELECT json_group_array (tag_name) FROM tags ORDER BY tag_name) tags,
	    (SELECT json_group_array (lang_name) FROM langs ORDER BY lang_name) langs,
	    (SELECT json_group_array (serie_name) FROM series ORDER BY serie_name) series;
    `).get();
    const tags = JSON.parse(metaInfoResp.tags);
    const langs = JSON.parse(metaInfoResp.langs);
    const series = JSON.parse(metaInfoResp.series);
    return {tags, langs, series};
};

export async function get( {request, locals} ) {
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    if (!cookies.jwt) {
        return {status: 401, body: { error: "There is no jwt cookie"} };
    }
    try {
		jwt.verify(cookies.jwt, import.meta.env.VITE_JWT_ACCESS_SECRET);
	} catch(err) {
		return {status: 401, body: { error: err} };
	}
    const profile = await getProfile(locals.user.user_id);
    const articles = await getArticles(locals.user.user_id);
    const {tags, langs, series} = await getMetaData();
    return {
        body: {
            profile, articles,
			tags, series, langs
        }
    }
}

// handleUpdateProfile
export async function put( {request, locals} ) {
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    if (!cookies.jwt) {
        return {status: 401, body: { error: "There is no jwt cookie"} };
    }
    try {
		jwt.verify(cookies.jwt, import.meta.env.VITE_JWT_ACCESS_SECRET);
	} catch(err) {
		return {status: 401, body: { error: err} };
	}
    try {
        debugger;
        const reqData = await request.formData().then(d => Object.fromEntries(d));
        let newProfile = JSON.parse(reqData.profile);
        newProfile.update_user = locals.user.user_id;
        if (reqData.profile_cv) {
            await fs.rm(`static/cv/${locals.user.user_id}`, {recursive: true, force: true});
            await fs.mkdir(`static/cv/${locals.user.user_id}`, { recursive: true });
            const cv_path = `/cv/${locals.user.user_id}/cv-${dayjs().format('YYYYMMMDD')}.pdf`;
            const pdfArrayBuffer = await reqData.profile_cv.arrayBuffer();
            fs.writeFile(`static${cv_path}`, Buffer.from(pdfArrayBuffer));
            newProfile.cv_path = cv_path;
        }
        if (reqData.profile) {
            await updateProfile(newProfile);
        }
        return {
            body: {status: "success", message: `Successfully updated profile info`, article: await getProfile(locals.user.user_id)}
        }
    } catch (err) {
        console.error(err.stack);
        return {status: 400, body: { error: err.message } };
    }
}
