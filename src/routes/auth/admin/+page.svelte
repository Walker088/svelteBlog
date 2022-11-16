<script>
	import { markdownCvt } from "../md_converter.js";
	import Swal from 'sweetalert2';
	import { page } from '$app/stores';
	import { Datatable } from 'svelte-simple-datatables';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	onMount(() => { mounted = true; });
	let mounted = false;

	export let data;
	let profile = data.profile || {};
	let articles = data.articles || [];

	let showArticlesCard = true;
	let rows;
	let settings = {
		sortable: true,
        pagination: true,
        rowsPerPage: 10,
        columnFilter: true,
        scrollY: false
	}

	let typingTimer;
	const handleMdPreview = () => {
		clearTimeout(typingTimer);
		typingTimer = setTimeout(() => {
			profile_bio_rendered = markdownCvt.render(profile.profile_bio);
		}, 1000);
	};
	const handleTab = (event) => {
		if (event.key === "Tab") {
			event.preventDefault();
			const textArea = event.currentTarget;
			const start = textArea.selectionStart;
    		const end = textArea.selectionEnd;
			textArea.value = `${textArea.value.substr(0, start)}    ${textArea.value.substr(end)}`;
			textArea.selectionStart = textArea.selectionEnd = start + 4;
		};
	};
	const updatePostStatus = async (e) => {
		const post_id = e.target.getAttribute('post_id');
		const post_status = e.target.getAttribute('value');
		const response = await fetch('/api/auth/articles/status', {
    		method: 'PUT',
    		body: JSON.stringify({post_id: post_id, post_status: post_status}),
			headers: {"Content-Type": "application/json"}
  		});
		if(response.status === 401) goto(`/login`);
		if(response.status === 200) {
			Swal.fire({ icon: 'success', title: 'Successed!' });
			const objIndex = articles.findIndex(obj => obj.post_id === post_id);
			if (objIndex === -1) return;
			const post_status_text = post_status === "DR" ? "DRAFT" : "PUBLISHED";
			const updatedObj = { ...articles[objIndex], post_status: post_status, post_status_text: post_status_text};
			articles = [
				...articles.slice(0, objIndex),
  				updatedObj,
  				...articles.slice(objIndex + 1),
			]
        } else {
			const error = await response.json().then(data => data.error);
			Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: JSON.stringify(error),
            });
		}
	};
	const handleUpdateProfile = async () => {
		let profileInfo = new FormData();
		if (profile_cv.length > 0) {
			profileInfo.append("profile_cv", profile_cv[0]);
		}
		profileInfo.append("profile", JSON.stringify(profile));
		const response = await fetch('/api/auth/profile', {
    		method: 'PUT',
    		body: profileInfo
  		});
		if(response.status === 401) goto(`/login`);
		if(response.status === 200) {
			profile = await response.json().then(data => data.profile);
			Swal.fire({
				icon: 'success',
				title: 'Successed!'
			});
        } else {
			const error = await response.json().then(data => data.error);
			Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: JSON.stringify(error),
            });
		}
	};

	let showProfileCard = true;
	let profile_cv = [];
	let profile_bio_rendered = profile.profile_bio ? markdownCvt.render(profile.profile_bio) : "";
</script>

<svelte:head>
	<title>Admin</title>
	<meta name="login" content="Admin page of the blog of Walker088" />
</svelte:head>

