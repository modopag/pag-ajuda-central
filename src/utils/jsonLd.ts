import type { Article, Category } from '@/types/admin';

export const generateArticleJsonLd = (article: Article, category: Category) => {
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
        "url": "https://modopag.com.br/images/logo-modopag.png"
      }
    },
    "datePublished": article.published_at,
    "dateModified": article.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ajuda.modopag.com.br/article/${article.slug}`
    },
    "articleSection": category.name,
    "image": article.og_image || "https://modopag.com.br/images/og-default.png"
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
        "item": `https://ajuda.modopag.com.br/category/${category.slug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `https://ajuda.modopag.com.br/article/${article.slug}`
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

export const generateCategoryJsonLd = (category: Category, articles: Article[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} - Central de Ajuda modoPAG`,
    "description": category.description,
    "url": `https://ajuda.modopag.com.br/category/${category.slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": articles.length,
      "itemListElement": articles.map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://ajuda.modopag.com.br/article/${article.slug}`,
        "name": article.title
      }))
    }
  };
};