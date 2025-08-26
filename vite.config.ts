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
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Admin chunk
          'admin': [
            './src/pages/admin/AdminDashboard.tsx',
            './src/pages/admin/AdminArticles.tsx',
            './src/pages/admin/AdminCategories.tsx',
            './src/pages/admin/AdminTags.tsx',
            './src/pages/admin/AdminMedia.tsx',
            './src/pages/admin/AdminSettings.tsx'
          ]
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
