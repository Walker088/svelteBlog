import { error } from '@sveltejs/kit';

import * as cookie from 'cookie';
import jwt from 'jsonwebtoken'
import dayjs from 'dayjs'

export async function GET(event) {
    const { request, locals } = event;

    // Parse the cookie from the request header
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    if (!cookies.jwt) {
		throw error(401, "There is no jwt cookie");
    }

    // Verify the current jwt token and extract the encoded data from it
    let payload;
    try {
		payload = jwt.verify(cookies.jwt, import.meta.env.VITE_JWT_ACCESS_SECRET);
	} catch(err) {
		throw error(401, err.message);
	}

    // Return if there is more than 60 sec. from the expiration time of the token
    if (dayjs.unix(payload.exp).diff(dayjs(), "second") > 60) {
		return Response({ success: true, message: "The current token has not about to been expired yet"});
    }

    const newToken = jwt.sign(locals.user, import.meta.env.VITE_JWT_ACCESS_SECRET, {
		algorithm: "HS256",
		expiresIn: import.meta.env.VITE_JWT_EXPIRY_SEC,
	});
    const jwt_cookie = cookie.serialize("jwt", newToken, {
		domain: import.meta.env.VITE_DOMAIN_NAME,
		path: "/",
		httpOnly: true,
		maxAge: parseInt(import.meta.env.VITE_JWT_EXPIRY_SEC),
		sameSite: "strict",
        secure: "true" === import.meta.env.VITE_JWT_COOKIE_SECURE,
	});

	const headers = new Headers();
	headers.append('set-cookie', jwt_cookie);
	return new Response(
		JSON.stringify({
            success: true,
			message: "ok"
        }),
		{ headers }
	);
}