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
        manualChunks: {
          // Vendor chunks - optimized for public routes
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          
          // Separate heavy admin functionality - reduces public route bundle size
          'admin-core': [
            './src/pages/admin/AdminDashboard.tsx',
            './src/pages/admin/AdminArticles.tsx',
            './src/pages/admin/AdminCategories.tsx',
            './src/pages/admin/AdminTags.tsx',
            './src/pages/admin/AdminMedia.tsx',
            './src/pages/admin/AdminSettings.tsx'
          ],
          
          // Performance utilities - deferred loading
          'performance-utils': [
            './src/utils/performance.ts',
            './src/utils/lighthouse.ts',
            './src/utils/ga4Events.ts'
          ],
          
          // Form libraries only when needed
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Query vendor only when needed  
          'query-vendor': ['@tanstack/react-query']
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
