<script>
	import "bootstrap/dist/css/bootstrap.css";
	import "bootstrap-icons/font/bootstrap-icons.css";
	import 'highlight.js/styles/github-dark-dimmed.css';
	import Header from '$lib/layouts/Header.svelte';
	import Footer from '$lib/layouts/Footer.svelte';
	import '../app.css';
</script>

<Header />

<main>
	<slot />
</main>

<Footer />

