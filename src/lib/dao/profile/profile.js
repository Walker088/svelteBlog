import db from "$lib/dao/sqlite.js"

export async function GetCvPath() {
    return await db.prepare(`SELECT cv_path FROM users WHERE user_id = ?`).get("walker088");
}