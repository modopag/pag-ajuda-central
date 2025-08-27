import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types.js';

// Use service role key for build-time data fetching
const SUPABASE_URL = "https://sqroxesqxyzyxzywkybc.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY environment variable is required for build');
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface BuildData {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    icon_url?: string;
    position: number;
  }>;
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    content: string;
    first_paragraph?: string;
    meta_description?: string;
    meta_title?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    canonical_url?: string;
    author: string;
    published_at: string;
    updated_at: string;
    category_id: string;
    reading_time_minutes: number;
    view_count: number;
    seo_image?: any;
    noindex: boolean;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    category: string;
    position: number;
  }>;
}

export async function fetchBuildData(): Promise<BuildData> {
  console.log('🔄 Fetching categories...');
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('position');

  if (categoriesError) {
    throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
  }

  console.log('🔄 Fetching articles...');
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (articlesError) {
    throw new Error(`Failed to fetch articles: ${articlesError.message}`);
  }

  console.log('🔄 Fetching FAQs...');
  const { data: faqs, error: faqsError } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('position');

  if (faqsError) {
    throw new Error(`Failed to fetch FAQs: ${faqsError.message}`);
  }

  console.log(`✅ Data fetched: ${categories?.length || 0} categories, ${articles?.length || 0} articles, ${faqs?.length || 0} FAQs`);

  return {
    categories: categories || [],
    articles: articles || [],
    faqs: faqs || [],
  };
}