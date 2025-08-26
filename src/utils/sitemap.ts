import { getDataAdapter } from '@/lib/data-adapter';
import type { Article, Category } from '@/types/admin';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

// Generate sitemap XML content
export const generateSitemap = async (siteUrl: string): Promise<string> => {
  try {
    const adapter = await getDataAdapter();
    
    // Get published articles and active categories
    const [articles, categories] = await Promise.all([
      adapter.getArticles({ status: 'published' }),
      adapter.getCategories()
    ]);
    
    const activeCategories = categories.filter(cat => cat.is_active);
    
    const urls: SitemapUrl[] = [
      // Homepage
      {
        loc: siteUrl,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '1.0'
      },
      
      // Categories  
      ...activeCategories.map(category => ({
        loc: `${siteUrl}${category.slug}/`,
        lastmod: category.updated_at.split('T')[0],
        changefreq: 'weekly' as const,
        priority: '0.8'
      })),
      
      // Articles (SILO structure)
      ...articles.map(article => {
        const category = activeCategories.find(cat => cat.id === article.category_id);
        return {
          loc: `${siteUrl}${category?.slug}/${article.slug}`,
          lastmod: article.updated_at.split('T')[0],
          changefreq: 'monthly' as const,
          priority: '0.7'
        };
      }),
      
      // Search page
      {
        loc: `${siteUrl}/buscar`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.6'
      }
    ];
    
    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    return xml;
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    throw error;
  }
};

// Generate robots.txt content
export const generateRobotsTxt = (siteUrl: string): string => {
  return `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${siteUrl}/sitemap.xml`;
};

// Rebuild sitemap (for admin use)
export const rebuildSitemap = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const adapter = await getDataAdapter();
    
    // Get site URL from settings
    const siteUrlSetting = await adapter.getSetting('site_url');
    const siteUrl = siteUrlSetting?.value || 'https://ajuda.modopag.com.br';
    
    // Generate sitemap
    const sitemapXml = await generateSitemap(siteUrl);
    
    // In a real implementation, you would save this to /public/sitemap.xml
    // For now, we'll just validate that it was generated successfully
    if (sitemapXml.includes('<urlset')) {
      return {
        success: true,
        message: 'Sitemap regenerado com sucesso'
      };
    } else {
      throw new Error('Invalid sitemap generated');
    }
  } catch (error) {
    return {
      success: false,
      message: `Erro ao gerar sitemap: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};