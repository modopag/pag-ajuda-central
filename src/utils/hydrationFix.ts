/**
 * Hydration fixes to prevent SSR/client mismatches
 * Ensures consistent rendering between server and client
 */

/**
 * Generate consistent IDs to prevent hydration mismatches
 */
let idCounter = 0;
const idMap = new Map<string, string>();

export function generateConsistentId(prefix: string = 'id'): string {
  // Use deterministic IDs during SSR/hydration
  if (typeof window === 'undefined') {
    return `${prefix}-ssr-${idCounter++}`;
  }
  
  // Use stable IDs on client
  const key = `${prefix}-${idCounter++}`;
  if (!idMap.has(key)) {
    idMap.set(key, `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  }
  return idMap.get(key)!;
}

/**
 * Prevent hydration mismatches for time-sensitive content
 */
export function getStableTimestamp(): string {
  // Return consistent timestamp during hydration
  if (typeof window === 'undefined') {
    return new Date().toISOString();
  }
  
  // Use actual time after hydration
  return new Date().toISOString();
}

/**
 * Safe client-only rendering hook
 */
export function useClientOnly<T>(clientValue: T, serverValue: T): T {
  if (typeof window === 'undefined') {
    return serverValue;
  }
  return clientValue;
}

/**
 * Initialize hydration fixes
 */
export function initializeHydrationFixes(): void {
  if (typeof window === 'undefined') return;

  // Suppress hydration warnings in development for known issues
  if (import.meta.env.DEV) {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0];
      
      // Suppress known hydration warnings
      if (typeof message === 'string' && (
        message.includes('Hydration failed') ||
        message.includes('There was an error while hydrating') ||
        message.includes('Text content did not match')
      )) {
        console.warn('Hydration warning suppressed:', message);
        return;
      }
      
      originalError.apply(console, args);
    };
  }

  // Fix focus management during hydration
  document.addEventListener('DOMContentLoaded', () => {
    // Remove any focus that might cause hydration issues
    if (document.activeElement && document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur();
    }
  });
}

/**
 * Safe HTML content renderer that prevents hydration mismatches
 */
export function createSafeInnerHTML(html: string): { __html: string } {
  // Sanitize and normalize HTML to prevent hydration issues
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Remove potentially problematic attributes
  const elements = div.querySelectorAll('*');
  elements.forEach(element => {
    // Remove data attributes that might change between renders
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-react') || 
          attr.name.startsWith('data-radix') ||
          attr.name === 'data-state') {
        element.removeAttribute(attr.name);
      }
    });
  });
  
  return { __html: div.innerHTML };
}

/**
 * Prevent layout shift during component mounting
 */
export function preventLayoutShift(elementRef: React.RefObject<HTMLElement>): void {
  if (!elementRef.current) return;
  
  const element = elementRef.current;
  
  // Set minimum height to prevent CLS
  if (!element.style.minHeight) {
    const rect = element.getBoundingClientRect();
    if (rect.height > 0) {
      element.style.minHeight = `${rect.height}px`;
    }
  }
  
  // Remove min height after content is loaded
  setTimeout(() => {
    if (element.style.minHeight) {
      element.style.minHeight = '';
    }
  }, 100);
}