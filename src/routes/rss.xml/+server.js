import { GetPublishedPosts } from "$lib/dao/articles/articles.js";
import dayjs from "dayjs";

export async function GET({ setHeaders }) {
    setHeaders({
        'Cache-Control': `max-age=0, s-max-age=600`,
        'Content-Type': `application/xml`
    });

    const siteDomain = `https://${import.meta.env.VITE_DOMAIN_NAME}`;
    const siteName = import.meta.env.VITE_SITE_NAME;
    const siteDesc = import.meta.env.VITE_SITE_DESC;
    const genRssXml = (posts) => `
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
        <channel>
          <title>${siteName}</title>
          <link>${siteDomain}</link>
          <description>${siteDesc}</description>
          <atom:link href="${siteDomain}/rss.xml" rel="self" type="application/rss+xml" />
          ${posts.map( p => `
              <item>
                <title>${p.post_title}</title>
                <description>${p.post_sub_title}</description>
                <content:encoded>${p.post_preview}</content:encoded>
                <link>${siteDomain}/articles/${p.post_title_id}</link>
                <guid>${siteDomain}/articles/${p.post_title_id}</guid>
                <pubDate>${dayjs(p.post_time).format("ddd, DD MMM YYYY HH:mm:ss")} UT</pubDate>
              </item>
              `).join('')}
        </channel>
    </rss>
    `;

    const posts = await GetPublishedPosts();
    return new Response(genRssXml(posts));
}