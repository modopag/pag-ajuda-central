-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  author TEXT NOT NULL,
  
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  noindex BOOLEAN NOT NULL DEFAULT false,
  
  -- Additional fields
  reading_time_minutes INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'artigo' CHECK (type IN ('artigo', 'tutorial', 'aviso', 'atualização')),
  view_count INTEGER NOT NULL DEFAULT 0,
  first_paragraph TEXT
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create article_tags junction table
CREATE TABLE public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Create media table
CREATE TABLE public.media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create redirects table
CREATE TABLE public.redirects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '301' CHECK (type IN ('301', '302', '410')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  comment TEXT,
  user_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create slug_history table
CREATE TABLE public.slug_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  old_slug TEXT NOT NULL,
  new_slug TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  redirect_created BOOLEAN NOT NULL DEFAULT false
);

-- Create settings table
CREATE TABLE public.settings (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'json', 'boolean', 'number')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table for admin functionality
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'author', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create analytics_events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('faq_search', 'faq_view_article', 'faq_feedback', 'whatsapp_cta_click')),
  data JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slug_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access (since this is a help center)
CREATE POLICY "Public read access for categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for articles" ON public.articles FOR SELECT USING (status = 'published');
CREATE POLICY "Public read access for tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public read access for media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Public read access for redirects" ON public.redirects FOR SELECT USING (is_active = true);

-- Create RLS policies for feedback (public can insert)
CREATE POLICY "Public can insert feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access for feedback" ON public.feedback FOR SELECT USING (true);

-- Create RLS policies for analytics (public can insert)
CREATE POLICY "Public can insert analytics events" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- Admin policies (for future auth implementation)
CREATE POLICY "Admin full access to categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Admin full access to articles" ON public.articles FOR ALL USING (true);
CREATE POLICY "Admin full access to tags" ON public.tags FOR ALL USING (true);
CREATE POLICY "Admin full access to article_tags" ON public.article_tags FOR ALL USING (true);
CREATE POLICY "Admin full access to media" ON public.media FOR ALL USING (true);
CREATE POLICY "Admin full access to redirects" ON public.redirects FOR ALL USING (true);
CREATE POLICY "Admin full access to slug_history" ON public.slug_history FOR ALL USING (true);
CREATE POLICY "Admin full access to settings" ON public.settings FOR ALL USING (true);
CREATE POLICY "Admin full access to users" ON public.users FOR ALL USING (true);
CREATE POLICY "Admin read access to analytics" ON public.analytics_events FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_articles_category_id ON public.articles(category_id);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_position ON public.categories(position);
CREATE INDEX idx_tags_slug ON public.tags(slug);
CREATE INDEX idx_feedback_article_id ON public.feedback(article_id);
CREATE INDEX idx_redirects_from_path ON public.redirects(from_path);
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_timestamp ON public.analytics_events(timestamp);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();