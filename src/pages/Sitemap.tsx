import { useEffect, useState } from 'react';
import { getDataAdapter } from '@/lib/data-adapter';
import type { Article, Category } from '@/types/admin';

export default function Sitemap() {
  const [xmlContent, setXmlContent] = useState<string>('');

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        const adapter = await getDataAdapter();
        const [articles, categories] = await Promise.all([
          adapter.getArticles({ status: 'published' }),
          adapter.getCategories()
        ]);

        const baseUrl = 'https://ajuda.modopag.com.br';
        const currentDate = new Date().toISOString().split('T')[0];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

        // Add categories
        categories.filter(cat => cat.is_active).forEach(category => {
          xml += `
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${category.updated_at.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        // Add articles
        articles.forEach(article => {
          xml += `
  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <lastmod>${article.updated_at.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
        });

        xml += `
</urlset>`;

        setXmlContent(xml);
      } catch (error) {
        console.error('Erro ao gerar sitemap:', error);
        setXmlContent(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ajuda.modopag.com.br</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
      }
    };

    generateSitemap();
  }, []);

  useEffect(() => {
    if (xmlContent) {
      // Set response headers for XML
      document.querySelector('head')?.insertAdjacentHTML('beforeend', 
        '<meta http-equiv="Content-Type" content="application/xml; charset=utf-8">'
      );
    }
  }, [xmlContent]);

  return (
    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
      {xmlContent || 'Gerando sitemap...'}
    </pre>
  );
}