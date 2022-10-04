<script>
	//import { page } from '$app/stores';

	import "bootstrap/dist/css/bootstrap.css";
	import "bootstrap-icons/font/bootstrap-icons.css";
	import "highlight.js/styles/github-dark-dimmed.css";
	import Header from '$lib/layouts/Header.svelte';
	import Footer from '$lib/layouts/Footer.svelte';
	import Analytics from '$lib/layouts/Analytics.svelte';
	import '../app.css';

	export let data;
	let {cv_path, user} = data;
</script>

<Analytics />

<Header bind:cv_path={cv_path} bind:user={user} />

<main>
	<slot></slot>
</main>

<Footer />

<style>
	main {
		max-width: 1024px;
		margin: 0 auto;
	}
</style>
