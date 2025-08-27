import { useEffect, useState, useCallback } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

interface Heading {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

interface UseTableOfContentsOptions {
  selector?: string;
  rootMargin?: string;
  threshold?: number;
}

export const useTableOfContents = (options: UseTableOfContentsOptions = {}) => {
  const {
    selector = 'h2',  // Only show h2 headings by default
    rootMargin = '-80px 0px -80% 0px',
    threshold = 0.1
  } = options;

  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');

  // Generate unique ID for heading
  const generateId = useCallback((text: string, existingIds: Set<string>): string => {
    const baseId = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    let id = baseId;
    let counter = 1;
    
    while (existingIds.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    
    return id;
  }, []);

  // Extract headings from content with improved DOM monitoring
  useEffect(() => {
    const extractHeadings = () => {
      // Wait for content to be fully rendered - prioritize article content
      const contentSelectors = [
        'article .article-content',  // Most specific - article content area
        '.article-content',          // Article content class
        'article',                   // Article element
        '.prose',                    // Prose content
        'main',                      // Main content area
        '[role="main"]'              // ARIA main role
      ];
      
      let contentArea = null;
      for (const sel of contentSelectors) {
        contentArea = document.querySelector(sel);
        if (contentArea) break;
      }
      
      // Ensure we have article content before proceeding
      if (!contentArea) {
        setHeadings([]);
        return;
      }
      
      // Only search within the article content area
      const headingElements = contentArea.querySelectorAll(selector);
      
      // Filter out headings from navigation, header, footer
      const validHeadings = Array.from(headingElements).filter(el => {
        const element = el as Element;
        const parent = element.closest('nav, header, footer, .header, .footer, .navigation');
        return !parent;
      });
      
      if (validHeadings.length === 0) {
        setHeadings([]);
        return;
      }
      
      const existingIds = new Set<string>();
      
      const extractedHeadings: Heading[] = validHeadings.map((element) => {
        const htmlElement = element as HTMLElement;
        const text = htmlElement.textContent?.trim() || '';
        if (!text || text.length < 2) return null;
        
        let id = htmlElement.id;
        
        // Generate ID if not exists
        if (!id) {
          id = generateId(text, existingIds);
          htmlElement.id = id;
        }
        
        existingIds.add(id);
        
        return {
          id,
          text,
          level: parseInt(htmlElement.tagName.charAt(1), 10),
          element: htmlElement
        };
      }).filter(Boolean) as Heading[];
      
      // Only update if we have meaningful changes
      setHeadings(prev => {
        if (prev.length !== extractedHeadings.length) return extractedHeadings;
        const hasChanges = extractedHeadings.some((heading, i) => 
          !prev[i] || prev[i].id !== heading.id || prev[i].text !== heading.text
        );
        return hasChanges ? extractedHeadings : prev;
      });
    };

    // Debounced extraction to avoid excessive re-renders
    let extractionTimeout: NodeJS.Timeout;
    const debouncedExtraction = () => {
      clearTimeout(extractionTimeout);
      extractionTimeout = setTimeout(extractHeadings, 150);
    };

    // Multiple extraction attempts to ensure content is ready
    const initialTimer = setTimeout(extractHeadings, 100);
    const secondTimer = setTimeout(extractHeadings, 500);
    const finalTimer = setTimeout(extractHeadings, 1000);
    
    // Listen for content changes
    const observer = new MutationObserver((mutations) => {
      const hasRelevantChanges = mutations.some(mutation => {
        if (mutation.type === 'childList') {
          // Check if added nodes contain headings
          const addedNodes = Array.from(mutation.addedNodes);
          return addedNodes.some(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              return element.matches?.(selector) || element.querySelector?.(selector);
            }
            return false;
          });
        }
        return false;
      });
      
      if (hasRelevantChanges) {
        debouncedExtraction();
      }
    });
    
    // Observe changes in content areas - focus on article content
    const contentArea = document.querySelector('article .article-content, .article-content, article, .prose, main') || document.body;
    observer.observe(contentArea, {
      childList: true,
      subtree: true
    });
    
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(secondTimer);
      clearTimeout(finalTimer);
      clearTimeout(extractionTimeout);
      observer.disconnect();
    };
  }, [selector, generateId]);

  // Set up intersection observer for active heading tracking
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          // Get the topmost visible heading
          const topEntry = visibleEntries.reduce((prev, current) => {
            return current.boundingClientRect.top < prev.boundingClientRect.top ? current : prev;
          });
          
          setActiveHeading(topEntry.target.id);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    headings.forEach(heading => {
      observer.observe(heading.element);
    });

    return () => {
      observer.disconnect();
    };
  }, [headings, rootMargin, threshold]);

  // Scroll to heading
  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  return {
    headings,
    activeHeading,
    scrollToHeading,
  };
};