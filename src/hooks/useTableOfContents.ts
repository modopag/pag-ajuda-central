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

  // Extract headings from content with reliable article-focused collection
  useEffect(() => {
    const collectHeadings = () => {
      const article = document.querySelector('article');
      if (!article) {
        console.log('TOC: Article element not found');
        setHeadings([]);
        return;
      }

      // Find all H2 elements within the article
      const h2Elements = Array.from(article.querySelectorAll<HTMLHeadingElement>('h2'));
      console.log(`TOC: Found ${h2Elements.length} H2 elements in article`);
      
      // Less restrictive filtering - only exclude obvious navigation elements
      const validHeadings = h2Elements.filter(el => {
        const parent = el.closest('nav, header, .navigation, .header-nav');
        const isValid = !parent;
        if (!isValid) {
          console.log('TOC: Filtered out heading:', el.textContent);
        }
        return isValid;
      });

      console.log(`TOC: ${validHeadings.length} valid headings after filtering`);

      if (validHeadings.length === 0) {
        setHeadings([]);
        return;
      }

      const existingIds = new Set<string>();
      
      const extractedHeadings: Heading[] = validHeadings.map((element) => {
        const text = element.textContent?.trim() || '';
        // More lenient text validation - only require non-empty text
        if (!text) {
          console.log('TOC: Skipping heading with no text');
          return null;
        }
        
        let id = element.id;
        
        // Generate ID if not exists
        if (!id) {
          id = generateId(text, existingIds);
          element.id = id;
        }
        
        existingIds.add(id);
        
        console.log(`TOC: Processing heading: "${text}" with id: "${id}"`);
        
        return {
          id,
          text,
          level: 2, // Only H2 elements
          element
        };
      }).filter(Boolean) as Heading[];
      
      console.log(`TOC: Final extracted headings count: ${extractedHeadings.length}`);
      
      // Update headings state
      setHeadings(prev => {
        if (prev.length !== extractedHeadings.length) {
          console.log(`TOC: Updating headings - count changed from ${prev.length} to ${extractedHeadings.length}`);
          return extractedHeadings;
        }
        const hasChanges = extractedHeadings.some((heading, i) => 
          !prev[i] || prev[i].id !== heading.id || prev[i].text !== heading.text
        );
        if (hasChanges) {
          console.log('TOC: Updating headings - content changed');
        }
        return hasChanges ? extractedHeadings : prev;
      });
    };

    // Multiple timing strategies to ensure we catch the content
    const delayedCollection = () => {
      // Try immediate collection
      collectHeadings();
      
      // Try again after a short delay for content to render
      setTimeout(() => {
        collectHeadings();
      }, 100);
      
      // Try once more after DOM is fully updated
      setTimeout(() => {
        collectHeadings();
      }, 500);
    };

    // Initial collection with improved timing
    requestAnimationFrame(delayedCollection);

    // Set up MutationObserver to watch for content changes in the entire document
    const observer = new MutationObserver((mutations) => {
      try {
        const hasContentChanges = mutations.some(mutation => {
          // Check if article content changed
          const target = mutation.target;
          
          // Safety check: ensure target is an Element before calling DOM methods
          if (!target || target.nodeType !== Node.ELEMENT_NODE) {
            return false;
          }
          
          const targetElement = target as Element;
          return targetElement.closest('article') || 
                 mutation.type === 'childList' && 
                 Array.from(mutation.addedNodes).some(node => 
                   node.nodeType === Node.ELEMENT_NODE && 
                   (node as Element).matches('h2') || 
                   (node as Element).querySelector('h2')
                 );
        });
        
        if (hasContentChanges) {
          console.log('TOC: Content changed, re-collecting headings');
          requestAnimationFrame(delayedCollection);
        }
      } catch (error) {
        console.error('TOC: Error in MutationObserver:', error);
      }
    });
    
    // Observe the entire document for better coverage
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    return () => {
      observer.disconnect();
    };
  }, [generateId]);

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