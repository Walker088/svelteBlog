import db from "$lib/db/sqlite.js"

export async function get() {
    const resp = await db.prepare(`SELECT cv_path FROM users WHERE user_id = ?`).get("walker088");
	return {
        body: {
            cv_path: resp.cv_path
        }
    }
}