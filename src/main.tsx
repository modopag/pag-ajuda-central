import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Check if we're hydrating SSR content
const isSSR = document.getElementById("root")?.innerHTML.trim() !== '';

// Deferred performance utilities loading to optimize initial JS budget
const loadPerformanceUtilities = async () => {
  // Load critical resources first
  const { initializeCriticalResources, setupResourceOptimization } = await import('./utils/criticalResources');
  initializeCriticalResources();
  setupResourceOptimization();
  
  // Initialize performance monitoring
  const { initializePerformanceMonitoring } = await import('./utils/performance');
  initializePerformanceMonitoring();
  
  // Initialize hydration fixes
  const { initializeHydrationFixes } = await import('./utils/hydrationFix');  
  initializeHydrationFixes();
  
  // Initialize GA4 tracking (deferred)
  const { initEnhancedTracking } = await import('./utils/ga4Events');
  initEnhancedTracking();
};

// Load development utilities
if (import.meta.env.DEV) {
  requestIdleCallback(async () => {
    await import('./utils/bundleAnalyzer');
    await import('./utils/qaRunner');
  });
}

// Render or hydrate the app
const rootElement = document.getElementById("root")!;
const appElement = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (isSSR) {
  // Hydrate SSR content
  hydrateRoot(rootElement, appElement);
} else {
  // Client-side render
  createRoot(rootElement).render(appElement);
}

// Load performance utilities after initial render (deferred to optimize JS budget)
requestIdleCallback(() => {
  loadPerformanceUtilities();
});

// Service Worker registration - deferred for JS budget optimization
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Register SW after initial page load
  window.addEventListener('load', () => {
    requestIdleCallback(() => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registered successfully:', registration);
          
          // Don't be aggressive with HTML caching - let network handle navigation
          if (registration.active) {
            registration.active.postMessage({
              type: 'ENABLE_SAFE_MODE',
              message: 'Network-first for HTML to prevent stale content'
            });
          }
          
          // Check for updates but don't force reload
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[SW] New version available - will activate on next visit');
                  // Don't force reload to prevent crashes during PageSpeed tests
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.warn('[SW] Registration failed:', registrationError);
        });
    }, { timeout: 3000 });
  });
}
