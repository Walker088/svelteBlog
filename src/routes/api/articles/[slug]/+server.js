import { error } from '@sveltejs/kit';

import db from "$lib/db/sqlite.js"
import showdown from 'showdown';
import hljs from "highlight.js";
showdown.extension('codehighlight', function() {
    function htmlunencode(text) {
        return (
              text
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
          );
      };
    return [
        {
              type: 'output',
              filter: function (text, converter, options) {
                    // use new shodown's regexp engine to conditionally parse codeblocks
                    var left  = '<pre><code\\b[^>]*>',
                        right = '</code></pre>',
                        flags = 'g',
                    replacement = function (wholeMatch, match, left, right) {
                        // unescape match to prevent double escaping
                        match = htmlunencode(match);
                        return left + hljs.highlightAuto(match).value + right;
                  };
                    return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
              }
        }
      ];
});
const markdownCvt = new showdown.Converter({extensions: ['codehighlight']});

const queryPostByTitle = async (post_title) => {
    let post = await db.prepare(`
    SELECT
        a.post_id,
        a.post_title,
        a.post_sub_title,
        a.post_serie,
        a.post_img,
        (SELECT json_group_array(tag_name) FROM articales_tags WHERE post_id = a.post_id ORDER BY tag_name) tags,
        (SELECT json_group_array(lang_name) FROM articales_langs WHERE post_id = a.post_id ORDER BY lang_name) languages,
        COALESCE(a.updated_time, a.created_time) post_time,
        a.post_content 
    FROM articales a
    WHERE UPPER(REPLACE(a.post_title, ' ', '')) = ? AND a.post_status = 'PT'
    ORDER BY a.created_time DESC`).get(post_title);
    if(post) post.post_content = markdownCvt.makeHtml(post.post_content);
    return post;
};

export async function GET({ params }) {
    const { slug } = params;
    const post_title = slug.replaceAll("-", "").toUpperCase();
    
    const article = await queryPostByTitle(post_title);
    if (!article) throw error(404, "Article not found");
    return new Response(JSON.stringify(article));
}


