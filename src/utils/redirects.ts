import { getDataAdapter } from '@/lib/data-adapter';
import type { RedirectType } from '@/types/admin';

// Auto-create 301 redirect when article slug changes
export const createSlugRedirect = async (oldSlug: string, newSlug: string): Promise<void> => {
  if (oldSlug === newSlug || !oldSlug || !newSlug) return;

  try {
    const adapter = await getDataAdapter();
    
    // Check if redirect already exists
    const existingRedirects = await adapter.getRedirects();
    const existingRedirect = existingRedirects.find(r => r.from_path === `/artigo/${oldSlug}`);
    
    if (existingRedirect) {
      // Update existing redirect
      await adapter.updateRedirect(existingRedirect.id, {
        to_path: `/artigo/${newSlug}`,
        type: 301 as RedirectType,
        is_active: true
      });
    } else {
      // Create new redirect
      await adapter.createRedirect({
        from_path: `/artigo/${oldSlug}`,
        to_path: `/artigo/${newSlug}`,
        type: 301 as RedirectType,
        is_active: true
      });
    }
  } catch (error) {
    console.error('Failed to create slug redirect:', error);
  }
};

// Check for existing slug conflicts
export const checkSlugConflict = async (slug: string, excludeArticleId?: string): Promise<boolean> => {
  try {
    const adapter = await getDataAdapter();
    const articles = await adapter.getArticles({ status: 'published' });
    
    return articles.some(article => 
      article.slug === slug && article.id !== excludeArticleId
    );
  } catch (error) {
    console.error('Failed to check slug conflict:', error);
    return false;
  }
};

// Apply redirect rules (for use in router or middleware)
export const applyRedirects = async (pathname: string): Promise<string | null> => {
  try {
    const adapter = await getDataAdapter();
    const redirects = await adapter.getRedirects();
    
    const activeRedirect = redirects.find(r => 
      r.is_active && r.from_path === pathname
    );
    
    return activeRedirect ? activeRedirect.to_path : null;
  } catch (error) {
    console.error('Failed to apply redirects:', error);
    return null;
  }
};

// Handle 410 Gone status for discontinued content
export const createGoneRedirect = async (articleSlug: string): Promise<void> => {
  try {
    const adapter = await getDataAdapter();
    
    await adapter.createRedirect({
      from_path: `/artigo/${articleSlug}`,
      to_path: '/410', // Special path for gone content
      type: 301 as RedirectType, // Use 301 to redirect to 410 page
      is_active: true
    });
  } catch (error) {
    console.error('Failed to create gone redirect:', error);
  }
};