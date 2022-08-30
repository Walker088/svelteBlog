<script>
    import github_logo from "$lib/svg/github.svg";
    import linkedin_logo from "$lib/svg/linkedin.svg";
    import rss_logo from "$lib/svg/rss.svg";
</script>

<div class="container">
    <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
        <p class="mt-0 text-sm">
            © Walker088 2022 | Power by
            <a href="https://kit.svelte.dev/">SvelteKit</a> & <a href="https://getbootstrap.com/">Bootstrap5</a>
        </p>
        <p class="flex items-center mt-0">
            <a class="mx-2" href="https://github.com/Walker088" title="github">
                <img src={github_logo} alt="Github" />
            </a>
            <a class="mx-2" href="https://www.linkedin.com/in/walker088-391429109/" title="linkedin">
                <img src={linkedin_logo} alt="Linkedin" />
            </a>
            <a class="mx-2" href="/rss.xml" title="rssfeed">
                <img src={rss_logo} alt="Rss Feed" />
            </a>
        </p>
    </footer>
</div>

<style>

</style>
