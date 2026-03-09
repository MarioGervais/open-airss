// src/lib/api/greader.ts

import type {
  Credentials,
  Feed,
  Category,
  Article,
  ArticleList,
  StreamId,
} from './types';

const GOOGLE_READER_PATH = '/api/greader.php';

export class GReaderClient {
  private url: string;
  private username: string;
  private password: string;
  private token: string | null = null;

  constructor(credentials: Credentials) {
    this.url = credentials.url.replace(/\/$/, '');
    this.username = credentials.username;
    this.password = credentials.password;
  }

  // -------------------------------------------------------------------------
  // Authentication
  // -------------------------------------------------------------------------

  async login(): Promise<void> {
    const res = await fetch(`${this.url}${GOOGLE_READER_PATH}/accounts/ClientLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        Email: this.username,
        Passwd: this.password,
      }),
    });

    if (!res.ok) {
      throw new Error(`Authentication failed: ${res.status}`);
    }

    const text = await res.text();
    const match = text.match(/^Auth=(.+)$/m);

    if (!match) {
      throw new Error('Authentication token not found in response');
    }

    this.token = match[1];
  }

  private authHeaders(): HeadersInit {
    if (!this.token) throw new Error('Not authenticated — call login() first');
    return { Authorization: `GoogleLogin auth=${this.token}` };
  }

  // -------------------------------------------------------------------------
  // Feeds & Categories
  // -------------------------------------------------------------------------

  async getSubscriptions(): Promise<Category[]> {
    const [subsRes, countsRes] = await Promise.all([
      this.get('/reader/api/0/subscription/list?output=json'),
      this.get('/reader/api/0/unread-count?output=json'),
    ]);

    const subs = await subsRes.json();
    const counts = await countsRes.json();

    const unreadMap = new Map<string, number>();
    for (const item of counts.unreadcounts ?? []) {
      unreadMap.set(item.id, item.count);
    }

    const categoryMap = new Map<string, Category>();

    for (const sub of subs.subscriptions ?? []) {
      const feed: Feed = {
        id: sub.id,
        title: sub.title,
        url: sub.url,
        htmlUrl: sub.htmlUrl ?? '',
        unreadCount: unreadMap.get(sub.id) ?? 0,
      };

      const cats: Array<{ id: string; label: string }> = sub.categories ?? [];

      if (cats.length === 0) {
        const uncategorized = categoryMap.get('uncategorized') ?? {
          id: 'uncategorized',
          label: 'Uncategorized',
          feeds: [],
        };
        uncategorized.feeds.push(feed);
        categoryMap.set('uncategorized', uncategorized);
      } else {
        for (const cat of cats) {
          const existing = categoryMap.get(cat.id) ?? {
            id: cat.id,
            label: cat.label,
            feeds: [],
          };
          existing.feeds.push(feed);
          categoryMap.set(cat.id, existing);
        }
      }
    }

    return Array.from(categoryMap.values());
  }

  // -------------------------------------------------------------------------
  // Articles
  // -------------------------------------------------------------------------

  async getArticles(
    stream: StreamId,
    options: {
      count?: number;
      continuation?: string;
      unreadOnly?: boolean;
    } = {}
  ): Promise<ArticleList> {
    const params = new URLSearchParams({
      output: 'json',
      n: String(options.count ?? 20),
    });

    if (options.continuation) params.set('c', options.continuation);
    if (options.unreadOnly) params.append('xt', 'user/-/state/com.google/read');

    const streamId = stream === 'reading-list'
      ? 'user/-/state/com.google/reading-list'
      : stream === 'starred'
      ? 'user/-/state/com.google/starred'
      : stream === 'unread'
      ? 'user/-/state/com.google/reading-list'
      : `feed/${stream.replace(/^feed\//, '')}`;

    const res = await this.get(
      `/reader/api/0/stream/contents/${encodeURIComponent(streamId)}?${params}`
    );
    const data = await res.json();

    const articles: Article[] = (data.items ?? []).map((item: any) => ({
      id: item.id,
      title: item.title ?? '(no title)',
      summary: item.summary?.content ?? '',
      content: item.content?.content ?? item.summary?.content ?? '',
      author: item.author ?? '',
      published: item.published ?? 0,
      url: item.alternate?.[0]?.href ?? '',
      feedId: item.origin?.streamId ?? '',
      feedTitle: item.origin?.title ?? '',
      isRead: (item.categories ?? []).includes('user/-/state/com.google/read'),
      isStarred: (item.categories ?? []).includes('user/-/state/com.google/starred'),
    }));

    return {
      articles,
      continuation: data.continuation,
    };
  }

  // -------------------------------------------------------------------------
  // Article actions
  // -------------------------------------------------------------------------

  async markAsRead(articleId: string): Promise<void> {
    await this.editTag(articleId, 'user/-/state/com.google/read', 'add');
  }

  async markAsUnread(articleId: string): Promise<void> {
    await this.editTag(articleId, 'user/-/state/com.google/read', 'remove');
  }

  async toggleStar(articleId: string, starred: boolean): Promise<void> {
    await this.editTag(
      articleId,
      'user/-/state/com.google/starred',
      starred ? 'add' : 'remove'
    );
  }

  async markAllAsRead(feedId: string, before: number): Promise<void> {
    const actionToken = await this.getActionToken();
    await this.post('/reader/api/0/mark-all-as-read', {
      s: feedId,
      ts: String(before * 1_000_000), // microseconds
      T: actionToken,
    });
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private async get(path: string): Promise<Response> {
    const res = await fetch(`${this.url}${GOOGLE_READER_PATH}${path}`, {
      headers: this.authHeaders(),
    });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res;
  }

  private async post(path: string, body: Record<string, string>): Promise<void> {
    const res = await fetch(`${this.url}${GOOGLE_READER_PATH}${path}`, {
      method: 'POST',
      headers: {
        ...this.authHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body),
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  }

  private async editTag(
    articleId: string,
    tag: string,
    action: 'add' | 'remove'
  ): Promise<void> {
    const actionToken = await this.getActionToken();
    await this.post('/reader/api/0/edit-tag', {
      i: articleId,
      [action === 'add' ? 'a' : 'r']: tag,
      T: actionToken,
    });
  }

  private async getActionToken(): Promise<string> {
    const res = await this.get('/reader/api/0/token');
    return res.text();
  }
}
