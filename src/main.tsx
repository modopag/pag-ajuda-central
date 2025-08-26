import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import performance optimizer for production
import './utils/performanceOptimizer';

// Conditionally import performance monitoring only in development
if (import.meta.env.DEV) {
  // Delay performance monitoring to not block initial render
  setTimeout(() => {
    import('./utils/performance').then(({ initializePerformanceMonitoring }) => {
      initializePerformanceMonitoring();
    });
    
    import('./utils/bundleAnalyzer');
    import('./utils/lighthouse');
    import('./utils/qaRunner'); // Auto-runs QA tests in development
  }, 1000);
}

// Initialize enhanced GA4 tracking (non-blocking)
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Delay GA4 initialization to not block critical rendering
    setTimeout(() => {
      import('./utils/ga4Events').then(({ initEnhancedTracking }) => {
        initEnhancedTracking();
      });
    }, 500);
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
