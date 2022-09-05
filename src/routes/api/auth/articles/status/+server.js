import { error } from '@sveltejs/kit';

import db from "$lib/db/sqlite.js"
import * as cookie from "cookie";
import jwt from "jsonwebtoken";

const updatePostStatus = async (post_id, post_status, update_user) => {
    await db.prepare(`
    UPDATE articales 
    SET 
        post_status = @post_status,
        updated_user = @update_user,
        updated_time = DATETIME('now') 
    WHERE post_id = @post_id
    `).run({post_id: post_id, post_status: post_status, update_user: update_user});
};

export async function PUT( {request, locals} ) {
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    if (!cookies.jwt) {
        throw error(401, "There is no jwt cookie");
    }
    try {
		jwt.verify(cookies.jwt, import.meta.env.VITE_JWT_ACCESS_SECRET);
	} catch(err) {
        throw error(401, err.message);
	}
    try {
        const reqJson = await request.json();
        await updatePostStatus(reqJson.post_id, reqJson.post_status, locals.user.user_id);
        return new Response(JSON.stringify({status: "success", message: `Successfully updated the status of ${reqJson.post_id} to ${reqJson.post_status}`}));
    } catch (err) {
        console.error(err.stack);
        throw error(400, err.message);
    }
}
