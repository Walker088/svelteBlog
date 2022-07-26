<script context="module">
    export async function load({ fetch }) {
        const res = await fetch("/api/articles.json");
        if (res.ok) {
			const articles = await res.json().then(data => data.articles);
			const tags = [...new Set(articles.reduce((acc, crr) => [...acc, ...JSON.parse(crr.tags)], []))];
			const series = [...new Set(articles.map(a => a.post_serie))];
            return {
                props: {
                    articles,
					tags,
					series,
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
	import { browser } from "$app/env";
	import { onMount, onDestroy } from 'svelte';
	import MultiSelect from 'svelte-multiselect'

	import dayjs from 'dayjs'
	import utc from 'dayjs/plugin/utc'
	import tz from 'dayjs/plugin/timezone'
	dayjs.extend(utc);
	dayjs.extend(tz);

	export let articles;
	export let tags;
	export let series;

	let isFiltersVisible = true;
	let articleName = "";
	let selectedSerie = "all";
	let selectedTags = [];
	const badegeOpts = ["bg-primary", "bg-success", "bg-danger", "bg-warning"];

	$: selectedPosts =
		articles
			.filter(p => p.post_title.toUpperCase().trim().includes(articleName.toUpperCase().trim()) || p.post_sub_title.toUpperCase().trim().includes(articleName.toUpperCase().trim()))
			.filter(p => p.post_serie === selectedSerie || "all" === selectedSerie)
			.filter(p => selectedTags.every(t => p.tags.includes(t)) || selectedTags.length === 0)

	const clearFilters = () => {
		articleName = "";
		selectedSerie = "all";
		selectedTags = [];
	};
	const toggleFilters = () => isFiltersVisible = !isFiltersVisible;

	onMount(() => {
		isFiltersVisible = localStorage.getItem("isFiltersVisible") ? JSON.parse(localStorage.getItem("isFiltersVisible")) : true;
		articleName = localStorage.getItem("articleName") || "";
		selectedSerie = localStorage.getItem("selectedSerie") && series.includes(localStorage.getItem("selectedSerie")) ? localStorage.getItem("selectedSerie") : "all";
		selectedTags = localStorage.getItem("selectedTags") ? localStorage.getItem("selectedTags").split(',') : []
	});
	onDestroy(() => {
		if (browser) {
			localStorage.setItem("isFiltersVisible", isFiltersVisible);
			localStorage.setItem("articleName", articleName);
			localStorage.setItem("selectedSerie", selectedSerie);
			localStorage.setItem("selectedTags", selectedTags);
		}
	});

</script>

<svelte:head>
	<title>Articles</title>
	<meta name="description" content="Articles of the blog of Walker088" />
</svelte:head>


<div class="container">
	<div class="card col-sm-12 mb-3" name="filters">
		<div class="card-header" on:click="{toggleFilters}">Filters</div>
		{#if isFiltersVisible}
		<div class="card-body">
			<form class="d-flex flex-column">
				<div class="mb-2 col-md-6">
					<label for="searchArticle" class="form-label"><i class="bi bi-book-half"></i> Article Name</label>
					<input bind:value={articleName} type="text" class="form-control" id="searchArticle" placeholder="Search By Article Name">
				  </div>
				<div class="mb-2 col-md-6">
					<div>
						<label for="selSerie" class="col-form-label"><i class="bi bi-journal-richtext"></i> Series</label>
					</div>
					<div>
						<select class="form-select" id="selSerie" title="Menu of Articles' Series" bind:value={selectedSerie}>
							<option value="all" selected>All</option>
							{#each series as serie}
							<option value="{serie}">{serie}</option>
							{/each}
						</select>
					</div>
				</div>
				<div div class="col-md-6">
					<label for="selTags" class="col-form-label"><i class="bi bi-tags"></i> Tags</label>
					<MultiSelect 
						bind:selected={selectedTags}
						options={tags}
						id="selTags"
						outerDivClass="p-2 m-0"
					/>
				</div>
			</form>
		</div>
		{/if}
		<div class="card-footer">
			<button class="btn btn-sm btn-primary mb-1 ms-1" on:click="{clearFilters}"><i class="bi bi-arrow-clockwise"></i> Reset</button>
		</div>
	</div>

	{#each selectedPosts as post}
	<div class="card col-sm-12" name="article">
		<div class="card-body">
			<div class="row">
				<div class="col-sm-12 col-md-2 mb-2">
					<img src="{post.post_img}" class="postImg" alt="...">
				</div>
				<div class="col-sm-12 col-md-10 text-md-start text-sm-center text-xs-center">
					<div class="mb-2">
						<h5>{post.post_title}</h5>
						<h6 class="card-subtitle text-muted">{post.post_sub_title}</h6>
					</div>
					<div>
						{#each JSON.parse(post.tags) as tag, idx} <span class="badge {badegeOpts[idx % badegeOpts.length]} mx-1 mb-2">{tag}</span> {/each}
						{#each JSON.parse(post.languages) as lang} <span class="badge rounded-pill bg-dark me-1">{lang}</span> {/each}
					</div>
					<div><p><small><em>{dayjs.utc(post.post_time).tz(dayjs.tz.guess()).format('YYYY-MM-DD HH:mm:ss')}</em></small></p></div>
					<div class="d-flex flex-row justify-content-end"><a href="/articles/{post.post_id}" class="stretched-link" >Read more</a></div>
				</div>
			</div>
		</div>
	</div>
	{/each}
</div>

<style>
	.postImg{
  		width: 100%;
  		height: 100%;
  		object-fit: scale-down;

		/*object-fit: contain;
  		object-fit: scale-down;
  		object-position: -10% 0;
  		object-fit: none;
  		object-fit: fill;*/
	}
</style>