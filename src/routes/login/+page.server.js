import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    if (locals.user) throw redirect(302, '/auth/admin');
	return {user: locals.user};
}
