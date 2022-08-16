import db from "$lib/db/sqlite.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as cookie from 'cookie';
import { authenticator } from 'otplib';

export async function post({ request }) {
	const { user_id, user_pass, totp_token } = await request.json();
	if (!user_id || !user_pass) {
		return {status: 401, body: { error: "Please provide user name and user pass"} };
	}
	const saved_user = await db.prepare("SELECT u.user_id, u.user_pass, u.totp_secret, u.profile_img FROM users u WHERE u.user_id = ?").get(user_id);
	if (!saved_user) {
		return {status: 401, body: { error: "There is no such user"} };
	};
	const valid_pass = await bcrypt.compare(user_pass, saved_user.user_pass);
	if (!valid_pass) {
		return {status: 401, body: { error: "Password or Username incorrect" } };
	};
	const valid_totp = authenticator.check(totp_token, saved_user.totp_secret);
	if (!valid_totp) {
		return {status: 401, body: { error: "TOTP token incorrect" } };
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

	return {
		headers: {
			'set-cookie': jwt_cookie
		},
		body: {
            success: true,
			user: {user_id: saved_user.user_id, profile_img: saved_user.profile_img}
        }
	};
}
