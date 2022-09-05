import { GetPublishedPosts } from '$lib/dao/articles/articles.js'

export async function GET() {
    const articles = await GetPublishedPosts();
    return new Response(JSON.stringify(articles));
}