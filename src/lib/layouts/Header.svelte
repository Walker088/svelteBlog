<script>
	import { page } from "$app/stores";
	import DarkModeToggle from "$lib/themes/DarkModeToggle.svelte";

	export let cv_path;
	export let user;
</script>

<div class="container">
	<header class="d-flex justify-content-start">
		<nav class="navbar navbar-expand-lg me-4">
			<ul>
				<li class:active={$page.url.pathname === "/"}>
					<a data-sveltekit-prefetch href="/">Home</a>
				</li>
				<li class:active={$page.url.pathname === "/articles"}>
					<a data-sveltekit-prefetch href="/articles">Articles</a>
				</li>

				{#if cv_path}
				<li class:active={$page.url.pathname === cv_path}>
					<a href="{cv_path}" target="_blank">CV</a>
				</li>
				{/if}

				{#if user}
				<li class:active={$page.url.pathname === "/auth/admin"}>
					<a data-sveltekit-prefetch href="/auth/admin">Admin</a>
				</li>
				<li class:active={$page.url.pathname === "/api/auth/logout"}>
					<a data-sveltekit-prefetch href="/api/auth/logout">Logout</a>
				</li>
				{/if}
			</ul>
		</nav>
		<DarkModeToggle />
	</header>
</div>

<style>
	header {
		width: 100%;
		margin: 0 auto;
	}
	body.dark nav a {
		color: white;
	}

	body.light nav a {
		color: black;
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}
</style>
