import db from "$lib/db/sqlite.js"
import { GetRecentPosts } from '$lib/dao/articles/articles.js'

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

export async function GET() {
    const profileInfo = await queryIntro();
    const recentPosts = await GetRecentPosts();
    const resp = JSON.stringify({home_data: {profileInfo: profileInfo, recentPosts: recentPosts}});
    if (profileInfo) {
        return new Response(resp);
    }
}