/**
 * Consolidated critical resource preloading utility
 * Prevents duplicate preloads and unused resource warnings
 */

interface PreloadResource {
  href: string;
  as: 'font' | 'image' | 'style' | 'script';
  type?: string;
  crossorigin?: boolean;
}

// Critical resources that must be preloaded above the fold
const CRITICAL_RESOURCES: PreloadResource[] = [
  // Critical fonts only - removed images that aren't used above fold
  {
    href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    as: 'style'
  }
  // Removed all image preloads - they were causing "unused preload" warnings
  // Images will load naturally when needed with proper lazy loading
];

// Track preloaded resources to prevent duplicates
const preloadedResources = new Set<string>();

/**
 * Preload critical resources with duplicate prevention
 */
export function preloadCriticalResources(): void {
  if (typeof window === 'undefined') return;

  CRITICAL_RESOURCES.forEach(resource => {
    // Skip if already preloaded
    if (preloadedResources.has(resource.href)) {
      return;
    }

    // Check if resource is already in DOM
    const existingLink = document.querySelector(`link[href="${resource.href}"]`);
    if (existingLink) {
      preloadedResources.add(resource.href);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    
    if (resource.type) {
      link.type = resource.type;
    }
    
    if (resource.crossorigin) {
      link.crossOrigin = 'anonymous';
    }

    // Add error handling
    link.onerror = () => {
      console.warn(`Failed to preload resource: ${resource.href}`);
    };

    document.head.appendChild(link);
    preloadedResources.add(resource.href);
  });
}

/**
 * Remove unused preloads to prevent warnings
 */
export function cleanupUnusedPreloads(): void {
  if (typeof window === 'undefined') return;

  // Remove preloads that are not being used
  const preloadLinks = document.querySelectorAll('link[rel="preload"]');
  preloadLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Check if the resource is actually being used
    setTimeout(() => {
      const isUsed = document.querySelector(`link[href="${href}"][rel="stylesheet"]`) ||
                    document.querySelector(`img[src*="${href}"]`) ||
                    document.querySelector(`script[src="${href}"]`);
      
      if (!isUsed && link.parentNode) {
        console.warn(`Removing unused preload: ${href}`);
        link.parentNode.removeChild(link);
      }
    }, 3000); // Give enough time for resources to be used
  });
}

/**
 * Initialize critical resource preloading with cleanup
 */
export function initializeCriticalResources(): void {
  // Preload immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preloadCriticalResources();
      // Cleanup unused preloads after page load
      window.addEventListener('load', cleanupUnusedPreloads);
    });
  } else {
    preloadCriticalResources();
    window.addEventListener('load', cleanupUnusedPreloads);
  }
}

/**
 * Optimize image loading with proper attributes
 */
export function optimizeImages(): void {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    // First image should not be lazy loaded
    if (index === 0) {
      img.loading = 'eager';
      img.decoding = 'sync';
    } else {
      img.loading = 'lazy';
      img.decoding = 'async';
    }

    // Ensure all images have proper dimensions to prevent CLS
    if (!img.width || !img.height) {
      img.addEventListener('load', () => {
        if (!img.style.aspectRatio && img.naturalWidth && img.naturalHeight) {
          img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
        }
      });
    }

    // Warn about missing alt text
    if (!img.alt) {
      console.warn('Image missing alt text:', img.src);
    }
  });
}

/**
 * Setup resource optimization observers
 */
export function setupResourceOptimization(): void {
  if (typeof window === 'undefined') return;

  // Optimize existing images
  optimizeImages();

  // Optimize dynamically added images
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const images = element.tagName === 'IMG' 
            ? [element as HTMLImageElement]
            : Array.from(element.querySelectorAll('img'));
          
          images.forEach((img, index) => {
            img.loading = 'lazy';
            img.decoding = 'async';
            
            if (!img.alt) {
              console.warn('Dynamically added image missing alt text:', img.src);
            }
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Cleanup observer on page unload
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
  });
}