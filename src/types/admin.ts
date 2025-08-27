// Core types for the admin panel and data structures

export type ArticleStatus = 'draft' | 'review' | 'published' | 'archived';
export type UserRole = 'admin' | 'editor' | 'author' | 'viewer';
export type ArticleType = 'artigo' | 'tutorial' | 'aviso' | 'atualização';
export type MediaType = 'image' | 'document' | 'video';
export type RedirectType = '301' | '302' | '410';

// Database-like structures (matching future Supabase schema)
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url?: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  article_count?: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  content: string;
  status: ArticleStatus;
  published_at?: string;
  updated_at: string;
  author: string;
  
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  noindex: boolean;
  
  // Additional fields
  reading_time_minutes: number;
  type: ArticleType;
  view_count: number;
  first_paragraph?: string; // Required for SEO validation
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ArticleTag {
  article_id: string;
  tag_id: string;
}

export interface Media {
  id: string;
  file_url: string;
  alt_text: string;
  width: number;
  height: number;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  type: RedirectType;
  is_active: boolean;
  created_at: string;
}

export interface Feedback {
  id: string;
  article_id: string;
  is_helpful: boolean;
  comment?: string;
  user_ip?: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_login?: string;
}

export interface Setting {
  key: string;
  value: string;
  type: 'text' | 'json' | 'boolean' | 'number';
  updated_at: string;
}

// Data structures for specific settings
export interface GlobalSEOSettings {
  default_title: string;
  default_meta_description: string;
  default_og_image: string;
  robots_txt: string;
  site_url: string; // For canonical URLs and sitemap
  google_analytics_id?: string; // Google Analytics Measurement ID
}

export interface HelpQuickSettings {
  phone?: string;
  whatsapp_url?: string;
  email?: string;
  is_active: boolean;
}

export interface ReclameAquiSettings {
  cards: Array<{
    title: string;
    description: string;
    link_url: string;
    is_active: boolean;
  }>;
}

export interface BrandSettings {
  logo_black_url?: string;
  logo_yellow_url?: string;
  logo_icon_url?: string;
  favicon_url?: string;
}

// Analytics events
export interface AnalyticsEvent {
  event_type: 'faq_search' | 'faq_view_article' | 'faq_feedback' | 'whatsapp_cta_click';
  data: Record<string, any>;
  timestamp: string;
}

export interface EventFilters {
  startDate?: string;
  endDate?: string;
  eventType?: string;
  event_type?: string;
  limit?: number;
}

// SEO validation interface
export interface SEOValidationResult {
  canPublish: boolean;
  errors: string[];
  warnings: string[];
}

// Slug history tracking
export interface SlugHistoryEntry {
  id: string;
  article_id: string;
  old_slug: string;
  new_slug: string;
  changed_at: string;
  redirect_created: boolean;
}

// Data adapter interface (for future Supabase migration)
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DataAdapter {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoriesWithCounts(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Articles
  getArticles(filters?: { category_id?: string; status?: ArticleStatus; search?: string }): Promise<Article[]>;
  getArticleById(id: string): Promise<Article | null>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  createArticle(article: Omit<Article, 'id' | 'updated_at' | 'view_count'>): Promise<Article>;
  updateArticle(id: string, updates: Partial<Article>): Promise<Article>;
  deleteArticle(id: string): Promise<void>;

  // Tags
  getTags(): Promise<Tag[]>;
  getTagById(id: string): Promise<Tag | null>;
  createTag(tag: Omit<Tag, 'id' | 'created_at'>): Promise<Tag>;
  updateTag(id: string, updates: Partial<Tag>): Promise<Tag>;
  deleteTag(id: string): Promise<void>;

  // Article Tags
  getArticleTags(articleId: string): Promise<Tag[]>;
  addTagToArticle(articleId: string, tagId: string): Promise<void>;
  removeTagFromArticle(articleId: string, tagId: string): Promise<void>;

  // Media
  getMediaList(): Promise<Media[]>;
  getMediaById(id: string): Promise<Media | null>;
  createMedia(media: Omit<Media, 'id' | 'created_at'>): Promise<Media>;
  deleteMedia(id: string): Promise<void>;

  // Redirects
  getRedirects(): Promise<Redirect[]>;
  createRedirect(redirect: Omit<Redirect, 'id' | 'created_at'>): Promise<Redirect>;
  updateRedirect(id: string, updates: Partial<Redirect>): Promise<Redirect>;
  deleteRedirect(id: string): Promise<void>;

  // Slug History
  getSlugHistory(articleId: string): Promise<SlugHistoryEntry[]>;
  recordSlugChange(entry: Omit<SlugHistoryEntry, 'id'>): Promise<SlugHistoryEntry>;

  // Feedback
  getFeedback(articleId?: string): Promise<Feedback[]>;
  createFeedback(feedback: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback>;

  // Settings
  getSetting(key: string): Promise<Setting | null>;
  updateSetting(key: string, value: string, type?: Setting['type']): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;

  // Events
  trackEvent(event: AnalyticsEvent): Promise<void>;
  getEvents(filters?: EventFilters): Promise<AnalyticsEvent[]>;

  // FAQs
  getFAQs(): Promise<FAQ[]>;
  getFAQById(id: string): Promise<FAQ | null>;
  createFAQ(faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>): Promise<FAQ>;
  updateFAQ(id: string, updates: Partial<FAQ>): Promise<FAQ>;
  deleteFAQ(id: string): Promise<void>;

  // Data management
  exportData(): Promise<string>; // JSON export
  importData(jsonData: string): Promise<void>; // JSON import
}