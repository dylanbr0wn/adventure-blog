<script lang="ts"> 
    import { onMount } from 'svelte'
    import { theme } from '../store/theme'

    type ThemeType = 'dark' | 'light'

    const THEME_DARK: ThemeType =  'dark'
    const THEME_LIGHT: ThemeType =  'light'
    let currTheme: ThemeType = THEME_DARK


    function toggleTheme() {
        document.documentElement.classList.toggle(THEME_DARK)
        currTheme = localStorage.getItem('theme') === THEME_DARK ? THEME_LIGHT : THEME_DARK
        // Update Storage
        localStorage.setItem('theme', currTheme)
        // Update Store
        theme.set(currTheme)
    }

    onMount(() => {
        if (localStorage.getItem('theme') === THEME_DARK || (!('theme' in localStorage) && window.matchMedia(`(prefers-color-scheme: ${THEME_DARK})`).matches)) {
            // document.documentElement.classList.add(THEME_DARK)
            currTheme = THEME_DARK
        } else {
            // document.documentElement.classList.remove(THEME_DARK)
            currTheme = THEME_LIGHT
        }
        // Update Store
        theme.set(currTheme)
    })
</script>
<div class="my-auto text-neutral-400 ">
			<button
        title={`${$theme === "light" ? "dark":"light" } mode`}
				class="p-2 h-10 w-10 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md relative"
				on:click={toggleTheme}
			>
         {#if $theme === 'light'}

						<div class="absolute mx-auto top-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>

						</div>
        {:else}
						<div class="absolute mx-auto top-2">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
						</div>
            {/if}
			</button>
		</div>