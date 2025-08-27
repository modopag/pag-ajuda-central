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
    const article = document.querySelector('article');
    if (!article) {
      setHeadings([]);
      return;
    }

    const slugify = (text: string) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    };

    const collectHeadings = () => {
      // Find all H2 elements within the article
      const h2Elements = Array.from(article.querySelectorAll<HTMLHeadingElement>('h2'));
      
      // Filter out headings from navigation, header, footer areas
      const validHeadings = h2Elements.filter(el => {
        const parent = el.closest('nav, header, footer, .header, .footer, .navigation');
        return !parent;
      });

      if (validHeadings.length === 0) {
        setHeadings([]);
        return;
      }

      const existingIds = new Set<string>();
      
      const extractedHeadings: Heading[] = validHeadings.map((element) => {
        const text = element.textContent?.trim() || '';
        if (!text || text.length < 2) return null;
        
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
          level: 2, // Only H2 elements
          element
        };
      }).filter(Boolean) as Heading[];
      
      // Update headings state
      setHeadings(prev => {
        if (prev.length !== extractedHeadings.length) return extractedHeadings;
        const hasChanges = extractedHeadings.some((heading, i) => 
          !prev[i] || prev[i].id !== heading.id || prev[i].text !== heading.text
        );
        return hasChanges ? extractedHeadings : prev;
      });
    };

    // Initial collection using requestAnimationFrame for better timing
    requestAnimationFrame(collectHeadings);

    // Set up MutationObserver to watch for content changes in the article
    const observer = new MutationObserver(() => {
      requestAnimationFrame(collectHeadings);
    });
    
    observer.observe(article, {
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