import db from "$lib/db/sqlite.js"

export async function GetCvPath() {
    return await db.prepare(`SELECT cv_path FROM users WHERE user_id = ?`).get("walker088");
}