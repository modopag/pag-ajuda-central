#!/usr/bin/env node

/**
 * Execute SSG build
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { promises: fs } = require('fs');
const path = require('path');

async function runSSG() {
  console.log('🚀 Iniciando build SSG...');
  
  try {
    // 1. Build SPA first
    console.log('📦 Building SPA...');
    execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });
    
    // 2. Run prerendering
    console.log('⚡ Executando pré-renderização...');
    execSync('npx tsx scripts/prerender.ts', { stdio: 'inherit', cwd: process.cwd() });
    
    // 3. Copy rendered HTML to dist
    console.log('📋 Copiando HTML renderizado para dist...');
    const distPath = path.resolve(process.cwd(), 'dist');
    const renderedHtmlPath = path.resolve(process.cwd(), 'ssg-rendered.html');
    const distIndexPath = path.join(distPath, 'index.html');
    
    if (existsSync(renderedHtmlPath)) {
      await fs.copyFile(renderedHtmlPath, distIndexPath);
      console.log('✅ HTML renderizado copiado para dist/index.html');
    } else {
      console.log('⚠️  ssg-rendered.html não encontrado, usando index.html padrão');
    }
    
    // 4. Test results
    console.log('🔍 Verificando resultados...');
    
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

runSSG().catch(console.error);