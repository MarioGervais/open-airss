<script lang="ts">
  // src/lib/components/FeedList.svelte

  import { categories, selectedFeedId, totalUnread, selectFeed } from '$lib/stores/feeds';
  import { settings } from '$lib/stores/settings';

  let expanded: Record<string, boolean> = {};

  function toggleCategory(catId: string): void {
    expanded[catId] = !expanded[catId];
    expanded = { ...expanded }; // trigger reactivity
  }

  function handleFeedClick(feedId: string): void {
    selectFeed(feedId);
  }

  function handleAllClick(): void {
    selectFeed(null);
  }
</script>

<nav class="feed-list" class:unread-only={$settings.unreadOnly}>
  <div class="feed-list__header">
    <span class="feed-list__app-name">Open-AIRSS</span>
  </div>

  <ul class="feed-list__items">
    <!-- All articles -->
    <li class="feed-list__item feed-list__item--all">
      <button
        class="feed-list__row"
        class:feed-list__row--active={$selectedFeedId === null}
        on:click={handleAllClick}
      >
        <span class="feed-list__label">All articles</span>
        {#if $totalUnread > 0}
          <span class="feed-list__count">{$totalUnread}</span>
        {/if}
      </button>
    </li>

    <!-- Categories -->
    {#each $categories as category (category.id)}
      {@const catUnread = category.feeds.reduce((s, f) => s + f.unreadCount, 0)}
      {@const isExpanded = expanded[category.id] !== false}

      <li class="feed-list__category">
        <button
          class="feed-list__category-header"
          on:click={() => toggleCategory(category.id)}
          aria-expanded={isExpanded}
        >
          <span class="feed-list__chevron" class:feed-list__chevron--open={isExpanded}>
            ›
          </span>
          <span class="feed-list__category-label">{category.label}</span>
          {#if catUnread > 0}
            <span class="feed-list__count">{catUnread}</span>
          {/if}
        </button>

        {#if isExpanded}
          <ul class="feed-list__feeds">
            {#each category.feeds as feed (feed.id)}
              {#if !$settings.unreadOnly || feed.unreadCount > 0}
                <li class="feed-list__item">
                  <button
                    class="feed-list__row"
                    class:feed-list__row--active={$selectedFeedId === feed.id}
                    on:click={() => handleFeedClick(feed.id)}
                  >
                    <span class="feed-list__favicon">
                      <img
                        src="https://www.google.com/s2/favicons?domain={new URL(feed.htmlUrl || feed.url).hostname}&sz=16"
                        alt=""
                        width="16"
                        height="16"
                        loading="lazy"
                        on:error={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </span>
                    <span class="feed-list__label">{feed.title}</span>
                    {#if feed.unreadCount > 0}
                      <span class="feed-list__count">{feed.unreadCount}</span>
                    {/if}
                  </button>
                </li>
              {/if}
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

<style>
  .feed-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    background: var(--color-sidebar-bg);
    border-right: 1px solid var(--color-border);
    font-size: 0.875rem;
    user-select: none;
  }

  .feed-list__header {
    padding: 1.25rem 1rem 0.75rem;
    border-bottom: 1px solid var(--color-border);
  }

  .feed-list__app-name {
    font-weight: 700;
    font-size: 0.8125rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .feed-list__items {
    list-style: none;
    margin: 0;
    padding: 0.5rem 0;
    flex: 1;
  }

  .feed-list__category {
    margin-top: 0.25rem;
  }

  .feed-list__category-header {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    width: 100%;
    padding: 0.3rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: left;
  }

  .feed-list__category-header:hover {
    color: var(--color-text);
  }

  .feed-list__chevron {
    display: inline-block;
    font-style: normal;
    transition: transform 0.15s ease;
    line-height: 1;
  }

  .feed-list__chevron--open {
    transform: rotate(90deg);
  }

  .feed-list__category-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .feed-list__feeds {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .feed-list__row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.35rem 1rem 0.35rem 2rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text);
    text-align: left;
    border-radius: 0;
    transition: background 0.1s ease;
  }

  .feed-list__item--all .feed-list__row {
    padding-left: 1rem;
    font-weight: 500;
  }

  .feed-list__row:hover {
    background: var(--color-sidebar-hover);
  }

  .feed-list__row--active {
    background: var(--color-sidebar-active);
    color: var(--color-accent);
  }

  .feed-list__favicon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }

  .feed-list__label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
  }

  .feed-list__count {
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-accent);
    min-width: 1.25rem;
    text-align: right;
  }
</style>
