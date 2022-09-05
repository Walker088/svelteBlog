<script>
	import '$lib/css/post_content.css';

    import { createMD5 } from 'hash-wasm';
	import MultiSelect from 'svelte-multiselect';
	import Swal from 'sweetalert2';

	import hljs from "highlight.js";
	import showdown from 'showdown';
	showdown.extension('codehighlight', function() {
		function htmlunencode(text) {
    		return (
      			text
  		      	.replace(/&amp;/g, '&')
  		      	.replace(/&lt;/g, '<')
  		      	.replace(/&gt;/g, '>')
  		    );
  		};
		return [
    		{
    		  	type: 'output',
    		  	filter: function (text, converter, options) {
    		  	  	// use new shodown's regexp engine to conditionally parse codeblocks
    		  	  	var left  = '<pre><code\\b[^>]*>',
    		  	  	    right = '</code></pre>',
    		  	  	    flags = 'g',
    		  	  	replacement = function (wholeMatch, match, left, right) {
    		  	      	// unescape match to prevent double escaping
    		  	      	match = htmlunencode(match);
    		  	      	return left + hljs.highlightAuto(match).value + right;
    		  	    };
    		  	  	return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
    		  	}
    		}
  		];
	});
	const markdownCvt = new showdown.Converter({extensions: ['codehighlight']});

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
    async function handleUpdatePost() {
		const generateImageHash = async (file) => {
			let hasher = await createMD5();
			const chunkSize = 64 * 1024 * 1024;
			const chunkNumber = Math.floor(file.size / chunkSize);
			const fileReader = new FileReader();
			const hashChunk = (chunk) => {
				return new Promise((resolve, reject) => {
    				fileReader.onload = async(e) => {
    				  	const view = new Uint8Array(e.target.result);
    				  	hasher.update(view);
    				  	resolve();
    				};
    				fileReader.readAsArrayBuffer(chunk);
  				});
			};
			for (let i = 0; i <= chunkNumber; i++) {
    			const chunk = file.slice(
      				chunkSize * i,
      				Math.min(chunkSize * (i + 1), file.size)
    			);
    			await hashChunk(chunk);
  			}
			const hash = `${hasher.digest()}`;
			return Promise.resolve(hash);
		};
		const validateForm = () => {
			["post_title", "post_sub_title", "post_tags", "post_langs", "post_status_div", "post_img_name"]
				.forEach(ele => document.querySelector(`#${ele}`).classList.remove("border", "border-danger", "border-3"));

            let inValidList = [];
            if (!article.post_title) inValidList.push("post_title");
            if (!article.post_sub_title) inValidList.push("post_sub_title");
			if (article.post_tags.length < 1) inValidList.push("post_tags");
			if (article.post_langs.length < 1) inValidList.push("post_langs");
			if (!article.post_status) inValidList.push("post_status_div");
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
		let newArticle = new FormData();
		if (post_img_file.length > 0) {
			const img_name = await generateImageHash(post_img_file[0]).then(hash => hash);
			article.post_img = `/post_imgs/${article.post_id}/${img_name}`;
			newArticle.append("image", post_img_file[0]);
		}
		newArticle.append("article", JSON.stringify(article));
		const response = await fetch('/api/auth/articles', {
    		method: 'PUT',
    		body: newArticle
  		});
		if(response.status === 401) goto(`/login`);
		if(response.status === 200) {
			article = await response.json().then(data => data.article);
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

    let post_img_file = [];
	export let data;
	let tags = data.tags || [];
    let langs = data.langs || [];
    let series = data.series || [];
    let article = data.article || {};
    $: post_content_rendered = markdownCvt.makeHtml(article.post_content);
</script>

<svelte:head>
	<title>Edit: {article.post_title}</title>
	<meta name="description" content="Edition, {article.post_title}" />
</svelte:head>

<form on:submit|preventDefault={handleUpdatePost}>
	<div class="card mb-2">
		<div class="card-header"><i class="bi bi-mailbox me-2"></i>Update Post ({article.post_id})</div>
		<div class="card-body">
			<div class="form-outline d-flex flex-column border-bottom mb-3">
				<div class="mb-2">
					<label class="btn btn-sm btn-primary" for="post_img">
						<i class="bi bi-cloud-arrow-up-fill"></i> Upload Post Image
					</label>
					<input bind:files={post_img_file} class="d-none" type="file" id="post_img" accept=".webp, .jpeg, .jpg, .png">
					<small id="post_img_name" class="align-bottom text-secondary">{post_img_file.length > 0 ? post_img_file[0].name : "No image has been selected yet"}</small>
				</div>
				<input bind:value={article.post_title} id="post_title" placeholder="Post Title" class="form-control form-control-sm mb-2" />
				<input bind:value={article.post_sub_title} id="post_sub_title" placeholder="Post Sub Title" class="form-control form-control-sm mb-2"/>
				<select on:change="{e => e.target.style.color=`black`}" bind:value={article.post_serie} id="post_serie" class="form-control form-control-sm mb-2">
					<option class="text-muted" value="" disabled selected>Select Post Serie</option>
					{#each series as s}
					<option value={s}> {s}</option>
					{/each}
				</select>
				<div style="font-size: 0.875rem;">
					<MultiSelect 
						bind:selected={article.post_tags}
						options={tags}
						id="post_tags"
						placeholder="Post Tags"
						outerDivClass="p-1 mt-0 mb-2 form-control form-control-sm"
						--sms-placeholder-color="grey"
					/>
					<MultiSelect 
						bind:selected={article.post_langs}
						options={langs}
						id="post_langs"
						placeholder="Post Languages"
						outerDivClass="p-1 mt-0 mb-2 form-control form-control-sm"
						--sms-placeholder-color="grey"
					/>
				</div>
				<div class="d-flex flex-row" id="post_status_div">
					<div class="form-check form-check-inline">
						<input class="form-check-input" type="radio" bind:group={article.post_status} name="post_status" id="post_status_publish" value="PT">
						<label class="form-check-label" for="post_status_publish">Publish</label>
					</div>
					<div class="form-check form-check-inline">
						<input class="form-check-input" type="radio" bind:group={article.post_status} name="post_status" id="post_status_draft" value="DR">
						<label class="form-check-label" for="post_status_draft">Draft</label>
					</div>
				</div>
			</div>
			<div class="post-image"><img src="{article.post_img}.lg.webp" class="card-img-top post-image" alt="..."></div>
			<div class="markdown-editor d-flex flex-column flex-lg-row justify-content-between">
				<div class="markdown-editor__panel">
					<textarea class="markdown-editor__textarea" bind:value={article.post_content} on:keydown={handleTab}/>
				</div>
				<div class="markdown-editor__panel">
					<div class="markdown-editor__result-html overflow-auto post-content">
						{@html post_content_rendered}
					</div>
				</div>
			</div>
		</div>
		<div class="card-footer">
			<input class="btn btn-primary" type="submit" value="Update Post">
		</div>
	</div>
</form>

<style>	
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

	#post_serie {
		color:grey;
	}

</style>

