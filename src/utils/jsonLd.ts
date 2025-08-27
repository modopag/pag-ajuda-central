import type { Article, Category } from '@/types/admin';

export const generateArticleJsonLd = (article: Article, category: Category) => {
  // Use structured SEO image if available, fallback to og_image, then default
  const seoImage = article.seo_image;
  const imageUrl = seoImage?.url || article.og_image || "https://ajuda.modopag.com.br/og-default.jpg";
  
  // Create proper ImageObject when we have structured data
  const imageObject = seoImage ? {
    "@type": "ImageObject",
    "url": seoImage.url,
    "width": seoImage.width,
    "height": seoImage.height,
    "contentUrl": seoImage.url,
    "name": seoImage.alt,
    "description": seoImage.caption || seoImage.alt
  } : imageUrl;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.meta_description || `Artigo sobre ${article.title} na Central de Ajuda modoPAG`,
    "author": {
      "@type": "Organization",
      "name": "modoPAG",
      "url": "https://modopag.com.br"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "modoPAG",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ajuda.modopag.com.br/modopag-logo-yellow.webp"
      }
    },
    "datePublished": article.published_at,
    "dateModified": article.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage", 
      "@id": `https://ajuda.modopag.com.br/${category.slug}/${article.slug}`
    },
    "articleSection": category.name,
    "image": imageObject,
    "inLanguage": "pt-BR"
  };
};

export const generateBreadcrumbJsonLd = (article: Article, category: Category) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": "https://ajuda.modopag.com.br"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": category.name,
        "item": `https://ajuda.modopag.com.br/${category.slug}/`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `https://ajuda.modopag.com.br/${category.slug}/${article.slug}`
      }
    ]
  };
};

export const generateFAQJsonLd = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export const generateWebsiteJsonLd = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Central de Ajuda modoPAG",
    "url": "https://ajuda.modopag.com.br",
    "description": "Central de Ajuda modoPAG - Encontre respostas para suas dúvidas sobre pagamentos digitais, cartões e soluções financeiras.",
    "inLanguage": "pt-BR",
    "publisher": {
      "@type": "Organization",
      "name": "modoPAG",
      "url": "https://modopag.com.br",
      "logo": "https://ajuda.modopag.com.br/modopag-logo-yellow.webp"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://ajuda.modopag.com.br/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
};

export const generateCategoryJsonLd = (category: Category, articles: Article[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} - Central de Ajuda modoPAG`,
    "description": category.description,
    "url": `https://ajuda.modopag.com.br/${category.slug}/`,
    "mainEntity": {
      "@type": "ItemList", 
      "numberOfItems": articles.length,
      "itemListElement": articles.map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://ajuda.modopag.com.br/${category.slug}/${article.slug}`,
        "name": article.title
      }))
    }
  };
};