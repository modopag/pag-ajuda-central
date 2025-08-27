import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Defer non-critical performance utilities until after initial render
const loadPerformanceUtilities = () => {
  // Import consolidated critical resources
  import('./utils/criticalResources').then(({ initializeCriticalResources, setupResourceOptimization }) => {
    initializeCriticalResources();
    setupResourceOptimization();
  });
  
  // Import performance monitoring - deferred for JS budget optimization
  import('./utils/performance').then(({ initializePerformanceMonitoring }) => {
    initializePerformanceMonitoring();
  });
  
  // Import hydration fixes - deferred
  import('./utils/hydrationFix').then(({ initializeHydrationFixes }) => {
    initializeHydrationFixes();
  });
  
  // Import GA4 tracking - consent-gated and deferred
  import('./utils/ga4Events').then(({ initEnhancedTracking }) => {
    initEnhancedTracking();
  });
};

// Import bundle analyzer for development performance monitoring (deferred)
if (import.meta.env.DEV) {
  requestIdleCallback(() => {
    import('./utils/bundleAnalyzer');
    import('./utils/qaRunner'); // Auto-runs QA tests in development
  });
}

// Initialize critical path rendering first
createRoot(document.getElementById("root")!).render(
  <App />
);

// Defer all performance utilities until after initial render - JS budget optimization
if (typeof window !== 'undefined') {
  // Use requestIdleCallback to defer non-critical scripts
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadPerformanceUtilities, { timeout: 2000 });
  } else {
    setTimeout(loadPerformanceUtilities, 100);
  }
}

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
