<script lang="ts">
  // src/lib/components/Toolbar.svelte

  import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import { settings } from '$lib/stores/settings';
  import type { Theme, FontSize, FontFamily } from '$lib/stores/settings';

  const dispatch = createEventDispatcher<{ logout: void }>();

  let showSettings = false;
  let dropdownEl: HTMLDivElement;
  let settingsBtnEl: HTMLButtonElement;

  const themes: { value: Theme; label: string }[] = [
    { value: 'catppuccin-mocha',  label: 'Catppuccin Mocha' },
    { value: 'tokyo-night',       label: 'Tokyo Night' },
    { value: 'rose-pine',         label: 'Rosé Pine' },
    { value: 'catppuccin-latte',  label: 'Catppuccin Latte' },
    { value: 'one-light',         label: 'One Light' },
    { value: 'flexoki-light',     label: 'Flexoki Light' },
  ];

  const fonts: { value: FontFamily; label: string }[] = [
    { value: 'Inter',            label: 'Inter' },
    { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
    { value: 'DM Sans',          label: 'DM Sans' },
    { value: 'Outfit',           label: 'Outfit' },
    { value: 'Nunito',           label: 'Nunito' },
    { value: 'Raleway',          label: 'Raleway' },
    { value: 'IBM Plex Sans',    label: 'IBM Plex Sans' },
    { value: 'Source Sans 3',    label: 'Source Sans 3' },
    { value: 'Figtree',          label: 'Figtree' },
    { value: 'Geist',            label: 'Geist' },
  ];

  const fontSizes: { value: FontSize; label: string }[] = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  function handleThemeChange(e: Event) {
    const value = (e.currentTarget as HTMLSelectElement).value as Theme;
    settings.setTheme(value);
  }

  function handleFontSizeChange(e: Event) {
    const value = (e.currentTarget as HTMLSelectElement).value as FontSize;
    settings.setFontSize(value);
  }

  function handleFontChange(e: Event) {
    const value = (e.currentTarget as HTMLSelectElement).value as FontFamily;
    settings.setFont(value);
  }

  function handleClickOutside(e: MouseEvent) {
    if (!showSettings) return;
    const target = e.target as Node;
    if (dropdownEl && !dropdownEl.contains(target) && settingsBtnEl && !settingsBtnEl.contains(target)) {
      showSettings = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') showSettings = false;
  }

  // Attach/detach listeners when showSettings changes
  $: if (browser) {
    if (showSettings) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeydown);
    } else {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    }
  }

  onDestroy(() => {
    if (!browser) return;
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleKeydown);
  });
</script>

<header class="toolbar">
  <div class="toolbar__left">
    <!-- intentionally empty — titre affiché dans FeedList -->
  </div>

  <div class="toolbar__right">
    <button
      class="toolbar__btn"
      class:toolbar__btn--active={$settings.unreadOnly}
      on:click={() => settings.toggleUnreadOnly()}
      title="Show unread only"
    >
      Unread only
    </button>

    <button
      bind:this={settingsBtnEl}
      class="toolbar__btn"
      on:click={() => (showSettings = !showSettings)}
      title="Settings"
      aria-expanded={showSettings}
    >
      Settings
    </button>

    <button
      class="toolbar__btn toolbar__btn--danger"
      on:click={() => dispatch('logout')}
      title="Disconnect"
    >
      Disconnect
    </button>
  </div>

  {#if showSettings}
    <div bind:this={dropdownEl} class="toolbar__dropdown" role="dialog" aria-label="Settings">
      <div class="toolbar__setting">
        <span class="toolbar__setting-label">Theme</span>
        <select class="toolbar__select" value={$settings.theme} on:change={handleThemeChange}>
          {#each themes as t}
            <option value={t.value}>{t.label}</option>
          {/each}
        </select>
      </div>

      <div class="toolbar__setting">
        <span class="toolbar__setting-label">Font size</span>
        <select class="toolbar__select" value={$settings.fontSize} on:change={handleFontSizeChange}>
          {#each fontSizes as f}
            <option value={f.value}>{f.label}</option>
          {/each}
        </select>
      </div>

      <div class="toolbar__setting">
        <span class="toolbar__setting-label">Font</span>
        <select class="toolbar__select" value={$settings.font} on:change={handleFontChange}>
          {#each fonts as f}
            <option value={f.value}>{f.label}</option>
          {/each}
        </select>
      </div>

      <div class="toolbar__setting toolbar__setting--toggle">
        <span class="toolbar__setting-label">Mark as read on open</span>
        <button
          class="toolbar__toggle"
          class:toolbar__toggle--on={$settings.markReadOnOpen}
          on:click={() => settings.toggleMarkReadOnOpen()}
          role="switch"
          aria-checked={$settings.markReadOnOpen}
        >
          <span class="toolbar__toggle-thumb" />
        </button>
      </div>
    </div>
  {/if}
</header>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    padding: 0 1rem;
    background: var(--color-sidebar-bg);
    border-bottom: 1px solid var(--color-border);
    position: relative;
    z-index: 10;
    flex-shrink: 0;
  }

  .toolbar__left,
  .toolbar__right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .toolbar__btn {
    background: none;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 0.25rem 0.6rem;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: color 0.1s, border-color 0.1s;
  }

  .toolbar__btn:hover {
    color: var(--color-text);
    border-color: var(--color-border);
  }

  .toolbar__btn--active {
    color: var(--color-accent);
    border-color: var(--color-accent);
  }

  .toolbar__btn--danger:hover {
    color: #f38ba8;
    border-color: #f38ba8;
  }

  /* Dropdown settings */
  .toolbar__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 1rem;
    background: var(--color-sidebar-bg);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 240px;
    z-index: 20;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .toolbar__setting {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .toolbar__setting-label {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .toolbar__select {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.8125rem;
    color: var(--color-text);
    font-family: inherit;
    cursor: pointer;
  }

  .toolbar__select:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  /* Toggle switch */
  .toolbar__toggle {
    position: relative;
    width: 36px;
    height: 20px;
    background: var(--color-border);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
    padding: 0;
  }

  .toolbar__toggle--on {
    background: var(--color-accent);
  }

  .toolbar__toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
    display: block;
  }

  .toolbar__toggle--on .toolbar__toggle-thumb {
    transform: translateX(16px);
  }
</style>
