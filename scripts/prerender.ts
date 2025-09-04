#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { HelmetProvider } from 'react-helmet-async';
import { fetchBuildData } from './data-fetcher.ts';
import { generateHTMLTemplate } from './html-template.ts';
import App from '../src/App.tsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Route {
  path: string;
  type: 'home' | 'category' | 'article';
  data?: any;
}

async function ensureDirectory(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function renderRoute(route: Route): Promise<string> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    },
  });

  // Pre-populate QueryClient with route data
  if (route.data) {
    switch (route.type) {
      case 'home':
        queryClient.setQueryData(['categories'], route.data.categories);
        queryClient.setQueryData(['faqs'], route.data.faqs);
        break;
      case 'category':
        queryClient.setQueryData(['categories'], route.data.categories);
        queryClient.setQueryData(['articles', route.data.category.id], route.data.articles);
        break;
      case 'article':
        queryClient.setQueryData(['categories'], route.data.categories);
        queryClient.setQueryData(['article', route.data.article.slug], route.data.article);
        queryClient.setQueryData(['articles', route.data.category.id], route.data.relatedArticles);
        break;
    }
  }

  // const helmetContext = {};

  const app = React.createElement(
    React.Fragment,
    null,
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        StaticRouter,
        { location: route.path },
        React.createElement(App, { ssrData: route.data })
      )
    )
  );

  const html = renderToString(app);
  return html;
}

async function generateStaticPages() {
  console.log('🚀 Starting static site generation...');
  
  try {
    // Fetch all data needed for build
    console.log('📊 Fetching build data...');
    const buildData = await fetchBuildData();
    
    const routes: Route[] = [];
    
    // Home page
    routes.push({
      path: '/',
      type: 'home',
      data: {
        categories: buildData.categories,
        faqs: buildData.faqs,
      },
    });

    // Category pages
    for (const category of buildData.categories) {
      const categoryArticles = buildData.articles.filter(
        article => article.category_id === category.id
      );
      
      routes.push({
        path: `/${category.slug}/`,
        type: 'category',
        data: {
          category,
          articles: categoryArticles,
          categories: buildData.categories,
        },
      });
    }

    // Article pages (top 100 most recent)
    const recentArticles = buildData.articles
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 100);

    for (const article of recentArticles) {
      const category = buildData.categories.find(c => c.id === article.category_id);
      if (!category) continue;

      const relatedArticles = buildData.articles
        .filter(a => a.category_id === category.id && a.id !== article.id)
        .slice(0, 5);

      routes.push({
        path: `/${category.slug}/${article.slug}`,
        type: 'article',
        data: {
          article,
          category,
          categories: buildData.categories,
          relatedArticles,
        },
      });
    }

    console.log(`📄 Generating ${routes.length} pages...`);
    
    const distPath = path.resolve(__dirname, '../dist');
    await ensureDirectory(distPath);

    // Process routes in batches to avoid memory issues
    const batchSize = 10;
    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (route) => {
          try {
            console.log(`  Rendering: ${route.path}`);
            
            const html = await renderRoute(route);
            const fullHTML = generateHTMLTemplate(html, route);
            
            // Create directory structure
            const routePath = route.path === '/' ? '/index' : route.path;
            const filePath = path.join(distPath, routePath.endsWith('/') ? routePath + 'index' : routePath);
            const dir = path.dirname(filePath + '.html');
            
            await ensureDirectory(dir);
            await fs.writeFile(filePath + '.html', fullHTML, 'utf-8');
            
          } catch (error) {
            console.warn(`⚠️  Failed to render ${route.path}:`, error.message);
          }
        })
      );
      
      console.log(`  Completed batch ${Math.ceil((i + batchSize) / batchSize)}/${Math.ceil(routes.length / batchSize)}`);
    }

    console.log('✅ Static site generation completed!');
    console.log(`📊 Generated ${routes.length} pages`);
    
  } catch (error) {
    console.error('❌ Static site generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateStaticPages();
}

export { generateStaticPages };