// Service Worker for modoPAG Central de Ajuda
// Provides offline support and caching for better performance
// ENHANCED: Cache headers optimization and versioning with immutable assets

const CACHE_VERSION = '2025-01-27-v2';
const CACHE_NAME = `modopag-help-${CACHE_VERSION}`;
const STATIC_CACHE = `modopag-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `modopag-dynamic-${CACHE_VERSION}`;

// Enhanced static assets list with cache optimization
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/modopag-logo-yellow.webp',
  '/modopag-logo-black.webp'
  // Note: We don't cache main.tsx and index.css as they change frequently
];

// Cache strategies for different types of requests - OPTIMIZED
const CACHE_STRATEGIES = {
  // Static assets with hash: Cache first with immutable headers
  staticHashed: /\.(js|css|woff2|woff|ttf|eot|svg|png|jpg|jpeg|webp|gif|ico).*\?.*v=|.*\-[a-f0-9]{8,}\..*$/,
  
  // Static assets without hash: Cache first, but check for updates
  static: /\.(js|css|woff2|woff|ttf|eot|svg|png|jpg|jpeg|webp|gif|ico)$/,
  
  // API calls: Network first, cache fallback
  api: /\/api\//,
  
  // HTML pages: Network first, cache fallback (never stale)
  html: /\.html$|\/$/
};

// Helper function to check if response should be cached with optimized headers
function shouldCacheResponse(response) {
  return response && 
         response.status === 200 && 
         response.type === 'basic' &&
         !response.headers.get('cache-control')?.includes('no-store');
}

// Enhanced function to add optimized cache headers
function addOptimizedCacheHeaders(response, isHashed = false) {
  const headers = new Headers(response.headers);
  
  if (isHashed) {
    // Hashed assets get immutable cache for 1 year - CACHING HEADERS OPTIMIZATION
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Expires', new Date(Date.now() + 31536000 * 1000).toUTCString());
  } else {
    // Non-hashed assets get shorter cache with revalidation
    headers.set('Cache-Control', 'public, max-age=86400, must-revalidate'); // 1 day
  }
  
  // Add additional optimization headers
  headers.set('X-Cache-Status', 'HIT');
  headers.set('X-Cache-Version', CACHE_VERSION);
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
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

  // Route to appropriate cache strategy - ENHANCED
  if (CACHE_STRATEGIES.staticHashed.test(url.pathname + url.search)) {
    // Hashed assets get immutable caching with long expiry
    event.respondWith(cacheFirstImmutable(request));
  } else if (CACHE_STRATEGIES.static.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else if (CACHE_STRATEGIES.api.test(url.pathname)) {
    event.respondWith(networkFirst(request));
  } else if (CACHE_STRATEGIES.html.test(url.pathname) || url.pathname === '/' || request.mode === 'navigate') {
    event.respondWith(networkFirstForHTML(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Cache First Strategy with Immutable Headers (for hashed assets) - ENHANCED
async function cacheFirstImmutable(request) {
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
      const responseClone = safeClone(networkResponse, 'cacheFirstImmutable');
      
      if (responseClone) {
        try {
          // Add immutable cache headers for hashed assets - CACHING HEADERS OPTIMIZATION
          const cachedResponse = addOptimizedCacheHeaders(responseClone, true);
          
          const cache = await caches.open(STATIC_CACHE);
          await cache.put(request, cachedResponse.clone());
        } catch (cacheError) {
          console.warn('[SW] Failed to cache immutable asset:', cacheError);
        }
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first immutable failed:', error);
    
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

// Cache First Strategy (for static assets) - ENHANCED
async function cacheFirst(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Only cache successful responses with optimized headers
    if (shouldCacheResponse(networkResponse)) {
      // Clone BEFORE using the response
      const responseClone = safeClone(networkResponse, 'cacheFirst');
      
      if (responseClone) {
        try {
          // Add optimized cache headers for static assets - CACHING HEADERS OPTIMIZATION
          const cachedResponse = addOptimizedCacheHeaders(responseClone, false);
          
          const cache = await caches.open(STATIC_CACHE);
          // Use enhanced response for caching, return original
          await cache.put(request, cachedResponse);
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

// Network First Strategy for HTML - HARDENED AGAINST STALE CONTENT + NO HTML CACHING
async function networkFirstForHTML(request) {
  try {
    // Always try network first for navigation requests - NO HTML CACHING BY SW
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 2000) // Faster timeout for HTML
      )
    ]);
    
    // For HTML, NEVER cache responses to prevent stale content - CACHING HEADERS OPTIMIZATION
    if (networkResponse.ok && networkResponse.status === 200) {
      // Return fresh HTML without caching - let server handle HTML caching
      console.log('[SW] Serving fresh HTML without SW caching');
      return networkResponse;
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for HTML, serving basic fallback:', error.message);
    
    // Don't serve cached HTML - always return basic fallback - NO STALE HTML
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
    
    // Only cache successful responses with optimized cache headers
    if (shouldCacheResponse(networkResponse)) {
      // For HTML responses, don't cache at all - let server handle HTML caching
      if (request.headers.get('accept')?.includes('text/html')) {
        console.log('[SW] Not caching HTML - server-side caching only');
        return networkResponse;
      } else {
        // Cache non-HTML successful responses with optimized headers
        const responseClone = safeClone(networkResponse, 'networkFirst');
        if (responseClone) {
          try {
            const cachedResponse = addOptimizedCacheHeaders(responseClone, false);
            const cache = await caches.open(DYNAMIC_CACHE);
            await cache.put(request, cachedResponse);
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