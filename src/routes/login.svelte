<script context="module">
    export const router = false // disabling client side router to run handleSession in hooks
	export async function load({ session }) {
		if (session.user) {
			return {
				status: 302,
				redirect: '/auth/admin'
			};
		}
		return {};
	}
</script>

<script>
    import { goto } from '$app/navigation';
    import { session } from '$app/stores';
    import Swal from 'sweetalert2'

    let user_id, user_pass, totp_token;
    let error;
    async function handleSubmit() {
        const validateForm = () => {
            ["user_id", "user_pass", "totp_token"].forEach(ele => document.querySelector(`#${ele}`).classList.remove("border", "border-danger", "border-3"));
            let inValidList = [];
            if (!user_id) inValidList.push("user_id");
            if (!user_pass) inValidList.push("user_pass");
            if (!totp_token) inValidList.push("totp_token");
            if (inValidList.length > 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: `Please put the ${inValidList.join(", ")}!`,
                    didOpen: () => {
                        inValidList.forEach(ele => document.querySelector(`#${ele}`).classList.add("border", "border-danger", "border-3"));
                    }
                });
                return false;
            }
            return true;
        };
        if (!validateForm()) return;

        const url = '/api/auth/login';
        const method = 'POST';
        const headers = {'content-type':'application/json'};
        const body = JSON.stringify({user_id, user_pass, totp_token});
        const response = await fetch(url, {method, headers, body});

        if(response.status === 401) {
            error = await response.json().then(data => data.error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error,
            });
        } else if(response.status === 200) {
            $session.user = await response.json().then(data => data.user);
            goto("/auth/admin");
        }
    }

</script>

<svelte:head>
	<title>Login</title>
	<meta name="login" content="Login page of the blog of Walker088" />
</svelte:head>

<div class="container d-flex justify-content-center">
    <form on:submit|preventDefault={handleSubmit}>
        <div class="card">
            <div class="card-header"><h4 class="mt-1">Welcome back <i class="bi bi-emoji-smile mt-1"></i></h4></div>
            <div class="card-body text-center">
                <div class="form-outline my-4">
                    <input bind:value={user_id} id="user_id" placeholder="User Name" class="form-control" />
                </div>
                <div class="form-outline mb-4">
                    <input bind:value={user_pass} type="password" id="user_pass" placeholder="Password" class="form-control" />
                </div>
                <div class="form-outline mb-4">
                    <input bind:value={totp_token} type="totp_token" id="totp_token" placeholder="Totp Token" class="form-control" maxlength="6" size="6" />
                </div>
                <span class="text-danger">{#if error}{error}{/if}</span>
            </div>
            <div class="card-footer">
                <input class="btn btn-primary" type="submit" value="Submit">
            </div>
        </div>
    </form>
</div>
