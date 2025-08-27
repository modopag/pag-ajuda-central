import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Import consolidated critical resources
import { initializeCriticalResources, setupResourceOptimization } from './utils/criticalResources';
// Import hydration fixes
import { initializeHydrationFixes } from './utils/hydrationFix';
// Import performance monitoring and bundle analyzer
import { initializePerformanceMonitoring } from './utils/performance';
import { initEnhancedTracking } from './utils/ga4Events';
import './utils/qaRunner'; // Auto-runs QA tests in development

// Import bundle analyzer for development performance monitoring
if (import.meta.env.DEV) {
  import('./utils/bundleAnalyzer');
}

// Initialize performance monitoring and critical resources
initializePerformanceMonitoring();

// Initialize hydration fixes
initializeHydrationFixes();

// Initialize enhanced GA4 tracking and critical resources
if (typeof window !== 'undefined') {
  // Initialize critical resources immediately
  initializeCriticalResources();
  
  document.addEventListener('DOMContentLoaded', () => {
    initEnhancedTracking();
    setupResourceOptimization();
  });
}

// Register service worker for caching and offline support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
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
  });
}

createRoot(document.getElementById("root")!).render(
  <App />
);
