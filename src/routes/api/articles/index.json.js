import { GetPublishedPosts } from '$lib/dao/articles/articles.js'

export async function get() {
    const articles = await GetPublishedPosts();
    return {
        body: {
            articles
        }
    }
}