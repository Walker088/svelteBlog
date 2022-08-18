<script context="module">

	export async function load({ fetch }) {
		const res = await fetch("/api/cv.json");
		if (res.ok) {
			const cv_path = await res.json().then(data => data.cv_path);
			return {
				props: { cv_path: cv_path }
			};
		}
		return {
            status: res.status,
            error: new Error("Could not load"),
        };
	}
</script>

<script>
	import "bootstrap/dist/css/bootstrap.css";
	import "bootstrap-icons/font/bootstrap-icons.css";
	import Header from '$lib/layouts/Header.svelte';
	import Footer from '$lib/layouts/Footer.svelte';
	import '../app.css';

	export let cv_path; 
</script>

<Header bind:cv_path={cv_path} />

<main>
	<slot />
</main>

<Footer />

<style>
	main {
		max-width: 1024px;
		margin: 0 auto;
	}
</style>
