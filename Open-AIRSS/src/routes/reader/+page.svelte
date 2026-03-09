<script lang="ts">
  // src/routes/reader/+page.svelte

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  import { GReaderClient } from '$lib/api/greader';
  import type { Credentials } from '$lib/api/types';

  import FeedList from '$lib/components/FeedList.svelte';
  import ArticleList from '$lib/components/ArticleList.svelte';
  import ArticleView from '$lib/components/ArticleView.svelte';
  import Toolbar from '$lib/components/Toolbar.svelte';

  import {
    setCategories,
    selectedFeedId,
    decrementUnread,
    resetUnread,
  } from '$lib/stores/feeds';

  import {
    setArticles,
    appendArticles,
    selectArticle,
    markArticleRead,
    markArticleUnread,
    toggleArticleStar,
    markAllRead,
    selectedArticle,
    continuation,
    isLoadingArticles,
    isLoadingMore,
  } from '$lib/stores/articles';

  import { settings } from '$lib/stores/settings';

  let client: GReaderClient | null = null;

  // -------------------------------------------------------------------------
  // Init
  // -------------------------------------------------------------------------

  onMount(async () => {
    if (!browser) return;

    const stored = localStorage.getItem('open-airss:credentials');
    if (!stored) {
      await goto('/');
      return;
    }

    const credentials: Credentials = JSON.parse(stored);
    client = new GReaderClient(credentials);

    try {
      await client.login();
      await loadFeeds();
      await loadArticles();
    } catch {
      // Credentials invalides ou serveur inaccessible
      localStorage.removeItem('open-airss:credentials');
      await goto('/');
    }
  });

  // -------------------------------------------------------------------------
  // Load feeds
  // -------------------------------------------------------------------------

  async function loadFeeds() {
    if (!client) return;
    const cats = await client.getSubscriptions();
    setCategories(cats);
  }

  // -------------------------------------------------------------------------
  // Load articles
  // -------------------------------------------------------------------------

  async function loadArticles() {
    if (!client) return;
    isLoadingArticles.set(true);

    try {
      const feedId = $selectedFeedId;
      const stream = feedId
        ? (feedId as `feed/${string}`)
        : 'reading-list';

      const result = await client.getArticles(stream, {
        unreadOnly: $settings.unreadOnly,
      });

      setArticles(result.articles, result.continuation);
    } finally {
      isLoadingArticles.set(false);
    }
  }

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------

  async function handleLoadMore() {
    if (!client || !$continuation) return;
    isLoadingMore.set(true);

    try {
      const feedId = $selectedFeedId;
      const stream = feedId
        ? (feedId as `feed/${string}`)
        : 'reading-list';

      const result = await client.getArticles(stream, {
        continuation: $continuation,
        unreadOnly: $settings.unreadOnly,
      });

      appendArticles(result.articles, result.continuation);
    } finally {
      isLoadingMore.set(false);
    }
  }

  // -------------------------------------------------------------------------
  // Article actions
  // -------------------------------------------------------------------------

  async function handleArticleSelected(articleId: string) {
    selectArticle(articleId);

    if ($settings.markReadOnOpen && $selectedArticle && !$selectedArticle.isRead) {
      markArticleRead(articleId);
      if ($selectedFeedId) decrementUnread($selectedFeedId);

      try {
        await client?.markAsRead(articleId);
      } catch {
        // Revert optimiste si erreur réseau
        markArticleUnread(articleId);
        if ($selectedFeedId) decrementUnread($selectedFeedId);
      }
    }
  }

  async function handleToggleRead(e: CustomEvent<{ articleId: string; isRead: boolean }>) {
    const { articleId, isRead } = e.detail;

    if (isRead) {
      markArticleUnread(articleId);
      await client?.markAsUnread(articleId);
    } else {
      markArticleRead(articleId);
      if ($selectedFeedId) decrementUnread($selectedFeedId);
      await client?.markAsRead(articleId);
    }
  }

  async function handleToggleStar(e: CustomEvent<{ articleId: string; isStarred: boolean }>) {
    const { articleId, isStarred } = e.detail;
    toggleArticleStar(articleId);
    await client?.toggleStar(articleId, !isStarred);
  }

  async function handleMarkAllRead() {
    if (!client) return;
    const now = Math.floor(Date.now() / 1000);
    markAllRead();
    if ($selectedFeedId) resetUnread($selectedFeedId);
    await client.markAllAsRead($selectedFeedId ?? 'user/-/state/com.google/reading-list', now);
  }

  function handleLogout() {
    if (!browser) return;
    localStorage.removeItem('open-airss:credentials');
    goto('/');
  }

  // Recharger les articles quand le feed sélectionné change
  $: if (browser && client) {
    $selectedFeedId; // trigger
    loadArticles();
  }
</script>

<svelte:head>
  <title>Open-AIRSS</title>
</svelte:head>

<div class="reader">
  <Toolbar on:logout={handleLogout} />

  <div class="reader__panels">
    <aside class="reader__sidebar">
      <FeedList />
    </aside>

    <section class="reader__list">
      <ArticleList
        on:loadMore={handleLoadMore}
        on:markAllRead={handleMarkAllRead}
        on:selectArticle={(e) => handleArticleSelected(e.detail)}
      />
    </section>

    <main class="reader__content">
      <ArticleView
        on:toggleRead={handleToggleRead}
        on:toggleStar={handleToggleStar}
      />
    </main>
  </div>
</div>

<style>
  .reader {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: var(--color-bg);
  }

  .reader__panels {
    display: grid;
    grid-template-columns: 240px 320px 1fr;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .reader__sidebar,
  .reader__list,
  .reader__content {
    overflow: hidden;
    min-height: 0;
  }

  /* Responsive — masquer le panneau de contenu sur petit écran */
  @media (max-width: 768px) {
    .reader__panels {
      grid-template-columns: 220px 1fr;
    }

    .reader__content {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .reader__panels {
      grid-template-columns: 1fr;
    }

    .reader__sidebar {
      display: none;
    }
  }
</style>
