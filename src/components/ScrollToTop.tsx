import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll restoration component that scrolls to top on route changes
 * Exceptions:
 * - Preserves scroll position for browser back/forward navigation
 * - Allows anchors to work normally (#section)
 */
export function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // Don't interfere with anchor navigation
    if (hash) return;
    
    // For back/forward navigation, let browser handle scroll restoration
    // The history.state check prevents scroll reset during back/forward
    if (window.history.state && window.history.state.usr?.restore) return;
    
    // For normal navigation, scroll to top
    window.scrollTo({ 
      top: 0, 
      left: 0, 
      behavior: 'instant' as ScrollBehavior 
    });
  }, [pathname, key, hash]);

  return null;
}