import { error } from '@sveltejs/kit';

import db from "$lib/dao/sqlite.js"
import { bcryptVerify } from 'hash-wasm';
import jwt from 'jsonwebtoken'
import * as cookie from 'cookie';
import { authenticator } from 'otplib';

export async function POST({ request, locals }) {
	const { user_id, user_pass, totp_token } = await request.json();
	if (!user_id || !user_pass) {
		throw error(401, "Please provide user name and user pass");
	}
	const saved_user = await db.prepare("SELECT u.user_id, u.user_pass, u.totp_secret, u.profile_img FROM users u WHERE u.user_id = ?").get(user_id);
	if (!saved_user) {
		throw error(401, "There is no such user");
	};
	const valid_pass = await bcryptVerify({ password: user_pass, hash: saved_user.user_pass, });
	if (!valid_pass) {
		throw error(401, "Password or Username incorrect");
	};
	const valid_totp = authenticator.check(totp_token, saved_user.totp_secret);
	if (!valid_totp) {
		throw error(401, "TOTP token incorrect");
	}

	const token = jwt.sign(
		{ "user_id": user_id, "profile_img": saved_user.profile_img || "" },
		import.meta.env.VITE_JWT_ACCESS_SECRET,
		{
			algorithm: "HS256",
			expiresIn: parseInt(import.meta.env.VITE_JWT_EXPIRY_SEC),
		}
	);
	const jwt_cookie = cookie.serialize("jwt", token, {
		domain: import.meta.env.VITE_DOMAIN_NAME,
		path: "/",
		httpOnly: true,
		maxAge: parseInt(import.meta.env.VITE_JWT_EXPIRY_SEC),
		sameSite: "strict",
		secure: "true" === import.meta.env.VITE_JWT_COOKIE_SECURE,
		//secure: true,
	});

	locals.user = {user_id: saved_user.user_id, profile_img: saved_user.profile_img};
	const headers = new Headers();
	headers.append('set-cookie', jwt_cookie);
	return new Response(
		JSON.stringify({success: true}),
		{ headers }
	);
}
