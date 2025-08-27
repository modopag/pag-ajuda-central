import { supabase } from '@/integrations/supabase/client';
import type { 
  DataAdapter, 
  Category, 
  Article, 
  Tag, 
  ArticleTag, 
  Media, 
  Redirect, 
  Feedback, 
  User, 
  Setting, 
  AnalyticsEvent, 
  SlugHistoryEntry,
  ArticleStatus,
  RedirectType,
  FAQ
} from '@/types/admin';

export class SupabaseAdapter implements DataAdapter {
  private static instanceCount = 0;
  
  constructor() {
    const instanceId = ++SupabaseAdapter.instanceCount;
    console.log(`🔧 SupabaseAdapter: Instance #${instanceId} created`);
    
    // Warn if multiple instances are being created
    if (instanceId > 1) {
      console.warn(`⚠️ SupabaseAdapter: Multiple instances detected! This should not happen. Instance count: ${instanceId}`);
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getCategoriesWithCounts(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        article_count:articles(count)
      `)
      .eq('articles.status', 'published')
      .order('position', { ascending: true });

    if (error) throw error;
    
    // Transform the data to include article_count as a number
    return (data || []).map(category => ({
      ...category,
      article_count: category.article_count?.[0]?.count || 0
    }));
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  }

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Articles
  async getArticles(filters?: { category_id?: string; status?: ArticleStatus; search?: string }): Promise<Article[]> {
    let query = supabase
      .from('articles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Article[];
  }

  async getArticleById(id: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Article;
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Article;
  }

  async createArticle(article: Omit<Article, 'id' | 'updated_at' | 'view_count'>): Promise<Article> {
    const { data, error } = await supabase
      .from('articles')
      .insert(article)
      .select()
      .single();

    if (error) throw error;
    return data as Article;
  }

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Article;
  }

  async deleteArticle(id: string): Promise<void> {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getTagById(id: string): Promise<Tag | null> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createTag(tag: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTag(id: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Article Tags
  async getArticleTags(articleId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('article_tags')
      .select(`
        tag_id,
        tags (*)
      `)
      .eq('article_id', articleId);

    if (error) throw error;
    return data?.map((item: any) => item.tags) || [];
  }

  async addTagToArticle(articleId: string, tagId: string): Promise<void> {
    const { error } = await supabase
      .from('article_tags')
      .insert({ article_id: articleId, tag_id: tagId });

    if (error) throw error;
  }

  async removeTagFromArticle(articleId: string, tagId: string): Promise<void> {
    const { error } = await supabase
      .from('article_tags')
      .delete()
      .eq('article_id', articleId)
      .eq('tag_id', tagId);

    if (error) throw error;
  }

  // Media
  async getMediaList(): Promise<Media[]> {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getMediaById(id: string): Promise<Media | null> {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createMedia(media: Omit<Media, 'id' | 'created_at'>): Promise<Media> {
    const { data, error } = await supabase
      .from('media')
      .insert(media)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMedia(id: string): Promise<void> {
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Redirects
  async getRedirects(): Promise<Redirect[]> {
    const { data, error } = await supabase
      .from('redirects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Redirect[];
  }

  async createRedirect(redirect: Omit<Redirect, 'id' | 'created_at'>): Promise<Redirect> {
    const { data, error } = await supabase
      .from('redirects')
      .insert(redirect)
      .select()
      .single();

    if (error) throw error;
    return data as Redirect;
  }

  async updateRedirect(id: string, updates: Partial<Redirect>): Promise<Redirect> {
    const { data, error } = await supabase
      .from('redirects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Redirect;
  }

  async deleteRedirect(id: string): Promise<void> {
    const { error } = await supabase
      .from('redirects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Slug History
  async getSlugHistory(articleId: string): Promise<SlugHistoryEntry[]> {
    const { data, error } = await supabase
      .from('slug_history')
      .select('*')
      .eq('article_id', articleId)
      .order('changed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async recordSlugChange(entry: Omit<SlugHistoryEntry, 'id'>): Promise<SlugHistoryEntry> {
    const { data, error } = await supabase
      .from('slug_history')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Feedback
  async getFeedback(articleId?: string): Promise<Feedback[]> {
    let query = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (articleId) {
      query = query.eq('article_id', articleId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async createFeedback(feedback: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback> {
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedback)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Settings
  async getSetting(key: string): Promise<Setting | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Setting;
  }

  async updateSetting(key: string, value: string, type?: Setting['type']): Promise<Setting> {
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        key,
        value,
        type: type || 'text'
      })
      .select()
      .single();

    if (error) throw error;
    return data as Setting;
  }

  async getAllSettings(): Promise<Setting[]> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) throw error;
    return (data || []) as Setting[];
  }

  // Analytics
  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: event.event_type,
        data: event.data
      });

    if (error) throw error;
  }

  async getEvents(filters?: { event_type?: string; limit?: number }): Promise<AnalyticsEvent[]> {
    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters?.event_type) {
      query = query.eq('event_type', filters.event_type);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data?.map(item => ({
      event_type: item.event_type as AnalyticsEvent['event_type'],
      data: item.data,
      timestamp: item.timestamp
    })) || []) as AnalyticsEvent[];
  }

  // Data management
  async exportData(): Promise<string> {
    // Export all data from all tables
    const [categories, articles, tags, media, redirects, feedback, settings] = await Promise.all([
      this.getCategories(),
      this.getArticles(),
      this.getTags(),
      this.getMediaList(),
      this.getRedirects(),
      this.getFeedback(),
      this.getAllSettings()
    ]);

    const exportData = {
      categories,
      articles,
      tags,
      media,
      redirects,
      feedback,
      settings,
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data (in reverse order due to foreign keys)
      await supabase.from('article_tags').delete().neq('article_id', '');
      await supabase.from('feedback').delete().neq('id', '');
      await supabase.from('slug_history').delete().neq('id', '');
      await supabase.from('redirects').delete().neq('id', '');
      await supabase.from('articles').delete().neq('id', '');
      await supabase.from('media').delete().neq('id', '');
      await supabase.from('tags').delete().neq('id', '');
      await supabase.from('categories').delete().neq('id', '');
      await supabase.from('settings').delete().neq('key', '');

      // Import data (in correct order due to foreign keys)
      if (data.categories?.length) {
        await supabase.from('categories').insert(data.categories);
      }
      if (data.tags?.length) {
        await supabase.from('tags').insert(data.tags);
      }
      if (data.media?.length) {
        await supabase.from('media').insert(data.media);
      }
      if (data.articles?.length) {
        await supabase.from('articles').insert(data.articles);
      }
      if (data.redirects?.length) {
        await supabase.from('redirects').insert(data.redirects);
      }
      if (data.feedback?.length) {
        await supabase.from('feedback').insert(data.feedback);
      }
      if (data.settings?.length) {
        await supabase.from('settings').insert(data.settings);
      }
    } catch (error) {
      throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // FAQ methods
  async getFAQs(): Promise<FAQ[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getFAQById(id: string): Promise<FAQ | null> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createFAQ(faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>): Promise<FAQ> {
    const { data, error } = await supabase
      .from('faqs')
      .insert(faq)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateFAQ(id: string, updates: Partial<FAQ>): Promise<FAQ> {
    const { data, error } = await supabase
      .from('faqs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFAQ(id: string): Promise<void> {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}