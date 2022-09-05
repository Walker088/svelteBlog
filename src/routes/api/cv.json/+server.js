import { GetCvPath } from "$lib/dao/profile/profile.js"

export async function GET() {
    const resp = await GetCvPath();
    return new Response(resp.cv_path);
}