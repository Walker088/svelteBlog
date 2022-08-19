<script context="module">
	export async function load({ fetch }) {
        const res = await fetch("/api/home.json");
        if (res.ok) {
			const { profileInfo, recentPosts } = await res.json().then(data => data.home_data);
            return {
                props: {
                    profileInfo,
					recentPosts,
                },
            };
        }
        return {
            status: res.status,
            error: new Error("Could not load"),
        };
    }
</script>

<script>
	import showdown from 'showdown';
	import dayjs from 'dayjs'
	import utc from 'dayjs/plugin/utc.js'
	import tz from 'dayjs/plugin/timezone.js'
	dayjs.extend(utc);
	dayjs.extend(tz);

	const markdownCvt = new showdown.Converter();
	const badegeOpts = ["bg-primary", "bg-success", "bg-danger", "bg-warning"];
	export let profileInfo;
	export let recentPosts;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="{import.meta.env.VITE_SITE_DESC}"/>
	<meta name="author" content="walker088" />
</svelte:head>

<div class="container introduction">
	<div class="card p-4">{@html markdownCvt.makeHtml(profileInfo.profile_bio)}</div>
</div>

<div class='container recent-posts'>
	<h3 class="my-3"> Recent Posts</h3>
	<div class="row">
		{#each recentPosts as post}
			<div class="col-md-4 col-sm-12 my-1">
				<div class="card">
					<div class="image-container"><img src="{post.post_img}.sm.webp" class="card-img-top post-image" alt="..."></div>
					<div class="card-body">
						{#each JSON.parse(post.tags) as tag, idx} <span class="badge {badegeOpts[idx % badegeOpts.length]} mx-1 mb-2">{tag}</span> {/each}
						<h5 class="card-title">{post.post_title}</h5>
						<h6 class="card-subtitle text-muted">{post.post_sub_title}</h6>
						<div class="d-flex flex-row justify-content-end">
							<a href="/articles/{post.post_title_id}" class="stretched-link" >Read more</a>
						</div>
					</div>
					<div class="card-footer text-muted d-flex justify-content-between">
						<div>
							{#each JSON.parse(post.languages) as lang} <span class="badge rounded-pill bg-dark me-1">{lang}</span> {/each}
						</div>
						<div>
							<p><small><em>{dayjs.utc(post.post_time).tz(dayjs.tz.guess()).format('YYYY-MM-DD HH:mm:ss')}</em></small></p>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.recent-posts {
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex: 1;
	}
	.post-image{
  		width: 100%;
  		height: 100%;
  		object-fit: contain;
	}
	.image-container {
		height: 25vh;
	}
</style>
