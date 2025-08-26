# QA Checklist - modoPAG Central de Ajuda

## ✅ Finalização QA Mock Implementada

### 🚀 Performance & Lighthouse
- ✅ **Critical CSS inlining** no index.html
- ✅ **Resource preloading** para assets críticos 
- ✅ **Service Worker** configurado para cache
- ✅ **Bundle splitting** otimizado no Vite
- ✅ **Core Web Vitals monitoring** automático
- ✅ **Performance Observer** implementado
- ✅ **Lazy loading** para imagens
- ✅ **Font optimization** com preload

### 📊 Google Analytics 4 (GA4)
- ✅ **GA4 configurado** via `measurementId={seo.google_analytics_id}`
- ✅ **Enhanced events** implementados:
  - `search` - busca com filtros
  - `article_engagement` - scroll depth tracking
  - `category_navigation` - navegação entre categorias
  - `feedback_submission` - feedback com sentimento
  - `whatsapp_contact` - contato WhatsApp
  - `web_vitals` - métricas de performance
  - `accessibility_feature_used` - recursos de acessibilidade
- ✅ **Consent management** integrado com cookies
- ✅ **Debug mode** para desenvolvimento
- ✅ **Scroll tracking** automático (25%, 50%, 75%, 100%)
- ✅ **Time on page** tracking

### 🔍 JSON-LD Structured Data
- ✅ **Organization schema** no index.html
- ✅ **Website schema** na homepage
- ✅ **Article schema** nas páginas de artigo
- ✅ **Breadcrumb schema** automático
- ✅ **FAQ schema** para seções de perguntas
- ✅ **Category schema** para páginas de categoria
- ✅ **SearchAction** configurado para busca

### ♿ SEO & Acessibilidade
- ✅ **Meta tags otimizadas** (title, description, OG)
- ✅ **Canonical URLs** configurados
- ✅ **Heading structure** H1 único por página
- ✅ **Alt text** obrigatório para imagens
- ✅ **Skip links** implementados
- ✅ **ARIA landmarks** estruturados
- ✅ **Focus management** melhorado
- ✅ **High contrast mode** suportado
- ✅ **Reduced motion** respeitado

### 🔧 QA Automático
- ✅ **QA Runner** implementado que testa:
  - SEO compliance
  - Performance metrics
  - Accessibility issues
  - GA4 configuration
  - JSON-LD validation
- ✅ **Auto-run em desenvolvimento** com score detalhado
- ✅ **Console logging** estruturado para debug
- ✅ **Performance tracking** para GA4

## 📋 Como Usar

### Modo Desenvolvimento
1. **Start dev server**: `npm run dev`
2. **Abra o console**: Verá automaticamente:
   - 🔍 SEO Audit Report
   - ⚡ Performance Metrics
   - 🎯 QA Test Results (após 5s)
   - 📊 GA4 Debug Info

### Testes Manuais Recomendados

#### 1. Lighthouse Audit
```bash
# Chrome DevTools > Lighthouse > Run audit
# Ou usar CLI:
npx lighthouse https://ajuda.modopag.com.br --view
```

#### 2. Google Rich Results Test
```
https://search.google.com/test/rich-results
# Testar URLs:
- https://ajuda.modopag.com.br (Homepage)
- https://ajuda.modopag.com.br/conta-digital/ (Category)
- https://ajuda.modopag.com.br/conta-digital/como-criar-conta (Article)
```

#### 3. GA4 DebugView
```
https://analytics.google.com/analytics/web/#/debugview/
# Verificar eventos sendo disparados:
- page_view
- search  
- article_engagement
- feedback_submission
```

### 📈 Scores Esperados
- **SEO**: 95-100/100
- **Performance**: 90-100/100  
- **Accessibility**: 90-100/100
- **GA4**: Configurado ✅
- **JSON-LD**: Válido ✅
- **Overall**: 90-100/100 (Excellent)

## 🔄 Próximos Passos para Supabase

### 1. Schema Definition
```sql
-- Tabelas principais já definidas no MockAdapter:
- categories (id, name, slug, description, icon, color)
- articles (id, title, slug, content, category_id, meta_*)
- tags (id, name, slug)
- article_tags (article_id, tag_id)
- feedback (id, article_id, is_helpful, comment)
- settings (key, value)
```

### 2. SupabaseAdapter Implementation
- Implementar todos os métodos CRUD
- Configurar RLS policies
- Setup media upload
- Migrar dados do MockAdapter

### 3. Final Testing
- Alterar `DATA_BACKEND` para 'supabase'
- Testar todas as funcionalidades
- Re-rodar QA tests
- Deploy para produção

## 🛠 Arquivos Criados/Modificados

### Novos Utilitários QA:
- `src/utils/lighthouse.ts` - Performance & Lighthouse optimizations
- `src/utils/ga4Events.ts` - Enhanced GA4 event tracking
- `src/utils/seoValidation.ts` - SEO compliance validation
- `src/utils/qaRunner.ts` - Comprehensive QA test runner

### Modificados:
- `index.html` - Critical CSS, Organization schema
- `src/utils/jsonLd.ts` - Website schema added
- `src/main.tsx` - QA utilities integration
- `src/pages/Index.tsx` - Website JSON-LD

### Performance Features:
- ✅ Critical resource preloading
- ✅ Bundle optimization
- ✅ Lazy loading
- ✅ Service worker caching
- ✅ Performance monitoring

O projeto está **PRONTO** para integração com Supabase! 🚀