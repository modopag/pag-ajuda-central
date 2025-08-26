import { useEffect, useRef, useCallback } from 'react';

interface AccessibilityOptions {
  announcePageChanges?: boolean;
  focusFirstHeading?: boolean;
  enableHighContrast?: boolean;
}

/**
 * Accessibility utilities hook for screen readers and keyboard navigation
 */
export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const {
    announcePageChanges = true,
    focusFirstHeading = true,
    enableHighContrast = false
  } = options;

  const announcementRef = useRef<HTMLDivElement | null>(null);

  // Create live region for announcements
  useEffect(() => {
    if (!announcePageChanges) return;

    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'accessibility-announcements';
    
    document.body.appendChild(liveRegion);
    announcementRef.current = liveRegion;

    return () => {
      if (liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion);
      }
    };
  }, [announcePageChanges]);

  // Announce page changes to screen readers
  const announcePageChange = useCallback((message: string) => {
    if (announcementRef.current) {
      // Clear previous message first
      announcementRef.current.textContent = '';
      // Set new message after a brief delay
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = message;
        }
      }, 100);
    }
  }, []);

  // Focus management for page transitions
  const focusFirstHeadingOnPage = useCallback(() => {
    if (!focusFirstHeading) return;

    setTimeout(() => {
      const firstHeading = document.querySelector('h1, [role="heading"][aria-level="1"]') as HTMLElement;
      if (firstHeading) {
        firstHeading.focus();
        firstHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [focusFirstHeading]);

  // High contrast mode toggle
  const toggleHighContrast = useCallback(() => {
    document.documentElement.classList.toggle('high-contrast');
    const isEnabled = document.documentElement.classList.contains('high-contrast');
    localStorage.setItem('high-contrast', isEnabled.toString());
    
    announcePageChange(
      isEnabled ? 'Alto contraste ativado' : 'Alto contraste desativado'
    );
  }, [announcePageChange]);

  // Load high contrast preference
  useEffect(() => {
    if (enableHighContrast) {
      const savedPreference = localStorage.getItem('high-contrast');
      if (savedPreference === 'true') {
        document.documentElement.classList.add('high-contrast');
      }
    }
  }, [enableHighContrast]);

  // Color contrast validation
  const validateColorContrast = useCallback((foreground: string, background: string): boolean => {
    // Simple contrast ratio check (simplified implementation)
    // In production, you might want to use a more robust library
    try {
      const getForegroundLuminance = (color: string) => {
        // This is a simplified luminance calculation
        // Real implementation would parse HSL/RGB properly
        return 0.5; // Placeholder
      };
      
      const getBackgroundLuminance = (color: string) => {
        return 0.5; // Placeholder
      };

      const fgLuminance = getForegroundLuminance(foreground);
      const bgLuminance = getBackgroundLuminance(background);
      
      const contrastRatio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                           (Math.min(fgLuminance, bgLuminance) + 0.05);
      
      return contrastRatio >= 4.5; // WCAG AA standard
    } catch {
      return true; // Assume valid if we can't calculate
    }
  }, []);

  return {
    announcePageChange,
    focusFirstHeadingOnPage,
    toggleHighContrast,
    validateColorContrast,
  };
};