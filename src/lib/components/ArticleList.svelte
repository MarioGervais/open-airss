<script lang="ts">
  // src/lib/components/ArticleList.svelte

  import { articles, selectedArticleId, isLoadingArticles, isLoadingMore, hasMore, selectArticle } from '$lib/stores/articles';
  import { selectedFeed } from '$lib/stores/feeds';
  import { settings } from '$lib/stores/settings';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    loadMore: void;
    markAllRead: void;
  }>();

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function handleArticleClick(articleId: string): void {
    selectArticle(articleId);
  }

  function handleLoadMore(): void {
    dispatch('loadMore');
  }

  function handleMarkAllRead(): void {
    dispatch('markAllRead');
  }

  $: visibleArticles = $settings.unreadOnly
    ? $articles.filter((a) => !a.isRead)
    : $articles;
</script>

<section class="article-list">
  <header class="article-list__header">
    <h2 class="article-list__title">
      {$selectedFeed?.title ?? 'All articles'}
    </h2>
    <button
      class="article-list__mark-all"
      on:click={handleMarkAllRead}
      title="Mark all as read"
      aria-label="Mark all as read"
    >
      Mark all read
    </button>
  </header>

  {#if $isLoadingArticles}
    <div class="article-list__state">
      <span class="article-list__spinner" aria-label="Loading" />
    </div>
  {:else if visibleArticles.length === 0}
    <div class="article-list__state">
      <p class="article-list__empty">No articles.</p>
    </div>
  {:else}
    <ul class="article-list__items">
      {#each visibleArticles as article (article.id)}
        <li class="article-list__item" class:article-list__item--read={article.isRead}>
          <button
            class="article-list__row"
            class:article-list__row--active={$selectedArticleId === article.id}
            on:click={() => handleArticleClick(article.id)}
          >
            <div class="article-list__meta">
              <span class="article-list__feed-name">{article.feedTitle}</span>
              <span class="article-list__date">{formatDate(article.published)}</span>
            </div>
            <p class="article-list__article-title">{article.title}</p>
            {#if article.summary}
              <p class="article-list__summary">
                {article.summary.replace(/<[^>]*>/g, '').slice(0, 120)}…
              </p>
            {/if}
            {#if article.isStarred}
              <span class="article-list__star" aria-label="Starred">★</span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>

    {#if $hasMore}
      <div class="article-list__footer">
        <button
          class="article-list__load-more"
          on:click={handleLoadMore}
          disabled={$isLoadingMore}
        >
          {$isLoadingMore ? 'Loading…' : 'Load more'}
        </button>
      </div>
    {/if}
  {/if}
</section>

<style>
  .article-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    border-right: 1px solid var(--color-border);
    background: var(--color-list-bg);
  }

  .article-list__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1rem 0.75rem;
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .article-list__title {
    font-size: 0.9375rem;
    font-weight: 600;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-text);
  }

  .article-list__mark-all {
    flex-shrink: 0;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.25rem 0.6rem;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: border-color 0.1s, color 0.1s;
  }

  .article-list__mark-all:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .article-list__items {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1;
  }

  .article-list__state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 2rem;
  }

  .article-list__empty {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    margin: 0;
  }

  .article-list__spinner {
    display: block;
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .article-list__row {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    text-align: left;
    transition: background 0.1s ease;
    position: relative;
  }

  .article-list__row:hover {
    background: var(--color-list-hover);
  }

  .article-list__row--active {
    background: var(--color-list-active);
  }

  .article-list__item--read .article-list__article-title {
    color: var(--color-text-muted);
    font-weight: 400;
  }

  .article-list__meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.25rem;
  }

  .article-list__feed-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-accent);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 60%;
  }

  .article-list__date {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .article-list__article-title {
    margin: 0 0 0.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
  line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .article-list__summary {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
  line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .article-list__star {
    position: absolute;
    top: 0.5rem;
    right: 0.75rem;
    font-size: 0.75rem;
    color: var(--color-accent);
  }

  .article-list__footer {
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .article-list__load-more {
    width: 100%;
    padding: 0.5rem;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: border-color 0.1s, color 0.1s;
  }

  .article-list__load-more:hover:not(:disabled) {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .article-list__load-more:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
