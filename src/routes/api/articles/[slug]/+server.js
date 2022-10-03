import { error } from '@sveltejs/kit';
import { GetPostByTitle } from "$lib/dao/articles/articles.js";

export async function GET({ params }) {
    const { slug } = params;
    const post_title = slug.replaceAll("-", "").toUpperCase();
    if (!post_title) throw error(404, "No post_title provided");
    
    const article = await GetPostByTitle(post_title);
    if (!article) throw error(404, "Article not found");
    return new Response(JSON.stringify(article));
}


