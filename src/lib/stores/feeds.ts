// src/lib/stores/feeds.ts

import { writable, derived } from "svelte/store";
import type { Category } from "$lib/api/types";

// -------------------------------------------------------------------------
// State
// -------------------------------------------------------------------------

export const categories = writable<Category[]>([]);
export const selectedFeedId = writable<string | null>(null);
export const isLoadingFeeds = writable<boolean>(false);
export const feedsError = writable<string | null>(null);

// -------------------------------------------------------------------------
// Derived
// -------------------------------------------------------------------------

export const totalUnread = derived(categories, ($categories) =>
  $categories.reduce(
    (sum, cat) => sum + cat.feeds.reduce((s, f) => s + f.unreadCount, 0),
    0,
  ),
);

export const selectedFeed = derived(
  [categories, selectedFeedId],
  ([$categories, $selectedFeedId]) => {
    if (!$selectedFeedId) return null;
    for (const cat of $categories) {
      const feed = cat.feeds.find((f) => f.id === $selectedFeedId);
      if (feed) return feed;
    }
    return null;
  },
);

// -------------------------------------------------------------------------
// Actions
// -------------------------------------------------------------------------

export function selectFeed(feedId: string | null): void {
  selectedFeedId.set(feedId);
}

export function setCategories(data: Category[]): void {
  categories.set(data);
}

export function decrementUnread(feedId: string, by = 1): void {
  categories.update((cats) =>
    cats.map((cat) => ({
      ...cat,
      feeds: cat.feeds.map((feed) =>
        feed.id === feedId
          ? { ...feed, unreadCount: Math.max(0, feed.unreadCount - by) }
          : feed,
      ),
    })),
  );
}

export function resetUnread(feedId: string): void {
  categories.update((cats) =>
    cats.map((cat) => ({
      ...cat,
      feeds: cat.feeds.map((feed) =>
        feed.id === feedId ? { ...feed, unreadCount: 0 } : feed,
      ),
    })),
  );
}
