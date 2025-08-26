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

  // Extract headings from content
  useEffect(() => {
    const extractHeadings = () => {
      const headingElements = document.querySelectorAll(selector);
      const existingIds = new Set<string>();
      
      const extractedHeadings: Heading[] = Array.from(headingElements).map((element) => {
        const text = element.textContent || '';
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
      });
      
      setHeadings(extractedHeadings);
    };

    // Wait for content to be rendered
    const timer = setTimeout(extractHeadings, 500);
    
    return () => clearTimeout(timer);
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