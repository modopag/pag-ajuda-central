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
  } else if (CACHE_STRATEGIES.html.test(url.pathname) || url.pathname === '/' || request.mode === 'navigate') {
    event.respondWith(networkFirstForHTML(request));
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

// Network First Strategy for HTML - HARDENED AGAINST STALE CONTENT
async function networkFirstForHTML(request) {
  try {
    // Always try network first for navigation requests
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 3000)
      )
    ]);
    
    // For HTML, never cache error responses or broken content
    if (networkResponse.ok && networkResponse.status === 200) {
      const responseClone = safeClone(networkResponse, 'networkFirstForHTML');
      if (responseClone) {
        try {
          const text = await responseClone.text();
          // Don't cache error pages, broken HTML, or content with errors
          if (!text.includes('Oops! Algo deu errado') && 
              !text.includes('TypeError') &&
              !text.includes('Error') && 
              text.length > 500) {
            
            const cache = await caches.open(DYNAMIC_CACHE);
            await cache.put(request, new Response(text, {
              status: networkResponse.status,
              statusText: networkResponse.statusText,
              headers: networkResponse.headers
            }));
          } else {
            console.warn('[SW] Not caching potentially broken HTML content');
          }
        } catch (cacheError) {
          console.warn('[SW] Failed to process HTML response:', cacheError);
        }
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for HTML, trying cache fallback:', error.message);
    
    // Only serve cached HTML as absolute last resort and validate it
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      try {
        const text = await cachedResponse.text();
        // Don't serve cached error content
        if (text.includes('Oops! Algo deu errado') || text.includes('TypeError')) {
          console.warn('[SW] Cached HTML contains errors, serving basic fallback');
          return createBasicFallbackResponse();
        }
        return new Response(text, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: cachedResponse.headers
        });
      } catch (err) {
        console.warn('[SW] Error reading cached HTML:', err);
      }
    }

    // Return basic fallback for HTML requests
    return createBasicFallbackResponse();
  }
}

// Network First Strategy (for API calls) - IMPROVED
async function networkFirst(request) {
  try {
    // Add timeout for network requests
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 5000)
      )
    ]);
    
    // Only cache successful responses and valid HTML
    if (shouldCacheResponse(networkResponse)) {
      // For HTML responses, check if they contain error indicators
      if (request.headers.get('accept')?.includes('text/html')) {
        const responseClone = safeClone(networkResponse, 'networkFirst-html');
        if (responseClone) {
          try {
            const text = await responseClone.text();
            // Don't cache error pages or broken HTML
            if (text.includes('Oops! Algo deu errado') || 
                text.includes('Error') || 
                text.length < 100) {
              console.warn('[SW] Not caching potentially broken HTML');
              return networkResponse;
            }
            
            // Cache valid HTML
            const cache = await caches.open(DYNAMIC_CACHE);
            await cache.put(request, new Response(text, {
              status: networkResponse.status,
              statusText: networkResponse.statusText,
              headers: networkResponse.headers
            }));
          } catch (cacheError) {
            console.warn('[SW] Failed to process HTML response:', cacheError);
          }
        }
      } else {
        // Cache non-HTML successful responses normally
        const responseClone = safeClone(networkResponse, 'networkFirst');
        if (responseClone) {
          try {
            const cache = await caches.open(DYNAMIC_CACHE);
            await cache.put(request, responseClone);
          } catch (cacheError) {
            console.warn('[SW] Failed to cache response:', cacheError);
          }
        }
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error.message);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if cached HTML is still valid
      if (request.headers.get('accept')?.includes('text/html')) {
        try {
          const text = await cachedResponse.text();
          if (text.includes('Oops! Algo deu errado')) {
            console.warn('[SW] Cached response contains error, serving basic fallback');
            return createBasicFallbackResponse();
          }
          // Return valid cached HTML
          return new Response(text, {
            status: cachedResponse.status,
            statusText: cachedResponse.statusText,
            headers: cachedResponse.headers
          });
        } catch (err) {
          console.warn('[SW] Error reading cached HTML:', err);
        }
      }
      return cachedResponse;
    }

    // Return basic fallback for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return createBasicFallbackResponse();
    }

    return new Response('Offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Create a basic fallback HTML response
function createBasicFallbackResponse() {
  const fallbackHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Central de Ajuda modoPAG - Offline</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .logo { width: 200px; height: auto; margin-bottom: 30px; }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; margin-bottom: 30px; }
        .button { 
          background: #f0ca00; color: #000; padding: 12px 24px; 
          text-decoration: none; border-radius: 6px; display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="/modopag-logo-yellow.webp" alt="modoPAG" class="logo" />
        <h1>Você está offline</h1>
        <p>Não foi possível conectar com nossos servidores. Verifique sua conexão com a internet e tente novamente.</p>
        <a href="/" class="button">Tentar Novamente</a>
      </div>
    </body>
    </html>
  `;
  
  return new Response(fallbackHTML, {
    status: 200,
    headers: { 
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
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