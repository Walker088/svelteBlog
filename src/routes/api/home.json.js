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

const queryIntro = async () => {
    let profile = await db.prepare(`SELECT profile_bio, profile_img  FROM users WHERE user_id = ?`).get('walker088');
    profile.profile_bio = markdownCvt.makeHtml(profile.profile_bio);
    return profile;
};
const queryRecentPosts = async () => {
    let posts = await db.prepare(`
    SELECT
	    a.post_id,
        LOWER(REPLACE(a.post_title, ' ', '-')) post_title_id,
	    a.post_title,
	    a.post_sub_title,
	    a.post_serie,
	    a.post_img,
	    (SELECT json_group_array(tag_name) FROM articales_tags WHERE post_id = a.post_id ORDER BY tag_name) tags,
	    (SELECT json_group_array(lang_name) FROM articales_langs WHERE post_id = a.post_id ORDER BY lang_name) languages,
	    a.created_time post_time
    FROM articales a
    WHERE a.post_status = 'PT'
    ORDER BY a.created_time DESC LIMIT 3
    `).all();
    return posts;
};

export async function get() {
    const profileInfo = await queryIntro();
    const recentPosts = await queryRecentPosts();
    if (profileInfo) {
        return {
            body: {
                home_data: {
                    profileInfo,
                    recentPosts
                }
            }
        }
    }
}