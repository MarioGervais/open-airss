// src/lib/api/types.ts

export interface Credentials {
  url: string;
  username: string;
  password: string;
}

export interface Feed {
  id: string;
  title: string;
  url: string;
  htmlUrl: string;
  unreadCount: number;
}

export interface Category {
  id: string;
  label: string;
  feeds: Feed[];
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  published: number; // Unix timestamp
  url: string;
  feedId: string;
  feedTitle: string;
  isRead: boolean;
  isStarred: boolean;
}

export interface ArticleList {
  articles: Article[];
  continuation?: string; // pagination token
}

export type StreamId = "reading-list" | "starred" | "unread" | `feed/${string}`;
