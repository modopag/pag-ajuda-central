// Service Worker for modoPAG Central de Ajuda
// Provides offline support and caching for better performance

const CACHE_NAME = 'modopag-help-v1';
const STATIC_CACHE = 'modopag-static-v1';
const DYNAMIC_CACHE = 'modopag-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/modopag-logo-yellow.webp',
  '/modopag-logo-black.webp',
  '/src/main.tsx',
  '/src/index.css'
];

// Cache strategies for different types of requests
const CACHE_STRATEGIES = {
  // Static assets: Cache first, network fallback
  static: /\.(js|css|woff2|woff|ttf|eot|svg|png|jpg|jpeg|webp|gif|ico)$/,
  
  // API calls: Network first, cache fallback
  api: /\/api\//,
  
  // HTML pages: Network first, cache fallback
  html: /\.html$|\/$/
};

// Helper function to check if response should be cached
function shouldCacheResponse(response) {
  return response && 
         response.status === 200 && 
         response.type === 'basic' &&
         !response.headers.get('cache-control')?.includes('no-store');
}

// Safe clone function that only clones once
function safeClone(response, description = '') {
  try {
    if (!response || !response.ok) {
      return null;
    }
    
    // Check if response body is already used
    if (response.bodyUsed) {
      console.warn(`[SW] Cannot clone response ${description}: body already used`);
      return null;
    }
    
    return response.clone();
  } catch (error) {
    console.error(`[SW] Failed to clone response ${description}:`, error);
    return null;
  }
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Route to appropriate cache strategy
  if (CACHE_STRATEGIES.static.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else if (CACHE_STRATEGIES.api.test(url.pathname)) {
    event.respondWith(networkFirst(request));
  } else if (CACHE_STRATEGIES.html.test(url.pathname) || url.pathname === '/') {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Cache First Strategy (for static assets)
async function cacheFirst(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (shouldCacheResponse(networkResponse)) {
      // Clone BEFORE using the response
      const responseClone = safeClone(networkResponse, 'cacheFirst');
      
      if (responseClone) {
        try {
          const cache = await caches.open(STATIC_CACHE);
          // Use clone for caching, return original
          await cache.put(request, responseClone);
        } catch (cacheError) {
          console.warn('[SW] Failed to cache response:', cacheError);
        }
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    
    // Try to find any cached version as fallback
    const fallbackResponse = await caches.match(request);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    
    return new Response('Offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Network First Strategy (for API calls and HTML)
async function networkFirst(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (shouldCacheResponse(networkResponse)) {
      // Clone BEFORE using the response
      const responseClone = safeClone(networkResponse, 'networkFirst');
      
      if (responseClone) {
        try {
          const cache = await caches.open(DYNAMIC_CACHE);
          // Use clone for caching, return original
          await cache.put(request, responseClone);
        } catch (cacheError) {
          console.warn('[SW] Failed to cache response:', cacheError);
        }
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error.message);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlinePage = await caches.match('/');
      if (offlinePage) {
        return offlinePage;
      }
    }

    return new Response('Offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Stale While Revalidate Strategy (FIXED - no more double clone)
async function staleWhileRevalidate(request) {
  // Get cached response immediately if available
  const cachedResponse = await caches.match(request);
  
  // Start network request in background
  const networkResponsePromise = fetch(request)
    .then(async (networkResponse) => {
      // Only cache successful responses
      if (shouldCacheResponse(networkResponse)) {
        // Clone BEFORE using the response
        const responseClone = safeClone(networkResponse, 'staleWhileRevalidate');
        
        if (responseClone) {
          try {
            const cache = await caches.open(DYNAMIC_CACHE);
            // Use clone for caching, return original
            await cache.put(request, responseClone);
          } catch (cacheError) {
            console.warn('[SW] Failed to cache response:', cacheError);
          }
        }
      }
      
      return networkResponse;
    })
    .catch((error) => {
      console.warn('[SW] Network request failed in staleWhileRevalidate:', error);
      return null;
    });

  // Return cached version immediately if available, otherwise wait for network
  if (cachedResponse) {
    // Update cache in background
    networkResponsePromise.catch(() => {
      // Ignore network errors when we have cached version
    });
    return cachedResponse;
  } else {
    // No cached version, wait for network
    const networkResponse = await networkResponsePromise;
    return networkResponse || new Response('Offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Background sync for failed requests (if needed in the future)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    // Implement background sync logic here if needed
  }
});

// Push notification handling (if needed in the future)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  // Implement push notification logic here if needed
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});