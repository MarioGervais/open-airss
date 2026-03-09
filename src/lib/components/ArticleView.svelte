<script lang="ts">
  // src/lib/components/ArticleView.svelte

  import { selectedArticle, toggleArticleStar } from '$lib/stores/articles';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    toggleRead: { articleId: string; isRead: boolean };
    toggleStar: { articleId: string; isStarred: boolean };
  }>();

  function formatFullDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function handleToggleRead(): void {
    if (!$selectedArticle) return;
    dispatch('toggleRead', {
      articleId: $selectedArticle.id,
      isRead: $selectedArticle.isRead,
    });
  }

  function handleToggleStar(): void {
    if (!$selectedArticle) return;
    dispatch('toggleStar', {
      articleId: $selectedArticle.id,
      isStarred: $selectedArticle.isStarred,
    });
  }
</script>

<article class="article-view">
  {#if !$selectedArticle}
    <div class="article-view__empty">
      <p>Select an article to read.</p>
    </div>
  {:else}
    <header class="article-view__header">
      <div class="article-view__actions">
        <a
          href={$selectedArticle.url}
          target="_blank"
          rel="noopener noreferrer"
          class="article-view__action"
          title="Open original"
        >
          Open original
        </a>
        <button
          class="article-view__action"
          on:click={handleToggleRead}
          title={$selectedArticle.isRead ? 'Mark as unread' : 'Mark as read'}
        >
          {$selectedArticle.isRead ? 'Mark unread' : 'Mark read'}
        </button>
        <button
          class="article-view__action article-view__action--star"
          class:article-view__action--starred={$selectedArticle.isStarred}
          on:click={handleToggleStar}
          title={$selectedArticle.isStarred ? 'Remove star' : 'Star'}
          aria-label={$selectedArticle.isStarred ? 'Remove star' : 'Star article'}
        >
          {$selectedArticle.isStarred ? '★' : '☆'}
        </button>
      </div>

      <div class="article-view__meta">
        <span class="article-view__feed">{$selectedArticle.feedTitle}</span>
        {#if $selectedArticle.author}
          <span class="article-view__author">by {$selectedArticle.author}</span>
        {/if}
        <time
          class="article-view__date"
          datetime={new Date($selectedArticle.published * 1000).toISOString()}
        >
          {formatFullDate($selectedArticle.published)}
        </time>
      </div>

      <h1 class="article-view__title">{$selectedArticle.title}</h1>
    </header>

    <div class="article-view__body prose">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html $selectedArticle.content || $selectedArticle.summary}
    </div>
  {/if}
</article>

<style>
  .article-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    background: var(--color-content-bg);
  }

  .article-view__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .article-view__header {
    padding: 1.5rem 2rem 1.25rem;
    border-bottom: 1px solid var(--color-border);
  }

  .article-view__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .article-view__action {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.25rem 0.6rem;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    cursor: pointer;
    text-decoration: none;
    transition: border-color 0.1s, color 0.1s;
    display: inline-flex;
    align-items: center;
  }

  .article-view__action:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .article-view__action--star {
    font-size: 1rem;
    padding: 0.2rem 0.5rem;
    margin-left: auto;
  }

  .article-view__action--starred {
    color: var(--color-accent);
    border-color: var(--color-accent);
  }

  .article-view__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .article-view__feed {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-accent);
  }

  .article-view__author {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  .article-view__date {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    margin-left: auto;
  }

  .article-view__title {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.35;
    color: var(--color-text);
  }

  .article-view__body {
    padding: 1.5rem 2rem 3rem;
    flex: 1;
  }

  /* Prose styles for article content */
  .article-view__body :global(p) {
    margin: 0 0 1em;
    line-height: 1.7;
    color: var(--color-text);
  }

  .article-view__body :global(a) {
    color: var(--color-accent);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .article-view__body :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 1rem 0;
  }

  .article-view__body :global(pre) {
    background: var(--color-sidebar-bg);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.875rem;
  }

  .article-view__body :global(code) {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.875em;
    background: var(--color-sidebar-bg);
    padding: 0.1em 0.3em;
    border-radius: 3px;
  }

  .article-view__body :global(h1),
  .article-view__body :global(h2),
  .article-view__body :global(h3) {
    margin: 1.5em 0 0.5em;
    line-height: 1.3;
    color: var(--color-text);
  }

  .article-view__body :global(blockquote) {
    border-left: 3px solid var(--color-accent);
    margin: 1rem 0;
    padding: 0.25rem 0 0.25rem 1rem;
    color: var(--color-text-muted);
  }

  .article-view__body :global(ul),
  .article-view__body :global(ol) {
    padding-left: 1.5rem;
    margin: 0 0 1em;
  }

  .article-view__body :global(li) {
    margin-bottom: 0.25em;
    line-height: 1.6;
  }
</style>
