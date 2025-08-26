import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDataAdapter } from '@/lib/data-adapter';
import { generateArticleUrl, generateCategoryUrl, parseUrl, isReservedPath } from '@/utils/urlGenerator';

/**
 * Component that handles trailing slash normalization
 * Runs on every route change to normalize URLs
 */
export const RedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    handleTrailingSlash();
  }, [location.pathname]);

  const handleTrailingSlash = () => {
    const currentPath = location.pathname;
    
    // Handle trailing slash for category pages
    // If path matches /{slug} (no trailing slash) and it's not a reserved path
    const singleSlugMatch = currentPath.match(/^\/([^\/]+)$/);
    if (singleSlugMatch) {
      const slug = singleSlugMatch[1];
      if (!isReservedPath(slug)) {
        // Redirect to /{slug}/ (with trailing slash)
        navigate(`/${slug}/`, { replace: true });
        return;
      }
    }
  };

  return null; // This component doesn't render anything
};