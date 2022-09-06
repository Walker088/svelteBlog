
export async function load({ fetch }) {
	const res = await fetch("/api/auth/articles/meta");
	const {tags, series, langs} = await res.json().then(data => 
		({
			"tags": data.tags,
			"series": data.series,
			"langs": data.langs
		}));
	return { tags, series, langs };
}
