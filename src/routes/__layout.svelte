<script>
	import "bootstrap/dist/css/bootstrap.css";
	import "bootstrap-icons/font/bootstrap-icons.css";
	import Header from '$lib/layouts/Header.svelte';
	import Footer from '$lib/layouts/Footer.svelte';
	import '../app.css';
</script>

<Header />

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
