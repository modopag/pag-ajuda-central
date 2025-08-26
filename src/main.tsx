import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import performance monitoring and bundle analyzer
import { initializePerformanceMonitoring } from './utils/performance';
import { initEnhancedTracking } from './utils/ga4Events';
import './utils/qaRunner'; // Auto-runs QA tests in development

// Import bundle analyzer for development performance monitoring
if (import.meta.env.DEV) {
  import('./utils/bundleAnalyzer');
  // Also import lighthouse utilities in development
  import('./utils/lighthouse');
}

// Initialize performance monitoring
initializePerformanceMonitoring();

// Initialize enhanced GA4 tracking
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initEnhancedTracking();
    
    // Initialize SEO optimizations
    import('./utils/seoOptimizer').then(({ initSEOOptimizations }) => {
      initSEOOptimizations();
    });
  });
}

// Register service worker for caching and offline support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available, could show update notification
                console.log('New version available! Please refresh the page.');
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
