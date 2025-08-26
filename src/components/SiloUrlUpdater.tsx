import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateArticleUrl, generateCategoryUrl } from '@/utils/urlGenerator';
import type { Article, Category } from '@/types/admin';

/**
 * Component to update all internal links to use SILO structure
 * This should be used in components that display article/category links
 */

interface CategoryLinkProps {
  category: Category;
  children: React.ReactNode;
  className?: string;
}

export const CategoryLink = ({ category, children, className }: CategoryLinkProps) => {
  return (
    <Link 
      to={generateCategoryUrl(category.slug)} 
      className={className}
    >
      {children}
    </Link>
  );
};

interface ArticleLinkProps {
  article: Article;
  category: Category;
  children: React.ReactNode;
  className?: string;
}

export const ArticleLink = ({ article, category, children, className }: ArticleLinkProps) => {
  return (
    <Link 
      to={generateArticleUrl(category.slug, article.slug)} 
      className={className}
    >
      {children}
    </Link>
  );
};

/**
 * Hook to update existing DOM links to use SILO structure
 * Useful for content that might have old-style links
 */
export const useSiloUrlUpdater = () => {
  useEffect(() => {
    const updateLinks = () => {
      // Update category links
      const categoryLinks = document.querySelectorAll('a[href^="/categoria/"]');
      categoryLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          const match = href.match(/^\/categoria\/([^\/]+)\/?$/);
          if (match) {
            const categorySlug = match[1];
            link.setAttribute('href', generateCategoryUrl(categorySlug));
          }
        }
      });

      // Update article links
      const articleLinks = document.querySelectorAll('a[href^="/artigo/"]');
      articleLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          const match = href.match(/^\/artigo\/([^\/]+)\/?$/);
          if (match) {
            // Note: This is tricky because we need the category slug
            // In practice, this would need to be handled by the content management system
            console.warn('Old article link found, needs manual update:', href);
          }
        }
      });
    };

    // Update links on mount and when content changes
    updateLinks();
    
    // Set up mutation observer to catch dynamically added content
    const observer = new MutationObserver(() => {
      updateLinks();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);
};