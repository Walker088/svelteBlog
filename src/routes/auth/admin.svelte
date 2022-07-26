<script context="module">
	export const router = false // disabling client side router to run handleSession in hooks
	export async function load({ session }) {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}

		return {};
	}
</script>

<script>
    import { session } from '$app/stores';
</script>

<svelte:head>
	<title>Admin</title>
	<meta name="login" content="Admin page of the blog of Walker088" />
</svelte:head>

<div class="container">
    <h1>Welcome Back {$session.user.user_id}</h1>
</div>

<style></style>