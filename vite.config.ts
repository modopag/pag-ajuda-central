import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize bundle splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Critical vendors - smallest chunks for public routes
          if (id.includes('react/') || id.includes('react-dom/')) return 'react-core';
          if (id.includes('react-router')) return 'router';
          
          // UI components - medium priority
          if (id.includes('@radix-ui') || id.includes('lucide-react')) return 'ui-lib';
          
          // Admin routes - completely separate (not loaded on public)
          if (id.includes('/admin/') || id.includes('AdminDashboard') || 
              id.includes('AdminArticles') || id.includes('AdminCategories') || 
              id.includes('AdminSettings') || id.includes('RichTextEditor')) {
            return 'admin-bundle';
          }
          
          // Performance monitoring - lazy loaded only when needed
          if (id.includes('performance.ts') || id.includes('ga4Events') || 
              id.includes('PerformanceMonitor')) return 'perf-monitor';
              
          // Form libraries - only when forms are used
          if (id.includes('react-hook-form') || id.includes('zod') || 
              id.includes('@hookform/resolvers')) return 'forms';
              
          // Query library - only when data fetching
          if (id.includes('@tanstack/react-query')) return 'queries';
          
          // Supabase - separate chunk
          if (id.includes('@supabase')) return 'supabase';
          
          // Node modules vendor
          if (id.includes('node_modules')) return 'vendor';
        }
      }
    },
    // Minimize bundle size
    minify: true,
    sourcemap: mode === 'development',
    // Optimize assets for better performance
    assetsInlineLimit: 2048, // 2kb - smaller limit to reduce bundle size
    // Enable tree-shaking optimizations
    treeshake: {
      preset: 'recommended',
      manualPureFunctions: ['console.log', 'console.info', 'console.debug']
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react'
    ]
  }
}));
