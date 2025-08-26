// Supabase adapter - future implementation placeholder

import type { DataAdapter, Category, Article, Tag, ArticleTag, Media, Redirect, Feedback, User, Setting, AnalyticsEvent, SlugHistoryEntry, ArticleStatus } from '@/types/admin';

export class SupabaseAdapter implements DataAdapter {
  constructor() {
    console.warn('SupabaseAdapter is not implemented yet. Use MockAdapter for now.');
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    throw new Error('SupabaseAdapter: getCategories not implemented yet');
  }

  async getCategoryById(id: string): Promise<Category | null> {
    throw new Error('SupabaseAdapter: getCategoryById not implemented yet');
  }

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    throw new Error('SupabaseAdapter: createCategory not implemented yet');
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    throw new Error('SupabaseAdapter: updateCategory not implemented yet');
  }

  async deleteCategory(id: string): Promise<void> {
    throw new Error('SupabaseAdapter: deleteCategory not implemented yet');
  }

  // Articles
  async getArticles(filters?: { category_id?: string; status?: ArticleStatus; search?: string }): Promise<Article[]> {
    throw new Error('SupabaseAdapter: getArticles not implemented yet');
  }

  async getArticleById(id: string): Promise<Article | null> {
    throw new Error('SupabaseAdapter: getArticleById not implemented yet');
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    throw new Error('SupabaseAdapter: getArticleBySlug not implemented yet');
  }

  async createArticle(article: Omit<Article, 'id' | 'updated_at' | 'view_count'>): Promise<Article> {
    throw new Error('SupabaseAdapter: createArticle not implemented yet');
  }

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    throw new Error('SupabaseAdapter: updateArticle not implemented yet');
  }

  async deleteArticle(id: string): Promise<void> {
    throw new Error('SupabaseAdapter: deleteArticle not implemented yet');
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    throw new Error('SupabaseAdapter: getTags not implemented yet');
  }

  async getTagById(id: string): Promise<Tag | null> {
    throw new Error('SupabaseAdapter: getTagById not implemented yet');
  }

  async createTag(tag: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    throw new Error('SupabaseAdapter: createTag not implemented yet');
  }

  async updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
    throw new Error('SupabaseAdapter: updateTag not implemented yet');
  }

  async deleteTag(id: string): Promise<void> {
    throw new Error('SupabaseAdapter: deleteTag not implemented yet');
  }

  // Article Tags
  async getArticleTags(articleId: string): Promise<Tag[]> {
    throw new Error('SupabaseAdapter: getArticleTags not implemented yet');
  }

  async addTagToArticle(articleId: string, tagId: string): Promise<void> {
    throw new Error('SupabaseAdapter: addTagToArticle not implemented yet');
  }

  async removeTagFromArticle(articleId: string, tagId: string): Promise<void> {
    throw new Error('SupabaseAdapter: removeTagFromArticle not implemented yet');
  }

  // Media
  async getMediaList(): Promise<Media[]> {
    throw new Error('SupabaseAdapter: getMediaList not implemented yet');
  }

  async getMediaById(id: string): Promise<Media | null> {
    throw new Error('SupabaseAdapter: getMediaById not implemented yet');
  }

  async createMedia(media: Omit<Media, 'id' | 'created_at'>): Promise<Media> {
    throw new Error('SupabaseAdapter: createMedia not implemented yet');
  }

  async deleteMedia(id: string): Promise<void> {
    throw new Error('SupabaseAdapter: deleteMedia not implemented yet');
  }

  // Redirects
  async getRedirects(): Promise<Redirect[]> {
    throw new Error('SupabaseAdapter: getRedirects not implemented yet');
  }

  async createRedirect(redirect: Omit<Redirect, 'id' | 'created_at'>): Promise<Redirect> {
    throw new Error('SupabaseAdapter: createRedirect not implemented yet');
  }

  async updateRedirect(id: string, updates: Partial<Redirect>): Promise<Redirect> {
    throw new Error('SupabaseAdapter: updateRedirect not implemented yet');
  }

  async deleteRedirect(id: string): Promise<void> {
    throw new Error('SupabaseAdapter: deleteRedirect not implemented yet');
  }

  // Feedback
  async getFeedback(articleId?: string): Promise<Feedback[]> {
    throw new Error('SupabaseAdapter: getFeedback not implemented yet');
  }

  async createFeedback(feedback: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback> {
    throw new Error('SupabaseAdapter: createFeedback not implemented yet');
  }

  // Settings
  async getSetting(key: string): Promise<Setting | null> {
    throw new Error('SupabaseAdapter: getSetting not implemented yet');
  }

  async updateSetting(key: string, value: string, type?: Setting['type']): Promise<Setting> {
    throw new Error('SupabaseAdapter: updateSetting not implemented yet');
  }

  async getAllSettings(): Promise<Setting[]> {
    throw new Error('SupabaseAdapter: getAllSettings not implemented yet');
  }

  // Analytics
  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    throw new Error('SupabaseAdapter: trackEvent not implemented yet');
  }

  async getEvents(filters?: { event_type?: string; limit?: number }): Promise<AnalyticsEvent[]> {
    throw new Error('SupabaseAdapter: getEvents not implemented yet');
  }

  // Slug History
  async getSlugHistory(articleId: string): Promise<SlugHistoryEntry[]> {
    throw new Error('SupabaseAdapter: getSlugHistory not implemented yet');
  }

  async recordSlugChange(entry: Omit<SlugHistoryEntry, 'id'>): Promise<SlugHistoryEntry> {
    throw new Error('SupabaseAdapter: recordSlugChange not implemented yet');
  }

  // Data management
  async exportData(): Promise<string> {
    throw new Error('SupabaseAdapter: exportData not implemented yet');
  }

  async importData(jsonData: string): Promise<void> {
    throw new Error('SupabaseAdapter: importData not implemented yet');
  }
}