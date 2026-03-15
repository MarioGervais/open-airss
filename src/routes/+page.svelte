<script lang="ts">
  // src/routes/+page.svelte

  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { env } from '$env/dynamic/public';
  import { GReaderClient } from '$lib/api/greader';

  let url = env.PUBLIC_API_URL ?? '';
  let username = '';
  let password = '';
  let error = '';
  let loading = false;

  // Si déjà connecté, rediriger vers le reader
  if (browser) {
    const stored = localStorage.getItem('open-airss:credentials');
    if (stored) goto('/reader');
  }

  async function handleLogin() {
    error = '';
    loading = true;

    try {
      const client = new GReaderClient({ url, username, password });
      await client.login();

      // Stocker les credentials (hors token — on re-login à chaque session)
      localStorage.setItem('open-airss:credentials', JSON.stringify({ url, username, password }));

      await goto('/reader');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Login failed.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Open-AIRSS</title>
</svelte:head>

<main class="login-page">
  <div class="login-card">
    <header class="login-card__header">
      <div class="login-card__logo-wrap">
        <svg class="login-card__logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="4" cy="20" r="2.5" fill="currentColor"/>
          <path d="M4 13.5C8.14 13.5 11.5 16.86 11.5 21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M4 7.5C10.5 5.5 18 9.5 20.5 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h1 class="login-card__title">Open-AIRSS</h1>
      <p class="login-card__subtitle">Connect to your RSS server</p>
    </header>

    <div class="login-card__form">
      <div class="login-field">
        <label class="login-field__label" for="url">Server URL</label>
        <input
          id="url"
          class="login-field__input"
          type="url"
          placeholder="https://your-freshrss.example.com"
          bind:value={url}
          disabled={loading}
          autocomplete="url"
        />
      </div>

      <div class="login-field">
        <label class="login-field__label" for="username">Username</label>
        <input
          id="username"
          class="login-field__input"
          type="text"
          placeholder="admin"
          bind:value={username}
          disabled={loading}
          autocomplete="username"
        />
      </div>

      <div class="login-field">
        <label class="login-field__label" for="password">Password</label>
        <input
          id="password"
          class="login-field__input"
          type="password"
          placeholder="••••••••"
          bind:value={password}
          disabled={loading}
          autocomplete="current-password"
          on:keydown={(e) => e.key === 'Enter' && handleLogin()}
        />
      </div>

      {#if error}
        <p class="login-error">{error}</p>
      {/if}

      <button
        class="login-submit"
        on:click={handleLogin}
        disabled={loading || !url || !username || !password}
      >
        {loading ? 'Connecting…' : 'Connect'}
      </button>
    </div>

    <footer class="login-card__footer">
      <p>
        Compatible with <a href="https://freshrss.org" target="_blank" rel="noopener">FreshRSS</a>,
        <a href="https://miniflux.app" target="_blank" rel="noopener">Miniflux</a>,
        and any Google Reader API backend.
      </p>
    </footer>
  </div>
</main>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
    padding: 1.5rem;
  }

  .login-card {
    width: 100%;
    max-width: 380px;
    background: var(--color-sidebar-bg);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 2rem;
  }

  .login-card__header {
    margin-bottom: 1.75rem;
    text-align: center;
  }

  .login-card__logo-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .login-card__logo {
    width: 44px;
    height: 44px;
    color: var(--color-accent);
  }

  .login-card__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.01em;
  }

  .login-card__subtitle {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .login-card__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .login-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .login-field__label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-text-muted);
  }

  .login-field__input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 5px;
    color: var(--color-text);
    font-size: 0.9375rem;
    font-family: inherit;
    transition: border-color 0.15s;
  }

  .login-field__input::placeholder {
    color: var(--color-text-muted);
    opacity: 0.6;
  }

  .login-field__input:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  .login-field__input:disabled {
    opacity: 0.5;
  }

  .login-error {
    font-size: 0.8125rem;
    color: #f38ba8;
    padding: 0.5rem 0.75rem;
    background: rgba(243, 139, 168, 0.1);
    border: 1px solid rgba(243, 139, 168, 0.25);
    border-radius: 4px;
  }

  .login-submit {
    width: 100%;
    padding: 0.625rem;
    background: var(--color-accent);
    color: var(--color-bg);
    border: none;
    border-radius: 5px;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
    margin-top: 0.25rem;
  }

  .login-submit:hover:not(:disabled) {
    opacity: 0.88;
  }

  .login-submit:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .login-card__footer {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  .login-card__footer a {
    color: var(--color-accent);
    text-decoration: none;
  }

  .login-card__footer a:hover {
    text-decoration: underline;
  }
</style>
