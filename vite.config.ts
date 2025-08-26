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
          // Critical vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router-dom')) {
              return 'router-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'form-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // Performance monitoring (development only)
            if (id.includes('performance') || id.includes('lighthouse') || id.includes('bundleAnalyzer')) {
              return 'dev-tools';
            }
            return 'vendors';
          }
          
          // Admin pages chunk
          if (id.includes('/pages/admin/')) {
            return 'admin';
          }
          
          // Cookie management chunk (can be lazy loaded)
          if (id.includes('Cookie') && !id.includes('AsyncCookie')) {
            return 'cookies';
          }
        }
      }
    },
    // Minimize bundle size
    minify: true,
    sourcemap: mode === 'development',
    // Optimize assets
    assetsInlineLimit: 4096, // 4kb
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