<div class="container">
    <h1>Welcome Back {$page.data.user.user_id}</h1>

	<form class="my-3" on:submit|preventDefault={handleUpdateProfile}>
		<div class="card">
			<div
				class="card-header"
				on:click="{() => showProfileCard = !showProfileCard}"
				on:keypress="{() => showProfileCard = !showProfileCard}"
			>
				<i class="bi bi-mailbox me-2"></i> Update Profile Bio
			</div>
			{#if showProfileCard}
			<div transition:fade class="card-body" >
				<div class="mb-2">
					<label class="btn btn-sm btn-primary" for="profile_cv">
						<i class="bi bi-cloud-arrow-up-fill"></i> Upload a CV (PDF)
					</label>
					<input bind:files={profile_cv} class="d-none" type="file" id="profile_cv" accept=".pdf">
					<small id="post_img_name" class="align-bottom text-secondary">{profile_cv.length > 0 ? profile_cv[0].name : "No pdf has been selected yet"}</small>
				</div>
				<div class="markdown-editor d-flex flex-column flex-lg-row justify-content-between">
					<div class="markdown-editor__panel">
						<textarea class="markdown-editor__textarea" bind:value={profile.profile_bio} on:keydown={handleTab} on:change={handleMdPreview}/>
					</div>
					<div class="markdown-editor__panel">
						<div class="markdown-editor__result-html overflow-auto">
							{@html profile_bio_rendered}
						</div>
					</div>
				</div>
			</div>
			<div class="card-footer">
				<input class="btn btn-primary" type="submit" value="UpdateProfile">
			</div>
			{/if}
		</div>
	</form>

	<div class="card">
		<div
			class="card-header" 
			on:click="{() => showArticlesCard = !showArticlesCard}"
			on:keypress="{() => showArticlesCard = !showArticlesCard}"
		>
			<i class="bi bi-mailbox me-2"></i> Articles 
			<a href="/auth/editor" class="btn btn-xs btn-info ms-2 mb-1" ><i class="bi bi-pencil-square"></i> Create New Post</a>
		</div>
		{#if !mounted}
			<div class="loader">Loading Article List...</div>
		{:else}
			{#if showArticlesCard}
			<div transition:fade class="card-body">
				<Datatable settings={settings} data={articles} bind:dataRows={rows}>
					<thead>
						<th data-key="post_title">Title</th>
						<th data-key="post_serie">Serie</th>
						<th data-key="post_tags">Tags</th>
						<th data-key="post_langs">Languages</th>
						<th data-key="post_status">Status</th>
						<th data-key="post_last_updated_time">LastUpdatedTime</th>
						<th> </th>
					</thead>
					<tbody>
					{#if rows}
						{#each $rows as row}
						<tr>
							<td>{row.post_title}</td>
							<td>{row.post_serie}</td>
							<td>{row.post_tags}</td>
							<td>{row.post_langs}</td>
							<td>{row.post_status_text}</td>
							<td>{row.post_last_updated_time}</td>
							<td>
								{#if row.post_status === "DR"}
								<button class="btn btn-sm btn-primary" value="PT" post_id="{row.post_id}" on:click|capture="{updatePostStatus}"><i class="bi bi-cloud-arrow-up-fill"></i> Publish</button>
								{:else if row.post_status === "PT"}
								<button class="btn btn-sm btn-danger" value="DR" post_id="{row.post_id}" on:click|capture="{updatePostStatus}"><i class="bi bi-archive-fill"></i> Retract</button>
								{/if}
								<a href="/auth/editor/{row.post_id}" class="btn btn-sm btn-warning" ><i class="bi bi-pencil-square"></i> Edit</a>
							</td>
						</tr>
						{/each}
					{/if}
					</tbody>
				</Datatable>
			</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.loader {
		height: 20vh;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		display: grid;
		place-items: center;
		background-color: inherit;
		z-index: 9999;
	}

	.markdown-editor {
		box-sizing: border-box;
		height: 100vh;
		width: 100%;
	}
	
	.markdown-editor__panel {
		box-sizing: inherit;
		min-height: 50vh;
		max-height: 100%;
		min-width: 50%;
		max-width: 100%;
	}
	
	.markdown-editor__textarea, .markdown-editor__result-html {
		box-sizing: inherit;
		padding: 1rem;
		height: 100%;
		width: 100%;
	}

	.markdown-editor__textarea {
		background-color: #f2f2f2;
		border: 1px solid #00000008;
	}

	.markdown-editor__result-html {
		border: 1px solid black;
	}

</style>