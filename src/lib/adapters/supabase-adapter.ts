// Supabase adapter - future implementation placeholder

import type { DataAdapter } from '@/types/admin';

export class SupabaseAdapter implements DataAdapter {
  constructor() {
    throw new Error('SupabaseAdapter not implemented yet. Use MockAdapter for now.');
  }

  async getCategories(): Promise<any[]> {
    throw new Error('Not implemented');
  }

  async getCategoryById(): Promise<any> {
    throw new Error('Not implemented');
  }

  async createCategory(): Promise<any> {
    throw new Error('Not implemented');
  }

  async updateCategory(): Promise<any> {
    throw new Error('Not implemented');
  }

  async deleteCategory(): Promise<void> {
    throw new Error('Not implemented');
  }

  async getArticles(): Promise<any[]> {
    throw new Error('Not implemented');
  }

  async getArticleById(): Promise<any> {
    throw new Error('Not implemented');
  }

  async getArticleBySlug(): Promise<any> {
    throw new Error('Not implemented');
  }

  async createArticle(): Promise<any> {
    throw new Error('Not implemented');
  }

  async updateArticle(): Promise<any> {
    throw new Error('Not implemented');
  }

  async deleteArticle(): Promise<void> {
    throw new Error('Not implemented');
  }

  async getTags(): Promise<any[]> {
    throw new Error('Not implemented');
  }

  async getTagById(): Promise<any> {
    throw new Error('Not implemented');
  }

  async createTag(): Promise<any> {
    throw new Error('Not implemented');
  }

  async updateTag(): Promise<any> {
    throw new Error('Not implemented');
  }

  async deleteTag(): Promise<void> {
    throw new Error('Not implemented');
  }

  async getArticleTags(): Promise<any[]> {
    throw new Error('Not implemented');
  }

  async addTagToArticle(): Promise<void> {
    throw new Error('Not implemented');
  }

  async removeTagFromArticle(): Promise<void> {
    throw new Error('Not implemented');
  }

  async getMediaList(): Promise<any[]> {
    throw new Error('Not implemented');
  }

  async getMediaById(): Promise<any> {
    throw new Error('Not implemented');
  }

  async createMedia(): Promise<any> {
    throw new Error('Not implemented');
  }

  async deleteMedia(): Promise<void> {
    throw new Error('Not implemented');
  }

  async getRedirects(): Promise<any[]> {
    throw new Error('Not implemented');
  }

  async createRedirect(): Promise<any> {
    throw new Error('Not implemented');
  }

  async updateRedirect(): Promise<any> {
    throw new Error('Not implemented');
  }

  async deleteRedirect(): Promise<void> {
    throw new Error('Not implemented');
  }

  async getFeedback(): Promise<any[]> {
    throw new Error('Not implemented');
  }

  async createFeedback(): Promise<any> {
    throw new Error('Not implemented');
  }

  async getSetting(): Promise<any> {
    throw new Error('Not implemented');
  }

  async updateSetting(): Promise<any> {
    throw new Error('Not implemented');
  }

  async getAllSettings(): Promise<any[]> {
    throw new Error('Not implemented');
  }

  async trackEvent(): Promise<void> {
    throw new Error('Not implemented');
  }

  async getEvents(): Promise<any[]> {
    throw new Error('Not implemented');
  }

  async exportData(): Promise<string> {
    throw new Error('Not implemented');
  }

  async importData(): Promise<void> {
    throw new Error('Not implemented');
  }
}