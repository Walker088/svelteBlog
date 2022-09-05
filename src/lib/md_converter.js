import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

export const markdownCvt = new MarkdownIt({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (__) {}
        }
        return ''; // use external default escaping
    }
});
