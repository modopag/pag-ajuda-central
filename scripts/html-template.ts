import { generateArticleJsonLd, generateBreadcrumbJsonLd, generateFAQJsonLd, generateWebsiteJsonLd, generateCategoryJsonLd } from '../src/utils/jsonLd.js';

interface Route {
  path: string;
  type: 'home' | 'category' | 'article';
  data?: any;
}

interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType: 'website' | 'article';
  jsonLd?: object;
  noindex?: boolean;
}

interface ViteAssets {
  cssLinks: string[];
  jsScripts: string[];
}

const SITE_URL = 'https://ajuda.modopag.com.br';
const DEFAULT_DESCRIPTION = 'Central de Ajuda modoPAG - Encontre respostas para suas dúvidas sobre pagamentos digitais, cartões e soluções financeiras.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

function generateSEOData(route: Route): SEOData {
  const baseUrl = SITE_URL;
  
  switch (route.type) {
    case 'home': {
      return {
        title: 'Central de Ajuda modoPAG - Suporte e Dúvidas',
        description: DEFAULT_DESCRIPTION,
        canonical: baseUrl,
        ogType: 'website',
        ogImage: DEFAULT_OG_IMAGE,
        jsonLd: generateWebsiteJsonLd(),
      };
    }
    
    case 'category': {
      const { category, articles } = route.data;
      const title = `${category.name} - Central de Ajuda modoPAG`;
      const description = category.description || `Encontre artigos sobre ${category.name} na Central de Ajuda modoPAG.`;
      
      return {
        title,
        description,
        canonical: `${baseUrl}/${category.slug}/`,
        ogType: 'website',
        ogImage: DEFAULT_OG_IMAGE,
        jsonLd: generateCategoryJsonLd(category, articles || []),
      };
    }
    
    case 'article': {
      const { article, category } = route.data;
      const title = `${article.meta_title || article.title} | modoPAG Ajuda`;
      const description = article.meta_description || article.first_paragraph || DEFAULT_DESCRIPTION;
      const ogImage = article.og_image || article.seo_image?.url || DEFAULT_OG_IMAGE;
      
      // Generate combined JSON-LD
      const jsonLdObjects = [
        generateArticleJsonLd(article, category),
        generateBreadcrumbJsonLd(article, category),
      ];
      
      // Add FAQ JSON-LD if article has FAQs (detect FAQ patterns in content)
      const hasFAQs = article.content.includes('</strong>') && article.content.includes('?');
      if (hasFAQs) {
        // Extract FAQ-like patterns from content (simplified)
        const faqMatches = article.content.match(/<strong[^>]*>([^<]*\?).*?<\/strong>\s*([^<]*)/g);
        if (faqMatches && faqMatches.length > 0) {
          const faqs = faqMatches.slice(0, 5).map(match => {
            const [, question, answer] = match.match(/<strong[^>]*>([^<]*\?).*?<\/strong>\s*([^<]*)/) || [];
            return {
              question: question?.trim() || '',
              answer: answer?.trim() || '',
            };
          }).filter(faq => faq.question && faq.answer);
          
          if (faqs.length > 0) {
            jsonLdObjects.push(generateFAQJsonLd(faqs));
          }
        }
      }
      
      return {
        title,
        description,
        canonical: article.canonical_url || `${baseUrl}/${category.slug}/${article.slug}`,
        ogTitle: article.og_title || title,
        ogDescription: article.og_description || description,
        ogImage,
        ogType: 'article',
        jsonLd: jsonLdObjects,
        noindex: article.noindex,
      };
    }
    
    default:
      return {
        title: 'Central de Ajuda modoPAG',
        description: DEFAULT_DESCRIPTION,
        canonical: baseUrl,
        ogType: 'website',
        ogImage: DEFAULT_OG_IMAGE,
      };
  }
}

export function generateHTMLTemplate(reactHTML: string, route: Route, assets: ViteAssets = { cssLinks: [], jsScripts: [] }): string {
  const seo = generateSEOData(route);
  
  const jsonLdScript = seo.jsonLd 
    ? `<script type="application/ld+json">${JSON.stringify(seo.jsonLd, null, 0)}</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Primary Meta Tags -->
  <title>${seo.title}</title>
  <meta name="description" content="${seo.description}" />
  <meta name="author" content="modoPAG" />
  ${seo.noindex ? '<meta name="robots" content="noindex, nofollow" />' : '<meta name="robots" content="index, follow" />'}
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${seo.canonical}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${seo.ogType}" />
  <meta property="og:title" content="${seo.ogTitle || seo.title}" />
  <meta property="og:description" content="${seo.ogDescription || seo.description}" />
  <meta property="og:image" content="${seo.ogImage}" />
  <meta property="og:url" content="${seo.canonical}" />
  <meta property="og:site_name" content="modoPAG Central de Ajuda" />
  <meta property="og:locale" content="pt_BR" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${seo.ogTitle || seo.title}" />
  <meta name="twitter:description" content="${seo.ogDescription || seo.description}" />
  <meta name="twitter:image" content="${seo.ogImage}" />
  
  <!-- Preload Critical Resources -->
  <link rel="preload" href="/fonts/inter-variable.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/modopag-logo-black.webp" as="image" fetchpriority="high" />
  
  <!-- Favicons -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  
  <!-- PWA -->
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#FFED4A" />
  
  <!-- DNS Prefetch -->
  <link rel="dns-prefetch" href="//fonts.googleapis.com" />
  <link rel="dns-prefetch" href="//sqroxesqxyzyxzywkybc.supabase.co" />
  
  ${jsonLdScript}
  
  <!-- Vite CSS Assets -->
  ${assets.cssLinks.join('\n  ')}
</head>
<body>
  <div id="root">${reactHTML}</div>
  
  <!-- Vite JS Assets -->
  ${assets.jsScripts.join('\n  ')}
</body>
</html>`;
}