#!/usr/bin/env tsx

/**
 * Script to run SSG build and test
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';

async function runSSG() {
  console.log('🚀 Iniciando build SSG...');
  
  try {
    // 1. Build SPA first
    console.log('📦 Building SPA...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // 2. Run prerendering
    console.log('⚡ Executando pré-renderização...');
    const { generateStaticPages } = await import('./prerender.js');
    await generateStaticPages();
    
    // 3. Test results
    console.log('🔍 Verificando resultados...');
    const distPath = path.resolve(process.cwd(), 'dist');
    
    // Check if index.html has content
    const indexPath = path.join(distPath, 'index.html');
    if (existsSync(indexPath)) {
      const content = await fs.readFile(indexPath, 'utf-8');
      const hasContent = content.includes('modoPAG') && content.length > 1000;
      
      console.log(`✅ Index.html: ${content.length} caracteres`);
      console.log(`✅ Tem conteúdo: ${hasContent ? 'SIM' : 'NÃO'}`);
      
      if (hasContent) {
        console.log('🎉 SSG executado com sucesso! Conteúdo agora visível no HTML.');
      } else {
        console.log('⚠️  HTML gerado mas pode estar sem conteúdo completo.');
      }
    } else {
      console.log('❌ index.html não encontrado');
    }
    
    // List some generated files
    const files = await fs.readdir(distPath).catch(() => []);
    console.log(`📁 Arquivos gerados: ${files.length}`);
    console.log('📋 Principais:', files.slice(0, 10).join(', '));
    
    console.log('\n🌟 Para testar: npm run preview');
    
  } catch (error) {
    console.error('❌ Erro no SSG:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSSG();
}

export { runSSG };