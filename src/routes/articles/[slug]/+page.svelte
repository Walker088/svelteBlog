<script>
    import { page } from "$app/stores";
    import '$lib/css/post_content.css';

    import dayjs from 'dayjs'
	import utc from 'dayjs/plugin/utc.js'
	import tz from 'dayjs/plugin/timezone.js'
	dayjs.extend(utc);
	dayjs.extend(tz);

    export let data;
    let article = data.article || {};
    const badegeOpts = ["bg-primary", "bg-success", "bg-danger", "bg-warning"];
</script>

<svelte:head>
	<title>{article.post_title}</title>
	<meta name="description" content="{article.post_title}, {article.post_sub_title}" />
    <meta name="author" content="walker088" />
</svelte:head>

<div class="container">
    <article>
        <div class="post-header">
            <div class="d-flex flex-row justify-content-between">
                <h1 class="fw-bold">{article.post_title}</h1>
                {#if $page.data.user} <a href="/auth/editor/{article.post_id}"><i class="bi bi-pencil-square fs-2"></i></a> {/if}
            </div>
            <div class="d-flex flex-row">
                <h2 class="fs-5 fw-light text-muted">{article.post_sub_title}</h2>
                <div class="ms-2">{#each JSON.parse(article.tags) as tag, idx} <span class="badge {badegeOpts[idx % badegeOpts.length]} mx-1 mb-2">{tag}</span> {/each}</div>
            </div>
            <div>
                <p><small><em>{dayjs.utc(article.post_time).tz(dayjs.tz.guess()).format('YYYY-MM-DD HH:mm:ss')}</em></small></p>
            </div>
        </div>
        <div class="post-image"><img src="{article.post_img}.lg.webp" class="card-img-top post-image" alt="..."></div>
        <div class="post-content mt-4">{@html article.post_content}</div>
    </article>
</div>

<style>
    .post-image{
  		width: 100%;
  		height: 100%;
  		object-fit: contain;
	}

</style>
