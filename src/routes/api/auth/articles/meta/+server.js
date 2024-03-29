import { error } from '@sveltejs/kit';

import db from "$lib/dao/sqlite.js"
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken'

export async function GET( {request} ) {
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    if (!cookies.jwt) {
        throw error(401, "There is no jwt cookie");
    }
    try {
		jwt.verify(cookies.jwt, import.meta.env.VITE_JWT_ACCESS_SECRET);
	} catch(err) {
        throw error(401, err.message);
	}

    const query = `
    SELECT
	    (SELECT json_group_array (tag_name) FROM tags ORDER BY tag_name) tags,
	    (SELECT json_group_array (lang_name) FROM langs ORDER BY lang_name) langs,
	    (SELECT json_group_array (serie_name) FROM series ORDER BY serie_name) series;
    `;
    //const resp = await db.prepare(query).get();
    //const {tags, series, langs} = resp;
    const metaInfoResp = await db.prepare(query).get();
    const tags = JSON.parse(metaInfoResp.tags);
    const langs = JSON.parse(metaInfoResp.langs);
    const series = JSON.parse(metaInfoResp.series);
    return new Response(JSON.stringify({tags, langs, series}));
};