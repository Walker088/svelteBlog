import { GetPublishedPosts } from '$lib/dao/articles/articles.js'
import { GetCvPath } from "$lib/dao/profile/profile.js"

export async function get() {
    const website = import.meta.env.VITE_DOMAIN_NAME;
    const genSiteMap = (posts, pages, cv_path) => `<?xml version="1.0" encoding="UTF-8" ?>
    <urlset
      xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
      xmlns:xhtml="https://www.w3.org/1999/xhtml"
      xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
      xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
      xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
    >
      <url>
        <loc>https://${website}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      ${pages.map(p => `
      <url>
        <loc>https://${website}/articles/${p}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      `).join('')}
      <url>
        <loc>https://${website}${cv_path}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      ${posts.map(p => `
      <url>
        <loc>https://${website}/articles/${p.post_title_id}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      `).join('')}
    </urlset>`;

    const posts = await GetPublishedPosts();
    const pages = [`articles`];
    const cv_path = await GetCvPath().then(data => data.cv_path);;
    const headers = {
      'Cache-Control': 'max-age=0, s-maxage=3600',
      'Content-Type': 'application/xml',
    }
    return {
        headers,
        body: genSiteMap(posts, pages, cv_path)
    }
  }