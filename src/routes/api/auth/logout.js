import * as cookie from 'cookie';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get(){
    const jwt_cookie = cookie.serialize("jwt", 'deleted', {
        domain: import.meta.env.VITE_DOMAIN_NAME,
        path: "/",
		expires: new Date(0),
	});
    return {
        headers: {
			'set-cookie': jwt_cookie,
            location:'/login'
        },
        status:302
    }
}
