#!/usr/bin/env tsx
/**
 * SSG Testing and Validation Script
 * Tests the generated static pages for common issues
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');

interface TestResult {
  passed: boolean;
  message: string;
  details?: string;
}

class SSGTester {
  private results: TestResult[] = [];
  
  private addResult(passed: boolean, message: string, details?: string) {
    this.results.push({ passed, message, details });
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${message}`);
    if (details) console.log(`   ${details}`);
  }

  async testDistExists() {
    try {
      await fs.access(distPath);
      this.addResult(true, 'Dist directory exists');
    } catch {
      this.addResult(false, 'Dist directory not found', 'Run npm run build:prerender first');
    }
  }

  async testIndexHtml() {
    try {
      const indexPath = path.join(distPath, 'index.html');
      const content = await fs.readFile(indexPath, 'utf-8');
      
      const hasTitle = content.includes('<title>');
      const hasMetaDescription = content.includes('name="description"');
      const hasCanonical = content.includes('rel="canonical"');
      const hasJsonLd = content.includes('"@context":"https://schema.org"');
      const hasContent = content.includes('Central de Ajuda modoPAG');
      
      this.addResult(hasTitle, 'Index has title tag');
      this.addResult(hasMetaDescription, 'Index has meta description');
      this.addResult(hasCanonical, 'Index has canonical URL');
      this.addResult(hasJsonLd, 'Index has structured data (JSON-LD)');
      this.addResult(hasContent, 'Index has pre-rendered content');
      
      if (content.length < 1000) {
        this.addResult(false, 'Index HTML seems too small', `Only ${content.length} characters`);
      } else {
        this.addResult(true, `Index HTML has good size (${content.length} characters)`);
      }
    } catch (error) {
      this.addResult(false, 'Failed to test index.html', error instanceof Error ? error.message : String(error));
    }
  }

  async testCategoryPages() {
    try {
      const categories = [
        'duvidas-iniciais',
        'maquininha',
        'conta-digital-pagbank',
        'modolink',
        'taxas',
        'seguranca',
        'suporte',
        'termos'
      ];

      let foundCategories = 0;
      
      for (const category of categories) {
        try {
          const categoryPath = path.join(distPath, category, 'index.html');
          await fs.access(categoryPath);
          
          const content = await fs.readFile(categoryPath, 'utf-8');
          const hasContent = content.includes(category) || content.includes('Central de Ajuda');
          
          if (hasContent) {
            foundCategories++;
          } else {
            this.addResult(false, `Category ${category} has empty content`);
          }
        } catch {
          // Category page doesn't exist - this might be expected
        }
      }
      
      this.addResult(foundCategories > 0, `Found ${foundCategories} category pages`);
      
    } catch (error) {
      this.addResult(false, 'Failed to test category pages', error instanceof Error ? error.message : String(error));
    }
  }

  async testServiceWorker() {
    try {
      const swPath = path.join(distPath, 'sw.js');
      const content = await fs.readFile(swPath, 'utf-8');
      
      const hasNetworkFirst = content.includes('networkFirst');
      const hasCacheFirst = content.includes('cacheFirst');
      const hasFixedBodyLock = !content.includes('response.body') || content.includes('response.clone()');
      
      this.addResult(hasNetworkFirst, 'Service Worker has network-first strategy');
      this.addResult(hasCacheFirst, 'Service Worker has cache-first strategy');
      this.addResult(hasFixedBodyLock, 'Service Worker has fixed body lock issue');
      
    } catch (error) {
      this.addResult(false, 'Failed to test service worker', error instanceof Error ? error.message : String(error));
    }
  }

  async testStaticAssets() {
    try {
      const assetsPath = path.join(distPath, 'assets');
      const assets = await fs.readdir(assetsPath);
      
      const hasJS = assets.some(file => file.endsWith('.js'));
      const hasCSS = assets.some(file => file.endsWith('.css'));
      const hasSourceMaps = assets.some(file => file.endsWith('.map'));
      
      this.addResult(hasJS, 'Has JavaScript bundles');
      this.addResult(hasCSS, 'Has CSS bundles');
      this.addResult(!hasSourceMaps, 'No source maps in production build');
      
      // Check for chunk splitting
      const jsFiles = assets.filter(file => file.endsWith('.js'));
      this.addResult(jsFiles.length > 1, `Bundle splitting works (${jsFiles.length} JS files)`);
      
    } catch (error) {
      this.addResult(false, 'Failed to test static assets', error instanceof Error ? error.message : String(error));
    }
  }

  async testSEOFiles() {
    try {
      // Test robots.txt
      try {
        const robotsPath = path.join(distPath, 'robots.txt');
        await fs.access(robotsPath);
        this.addResult(true, 'robots.txt exists');
      } catch {
        this.addResult(false, 'robots.txt missing');
      }
      
      // Test sitemap
      try {
        const sitemapPath = path.join(distPath, 'sitemap.xml');
        await fs.access(sitemapPath);
        this.addResult(true, 'sitemap.xml exists');
      } catch {
        this.addResult(false, 'sitemap.xml missing');
      }
      
    } catch (error) {
      this.addResult(false, 'Failed to test SEO files', error instanceof Error ? error.message : String(error));
    }
  }

  async runAllTests() {
    console.log('🧪 Running SSG Tests...\n');
    
    await this.testDistExists();
    await this.testIndexHtml();
    await this.testCategoryPages();
    await this.testServiceWorker();
    await this.testStaticAssets();
    await this.testSEOFiles();
    
    console.log('\n📊 Test Summary:');
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log(`✅ Passed: ${passed}/${total} (${percentage}%)`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! Your SSG build is ready.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the details above.');
      process.exit(1);
    }
  }
}

// Run tests
const tester = new SSGTester();
tester.runAllTests().catch(console.error);