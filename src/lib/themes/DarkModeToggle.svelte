<script>
    import { onMount } from "svelte";
    import { theme } from "$lib/themes/themeStore.js";

    let currentTheme;

    const sun = `<i class="bi bi-sun-fill"></i>`;
    const moon = `<i class="bi bi-moon-stars"></i>`;
    $: themeIcons = currentTheme === "dark" ? moon : (currentTheme === "light" ? sun : moon);

    const applyTheme = () => {
        const store = localStorage.getItem("theme");
        currentTheme = store || $theme;
        if (currentTheme === "dark") {
            document.body.classList.remove("light");
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
            theme.set("dark");
        } else {
            document.body.classList.remove("dark");
            document.body.classList.add("light");
            localStorage.setItem("theme", "light");
            theme.set("light");
        }
    };
    const toggleTheme = () => {
        const stored = localStorage.getItem("theme");
        if (stored === "dark") {
            localStorage.setItem("theme", "light");
            theme.set("light");
        } else {
            localStorage.setItem("theme", "dark");
            theme.set("dark");
        }
        applyTheme();
    };
    onMount(() => {
        applyTheme();
    });
</script>

<div class="d-flex align-items-center" on:click={toggleTheme} on:keypress={toggleTheme}>
    <span class="navbar-brand fs-5">{@html themeIcons}</span>
</div>
