// Service Worker for modoPAG Help Center
// Optimized for SSG with network-first HTML caching

const CACHE_NAME = 'modopag-help-v1';
const STATIC_CACHE_NAME = 'modopag-static-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/favicon.svg',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/modopag-logo-black.webp',
  '/modopag-logo-yellow.webp',
  '/manifest.json',
  '/fonts/inter-variable.woff2',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => {
        console.log('[SW] Static assets cached');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
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
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Static assets: cache-first with long-term caching
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    return;
  }
  
  // HTML pages: network-first for fresh content
  if (isHTMLRequest(request)) {
    event.respondWith(networkFirstHTML(request));
    return;
  }
  
  // API requests: network-first with short cache
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Default: network-first
  event.respondWith(networkFirst(request));
});

// Cache-first strategy for static assets
async function cacheFirst(request, cacheName = STATIC_CACHE_NAME) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('[SW] Network failed for:', request.url);
    throw error;
  }
}

// Network-first strategy for HTML (SSG pages)
async function networkFirstHTML(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed for HTML, trying cache:', request.url);
    
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Fallback for navigation requests
    if (request.mode === 'navigate') {
      const fallback = await cache.match('/');
      if (fallback) {
        return fallback;
      }
    }
    
    throw error;
  }
}

// Network-first strategy for API/dynamic content
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      // Cache for 5 minutes only
      const headers = new Headers(response.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const cachedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers,
      });
      
      cache.put(request, cachedResponse.clone());
    }
    
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      // Check if cache is still fresh (5 minutes)
      const cachedAt = cached.headers.get('sw-cached-at');
      if (cachedAt && (Date.now() - parseInt(cachedAt)) < 5 * 60 * 1000) {
        return cached;
      }
    }
    
    throw error;
  }
}

// Helper functions
function isStaticAsset(pathname) {
  return (
    pathname.includes('.') && // Has file extension
    (
      pathname.endsWith('.js') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.woff2') ||
      pathname.endsWith('.woff') ||
      pathname.endsWith('.ttf') ||
      pathname.endsWith('.svg') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.webp') ||
      pathname.endsWith('.avif') ||
      pathname.endsWith('.ico') ||
      pathname.endsWith('.json')
    )
  );
}

function isHTMLRequest(request) {
  const accept = request.headers.get('Accept') || '';
  return (
    request.mode === 'navigate' ||
    accept.includes('text/html') ||
    (!request.url.includes('.') && !request.url.includes('api'))
  );
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INITIALIZE') {
    console.log('[SW] Initialized by main thread');
  }
});