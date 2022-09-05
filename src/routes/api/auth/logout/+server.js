import * as cookie from 'cookie';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET(){
    const jwt_cookie = cookie.serialize("jwt", 'deleted', {
        domain: import.meta.env.VITE_DOMAIN_NAME,
        path: "/",
		expires: new Date(0),
	});

    const status = 302;
    const headers = new Headers();
	headers.append("set-cookie", jwt_cookie);
    headers.append("location", "/login");
    return new Response("",{ headers, status });
}
