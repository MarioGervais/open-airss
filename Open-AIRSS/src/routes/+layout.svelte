<script lang="ts">
  // src/routes/+layout.svelte

  import '../app.css';
  import { settings } from '$lib/stores/settings';
  import { browser } from '$app/environment';

  // Applique le thème et la taille de police sur <html>
  $: if (browser) {
    document.documentElement.setAttribute('data-theme', $settings.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'default-dark'
          : 'catppuccin-latte')
      : $settings.theme
    );
    document.documentElement.setAttribute('data-font-size', $settings.fontSize);
  }
</script>

<slot />
