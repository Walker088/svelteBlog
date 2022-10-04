<script>
    import { page } from '$app/stores';
    const GA_ID = import.meta.env.VITE_GA_ID;
</script>

<svelte:head>
    {#if !$page.data.user}
    <!-- Google tag (gtag.js) -->
    <meta name="ga-id" content="{GA_ID}"/>
    <script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
    <script>
        const GA_ID = document.querySelector('meta[name="ga-id"]').content;

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', GA_ID);
    </script>
    {/if}
</svelte:head>
