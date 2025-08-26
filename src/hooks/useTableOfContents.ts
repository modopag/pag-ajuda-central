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
    selector = 'h2, h3, h4',
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

  // Extract headings from content with better DOM monitoring
  useEffect(() => {
    const extractHeadings = () => {
      // Look specifically in article content area first
      const contentArea = document.querySelector('.article-content, .prose, main, [role="main"]') || document;
      const headingElements = contentArea.querySelectorAll(selector);
      
      if (headingElements.length === 0) {
        // Fallback: search in the entire document
        const allHeadings = document.querySelectorAll(selector);
        if (allHeadings.length === 0) return;
      }
      
      const existingIds = new Set<string>();
      const finalElements = headingElements.length > 0 ? headingElements : document.querySelectorAll(selector);
      
      const extractedHeadings: Heading[] = Array.from(finalElements).map((element) => {
        const text = element.textContent?.trim() || '';
        if (!text) return null;
        
        let id = element.id;
        
        // Generate ID if not exists
        if (!id) {
          id = generateId(text, existingIds);
          element.id = id;
        }
        
        existingIds.add(id);
        
        return {
          id,
          text,
          level: parseInt(element.tagName.charAt(1), 10),
          element: element as HTMLElement
        };
      }).filter(Boolean) as Heading[];
      
      setHeadings(extractedHeadings);
    };

    // Multiple attempts to extract headings
    const attemptExtraction = (attempt = 0) => {
      extractHeadings();
      
      // If no headings found and we haven't tried enough times, try again
      if (attempt < 3) {
        setTimeout(() => attemptExtraction(attempt + 1), 200 * (attempt + 1));
      }
    };

    // Start extraction process
    const timer = setTimeout(() => attemptExtraction(), 100);
    
    // Also listen for DOM changes
    const observer = new MutationObserver((mutations) => {
      const hasNewContent = mutations.some(mutation => 
        mutation.type === 'childList' && mutation.addedNodes.length > 0
      );
      
      if (hasNewContent) {
        setTimeout(extractHeadings, 300);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      clearTimeout(timer);
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