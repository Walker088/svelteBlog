import { GetPublishedPosts } from "$lib/dao/articles/articles.js";
import dayjs from "dayjs";

export async function get() {
    const siteDomain = `https://${import.meta.env.VITE_DOMAIN_NAME}`;
    const siteName = import.meta.env.VITE_SITE_NAME;
    const siteDesc = import.meta.env.VITE_SITE_DESC;
    const genRssXml = (posts) => `
    <rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
        <channel>
          <title>${siteName}</title>
          <link>${siteDomain}</link>
          <description>${siteDesc}</description>
          <atom:link href="${siteDomain}/rss.xml" rel="self" type="application/rss+xml" />
          ${posts.map( p => `
              <item>
                <title>${p.post_title}</title>
                <description>A blog built with SvelteKit about tech and stuff!</description>
                <link>${siteDomain}/articles/${p.post_title_id}</link>
                <guid>${siteDomain}/articles/${p.post_title_id}</guid>
                <pubDate>${dayjs(p.post_time).format("ddd, DD MMM YYYY HH:mm:ss")} UT</pubDate>
              </item>
              `).join('')}
        </channel>
    </rss>
    `;

    const posts = await GetPublishedPosts();
    const headers = {
        'Cache-Control': 'max-age=0, s-maxage=3600',
        'Content-Type': 'application/xml',
    }
    return {
        headers,
        body: genRssXml(posts),
    }
}