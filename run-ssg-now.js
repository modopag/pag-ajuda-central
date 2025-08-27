#!/usr/bin/env node

/**
 * Execute SSG build immediately
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { promises: fs } = require('fs');
const path = require('path');

async function executeBuildSSG() {
  console.log('🚀 Executando SSG build completo...');
  
  try {
    // 1. Verificar se SUPABASE_SERVICE_KEY está disponível
    console.log('🔐 Verificando SUPABASE_SERVICE_KEY...');
    if (!process.env.SUPABASE_SERVICE_KEY) {
      console.log('⚠️  SUPABASE_SERVICE_KEY não encontrada em process.env');
      console.log('🔧 Tentando carregar do .env...');
      require('dotenv').config();
    }
    
    // 2. Build SPA primeiro
    console.log('📦 Fazendo build SPA...');
    execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });
    
    // 3. Executar pré-renderização
    console.log('⚡ Executando pré-renderização...');
    execSync('npx tsx scripts/prerender.ts', { stdio: 'inherit', cwd: process.cwd() });
    
    // 4. Verificar resultados
    console.log('🔍 Verificando HTML gerado...');
    const distPath = path.resolve(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    if (existsSync(indexPath)) {
      const content = await fs.readFile(indexPath, 'utf-8');
      const hasContent = content.includes('modoPAG') && content.length > 2000;
      const hasCategories = content.includes('categoria') || content.includes('FAQ');
      
      console.log(`✅ HTML gerado: ${content.length} caracteres`);
      console.log(`✅ Tem conteúdo: ${hasContent ? 'SIM' : 'NÃO'}`);
      console.log(`✅ Tem categorias/FAQs: ${hasCategories ? 'SIM' : 'NÃO'}`);
      
      if (hasContent && hasCategories) {
        console.log('🎉 SSG EXECUTADO COM SUCESSO!');
        console.log('🌟 HTML agora contém todo o conteúdo renderizado!');
      } else {
        console.log('⚠️  HTML gerado mas conteúdo pode estar incompleto.');
      }
      
      // Mostrar uma amostra do conteúdo
      const sample = content.substring(content.indexOf('<body>'), content.indexOf('<body>') + 500);
      console.log('\n📄 Amostra do HTML gerado:');
      console.log(sample + '...');
      
    } else {
      console.log('❌ dist/index.html não foi criado');
    }
    
    // Listar arquivos gerados
    const files = await fs.readdir(distPath).catch(() => []);
    console.log(`\n📁 Total de arquivos: ${files.length}`);
    console.log('📋 Arquivos principais:', files.slice(0, 15).join(', '));
    
  } catch (error) {
    console.error('❌ Erro durante execução do SSG:', error.message);
    console.error('Stack:', error.stack);
  }
}

executeBuildSSG().catch(console.error);