<script lang="ts">
  // src/routes/+layout.svelte

  import '../app.css';
  import { settings } from '$lib/stores/settings';
  import { browser } from '$app/environment';

  $: if (browser) {
    document.documentElement.setAttribute('data-theme', $settings.theme);
    document.documentElement.setAttribute('data-font-size', $settings.fontSize);
    document.documentElement.style.setProperty(
      '--font-body',
      `"${$settings.font}", system-ui, sans-serif`
    );
  }
</script>

<slot />
