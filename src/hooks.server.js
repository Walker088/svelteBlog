import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';

export const handle = async ({ event, resolve }) => {
	const { request, locals } = event
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	try {
		locals.user = cookies.jwt && jwt.verify(cookies.jwt, import.meta.env.VITE_JWT_ACCESS_SECRET);
	} catch(err) {
		locals.user = null
		//console.log(err);
	}
	return await resolve(event);
};
