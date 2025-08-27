// URL Generator for SILO structure
// Generates all internal URLs using the new /{categorySlug}/{articleSlug} pattern

import type { Article, Category } from '@/types/admin';

// Reserved paths that cannot be used as category slugs
export const RESERVED_PATHS = [
  'buscar',
  'sitemap.xml',
  'robots.txt',
  'faq',
  'termos-de-uso',
  'termo-de-consentimento',
  'assets',
  'api',
  'admin',
  'gone',
  'favicon.ico',
  'manifest.json',
  '_next',
  'static',
  'public'
];

/**
 * Check if a category slug conflicts with reserved paths
 */
export const isReservedPath = (slug: string): boolean => {
  return RESERVED_PATHS.includes(slug.toLowerCase());
};

/**
 * Generate category URL (SILO format)
 * @param categorySlug - Category slug
 * @returns /{categorySlug}/
 */
export const generateCategoryUrl = (categorySlug: string): string => {
  if (!categorySlug) return '/';
  return `/${categorySlug}/`;
};

/**
 * Generate article URL (SILO format)
 * @param categorySlug - Category slug
 * @param articleSlug - Article slug
 * @returns /{categorySlug}/{articleSlug}
 */
export const generateArticleUrl = (categorySlug: string, articleSlug: string): string => {
  if (!categorySlug || !articleSlug) return '/';
  return `/${categorySlug}/${articleSlug}`;
};

/**
 * Generate article URL from article object
 */
export const generateArticleUrlFromObject = (article: Article, categories: Category[]): string => {
  const category = categories.find(c => c.id === article.category_id);
  if (!category) return '/';
  
  return generateArticleUrl(category.slug, article.slug);
};

/**
 * Generate canonical URL
 */
export const generateCanonicalUrl = (path: string, siteUrl: string = 'https://ajuda.modopag.com.br'): string => {
  // Remove trailing slash from siteUrl and ensure path starts with /
  const cleanSiteUrl = siteUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanSiteUrl}${cleanPath}`;
};

/**
 * Generate old-style URLs for redirect mapping
 */
export const generateOldCategoryUrl = (categorySlug: string): string => {
  return `/categoria/${categorySlug}`;
};

export const generateOldArticleUrl = (articleSlug: string): string => {
  return `/artigo/${articleSlug}`;
};

/**
 * Parse URL to extract category and article slugs
 */
export const parseUrl = (path: string): { categorySlug?: string; articleSlug?: string; isCategory: boolean } => {
  // Remove leading/trailing slashes and split
  const segments = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return { isCategory: false };
  }
  
  if (segments.length === 1) {
    // /{categorySlug}/
    return {
      categorySlug: segments[0],
      isCategory: true
    };
  }
  
  if (segments.length === 2) {
    // /{categorySlug}/{articleSlug}
    return {
      categorySlug: segments[0],
      articleSlug: segments[1],
      isCategory: false
    };
  }
  
  // More than 2 segments, invalid
  return { isCategory: false };
};

/**
 * Validate slug format
 */
export const isValidSlug = (slug: string): boolean => {
  if (!slug) return false;
  
  // Must be lowercase, kebab-case, no special chars except hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Generate breadcrumb items for structured data
 */
export const generateBreadcrumbItems = (
  categorySlug: string, 
  categoryName: string, 
  articleSlug?: string, 
  articleTitle?: string,
  siteUrl: string = 'https://ajuda.modopag.com.br'
) => {
  const items = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Central de Ajuda",
      "item": siteUrl + "/"
    },
    {
      "@type": "ListItem", 
      "position": 2,
      "name": categoryName,
      "item": generateCanonicalUrl(generateCategoryUrl(categorySlug), siteUrl)
    }
  ];
  
  if (articleSlug && articleTitle) {
    items.push({
      "@type": "ListItem",
      "position": 3,
      "name": articleTitle,
      "item": generateCanonicalUrl(generateArticleUrl(categorySlug, articleSlug), siteUrl)
    });
  }
  
  return items;
};