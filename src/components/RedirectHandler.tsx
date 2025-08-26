import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDataAdapter } from '@/lib/data-adapter';
import { generateArticleUrl, generateCategoryUrl, parseUrl, isReservedPath } from '@/utils/urlGenerator';

/**
 * Component that handles 301 redirects for old URLs
 * Runs on every route change to check if current path should redirect
 */
export const RedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    handleRedirects();
  }, [location.pathname]);

  const handleRedirects = async () => {
    const currentPath = location.pathname;
    
    try {
      const adapter = await getDataAdapter();

      // 1. Check explicit redirects table first
      const redirects = await adapter.getRedirects();
      const explicitRedirect = redirects.find(r => r.from_path === currentPath);
      
      if (explicitRedirect) {
        if (explicitRedirect.type === '301' || explicitRedirect.type === '302') {
          window.location.replace(explicitRedirect.to_path);
          return;
        }
        if (explicitRedirect.type === '410') {
          navigate('/gone', { replace: true });
          return;
        }
      }

      // 2. Handle old category URLs: /categoria/:slug → /:slug/
      const oldCategoryMatch = currentPath.match(/^\/categoria\/([^\/]+)\/?$/);
      if (oldCategoryMatch) {
        const categorySlug = oldCategoryMatch[1];
        
        // Check if category exists and is not reserved
        if (!isReservedPath(categorySlug)) {
          const categories = await adapter.getCategories();
          const category = categories.find(c => c.slug === categorySlug && c.is_active);
          
          if (category) {
            const newUrl = generateCategoryUrl(categorySlug);
            window.location.replace(newUrl);
            return;
          }
        }
      }

      // 3. Handle old article URLs: /artigo/:slug → /:categorySlug/:articleSlug
      const oldArticleMatch = currentPath.match(/^\/artigo\/([^\/]+)\/?$/);
      if (oldArticleMatch) {
        const articleSlug = oldArticleMatch[1];
        
        // Find article and its category
        const articles = await adapter.getArticles();
        const categories = await adapter.getCategories();
        
        const article = articles.find(a => a.slug === articleSlug && a.status === 'published');
        if (article) {
          const category = categories.find(c => c.id === article.category_id);
          if (category && !isReservedPath(category.slug)) {
            const newUrl = generateArticleUrl(category.slug, articleSlug);
            window.location.replace(newUrl);
            return;
          }
        }
      }

      // 4. Check if current path is a valid SILO URL but category slug is reserved
      const parsedUrl = parseUrl(currentPath);
      if (parsedUrl.categorySlug && isReservedPath(parsedUrl.categorySlug)) {
        navigate('/404', { replace: true });
        return;
      }

    } catch (error) {
      console.error('Error handling redirects:', error);
      // Don't redirect on error, let the route handle it normally
    }
  };

  return null; // This component doesn't render anything
};