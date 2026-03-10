// src/lib/stores/articles.ts

import { writable, derived } from "svelte/store";
import type { Article } from "$lib/api/types";

// -------------------------------------------------------------------------
// State
// -------------------------------------------------------------------------

export const articles = writable<Article[]>([]);
export const selectedArticleId = writable<string | null>(null);
export const isLoadingArticles = writable<boolean>(false);
export const isLoadingMore = writable<boolean>(false);
export const articlesError = writable<string | null>(null);
export const continuation = writable<string | undefined>(undefined);

// -------------------------------------------------------------------------
// Derived
// -------------------------------------------------------------------------

export const selectedArticle = derived(
  [articles, selectedArticleId],
  ([$articles, $selectedArticleId]) =>
    $articles.find((a) => a.id === $selectedArticleId) ?? null,
);

export const hasMore = derived(
  continuation,
  ($continuation) => $continuation !== undefined,
);

// -------------------------------------------------------------------------
// Actions
// -------------------------------------------------------------------------

export function setArticles(data: Article[], next?: string): void {
  articles.set(data);
  continuation.set(next);
  selectedArticleId.set(null);
}

export function appendArticles(data: Article[], next?: string): void {
  articles.update((current) => [...current, ...data]);
  continuation.set(next);
}

export function selectArticle(articleId: string | null): void {
  selectedArticleId.set(articleId);
}

export function markArticleRead(articleId: string): void {
  articles.update((list) =>
    list.map((a) => (a.id === articleId ? { ...a, isRead: true } : a)),
  );
}

export function markArticleUnread(articleId: string): void {
  articles.update((list) =>
    list.map((a) => (a.id === articleId ? { ...a, isRead: false } : a)),
  );
}

export function toggleArticleStar(articleId: string): void {
  articles.update((list) =>
    list.map((a) =>
      a.id === articleId ? { ...a, isStarred: !a.isStarred } : a,
    ),
  );
}

export function markAllRead(): void {
  articles.update((list) => list.map((a) => ({ ...a, isRead: true })));
}
