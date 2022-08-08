import db from "$lib/db/sqlite.js"
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken'

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