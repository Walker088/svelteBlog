import { GetCvPath } from "$lib/dao/profile/profile.js"

export async function get() {
    const resp = await GetCvPath();
	return {
        body: {
            cv_path: resp.cv_path
        }
    }
}